package com.we297.paf.smart_campus_backend.controller;

import com.we297.paf.smart_campus_backend.entity.Comment;
import com.we297.paf.smart_campus_backend.entity.Ticket;
import com.we297.paf.smart_campus_backend.entity.enums.TicketStatus;
import com.we297.paf.smart_campus_backend.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Fixed issues:
 * 1. POST /api/tickets now accepts multipart/form-data with up to 3 real image files
 *    — images are saved to /uploads/ and the stored paths are set on the ticket entity
 * 2. All comment endpoints consolidated here; comments now require auth
 * 3. Status transitions correctly reject invalid moves
 */
@RestController
@RequestMapping("/api/tickets")
@CrossOrigin
public class TicketController {

    private final TicketService ticketService;

    // Upload directory — served statically by Spring Boot under /uploads/**
    private static final String UPLOAD_DIR = "uploads/";

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
        // Ensure the upload directory exists on startup
        try {
            Files.createDirectories(Paths.get(UPLOAD_DIR));
        } catch (IOException e) {
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    /**
     * POST /api/tickets — Create a new incident ticket with optional image attachments.
     *
     * Accepts multipart/form-data:
     *   title, description, priority, category, preferredContact  (text parts)
     *   image1, image2, image3                                     (file parts, optional)
     */
    @PostMapping
    public ResponseEntity<?> createTicket(
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("priority") String priority,
            @RequestParam("category") String category,
            @RequestParam(value = "preferredContact", required = false) String preferredContact,
            @RequestParam(value = "resourceId", required = false) Long resourceId,
            @RequestParam(value = "image1", required = false) MultipartFile image1,
            @RequestParam(value = "image2", required = false) MultipartFile image2,
            @RequestParam(value = "image3", required = false) MultipartFile image3,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();

        try {
            Ticket ticket = new Ticket();
            ticket.setTitle(title);
            ticket.setDescription(description);
            ticket.setPriority(priority);
            ticket.setCategory(category);
            ticket.setPreferredContact(preferredContact);
            ticket.setResourceId(resourceId);

            // Save uploaded images and store their public URLs
            ticket.setImage1(saveFile(image1));
            ticket.setImage2(saveFile(image2));
            ticket.setImage3(saveFile(image3));

            Ticket created = ticketService.createTicket(ticket, userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Image upload failed: " + e.getMessage()));
        }
    }

    /** GET /api/tickets — Admin/Technician: all; User: own */
    @GetMapping
    public ResponseEntity<?> getTickets(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(ticketService.getTickets(userDetails.getUsername()));
    }

    /** GET /api/tickets/{id} */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            return ResponseEntity.ok(ticketService.getTicketById(id, userDetails.getUsername()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PATCH /api/tickets/{id}/status
     * Body: { "status": "IN_PROGRESS", "rejectionReason": "optional" }
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestBody Map<String, String> body,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            String rawStatus = body.get("status");
            if (rawStatus == null || rawStatus.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "status is required"));
            }
            TicketStatus newStatus = TicketStatus.valueOf(rawStatus.toUpperCase());
            String reason = body.get("rejectionReason");
            Ticket updated = ticketService.updateStatus(id, newStatus, reason, userDetails.getUsername());
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", e.getMessage()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PATCH /api/tickets/{id}/resolution
     * Body: { "resolutionNotes": "..." }
     */
    @PatchMapping("/{id}/resolution")
    public ResponseEntity<?> addResolutionNotes(@PathVariable Long id,
                                                @RequestBody Map<String, String> body,
                                                @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            String notes = body.get("resolutionNotes");
            return ResponseEntity.ok(ticketService.addResolutionNotes(id, notes, userDetails.getUsername()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PATCH /api/tickets/{id}/assign
     * Body: { "technicianUserId": 5 }
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignTechnician(@PathVariable Long id,
                                              @RequestBody Map<String, Long> body,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            Long techId = body.get("technicianUserId");
            if (techId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "technicianUserId is required"));
            }
            return ResponseEntity.ok(ticketService.assignTechnician(id, techId, userDetails.getUsername()));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** DELETE /api/tickets/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Long id,
                                          @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        try {
            ticketService.deleteTicket(id, userDetails.getUsername());
            return ResponseEntity.noContent().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** GET /api/tickets/{id}/comments */
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long id,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        return ResponseEntity.ok(ticketService.getCommentsForTicket(id));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    /**
     * Save an uploaded file to the uploads/ directory.
     * Returns the public URL path (e.g. "/uploads/abc123.jpg"), or null if no file.
     */
    private String saveFile(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) return null;

        String originalName = file.getOriginalFilename();
        String ext = (originalName != null && originalName.contains("."))
                ? originalName.substring(originalName.lastIndexOf('.'))
                : "";
        String filename = UUID.randomUUID().toString() + ext;

        Path dest = Paths.get(UPLOAD_DIR, filename);
        Files.copy(file.getInputStream(), dest, StandardCopyOption.REPLACE_EXISTING);

        return "/uploads/" + filename;
    }
}