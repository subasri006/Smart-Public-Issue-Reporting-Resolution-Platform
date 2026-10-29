package com.civicfix.dto;

import com.civicfix.enums.Severity;
import jakarta.validation.constraints.Size;

public class UpdateComplaintRequest {

    @Size(max = 150, message = "Title must not exceed 150 characters")
    private String title;

    @Size(max = 3000, message = "Description must not exceed 3000 characters")
    private String description;

    private Long categoryId;
    private Severity severity;
    private Double latitude;
    private Double longitude;
    private String address;
    private String landmark;

    public UpdateComplaintRequest() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }
}
