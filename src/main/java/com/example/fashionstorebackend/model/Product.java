package com.example.fashionstorebackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Setter
@Getter
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "product_seq")
    @SequenceGenerator(name = "product_seq", sequenceName = "product_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    private String color;

    private String material;

    @Column(name = "care_instructions", length = 500)
    private String careInstructions;

    // Используем ТОЛЬКО связи с сущностями
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private Category categoryEntity;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subcategory_id")
    private Subcategory subcategoryEntity;

    @ElementCollection
    @CollectionTable(
            name = "product_images",
            joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "image_url")
    private List<String> additionalImages = new ArrayList<>();

    // НОВОЕ: Варианты товара (размеры с количеством)
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER) // Изменили LAZY на EAGER
    private List<ProductVariant> variants = new ArrayList<>();
    // Конструкторы
    public Product() {}

    public Product(String name, String description, Double price, String imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    public Product(String name, String description, Double price, String imageUrl,
                   String color, String material, String careInstructions) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.color = color;
        this.material = material;
        this.careInstructions = careInstructions;
    }

    // Полный конструктор с сущностями категорий (без поля size)
    public Product(String name, String description, Double price, String imageUrl,
                   String color, String material, String careInstructions,
                   Category categoryEntity, Subcategory subcategoryEntity) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.color = color;
        this.material = material;
        this.careInstructions = careInstructions;
        this.categoryEntity = categoryEntity;
        this.subcategoryEntity = subcategoryEntity;
    }

    // Геттеры для совместимости с фронтендом
    public String getCategory() {
        return categoryEntity != null ? categoryEntity.getName() : "одежда";
    }

    public String getSubcategory() {
        return subcategoryEntity != null ? subcategoryEntity.getName() : null;
    }

    // Геттеры для ID категорий
    public Long getCategoryId() {
        return categoryEntity != null ? categoryEntity.getId() : null;
    }

    public Long getSubcategoryId() {
        return subcategoryEntity != null ? subcategoryEntity.getId() : null;
    }

    // НОВОЕ: Методы для работы с вариантами

    // Получить список всех доступных размеров
    public List<String> getSizes() {
        return variants.stream()
                .filter(ProductVariant::isAvailable)
                .map(ProductVariant::getSize)
                .toList();
    }

    // Получить общее доступное количество (по всем вариантам)
    public Integer getTotalAvailableQuantity() {
        return variants.stream()
                .mapToInt(ProductVariant::getAvailableQuantity)
                .sum();
    }

    // Получить общее зарезервированное количество (по всем вариантам)
    public Integer getTotalReservedQuantity() {
        return variants.stream()
                .mapToInt(ProductVariant::getReservedQuantity)
                .sum();
    }

    // Получить общее фактически доступное количество
    public Integer getTotalActuallyAvailable() {
        return variants.stream()
                .mapToInt(ProductVariant::getActuallyAvailable)
                .sum();
    }

    // Получить вариант по размеру
    public ProductVariant getVariantBySize(String size) {
        return variants.stream()
                .filter(v -> v.getSize().equalsIgnoreCase(size))
                .findFirst()
                .orElse(null);
    }

    // Добавить вариант
    public void addVariant(String size, Integer availableQuantity) {
        ProductVariant variant = new ProductVariant(this, size, availableQuantity);
        variants.add(variant);
    }

    // toString для удобства
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category='" + getCategory() + '\'' +
                ", subcategory='" + getSubcategory() + '\'' +
                ", variants=" + variants.size() +
                ", totalAvailable=" + getTotalAvailableQuantity() +
                ", price=" + price +
                '}';
    }
}