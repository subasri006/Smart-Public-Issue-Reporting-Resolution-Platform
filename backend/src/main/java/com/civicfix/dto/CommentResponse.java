package com.civicfix.dto;

import java.time.LocalDateTime;

public class CommentResponse {
    private Long id;
    private String authorName;
    private String authorRole;
    private String comment;
    private Boolean isInternal;
    private LocalDateTime createdAt;

    public CommentResponse() {}

    public CommentResponse(Long id, String authorName, String authorRole, String comment, Boolean isInternal, LocalDateTime createdAt) {
        this.id = id;
        this.authorName = authorName;
        this.authorRole = authorRole;
        this.comment = comment;
        this.isInternal = isInternal;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }
    public String getAuthorRole() { return authorRole; }
    public void setAuthorRole(String authorRole) { this.authorRole = authorRole; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Boolean getIsInternal() { return isInternal; }
    public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
