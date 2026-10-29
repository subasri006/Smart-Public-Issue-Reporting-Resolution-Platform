package com.civicfix.service;

import com.civicfix.dto.DuplicateCheckRequest;
import com.civicfix.entity.Complaint;
import com.civicfix.entity.ComplaintCategory;
import com.civicfix.repository.ComplaintRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import static org.junit.jupiter.api.Assertions.*;

public class DuplicateDetectionServiceTest {

    private ComplaintRepository complaintRepository;
    private DuplicateDetectionService duplicateDetectionService;

    @BeforeEach
    void setUp() {
        duplicateDetectionService = new DuplicateDetectionService(null);
    }

    @Test
    @DisplayName("Haversine distance calculation is accurate between known coordinates")
    void testHaversineDistance() {
        // Two points ~550 meters apart in Bangalore
        double lat1 = 12.9716;
        double lon1 = 77.5946;
        double lat2 = 12.9750;
        double lon2 = 77.5970;

        double distance = DuplicateDetectionService.calculateHaversineDistance(lat1, lon1, lat2, lon2);
        assertTrue(distance > 400 && distance < 650, "Distance should be approximately 500m, was: " + distance);
    }

    @Test
    @DisplayName("Similar title and category yields high similarity score")
    void testSimilarTextAndSameCategoryYieldsHighSimilarity() {
        ComplaintCategory category = new ComplaintCategory(1L, "Road Damage", "ROAD", "Roads", 20, "Construction", true);

        Complaint existing = new Complaint();
        existing.setId(10L);
        existing.setReferenceId("CF-2026-10-0002");
        existing.setTitle("Dangerous deep potholes near Sony World Signal");
        existing.setDescription("Huge crater causing accidents on main avenue");
        existing.setCategory(category);
        existing.setLatitude(12.9352);
        existing.setLongitude(77.6245);

        DuplicateCheckRequest request = new DuplicateCheckRequest(
                "Deep potholes near Sony World Signal intersection",
                "Huge crater causing accidents on main avenue road",
                1L, 12.9353, 77.6246 // coordinates ~15 meters apart
        );

        double similarity = duplicateDetectionService.calculateSimilarity(request, existing);

        assertTrue(similarity >= 60.0, "Similarity should be >= 60%, was: " + similarity);
    }

    @Test
    @DisplayName("Completely unrelated issue yields low similarity score")
    void testUnrelatedIssueYieldsLowSimilarity() {
        ComplaintCategory catRoad = new ComplaintCategory(1L, "Road Damage", "ROAD", "Roads", 20, "Construction", true);
        ComplaintCategory catWater = new ComplaintCategory(2L, "Water Supply", "WATER", "Water", 25, "Droplets", true);

        Complaint existing = new Complaint();
        existing.setId(10L);
        existing.setTitle("Dangerous deep potholes near Sony World Signal");
        existing.setDescription("Asphalt broken");
        existing.setCategory(catRoad);
        existing.setLatitude(12.9352);
        existing.setLongitude(77.6245);

        DuplicateCheckRequest request = new DuplicateCheckRequest(
                "Contaminated brown drinking water pipeline leak",
                "No clean drinking water since morning in apartment",
                2L, 13.0500, 77.5000 // miles away
        );

        double similarity = duplicateDetectionService.calculateSimilarity(request, existing);

        assertTrue(similarity < 20.0, "Similarity for unrelated complaints should be < 20%, was: " + similarity);
    }
}
