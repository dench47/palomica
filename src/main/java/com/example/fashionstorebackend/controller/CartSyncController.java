package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.CartSyncRequest;
import com.example.fashionstorebackend.dto.CartSyncResponse;
import com.example.fashionstorebackend.model.Product;
import com.example.fashionstorebackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartSyncController {

    @Autowired
    private ProductRepository productRepository;

    // Временное хранилище резервирований (сессия -> товар -> резервирование)
    private final Map<String, Map<Long, CartReservation>> reservations = new ConcurrentHashMap<>();

    // Класс для хранения резервирования
    private static class CartReservation {
        String sessionId;
        Long productId;
        Integer quantity;
        LocalDateTime expiresAt;

        CartReservation(String sessionId, Long productId, Integer quantity) {
            this.sessionId = sessionId;
            this.productId = productId;
            this.quantity = quantity;
            this.expiresAt = LocalDateTime.now().plusMinutes(30); // Резерв на 30 минут
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    // Синхронизация корзины
    @PostMapping("/sync")
    public ResponseEntity<CartSyncResponse> syncCart(@RequestBody CartSyncRequest request) {
        List<CartSyncResponse.ProductUpdate> updates = new ArrayList<>();

        // Очищаем просроченные резервирования
        cleanupExpiredReservations();

        for (CartSyncRequest.CartItemRequest cartItem : request.getItems()) {
            Optional<Product> productOpt = productRepository.findById(cartItem.getProductId());

            if (productOpt.isEmpty()) {
                // Товар не найден
                updates.add(createUpdate(cartItem.getProductId(), 0, 0,
                        "Товар больше не доступен", true));
                continue;
            }

            Product product = productOpt.get();
            int available = product.getAvailableQuantity() != null ? product.getAvailableQuantity() : 0;
            int reserved = product.getReservedQuantity() != null ? product.getReservedQuantity() : 0;
            int actuallyAvailable = Math.max(0, available - reserved);

            // Сколько этого товара зарезервировано текущей сессией
            int reservedByThisSession = getReservedQuantityForSession(request.getSessionId(), product.getId());

            // Сколько товара доступно для этой корзины (с учетом своих же резервирований)
            int availableForThisCart = actuallyAvailable + reservedByThisSession;

            if (availableForThisCart <= 0) {
                // Товар полностью зарезервирован/продан
                updates.add(createUpdate(product.getId(), 0, reserved,
                        "Товар закончился", true));
            } else if (cartItem.getQuantity() > availableForThisCart) {
                // Запрошено больше, чем доступно
                updates.add(createUpdate(product.getId(), availableForThisCart, reserved,
                        "Доступно только " + availableForThisCart + " шт.", false));
            } else {
                // Всё в порядке, но резервируем
                reserveItem(request.getSessionId(), product.getId(), cartItem.getQuantity());
                updates.add(createUpdate(product.getId(), availableForThisCart, reserved + cartItem.getQuantity(),
                        null, false));
            }
        }

        CartSyncResponse response = new CartSyncResponse();
        response.setUpdates(updates);
        response.setMessage(updates.isEmpty() ? "Корзина актуальна" : "Обновлены доступные количества");

        return ResponseEntity.ok(response);
    }

    // Резервирование товара
    @PostMapping("/reserve")
    public ResponseEntity<?> reserveItems(@RequestBody CartSyncRequest request) {
        for (CartSyncRequest.CartItemRequest item : request.getItems()) {
            reserveItem(request.getSessionId(), item.getProductId(), item.getQuantity());
        }
        return ResponseEntity.ok().build();
    }

    // Освобождение резервирования
    @PostMapping("/release")
    public ResponseEntity<?> releaseItems(@RequestBody CartSyncRequest request) {
        Map<Long, CartReservation> sessionReservations =
                reservations.getOrDefault(request.getSessionId(), new HashMap<>());

        for (CartSyncRequest.CartItemRequest item : request.getItems()) {
            sessionReservations.remove(item.getProductId());
        }

        if (sessionReservations.isEmpty()) {
            reservations.remove(request.getSessionId());
        }

        return ResponseEntity.ok().build();
    }

    // Приватные методы
    private void reserveItem(String sessionId, Long productId, Integer quantity) {
        Map<Long, CartReservation> sessionReservations =
                reservations.computeIfAbsent(sessionId, k -> new HashMap<>());
        sessionReservations.put(productId, new CartReservation(sessionId, productId, quantity));
    }

    private int getReservedQuantityForSession(String sessionId, Long productId) {
        Map<Long, CartReservation> sessionReservations = reservations.get(sessionId);
        if (sessionReservations == null) return 0;

        CartReservation reservation = sessionReservations.get(productId);
        return reservation != null && !reservation.isExpired() ? reservation.quantity : 0;
    }

    private void cleanupExpiredReservations() {
        reservations.entrySet().removeIf(entry -> {
            entry.getValue().entrySet().removeIf(e -> e.getValue().isExpired());
            return entry.getValue().isEmpty();
        });
    }

    private CartSyncResponse.ProductUpdate createUpdate(Long productId, Integer available,
                                                        Integer reserved, String message, Boolean removed) {
        CartSyncResponse.ProductUpdate update = new CartSyncResponse.ProductUpdate();
        update.setProductId(productId);
        update.setAvailableQuantity(available);
        update.setReservedQuantity(reserved);
        update.setMessage(message);
        update.setRemoved(removed);
        return update;
    }
}