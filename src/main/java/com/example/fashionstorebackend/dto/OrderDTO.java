package com.example.fashionstorebackend.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class OrderDTO {
    private Long id;
    private String orderNumber;
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

    // Поля для Яндекс.Доставки (ПВЗ) - ДОБАВЛЯЕМ
    private String yandexDeliveryPointId;
    private String yandexDeliveryAddress;
    private String yandexDeliveryCity;
    private String yandexDeliveryStreet;
    private String yandexDeliveryHouse;
    private String yandexDeliveryComment;

    // Поля для СДЭК (ПВЗ) - ДОБАВЛЯЕМ
    private String cdekDeliveryPointCode;
    private String cdekDeliveryPointAddress;
    private String cdekDeliveryPointCity;
    private String cdekDeliveryPointName;
}