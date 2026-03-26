package com.we297.paf.smart_campus_backend.repository;

import com.we297.paf.smart_campus_backend.entity.Technician;
import com.we297.paf.smart_campus_backend.entity.enums.AvailabilityStatus;
import com.we297.paf.smart_campus_backend.entity.enums.Specialization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TechnicianRepository extends JpaRepository<Technician, Long> {
    Optional<Technician> findByUserId(Long userId);
    List<Technician> findBySpecialization(Specialization specialization);
    List<Technician> findByAvailabilityStatus(AvailabilityStatus status);
}