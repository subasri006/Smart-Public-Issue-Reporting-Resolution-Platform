package com.civicfix.dto;

import jakarta.validation.constraints.NotBlank;

public class DuplicateCheckRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private Long categoryId;
    private Double latitude;
    private Double longitude;

    public DuplicateCheckRequest() {}

    public DuplicateCheckRequest(String title, String description, Long categoryId, Double latitude, Double longitude) {
        this.title = title;
        this.description = description;
        this.categoryId = categoryId;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
}
