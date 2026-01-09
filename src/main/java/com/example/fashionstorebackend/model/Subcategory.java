package com.example.fashionstorebackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "subcategories")
@Getter
@Setter
public class Subcategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(length = 500)
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "is_active")
    private Boolean isActive = true;

    // ДОБАВЬ ЭТОТ БЛОК - связь с товарами (mappedBy = "subcategoryEntity" соответствует полю в Product)
    @OneToMany(mappedBy = "subcategoryEntity")
    private List<Product> products = new ArrayList<>();

    // Конструкторы - НЕ МЕНЯЕМ!
    public Subcategory() {}

    public Subcategory(String name, Category category) {
        this.name = name;
        this.category = category;
    }

    public Subcategory(String name, String description, Category category) {
        this.name = name;
        this.description = description;
        this.category = category;
    }

    public Subcategory(String name, String description, Category category, Integer displayOrder) {
        this.name = name;
        this.description = description;
        this.category = category;
        this.displayOrder = displayOrder;
    }

    @Override
    public String toString() {
        return "Subcategory{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", category=" + (category != null ? category.getName() : "null") +
                ", displayOrder=" + displayOrder +
                ", isActive=" + isActive +
                '}';
    }
}