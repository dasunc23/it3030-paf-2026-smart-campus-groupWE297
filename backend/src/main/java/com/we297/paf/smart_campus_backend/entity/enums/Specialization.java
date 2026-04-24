package com.we297.paf.smart_campus_backend.entity.enums;

/**
 * Technician specialization areas. Kept separate from ResourceType
 * to avoid misuse of the resource-catalogue enum for staff records.
 */
public enum Specialization {
    HARDWARE,
    NETWORK,
    FACILITY,
    ELECTRICAL,
    SOFTWARE,
    OTHER
}
