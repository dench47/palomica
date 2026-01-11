package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.CartSyncRequest;
import com.example.fashionstorebackend.dto.CartSyncResponse;
import com.example.fashionstorebackend.model.ProductVariant;
import com.example.fashionstorebackend.repository.ProductVariantRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "http://localhost:5173")
public class CartSyncController {

    @Autowired
    private ProductVariantRepository productVariantRepository;

    // Временное хранилище резервирований (сессия -> вариант -> резервирование)
    private final Map<String, Map<Long, CartReservation>> reservations = new ConcurrentHashMap<>();

    // Класс для хранения резервирования
    private static class CartReservation {
        String sessionId;
        Long variantId;
        Integer quantity;
        LocalDateTime expiresAt;

        CartReservation(String sessionId, Long variantId, Integer quantity) {
            this.sessionId = sessionId;
            this.variantId = variantId;
            this.quantity = quantity;
            this.expiresAt = LocalDateTime.now().plusMinutes(30); // Резерв на 30 минут
        }

        boolean isExpired() {
            return LocalDateTime.now().isAfter(expiresAt);
        }
    }

    // Синхронизация корзины
    @PostMapping("/sync")
    @Transactional
    public ResponseEntity<CartSyncResponse> syncCart(@RequestBody CartSyncRequest request) {
        List<CartSyncResponse.ProductUpdate> updates = new ArrayList<>();

        // Очищаем просроченные резервирования
        cleanupExpiredReservations();

        // Группируем товары по productId для оптимизации запросов
        Map<Long, List<CartSyncRequest.CartItemRequest>> itemsByProduct = request.getItems().stream()
                .collect(Collectors.groupingBy(CartSyncRequest.CartItemRequest::getProductId));

        for (Map.Entry<Long, List<CartSyncRequest.CartItemRequest>> entry : itemsByProduct.entrySet()) {
            Long productId = entry.getKey();
            List<CartSyncRequest.CartItemRequest> productItems = entry.getValue();

            // Находим все варианты для этого товара
            List<ProductVariant> variants = productVariantRepository.findByProductId(productId);

            if (variants.isEmpty()) {
                // Товар не найден или нет вариантов
                for (CartSyncRequest.CartItemRequest item : productItems) {
                    updates.add(createUpdate(item.getProductId(), 0, 0,
                            "Товар больше не доступен", true, item.getSize()));
                }
                continue;
            }

            // Обрабатываем каждый запрошенный вариант
            for (CartSyncRequest.CartItemRequest item : productItems) {
                // Находим вариант по размеру
                Optional<ProductVariant> variantOpt = variants.stream()
                        .filter(v -> v.getSize().equalsIgnoreCase(item.getSize()))
                        .findFirst();

                if (variantOpt.isEmpty()) {
                    // Вариант не найден (размер недоступен)
                    updates.add(createUpdate(productId, 0, 0,
                            "Размер " + item.getSize() + " недоступен", true, item.getSize()));
                    continue;
                }

                ProductVariant variant = variantOpt.get();

                // Сколько этого варианта зарезервировано текущей сессией
                int reservedByThisSession = getReservedQuantityForSession(request.getSessionId(), variant.getId());

                // Сколько товара доступно для этой корзины (с учетом своих же резервирований)
                int actuallyAvailable = variant.getActuallyAvailable();
                int availableForThisCart = actuallyAvailable + reservedByThisSession;

                if (availableForThisCart <= 0) {
                    // Вариант полностью зарезервирован/продан
                    updates.add(createUpdate(productId, 0, variant.getReservedQuantity(),
                            "Размер " + item.getSize() + " закончился", true, item.getSize()));
                } else if (item.getQuantity() > availableForThisCart) {
                    // Запрошено больше, чем доступно
                    updates.add(createUpdate(productId, availableForThisCart, variant.getReservedQuantity(),
                            "Размер " + item.getSize() + " доступен только " + availableForThisCart + " шт.", false, item.getSize()));
                } else {
                    // Всё в порядке, но резервируем
                    reserveItem(request.getSessionId(), variant.getId(), item.getQuantity());
                    updates.add(createUpdate(productId, availableForThisCart,
                            variant.getReservedQuantity() + item.getQuantity(),
                            null, false, item.getSize()));
                }
            }
        }

        CartSyncResponse response = new CartSyncResponse();
        response.setUpdates(updates);
        response.setMessage(updates.isEmpty() ? "Корзина актуальна" : "Обновлены доступные количества");

        return ResponseEntity.ok(response);
    }

    // Резервирование товара (по варианту и размеру)
    @PostMapping("/reserve")
    @Transactional
    public ResponseEntity<?> reserveItems(@RequestBody CartSyncRequest request) {
        List<Long> productIds = request.getItems().stream()
                .map(CartSyncRequest.CartItemRequest::getProductId)
                .distinct()
                .collect(Collectors.toList());

        // Находим все варианты для этих товаров
        List<ProductVariant> allVariants = productVariantRepository.findByProductIdIn(productIds);

        for (CartSyncRequest.CartItemRequest item : request.getItems()) {
            // Находим вариант по товару и размеру
            Optional<ProductVariant> variantOpt = allVariants.stream()
                    .filter(v -> v.getProduct().getId().equals(item.getProductId()) &&
                            v.getSize().equalsIgnoreCase(item.getSize()))
                    .findFirst();

            if (variantOpt.isPresent()) {
                ProductVariant variant = variantOpt.get();
                // Пытаемся зарезервировать на уровне БД
                int reserved = productVariantRepository.reserveQuantity(variant.getId(), item.getQuantity());
                if (reserved > 0) {
                    // Если резервирование в БД успешно, добавляем в сессию
                    reserveItem(request.getSessionId(), variant.getId(), item.getQuantity());
                }
            }
        }
        return ResponseEntity.ok().build();
    }

    // Освобождение резервирования (по варианту и размеру)
    @PostMapping("/release")
    @Transactional
    public ResponseEntity<?> releaseItems(@RequestBody CartSyncRequest request) {
        Map<Long, CartReservation> sessionReservations =
                reservations.getOrDefault(request.getSessionId(), new HashMap<>());

        for (CartSyncRequest.CartItemRequest item : request.getItems()) {
            // Находим вариант по товару и размеру
            Optional<ProductVariant> variantOpt = productVariantRepository
                    .findByProductIdAndSize(item.getProductId(), item.getSize());

            if (variantOpt.isPresent()) {
                ProductVariant variant = variantOpt.get();
                // Освобождаем в БД
                productVariantRepository.releaseQuantity(variant.getId(), item.getQuantity());

                // Удаляем из сессии
                sessionReservations.remove(variant.getId());
            }
        }

        if (sessionReservations.isEmpty()) {
            reservations.remove(request.getSessionId());
        }

        return ResponseEntity.ok().build();
    }

    // Приватные методы
    private void reserveItem(String sessionId, Long variantId, Integer quantity) {
        Map<Long, CartReservation> sessionReservations =
                reservations.computeIfAbsent(sessionId, k -> new HashMap<>());
        sessionReservations.put(variantId, new CartReservation(sessionId, variantId, quantity));
    }

    private int getReservedQuantityForSession(String sessionId, Long variantId) {
        Map<Long, CartReservation> sessionReservations = reservations.get(sessionId);
        if (sessionReservations == null) return 0;

        CartReservation reservation = sessionReservations.get(variantId);
        return reservation != null && !reservation.isExpired() ? reservation.quantity : 0;
    }

    private void cleanupExpiredReservations() {
        reservations.entrySet().removeIf(entry -> {
            entry.getValue().entrySet().removeIf(e -> e.getValue().isExpired());
            return entry.getValue().isEmpty();
        });
    }

    private CartSyncResponse.ProductUpdate createUpdate(Long productId, Integer available,
                                                        Integer reserved, String message,
                                                        Boolean removed, String size) {
        CartSyncResponse.ProductUpdate update = new CartSyncResponse.ProductUpdate();
        update.setProductId(productId);
        update.setAvailableQuantity(available);
        update.setReservedQuantity(reserved);
        update.setMessage(message);
        update.setRemoved(removed);
        update.setSize(size); // Добавляем размер в ответ
        return update;
    }
}