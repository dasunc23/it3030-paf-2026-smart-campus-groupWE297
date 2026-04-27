package com.we297.paf.smart_campus_backend.service;


import com.we297.paf.smart_campus_backend.dto.BookingResponse;
import com.we297.paf.smart_campus_backend.dto.CreateBookingRequest;
import com.we297.paf.smart_campus_backend.dto.ReviewBookingRequest;
import com.we297.paf.smart_campus_backend.dto.UpdateBookingRequest;
import com.we297.paf.smart_campus_backend.entity.Booking;
import com.we297.paf.smart_campus_backend.entity.Resource;
import com.we297.paf.smart_campus_backend.entity.User;
import com.we297.paf.smart_campus_backend.entity.enums.BookingStatus;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceStatus;
import com.we297.paf.smart_campus_backend.entity.enums.Role;
import com.we297.paf.smart_campus_backend.repository.BookingRepository;
import com.we297.paf.smart_campus_backend.repository.ResourceRepository;
import com.we297.paf.smart_campus_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final UserRepository userRepository;
    // FIX: inject NotificationService so booking events can create notifications
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          ResourceRepository resourceRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.resourceRepository = resourceRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public BookingResponse createBooking(CreateBookingRequest request, String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);
        Resource resource = getResource(request.getResourceId());

        validateNotInPast(request.getBookingDate(), request.getStartTime());
        validateDateTimeRange(request.getStartTime(), request.getEndTime());
        validateWithinResourceWindow(resource, request.getStartTime(), request.getEndTime());
        validateExpectedAttendees(resource, request.getExpectedAttendees());

        assertNoConflict(resource.getId(), request.getBookingDate(), request.getStartTime(), request.getEndTime(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED), null);

        Booking booking = new Booking();
        booking.setResourceId(resource.getId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());
        booking.setStatus(BookingStatus.PENDING);
        booking.setRequestedByUserId(requester.getId());
        booking.setRequestedByEmail(requester.getEmail());
        booking.setRequestedAt(LocalDateTime.now());

        return BookingResponse.fromEntity(bookingRepository.save(booking));
    }

    public BookingResponse updateBooking(Long id, UpdateBookingRequest request, String requesterEmail) {
        Booking booking = getBooking(id);
        User requester = getUserByEmail(requesterEmail);

        if (!booking.getRequestedByUserId().equals(requester.getId())) {
            throw new SecurityException("You can only edit your own bookings");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be edited");
        }

        Resource resource = getResource(request.getResourceId());

        validateNotInPast(request.getBookingDate(), request.getStartTime());
        validateDateTimeRange(request.getStartTime(), request.getEndTime());
        validateWithinResourceWindow(resource, request.getStartTime(), request.getEndTime());
        validateExpectedAttendees(resource, request.getExpectedAttendees());

        assertNoConflict(
                resource.getId(),
                request.getBookingDate(),
                request.getStartTime(),
                request.getEndTime(),
                List.of(BookingStatus.PENDING, BookingStatus.APPROVED),
                booking.getId()
        );

        booking.setResourceId(resource.getId());
        booking.setBookingDate(request.getBookingDate());
        booking.setStartTime(request.getStartTime());
        booking.setEndTime(request.getEndTime());
        booking.setPurpose(request.getPurpose());
        booking.setExpectedAttendees(request.getExpectedAttendees());

        return BookingResponse.fromEntity(bookingRepository.save(booking));
    }

    public Map<String, Object> checkAvailability(Long resourceId,
                                                 LocalDate bookingDate,
                                                 LocalTime startTime,
                                                 LocalTime endTime,
                                                 String excludeBookingId,
                                                 String requesterEmail) {
        getUserByEmail(requesterEmail);
        Resource resource = getResource(resourceId);

        validateNotInPast(bookingDate, startTime);
        validateDateTimeRange(startTime, endTime);
        validateWithinResourceWindow(resource, startTime, endTime);

        List<Booking> sameDayBookings = bookingRepository.findByResourceIdAndBookingDate(resourceId, bookingDate);
        boolean hasConflict = sameDayBookings.stream()
                .filter(existing -> existing.getStatus() == BookingStatus.PENDING || existing.getStatus() == BookingStatus.APPROVED)
                .filter(existing -> excludeBookingId == null || !excludeBookingId.equals(existing.getId()))
                .anyMatch(existing -> isOverlapping(startTime, endTime, existing.getStartTime(), existing.getEndTime()));

        if (hasConflict) {
            return Map.of("available", false, "message", "Time slot is not available");
        }

        return Map.of("available", true, "message", "Time slot is available");
    }

    public BookingResponse getBookingById(Long id, String requesterEmail) {
        Booking booking = getBooking(id);
        User requester = getUserByEmail(requesterEmail);

        if (!isAdmin(requester) && !booking.getRequestedByUserId().equals(requester.getId())) {
            throw new SecurityException("You are not allowed to view this booking");
        }

        return BookingResponse.fromEntity(booking);
    }

    public List<BookingResponse> getMyBookings(String requesterEmail) {
        User requester = getUserByEmail(requesterEmail);
        return bookingRepository.findByRequestedByUserIdOrderByRequestedAtDesc(requester.getId())
                .stream()
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<BookingResponse> getAllBookings(String requesterEmail,
                                                String resourceId,
                                                String status,
                                                LocalDate bookingDate,
                                                String requestedByUserId) {
        User requester = getUserByEmail(requesterEmail);
        if (!isAdmin(requester)) {
            throw new SecurityException("Only admins can view all bookings");
        }

        return bookingRepository.findAll().stream()
                .filter(b -> resourceId == null || resourceId.isBlank() || resourceId.equals(b.getResourceId()))
                .filter(b -> bookingDate == null || bookingDate.equals(b.getBookingDate()))
                .filter(b -> requestedByUserId == null || requestedByUserId.isBlank() || requestedByUserId.equals(b.getRequestedByUserId()))
                .filter(b -> {
                    if (status == null || status.isBlank()) {
                        return true;
                    }
                    return b.getStatus().name().equalsIgnoreCase(status.trim());
                })
                .sorted((a, b) -> b.getRequestedAt().compareTo(a.getRequestedAt()))
                .map(BookingResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public BookingResponse reviewBooking(Long id, ReviewBookingRequest request, String reviewerEmail) {
        User reviewer = getUserByEmail(reviewerEmail);
        if (!isAdmin(reviewer)) {
            throw new SecurityException("Only admins can review bookings");
        }

        Booking booking = getBooking(id);
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalStateException("Only pending bookings can be reviewed");
        }

        if (Boolean.TRUE.equals(request.getApproved())) {
            assertNoConflict(booking.getResourceId(), booking.getBookingDate(), booking.getStartTime(), booking.getEndTime(),
                    List.of(BookingStatus.APPROVED), booking.getId());
            booking.setStatus(BookingStatus.APPROVED);
            booking.setReviewReason(request.getReason());
        } else {
            if (request.getReason() == null || request.getReason().isBlank()) {
                throw new IllegalArgumentException("Reason is required when rejecting a booking");
            }
            booking.setStatus(BookingStatus.REJECTED);
            booking.setReviewReason(request.getReason().trim());
        }

        booking.setReviewedBy(reviewer.getEmail());
        booking.setReviewedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // FIX: notify the booking owner of the approval/rejection decision
        String notifType = saved.getStatus() == BookingStatus.APPROVED
                ? "BOOKING_APPROVED" : "BOOKING_REJECTED";
        String notifMsg = saved.getStatus() == BookingStatus.APPROVED
                ? "Your booking request (ID: " + saved.getId() + ") on " + saved.getBookingDate() + " has been approved."
                : "Your booking request (ID: " + saved.getId() + ") on " + saved.getBookingDate()
                + " has been rejected. Reason: " + saved.getReviewReason();
        notificationService.createNotification(
                saved.getRequestedByUserId(), notifType, notifMsg, saved.getId());

        return BookingResponse.fromEntity(saved);
    }

    public BookingResponse cancelBooking(Long id, String requesterEmail, String reason) {
        Booking booking = getBooking(id);
        User requester = getUserByEmail(requesterEmail);

        boolean canCancel = isAdmin(requester) || booking.getRequestedByUserId().equals(requester.getId());
        if (!canCancel) {
            throw new SecurityException("You are not allowed to cancel this booking");
        }
        if (booking.getStatus() != BookingStatus.APPROVED) {
            throw new IllegalStateException("Only approved bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancellationReason((reason == null || reason.isBlank()) ? null : reason.trim());
        booking.setCancelledAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // FIX: notify the booking owner that their booking was cancelled
        // Only send to owner if an admin performed the cancellation (to avoid self-notification)
        if (!saved.getRequestedByUserId().equals(requester.getId())) {
            String msg = "Your approved booking (ID: " + saved.getId() + ") on " + saved.getBookingDate()
                    + " has been cancelled by an admin"
                    + (saved.getCancellationReason() != null ? ". Reason: " + saved.getCancellationReason() : ".");
            notificationService.createNotification(
                    saved.getRequestedByUserId(), "BOOKING_CANCELLED", msg, saved.getId());
        }

        return BookingResponse.fromEntity(saved);
    }

    private User getUserByEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new SecurityException("Unauthenticated request");
        }
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private Resource getResource(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Resource not found"));

        if (resource.getStatus() != ResourceStatus.ACTIVE) {
            throw new IllegalStateException("Resource is not active for bookings");
        }
        return resource;
    }

    private Booking getBooking(Long id) {
        return bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking not found"));
    }

    private boolean isAdmin(User user) {
        return user.getRole() == Role.ROLE_ADMIN;
    }

    private void validateDateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private void validateNotInPast(LocalDate bookingDate, LocalTime startTime) {
        LocalDateTime selectedDateTime = LocalDateTime.of(bookingDate, startTime);
        if (selectedDateTime.isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("You cannot book a past date or time");
        }
    }

    private void validateWithinResourceWindow(Resource resource, LocalTime startTime, LocalTime endTime) {
        if (resource.getAvailability() == null || !resource.getAvailability().contains("-")) {
            throw new IllegalStateException("Resource availability is not configured");
        }

        try {
            String[] parts = resource.getAvailability().split("-");
            LocalTime resourceStart = LocalTime.parse(parts[0].trim());
            LocalTime resourceEnd = LocalTime.parse(parts[1].trim());

            if (startTime.isBefore(resourceStart) || endTime.isAfter(resourceEnd)) {
                throw new IllegalStateException("Requested time is outside resource availability window");
            }
        } catch (IllegalStateException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalStateException("Resource availability format is invalid");
        }
    }

    private void validateExpectedAttendees(Resource resource, Integer expectedAttendees) {
        if (isExpectedAttendeesRequired(resource) && expectedAttendees == null) {
            throw new IllegalArgumentException("Expected attendees is required for this resource type");
        }

        if (expectedAttendees == null) {
            return;
        }
        if (expectedAttendees > resource.getCapacity()) {
            throw new IllegalArgumentException("Expected attendees exceed resource capacity");
        }
    }

    private boolean isExpectedAttendeesRequired(Resource resource) {
        String normalizedType = normalizeResourceValue(resource.getRawType());

        if (Set.of("LECTURE_HALL", "LAB", "MEETING_ROOM", "ROOM", "AUDITORIUM").contains(normalizedType)) {
            return true;
        }

        String normalizedName = normalizeResourceValue(resource.getName());
        return normalizedName.contains("LECTURE_HALL")
                || normalizedName.contains("LAB")
                || normalizedName.contains("MEETING_ROOM")
                || normalizedName.contains("AUDITORIUM")
                || normalizedName.contains("ROOM");
    }

    private String normalizeResourceValue(String value) {
        if (value == null) {
            return "";
        }
        return value.trim().toUpperCase(Locale.ROOT).replaceAll("\\s+", "_");
    }

    private void assertNoConflict(Long resourceId,
                                  LocalDate bookingDate,
                                  LocalTime startTime,
                                  LocalTime endTime,
                                  List<BookingStatus> conflictStatuses,
                                  Long ignoreBookingId) {
        List<Booking> sameDayBookings = bookingRepository.findByResourceIdAndBookingDate(resourceId, bookingDate);

        boolean hasConflict = sameDayBookings.stream()
                .filter(existing -> conflictStatuses.contains(existing.getStatus()))
                .filter(existing -> ignoreBookingId == null || !ignoreBookingId.equals(existing.getId()))
                .anyMatch(existing -> isOverlapping(startTime, endTime, existing.getStartTime(), existing.getEndTime()));

        if (hasConflict) {
            throw new IllegalStateException("Booking conflict: resource is already booked in the requested time range");
        }
    }

    private boolean isOverlapping(LocalTime startA, LocalTime endA, LocalTime startB, LocalTime endB) {
        return startA.isBefore(endB) && endA.isAfter(startB);
    }
}