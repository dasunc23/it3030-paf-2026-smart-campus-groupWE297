package com.we205.paf.smart_campus_backend.dto;


import com.we205.paf.smart_campus_backend.entity.DamageClaim;
import com.we205.paf.smart_campus_backend.entity.enums.ClaimStatus;

import java.time.LocalDateTime;

public class ClaimResponse {
    private Long id;
    private String ticketId;
    private Double costEstimate;
    private ClaimStatus claimStatus;
    private String financeNotes;
    private String createdBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ClaimResponse fromClaim(DamageClaim claim) {
        ClaimResponse response = new ClaimResponse();
        response.setId(claim.getId());
        response.setTicketId(claim.getTicketId());
        response.setCostEstimate(claim.getCostEstimate());
        response.setClaimStatus(claim.getClaimStatus());
        response.setFinanceNotes(claim.getFinanceNotes());
        response.setCreatedBy(claim.getCreatedBy());
        response.setCreatedAt(claim.getCreatedAt());
        response.setUpdatedAt(claim.getUpdatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public Double getCostEstimate() {
        return costEstimate;
    }

    public void setCostEstimate(Double costEstimate) {
        this.costEstimate = costEstimate;
    }

    public ClaimStatus getClaimStatus() {
        return claimStatus;
    }

    public void setClaimStatus(ClaimStatus claimStatus) {
        this.claimStatus = claimStatus;
    }

    public String getFinanceNotes() {
        return financeNotes;
    }

    public void setFinanceNotes(String financeNotes) {
        this.financeNotes = financeNotes;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
