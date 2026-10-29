package com.civicfix.repository;

import com.civicfix.entity.Complaint;
import com.civicfix.entity.ComplaintAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintAttachmentRepository extends JpaRepository<ComplaintAttachment, Long> {
    List<ComplaintAttachment> findByComplaintOrderByCreatedAtAsc(Complaint complaint);
}
