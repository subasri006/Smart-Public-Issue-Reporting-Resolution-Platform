package com.civicfix.dto;

import com.civicfix.enums.ComplaintStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UpdateStatusRequest {
    @NotNull(message = "New status is required")
    private ComplaintStatus status;

    @Size(max = 1000, message = "Comment must not exceed 1000 characters")
    private String comment;

    @Size(max = 3000, message = "Resolution notes must not exceed 3000 characters")
    private String resolutionNotes;

    public UpdateStatusRequest() {}

    public UpdateStatusRequest(ComplaintStatus status, String comment, String resolutionNotes) {
        this.status = status;
        this.comment = comment;
        this.resolutionNotes = resolutionNotes;
    }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public String getResolutionNotes() { return resolutionNotes; }
    public void setResolutionNotes(String resolutionNotes) { this.resolutionNotes = resolutionNotes; }
}
