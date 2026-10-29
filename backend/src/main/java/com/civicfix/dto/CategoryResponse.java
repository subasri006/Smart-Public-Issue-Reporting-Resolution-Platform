package com.civicfix.dto;

import java.time.LocalDateTime;

public class CategoryResponse {
    private Long id;
    private String name;
    private String code;
    private String description;
    private Integer weight;
    private String icon;
    private Boolean active;
    private LocalDateTime createdAt;

    public CategoryResponse() {}

    public CategoryResponse(Long id, String name, String code, String description, Integer weight, String icon, Boolean active, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.weight = weight;
        this.icon = icon;
        this.active = active;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Integer getWeight() { return weight; }
    public void setWeight(Integer weight) { this.weight = weight; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public Boolean getActive() { return active; }
    public void setActive(Boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
