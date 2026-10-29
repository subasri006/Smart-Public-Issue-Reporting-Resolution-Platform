package com.civicfix.dto;

import com.civicfix.enums.ComplaintStatus;
import java.time.LocalDateTime;

public class StatusHistoryResponse {
    private Long id;
    private ComplaintStatus previousStatus;
    private ComplaintStatus newStatus;
    private String changedByName;
    private String changedByRole;
    private String comment;
    private LocalDateTime createdAt;

    public StatusHistoryResponse() {}

    public StatusHistoryResponse(Long id, ComplaintStatus previousStatus, ComplaintStatus newStatus, String changedByName, String changedByRole, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.changedByName = changedByName;
        this.changedByRole = changedByRole;
        this.comment = comment;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ComplaintStatus getPreviousStatus() { return previousStatus; }
    public void setPreviousStatus(ComplaintStatus previousStatus) { this.previousStatus = previousStatus; }
    public ComplaintStatus getNewStatus() { return newStatus; }
    public void setNewStatus(ComplaintStatus newStatus) { this.newStatus = newStatus; }
    public String getChangedByName() { return changedByName; }
    public void setChangedByName(String changedByName) { this.changedByName = changedByName; }
    public String getChangedByRole() { return changedByRole; }
    public void setChangedByRole(String changedByRole) { this.changedByRole = changedByRole; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
