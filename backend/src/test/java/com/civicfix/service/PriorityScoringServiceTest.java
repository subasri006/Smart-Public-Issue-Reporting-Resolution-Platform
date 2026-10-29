package com.civicfix.service;

import com.civicfix.entity.ComplaintCategory;
import com.civicfix.enums.Severity;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class PriorityScoringServiceTest {

    private PriorityScoringService priorityScoringService;

    @BeforeEach
    void setUp() {
        priorityScoringService = new PriorityScoringService();
        ReflectionTestUtils.setField(priorityScoringService, "ageWeightPerDay", 2.0);
        ReflectionTestUtils.setField(priorityScoringService, "maxAgeWeight", 30.0);
    }

    @Test
    @DisplayName("Critical severity should immediately receive CRITICAL priority level")
    void testCriticalSeverityReceivesCriticalLevel() {
        ComplaintCategory category = new ComplaintCategory(1L, "Public Safety", "SAFETY", "Hazards", 30, "AlertTriangle", true);
        LocalDateTime now = LocalDateTime.now();

        PriorityScoringService.PriorityResult result = priorityScoringService.calculatePriority(Severity.CRITICAL, category, now);

        // Critical weight (80) + Category weight (30) + Age (0) = 110.0
        assertEquals(110.0, result.getScore(), 0.01);
        assertEquals("CRITICAL", result.getLevel());
        assertTrue(result.getExplanation().contains("CRITICAL"));
    }

    @Test
    @DisplayName("Low severity fresh issue should receive LOW priority level")
    void testLowSeverityReceivesLowLevel() {
        ComplaintCategory category = new ComplaintCategory(2L, "Other", "OTHER", "Other issues", 5, "HelpCircle", true);
        LocalDateTime now = LocalDateTime.now();

        PriorityScoringService.PriorityResult result = priorityScoringService.calculatePriority(Severity.LOW, category, now);

        // Low weight (10) + Category weight (5) + Age (0) = 15.0
        assertEquals(15.0, result.getScore(), 0.01);
        assertEquals("LOW", result.getLevel());
    }

    @Test
    @DisplayName("Age weight increases priority score as days pass and caps at maxAgeWeight")
    void testAgeWeightAccumulationAndCapping() {
        ComplaintCategory category = new ComplaintCategory(3L, "Garbage", "GARBAGE", "Waste", 15, "Trash2", true);
        
        // 5 days old: 5 * 2 = 10 pts
        LocalDateTime fiveDaysAgo = LocalDateTime.now().minusDays(5);
        PriorityScoringService.PriorityResult result5Days = priorityScoringService.calculatePriority(Severity.MEDIUM, category, fiveDaysAgo);
        // Medium (25) + Category (15) + Age (10) = 50.0
        assertEquals(50.0, result5Days.getScore(), 0.1);

        // 25 days old: 25 * 2 = 50 pts, but capped at 30.0
        LocalDateTime twentyFiveDaysAgo = LocalDateTime.now().minusDays(25);
        PriorityScoringService.PriorityResult resultCapped = priorityScoringService.calculatePriority(Severity.MEDIUM, category, twentyFiveDaysAgo);
        // Medium (25) + Category (15) + Capped Age (30) = 70.0
        assertEquals(70.0, resultCapped.getScore(), 0.1);
        assertEquals("HIGH", resultCapped.getLevel());
    }
}
