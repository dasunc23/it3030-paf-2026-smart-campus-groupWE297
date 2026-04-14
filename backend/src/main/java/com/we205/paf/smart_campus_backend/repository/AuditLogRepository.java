package com.we205.paf.smart_campus_backend.repository;

import com.we205.paf.smart_campus_backend.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    List<AuditLog> findAllByOrderByTimestampDesc();
    List<AuditLog> findByResourceIdOrderByTimestampDesc(String resourceId);
    List<AuditLog> findByPerformedByOrderByTimestampDesc(String performedBy);
}
