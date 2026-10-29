package com.civicfix.service;

import com.civicfix.entity.ComplaintSequence;
import com.civicfix.repository.ComplaintRepository;
import com.civicfix.repository.ComplaintSequenceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

/**
 * Concurrency-safe, database-backed reference ID generator.
 *
 * Generates human-readable reference IDs in the format:
 * CF-YYYY-MM-XXXX (e.g. CF-2026-10-0001, CF-2026-10-0002).
 *
 * Guarantees uniqueness across application restarts, concurrent threads,
 * and distributed instances using a dedicated database sequence table
 * with pessimistic write-locking.
 */
@Service
public class ReferenceIdGeneratorService {

    private static final Logger logger = LoggerFactory.getLogger(ReferenceIdGeneratorService.class);

    private final ComplaintSequenceRepository sequenceRepository;
    private final ComplaintRepository complaintRepository;

    public ReferenceIdGeneratorService(ComplaintSequenceRepository sequenceRepository,
                                       ComplaintRepository complaintRepository) {
        this.sequenceRepository = sequenceRepository;
        this.complaintRepository = complaintRepository;
    }

    /**
     * Generates the next unique reference ID for today's year and month.
     *
     * @return Formatted unique reference ID (e.g. "CF-2026-10-0001")
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized String generateNextReferenceId() {
        return generateNextReferenceId(LocalDate.now());
    }

    /**
     * Generates the next unique reference ID for a specific date.
     * Useful for deterministic testing or backdated reporting.
     *
     * @param date Date to use for Year-Month prefix
     * @return Formatted unique reference ID
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public synchronized String generateNextReferenceId(LocalDate date) {
        int year = date.getYear();
        int month = date.getMonthValue();
        String sequenceKey = String.format("CF-%d-%02d", year, month);

        long nextVal = getNextValueForSequenceKey(sequenceKey);
        String candidateRefId = formatReferenceId(sequenceKey, nextVal);

        // Defensive check: if reference ID already exists in complaints, advance sequence
        int maxAttempts = 1000;
        int attempts = 0;
        while (complaintRepository.existsByReferenceId(candidateRefId) && attempts++ < maxAttempts) {
            logger.warn("Reference ID collision detected for candidate {}, advancing sequence counter", candidateRefId);
            nextVal = getNextValueForSequenceKey(sequenceKey);
            candidateRefId = formatReferenceId(sequenceKey, nextVal);
        }

        logger.debug("Generated unique complaint reference ID: {}", candidateRefId);
        return candidateRefId;
    }

    private String formatReferenceId(String prefix, long sequenceNumber) {
        return String.format("%s-%04d", prefix, sequenceNumber);
    }

    private long getNextValueForSequenceKey(String sequenceKey) {
        try {
            return doIncrement(sequenceKey);
        } catch (DataIntegrityViolationException ex) {
            // Race condition on initial row insertion across cluster nodes; retry once
            logger.warn("Initial sequence insert conflict for key {}, retrying with update lock", sequenceKey);
            return doIncrement(sequenceKey);
        }
    }

    private long doIncrement(String sequenceKey) {
        Optional<ComplaintSequence> seqOpt = sequenceRepository.findBySequenceKeyForUpdate(sequenceKey);

        ComplaintSequence seq;
        if (seqOpt.isPresent()) {
            seq = seqOpt.get();
            seq.setCurrentValue(seq.getCurrentValue() + 1);
        } else {
            // First time this key is requested.
            // Check existing complaints table to start sequence AFTER any existing seed/historical records.
            long maxExisting = findMaxExistingSequenceNumber(sequenceKey);
            seq = new ComplaintSequence(sequenceKey, maxExisting + 1);
        }

        ComplaintSequence saved = sequenceRepository.saveAndFlush(seq);
        return saved.getCurrentValue();
    }

    private long findMaxExistingSequenceNumber(String prefix) {
        List<String> existingIds = complaintRepository.findReferenceIdsByPrefix(prefix);
        long max = 0;
        for (String id : existingIds) {
            try {
                int lastDash = id.lastIndexOf('-');
                if (lastDash != -1 && lastDash < id.length() - 1) {
                    long val = Long.parseLong(id.substring(lastDash + 1));
                    if (val > max) {
                        max = val;
                    }
                }
            } catch (NumberFormatException ignored) {
                // Ignore non-numeric suffixes
            }
        }
        return max;
    }
}
