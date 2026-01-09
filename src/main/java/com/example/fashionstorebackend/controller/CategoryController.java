package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.CategoryDTO;
import com.example.fashionstorebackend.dto.SubcategoryDTO;
import com.example.fashionstorebackend.service.CategoryService;
import com.example.fashionstorebackend.service.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/categories")
@CrossOrigin(origins = "http://localhost:5173")
public class CategoryController {

    private static final Logger log = LoggerFactory.getLogger(CategoryController.class);

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private JwtService jwtService;

    // Проверка авторизации администратора
    private boolean isAdmin(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return false;
        }

        String token = authHeader.substring(7);
        return jwtService.validateToken(token);
    }

    // ========== КАТЕГОРИИ ==========


    // Получить все активные категории
    @GetMapping
    public ResponseEntity<?> getAllCategories(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            List<CategoryDTO> categories = categoryService.getAllActiveCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error fetching categories: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки категорий: " + e.getMessage()
            ));
        }
    }

    // Получить все категории (включая неактивные)
    @GetMapping("/all")
    public ResponseEntity<?> getAllCategoriesIncludingInactive(HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            List<CategoryDTO> categories = categoryService.getAllCategories();
            return ResponseEntity.ok(categories);
        } catch (Exception e) {
            log.error("Error fetching all categories: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки категорий: " + e.getMessage()
            ));
        }
    }

    // Получить категорию по ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getCategoryById(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            CategoryDTO category = categoryService.getCategoryById(id);
            if (category == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(category);
        } catch (Exception e) {
            log.error("Error fetching category ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка загрузки категории: " + e.getMessage()
            ));
        }
    }

    // Создать категорию
    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryDTO categoryDTO, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            // Валидация
            if (categoryDTO.getName() == null || categoryDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Название категории обязательно"
                ));
            }

            CategoryDTO createdCategory = categoryService.createCategory(categoryDTO);
            return ResponseEntity.ok(createdCategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error creating category: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка создания категории: " + e.getMessage()
            ));
        }
    }

    // Обновить категорию
    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(@PathVariable Long id, @RequestBody CategoryDTO categoryDTO, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            // Валидация
            if (categoryDTO.getName() == null || categoryDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Название категории обязательно"
                ));
            }

            CategoryDTO updatedCategory = categoryService.updateCategory(id, categoryDTO);
            return ResponseEntity.ok(updatedCategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error updating category ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка обновления категории: " + e.getMessage()
            ));
        }
    }

    // Удалить категорию (ПОЛНОЕ УДАЛЕНИЕ)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Категория полностью удалена"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error deleting category ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка удаления категории: " + e.getMessage()
            ));
        }
    }

    // ========== ПОДКАТЕГОРИИ ==========

    // Получить подкатегории для категории
    @GetMapping("/{categoryId}/subcategories")
    public ResponseEntity<?> getSubcategoriesByCategory(@PathVariable Long categoryId, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

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

    // Создать подкатегорию
    @PostMapping("/subcategories")
    public ResponseEntity<?> createSubcategory(@RequestBody SubcategoryDTO subcategoryDTO, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            // Валидация
            if (subcategoryDTO.getName() == null || subcategoryDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Название подкатегории обязательно"
                ));
            }

            if (subcategoryDTO.getCategoryId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "ID категории обязательно"
                ));
            }

            SubcategoryDTO createdSubcategory = categoryService.createSubcategory(subcategoryDTO);
            return ResponseEntity.ok(createdSubcategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error creating subcategory: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка создания подкатегории: " + e.getMessage()
            ));
        }
    }

    // Обновить подкатегорию
    @PutMapping("/subcategories/{id}")
    public ResponseEntity<?> updateSubcategory(@PathVariable Long id, @RequestBody SubcategoryDTO subcategoryDTO, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            // Валидация
            if (subcategoryDTO.getName() == null || subcategoryDTO.getName().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "Название подкатегории обязательно"
                ));
            }

            if (subcategoryDTO.getCategoryId() == null) {
                return ResponseEntity.badRequest().body(Map.of(
                        "success", false,
                        "message", "ID категории обязательно"
                ));
            }

            SubcategoryDTO updatedSubcategory = categoryService.updateSubcategory(id, subcategoryDTO);
            return ResponseEntity.ok(updatedSubcategory);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error updating subcategory ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка обновления подкатегории: " + e.getMessage()
            ));
        }
    }

    // Удалить подкатегорию (ПОЛНОЕ УДАЛЕНИЕ)
    @DeleteMapping("/subcategories/{id}")
    public ResponseEntity<?> deleteSubcategory(@PathVariable Long id, HttpServletRequest request) {
        if (!isAdmin(request)) {
            return ResponseEntity.status(403).body(Map.of(
                    "success", false,
                    "message", "Доступ запрещен"
            ));
        }

        try {
            categoryService.deleteSubcategory(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Подкатегория полностью удалена"
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            log.error("Error deleting subcategory ID {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of(
                    "success", false,
                    "message", "Ошибка удаления подкатегории: " + e.getMessage()
            ));
        }
    }
}