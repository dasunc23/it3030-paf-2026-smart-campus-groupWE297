package com.we297.paf.smart_campus_backend.entity;

import com.we297.paf.smart_campus_backend.entity.enums.ClaimStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "damage_claims")
@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DamageClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ticketId;

    @Column(nullable = false)
    private Double costEstimate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus claimStatus;

    @Column(length = 1000)
    private String financeNotes;

    @Column(nullable = false)
    private String createdBy; // Admin who filed the claim

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;
}