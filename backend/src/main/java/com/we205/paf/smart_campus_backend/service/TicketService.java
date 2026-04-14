package com.we205.paf.smart_campus_backend.service;

import com.we205.paf.smart_campus_backend.entity.Comment;
import com.we205.paf.smart_campus_backend.entity.Ticket;
import com.we205.paf.smart_campus_backend.entity.User;
import com.we205.paf.smart_campus_backend.entity.enums.Role;
import com.we205.paf.smart_campus_backend.entity.enums.TicketStatus;
import com.we205.paf.smart_campus_backend.repository.CommentRepository;
import com.we205.paf.smart_campus_backend.repository.TicketRepository;
import com.we205.paf.smart_campus_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public TicketService(TicketRepository ticketRepository,
                         CommentRepository commentRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    public Ticket createTicket(Ticket ticket, String email) {
        User user = resolveUser(email);
        ticket.setCreatedByUserId(user.getId());
        ticket.setStatus(TicketStatus.OPEN);
        return ticketRepository.save(ticket);
    }

    // ─── Read ─────────────────────────────────────────────────────────────────

    /** Admin sees all tickets; regular users see only their own. */
    public List<Ticket> getTickets(String email) {
        User user = resolveUser(email);
        if (isAdmin(user) || isTechnician(user)) {
            return ticketRepository.findAll();
        }
        return ticketRepository.findByCreatedByUserId(user.getId());
    }

    public Ticket getTicketById(Long id, String email) {
        User user = resolveUser(email);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
        if (!isAdmin(user) && !isTechnician(user) && !ticket.getCreatedByUserId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        return ticket;
    }

    // ─── Update status (workflow) ──────────────────────────────────────────────

    /**
     * Allowed transitions:
     *   OPEN -> IN_PROGRESS (ADMIN / TECHNICIAN)
     *   IN_PROGRESS -> RESOLVED (ADMIN / TECHNICIAN)
     *   RESOLVED -> CLOSED (ADMIN)
     *   Any -> REJECTED (ADMIN, with reason)
     */
    public Ticket updateStatus(Long id, TicketStatus newStatus, String rejectionReason, String email) {
        User user = resolveUser(email);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));

        if (!isAdmin(user) && !isTechnician(user)) {
            throw new SecurityException("Only Admins or Technicians can update ticket status");
        }

        validateTransition(ticket.getStatus(), newStatus);

        if (newStatus == TicketStatus.REJECTED) {
            if (rejectionReason == null || rejectionReason.isBlank()) {
                throw new IllegalArgumentException("Rejection reason is required");
            }
            ticket.setRejectionReason(rejectionReason);
        }

        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);

        // Notify ticket creator
        notificationService.createNotification(
                ticket.getCreatedByUserId(),
                "TICKET_STATUS_CHANGED",
                "Your ticket '" + ticket.getTitle() + "' is now " + newStatus.name()
                        + (rejectionReason != null ? ": " + rejectionReason : ""),
                ticket.getId()
        );

        return saved;
    }

    /** Technician adds resolution notes (only when IN_PROGRESS or RESOLVED). */
    public Ticket addResolutionNotes(Long id, String notes, String email) {
        User user = resolveUser(email);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));

        if (!isAdmin(user) && !isTechnician(user)) {
            throw new SecurityException("Only Admins or Technicians can add resolution notes");
        }
        ticket.setResolutionNotes(notes);
        return ticketRepository.save(ticket);
    }

    // ─── Assign ───────────────────────────────────────────────────────────────

    public Ticket assignTechnician(Long ticketId, Long technicianUserId, String email) {
        User admin = resolveUser(email);
        if (!isAdmin(admin)) {
            throw new SecurityException("Only Admins can assign technicians");
        }
        // Verify the target user exists and is a technician
        userRepository.findById(technicianUserId)
                .orElseThrow(() -> new IllegalArgumentException("Technician user not found: " + technicianUserId));

        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
        ticket.setAssignedToUserId(technicianUserId);
        return ticketRepository.save(ticket);
    }

    // ─── Delete ───────────────────────────────────────────────────────────────

    public void deleteTicket(Long id, String email) {
        User user = resolveUser(email);
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + id));
        if (!isAdmin(user) && !ticket.getCreatedByUserId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        ticketRepository.deleteById(id);
    }

    // ─── Comments ─────────────────────────────────────────────────────────────

    public List<Comment> getCommentsForTicket(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ROLE_ADMIN;
    }

    private boolean isTechnician(User user) {
        return user.getRole() == Role.ROLE_TECHNICIAN;
    }

    private void validateTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case OPEN -> next == TicketStatus.IN_PROGRESS || next == TicketStatus.REJECTED;
            case IN_PROGRESS -> next == TicketStatus.RESOLVED || next == TicketStatus.REJECTED;
            case RESOLVED -> next == TicketStatus.CLOSED || next == TicketStatus.REJECTED;
            case CLOSED, REJECTED -> false;
        };
        if (!valid) {
            throw new IllegalStateException("Invalid transition: " + current + " -> " + next);
        }
    }
}
