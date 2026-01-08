package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.model.Product;
import com.example.fashionstorebackend.model.Order;
import com.example.fashionstorebackend.repository.ProductRepository;
import com.example.fashionstorebackend.repository.OrderRepository;
import com.example.fashionstorebackend.service.JwtService;
import com.example.fashionstorebackend.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private S3Service s3Service;

    private boolean isAdmin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String token = authHeader.substring(7);
        return jwtService.validateToken(token);
    }

    // ========== УПРАВЛЕНИЕ ТОВАРАМИ ==========

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            List<Product> products = productRepository.findAll();
            return ResponseEntity.ok(products);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки товаров: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        Optional<Product> product = productRepository.findById(id);
        return product.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        try {
            // Устанавливаем дефолтные значения
            if (product.getAvailableQuantity() == null) {
                product.setAvailableQuantity(0);
            }
            if (product.getReservedQuantity() == null) {
                product.setReservedQuantity(0);
            }
            if (product.getCategory() == null || product.getCategory().isEmpty()) {
                product.setCategory("одежда");
            }

            Product savedProduct = productRepository.save(product);
            return ResponseEntity.ok(savedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Ошибка создания товара: " + e.getMessage()
            ));
        }
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<?> updateProduct(@PathVariable Long id,
                                           @RequestBody Map<String, Object> productDetails,
                                           HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        try {
            Optional<Product> productOptional = productRepository.findById(id);

            if (productOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Product product = productOptional.get();

            // Сохраняем старые фото для сравнения
            List<String> oldImages = new ArrayList<>();
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                oldImages.add(product.getImageUrl());
            }
            if (product.getAdditionalImages() != null) {
                oldImages.addAll(product.getAdditionalImages());
            }

            // Обновляем только переданные поля
            if (productDetails.get("name") != null) {
                product.setName((String) productDetails.get("name"));
            }
            if (productDetails.get("description") != null) {
                product.setDescription((String) productDetails.get("description"));
            }
            if (productDetails.get("price") != null) {
                product.setPrice(((Number) productDetails.get("price")).doubleValue());
            }
            if (productDetails.get("imageUrl") != null) {
                product.setImageUrl((String) productDetails.get("imageUrl"));
            }
            if (productDetails.get("color") != null) {
                product.setColor((String) productDetails.get("color"));
            }
            if (productDetails.get("size") != null) {
                product.setSize((String) productDetails.get("size"));
            }
            if (productDetails.get("material") != null) {
                product.setMaterial((String) productDetails.get("material"));
            }
            if (productDetails.get("careInstructions") != null) {
                product.setCareInstructions((String) productDetails.get("careInstructions"));
            }
            if (productDetails.get("category") != null) {
                product.setCategory((String) productDetails.get("category"));
            }
            if (productDetails.get("subcategory") != null) {
                product.setSubcategory((String) productDetails.get("subcategory"));
            }
            if (productDetails.get("availableQuantity") != null) {
                product.setAvailableQuantity(((Number) productDetails.get("availableQuantity")).intValue());
            }
            if (productDetails.get("reservedQuantity") != null) {
                product.setReservedQuantity(((Number) productDetails.get("reservedQuantity")).intValue());
            }
            if (productDetails.get("additionalImages") != null) {
                product.setAdditionalImages((List<String>) productDetails.get("additionalImages"));
            } else {
                product.setAdditionalImages(new ArrayList<>());
            }

            // Получаем новые фото
            List<String> newImages = new ArrayList<>();
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                newImages.add(product.getImageUrl());
            }
            if (product.getAdditionalImages() != null) {
                newImages.addAll(product.getAdditionalImages());
            }

            // Находим удаленные фото (есть в старых, но нет в новых)
            List<String> deletedImages = oldImages.stream()
                    .filter(oldImg -> !newImages.contains(oldImg))
                    .collect(Collectors.toList());

            // Также проверяем переданный список удаленных фото от фронтенда
            if (productDetails.get("deletedImages") != null) {
                List<String> frontendDeletedImages = (List<String>) productDetails.get("deletedImages");
                // Объединяем оба списка, убирая дубликаты
                deletedImages.addAll(frontendDeletedImages.stream()
                        .filter(img -> !deletedImages.contains(img))
                        .collect(Collectors.toList()));
            }

            // Сохраняем обновленный товар
            Product updatedProduct = productRepository.save(product);

            // Удаляем удаленные фото из S3 в фоне
            if (!deletedImages.isEmpty()) {
                new Thread(() -> {
                    try {
                        s3Service.deleteMultipleFiles(deletedImages);
                        log.info("Deleted {} images for product ID {}: {}",
                                deletedImages.size(), id, deletedImages);
                    } catch (Exception e) {
                        log.error("Failed to delete images for product ID {}: {}", id, e.getMessage());
                    }
                }).start();
            }

            log.info("Product updated: ID {}, images deleted: {}, images total: {}",
                    id, deletedImages.size(), newImages.size());

            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            log.error("Error updating product ID {}: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Ошибка обновления товара: " + e.getMessage()
            ));
        }
    }

    // ProductController.java - обновляем метод deleteProduct
    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            Optional<Product> productOptional = productRepository.findById(id);

            if (productOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Product product = productOptional.get();

            // Собираем все URL фотографий товара
            List<String> imageUrls = new ArrayList<>();

            // Основное фото
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                imageUrls.add(product.getImageUrl());
            }

            // Дополнительные фото
            if (product.getAdditionalImages() != null && !product.getAdditionalImages().isEmpty()) {
                imageUrls.addAll(product.getAdditionalImages());
            }

            // Удаляем товар из БД
            productRepository.deleteById(id);

            // Удаляем фото из S3 (в фоновом режиме, чтобы не блокировать ответ)
            if (!imageUrls.isEmpty()) {
                new Thread(() -> {
                    try {
                        s3Service.deleteMultipleFiles(imageUrls);
                        log.info("Deleted {} images for product ID {}", imageUrls.size(), id);
                    } catch (Exception e) {
                        log.error("Failed to delete images for product ID {}: {}", id, e.getMessage());
                    }
                }).start();
            }

            log.info("Product deleted: ID {}, images deleted: {}", id, imageUrls.size());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Товар и его фотографии удалены",
                    "imagesDeleted", imageUrls.size()
            ));

        } catch (Exception e) {
            log.error("Error deleting product: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка удаления товара"
            ));
        }
    }

    // ========== УПРАВЛЕНИЕ ЗАКАЗАМИ ==========

    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        try {
            List<Order> orders = orderRepository.findAll();
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки заказов: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderById(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        Optional<Order> order = orderRepository.findById(id);
        return order.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id,
                                               @RequestBody Map<String, String> statusUpdate,
                                               HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        try {
            Optional<Order> orderOptional = orderRepository.findById(id);

            if (orderOptional.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Order order = orderOptional.get();
            String newStatus = statusUpdate.get("status");

            // Валидация статуса
            if (isValidStatus(newStatus)) {
                order.setStatus(newStatus);
                Order updatedOrder = orderRepository.save(order);
                return ResponseEntity.ok(updatedOrder);
            } else {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Неверный статус заказа"
                ));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка обновления статуса: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        try {
            if (!orderRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            orderRepository.deleteById(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Заказ удален"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка удаления заказа: " + e.getMessage()
            ));
        }
    }

    // ========== СТАТИСТИКА ==========

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        try {
            long totalProducts = productRepository.count();
            long totalOrders = orderRepository.count();

            // Можно добавить более сложную статистику

            return ResponseEntity.ok(Map.of(
                    "totalProducts", totalProducts,
                    "totalOrders", totalOrders
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки статистики: " + e.getMessage()
            ));
        }
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ ==========

    private boolean isValidStatus(String status) {
        return status != null && List.of("NEW", "PROCESSING", "COMPLETED", "CANCELLED").contains(status);
    }
}