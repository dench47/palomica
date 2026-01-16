package com.example.fashionstorebackend.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Setter
@Getter
@Entity
@Table(name = "orders")
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "order_seq")
    @SequenceGenerator(name = "order_seq", sequenceName = "order_sequence", allocationSize = 1)
    private Long id;

    @Column(nullable = false, unique = true)
    private String orderNumber; // Уникальный номер заказа

    @Column(nullable = false)
    private String customerName;

    @Column(nullable = false)
    private String customerEmail;

    @Column(nullable = false)
    private String customerPhone;

    private String deliveryAddress;

    @Column(nullable = false)
    private String deliveryMethod;

    @Column(nullable = false)
    private String paymentMethod;

    private String comment;

    @Column(nullable = false)
    private Double totalAmount;

    @Column(nullable = false)
    private String status = "NEW"; // NEW, PROCESSING, SHIPPED, COMPLETED, CANCELLED

    @Column(name = "access_token", unique = true)
    private String accessToken;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    public Order() {
        generateAccessToken();
        generateOrderNumber();
    }

    public Order(String customerName, String customerEmail, String customerPhone,
                 String deliveryAddress, String deliveryMethod, String paymentMethod,
                 String comment, Double totalAmount) {
        this.customerName = customerName;
        this.customerEmail = customerEmail;
        this.customerPhone = customerPhone;
        this.deliveryAddress = deliveryAddress;
        this.deliveryMethod = deliveryMethod;
        this.paymentMethod = paymentMethod;
        this.comment = comment;
        this.totalAmount = totalAmount;
        generateAccessToken();
        generateOrderNumber();
    }

    public void generateAccessToken() {
        if (this.accessToken == null) {
            this.accessToken = UUID.randomUUID().toString();
        }
    }

    public void generateOrderNumber() {
        if (this.orderNumber == null) {
            String chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
            StringBuilder sb = new StringBuilder();
            Random random = new Random();

            for (int i = 0; i < 8; i++) {
                sb.append(chars.charAt(random.nextInt(chars.length())));
            }

            this.orderNumber = sb.toString();
        }
    }

    public void addItem(OrderItem item) {
        items.add(item);
        item.setOrder(this);
    }

    @PrePersist
    protected void onCreate() {
        if (this.accessToken == null) {
            generateAccessToken();
        }
        if (this.orderNumber == null) {
            generateOrderNumber();
        }
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }
}