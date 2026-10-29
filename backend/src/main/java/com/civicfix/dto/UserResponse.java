package com.civicfix.dto;

import com.civicfix.enums.Role;
import java.time.LocalDateTime;

public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String department;
    private String phone;
    private Role role;
    private Boolean active;
    private LocalDateTime createdAt;
    private long assignedCount;
    private long resolvedCount;

    public UserResponse() {}

    public UserResponse(Long id, String username, String email, String fullName, String phone, Role role, Boolean active, LocalDateTime createdAt) {
        this(id, username, email, fullName, null, phone, role, active, createdAt);
    }

    public UserResponse(Long id, String username, String email, String fullName, String department, String phone, Role role, Boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.department = department;
        this.phone = phone;
        this.role = role;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public long getAssignedCount() { return assignedCount; }
    public void setAssignedCount(long assignedCount) { this.assignedCount = assignedCount; }
    public long getResolvedCount() { return resolvedCount; }
    public void setResolvedCount(long resolvedCount) { this.resolvedCount = resolvedCount; }
}
