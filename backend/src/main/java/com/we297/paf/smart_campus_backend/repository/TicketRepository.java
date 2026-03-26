package com.we297.paf.smart_campus_backend.repository;

import com.we297.paf.smart_campus_backend.entity.Ticket;
import com.we297.paf.smart_campus_backend.entity.enums.TicketStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, Long> {

    List<Ticket> findByCreatedByUserId(Long userId);

    List<Ticket> findByAssignedToUserId(Long userId);

    List<Ticket> findByStatus(TicketStatus status);

    List<Ticket> findByCreatedByUserIdAndStatus(Long userId, TicketStatus status);
}