package com.civicfix.service;

import com.civicfix.enums.ComplaintStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class WorkflowTransitionTest {

    @Test
    @DisplayName("SUBMITTED can only transition to ASSIGNED")
    void testSubmittedAllowedTransitions() {
        ComplaintStatus status = ComplaintStatus.SUBMITTED;

        assertTrue(status.canTransitionTo(ComplaintStatus.ASSIGNED));
        assertFalse(status.canTransitionTo(ComplaintStatus.IN_PROGRESS), "Cannot skip to IN_PROGRESS directly");
        assertFalse(status.canTransitionTo(ComplaintStatus.RESOLVED), "Cannot skip to RESOLVED directly");
        assertFalse(status.canTransitionTo(ComplaintStatus.REOPENED), "Cannot transition to REOPENED");
        assertFalse(status.canTransitionTo(ComplaintStatus.SUBMITTED), "Cannot transition to same status");
    }

    @Test
    @DisplayName("ASSIGNED can transition to IN_PROGRESS or reassigned")
    void testAssignedAllowedTransitions() {
        ComplaintStatus status = ComplaintStatus.ASSIGNED;

        assertTrue(status.canTransitionTo(ComplaintStatus.IN_PROGRESS));
        assertFalse(status.canTransitionTo(ComplaintStatus.RESOLVED), "Cannot resolve directly without IN_PROGRESS");
    }

    @Test
    @DisplayName("IN_PROGRESS can transition to RESOLVED")
    void testInProgressAllowedTransitions() {
        ComplaintStatus status = ComplaintStatus.IN_PROGRESS;

        assertTrue(status.canTransitionTo(ComplaintStatus.RESOLVED));
        assertFalse(status.canTransitionTo(ComplaintStatus.SUBMITTED));
        assertFalse(status.canTransitionTo(ComplaintStatus.REOPENED));
    }

    @Test
    @DisplayName("RESOLVED can only transition to REOPENED")
    void testResolvedAllowedTransitions() {
        ComplaintStatus status = ComplaintStatus.RESOLVED;

        assertTrue(status.canTransitionTo(ComplaintStatus.REOPENED));
        assertFalse(status.canTransitionTo(ComplaintStatus.IN_PROGRESS), "Must reopen first");
        assertFalse(status.canTransitionTo(ComplaintStatus.SUBMITTED));
    }

    @Test
    @DisplayName("REOPENED can transition to ASSIGNED or IN_PROGRESS")
    void testReopenedAllowedTransitions() {
        ComplaintStatus status = ComplaintStatus.REOPENED;

        assertTrue(status.canTransitionTo(ComplaintStatus.ASSIGNED));
        assertTrue(status.canTransitionTo(ComplaintStatus.IN_PROGRESS));
        assertFalse(status.canTransitionTo(ComplaintStatus.RESOLVED), "Must work on issue before resolving again");
    }
}
