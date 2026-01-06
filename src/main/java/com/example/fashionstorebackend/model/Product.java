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

    private String size;

    private String material;

    @Column(name = "care_instructions", length = 500)
    private String careInstructions;

    @Column(nullable = false)
    private String category = "одежда"; // Значение по умолчанию

    private String subcategory;


    @Column(name = "available_quantity")
    private Integer availableQuantity;

    @Column(name = "reserved_quantity")
    private Integer reservedQuantity = 0;

    // Для галереи изображений
    @ElementCollection
    @CollectionTable(
            name = "product_images",
            joinColumns = @JoinColumn(name = "product_id")
    )
    @Column(name = "image_url")
    private List<String> additionalImages = new ArrayList<>();

    // Конструкторы
    public Product() {}

    public Product(String name, String description, Double price, String imageUrl) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
    }

    // Конструктор для ProductFactory
    public Product(String name, String description, Double price, String imageUrl,
                   String color, String size, String material, String careInstructions) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.color = color;
        this.size = size;
        this.material = material;
        this.careInstructions = careInstructions;
    }

    // Полный конструктор со всеми полями
    public Product(String name, String description, Double price, String imageUrl,
                   String color, String size, String material, String careInstructions,
                   String category, String subcategory, Integer availableQuantity) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.imageUrl = imageUrl;
        this.color = color;
        this.size = size;
        this.material = material;
        this.careInstructions = careInstructions;
        this.category = category;
        this.subcategory = subcategory;
        this.availableQuantity = availableQuantity;
    }

    // toString для удобства
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category='" + category + '\'' +
                ", subcategory='" + subcategory + '\'' +
                ", availableQuantity=" + getAvailableQuantity() +
                ", price=" + price +
                '}';
    }
}