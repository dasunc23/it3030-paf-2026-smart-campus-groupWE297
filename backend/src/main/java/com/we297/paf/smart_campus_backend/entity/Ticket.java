package com.we297.paf.smart_campus_backend.entity;

import com.we297.paf.smart_campus_backend.entity.enums.TicketStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "tickets")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Ticket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    @Column(length = 2000)
    private String description;

    /** Category of incident, e.g. ELECTRICAL, PLUMBING, IT_EQUIPMENT, FURNITURE, OTHER */
    @NotBlank(message = "Category is required")
    private String category;

    /** Priority: LOW, MEDIUM, HIGH, CRITICAL */
    @NotBlank(message = "Priority is required")
    private String priority;

    /** Workflow status — enforced via TicketStatus enum */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TicketStatus status = TicketStatus.OPEN;

    /** Optional reason when Admin REJECTS a ticket */
    @Column(length = 1000)
    private String rejectionReason;

    /** Resolution notes added by technician/staff on RESOLVED */
    @Column(length = 2000)
    private String resolutionNotes;

    /** Resource or location the incident relates to */
    private Long resourceId;

    /** Preferred contact details provided by the reporter */
    private String preferredContact;

    /** User who created the ticket (stored as userId) */
    @NotNull(message = "Creator user ID is required")
    private Long createdByUserId;

    /** Technician/staff assigned to this ticket */
    private Long assignedToUserId;

    /** Up to 3 image attachment paths (stored after file upload) */
    private String image1;
    private String image2;
    private String image3;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}