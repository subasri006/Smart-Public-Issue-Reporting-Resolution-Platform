package com.civicfix.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_attachments", indexes = {
    @Index(name = "idx_attachment_complaint", columnList = "complaint_id")
})
public class ComplaintAttachment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "complaint_id", nullable = false)
    private Complaint complaint;

    @Column(name = "file_name", nullable = false, length = 150)
    private String fileName;

    @Column(name = "file_original_name", nullable = false, length = 200)
    private String fileOriginalName;

    @Column(name = "file_type", nullable = false, length = 50)
    private String fileType;

    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    @Column(name = "file_path", nullable = false, length = 300)
    private String filePath;

    @Column(name = "is_resolution_evidence", nullable = false)
    private Boolean isResolutionEvidence = false;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "uploaded_by_id")
    private User uploadedBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ComplaintAttachment() {
    }

    public ComplaintAttachment(Complaint complaint, String fileName, String fileOriginalName, String fileType, Long fileSize, String filePath, Boolean isResolutionEvidence, User uploadedBy) {
        this.complaint = complaint;
        this.fileName = fileName;
        this.fileOriginalName = fileOriginalName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.filePath = filePath;
        this.isResolutionEvidence = isResolutionEvidence != null ? isResolutionEvidence : false;
        this.uploadedBy = uploadedBy;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.isResolutionEvidence == null) {
            this.isResolutionEvidence = false;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Complaint getComplaint() {
        return complaint;
    }

    public void setComplaint(Complaint complaint) {
        this.complaint = complaint;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileOriginalName() {
        return fileOriginalName;
    }

    public void setFileOriginalName(String fileOriginalName) {
        this.fileOriginalName = fileOriginalName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public Long getFileSize() {
        return fileSize;
    }

    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public Boolean getIsResolutionEvidence() {
        return isResolutionEvidence;
    }

    public void setIsResolutionEvidence(Boolean isResolutionEvidence) {
        this.isResolutionEvidence = isResolutionEvidence;
    }

    public User getUploadedBy() {
        return uploadedBy;
    }

    public void setUploadedBy(User uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
