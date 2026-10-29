package com.civicfix.dto;

import com.civicfix.enums.Role;
import jakarta.validation.constraints.Size;

public class UserUpdateRequest {
    @Size(max = 100, message = "Full name must be at most 100 characters")
    private String fullName;

    private String phone;
    private Role role;
    private Boolean active;

    public UserUpdateRequest() {}

    public UserUpdateRequest(String fullName, String phone, Role role, Boolean active) {
        this.fullName = fullName;
        this.phone = phone;
        this.role = role;
        this.active = active;
    }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
}
