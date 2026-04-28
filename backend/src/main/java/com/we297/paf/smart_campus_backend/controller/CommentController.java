package com.we297.paf.smart_campus_backend.controller;

import com.we297.paf.smart_campus_backend.entity.Comment;
import com.we297.paf.smart_campus_backend.entity.User;
import com.we297.paf.smart_campus_backend.repository.UserRepository;
import com.we297.paf.smart_campus_backend.service.CommentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Fixed issues:
 * 1. Base path changed from /comments → /api/comments (consistent with all other endpoints)
 * 2. All endpoints now require authentication via @AuthenticationPrincipal
 * 3. POST: userId is derived from the JWT token, not accepted from the client (security fix)
 * 4. PUT: new endpoint to edit a comment — only the owner may edit
 * 5. DELETE: now enforces ownership — only the comment owner OR an admin may delete
 */
@RestController
@RequestMapping("/api/comments")
@CrossOrigin
public class CommentController {

    private final CommentService commentService;
    private final UserRepository userRepository;

    public CommentController(CommentService commentService, UserRepository userRepository) {
        this.commentService = commentService;
        this.userRepository = userRepository;
    }

    /** POST /api/comments — Add a comment to a ticket.
     *  userId is taken from the authenticated JWT — the client must NOT send it. */
    @PostMapping
    public ResponseEntity<?> createComment(@RequestBody Comment comment,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = resolveUser(userDetails.getUsername());
        // Fix: set userId from the authenticated session, not from the request body
        comment.setUserId(user.getId());
        try {
            Comment saved = commentService.createComment(comment);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/comments/ticket/{ticketId} — List comments for a ticket */
    @GetMapping("/ticket/{ticketId}")
    public ResponseEntity<?> getCommentsByTicketId(@PathVariable Long ticketId,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(commentService.getCommentsByTicketId(ticketId));
    }

    /** PUT /api/comments/{id} — Edit own comment.
     *  Body: { "message": "updated text" } */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateComment(@PathVariable Long id,
                                           @RequestBody Map<String, String> body,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = resolveUser(userDetails.getUsername());
        String newMessage = body.get("message");
        if (newMessage == null || newMessage.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message cannot be empty"));
        }
        try {
            Comment updated = commentService.updateComment(id, newMessage, user.getId());
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /api/comments/{id} — Owner or Admin may delete a comment */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = resolveUser(userDetails.getUsername());
        try {
            commentService.deleteComment(id, user.getId(), user.getRole().name());
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }
}