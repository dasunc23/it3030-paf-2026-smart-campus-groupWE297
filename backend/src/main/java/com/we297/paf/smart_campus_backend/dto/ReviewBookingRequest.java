package com.we297.paf.smart_campus_backend.dto;

import jakarta.validation.constraints.NotNull;

public class ReviewBookingRequest {

    @NotNull
    private Boolean approved;

    private String reason;

    public Boolean getApproved() {
        return approved;
    }

    public void setApproved(Boolean approved) {
        this.approved = approved;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}