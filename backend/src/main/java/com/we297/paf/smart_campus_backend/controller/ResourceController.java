package com.we297.paf.smart_campus_backend.controller;


import com.we297.paf.smart_campus_backend.dto.ResourceDTO;
import com.we297.paf.smart_campus_backend.entity.Resource;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceStatus;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceType;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceTypeParser;
import com.we297.paf.smart_campus_backend.service.ResourceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    // --- Mapper ---
    private ResourceDTO mapToDTO(Resource resource) {
        ResourceDTO dto = new ResourceDTO();
        dto.setId(resource.getId());

        // More permissive mapping - try multiple approaches
        String typeToUse = resource.getRawType();
        if (typeToUse == null || typeToUse.trim().isEmpty()) {
            ResourceType parsedType = resource.getType();
            typeToUse = parsedType != null ? parsedType.name() : "UNKNOWN";
        }

        // If still unknown, try to normalize common legacy formats
        if ("UNKNOWN".equals(typeToUse) && resource.getRawType() != null) {
            String rawType = resource.getRawType().trim().toUpperCase().replace(" ", "_");
            try {
                ResourceType.valueOf(rawType);
                typeToUse = rawType;
            } catch (IllegalArgumentException e) {
                // Keep as raw type if it's a valid format but not in enum
                if (resource.getRawType().matches("[A-Z_]+")) {
                    typeToUse = resource.getRawType();
                }
            }
        }

        System.out.println("Mapping to DTO - raw type: " + resource.getRawType() + ", final type: " + typeToUse);
        dto.setType(typeToUse);

        dto.setName(resource.getName());

        // ✅ FIX: null-safe capacity — equipment types have null capacity, don't auto-unbox
        dto.setCapacity(resource.getCapacity()); // ResourceDTO.capacity must be Integer, not int

        dto.setLocation(resource.getLocation());
        dto.setAvailability(resource.getAvailability());
        dto.setStatus(resource.getStatus().name());
        dto.setTags(resource.getTags());
        return dto;
    }

    // --- Add Resource ---
    @PostMapping
    public ResourceDTO addResource(@RequestBody Resource resource) {
        // Debug logging
        System.out.println("Received resource type: " + resource.getRawType());
        System.out.println("Parsed resource type: " + resource.getType());

        Resource saved = resourceService.addResource(resource);
        System.out.println("Saved resource type: " + saved.getRawType());
        return mapToDTO(saved);
    }

    // --- Get All Resources ---
    @GetMapping
    public List<ResourceDTO> getAllResources(@RequestParam(required = false) String type,
                                             @RequestParam(required = false) Integer minCapacity,
                                             @RequestParam(required = false) String location,
                                             @RequestParam(required = false) String status,
                                             @RequestParam(required = false) String tag,
                                             @RequestParam(required = false) String availableAt,
                                             @RequestParam(required = false) String bookingDate,
                                             @RequestParam(required = false) String bookingStartTime,
                                             @RequestParam(required = false) String bookingEndTime,
                                             @RequestParam(defaultValue = "false") boolean activeOnly) {
        return resourceService.searchResources(type, minCapacity, location, status, tag, availableAt, bookingDate, bookingStartTime, bookingEndTime, activeOnly)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    // --- Update Resource ---
    @PutMapping("/{id}")
    public ResourceDTO updateResource(@PathVariable Long id, @RequestBody Resource resource) {
        return mapToDTO(resourceService.updateResource(id, resource));
    }

    // --- Filtering ---
    @GetMapping("/filter/type")
    public List<ResourceDTO> filterByType(@RequestParam String type) {
        ResourceType parsed = ResourceTypeParser.parse(type);
        if (parsed == null) {
            throw new IllegalArgumentException("Unknown resource type: " + type);
        }
        return resourceService.filterByType(parsed)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @GetMapping("/filter/capacity")
    public List<ResourceDTO> filterByCapacity(@RequestParam int capacity) {
        return resourceService.filterByCapacity(capacity)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @GetMapping("/filter/location")
    public List<ResourceDTO> filterByLocation(@RequestParam String location) {
        return resourceService.filterByLocation(location)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @GetMapping("/filter/status")
    public List<ResourceDTO> filterByStatus(@RequestParam String status) {
        return resourceService.filterByStatus(ResourceStatus.valueOf(status.toUpperCase()))
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // --- Update Status ---
    @PutMapping("/{id}/status")
    public ResourceDTO updateStatus(@PathVariable Long id, @RequestParam String status) {
        return mapToDTO(resourceService.updateStatus(id, ResourceStatus.valueOf(status.toUpperCase())));
    }

    // --- Bulk Update Status ---
    @PutMapping("/status/bulk")
    public List<ResourceDTO> bulkUpdateStatus(@RequestBody List<Long> ids,
                                              @RequestParam String status) {
        resourceService.bulkUpdateStatus(ids, ResourceStatus.valueOf(status.toUpperCase()));
        return resourceService.getAllResources()
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // --- Smart Availability ---
    @GetMapping("/availability")
    public List<ResourceDTO> checkAvailability(@RequestParam String time) {
        return resourceService.findAvailableAt(time)
                .stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    // --- Delete Resource ---
    @DeleteMapping("/{id}")
    public void deleteResource(@PathVariable Long id) {
        resourceService.deleteResource(id);
    }
}