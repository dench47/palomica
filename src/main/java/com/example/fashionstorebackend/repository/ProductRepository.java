package com.example.fashionstorebackend.repository;

import com.example.fashionstorebackend.model.Product; // ← ИЗМЕНИТЬ ИМПОРТ
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
}