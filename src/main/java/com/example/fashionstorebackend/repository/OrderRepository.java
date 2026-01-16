package com.example.fashionstorebackend.repository;

import com.example.fashionstorebackend.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    // Метод для получения всех заказов, отсортированных по дате создания (новые сверху)
    List<Order> findAllByOrderByCreatedAtDesc();

    // Метод для получения заказов по статусу, отсортированных по дате
    List<Order> findAllByStatusOrderByCreatedAtDesc(String status);

    // Метод для поиска заказа по токену доступа
    Optional<Order> findByAccessToken(String accessToken);

    // Метод для поиска по номеру заказа (частичное совпадение)
    List<Order> findByOrderNumberContainingIgnoreCaseOrderByCreatedAtDesc(String orderNumber);

    // Метод для поиска по имени клиента (частичное совпадение)
    List<Order> findByCustomerNameContainingIgnoreCaseOrderByCreatedAtDesc(String customerName);

    // Метод для поиска по телефону клиента
    List<Order> findByCustomerPhoneContainingOrderByCreatedAtDesc(String customerPhone);
}