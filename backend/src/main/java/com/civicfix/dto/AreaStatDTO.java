package com.civicfix.dto;

public class AreaStatDTO {
    private String area;
    private long count;

    public AreaStatDTO() {}

    public AreaStatDTO(String area, long count) {
        this.area = area;
        this.count = count;
    }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
}
