package com.we297.paf.smart_campus_backend.service;

import com.we297.paf.smart_campus_backend.dto.CreateTechnicianRequest;
import com.we297.paf.smart_campus_backend.dto.TechnicianResponse;
import com.we297.paf.smart_campus_backend.entity.Technician;
import com.we297.paf.smart_campus_backend.entity.User;
import com.we297.paf.smart_campus_backend.entity.enums.Role;
import com.we297.paf.smart_campus_backend.repository.TechnicianRepository;
import com.we297.paf.smart_campus_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TechnicianService {

    private final TechnicianRepository technicianRepository;
    private final UserRepository userRepository;

    public TechnicianService(TechnicianRepository technicianRepository, UserRepository userRepository) {
        this.technicianRepository = technicianRepository;
        this.userRepository = userRepository;
    }

    public TechnicianResponse createTechnician(CreateTechnicianRequest request) {
        User user = Optional.ofNullable(request.getUserId())
                .flatMap(userRepository::findById)
                .orElseGet(() -> userRepository.findByEmail(request.getEmail())
                        .orElseThrow(() -> new RuntimeException(
                                "User not found with ID/Email")));
        
        if (user.getRole() != Role.ROLE_TECHNICIAN) {
            user.setRole(Role.ROLE_TECHNICIAN);
            userRepository.save(user);
        }

        if (technicianRepository.findByUserId(user.getId()).isPresent()) {
            throw new RuntimeException("Technician profile already exists for this user");
        }

        Technician tech = new Technician();
        tech.setUserId(user.getId());
        tech.setSpecialization(request.getSpecialization());
        tech.setAvailabilityStatus(request.getAvailabilityStatus());
        tech.setAssignedCount(0);
        tech.setCreatedAt(LocalDateTime.now());
        tech.setUpdatedAt(LocalDateTime.now());

        Technician saved = technicianRepository.save(tech);
        return TechnicianResponse.fromTechnician(saved, user.getName());
    }

    public List<TechnicianResponse> getAllTechnicians() {
        return technicianRepository.findAll().stream().map(tech -> {
            String userName = userRepository.findById(tech.getUserId()).map(User::getName).orElse("Unknown User");
            return TechnicianResponse.fromTechnician(tech, userName);
        }).collect(Collectors.toList());
    }

    public TechnicianResponse getTechnicianById(Long id) {
        Technician tech = technicianRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Technician not found: " + id));
        String userName = userRepository.findById(tech.getUserId()).map(User::getName).orElse("Unknown User");
        return TechnicianResponse.fromTechnician(tech, userName);
    }
}
