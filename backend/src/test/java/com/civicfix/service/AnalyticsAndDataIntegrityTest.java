package com.civicfix.service;

import com.civicfix.dto.AnalyticsSummaryResponse;
import com.civicfix.dto.ComplaintResponse;
import com.civicfix.entity.ComplaintCategory;
import com.civicfix.entity.Complaint;
import com.civicfix.entity.User;
import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Role;
import com.civicfix.enums.Severity;
import com.civicfix.repository.ComplaintCategoryRepository;
import com.civicfix.repository.ComplaintRepository;
import com.civicfix.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

public class AnalyticsAndDataIntegrityTest {

    private AnalyticsService analyticsService;
    private ComplaintService complaintService;

    private List<Complaint> complaintStore;
    private List<User> userStore;
    private List<ComplaintCategory> categoryStore;

    private ComplaintRepository complaintRepository;
    private UserRepository userRepository;
    private ComplaintCategoryRepository categoryRepository;
    private AuthService authService;

    private User testCitizen;

    @BeforeEach
    void setUp() {
        complaintStore = new ArrayList<>();
        userStore = new ArrayList<>();
        categoryStore = new ArrayList<>();

        testCitizen = new User();
        testCitizen.setId(42L);
        testCitizen.setUsername("citizen_jane");
        testCitizen.setRole(Role.ROLE_CITIZEN);
        userStore.add(testCitizen);

        // Proxy for ComplaintRepository
        complaintRepository = (ComplaintRepository) Proxy.newProxyInstance(
                ComplaintRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("count".equals(name)) {
                        return (long) complaintStore.size();
                    } else if ("countByStatus".equals(name)) {
                        ComplaintStatus status = (ComplaintStatus) args[0];
                        return complaintStore.stream().filter(c -> c.getStatus() == status).count();
                    } else if ("countBySeverity".equals(name)) {
                        Severity severity = (Severity) args[0];
                        return complaintStore.stream().filter(c -> c.getSeverity() == severity).count();
                    } else if ("findResolvedComplaints".equals(name)) {
                        return complaintStore.stream()
                                .filter(c -> c.getStatus() == ComplaintStatus.RESOLVED 
                                        && c.getResolvedAt() != null 
                                        && c.getCreatedAt() != null)
                                .toList();
                    } else if ("findAll".equals(name)) {
                        if (args != null && args.length > 0 && args[0] instanceof Pageable) {
                            Pageable pageable = (Pageable) args[0];
                            int start = (int) pageable.getOffset();
                            int end = Math.min((start + pageable.getPageSize()), complaintStore.size());
                            List<Complaint> subList = start < complaintStore.size() ? complaintStore.subList(start, end) : Collections.emptyList();
                            return new PageImpl<>(subList, pageable, complaintStore.size());
                        }
                        return complaintStore;
                    } else if ("countByCitizen".equals(name)) {
                        User user = (User) args[0];
                        return complaintStore.stream().filter(c -> c.getCitizen() != null && c.getCitizen().getId().equals(user.getId())).count();
                    } else if ("countByCitizenAndStatus".equals(name)) {
                        User user = (User) args[0];
                        ComplaintStatus status = (ComplaintStatus) args[1];
                        return complaintStore.stream()
                                .filter(c -> c.getCitizen() != null 
                                        && c.getCitizen().getId().equals(user.getId()) 
                                        && c.getStatus() == status)
                                .count();
                    }
                    return null;
                }
        );

        // Proxy for UserRepository
        userRepository = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("countByRole".equals(name)) {
                        Role role = (Role) args[0];
                        return userStore.stream().filter(u -> u.getRole() == role).count();
                    } else if ("findById".equals(name)) {
                        Long id = (Long) args[0];
                        return userStore.stream().filter(u -> u.getId().equals(id)).findFirst();
                    }
                    return null;
                }
        );

        // Proxy for ComplaintCategoryRepository
        categoryRepository = (ComplaintCategoryRepository) Proxy.newProxyInstance(
                ComplaintCategoryRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintCategoryRepository.class},
                (proxy, method, args) -> {
                    if ("findAll".equals(method.getName())) {
                        return categoryStore;
                    }
                    return null;
                }
        );

        // Concrete AuthService subclass overriding getCurrentUser
        authService = new AuthService(null, null, null, null, null) {
            @Override
            public User getCurrentUser() {
                return testCitizen;
            }
        };

        analyticsService = new AnalyticsService(complaintRepository, categoryRepository, userRepository);

        complaintService = new ComplaintService(
                complaintRepository,
                categoryRepository,
                userRepository,
                null,
                null,
                null,
                null,
                null,
                null,
                authService,
                null,
                null
        );
    }

    @Test
    @DisplayName("Empty database returns zero counts, zero rate and non-negative avg hours")
    void testEmptyDatabaseSummary() {
        AnalyticsSummaryResponse summary = analyticsService.getSummary();

        assertNotNull(summary);
        assertEquals(0L, summary.getTotalComplaints());
        assertEquals(0L, summary.getSubmittedCount());
        assertEquals(0L, summary.getAssignedCount());
        assertEquals(0L, summary.getInProgressCount());
        assertEquals(0L, summary.getResolvedCount());
        assertEquals(0L, summary.getActiveUnderRepairCount());
        assertEquals(0.0, summary.getResolutionRate());
        assertEquals(0.0, summary.getAvgResolutionHours());
    }

    @Test
    @DisplayName("Active Under Repair accurately aggregates Assigned and In Progress complaints")
    void testActiveUnderRepairCalculation() {
        ComplaintCategory cat = new ComplaintCategory();
        cat.setName("Roads");

        Complaint c1 = new Complaint();
        c1.setStatus(ComplaintStatus.ASSIGNED);
        c1.setCategory(cat);

        Complaint c2 = new Complaint();
        c2.setStatus(ComplaintStatus.IN_PROGRESS);
        c2.setCategory(cat);

        Complaint c3 = new Complaint();
        c3.setStatus(ComplaintStatus.SUBMITTED);
        c3.setCategory(cat);

        complaintStore.addAll(List.of(c1, c2, c3));

        AnalyticsSummaryResponse summary = analyticsService.getSummary();

        assertEquals(3L, summary.getTotalComplaints());
        assertEquals(1L, summary.getAssignedCount());
        assertEquals(1L, summary.getInProgressCount());
        assertEquals(2L, summary.getActiveUnderRepairCount(), "Active under repair should be assigned (1) + inProgress (1) = 2");
    }

    @Test
    @DisplayName("Negative duration in flawed timestamps is ignored and never displays negative avg resolution time")
    void testNegativeResolutionTimeFilteredOut() {
        LocalDateTime now = LocalDateTime.now();
        ComplaintCategory cat = new ComplaintCategory();
        cat.setName("Sanitation");

        // Legitimate resolved complaint: created 24h ago, resolved now (duration = 24.0h)
        Complaint valid = new Complaint();
        valid.setStatus(ComplaintStatus.RESOLVED);
        valid.setCreatedAt(now.minusHours(24));
        valid.setResolvedAt(now);
        valid.setCategory(cat);

        // Corrupted complaint: resolvedAt is before createdAt (duration = -6h)
        Complaint flawed = new Complaint();
        flawed.setStatus(ComplaintStatus.RESOLVED);
        flawed.setCreatedAt(now);
        flawed.setResolvedAt(now.minusHours(6)); // negative duration!
        flawed.setCategory(cat);

        complaintStore.addAll(List.of(valid, flawed));

        AnalyticsSummaryResponse summary = analyticsService.getSummary();

        assertNotNull(summary);
        // The negative complaint must be ignored, so avg hours must equal 24.0 (not (24 - 6)/2 = 9.0)
        assertEquals(24.0, summary.getAvgResolutionHours(), 0.01);
        assertTrue(summary.getAvgResolutionHours() >= 0.0, "Avg resolution hours must never be negative");
    }

    @Test
    @DisplayName("My complaint summary returns accurate counts for authenticated citizen across pagination")
    void testMyComplaintSummary() {
        // Citizen has 7 complaints: 2 submitted, 2 assigned, 1 in-progress, 2 resolved
        for (int i = 0; i < 2; i++) {
            Complaint c = new Complaint();
            c.setCitizen(testCitizen);
            c.setStatus(ComplaintStatus.SUBMITTED);
            complaintStore.add(c);
        }
        for (int i = 0; i < 2; i++) {
            Complaint c = new Complaint();
            c.setCitizen(testCitizen);
            c.setStatus(ComplaintStatus.ASSIGNED);
            complaintStore.add(c);
        }
        Complaint inProg = new Complaint();
        inProg.setCitizen(testCitizen);
        inProg.setStatus(ComplaintStatus.IN_PROGRESS);
        complaintStore.add(inProg);

        for (int i = 0; i < 2; i++) {
            Complaint c = new Complaint();
            c.setCitizen(testCitizen);
            c.setStatus(ComplaintStatus.RESOLVED);
            complaintStore.add(c);
        }

        // Another citizen has 1 complaint
        User other = new User();
        other.setId(99L);
        Complaint otherComp = new Complaint();
        otherComp.setCitizen(other);
        otherComp.setStatus(ComplaintStatus.SUBMITTED);
        complaintStore.add(otherComp);

        Map<String, Long> mySummary = complaintService.getMyComplaintSummary();

        assertNotNull(mySummary);
        assertEquals(7L, mySummary.get("total"));
        assertEquals(2L, mySummary.get("submitted"));
        assertEquals(2L, mySummary.get("assigned"));
        assertEquals(1L, mySummary.get("inProgress"));
        assertEquals(2L, mySummary.get("resolved"));
        assertEquals(3L, mySummary.get("activeUnderRepair"), "Assigned (2) + inProgress (1) = 3");
    }
}
