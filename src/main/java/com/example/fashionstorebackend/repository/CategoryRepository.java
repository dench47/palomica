package com.example.fashionstorebackend.repository;

import com.example.fashionstorebackend.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    // Найти все активные категории, отсортированные по displayOrder
    List<Category> findByIsActiveTrueOrderByDisplayOrderAsc();

    // Найти категорию по имени
    Optional<Category> findByName(String name);

    // Найти все категории (включая неактивные) отсортированные по displayOrder
    List<Category> findAllByOrderByDisplayOrderAsc();

    // Проверить существование категории по имени
    boolean existsByName(String name);

    // Найти категории по статусу активности
    List<Category> findByIsActive(Boolean isActive);

    // Найти категорию с подкатегориями по ID
    @Query("SELECT c FROM Category c LEFT JOIN FETCH c.subcategories s WHERE c.id = :id AND c.isActive = true ORDER BY s.displayOrder ASC")
    Optional<Category> findByIdWithActiveSubcategories(@Param("id") Long id);
}