package com.civicfix.service;

import com.civicfix.entity.ComplaintCategory;
import com.civicfix.enums.Severity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
public class PriorityScoringService {

    @Value("${app.priority.age-weight-per-day:2.0}")
    private double ageWeightPerDay;

    @Value("${app.priority.max-age-weight:30.0}")
    private double maxAgeWeight;

    public static class PriorityResult {
        private final double score;
        private final String level; // LOW, MEDIUM, HIGH, CRITICAL
        private final String explanation;

        public PriorityResult(double score, String level, String explanation) {
            this.score = score;
            this.level = level;
            this.explanation = explanation;
        }

        public double getScore() { return score; }
        public String getLevel() { return level; }
        public String getExplanation() { return explanation; }
    }

    public PriorityResult calculatePriority(Severity severity, ComplaintCategory category, LocalDateTime createdAt) {
        // 1. Severity weight
        int severityWeight = severity != null ? severity.getDefaultWeight() : Severity.LOW.getDefaultWeight();

        // 2. Category weight
        int categoryWeight = (category != null && category.getWeight() != null) ? category.getWeight() : 15;

        // 3. Age weight: increases priority over time for unresolved issues (max capped)
        double ageWeight = 0.0;
        long daysOld = 0;
        if (createdAt != null) {
            long hours = Duration.between(createdAt, LocalDateTime.now()).toHours();
            daysOld = hours / 24;
            ageWeight = Math.min(maxAgeWeight, daysOld * ageWeightPerDay);
        }

        double totalScore = severityWeight + categoryWeight + ageWeight;

        // Determine level
        String level;
        if (severity == Severity.CRITICAL || totalScore >= 90.0) {
            level = "CRITICAL";
        } else if (severity == Severity.HIGH || totalScore >= 65.0) {
            level = "HIGH";
        } else if (severity == Severity.MEDIUM || totalScore >= 40.0) {
            level = "MEDIUM";
        } else {
            level = "LOW";
        }

        String explanation = String.format(
                "Score: %.1f [Severity (%s): %d pts + Category (%s): %d pts + Age (%d days): %.1f pts]",
                totalScore,
                severity != null ? severity.name() : "NONE",
                severityWeight,
                category != null ? category.getName() : "General",
                categoryWeight,
                daysOld,
                ageWeight
        );

        return new PriorityResult(Math.round(totalScore * 10.0) / 10.0, level, explanation);
    }
}
