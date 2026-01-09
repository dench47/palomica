package com.example.fashionstorebackend.dto;

import com.example.fashionstorebackend.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String name;
    private String description;
    private Double price;
    private String imageUrl;
    private String color;
    private String size;
    private String material;
    private String careInstructions;
    private String category; // Текстовое название категории
    private String subcategory; // Текстовое название подкатегории
    private Long categoryId; // ID категории для формы
    private Long subcategoryId; // ID подкатегории для формы
    private Integer availableQuantity;
    private Integer reservedQuantity = 0;
    private List<String> additionalImages = new ArrayList<>();

    // Конструктор для преобразования из Entity
    public ProductDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.imageUrl = product.getImageUrl();
        this.color = product.getColor();
        this.size = product.getSize();
        this.material = product.getMaterial();
        this.careInstructions = product.getCareInstructions();
        this.category = product.getCategory();
        this.subcategory = product.getSubcategory();
        this.categoryId = product.getCategoryId();
        this.subcategoryId = product.getSubcategoryId();
        this.availableQuantity = product.getAvailableQuantity();
        this.reservedQuantity = product.getReservedQuantity();
        this.additionalImages = product.getAdditionalImages() != null ?
                product.getAdditionalImages() : new ArrayList<>();
    }
}