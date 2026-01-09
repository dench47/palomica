package com.example.fashionstorebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CategoryDTO {

    private Long id;
    private String name;
    private String description;
    private Integer displayOrder;
    private Boolean isActive = true;
    private List<SubcategoryDTO> subcategories = new ArrayList<>();

    // Конструктор без subcategories
    public CategoryDTO(Long id, String name, String description, Integer displayOrder, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
    }
}