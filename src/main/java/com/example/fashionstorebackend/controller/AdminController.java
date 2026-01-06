package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.model.Product;
import com.example.fashionstorebackend.model.Order;
import com.example.fashionstorebackend.repository.ProductRepository;
import com.example.fashionstorebackend.repository.OrderRepository;
import com.example.fashionstorebackend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:5173")
public class AdminController {

    @Autowired
    private JwtService jwtService;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

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
                                           @RequestBody Product productDetails,
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

            // Обновляем только переданные поля
            if (productDetails.getName() != null) {
                product.setName(productDetails.getName());
            }
            if (productDetails.getDescription() != null) {
                product.setDescription(productDetails.getDescription());
            }
            if (productDetails.getPrice() != null) {
                product.setPrice(productDetails.getPrice());
            }
            if (productDetails.getImageUrl() != null) {
                product.setImageUrl(productDetails.getImageUrl());
            }
            if (productDetails.getColor() != null) {
                product.setColor(productDetails.getColor());
            }
            if (productDetails.getSize() != null) {
                product.setSize(productDetails.getSize());
            }
            if (productDetails.getMaterial() != null) {
                product.setMaterial(productDetails.getMaterial());
            }
            if (productDetails.getCareInstructions() != null) {
                product.setCareInstructions(productDetails.getCareInstructions());
            }
            if (productDetails.getCategory() != null) {
                product.setCategory(productDetails.getCategory());
            }
            if (productDetails.getSubcategory() != null) {
                product.setSubcategory(productDetails.getSubcategory());
            }
            if (productDetails.getAvailableQuantity() != null) {
                product.setAvailableQuantity(productDetails.getAvailableQuantity());
            }
            if (productDetails.getReservedQuantity() != null) {
                product.setReservedQuantity(productDetails.getReservedQuantity());
            }
            if (productDetails.getAdditionalImages() != null) {
                product.setAdditionalImages(productDetails.getAdditionalImages());
            }

            Product updatedProduct = productRepository.save(product);
            return ResponseEntity.ok(updatedProduct);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Ошибка обновления товара: " + e.getMessage()
            ));
        }
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body("Доступ запрещен");
        }

        try {
            if (!productRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            productRepository.deleteById(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Товар удален"
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка удаления товара: " + e.getMessage()
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