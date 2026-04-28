package com.we297.paf.smart_campus_backend.controller;

import com.we297.paf.smart_campus_backend.entity.Notification;
import com.we297.paf.smart_campus_backend.entity.User;
import com.we297.paf.smart_campus_backend.repository.UserRepository;
import com.we297.paf.smart_campus_backend.service.NotificationService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin
public class NotificationController {

    private final NotificationService notificationService;
    private final UserRepository userRepository;

    public NotificationController(NotificationService notificationService, UserRepository userRepository) {
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    /** GET /api/notifications — all notifications for the authenticated user */
    @GetMapping
    public ResponseEntity<?> getMyNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = resolveUser(userDetails.getUsername());
        List<Notification> notifications = notificationService.getNotificationsForUser(user.getId());
        return ResponseEntity.ok(notifications);
    }

    /** GET /api/notifications/unread — only unread notifications */
    @GetMapping("/unread")
    public ResponseEntity<?> getUnread(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = resolveUser(userDetails.getUsername());
        return ResponseEntity.ok(notificationService.getUnreadNotificationsForUser(user.getId()));
    }

    /** GET /api/notifications/unread/count — badge count for UI */
    @GetMapping("/unread/count")
    public ResponseEntity<?> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = resolveUser(userDetails.getUsername());
        long count = notificationService.countUnread(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    /** PATCH /api/notifications/{id}/read — mark a single notification as read */
    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markOneAsRead(@PathVariable Long id,
                                           @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = resolveUser(userDetails.getUsername());
        try {
            Notification updated = notificationService.markAsRead(id, user.getId());
            return ResponseEntity.ok(updated);
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /** PATCH /api/notifications/read-all — mark all notifications as read */
    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllAsRead(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        User user = resolveUser(userDetails.getUsername());
        return ResponseEntity.ok(notificationService.markAllAsRead(user.getId()));
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + email));
    }
}