package com.we297.paf.smart_campus_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Ticket ID is required")
    private Long ticketId;

    /** The user who posted this comment */
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Message cannot be empty")
    @Column(length = 1000)
    private String message;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    /** Required so that edit (PUT) is meaningful */
    @LastModifiedDate
    private LocalDateTime updatedAt;
}