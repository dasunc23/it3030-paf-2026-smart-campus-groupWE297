package com.we297.paf.smart_campus_backend.dto;


import com.we297.paf.smart_campus_backend.entity.enums.AvailabilityStatus;
import com.we297.paf.smart_campus_backend.entity.enums.Specialization;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class CreateTechnicianRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Specialization is required")
    private Specialization specialization;

    @NotBlank(message = "Email is required")
    private String email;

    private AvailabilityStatus availabilityStatus = AvailabilityStatus.AVAILABLE;

    public CreateTechnicianRequest() {}

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public Specialization getSpecialization() {
        return specialization;
    }

    public void setSpecialization(Specialization specialization) {
        this.specialization = specialization;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}