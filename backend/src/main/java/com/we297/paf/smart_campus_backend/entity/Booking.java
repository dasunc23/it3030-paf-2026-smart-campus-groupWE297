package com.we297.paf.smart_campus_backend.entity;

import com.we297.paf.smart_campus_backend.entity.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long resourceId;

    @Column(nullable = false)
    private LocalDate bookingDate;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;

    @Column(length = 500)
    private String purpose;

    private Integer expectedAttendees;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status;

    @Column(nullable = false)
    private Long requestedByUserId;

    @Column(nullable = false)
    private String requestedByEmail;

    @Column(nullable = false)
    private LocalDateTime requestedAt;

    @Column(length = 500)
    private String reviewReason;

    private String reviewedBy;

    private LocalDateTime reviewedAt;

    @Column(length = 500)
    private String cancellationReason;

    private LocalDateTime cancelledAt;
}