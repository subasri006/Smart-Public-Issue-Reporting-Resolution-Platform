package com.civicfix.repository;

import com.civicfix.entity.ComplaintCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ComplaintCategoryRepository extends JpaRepository<ComplaintCategory, Long> {

    List<ComplaintCategory> findByActiveTrueOrderByNameAsc();

    Optional<ComplaintCategory> findByCode(String code);

    Boolean existsByNameIgnoreCase(String name);

    Boolean existsByCodeIgnoreCase(String code);
}
