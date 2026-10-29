package com.civicfix.repository;

import com.civicfix.entity.Complaint;
import com.civicfix.entity.User;
import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {

    Optional<Complaint> findByReferenceId(String referenceId);

    Boolean existsByReferenceId(String referenceId);

    @Query("SELECT c.referenceId FROM Complaint c WHERE c.referenceId LIKE CONCAT(:prefix, '-%')")
    List<String> findReferenceIdsByPrefix(@Param("prefix") String prefix);

    Page<Complaint> findByCitizenOrderByCreatedAtDesc(User citizen, Pageable pageable);

    Page<Complaint> findByAssignedStaffOrderByCreatedAtDesc(User assignedStaff, Pageable pageable);

    @Query("SELECT c FROM Complaint c WHERE " +
           "(:citizenId IS NULL OR c.citizen.id = :citizenId) AND " +
           "(:assignedStaffId IS NULL OR (c.assignedStaff IS NOT NULL AND c.assignedStaff.id = :assignedStaffId)) AND " +
           "(:categoryId IS NULL OR c.category.id = :categoryId) AND " +
           "(:status IS NULL OR c.status = :status) AND " +
           "(:severity IS NULL OR c.severity = :severity) AND " +
           "(:search IS NULL OR (" +
           "   LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "   LOWER(c.referenceId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "   LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "   LOWER(c.address) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "   LOWER(c.landmark) LIKE LOWER(CONCAT('%', :search, '%'))" +
           "))")
    Page<Complaint> filterComplaints(
            @Param("citizenId") Long citizenId,
            @Param("assignedStaffId") Long assignedStaffId,
            @Param("categoryId") Long categoryId,
            @Param("status") ComplaintStatus status,
            @Param("severity") Severity severity,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT c FROM Complaint c WHERE c.latitude IS NOT NULL AND c.longitude IS NOT NULL ORDER BY c.createdAt DESC")
    List<Complaint> findAllWithCoordinates();

    // Candidate complaints for duplicate detection within time window
    @Query("SELECT c FROM Complaint c WHERE c.createdAt >= :sinceDate AND c.status != 'RESOLVED'")
    List<Complaint> findCandidatesForDuplicateDetection(@Param("sinceDate") LocalDateTime sinceDate);

    long countByCitizen(User citizen);

    long countByCitizenAndStatus(User citizen, ComplaintStatus status);

    long countByStatus(ComplaintStatus status);

    long countBySeverity(Severity severity);

    long countByAssignedStaff(User assignedStaff);

    long countByAssignedStaffAndStatus(User assignedStaff, ComplaintStatus status);

    @Query("SELECT c.category.name, COUNT(c) FROM Complaint c GROUP BY c.category.name ORDER BY COUNT(c) DESC")
    List<Object[]> countComplaintsByCategory();

    @Query("SELECT c.status, COUNT(c) FROM Complaint c GROUP BY c.status")
    List<Object[]> countComplaintsByStatus();

    @Query("SELECT c.severity, COUNT(c) FROM Complaint c GROUP BY c.severity")
    List<Object[]> countComplaintsBySeverity();

    @Query("SELECT COALESCE(c.landmark, 'Unspecified'), COUNT(c) FROM Complaint c GROUP BY c.landmark ORDER BY COUNT(c) DESC")
    List<Object[]> countComplaintsByArea();

    @Query("SELECT c FROM Complaint c WHERE c.status = 'RESOLVED' AND c.resolvedAt IS NOT NULL AND c.createdAt IS NOT NULL")
    List<Complaint> findResolvedComplaints();
}
