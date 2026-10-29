package com.civicfix.dto;

public class AnalyticsSummaryResponse {
    private long totalComplaints;
    private long submittedCount;
    private long assignedCount;
    private long inProgressCount;
    private long activeUnderRepairCount;
    private long resolvedCount;
    private long reopenedCount;
    private long criticalCount;
    private long highCount;
    private double resolutionRate; // percentage 0-100
    private double avgResolutionHours;
    private long totalCitizens;
    private long totalStaff;

    public AnalyticsSummaryResponse() {}

    public long getTotalComplaints() { return totalComplaints; }
    public void setTotalComplaints(long totalComplaints) { this.totalComplaints = totalComplaints; }
    public long getSubmittedCount() { return submittedCount; }
    public void setSubmittedCount(long submittedCount) { this.submittedCount = submittedCount; }
    public long getAssignedCount() { return assignedCount; }
    public void setAssignedCount(long assignedCount) { this.assignedCount = assignedCount; }
    public long getInProgressCount() { return inProgressCount; }
    public void setInProgressCount(long inProgressCount) { this.inProgressCount = inProgressCount; }
    public long getActiveUnderRepairCount() { return activeUnderRepairCount; }
    public void setActiveUnderRepairCount(long activeUnderRepairCount) { this.activeUnderRepairCount = activeUnderRepairCount; }
    public long getResolvedCount() { return resolvedCount; }
    public void setResolvedCount(long resolvedCount) { this.resolvedCount = resolvedCount; }
    public long getReopenedCount() { return reopenedCount; }
    public void setReopenedCount(long reopenedCount) { this.reopenedCount = reopenedCount; }
    public long getCriticalCount() { return criticalCount; }
    public void setCriticalCount(long criticalCount) { this.criticalCount = criticalCount; }
    public long getHighCount() { return highCount; }
    public void setHighCount(long highCount) { this.highCount = highCount; }
    public double getResolutionRate() { return resolutionRate; }
    public void setResolutionRate(double resolutionRate) { this.resolutionRate = resolutionRate; }
    public double getAvgResolutionHours() { return avgResolutionHours; }
    public void setAvgResolutionHours(double avgResolutionHours) { this.avgResolutionHours = avgResolutionHours; }
    public long getTotalCitizens() { return totalCitizens; }
    public void setTotalCitizens(long totalCitizens) { this.totalCitizens = totalCitizens; }
    public long getTotalStaff() { return totalStaff; }
    public void setTotalStaff(long totalStaff) { this.totalStaff = totalStaff; }
}
