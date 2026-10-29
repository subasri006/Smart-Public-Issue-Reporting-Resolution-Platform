package com.civicfix.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CategoryRequest {
    @NotBlank(message = "Category name is required")
    @Size(max = 60, message = "Category name must not exceed 60 characters")
    private String name;

    @NotBlank(message = "Category code is required")
    @Size(max = 40, message = "Category code must not exceed 40 characters")
    private String code;

    @Size(max = 255, message = "Description must not exceed 255 characters")
    private String description;

    @NotNull(message = "Weight is required")
    private Integer weight = 15;

    private String icon;
    private Boolean active = true;

    public CategoryRequest() {}

    public CategoryRequest(String name, String code, String description, Integer weight, String icon, Boolean active) {
        this.name = name;
        this.code = code;
        this.description = description;
        this.weight = weight != null ? weight : 15;
        this.icon = icon;
        this.active = active != null ? active : true;
    }

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
}
