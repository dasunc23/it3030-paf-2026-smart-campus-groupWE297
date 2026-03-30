package com.we297.paf.smart_campus_backend.controller;


import com.we297.paf.smart_campus_backend.entity.AuditLog;
import com.we297.paf.smart_campus_backend.repository.AuditLogRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/audit", "/api/auditlogs"})
@CrossOrigin
public class AuditLogController {

    private final AuditLogRepository auditLogRepository;

    public AuditLogController(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    // ✅ Only Admins can view all logs (temporarily open to everyone)
    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAllByOrderByTimestampDesc();
    }

    // ✅ Filter logs by resource ID (temporarily open to everyone)
    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/byResource/{resourceId}")
    public List<AuditLog> getLogsByResource(@PathVariable String resourceId) {
        return auditLogRepository.findByResourceIdOrderByTimestampDesc(resourceId);
    }

    // ✅ Filter logs by username (temporarily open to everyone)
    // @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/byUser/{username}")
    public List<AuditLog> getLogsByUser(@PathVariable String username) {
        return auditLogRepository.findByPerformedByOrderByTimestampDesc(username);
    }
}
