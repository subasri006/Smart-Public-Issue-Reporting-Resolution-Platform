package com.civicfix.dto;

import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Severity;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

public class ComplaintDetailResponse {
    private Long id;
    private String referenceId;
    private String title;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private Integer categoryWeight;
    private Severity severity;
    private ComplaintStatus status;
    private Double priorityScore;
    private String priorityLevel;
    private String priorityExplanation;
    private Double latitude;
    private Double longitude;
    private String address;
    private String landmark;
    private Long citizenId;
    private String citizenName;
    private String citizenEmail;
    private String citizenPhone;
    private Long assignedStaffId;
    private String assignedStaffName;
    private String assignedStaffEmail;
    private String resolutionNotes;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private Boolean canEditOrWithdraw = false;
    private Set<ComplaintStatus> allowedNextStatuses;

    private List<AttachmentResponse> attachments = new ArrayList<>();
    private List<StatusHistoryResponse> statusHistory = new ArrayList<>();
    private List<CommentResponse> comments = new ArrayList<>();

    public ComplaintDetailResponse() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public String getCategoryIcon() { return categoryIcon; }
    public void setCategoryIcon(String categoryIcon) { this.categoryIcon = categoryIcon; }
    public Integer getCategoryWeight() { return categoryWeight; }
    public void setCategoryWeight(Integer categoryWeight) { this.categoryWeight = categoryWeight; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }
    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public Double getPriorityScore() { return priorityScore; }
    public void setPriorityScore(Double priorityScore) { this.priorityScore = priorityScore; }
    public String getPriorityLevel() { return priorityLevel; }
    public void setPriorityLevel(String priorityLevel) { this.priorityLevel = priorityLevel; }
    public String getPriorityExplanation() { return priorityExplanation; }
    public void setPriorityExplanation(String priorityExplanation) { this.priorityExplanation = priorityExplanation; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
    public Long getCitizenId() { return citizenId; }
    public void setCitizenId(Long citizenId) { this.citizenId = citizenId; }
    public String getCitizenName() { return citizenName; }
    public void setCitizenName(String citizenName) { this.citizenName = citizenName; }
    public String getCitizenEmail() { return citizenEmail; }
    public void setCitizenEmail(String citizenEmail) { this.citizenEmail = citizenEmail; }
    public String getCitizenPhone() { return citizenPhone; }
    public void setCitizenPhone(String citizenPhone) { this.citizenPhone = citizenPhone; }
    public Long getAssignedStaffId() { return assignedStaffId; }
    public void setAssignedStaffId(Long assignedStaffId) { this.assignedStaffId = assignedStaffId; }
    public String getAssignedStaffName() { return assignedStaffName; }
    public void setAssignedStaffName(String assignedStaffName) { this.assignedStaffName = assignedStaffName; }
    public String getAssignedStaffEmail() { return assignedStaffEmail; }
    public void setAssignedStaffEmail(String assignedStaffEmail) { this.assignedStaffEmail = assignedStaffEmail; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Boolean getCanEditOrWithdraw() { return canEditOrWithdraw; }
    public void setCanEditOrWithdraw(Boolean canEditOrWithdraw) { this.canEditOrWithdraw = canEditOrWithdraw; }
    public Set<ComplaintStatus> getAllowedNextStatuses() { return allowedNextStatuses; }
    public void setAllowedNextStatuses(Set<ComplaintStatus> allowedNextStatuses) { this.allowedNextStatuses = allowedNextStatuses; }
    public List<AttachmentResponse> getAttachments() { return attachments; }
    public void setAttachments(List<AttachmentResponse> attachments) { this.attachments = attachments; }
    public List<StatusHistoryResponse> getStatusHistory() { return statusHistory; }
    public void setStatusHistory(List<StatusHistoryResponse> statusHistory) { this.statusHistory = statusHistory; }
    public List<CommentResponse> getComments() { return comments; }
    public void setComments(List<CommentResponse> comments) { this.comments = comments; }
}
