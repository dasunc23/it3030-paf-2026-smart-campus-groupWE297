package com.we205.paf.smart_campus_backend.service;

import com.we205.paf.smart_campus_backend.entity.Notification;
import com.we205.paf.smart_campus_backend.repository.NotificationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
    }

    /**
     * Create and persist a notification for a specific user.
     */
    public Notification createNotification(Long userId, String type, String message, Long referenceId) {
        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setType(type);
        notification.setMessage(message);
        notification.setReferenceId(referenceId);
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    /**
     * Get all notifications for a user (newest first).
     */
    public List<Notification> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    /**
     * Get only unread notifications for a user.
     */
    public List<Notification> getUnreadNotificationsForUser(Long userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    /**
     * Count of unread notifications (for badge display in UI).
     */
    public long countUnread(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    /**
     * Mark a single notification as read.
     */
    public Notification markAsRead(Long notificationId, Long requestingUserId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));
        if (!notification.getUserId().equals(requestingUserId)) {
            throw new SecurityException("You can only mark your own notifications as read");
        }
        notification.setRead(true);
        return notificationRepository.save(notification);
    }

    /**
     * Mark all notifications as read for a user.
     */
    public Map<String, String> markAllAsRead(Long userId) {
        notificationRepository.markAllReadForUser(userId);
        return Map.of("message", "All notifications marked as read");
    }
}
