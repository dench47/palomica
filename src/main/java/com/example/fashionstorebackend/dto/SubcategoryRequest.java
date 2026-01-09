package com.example.fashionstorebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoryRequest {

    private String name;
    private String description;
    private Long categoryId;
    private Integer displayOrder;
    private Boolean isActive = true;
}