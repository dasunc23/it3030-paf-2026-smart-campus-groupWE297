package com.we297.paf.smart_campus_backend.service;


import com.we297.paf.smart_campus_backend.entity.AuditLog;
import com.we297.paf.smart_campus_backend.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;

    public AuditLogService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logAction(String action, Long resourceId, String performedBy, String details) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setResourceId(resourceId);
        log.setPerformedBy(performedBy);
        log.setTimestamp(LocalDateTime.now());
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
