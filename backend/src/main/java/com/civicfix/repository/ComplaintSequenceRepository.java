package com.civicfix.repository;

import com.civicfix.entity.ComplaintSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ComplaintSequenceRepository extends JpaRepository<ComplaintSequence, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM ComplaintSequence s WHERE s.sequenceKey = :key")
    Optional<ComplaintSequence> findBySequenceKeyForUpdate(@Param("key") String key);
}
