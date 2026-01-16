package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.OrderRequest;
import com.example.fashionstorebackend.model.*;
import com.example.fashionstorebackend.repository.OrderRepository;
import com.example.fashionstorebackend.repository.ProductRepository;
import com.example.fashionstorebackend.repository.ProductVariantRepository;
import com.example.fashionstorebackend.service.EmailService;
import com.example.fashionstorebackend.service.TelegramService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = {"https://palomika.ru", "http://localhost:5173"})
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private ProductVariantRepository productVariantRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private TelegramService telegramService; // ДОБАВИЛИ TELEGRAM SERVICE

    @PostMapping
    @Transactional
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest orderRequest) {
        try {
            Order order = new Order();
            order.setCustomerName(orderRequest.getCustomerName());
            order.setCustomerEmail(orderRequest.getCustomerEmail());
            order.setCustomerPhone(orderRequest.getCustomerPhone());
            order.setDeliveryAddress(orderRequest.getDeliveryAddress());
            order.setDeliveryMethod(orderRequest.getDeliveryMethod());
            order.setPaymentMethod(orderRequest.getPaymentMethod());
            order.setComment(orderRequest.getComment());

            double totalAmount = 0;

            // Проверяем доступность товаров по вариантам (размерам)
            for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
                // Находим вариант товара по productId и размеру
                Optional<ProductVariant> variantOpt = productVariantRepository
                        .findByProductIdAndSize(itemRequest.getProductId(), itemRequest.getSize());

                if (variantOpt.isEmpty()) {
                    // Если вариант не найден, пытаемся найти товар
                    Optional<Product> productOpt = productRepository.findById(itemRequest.getProductId());
                    if (productOpt.isEmpty()) {
                        return ResponseEntity.badRequest().body("Товар не найден: ID " + itemRequest.getProductId());
                    }

                    Product product = productOpt.get();
                    // Проверяем, есть ли у товара варианты
                    if (product.getVariants().isEmpty()) {
                        // Если вариантов нет, создаем заказ на весь товар
                        // Но нужно проверить доступность
                        int totalAvailable = product.getTotalActuallyAvailable();
                        if (totalAvailable < itemRequest.getQuantity()) {
                            return ResponseEntity.badRequest()
                                    .body("Недостаточно товара на складе: " + product.getName() +
                                            ". Доступно: " + totalAvailable + " шт.");
                        }
                    } else {
                        // Если есть варианты, но запрошенного размера нет
                        return ResponseEntity.badRequest()
                                .body("Размер " + itemRequest.getSize() + " недоступен для товара: " + product.getName());
                    }
                } else {
                    // Проверяем доступность варианта
                    ProductVariant variant = variantOpt.get();
                    int actuallyAvailable = variant.getActuallyAvailable();

                    if (actuallyAvailable < itemRequest.getQuantity()) {
                        return ResponseEntity.badRequest()
                                .body("Недостаточно товара на складе: " +
                                        variant.getProduct().getName() + " (Размер: " + variant.getSize() + ")" +
                                        ". Доступно: " + actuallyAvailable + " шт.");
                    }
                }
            }

            // Создаем заказ и уменьшаем количество
            for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
                // Находим вариант товара
                Optional<ProductVariant> variantOpt = productVariantRepository
                        .findByProductIdAndSize(itemRequest.getProductId(), itemRequest.getSize());

                Product product;
                Integer actualQuantity;

                if (variantOpt.isPresent()) {
                    // Работаем с вариантом
                    ProductVariant variant = variantOpt.get();
                    product = variant.getProduct();
                    actualQuantity = itemRequest.getQuantity();

                    // Уменьшаем доступное количество у варианта
                    variant.setAvailableQuantity(variant.getAvailableQuantity() - actualQuantity);

                    // Уменьшаем зарезервированное количество (если было в резерве)
                    variant.setReservedQuantity(
                            Math.max(0, variant.getReservedQuantity() - actualQuantity)
                    );

                    productVariantRepository.save(variant);
                } else {
                    // Если вариант не найден (старый товар без вариантов)
                    Optional<Product> productOpt = productRepository.findById(itemRequest.getProductId());
                    if (productOpt.isEmpty()) {
                        continue; // Пропускаем, ошибка уже проверена выше
                    }

                    product = productOpt.get();
                    actualQuantity = itemRequest.getQuantity();

                    // Для старых товаров без вариантов уменьшаем общее количество
                    if (product.getVariants().isEmpty()) {
                        // Если у товара нет вариантов
                    }
                }

                // Создаем элемент заказа
                OrderItem orderItem = new OrderItem(
                        product,
                        actualQuantity,
                        itemRequest.getSize(),
                        itemRequest.getColor()
                );

                order.addItem(orderItem);
                totalAmount += product.getPrice() * actualQuantity;
            }

            order.setTotalAmount(totalAmount);
            Order savedOrder = orderRepository.save(order);

            // ОТПРАВЛЯЕМ ПИСЬМО С ПОДТВЕРЖДЕНИЕМ ЗАКАЗА
            try {
                emailService.sendOrderConfirmation(savedOrder);
                System.out.println("✅ Email отправлен для заказа #" + savedOrder.getOrderNumber());
            } catch (Exception e) {
                // Логируем ошибку, но не прерываем выполнение
                System.err.println("❌ Ошибка отправки email: " + e.getMessage());
                e.printStackTrace();
            }

            // ОТПРАВЛЯЕМ TELEGRAM УВЕДОМЛЕНИЕ АДМИНУ
            try {
                telegramService.sendNewOrderNotification(savedOrder);
                System.out.println("✅ Telegram уведомление отправлено для заказа #" + savedOrder.getOrderNumber());
            } catch (Exception e) {
                System.err.println("❌ Ошибка отправки Telegram уведомления: " + e.getMessage());
                e.printStackTrace();
            }

            // Возвращаем номер заказа и токен
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", savedOrder.getId());
            response.put("orderNumber", savedOrder.getOrderNumber()); // Возвращаем номер заказа
            response.put("accessToken", savedOrder.getAccessToken());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Ошибка при создании заказа: " + e.getMessage());
        }
    }
}