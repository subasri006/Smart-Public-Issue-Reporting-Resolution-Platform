package com.civicfix.controller;

import com.civicfix.dto.*;
import com.civicfix.service.AnalyticsService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<AnalyticsSummaryResponse>> getSummary() {
        AnalyticsSummaryResponse summary = analyticsService.getSummary();
        return ResponseEntity.ok(ApiResponse.ok(summary));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryStatDTO>>> getCategoryStats() {
        List<CategoryStatDTO> stats = analyticsService.getCategoryStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/status")
    public ResponseEntity<ApiResponse<List<StatusStatDTO>>> getStatusStats() {
        List<StatusStatDTO> stats = analyticsService.getStatusStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<List<TrendPointDTO>>> getTrends(
            @RequestParam(defaultValue = "14") int days
    ) {
        List<TrendPointDTO> trends = analyticsService.getTrends(days);
        return ResponseEntity.ok(ApiResponse.ok(trends));
    }

    @GetMapping("/areas")
    public ResponseEntity<ApiResponse<List<AreaStatDTO>>> getAreaStats() {
        List<AreaStatDTO> stats = analyticsService.getAreaStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('STAFF', 'ADMIN')")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csvData = analyticsService.exportComplaintsCsv();

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"civicfix_complaints_report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvData);
    }
}
