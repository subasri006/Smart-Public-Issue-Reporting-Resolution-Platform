package com.civicfix.dto;

import java.time.LocalDateTime;

public class AuditLogResponse {
    private Long id;
    private String action;
    private String entityName;
    private Long entityId;
    private String performedByName;
    private String details;
    private String ipAddress;
    private LocalDateTime createdAt;

    public AuditLogResponse() {}

    public AuditLogResponse(Long id, String action, String entityName, Long entityId, String performedByName, String details, String ipAddress, LocalDateTime createdAt) {
        this.id = id;
        this.action = action;
        this.entityName = entityName;
        this.entityId = entityId;
        this.performedByName = performedByName;
        this.details = details;
        this.ipAddress = ipAddress;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getEntityName() { return entityName; }
    public void setEntityName(String entityName) { this.entityName = entityName; }
    public Long getEntityId() { return entityId; }
    public void setEntityId(Long entityId) { this.entityId = entityId; }
    public String getPerformedByName() { return performedByName; }
    public void setPerformedByName(String performedByName) { this.performedByName = performedByName; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
