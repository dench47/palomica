package com.example.fashionstorebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubcategoryDTO {

    private Long id;
    private String name;
    private String description;
    private Long categoryId;
    private String categoryName;
    private Integer displayOrder;
    private Boolean isActive = true;

    public SubcategoryDTO(Long id, String name, Long categoryId, Integer displayOrder, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.categoryId = categoryId;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
    }
}