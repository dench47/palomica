package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.CategoryDTO;
import com.example.fashionstorebackend.dto.SubcategoryDTO;
import com.example.fashionstorebackend.service.CategoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/categories")  // ПУБЛИЧНЫЙ ПУТЬ, без /admin
@CrossOrigin(origins = "http://localhost:5173")
public class PublicCategoryController {

    private static final Logger log = LoggerFactory.getLogger(PublicCategoryController.class);

    @Autowired
    private CategoryService categoryService;

    // Получить все активные категории с подкатегориями (публичный доступ)
    @GetMapping
    public ResponseEntity<?> getAllActiveCategories() {
        try {
            List<CategoryDTO> categories = categoryService.getAllActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error fetching public categories: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки категорий: " + e.getMessage()
            ));
        }
    }

    // Получить подкатегории для категории (публичный доступ)
    @GetMapping("/{categoryId}/subcategories")
    public ResponseEntity<?> getSubcategoriesByCategory(@PathVariable Long categoryId) {
        try {
            List<SubcategoryDTO> subcategories = categoryService.getSubcategoriesByCategoryId(categoryId);
            return ResponseEntity.ok(subcategories);
        } catch (Exception e) {
            log.error("Error fetching subcategories for category ID {}: {}", categoryId, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки подкатегорий: " + e.getMessage()
            ));
        }
    }
}