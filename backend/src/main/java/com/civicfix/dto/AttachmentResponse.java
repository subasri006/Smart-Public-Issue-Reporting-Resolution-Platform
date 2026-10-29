package com.civicfix.dto;

import java.time.LocalDateTime;

public class AttachmentResponse {
    private Long id;
    private String fileName;
    private String fileOriginalName;
    private String fileType;
    private Long fileSize;
    private String downloadUrl;
    private Boolean isResolutionEvidence;
    private String uploadedByName;
    private LocalDateTime createdAt;

    public AttachmentResponse() {}

    public AttachmentResponse(Long id, String fileName, String fileOriginalName, String fileType, Long fileSize, String downloadUrl, Boolean isResolutionEvidence, String uploadedByName, LocalDateTime createdAt) {
        this.id = id;
        this.fileName = fileName;
        this.fileOriginalName = fileOriginalName;
        this.fileType = fileType;
        this.fileSize = fileSize;
        this.downloadUrl = downloadUrl;
        this.isResolutionEvidence = isResolutionEvidence;
        this.uploadedByName = uploadedByName;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileOriginalName() { return fileOriginalName; }
    public void setFileOriginalName(String fileOriginalName) { this.fileOriginalName = fileOriginalName; }
    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getDownloadUrl() { return downloadUrl; }
    public void setDownloadUrl(String downloadUrl) { this.downloadUrl = downloadUrl; }
    public Boolean getIsResolutionEvidence() { return isResolutionEvidence; }
    public void setIsResolutionEvidence(Boolean isResolutionEvidence) { this.isResolutionEvidence = isResolutionEvidence; }
    public String getUploadedByName() { return uploadedByName; }
    public void setUploadedByName(String uploadedByName) { this.uploadedByName = uploadedByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
