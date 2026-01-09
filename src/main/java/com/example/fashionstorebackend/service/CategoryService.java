package com.example.fashionstorebackend.service;

import com.example.fashionstorebackend.dto.CategoryDTO;
import com.example.fashionstorebackend.dto.SubcategoryDTO;
import com.example.fashionstorebackend.model.Category;
import com.example.fashionstorebackend.model.Subcategory;
import com.example.fashionstorebackend.repository.CategoryRepository;
import com.example.fashionstorebackend.repository.SubcategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

    // Получить все активные категории с подкатегориями
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllActiveCategories() {
        List<Category> categories = categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc();
        return categories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Получить все категории (включая неактивные)
    @Transactional(readOnly = true)
    public List<CategoryDTO> getAllCategories() {
        List<Category> categories = categoryRepository.findAllByOrderByDisplayOrderAsc();
        return categories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Получить категорию по ID
    @Transactional(readOnly = true)
    public CategoryDTO getCategoryById(Long id) {
        return categoryRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    // Создать категорию
    @Transactional
    public CategoryDTO createCategory(CategoryDTO categoryDTO) {
        // Проверяем, существует ли категория с таким именем
        if (categoryRepository.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Категория с именем '" + categoryDTO.getName() + "' уже существует");
        }

        Category category = new Category();
        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setDisplayOrder(categoryDTO.getDisplayOrder() != null ? categoryDTO.getDisplayOrder() : 0);
        category.setIsActive(categoryDTO.getIsActive() != null ? categoryDTO.getIsActive() : true);

        Category savedCategory = categoryRepository.save(category);
        return convertToDTO(savedCategory);
    }

    // Обновить категорию
    @Transactional
    public CategoryDTO updateCategory(Long id, CategoryDTO categoryDTO) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Категория с ID " + id + " не найдена"));

        // Проверяем, существует ли другая категория с таким именем
        if (!category.getName().equals(categoryDTO.getName()) &&
                categoryRepository.existsByName(categoryDTO.getName())) {
            throw new IllegalArgumentException("Категория с именем '" + categoryDTO.getName() + "' уже существует");
        }

        category.setName(categoryDTO.getName());
        category.setDescription(categoryDTO.getDescription());
        category.setDisplayOrder(categoryDTO.getDisplayOrder() != null ? categoryDTO.getDisplayOrder() : category.getDisplayOrder());
        category.setIsActive(categoryDTO.getIsActive() != null ? categoryDTO.getIsActive() : category.getIsActive());

        Category updatedCategory = categoryRepository.save(category);
        return convertToDTO(updatedCategory);
    }

    // Удалить категорию (ПОЛНОЕ УДАЛЕНИЕ)
    @Transactional
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Категория с ID " + id + " не найдена"));

        // Проверяем, есть ли товары в этой категории через categoryEntity
        if (!category.getProducts().isEmpty()) {
            throw new IllegalArgumentException("Невозможно удалить категорию, так как в ней есть товары. " +
                    "Сначала удалите или переместите товары из этой категории.");
        }

        // Удаляем все подкатегории категории (они должны быть пустыми)
        if (!category.getSubcategories().isEmpty()) {
            // Проверяем каждую подкатегорию на наличие товаров через subcategoryEntity
            for (Subcategory subcategory : category.getSubcategories()) {
                if (!subcategory.getProducts().isEmpty()) {
                    throw new IllegalArgumentException("Невозможно удалить категорию, так как в подкатегории '" +
                            subcategory.getName() + "' есть товары. " +
                            "Сначала удалите или переместите товары из подкатегории.");
                }
            }
            // Удаляем все подкатегории
            subcategoryRepository.deleteAll(category.getSubcategories());
        }

        // Удаляем саму категорию
        categoryRepository.delete(category);
    }

    // Получить подкатегории для категории
    @Transactional(readOnly = true)
    public List<SubcategoryDTO> getSubcategoriesByCategoryId(Long categoryId) {
        List<Subcategory> subcategories = subcategoryRepository.findByCategoryIdAndIsActiveTrueOrderByDisplayOrderAsc(categoryId);
        return subcategories.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Создать подкатегорию
    @Transactional
    public SubcategoryDTO createSubcategory(SubcategoryDTO subcategoryDTO) {
        Category category = categoryRepository.findById(subcategoryDTO.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Категория с ID " + subcategoryDTO.getCategoryId() + " не найдена"));

        // Проверяем, существует ли подкатегория с таким именем в этой категории
        if (subcategoryRepository.existsByNameAndCategoryId(subcategoryDTO.getName(), subcategoryDTO.getCategoryId())) {
            throw new IllegalArgumentException("Подкатегория с именем '" + subcategoryDTO.getName() + "' уже существует в этой категории");
        }

        Subcategory subcategory = new Subcategory();
        subcategory.setName(subcategoryDTO.getName());
        subcategory.setDescription(subcategoryDTO.getDescription());
        subcategory.setCategory(category);
        subcategory.setDisplayOrder(subcategoryDTO.getDisplayOrder() != null ? subcategoryDTO.getDisplayOrder() : 0);
        subcategory.setIsActive(subcategoryDTO.getIsActive() != null ? subcategoryDTO.getIsActive() : true);

        Subcategory savedSubcategory = subcategoryRepository.save(subcategory);
        return convertToDTO(savedSubcategory);
    }

    // Обновить подкатегорию
    @Transactional
    public SubcategoryDTO updateSubcategory(Long id, SubcategoryDTO subcategoryDTO) {
        Subcategory subcategory = subcategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Подкатегория с ID " + id + " не найдена"));

        // Если меняется категория
        if (!subcategory.getCategory().getId().equals(subcategoryDTO.getCategoryId())) {
            Category newCategory = categoryRepository.findById(subcategoryDTO.getCategoryId())
                    .orElseThrow(() -> new IllegalArgumentException("Категория с ID " + subcategoryDTO.getCategoryId() + " не найдена"));
            subcategory.setCategory(newCategory);
        }

        // Проверяем, существует ли другая подкатегория с таким именем в категории
        if (!subcategory.getName().equals(subcategoryDTO.getName()) &&
                subcategoryRepository.existsByNameAndCategoryId(subcategoryDTO.getName(), subcategoryDTO.getCategoryId())) {
            throw new IllegalArgumentException("Подкатегория с именем '" + subcategoryDTO.getName() + "' уже существует в этой категории");
        }

        subcategory.setName(subcategoryDTO.getName());
        subcategory.setDescription(subcategoryDTO.getDescription());
        subcategory.setDisplayOrder(subcategoryDTO.getDisplayOrder() != null ? subcategoryDTO.getDisplayOrder() : subcategory.getDisplayOrder());
        subcategory.setIsActive(subcategoryDTO.getIsActive() != null ? subcategoryDTO.getIsActive() : subcategory.getIsActive());

        Subcategory updatedSubcategory = subcategoryRepository.save(subcategory);
        return convertToDTO(updatedSubcategory);
    }

    // Удалить подкатегорию (ПОЛНОЕ УДАЛЕНИЕ)
    @Transactional
    public void deleteSubcategory(Long id) {
        Subcategory subcategory = subcategoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Подкатегория с ID " + id + " не найдена"));

        // Проверяем, есть ли товары в этой подкатегории через subcategoryEntity
        if (!subcategory.getProducts().isEmpty()) {
            throw new IllegalArgumentException("Невозможно удалить подкатегорию, так как в ней есть товары. " +
                    "Сначала удалите или переместите товары из этой подкатегории.");
        }

        // Удаляем подкатегорию
        subcategoryRepository.delete(subcategory);
    }

    // Конвертация Category в CategoryDTO
    private CategoryDTO convertToDTO(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setName(category.getName());
        dto.setDescription(category.getDescription());
        dto.setDisplayOrder(category.getDisplayOrder());
        dto.setIsActive(category.getIsActive());

        // Конвертируем подкатегории если они загружены
        if (category.getSubcategories() != null) {
            List<SubcategoryDTO> subcategoryDTOs = category.getSubcategories().stream()
                    .filter(Subcategory::getIsActive)
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            dto.setSubcategories(subcategoryDTOs);
        }

        return dto;
    }

    // Конвертация Subcategory в SubcategoryDTO
    private SubcategoryDTO convertToDTO(Subcategory subcategory) {
        SubcategoryDTO dto = new SubcategoryDTO();
        dto.setId(subcategory.getId());
        dto.setName(subcategory.getName());
        dto.setDescription(subcategory.getDescription());
        dto.setCategoryId(subcategory.getCategory().getId());
        dto.setCategoryName(subcategory.getCategory().getName());
        dto.setDisplayOrder(subcategory.getDisplayOrder());
        dto.setIsActive(subcategory.getIsActive());
        return dto;
    }

    // Конвертация CategoryDTO в Category (для обновления)
    private Category convertToEntity(CategoryDTO dto) {
        Category category = new Category();
        category.setId(dto.getId());
        category.setName(dto.getName());
        category.setDescription(dto.getDescription());
        category.setDisplayOrder(dto.getDisplayOrder());
        category.setIsActive(dto.getIsActive());
        return category;
    }
}