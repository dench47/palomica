package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.*;
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

            // Проверяем доступность товаров и создаем позиции заказа
            for (OrderRequest.OrderItemRequest itemRequest : orderRequest.getItems()) {
                Optional<Product> productOpt = productRepository.findById(itemRequest.getProductId());
                if (productOpt.isEmpty()) {
                    return ResponseEntity.badRequest().body("Товар не найден: " + itemRequest.getProductId());
                }

                Product product = productOpt.get();

                // Проверяем наличие товара
                if (product.getAvailableQuantity() == null ||
                        product.getAvailableQuantity() < itemRequest.getQuantity()) {
                    return ResponseEntity.badRequest()
                            .body("Недостаточно товара на складе: " + product.getName() +
                                    ". Доступно: " + product.getAvailableQuantity());
                }

                // Уменьшаем количество товара
                product.setAvailableQuantity(product.getAvailableQuantity() - itemRequest.getQuantity());
                productRepository.save(product);

                // Создаем позицию заказа
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