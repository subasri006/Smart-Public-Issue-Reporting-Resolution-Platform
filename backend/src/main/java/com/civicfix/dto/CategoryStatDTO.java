package com.civicfix.dto;

public class CategoryStatDTO {
    private String categoryName;
    private long count;
    private double percentage;

    public CategoryStatDTO() {}

    public CategoryStatDTO(String categoryName, long count, double percentage) {
        this.categoryName = categoryName;
        this.count = count;
        this.percentage = percentage;
    }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
