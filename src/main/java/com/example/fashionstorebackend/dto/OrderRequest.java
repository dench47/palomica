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

    // Поля для Яндекс.Доставки (ПВЗ)
    private String yandexDeliveryPointId;      // ID выбранного ПВЗ
    private String yandexDeliveryAddress;      // Полный адрес ПВЗ
    private String yandexDeliveryCity;         // Город ПВЗ
    private String yandexDeliveryStreet;       // Улица ПВЗ
    private String yandexDeliveryHouse;        // Дом ПВЗ
    private String yandexDeliveryComment;      // Комментарий к ПВЗ

    @Setter
    @Getter
    public static class OrderItemRequest {
        private Long productId;
        private Integer quantity;
        private String size;
        private String color;
    }
}