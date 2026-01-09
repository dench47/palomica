package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.ProductDTO;
import com.example.fashionstorebackend.model.Product;
import com.example.fashionstorebackend.model.Order;
import com.example.fashionstorebackend.model.Category;
import com.example.fashionstorebackend.model.Subcategory;
import com.example.fashionstorebackend.repository.ProductRepository;
import com.example.fashionstorebackend.repository.OrderRepository;
import com.example.fashionstorebackend.repository.CategoryRepository;
import com.example.fashionstorebackend.repository.SubcategoryRepository;
import com.example.fashionstorebackend.service.JwtService;
import com.example.fashionstorebackend.service.S3Service;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
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
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

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

            // Преобразуем Entity в DTO
            List<ProductDTO> productDTOs = products.stream()
                    .map(ProductDTO::new)
                    .collect(Collectors.toList());

            log.info("Found {} products", productDTOs.size());
            return ResponseEntity.ok(productDTOs);
        } catch (Exception e) {
            log.error("Error fetching products: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки товаров: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            Optional<Product> productOpt = productRepository.findById(id);
            if (productOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            ProductDTO dto = new ProductDTO(productOpt.get());
            return ResponseEntity.ok(dto);
        } catch (Exception e) {
            log.error("Error fetching product ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки товара: " + e.getMessage()
            ));
        }
    }


    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Map<String, Object> productData, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            Product product = new Product();

            // Основные поля
            product.setName((String) productData.get("name"));
            product.setDescription((String) productData.get("description"));

            if (productData.get("price") != null) {
                product.setPrice(((Number) productData.get("price")).doubleValue());
            }

            product.setImageUrl((String) productData.get("imageUrl"));
            product.setColor((String) productData.get("color"));
            product.setSize((String) productData.get("size"));
            product.setMaterial((String) productData.get("material"));
            product.setCareInstructions((String) productData.get("careInstructions"));

            // Обработка категории - ПО ID
            Long categoryId = null;
            if (productData.get("categoryId") != null) {
                categoryId = ((Number) productData.get("categoryId")).longValue();
            }

            if (categoryId != null) {
                Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
                if (categoryOpt.isPresent()) {
                    product.setCategoryEntity(categoryOpt.get());
                    log.info("Set category for product: ID {}", categoryId);
                } else {
                    // Категория по умолчанию
                    Optional<Category> defaultCategory = categoryRepository.findByName("одежда");
                    if (defaultCategory.isPresent()) {
                        product.setCategoryEntity(defaultCategory.get());
                        log.warn("Category ID {} not found, using default category 'одежда'", categoryId);
                    }
                }
            } else {
                // Категория по умолчанию
                Optional<Category> defaultCategory = categoryRepository.findByName("одежда");
                if (defaultCategory.isPresent()) {
                    product.setCategoryEntity(defaultCategory.get());
                    log.warn("No category specified, using default category 'одежда'");
                }
            }

            // Обработка подкатегории - ПО ID
            Long subcategoryId = null;
            if (productData.get("subcategoryId") != null) {
                subcategoryId = ((Number) productData.get("subcategoryId")).longValue();
            }

            if (subcategoryId != null) {
                Optional<Subcategory> subcategoryOpt = subcategoryRepository.findById(subcategoryId);
                if (subcategoryOpt.isPresent()) {
                    // Проверяем, что подкатегория принадлежит правильной категории
                    Subcategory subcategory = subcategoryOpt.get();
                    if (product.getCategoryEntity() != null &&
                            subcategory.getCategory().getId().equals(product.getCategoryEntity().getId())) {
                        product.setSubcategoryEntity(subcategory);
                        log.info("Set subcategory for product: ID {}", subcategoryId);
                    } else {
                        log.warn("Subcategory ID {} doesn't belong to category ID {}, ignoring",
                                subcategoryId, product.getCategoryEntity().getId());
                    }
                }
            }

            // Количества
            if (productData.get("availableQuantity") != null) {
                product.setAvailableQuantity(((Number) productData.get("availableQuantity")).intValue());
            } else {
                product.setAvailableQuantity(0);
            }

            if (productData.get("reservedQuantity") != null) {
                product.setReservedQuantity(((Number) productData.get("reservedQuantity")).intValue());
            } else {
                product.setReservedQuantity(0);
            }

            // Дополнительные изображения
            if (productData.get("additionalImages") != null) {
                @SuppressWarnings("unchecked")
                List<String> additionalImages = (List<String>) productData.get("additionalImages");
                product.setAdditionalImages(additionalImages);
            } else {
                product.setAdditionalImages(new ArrayList<>());
            }

            // Сохраняем
            Product savedProduct = productRepository.save(product);

            log.info("Product created: ID {}, name: {}, categoryId: {}, subcategoryId: {}",
                    savedProduct.getId(),
                    savedProduct.getName(),
                    savedProduct.getCategoryEntity() != null ? savedProduct.getCategoryEntity().getId() : "null",
                    savedProduct.getSubcategoryEntity() != null ? savedProduct.getSubcategoryEntity().getId() : "null");

            // Возвращаем DTO
            ProductDTO responseDTO = new ProductDTO(savedProduct);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error creating product: {}", e.getMessage(), e);
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

            // Сохраняем старые фото для сравнения
            List<String> oldImages = new ArrayList<>();
            if (product.getImageUrl() != null && !product.getImageUrl().isEmpty()) {
                oldImages.add(product.getImageUrl());
            }
            if (product.getAdditionalImages() != null) {
                oldImages.addAll(product.getAdditionalImages());
            }

            // Обновляем основные поля
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

            // Обновление категории - ПО ID
            if (productDetails.get("categoryId") != null) {
                Long categoryId = ((Number) productDetails.get("categoryId")).longValue();
                Optional<Category> categoryOpt = categoryRepository.findById(categoryId);
                if (categoryOpt.isPresent()) {
                    product.setCategoryEntity(categoryOpt.get());
                    log.info("Updated category to ID {}", categoryId);

                    // Если изменилась категория, возможно нужно сбросить подкатегорию
                    if (product.getSubcategoryEntity() != null &&
                            !product.getSubcategoryEntity().getCategory().getId().equals(categoryId)) {
                        product.setSubcategoryEntity(null);
                        log.info("Reset subcategory because category changed");
                    }
                }
            }

            // Обновление подкатегории - ПО ID
            if (productDetails.get("subcategoryId") != null) {
                Long subcategoryId = ((Number) productDetails.get("subcategoryId")).longValue();
                Optional<Subcategory> subcategoryOpt = subcategoryRepository.findById(subcategoryId);
                if (subcategoryOpt.isPresent()) {
                    Subcategory subcategory = subcategoryOpt.get();
                    // Проверяем, что подкатегория принадлежит текущей категории товара
                    if (product.getCategoryEntity() != null &&
                            subcategory.getCategory().getId().equals(product.getCategoryEntity().getId())) {
                        product.setSubcategoryEntity(subcategory);
                        log.info("Updated subcategory to ID {}", subcategoryId);
                    } else {
                        log.warn("Subcategory ID {} doesn't belong to category ID {}, ignoring",
                                subcategoryId, product.getCategoryEntity().getId());
                    }
                }
            }

            if (productDetails.get("availableQuantity") != null) {
                product.setAvailableQuantity(((Number) productDetails.get("availableQuantity")).intValue());
            }
            if (productDetails.get("reservedQuantity") != null) {
                product.setReservedQuantity(((Number) productDetails.get("reservedQuantity")).intValue());
            }

            // Дополнительные изображения
            if (productDetails.get("additionalImages") != null) {
                @SuppressWarnings("unchecked")
                List<String> additionalImages = (List<String>) productDetails.get("additionalImages");
                product.setAdditionalImages(additionalImages);
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

            // Также получаем список удаленных фото от фронтенда
            if (productDetails.get("deletedImages") != null) {
                @SuppressWarnings("unchecked")
                List<String> frontendDeletedImages = (List<String>) productDetails.get("deletedImages");
                deletedImages.addAll(frontendDeletedImages);
            }

            // Убираем дубликаты
            deletedImages = deletedImages.stream().distinct().collect(Collectors.toList());

            // Сохраняем обновленный товар
            Product updatedProduct = productRepository.save(product);

            // Удаляем удаленные фото из S3 в фоне
            if (!deletedImages.isEmpty()) {
                final List<String> imagesForDeletion = deletedImages;
                new Thread(() -> {
                    try {
                        s3Service.deleteMultipleFiles(imagesForDeletion);
                        log.info("Deleted {} images for product ID {}", imagesForDeletion.size(), id);
                    } catch (Exception e) {
                        log.error("Failed to delete images for product ID {}: {}", id, e.getMessage());
                    }
                }).start();
            }

            log.info("Product updated: ID {}, categoryId: {}, subcategoryId: {}",
                    id,
                    product.getCategoryEntity() != null ? product.getCategoryEntity().getId() : "null",
                    product.getSubcategoryEntity() != null ? product.getSubcategoryEntity().getId() : "null");

            // Возвращаем DTO
            ProductDTO responseDTO = new ProductDTO(updatedProduct);
            return ResponseEntity.ok(responseDTO);
        } catch (Exception e) {
            log.error("Error updating product ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Ошибка обновления товара: " + e.getMessage()
            ));
        }
    }




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
                final List<String> imagesToDelete = imageUrls;
                new Thread(() -> {
                    try {
                        s3Service.deleteMultipleFiles(imagesToDelete);
                        log.info("Deleted {} images for product ID {}", imagesToDelete.size(), id);
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
            log.error("Error deleting product: {}", e.getMessage(), e);
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
            log.error("Error fetching orders: {}", e.getMessage(), e);
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

        try {
            Optional<Order> order = orderRepository.findById(id);
            return order.map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            log.error("Error fetching order ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки заказа: " + e.getMessage()
            ));
        }
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

            if (!isValidStatus(newStatus)) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Неверный статус заказа"
                ));
            }

            order.setStatus(newStatus);
            Order updatedOrder = orderRepository.save(order);

            return ResponseEntity.ok(updatedOrder);
        } catch (Exception e) {
            log.error("Error updating order status ID {}: {}", id, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка обновления статуса заказа: " + e.getMessage()
            ));
        }
    }

    // ========== СТАТИСТИКА ==========

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            long totalProducts = productRepository.count();
            long totalOrders = orderRepository.count();
            long totalCategories = categoryRepository.count();
            long totalSubcategories = subcategoryRepository.count();

            return ResponseEntity.ok(Map.of(
                    "totalProducts", totalProducts,
                    "totalOrders", totalOrders,
                    "totalCategories", totalCategories,
                    "totalSubcategories", totalSubcategories
            ));
        } catch (Exception e) {
            log.error("Error fetching stats: {}", e.getMessage(), e);
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