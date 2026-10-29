package com.civicfix.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Entity for persisting sequential counters used to generate human-readable,
 * concurrency-safe reference IDs across application restarts and cluster nodes.
 */
@Entity
@Table(name = "complaint_sequences")
public class ComplaintSequence {

    @Id
    @Column(name = "sequence_key", length = 30)
    private String sequenceKey; // e.g. "CF-2026-10"

    @Column(name = "current_value", nullable = false)
    private Long currentValue;

    public ComplaintSequence() {
    }

    public ComplaintSequence(String sequenceKey, Long currentValue) {
        this.sequenceKey = sequenceKey;
        this.currentValue = currentValue;
    }

    public String getSequenceKey() {
        return sequenceKey;
    }

    public void setSequenceKey(String sequenceKey) {
        this.sequenceKey = sequenceKey;
    }

    public Long getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Long currentValue) {
        this.currentValue = currentValue;
    }
}
