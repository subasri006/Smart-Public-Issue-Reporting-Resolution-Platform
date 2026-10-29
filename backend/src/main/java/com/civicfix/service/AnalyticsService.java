package com.civicfix.service;

import com.civicfix.dto.*;
import com.civicfix.entity.Complaint;
import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Role;
import com.civicfix.enums.Severity;
import com.civicfix.repository.ComplaintCategoryRepository;
import com.civicfix.repository.ComplaintRepository;
import com.civicfix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private static final Logger logger = LoggerFactory.getLogger(AnalyticsService.class);

    private final ComplaintRepository complaintRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public AnalyticsService(ComplaintRepository complaintRepository,
                            ComplaintCategoryRepository categoryRepository,
                            UserRepository userRepository) {
        this.complaintRepository = complaintRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsSummaryResponse getSummary() {
        long total = complaintRepository.count();
        long submitted = complaintRepository.countByStatus(ComplaintStatus.SUBMITTED);
        long assigned = complaintRepository.countByStatus(ComplaintStatus.ASSIGNED);
        long inProgress = complaintRepository.countByStatus(ComplaintStatus.IN_PROGRESS);
        long resolved = complaintRepository.countByStatus(ComplaintStatus.RESOLVED);
        long reopened = complaintRepository.countByStatus(ComplaintStatus.REOPENED);

        long critical = complaintRepository.countBySeverity(Severity.CRITICAL);
        long high = complaintRepository.countBySeverity(Severity.HIGH);

        double resolutionRate = total > 0 ? ((double) resolved / (double) total) * 100.0 : 0.0;

        // Calculate average resolution time in hours
        List<Complaint> resolvedList = complaintRepository.findResolvedComplaints();
        double avgResolutionHours = 0.0;
        int validResolvedCount = 0;
        if (!resolvedList.isEmpty()) {
            long totalHours = 0;
            for (Complaint c : resolvedList) {
                if (c.getCreatedAt() != null && c.getResolvedAt() != null) {
                    long hours = Duration.between(c.getCreatedAt(), c.getResolvedAt()).toHours();
                    if (hours >= 0) {
                        totalHours += hours;
                        validResolvedCount++;
                    } else {
                        logger.warn("Skipping complaint {} from resolution time calculation due to invalid negative duration (created: {}, resolved: {})",
                                c.getReferenceId(), c.getCreatedAt(), c.getResolvedAt());
                    }
                }
            }
            if (validResolvedCount > 0) {
                avgResolutionHours = (double) totalHours / (double) validResolvedCount;
            }
        }

        long totalCitizens = userRepository.countByRole(Role.ROLE_CITIZEN);
        long totalStaff = userRepository.countByRole(Role.ROLE_STAFF);

        AnalyticsSummaryResponse summary = new AnalyticsSummaryResponse();
        summary.setTotalComplaints(total);
        summary.setSubmittedCount(submitted);
        summary.setAssignedCount(assigned);
        summary.setInProgressCount(inProgress);
        summary.setActiveUnderRepairCount(assigned + inProgress);
        summary.setResolvedCount(resolved);
        summary.setReopenedCount(reopened);
        summary.setCriticalCount(critical);
        summary.setHighCount(high);
        summary.setResolutionRate(Math.round(resolutionRate * 10.0) / 10.0);
        summary.setAvgResolutionHours(Math.max(0.0, Math.round(avgResolutionHours * 10.0) / 10.0));
        summary.setTotalCitizens(totalCitizens);
        summary.setTotalStaff(totalStaff);

        return summary;
    }

    @Transactional(readOnly = true)
    public List<CategoryStatDTO> getCategoryStats() {
        long total = complaintRepository.count();
        List<Object[]> rows = complaintRepository.countComplaintsByCategory();
        List<CategoryStatDTO> list = new ArrayList<>();

        for (Object[] row : rows) {
            String category = (String) row[0];
            long count = ((Number) row[1]).longValue();
            double pct = total > 0 ? ((double) count / (double) total) * 100.0 : 0.0;
            list.add(new CategoryStatDTO(category, count, Math.round(pct * 10.0) / 10.0));
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<StatusStatDTO> getStatusStats() {
        long total = complaintRepository.count();
        List<Object[]> rows = complaintRepository.countComplaintsByStatus();
        Map<ComplaintStatus, Long> counts = new EnumMap<>(ComplaintStatus.class);

        for (Object[] row : rows) {
            ComplaintStatus status = (ComplaintStatus) row[0];
            long count = ((Number) row[1]).longValue();
            counts.put(status, count);
        }

        List<StatusStatDTO> list = new ArrayList<>();
        for (ComplaintStatus status : ComplaintStatus.values()) {
            long count = counts.getOrDefault(status, 0L);
            double pct = total > 0 ? ((double) count / (double) total) * 100.0 : 0.0;
            list.add(new StatusStatDTO(status, formatStatusLabel(status), count, Math.round(pct * 10.0) / 10.0));
        }

        return list;
    }

    @Transactional(readOnly = true)
    public List<TrendPointDTO> getTrends(int days) {
        int windowDays = (days > 0 && days <= 90) ? days : 14;
        LocalDate startDate = LocalDate.now().minusDays(windowDays - 1);
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        List<Complaint> allComplaints = complaintRepository.findAll();

        Map<String, Long> submittedMap = new HashMap<>();
        Map<String, Long> resolvedMap = new HashMap<>();

        for (Complaint c : allComplaints) {
            if (c.getCreatedAt() != null) {
                LocalDate createdDate = c.getCreatedAt().toLocalDate();
                if (!createdDate.isBefore(startDate)) {
                    String dateKey = createdDate.format(formatter);
                    submittedMap.put(dateKey, submittedMap.getOrDefault(dateKey, 0L) + 1);
                }
            }
            if (c.getResolvedAt() != null) {
                LocalDate resolvedDate = c.getResolvedAt().toLocalDate();
                if (!resolvedDate.isBefore(startDate)) {
                    String dateKey = resolvedDate.format(formatter);
                    resolvedMap.put(dateKey, resolvedMap.getOrDefault(dateKey, 0L) + 1);
                }
            }
        }

        List<TrendPointDTO> trendPoints = new ArrayList<>();
        for (int i = 0; i < windowDays; i++) {
            LocalDate d = startDate.plusDays(i);
            String dateKey = d.format(formatter);
            trendPoints.add(new TrendPointDTO(
                    dateKey,
                    submittedMap.getOrDefault(dateKey, 0L),
                    resolvedMap.getOrDefault(dateKey, 0L)
            ));
        }

        return trendPoints;
    }

    @Transactional(readOnly = true)
    public List<AreaStatDTO> getAreaStats() {
        List<Object[]> rows = complaintRepository.countComplaintsByArea();
        List<AreaStatDTO> list = new ArrayList<>();
        for (Object[] row : rows) {
            String area = row[0] != null ? row[0].toString() : "Unknown";
            long count = ((Number) row[1]).longValue();
            list.add(new AreaStatDTO(area, count));
        }
        return list;
    }

    @Transactional(readOnly = true)
    public byte[] exportComplaintsCsv() {
        List<Complaint> complaints = complaintRepository.findAll();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(out, true, StandardCharsets.UTF_8);

        // Header
        writer.println("Reference ID,Title,Category,Severity,Status,Priority Score,Citizen Name,Assigned Staff,Address,Landmark,Latitude,Longitude,Created At,Resolved At");

        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

        for (Complaint c : complaints) {
            StringBuilder sb = new StringBuilder();
            sb.append(escapeCsv(c.getReferenceId())).append(",");
            sb.append(escapeCsv(c.getTitle())).append(",");
            sb.append(escapeCsv(c.getCategory().getName())).append(",");
            sb.append(c.getSeverity().name()).append(",");
            sb.append(c.getStatus().name()).append(",");
            sb.append(c.getPriorityScore()).append(",");
            sb.append(escapeCsv(c.getCitizen().getFullName())).append(",");
            sb.append(c.getAssignedStaff() != null ? escapeCsv(c.getAssignedStaff().getFullName()) : "Unassigned").append(",");
            sb.append(escapeCsv(c.getAddress())).append(",");
            sb.append(escapeCsv(c.getLandmark())).append(",");
            sb.append(c.getLatitude() != null ? c.getLatitude() : "").append(",");
            sb.append(c.getLongitude() != null ? c.getLongitude() : "").append(",");
            sb.append(c.getCreatedAt() != null ? c.getCreatedAt().format(dtf) : "").append(",");
            sb.append(c.getResolvedAt() != null ? c.getResolvedAt().format(dtf) : "");
            writer.println(sb.toString());
        }

        writer.flush();
        return out.toByteArray();
    }

    private String escapeCsv(String text) {
        if (text == null) return "\"\"";
        String escaped = text.replace("\"", "\"\"");
        return "\"" + escaped + "\"";
    }

    private String formatStatusLabel(ComplaintStatus status) {
        return switch (status) {
            case SUBMITTED -> "Submitted";
            case ASSIGNED -> "Assigned";
            case IN_PROGRESS -> "In Progress";
            case RESOLVED -> "Resolved";
            case REOPENED -> "Reopened";
        };
    }
}
