package com.civicfix.repository;

import com.civicfix.entity.Complaint;
import com.civicfix.entity.ComplaintStatusHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintStatusHistoryRepository extends JpaRepository<ComplaintStatusHistory, Long> {
    List<ComplaintStatusHistory> findByComplaintOrderByCreatedAtAsc(Complaint complaint);
}
