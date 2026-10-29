package com.civicfix.enums;

public enum Severity {
    LOW(10),
    MEDIUM(25),
    HIGH(50),
    CRITICAL(80);

    private final int defaultWeight;

    Severity(int defaultWeight) {
        this.defaultWeight = defaultWeight;
    }

    public int getDefaultWeight() {
        return defaultWeight;
    }
}
