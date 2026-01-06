package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.OrderRequest;
import com.example.fashionstorebackend.model.*;
import com.example.fashionstorebackend.repository.OrderRepository;
import com.example.fashionstorebackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Optional;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "http://localhost:5173")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ProductRepository productRepository;

    @PostMapping
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

            // Проверяем доступность товаров
            for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
                Optional<Product> productOpt = productRepository.findById(itemRequest.getProductId());
                if (productOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Товар не найден: " + itemRequest.getProductId());
                }

                Product product = productOpt.get();
                int available = product.getAvailableQuantity() != null ? product.getAvailableQuantity() : 0;
                int reserved = product.getReservedQuantity() != null ? product.getReservedQuantity() : 0;
                int actuallyAvailable = available - reserved;

                if (actuallyAvailable < itemRequest.getQuantity()) {
                    return ResponseEntity.badRequest()
                            .body("Недостаточно товара на складе: " + product.getName() +
                                    ". Доступно: " + Math.max(0, actuallyAvailable) + " шт.");
                }
            }

            // Создаем заказ и уменьшаем количество
            for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
                Product product = productRepository.findById(itemRequest.getProductId()).get();

                // Уменьшаем доступное количество
                product.setAvailableQuantity(product.getAvailableQuantity() - itemRequest.getQuantity());
                // Уменьшаем зарезервированное количество (если было в резерве этой сессии)
                product.setReservedQuantity(
                        Math.max(0, (product.getReservedQuantity() != null ? product.getReservedQuantity() : 0)
                                - itemRequest.getQuantity())
                );
                productRepository.save(product);

                OrderItem orderItem = new OrderItem(
                        product,
                        itemRequest.getQuantity(),
                        itemRequest.getSize(),
                        itemRequest.getColor()
                );

                order.addItem(orderItem);
                totalAmount += product.getPrice() * itemRequest.getQuantity();
            }

            order.setTotalAmount(totalAmount);
            Order savedOrder = orderRepository.save(order);

            return ResponseEntity.ok(savedOrder.getId());

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Ошибка при создании заказа: " + e.getMessage());
        }
    }
}