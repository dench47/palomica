package com.example.fashionstorebackend.dto;

import com.example.fashionstorebackend.model.Product;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

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
    private String material;
    private String careInstructions;
    private String category; // Текстовое название категории
    private String subcategory; // Текстовое название подкатегории
    private Long categoryId; // ID категории для формы
    private Long subcategoryId; // ID подкатегории для формы
    private List<String> additionalImages = new ArrayList<>();
    private List<ProductVariantDTO> variants = new ArrayList<>(); // Новое поле: варианты

    // Вычисляемое поле: все доступные размеры
    public List<String> getSizes() {
        return variants.stream()
                .filter(ProductVariantDTO::isAvailable)
                .map(ProductVariantDTO::getSize)
                .collect(Collectors.toList());
    }

    // Вычисляемое поле: общее доступное количество
    public Integer getTotalAvailableQuantity() {
        return variants.stream()
                .mapToInt(ProductVariantDTO::getAvailableQuantity)
                .sum();
    }

    // Вычисляемое поле: общее фактически доступное количество
    public Integer getTotalActuallyAvailable() {
        return variants.stream()
                .mapToInt(ProductVariantDTO::getActuallyAvailable)
                .sum();
    }

    // Конструктор для преобразования из Entity
    public ProductDTO(Product product) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.imageUrl = product.getImageUrl();
        this.color = product.getColor();
        this.material = product.getMaterial();
        this.careInstructions = product.getCareInstructions();
        this.category = product.getCategory();
        this.subcategory = product.getSubcategory();
        this.categoryId = product.getCategoryId();
        this.subcategoryId = product.getSubcategoryId();
        this.additionalImages = product.getAdditionalImages() != null ?
                product.getAdditionalImages() : new ArrayList<>();

        // Преобразуем варианты в DTO
        if (product.getVariants() != null) {
            this.variants = product.getVariants().stream()
                    .map(variant -> new ProductVariantDTO(
                            variant.getId(),
                            variant.getSize(),
                            variant.getAvailableQuantity(),
                            variant.getReservedQuantity()
                    ))
                    .collect(Collectors.toList());
        }
    }

    // Метод для получения варианта по размеру
    public ProductVariantDTO getVariantBySize(String size) {
        return variants.stream()
                .filter(v -> v.getSize().equalsIgnoreCase(size))
                .findFirst()
                .orElse(null);
    }

    // Метод для получения фактически доступного количества по размеру
    public Integer getAvailableQuantityForSize(String size) {
        ProductVariantDTO variant = getVariantBySize(size);
        return variant != null ? variant.getActuallyAvailable() : 0;
    }
}