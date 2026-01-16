package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.OrderDTO;
import com.example.fashionstorebackend.dto.OrderItemDTO;
import com.example.fashionstorebackend.dto.ProductDTO;
import com.example.fashionstorebackend.model.Order;
import com.example.fashionstorebackend.model.OrderItem;
import com.example.fashionstorebackend.model.Product;
import com.example.fashionstorebackend.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/orders")
@CrossOrigin(origins = {"https://palomika.ru", "http://localhost:5173"})
public class OrderPublicController {

    @Autowired
    private OrderRepository orderRepository;

    // Получить заказ по ID и токену
    @GetMapping("/{orderId}")
    public ResponseEntity<?> getOrder(
            @PathVariable Long orderId,
            @RequestParam String token) {

        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (orderOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Заказ не найден");
            return ResponseEntity.status(404).body(error);
        }

        Order order = orderOpt.get();

        // Проверяем токен
        if (!token.equals(order.getAccessToken())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Доступ запрещен. Неверный токен.");
            return ResponseEntity.status(403).body(error);
        }

        // Конвертируем в DTO
        OrderDTO orderDTO = convertToDTO(order);

        return ResponseEntity.ok(orderDTO);
    }

    private OrderDTO convertToDTO(Order order) {
        OrderDTO dto = new OrderDTO();
        dto.setId(order.getId());
        dto.setOrderNumber(order.getOrderNumber()); // ДОБАВИТЬ ЭТУ СТРОКУ!
        dto.setCustomerName(order.getCustomerName());
        dto.setCustomerEmail(order.getCustomerEmail());
        dto.setCustomerPhone(order.getCustomerPhone());
        dto.setDeliveryAddress(order.getDeliveryAddress());
        dto.setDeliveryMethod(order.getDeliveryMethod());
        dto.setPaymentMethod(order.getPaymentMethod());
        dto.setComment(order.getComment());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setStatus(order.getStatus());
        dto.setAccessToken(order.getAccessToken());
        dto.setCreatedAt(order.getCreatedAt());

        // Конвертируем items
        dto.setItems(order.getItems().stream()
                .map(this::convertItemToDTO)
                .collect(Collectors.toList()));

        return dto;
    }

    private OrderItemDTO convertItemToDTO(OrderItem item) {
        OrderItemDTO itemDTO = new OrderItemDTO();
        itemDTO.setId(item.getId());
        itemDTO.setQuantity(item.getQuantity());
        itemDTO.setPrice(item.getPrice());
        itemDTO.setSize(item.getSize());
        itemDTO.setColor(item.getColor());

        // Конвертируем product
        Product product = item.getProduct();
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setName(product.getName());
        productDTO.setImageUrl(product.getImageUrl());
        productDTO.setPrice(product.getPrice());

        itemDTO.setProduct(productDTO);

        return itemDTO;
    }

    // Повторить заказ (получить список товаров)
    @GetMapping("/{orderId}/reorder")
    public ResponseEntity<?> getOrderForReorder(
            @PathVariable Long orderId,
            @RequestParam String token) {

        Optional<Order> orderOpt = orderRepository.findById(orderId);

        if (orderOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Заказ не найден");
            return ResponseEntity.status(404).body(error);
        }

        Order order = orderOpt.get();

        if (!token.equals(order.getAccessToken())) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Доступ запрещен. Неверный токен.");
            return ResponseEntity.status(403).body(error);
        }

        // Создаем упрощенный ответ для повторного заказа
        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("items", order.getItems().stream()
                .map(this::convertToReorderItem)
                .collect(Collectors.toList()));

        return ResponseEntity.ok(response);
    }

    private Map<String, Object> convertToReorderItem(OrderItem item) {
        Map<String, Object> reorderItem = new HashMap<>();
        reorderItem.put("productId", item.getProduct().getId());
        reorderItem.put("productName", item.getProduct().getName());
        reorderItem.put("quantity", item.getQuantity());
        reorderItem.put("size", item.getSize());
        reorderItem.put("color", item.getColor());
        reorderItem.put("price", item.getProduct().getPrice());
        reorderItem.put("imageUrl", item.getProduct().getImageUrl());
        return reorderItem;
    }
}