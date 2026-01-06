package com.example.fashionstorebackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
public class OrderRequest {
    private String customerName;
    private String customerEmail;
    private String customerPhone;
    private String deliveryAddress;
    private String deliveryMethod;
    private String paymentMethod;
    private String comment;
    private List<OrderItemRequest> items;

    @Setter
    @Getter
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private String size;
        private String color;
    }
}