package com.civicfix.repository;

import com.civicfix.entity.Complaint;
import com.civicfix.entity.ComplaintAssignment;
import com.civicfix.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintAssignmentRepository extends JpaRepository<ComplaintAssignment, Long> {
    List<ComplaintAssignment> findByComplaintOrderByAssignedAtDesc(Complaint complaint);
    List<ComplaintAssignment> findByAssignedToOrderByAssignedAtDesc(User assignedTo);
}
