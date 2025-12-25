package com.example.fashionstorebackend;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Column(nullable = false)
    private Double price;

    private String imageUrl;

    // НОВЫЕ ПОЛЯ ДЛЯ ДЕТАЛЬНОЙ СТРАНИЦЫ
    private String color;

    private String size; // Например: "S,M,L,XL" или "36,38,40,42"

    private String material;

    @Column(name = "care_instructions", length = 500)
    private String careInstructions;

    @Column(nullable = false) // Делаем обязательным
    private String category = "одежда"; // Значение по умолчанию

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

    // Полный конструктор со всеми полями
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

    // Геттеры и сеттеры для ВСЕХ полей
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    // Новые геттеры/сеттеры
    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getCareInstructions() { return careInstructions; }
    public void setCareInstructions(String careInstructions) { this.careInstructions = careInstructions; }

    public List<String> getAdditionalImages() { return additionalImages; }
    public void setAdditionalImages(List<String> additionalImages) { this.additionalImages = additionalImages; }

    // toString для удобства
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", price=" + price +
                '}';
    }
}