package com.example.fashionstorebackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
public class CartSyncRequest {
    private String sessionId;
    private List<CartItemRequest> items;

    @Setter
    @Getter
    public static class CartItemRequest {
        private Long productId;
        private Integer quantity;
        private String size;  // Размер теперь обязателен для резервирования
        private String color; // Может быть null, если не используется

        // Проверка, что размер указан
        public boolean hasSize() {
            return size != null && !size.trim().isEmpty();
        }
    }
}