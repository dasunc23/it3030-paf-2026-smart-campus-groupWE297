package com.we297.paf.smart_campus_backend.dto;

import lombok.Data;
import java.util.List;

@Data
public class ResourceDTO {

    private Long id;
    private String type;
    private String name;
    private Integer capacity;
    private String location;
    private String availability;
    private String status;
    private List<String> tags;
}