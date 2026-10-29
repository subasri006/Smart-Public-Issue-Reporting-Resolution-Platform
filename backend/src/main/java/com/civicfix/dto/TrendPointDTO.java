package com.civicfix.dto;

public class TrendPointDTO {
    private String date; // YYYY-MM-DD
    private long submitted;
    private long resolved;

    public TrendPointDTO() {}

    public TrendPointDTO(String date, long submitted, long resolved) {
        this.date = date;
        this.submitted = submitted;
        this.resolved = resolved;
    }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }
    public long getSubmitted() { return submitted; }
    public void setSubmitted(long submitted) { this.submitted = submitted; }
    public long getResolved() { return resolved; }
    public void setResolved(long resolved) { this.resolved = resolved; }
}
