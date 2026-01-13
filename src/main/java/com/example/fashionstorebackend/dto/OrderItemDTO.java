package com.example.fashionstorebackend.dto;

import lombok.Data;

@Data
public class OrderItemDTO {
    private Long id;
    private Integer quantity;
    private Double price;
    private String size;
    private String color;
    private ProductDTO product;
}