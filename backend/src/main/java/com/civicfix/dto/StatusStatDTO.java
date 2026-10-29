package com.civicfix.dto;

import com.civicfix.enums.ComplaintStatus;

public class StatusStatDTO {
    private ComplaintStatus status;
    private String label;
    private long count;
    private double percentage;

    public StatusStatDTO() {}

    public StatusStatDTO(ComplaintStatus status, String label, long count, double percentage) {
        this.status = status;
        this.label = label;
        this.count = count;
        this.percentage = percentage;
    }

    public ComplaintStatus getStatus() { return status; }
    public void setStatus(ComplaintStatus status) { this.status = status; }
    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }
    public long getCount() { return count; }
    public void setCount(long count) { this.count = count; }
    public double getPercentage() { return percentage; }
    public void setPercentage(double percentage) { this.percentage = percentage; }
}
