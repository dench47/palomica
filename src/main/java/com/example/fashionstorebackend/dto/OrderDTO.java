package com.example.fashionstorebackend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String deliveryAddress;
    private String deliveryMethod;
    private String paymentMethod;
    private String comment;
    private Double totalAmount;
    private String status;
    private String accessToken;
    private LocalDateTime createdAt;
    private List<OrderItemDTO> items;
}