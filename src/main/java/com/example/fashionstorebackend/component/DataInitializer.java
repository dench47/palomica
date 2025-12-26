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
        // 1. Сначала обновляем категории у существующих товаров
        updateCategoriesForExistingProducts();

        // 2. Проверяем, какие товары уже есть
        List<Product> existingProducts = productRepository.findAll();
        List<String> existingProductNames = existingProducts.stream()
                .map(Product::getName)
                .toList();

        // 3. Создаём список ВСЕХ товаров через фабрику
        List<Product> allProducts = ProductFactory.createAllProducts();

        // 4. Фильтруем только те, которых ещё нет
        List<Product> newProducts = allProducts.stream()
                .filter(product -> !existingProductNames.contains(product.getName()))
                .toList();

        // 5. Добавляем только новые товары
        if (!newProducts.isEmpty()) {
            productRepository.saveAll(newProducts);
            System.out.println(">>> Добавлено " + newProducts.size() + " новых товаров.");

            // Выводим список добавленных товаров
            System.out.println(">>> Добавленные товары:");
            newProducts.forEach(p -> System.out.println(">>>   - " + p.getName() + " (" + p.getCategory() + ")"));
        } else {
            System.out.println(">>> Все товары уже в базе. Новых не добавлено.");
        }

        // 6. Статистика
        long totalCount = productRepository.count();
        System.out.println(">>> Всего в базе: " + totalCount + " товаров.");

        // Подсчёт по категориям
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
                name.contains("костюм") || name.contains("жакет")) {
            return "одежда";
        } else if (name.contains("ремен") || name.contains("пояс") || name.contains("баска") ||
                name.contains("пеплум") || name.contains("воротник") || name.contains("манжета") ||
                name.contains("шарф") || name.contains("перчатка") || name.contains("шляпа")) {
            return "аксессуары";
        } else if (name.contains("сумка") || name.contains("рюкзак") || name.contains("клатч") ||
                name.contains("кошелёк") || name.contains("портфель")) {
            return "сумки";
        } else if (name.contains("сувенир") || name.contains("открытка") || name.contains("магнит") ||
                name.contains("упаковка") || name.contains("подарок")) {
            return "сувениры";
        }

        return "одежда"; // категория по умолчанию
    }
}