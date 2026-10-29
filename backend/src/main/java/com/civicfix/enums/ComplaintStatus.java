package com.civicfix.enums;

import java.util.Collections;
import java.util.EnumSet;
import java.util.Set;

public enum ComplaintStatus {
    SUBMITTED,
    ASSIGNED,
    IN_PROGRESS,
    RESOLVED,
    REOPENED;

    public boolean canTransitionTo(ComplaintStatus next) {
        if (this == next) {
            return false;
        }
        return switch (this) {
            case SUBMITTED -> next == ASSIGNED;
            case ASSIGNED -> next == IN_PROGRESS || next == ASSIGNED;
            case IN_PROGRESS -> next == RESOLVED;
            case RESOLVED -> next == REOPENED;
            case REOPENED -> next == ASSIGNED || next == IN_PROGRESS;
        };
    }

    public Set<ComplaintStatus> getAllowedNextStatuses() {
        return switch (this) {
            case SUBMITTED -> EnumSet.of(ASSIGNED);
            case ASSIGNED -> EnumSet.of(IN_PROGRESS);
            case IN_PROGRESS -> EnumSet.of(RESOLVED);
            case RESOLVED -> EnumSet.of(REOPENED);
            case REOPENED -> EnumSet.of(ASSIGNED, IN_PROGRESS);
        };
    }
}
