package com.we297.paf.smart_campus_backend.service;

import com.we297.paf.smart_campus_backend.entity.Comment;
import com.we297.paf.smart_campus_backend.entity.Ticket;
import com.we297.paf.smart_campus_backend.repository.CommentRepository;
import com.we297.paf.smart_campus_backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;

    public TicketService(TicketRepository ticketRepository, CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    public Ticket createTicket(Ticket ticket) {
        return ticketRepository.save(ticket);
    }

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id).orElse(null);
    }

    public Ticket updateTicket(Long id, Ticket updatedTicket) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        ticket.setTitle(updatedTicket.getTitle());
        ticket.setDescription(updatedTicket.getDescription());
        ticket.setStatus(updatedTicket.getStatus());
        return ticketRepository.save(ticket);
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    public Ticket assignTechnician(Long id, String technician) {
        Ticket ticket = ticketRepository.findById(id).orElseThrow();
        ticket.setAssignedTo(technician);
        return ticketRepository.save(ticket);
    }

    public List<Comment> getCommentsForTicket(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }
}