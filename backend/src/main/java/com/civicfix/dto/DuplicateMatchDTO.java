package com.civicfix.dto;

import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Severity;
import java.time.LocalDateTime;

public class DuplicateMatchDTO {
    private Long complaintId;
    private String referenceId;
    private String title;
    private String categoryName;
    private Severity severity;
    private ComplaintStatus status;
    private Double similarityScore; // 0 to 100 percentage
    private Double distanceMeters;
    private String address;
    private LocalDateTime createdAt;

    public DuplicateMatchDTO() {}

    public DuplicateMatchDTO(Long complaintId, String referenceId, String title, String categoryName, Severity severity, ComplaintStatus status, Double similarityScore, Double distanceMeters, String address, LocalDateTime createdAt) {
        this.complaintId = complaintId;
        this.referenceId = referenceId;
        this.title = title;
        this.categoryName = categoryName;
        this.severity = severity;
        this.status = status;
        this.similarityScore = similarityScore;
        this.distanceMeters = distanceMeters;
        this.address = address;
        this.createdAt = createdAt;
    }

    public Long getComplaintId() { return complaintId; }
    public void setComplaintId(Long complaintId) { this.complaintId = complaintId; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public Double getSimilarityScore() { return similarityScore; }
    public void setSimilarityScore(Double similarityScore) { this.similarityScore = similarityScore; }
    public Double getDistanceMeters() { return distanceMeters; }
    public void setDistanceMeters(Double distanceMeters) { this.distanceMeters = distanceMeters; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
