package com.civicfix.service;

import com.civicfix.dto.DuplicateCheckRequest;
import com.civicfix.dto.DuplicateCheckResponse;
import com.civicfix.dto.DuplicateMatchDTO;
import com.civicfix.entity.Complaint;
import com.civicfix.repository.ComplaintRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DuplicateDetectionService {

    private final ComplaintRepository complaintRepository;

    @Value("${app.duplicate.window-days:30}")
    private int windowDays;

    @Value("${app.duplicate.threshold-percentage:45.0}")
    private double thresholdPercentage;

    private static final Set<String> STOP_WORDS = Set.of(
            "the", "is", "at", "which", "on", "a", "an", "in", "and", "or", "of", "to",
            "for", "with", "near", "there", "this", "that", "it", "my", "our", "area",
            "road", "street", "issue", "problem", "broken", "very", "please", "help"
    );

    public DuplicateDetectionService(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    public DuplicateCheckResponse checkDuplicate(DuplicateCheckRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            return new DuplicateCheckResponse(false, 0.0, "No title provided for comparison", Collections.emptyList());
        }

        LocalDateTime sinceDate = LocalDateTime.now().minusDays(windowDays);
        List<Complaint> candidates = complaintRepository.findCandidatesForDuplicateDetection(sinceDate);

        List<DuplicateMatchDTO> matches = new ArrayList<>();
        double highestScore = 0.0;

        for (Complaint existing : candidates) {
            double similarity = calculateSimilarity(request, existing);
            if (similarity >= thresholdPercentage) {
                Double distance = null;
                if (request.getLatitude() != null && request.getLongitude() != null &&
                    existing.getLatitude() != null && existing.getLongitude() != null) {
                    distance = calculateHaversineDistance(
                            request.getLatitude(), request.getLongitude(),
                            existing.getLatitude(), existing.getLongitude()
                    );
                }

                DuplicateMatchDTO match = new DuplicateMatchDTO(
                        existing.getId(),
                        existing.getReferenceId(),
                        existing.getTitle(),
                        existing.getCategory().getName(),
                        existing.getSeverity(),
                        existing.getStatus(),
                        Math.round(similarity * 10.0) / 10.0,
                        distance != null ? Math.round(distance * 10.0) / 10.0 : null,
                        existing.getAddress(),
                        existing.getCreatedAt()
                );
                matches.add(match);

                if (similarity > highestScore) {
                    highestScore = similarity;
                }
            }
        }

        matches.sort((a, b) -> Double.compare(b.getSimilarityScore(), a.getSimilarityScore()));

        boolean isPotentialDuplicate = !matches.isEmpty();
        String explanation;
        if (isPotentialDuplicate) {
            explanation = String.format(
                    "Warning: %d potentially related issue(s) found with similar description or location within the last %d days. " +
                    "Review existing reports to avoid duplicates, or proceed submitting if this is a distinct issue.",
                    matches.size(), windowDays
            );
        } else {
            explanation = "No matching duplicates detected within the recent reporting window.";
        }

        return new DuplicateCheckResponse(
                isPotentialDuplicate,
                Math.round(highestScore * 10.0) / 10.0,
                explanation,
                matches
        );
    }

    public double calculateSimilarity(DuplicateCheckRequest request, Complaint existing) {
        // 1. Text similarity
        String reqText = (request.getTitle() + " " + (request.getDescription() != null ? request.getDescription() : "")).toLowerCase();
        String existText = (existing.getTitle() + " " + existing.getDescription()).toLowerCase();

        double textSim = calculateJaccardSimilarity(reqText, existText);

        // 2. Category match
        double categoryMatch = 0.0;
        if (request.getCategoryId() != null && existing.getCategory() != null &&
            request.getCategoryId().equals(existing.getCategory().getId())) {
            categoryMatch = 1.0;
        }

        // 3. Geographic proximity
        boolean hasCoords = request.getLatitude() != null && request.getLongitude() != null &&
                            existing.getLatitude() != null && existing.getLongitude() != null;

        if (hasCoords) {
            double distance = calculateHaversineDistance(
                    request.getLatitude(), request.getLongitude(),
                    existing.getLatitude(), existing.getLongitude()
            );
            double geoScore = calculateGeoProximityScore(distance);

            // Combined with geo: 50% text, 30% geo, 20% category
            return (textSim * 0.50 + geoScore * 0.30 + categoryMatch * 0.20) * 100.0;
        } else {
            // Combined without geo: 70% text, 30% category
            return (textSim * 0.70 + categoryMatch * 0.30) * 100.0;
        }
    }

    private double calculateJaccardSimilarity(String text1, String text2) {
        Set<String> tokens1 = tokenize(text1);
        Set<String> tokens2 = tokenize(text2);

        if (tokens1.isEmpty() || tokens2.isEmpty()) {
            return 0.0;
        }

        Set<String> intersection = new HashSet<>(tokens1);
        intersection.retainAll(tokens2);

        Set<String> union = new HashSet<>(tokens1);
        union.addAll(tokens2);

        return (double) intersection.size() / (double) union.size();
    }

    private Set<String> tokenize(String input) {
        if (input == null) return Collections.emptySet();
        return Arrays.stream(input.replaceAll("[^a-zA-Z0-9\\s]", " ").split("\\s+"))
                .map(String::trim)
                .filter(s -> s.length() > 2)
                .filter(s -> !STOP_WORDS.contains(s))
                .collect(Collectors.toSet());
    }

    private double calculateGeoProximityScore(double distanceMeters) {
        if (distanceMeters <= 50.0) return 1.0;
        if (distanceMeters <= 150.0) return 0.85;
        if (distanceMeters <= 300.0) return 0.60;
        if (distanceMeters <= 600.0) return 0.30;
        return 0.0;
    }

    public static double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371000; // Earth radius in meters
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
