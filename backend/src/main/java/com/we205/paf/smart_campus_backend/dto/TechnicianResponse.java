package com.we205.paf.smart_campus_backend.dto;


import com.we205.paf.smart_campus_backend.entity.Technician;
import com.we205.paf.smart_campus_backend.entity.enums.AvailabilityStatus;
import com.we205.paf.smart_campus_backend.entity.enums.Specialization;

public class TechnicianResponse {

    private Long id;
    private Long userId; // Could expand this to include User's name directly later
    private String name; // Aggregated from User collection
    private Specialization specialization;
    private AvailabilityStatus availabilityStatus;
    private int assignedCount;

    public TechnicianResponse() {}

    public static TechnicianResponse fromTechnician(Technician technician, String userName) {
        TechnicianResponse response = new TechnicianResponse();
        response.setId(technician.getId());
        response.setUserId(technician.getUserId());
        response.setName(userName);
        response.setSpecialization(technician.getSpecialization());
        response.setAvailabilityStatus(technician.getAvailabilityStatus());
        response.setAssignedCount(technician.getAssignedCount());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Specialization getSpecialization() {
        return specialization;
    }

    public void setSpecialization(Specialization specialization) {
        this.specialization = specialization;
    }

    public AvailabilityStatus getAvailabilityStatus() {
        return availabilityStatus;
    }

    public void setAvailabilityStatus(AvailabilityStatus availabilityStatus) {
        this.availabilityStatus = availabilityStatus;
    }

    public int getAssignedCount() {
        return assignedCount;
    }

    public void setAssignedCount(int assignedCount) {
        this.assignedCount = assignedCount;
    }
}
