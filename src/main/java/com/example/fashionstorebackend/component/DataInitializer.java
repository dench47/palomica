package com.example.fashionstorebackend.component;

import com.example.fashionstorebackend.Product;
import com.example.fashionstorebackend.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class DataInitializer {

    private final ProductRepository productRepository;

    @Autowired
    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostConstruct
    public void initSomeData() {
        updateCategoriesForExistingProducts();

        List<Product> existingProducts = productRepository.findAll();
        List<String> existingProductNames = existingProducts.stream()
                .map(Product::getName)
                .toList();

        List<Product> allProducts = ProductFactory.createAllProducts();

        List<Product> newProducts = allProducts.stream()
                .filter(product -> !existingProductNames.contains(product.getName()))
                .toList();

        if (!newProducts.isEmpty()) {
            productRepository.saveAll(newProducts);
            System.out.println(">>> Добавлено " + newProducts.size() + " новых товаров.");
            System.out.println(">>> Добавленные товары:");
            newProducts.forEach(p -> System.out.println(">>>   - " + p.getName() + " (" + p.getCategory() + ")"));
        } else {
            System.out.println(">>> Все товары уже в базе. Новых не добавлено.");
        }

        long totalCount = productRepository.count();
        System.out.println(">>> Всего в базе: " + totalCount + " товаров.");

        Map<String, Long> categoryCount = productRepository.findAll().stream()
                .filter(p -> p.getCategory() != null)
                .collect(Collectors.groupingBy(Product::getCategory, Collectors.counting()));

        categoryCount.forEach((category, count) ->
                System.out.println(">>>   " + category + ": " + count + " товаров"));

        System.out.println(">>> Изображения товаров размещены в: src/main/resources/static/images/products/");
    }

    private void updateCategoriesForExistingProducts() {
        List<Product> existingProducts = productRepository.findAll();
        boolean updated = false;

        for (Product product : existingProducts) {
            if (product.getCategory() == null || product.getCategory().isEmpty()) {
                String category = determineCategory(product.getName());
                product.setCategory(category);
                updated = true;
            }
        }

        if (updated) {
            productRepository.saveAll(existingProducts);
            System.out.println(">>> Обновлены категории у существующих товаров.");
        }
    }

    private String determineCategory(String productName) {
        String name = productName.toLowerCase();

        if (name.contains("платье") || name.contains("рубашка") || name.contains("блуз") ||
                name.contains("юбка") || name.contains("топ") || name.contains("жилет") ||
                name.contains("блуза") || name.contains("брюки") || name.contains("пиджак") ||
                name.contains("костюм") || name.contains("жакет") || name.contains("сарафан") ||
                name.contains("фартук") || name.contains("футболка") || name.contains("лонгслив")) {
            return "одежда";
        } else if (name.contains("ремен") || name.contains("пояс") || name.contains("баска") ||
                name.contains("пеплум") || name.contains("воротник") || name.contains("манжета") ||
                name.contains("шарф") || name.contains("платок") || name.contains("карман")) {
            return "аксессуары";
        } else if (name.contains("сумка") || name.contains("рюкзак") || name.contains("клатч") ||
                name.contains("шоппер") || name.contains("поясная сумка")) {
            return "сумки";
        }

        return "одежда";
    }
}