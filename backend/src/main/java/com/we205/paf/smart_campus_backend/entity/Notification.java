package com.we205.paf.smart_campus_backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** The user who should receive this notification */
    @Column(nullable = false)
    private Long userId;

    /**
     * Type of event that triggered this notification.
     * E.g. BOOKING_APPROVED, BOOKING_REJECTED, BOOKING_CANCELLED,
     *      TICKET_STATUS_CHANGED, TICKET_COMMENT_ADDED
     */
    @Column(nullable = false)
    private String type;

    @Column(nullable = false, length = 500)
    private String message;

    /** Reference to the related entity (bookingId or ticketId) */
    private Long referenceId;

    /** Whether the user has seen/read this notification */
    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
