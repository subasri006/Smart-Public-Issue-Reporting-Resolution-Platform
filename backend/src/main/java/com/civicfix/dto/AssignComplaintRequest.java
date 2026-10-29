package com.civicfix.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class AssignComplaintRequest {
    @NotNull(message = "Staff ID is required")
    private Long staffId;

    @Size(max = 500, message = "Notes must not exceed 500 characters")
    private String notes;

    public AssignComplaintRequest() {}

    public AssignComplaintRequest(Long staffId, String notes) {
        this.staffId = staffId;
        this.notes = notes;
    }

    public Long getStaffId() { return staffId; }
    public void setStaffId(Long staffId) { this.staffId = staffId; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
