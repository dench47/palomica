package com.example.fashionstorebackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "product_variants")
public class ProductVariant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(nullable = false)
    private String size;

    @Column(name = "available_quantity")
    private Integer availableQuantity = 0;

    @Column(name = "reserved_quantity")
    private Integer reservedQuantity = 0;

    // Можно добавить цвет, если нужно
    // private String color;

    public ProductVariant() {}

    public ProductVariant(Product product, String size, Integer availableQuantity) {
        this.product = product;
        this.size = size;
        this.availableQuantity = availableQuantity;
    }

    // Методы для работы с количеством
    public boolean isAvailable() {
        return availableQuantity > 0;
    }

    public Integer getActuallyAvailable() {
        return Math.max(0, availableQuantity - reservedQuantity);
    }

    public boolean canReserve(int quantity) {
        return getActuallyAvailable() >= quantity;
    }

    public void reserve(int quantity) {
        if (canReserve(quantity)) {
            reservedQuantity += quantity;
        }
    }

    public void release(int quantity) {
        reservedQuantity = Math.max(0, reservedQuantity - quantity);
    }

    @Override
    public String toString() {
        return "ProductVariant{" +
                "id=" + id +
                ", productId=" + (product != null ? product.getId() : "null") +
                ", size='" + size + '\'' +
                ", available=" + availableQuantity +
                ", reserved=" + reservedQuantity +
                '}';
    }
}