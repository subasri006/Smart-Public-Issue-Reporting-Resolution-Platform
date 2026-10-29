package com.civicfix.dto;

import java.util.ArrayList;
import java.util.List;

public class DuplicateCheckResponse {
    private Boolean isPotentialDuplicate = false;
    private Double highestSimilarity = 0.0;
    private String explanation;
    private List<DuplicateMatchDTO> matches = new ArrayList<>();

    public DuplicateCheckResponse() {}

    public DuplicateCheckResponse(Boolean isPotentialDuplicate, Double highestSimilarity, String explanation, List<DuplicateMatchDTO> matches) {
        this.isPotentialDuplicate = isPotentialDuplicate;
        this.highestSimilarity = highestSimilarity;
        this.explanation = explanation;
        this.matches = matches != null ? matches : new ArrayList<>();
    }

    public Boolean getIsPotentialDuplicate() { return isPotentialDuplicate; }
    public void setIsPotentialDuplicate(Boolean potentialDuplicate) { isPotentialDuplicate = potentialDuplicate; }
    public Double getHighestSimilarity() { return highestSimilarity; }
    public void setHighestSimilarity(Double highestSimilarity) { this.highestSimilarity = highestSimilarity; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public List<DuplicateMatchDTO> getMatches() { return matches; }
    public void setMatches(List<DuplicateMatchDTO> matches) { this.matches = matches; }
}
