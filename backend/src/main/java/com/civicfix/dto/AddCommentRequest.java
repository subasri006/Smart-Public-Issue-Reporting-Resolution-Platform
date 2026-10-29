package com.civicfix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AddCommentRequest {
    @NotBlank(message = "Comment cannot be empty")
    @Size(max = 1500, message = "Comment must not exceed 1500 characters")
    private String comment;

    private Boolean isInternal = false;

    public AddCommentRequest() {}

    public AddCommentRequest(String comment, Boolean isInternal) {
        this.comment = comment;
        this.isInternal = isInternal != null ? isInternal : false;
    }

    public String getComment() { return comment; }
    public void setComment(String comment) { this.comment = comment; }
    public Boolean getIsInternal() { return isInternal; }
    public void setIsInternal(Boolean isInternal) { this.isInternal = isInternal; }
}
