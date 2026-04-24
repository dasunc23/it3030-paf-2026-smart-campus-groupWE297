package com.we297.paf.smart_campus_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceStatus;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceType;
import com.we297.paf.smart_campus_backend.entity.enums.ResourceTypeParser;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Table(name = "resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Stored as string in database so legacy values (e.g. "MEETING ROOM") load without enum errors. */
    @JsonIgnore
    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String name;
    
    @Column(nullable = true)
    private Integer capacity;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private String availability; // e.g. "08:00-17:00"

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceStatus status; // ACTIVE / OUT_OF_SERVICE

    @ElementCollection
    @CollectionTable(name = "resource_tags", joinColumns = @JoinColumn(name = "resource_id"))
    @Column(name = "tag")
    private List<String> tags; // e.g. Air-conditioned, Multimedia-enabled

    // --- Getters and Setters ---
    @JsonIgnore
    public ResourceType getType() {
        return ResourceTypeParser.parse(type);
    }

    public String getRawType() {
        return type;
    }

    public void setType(ResourceType type) {
        this.type = type == null ? null : type.name();
    }

    @JsonProperty("type")
    public void setType(String type) {
        this.type = type;
    }
}