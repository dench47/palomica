package com.example.fashionstorebackend.repository;

import com.example.fashionstorebackend.model.Subcategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SubcategoryRepository extends JpaRepository<Subcategory, Long> {

    // Найти все активные подкатегории для категории, отсортированные по displayOrder
    List<Subcategory> findByCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(Long categoryId);

    // Найти все подкатегории для категории (включая неактивные)
    List<Subcategory> findByCategoryId(Long categoryId);

    // Найти подкатегорию по имени и категории
    Optional<Subcategory> findByNameAndCategoryId(String name, Long categoryId);

    // Найти активные подкатегории
    List<Subcategory> findByIsActiveTrueOrderByDisplayOrderAsc();

    // Проверить существование подкатегории по имени в категории
    boolean existsByNameAndCategoryId(String name, Long categoryId);

    // Найти подкатегорию по имени (без привязки к категории)
    Optional<Subcategory> findByName(String name);

    // Найти все подкатегории с информацией о категории
    @Query("SELECT s FROM Subcategory s JOIN FETCH s.category c WHERE s.isActive = true ORDER BY c.displayOrder ASC, s.displayOrder ASC")
    List<Subcategory> findAllActiveWithCategory();

    // Найти подкатегории по статусу активности
    List<Subcategory> findByIsActive(Boolean isActive);
}