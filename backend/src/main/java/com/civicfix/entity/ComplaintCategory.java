package com.civicfix.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "complaint_categories", indexes = {
    @Index(name = "idx_category_code", columnList = "code")
})
public class ComplaintCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 60)
    private String name;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private Integer weight = 15; // default priority weight for category

    @Column(length = 50)
    private String icon;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public ComplaintCategory() {
    }

    public ComplaintCategory(Long id, String name, String code, String description, Integer weight, String icon, Boolean active) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.weight = weight != null ? weight : 15;
        this.icon = icon;
        this.active = active != null ? active : true;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.active == null) {
            this.active = true;
        }
        if (this.weight == null) {
            this.weight = 15;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getWeight() {
        return weight;
    }

    public void setWeight(Integer weight) {
        this.weight = weight;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
