package com.example.fashionstorebackend.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Setter
@Getter
public class CartSyncResponse {
    private List<ProductUpdate> updates;
    private String message;

    @Setter
    @Getter
    public static class ProductUpdate {
        private Long productId;
        private Integer availableQuantity;
        private Integer reservedQuantity;
        private String message;
        private Boolean removed;
    }
}