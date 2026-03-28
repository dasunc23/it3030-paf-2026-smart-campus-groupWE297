package com.we297.paf.smart_campus_backend.service;

import com.we297.paf.smart_campus_backend.entity.Comment;
import com.we297.paf.smart_campus_backend.repository.CommentRepository;
import com.we297.paf.smart_campus_backend.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Fixed issues:
 * 1. updateComment() added — only the comment owner may edit their message
 * 2. deleteComment() now enforces ownership — owner OR admin may delete
 * 3. createComment() notifies the ticket owner when someone else posts a comment
 */
@Service
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final NotificationService notificationService;

    public CommentService(CommentRepository commentRepository,
                          TicketRepository ticketRepository,
                          NotificationService notificationService) {
        this.commentRepository = commentRepository;
        this.ticketRepository = ticketRepository;
        this.notificationService = notificationService;
    }

    /** Create a comment. Notifies the ticket owner if someone else posted. */
    public Comment createComment(Comment comment) {
        Comment saved = commentRepository.save(comment);

        // Notify ticket owner (unless the poster IS the owner)
        ticketRepository.findById(saved.getTicketId()).ifPresent(ticket -> {
            if (!ticket.getCreatedByUserId().equals(saved.getUserId())) {
                notificationService.createNotification(
                        ticket.getCreatedByUserId(),
                        "TICKET_COMMENT_ADDED",
                        "A new comment has been added to your ticket: \"" + ticket.getTitle() + "\".",
                        ticket.getId()
                );
            }
        });

        return saved;
    }

    public List<Comment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    /**
     * Edit a comment message. Only the original author may do this.
     *
     * @param commentId       the comment to edit
     * @param newMessage      the replacement text
     * @param requestingUserId the userId extracted from the JWT
     */
    public Comment updateComment(Long commentId, String newMessage, Long requestingUserId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));

        if (!comment.getUserId().equals(requestingUserId)) {
            throw new SecurityException("You can only edit your own comments");
        }
        if (newMessage == null || newMessage.isBlank()) {
            throw new IllegalArgumentException("Message cannot be empty");
        }

        comment.setMessage(newMessage.trim());
        return commentRepository.save(comment);
    }

    /**
     * Delete a comment. Allowed for the comment owner or any ADMIN.
     *
     * @param commentId       the comment to delete
     * @param requestingUserId the userId extracted from the JWT
     * @param roleName        the role name of the requesting user (e.g. "ROLE_ADMIN")
     */
    public void deleteComment(Long commentId, Long requestingUserId, String roleName) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("Comment not found: " + commentId));

        boolean isAdmin = "ROLE_ADMIN".equals(roleName);
        boolean isOwner = comment.getUserId().equals(requestingUserId);

        if (!isOwner && !isAdmin) {
            throw new SecurityException("You can only delete your own comments");
        }

        commentRepository.deleteById(commentId);
    }
}