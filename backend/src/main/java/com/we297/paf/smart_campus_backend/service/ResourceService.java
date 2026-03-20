package com.we297.paf.smart_campus_backend.service;


import com.we297.paf.smart_campus_backend.entity.Resource;
import com.we297.paf.smart_campus_backend.entity.enums.BookingStatus;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceStatus;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceType;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceTypeParser;
import com.we297.paf.smart_campus_backend.repository.BookingRepository;
import com.we297.paf.smart_campus_backend.repository.ResourceRepository;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;

import java.time.LocalTime;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;
    private final AuditLogService auditLogService;

    public ResourceService(ResourceRepository resourceRepository,
                           BookingRepository bookingRepository,
                           AuditLogService auditLogService) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
        this.auditLogService = auditLogService;
    }

    // --- Add Resource ---
    public Resource addResource(Resource resource) {
        // Debug logging
        System.out.println("Service received raw type: " + resource.getRawType());
        
        // Just save the resource as-is - the raw type should already be set by JSON deserialization
        Resource saved = resourceRepository.save(resource);
        System.out.println("Final saved raw type: " + saved.getRawType());
        
        String username = getCurrentActor();
        auditLogService.logAction("ADD_RESOURCE", saved.getId(), username,
                "Added new resource: " + saved.getName());
        return saved;
    }

    // --- Delete Resource ---
    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
        String username = getCurrentActor();
        auditLogService.logAction("DELETE_RESOURCE", id, username,
                "Deleted resource with ID: " + id);
    }

    // --- Update Status ---
    public Resource updateStatus(Long id, ResourceStatus status) {
        Resource resource = resourceRepository.findById(id).orElseThrow();
        resource.setStatus(status);
        Resource updated = resourceRepository.save(resource);
        String username = getCurrentActor();
        auditLogService.logAction("UPDATE_STATUS", id, username,
                "Updated status to: " + status);
        return updated;
    }

    // --- Update Resource ---
    public Resource updateResource(Long id, Resource payload) {
        Resource existing = resourceRepository.findById(id).orElseThrow();
        if (payload.getRawType() != null) {
            ResourceType parsedType = ResourceTypeParser.parse(payload.getRawType());
            if (parsedType != null) {
                existing.setType(parsedType);
            }
        }
        existing.setName(payload.getName());
        existing.setCapacity(payload.getCapacity());
        existing.setLocation(payload.getLocation());
        existing.setAvailability(payload.getAvailability());
        existing.setStatus(payload.getStatus());
        existing.setTags(payload.getTags());
        Resource updated = resourceRepository.save(existing);
        auditLogService.logAction("UPDATE_RESOURCE", id, getCurrentActor(),
                "Updated resource: " + updated.getName());
        return updated;
    }

    // --- Bulk Update Status ---
    public void bulkUpdateStatus(List<Long> ids, ResourceStatus status) {
        String username = getCurrentActor();
        List<Resource> resources = resourceRepository.findAllById(ids);
        for (Resource resource : resources) {
            resource.setStatus(status);
            resourceRepository.save(resource);
            auditLogService.logAction("BULK_UPDATE_STATUS", resource.getId(), username,
                    "Bulk updated status to: " + status);
        }
    }

    // --- Get All Resources ---
    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    // --- Combined search/filter ---
    public List<Resource> searchResources(String type,
                                          Integer minCapacity,
                                          String location,
                                          String status,
                                          String tag,
                                          String availableAt,
                                          String bookingDate,
                                          String bookingStartTime,
                                          String bookingEndTime,
                                          boolean activeOnly) {
        return resourceRepository.findAll().stream()
                .filter(resource -> type == null || type.isBlank() ||
                        (resource.getType() != null
                                && resource.getType().name().equalsIgnoreCase(type)))
                .filter(resource -> minCapacity == null || resource.getCapacity() >= minCapacity)
                .filter(resource -> location == null || location.isBlank() ||
                        (resource.getLocation() != null &&
                                resource.getLocation().toLowerCase(Locale.ROOT)
                                        .contains(location.toLowerCase(Locale.ROOT))))
                .filter(resource -> status == null || status.isBlank() ||
                        resource.getStatus().name().equalsIgnoreCase(status))
                .filter(resource -> tag == null || tag.isBlank() ||
                        (resource.getTags() != null &&
                                resource.getTags().stream().anyMatch(t ->
                                        t != null && t.equalsIgnoreCase(tag))))
                .filter(resource -> !activeOnly || resource.getStatus() == ResourceStatus.ACTIVE)
                .filter(resource -> availableAt == null || availableAt.isBlank() || isAvailableAt(resource, availableAt))
                .filter(resource -> bookingDate == null || bookingDate.isBlank() || bookingStartTime == null || bookingEndTime == null || 
                        isAvailableForBooking(resource, bookingDate, bookingStartTime, bookingEndTime))
                .collect(Collectors.toList());
    }

    // --- Filtering ---
    public List<Resource> filterByType(ResourceType type) {
        return resourceRepository.findByType(type.name());
    }

    public List<Resource> filterByCapacity(int capacity) {
        return resourceRepository.findByCapacityGreaterThan(capacity);
    }

    public List<Resource> filterByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    public List<Resource> filterByStatus(ResourceStatus status) {
        return resourceRepository.findByStatus(status);  // ✅ Pass enum directly
    }

    // --- Smart Availability ---
    public List<Resource> findAvailableAt(String time) {
        return resourceRepository.findAll().stream()
                .filter(resource -> isAvailableAt(resource, time))
                .filter(resource -> resource.getStatus() == ResourceStatus.ACTIVE)
                .collect(Collectors.toList());
    }

    private boolean isAvailableAt(Resource resource, String time) {
        try {
            LocalTime requested = LocalTime.parse(time);
            if (resource.getAvailability() == null || !resource.getAvailability().contains("-")) {
                return false;
            }
            String[] parts = resource.getAvailability().split("-");
            LocalTime start = LocalTime.parse(parts[0].trim());
            LocalTime end = LocalTime.parse(parts[1].trim());
            return !requested.isBefore(start) && !requested.isAfter(end);
        } catch (Exception ignored) {
            return false;
        }
    }

    private boolean isAvailableForBooking(Resource resource, String bookingDate, String startTime, String endTime) {
        try {
            if (resource.getAvailability() == null || !resource.getAvailability().contains("-")) {
                return false;
            }

            String[] availabilityParts = resource.getAvailability().split("-");
            LocalTime resourceStart = LocalTime.parse(availabilityParts[0].trim());
            LocalTime resourceEnd = LocalTime.parse(availabilityParts[1].trim());

            java.time.LocalDate requestedDate = java.time.LocalDate.parse(bookingDate);
            LocalTime requestedStart = LocalTime.parse(startTime);
            LocalTime requestedEnd = LocalTime.parse(endTime);

            if (!requestedStart.isBefore(requestedEnd)) {
                return false;
            }

            boolean withinWindow = !requestedStart.isBefore(resourceStart) && !requestedEnd.isAfter(resourceEnd);
            if (!withinWindow) {
                return false;
            }

            return bookingRepository.findByResourceIdAndBookingDate(resource.getId(), requestedDate)
                    .stream()
                    .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                    .noneMatch(existing -> requestedStart.isBefore(existing.getEndTime())
                            && requestedEnd.isAfter(existing.getStartTime()));
        } catch (Exception ignored) {
            return false;
        }
    }

    private String getCurrentActor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            return "system";
        }
        return authentication.getName();
    }
}
