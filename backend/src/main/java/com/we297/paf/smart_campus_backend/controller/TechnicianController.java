package com.we297.paf.smart_campus_backend.controller;

import com.we297.paf.smart_campus_backend.dto.CreateTechnicianRequest;
import com.we297.paf.smart_campus_backend.dto.TechnicianResponse;
import com.we297.paf.smart_campus_backend.service.TechnicianService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@CrossOrigin
public class TechnicianController {

    private final TechnicianService technicianService;

    public TechnicianController(TechnicianService technicianService) {
        this.technicianService = technicianService;
    }

    @PostMapping
    public ResponseEntity<TechnicianResponse> createTechnician(@Valid @RequestBody CreateTechnicianRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(technicianService.createTechnician(request));
    }

    @GetMapping
    public ResponseEntity<List<TechnicianResponse>> getAllTechnicians() {
        return ResponseEntity.ok(technicianService.getAllTechnicians());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TechnicianResponse> getTechnicianById(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.getTechnicianById(id));
    }
}
