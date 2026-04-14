package com.we205.paf.smart_campus_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String action;       // e.g. ADD_RESOURCE, UPDATE_STATUS, DELETE_RESOURCE

    @Column(nullable = false)
    private Long resourceId;   // which resource was affected

    @Column(nullable = false)
    private String performedBy;  // username or role (Admin/User)

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 1000)
    private String details;      // extra info (e.g. "Marked projector as OUT_OF_SERVICE")
}
