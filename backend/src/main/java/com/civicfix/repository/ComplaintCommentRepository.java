package com.civicfix.repository;

import com.civicfix.entity.Complaint;
import com.civicfix.entity.ComplaintComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintCommentRepository extends JpaRepository<ComplaintComment, Long> {
    List<ComplaintComment> findByComplaintOrderByCreatedAtAsc(Complaint complaint);
    List<ComplaintComment> findByComplaintAndIsInternalFalseOrderByCreatedAtAsc(Complaint complaint);
}
