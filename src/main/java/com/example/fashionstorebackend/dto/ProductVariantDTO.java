package com.example.fashionstorebackend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductVariantDTO {
    private Long id;
    private String size;
    private Integer availableQuantity;
    private Integer reservedQuantity = 0;

    // Вычисляемое поле: фактически доступное количество
    public Integer getActuallyAvailable() {
        return Math.max(0, availableQuantity - reservedQuantity);
    }

    // Проверка доступности
    public boolean isAvailable() {
        return getActuallyAvailable() > 0;
    }
}