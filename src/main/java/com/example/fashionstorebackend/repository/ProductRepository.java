package com.example.fashionstorebackend.repository;

import com.example.fashionstorebackend.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository // Указывает, что это компонент Spring, отвечающий за доступ к данным
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Наследуя JpaRepository, мы получаем готовые методы:
    // save(), findAll(), findById(), deleteById() и многие другие.
}