package com.civicfix.entity;

import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Severity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "complaints", indexes = {
    @Index(name = "idx_complaint_ref", columnList = "reference_id"),
    @Index(name = "idx_complaint_status", columnList = "status"),
    @Index(name = "idx_complaint_severity", columnList = "severity"),
    @Index(name = "idx_complaint_priority", columnList = "priority_score"),
    @Index(name = "idx_complaint_citizen", columnList = "citizen_id"),
    @Index(name = "idx_complaint_assigned", columnList = "assigned_staff_id"),
    @Index(name = "idx_complaint_created", columnList = "created_at")
})
public class Complaint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_id", nullable = false, unique = true, length = 30)
    private String referenceId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(nullable = false, length = 3000)
    private String description;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private ComplaintCategory category;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ComplaintStatus status = ComplaintStatus.SUBMITTED;

    @Column(name = "priority_score", nullable = false)
    private Double priorityScore = 0.0;

    @Column(precision = 10)
    private Double latitude;

    @Column(precision = 10)
    private Double longitude;

    @Column(length = 255)
    private String address;

    @Column(length = 150)
    private String landmark;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "citizen_id", nullable = false)
    private User citizen;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assigned_staff_id")
    private User assignedStaff;

    @Column(name = "resolution_notes", length = 3000)
    private String resolutionNotes;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ComplaintStatusHistory> statusHistory = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ComplaintComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "complaint", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("createdAt ASC")
    private List<ComplaintAttachment> attachments = new ArrayList<>();

    public Complaint() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ComplaintStatus.SUBMITTED;
        }
        if (this.priorityScore == null) {
            this.priorityScore = 0.0;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public void addStatusHistory(ComplaintStatusHistory history) {
        statusHistory.add(history);
        history.setComplaint(this);
    }

    public void addComment(ComplaintComment comment) {
        comments.add(comment);
        comment.setComplaint(this);
    }

    public void addAttachment(ComplaintAttachment attachment) {
        attachments.add(attachment);
        attachment.setComplaint(this);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getReferenceId() {
        return referenceId;
    }

    public void setReferenceId(String referenceId) {
        this.referenceId = referenceId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public ComplaintCategory getCategory() {
        return category;
    }

    public void setCategory(ComplaintCategory category) {
        this.category = category;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public ComplaintStatus getStatus() {
        return status;
    }

    public void setStatus(ComplaintStatus status) {
        this.status = status;
    }

    public Double getPriorityScore() {
        return priorityScore;
    }

    public void setPriorityScore(Double priorityScore) {
        this.priorityScore = priorityScore;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getLandmark() {
        return landmark;
    }

    public void setLandmark(String landmark) {
        this.landmark = landmark;
    }

    public User getCitizen() {
        return citizen;
    }

    public void setCitizen(User citizen) {
        this.citizen = citizen;
    }

    public User getAssignedStaff() {
        return assignedStaff;
    }

    public void setAssignedStaff(User assignedStaff) {
        this.assignedStaff = assignedStaff;
    }

    public String getResolutionNotes() {
        return resolutionNotes;
    }

    public void setResolutionNotes(String resolutionNotes) {
        this.resolutionNotes = resolutionNotes;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<ComplaintStatusHistory> getStatusHistory() {
        return statusHistory;
    }

    public void setStatusHistory(List<ComplaintStatusHistory> statusHistory) {
        this.statusHistory = statusHistory;
    }

    public List<ComplaintComment> getComments() {
        return comments;
    }

    public void setComments(List<ComplaintComment> comments) {
        this.comments = comments;
    }

    public List<ComplaintAttachment> getAttachments() {
        return attachments;
    }

    public void setAttachments(List<ComplaintAttachment> attachments) {
        this.attachments = attachments;
    }
}
