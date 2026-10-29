package com.civicfix.service;

import com.civicfix.dto.ComplaintDetailResponse;
import com.civicfix.dto.CreateComplaintRequest;
import com.civicfix.entity.*;
import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Role;
import com.civicfix.enums.Severity;
import com.civicfix.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;

public class ReferenceIdGenerationTest {

    private ReferenceIdGeneratorService generatorService;
    private ComplaintService complaintService;

    private Map<String, ComplaintSequence> sequenceStore;
    private Set<String> existingComplaintRefIds;
    private Map<Long, Complaint> complaintByIdStore;
    private Map<String, Complaint> complaintByRefIdStore;
    private AtomicLong complaintIdCounter;

    private ComplaintRepository complaintRepository;
    private ComplaintSequenceRepository sequenceRepository;

    @BeforeEach
    void setUp() {
        sequenceStore = new ConcurrentHashMap<>();
        existingComplaintRefIds = ConcurrentHashMap.newKeySet();
        complaintByIdStore = new ConcurrentHashMap<>();
        complaintByRefIdStore = new ConcurrentHashMap<>();
        complaintIdCounter = new AtomicLong(100);

        // In-memory proxy for ComplaintSequenceRepository
        sequenceRepository = (ComplaintSequenceRepository) Proxy.newProxyInstance(
                ComplaintSequenceRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintSequenceRepository.class},
                (proxy, method, args) -> {
                    String methodName = method.getName();
                    if ("findBySequenceKeyForUpdate".equals(methodName) || "findById".equals(methodName)) {
                        String key = (String) args[0];
                        return Optional.ofNullable(sequenceStore.get(key));
                    } else if ("saveAndFlush".equals(methodName) || "save".equals(methodName)) {
                        ComplaintSequence seq = (ComplaintSequence) args[0];
                        sequenceStore.put(seq.getSequenceKey(), seq);
                        return seq;
                    }
                    return null;
                }
        );

        // In-memory proxy for ComplaintRepository
        complaintRepository = (ComplaintRepository) Proxy.newProxyInstance(
                ComplaintRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintRepository.class},
                (proxy, method, args) -> {
                    String methodName = method.getName();
                    if ("findReferenceIdsByPrefix".equals(methodName)) {
                        String prefix = (String) args[0];
                        List<String> matches = new ArrayList<>();
                        for (String id : existingComplaintRefIds) {
                            if (id.startsWith(prefix + "-")) {
                                matches.add(id);
                            }
                        }
                        for (String id : complaintByRefIdStore.keySet()) {
                            if (id.startsWith(prefix + "-") && !matches.contains(id)) {
                                matches.add(id);
                            }
                        }
                        return matches;
                    } else if ("existsByReferenceId".equals(methodName)) {
                        String refId = (String) args[0];
                        return existingComplaintRefIds.contains(refId) || complaintByRefIdStore.containsKey(refId);
                    } else if ("findByReferenceId".equals(methodName)) {
                        String refId = (String) args[0];
                        return Optional.ofNullable(complaintByRefIdStore.get(refId));
                    } else if ("findById".equals(methodName)) {
                        Long id = (Long) args[0];
                        return Optional.ofNullable(complaintByIdStore.get(id));
                    } else if ("save".equals(methodName) || "saveAndFlush".equals(methodName)) {
                        Complaint c = (Complaint) args[0];
                        if (c.getId() == null) {
                            c.setId(complaintIdCounter.incrementAndGet());
                        }
                        c.setCreatedAt(LocalDateTime.now());
                        complaintByIdStore.put(c.getId(), c);
                        complaintByRefIdStore.put(c.getReferenceId(), c);
                        existingComplaintRefIds.add(c.getReferenceId());
                        return c;
                    }
                    return null;
                }
        );

        generatorService = new ReferenceIdGeneratorService(sequenceRepository, complaintRepository);

        // Set up ComplaintService with minimal proxies for full end-to-end complaint creation test
        ComplaintCategory testCategory = new ComplaintCategory(1L, "Road Damage", "ROAD", "Potholes", 20, "Wrench", true);
        User testCitizen = new User(1L, "citizen1", "citizen1@example.com", "hash", "John Citizen", "1234567890", Role.ROLE_CITIZEN, true);

        ComplaintCategoryRepository categoryRepo = (ComplaintCategoryRepository) Proxy.newProxyInstance(
                ComplaintCategoryRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintCategoryRepository.class},
                (proxy, method, args) -> {
                    if ("findById".equals(method.getName())) {
                        return Optional.of(testCategory);
                    }
                    return null;
                }
        );

        UserRepository userRepo = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> Optional.of(testCitizen)
        );

        ComplaintStatusHistoryRepository historyRepo = (ComplaintStatusHistoryRepository) Proxy.newProxyInstance(
                ComplaintStatusHistoryRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintStatusHistoryRepository.class},
                (proxy, method, args) -> {
                    if ("findByComplaintOrderByCreatedAtAsc".equals(method.getName())) {
                        return Collections.emptyList();
                    }
                    return args != null && args.length > 0 ? args[0] : null;
                }
        );

        ComplaintAssignmentRepository assignmentRepo = (ComplaintAssignmentRepository) Proxy.newProxyInstance(
                ComplaintAssignmentRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintAssignmentRepository.class},
                (proxy, method, args) -> null
        );

        ComplaintCommentRepository commentRepo = (ComplaintCommentRepository) Proxy.newProxyInstance(
                ComplaintCommentRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintCommentRepository.class},
                (proxy, method, args) -> Collections.emptyList()
        );

        ComplaintAttachmentRepository attachmentRepo = (ComplaintAttachmentRepository) Proxy.newProxyInstance(
                ComplaintAttachmentRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintAttachmentRepository.class},
                (proxy, method, args) -> Collections.emptyList()
        );

        PriorityScoringService priorityService = new PriorityScoringService();
        ReflectionTestUtils.setField(priorityService, "ageWeightPerDay", 2.0);
        ReflectionTestUtils.setField(priorityService, "maxAgeWeight", 30.0);

        AuthService authService = new AuthService(userRepo, null, null, null, null) {
            @Override
            public User getCurrentUser() {
                return testCitizen;
            }
        };

        AuditService auditService = new AuditService(null) {
            @Override
            public void log(String action, String entityName, Long entityId, User performedBy, String details) {
                // no-op in unit test
            }
        };

        complaintService = new ComplaintService(
                complaintRepository,
                categoryRepo,
                userRepo,
                historyRepo,
                assignmentRepo,
                commentRepo,
                attachmentRepo,
                priorityService,
                null,
                authService,
                auditService,
                generatorService
        );
    }

    @Test
    @DisplayName("Two or more complaints created via ComplaintService receive different unique reference IDs")
    void testCreateMultipleComplaintsReceiveDifferentReferenceIds() {
        CreateComplaintRequest request1 = new CreateComplaintRequest(
                "Deep pothole on 5th cross main junction",
                "Damaging car suspensions and causing bike skids",
                1L, Severity.HIGH, 12.9716, 77.5946, "5th Cross", "Signal"
        );

        CreateComplaintRequest request2 = new CreateComplaintRequest(
                "Dangerous broken water pipe leaking onto pavement",
                "Continuous overflow flooding sidewalk and roadway",
                1L, Severity.CRITICAL, 12.9720, 77.5950, "6th Cross", "Near School"
        );

        ComplaintDetailResponse response1 = complaintService.createComplaint(request1, null);
        ComplaintDetailResponse response2 = complaintService.createComplaint(request2, null);

        assertNotNull(response1, "Response 1 should not be null");
        assertNotNull(response2, "Response 2 should not be null");

        String ref1 = response1.getReferenceId();
        String ref2 = response2.getReferenceId();

        assertNotNull(ref1, "Reference ID 1 must not be null");
        assertNotNull(ref2, "Reference ID 2 must not be null");

        // Verify uniqueness requirement: both complaints must have different reference IDs
        assertNotEquals(ref1, ref2, "Complaints must receive different, distinct reference IDs");

        // Verify standard human-readable format CF-YYYY-MM-XXXX
        assertTrue(ref1.matches("^CF-\\d{4}-\\d{2}-\\d{4,}$"), "ref1 must match format CF-YYYY-MM-XXXX: " + ref1);
        assertTrue(ref2.matches("^CF-\\d{4}-\\d{2}-\\d{4,}$"), "ref2 must match format CF-YYYY-MM-XXXX: " + ref2);

        // Verify both complaints were actually persisted in the repository and are queryable
        Optional<Complaint> persisted1 = complaintRepository.findByReferenceId(ref1);
        Optional<Complaint> persisted2 = complaintRepository.findByReferenceId(ref2);

        assertTrue(persisted1.isPresent(), "Complaint 1 must be saved and found in database");
        assertTrue(persisted2.isPresent(), "Complaint 2 must be saved and found in database");

        assertEquals(request1.getTitle(), persisted1.get().getTitle());
        assertEquals(request2.getTitle(), persisted2.get().getTitle());
        assertNotEquals(persisted1.get().getReferenceId(), persisted2.get().getReferenceId());
    }

    @Test
    @DisplayName("Multiple sequential reference ID generations produce strictly increasing values")
    void testMultipleComplaintsReceiveUniqueSequentialReferenceIds() {
        LocalDate testDate = LocalDate.of(2026, 10, 24);

        String refId1 = generatorService.generateNextReferenceId(testDate);
        existingComplaintRefIds.add(refId1);

        String refId2 = generatorService.generateNextReferenceId(testDate);
        existingComplaintRefIds.add(refId2);

        String refId3 = generatorService.generateNextReferenceId(testDate);
        existingComplaintRefIds.add(refId3);

        assertNotNull(refId1);
        assertNotNull(refId2);
        assertNotNull(refId3);

        assertNotEquals(refId1, refId2);
        assertNotEquals(refId2, refId3);
        assertNotEquals(refId1, refId3);

        assertEquals("CF-2026-10-0001", refId1);
        assertEquals("CF-2026-10-0002", refId2);
        assertEquals("CF-2026-10-0003", refId3);
    }

    @Test
    @DisplayName("Generator syncs with existing complaint reference IDs and avoids collision")
    void testGeneratorSyncsWithExistingComplaintReferenceIds() {
        LocalDate testDate = LocalDate.of(2026, 10, 24);

        // Simulate 6 pre-seeded complaints in database
        for (int i = 1; i <= 6; i++) {
            existingComplaintRefIds.add(String.format("CF-2026-10-%04d", i));
        }

        // Generator should detect existing complaints up to 6 and start at 7
        String nextRefId = generatorService.generateNextReferenceId(testDate);

        assertNotNull(nextRefId);
        assertEquals("CF-2026-10-0007", nextRefId, "Next generated reference ID should follow existing seeded complaints");
        assertFalse(existingComplaintRefIds.contains(nextRefId), "Generated ID must not exist in database");
    }

    @Test
    @DisplayName("Concurrent complaint reference ID generation produces zero duplicates")
    void testConcurrentReferenceIdGenerationProducesZeroDuplicates() throws InterruptedException {
        LocalDate testDate = LocalDate.of(2026, 10, 24);
        int threadCount = 20;
        ExecutorService executor = Executors.newFixedThreadPool(threadCount);
        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch finishLatch = new CountDownLatch(threadCount);

        List<String> generatedIds = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < threadCount; i++) {
            executor.submit(() -> {
                try {
                    startLatch.await(); // ensure all threads fire at the exact same millisecond
                    String refId = generatorService.generateNextReferenceId(testDate);
                    generatedIds.add(refId);
                } catch (Exception e) {
                    fail("Exception in concurrent generation: " + e.getMessage());
                } finally {
                    finishLatch.countDown();
                }
            });
        }

        startLatch.countDown(); // trigger all threads
        boolean finishedInTime = finishLatch.await(5, TimeUnit.SECONDS);
        executor.shutdown();

        assertTrue(finishedInTime, "All threads should complete within 5 seconds");
        assertEquals(threadCount, generatedIds.size(), "Should have generated 20 reference IDs");

        // Assert all 20 IDs are strictly unique
        Set<String> uniqueIds = new HashSet<>(generatedIds);
        assertEquals(threadCount, uniqueIds.size(), "Every concurrently generated reference ID must be distinct and unique");
    }
}
