package com.example.fashionstorebackend.component;

import com.example.fashionstorebackend.model.AdminUser;
import com.example.fashionstorebackend.model.Product;
import com.example.fashionstorebackend.repository.AdminUserRepository;
import com.example.fashionstorebackend.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Component
public class DataInitializer {

    private final ProductRepository productRepository;
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);


    @Autowired
    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initAdminUsers() {
        if (adminUserRepository.count() == 0) {
            AdminUser admin = new AdminUser("admin", passwordEncoder.encode("admin123"));
            admin.setRole("ROLE_ADMIN"); // ← УСТАНОВИТЕ РОЛЬ
            adminUserRepository.save(admin);
            log.info("Создан администратор: admin / admin123");
        }
    }

    @PostConstruct
    public void initSomeData() {
        updateProductData();

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
            newProducts.forEach(p -> System.out.println(">>>   - " + p.getName() +
                    " (" + p.getCategory() + "/" + p.getSubcategory() +
                    "), доступно: " + p.getAvailableQuantity() + " шт."));
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

        Map<String, Long> subcategoryCount = productRepository.findAll().stream()
                .filter(p -> p.getSubcategory() != null && !p.getSubcategory().isEmpty())
                .collect(Collectors.groupingBy(Product::getSubcategory, Collectors.counting()));

        if (!subcategoryCount.isEmpty()) {
            System.out.println(">>> Подкатегории:");
            subcategoryCount.forEach((subcategory, count) ->
                    System.out.println(">>>   " + subcategory + ": " + count + " товаров"));
        }

        System.out.println(">>> Изображения товаров размещены в: src/main/resources/static/images/products/");
    }

    private void updateProductData() {
        List<Product> existingProducts = productRepository.findAll();
        boolean updated = false;

        for (Product product : existingProducts) {
            boolean needsUpdate = false;

            // Обновляем категорию, если пустая
            if (product.getCategory() == null || product.getCategory().isEmpty()) {
                String category = determineCategory(product.getName());
                product.setCategory(category);
                needsUpdate = true;
            }

            // Обновляем подкатегорию, если пустая
            if (product.getSubcategory() == null || product.getSubcategory().isEmpty()) {
                String subcategory = determineSubcategory(product.getName());
                product.setSubcategory(subcategory);
                needsUpdate = true;
            }

            // Устанавливаем availableQuantity = 3, если не установлено
            if (product.getAvailableQuantity() == null) {
                product.setAvailableQuantity(3); // ← ЧЕРЕЗ СЕТТЕР
                needsUpdate = true;
            }

            if (needsUpdate) {
                updated = true;
            }
        }

        if (updated) {
            productRepository.saveAll(existingProducts);
            System.out.println(">>> Обновлены данные у существующих товаров.");
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

    private String determineSubcategory(String productName) {
        String name = productName.toLowerCase();

        // Определяем подкатегории для одежды
        if (name.contains("платье")) return "платья";
        if (name.contains("топ")) return "топы";
        if (name.contains("рубашка") || name.contains("блуз")) return "блузки и рубашки";
        if (name.contains("жилет") || name.contains("жакет") || name.contains("пиджак")) return "жакеты";
        if (name.contains("юбка")) return "юбки";
        if (name.contains("брюк") || name.contains("шорт") || name.contains("бридж")) return "брюки";
        if (name.contains("сарафан") || name.contains("фартук")) return "сарафаны и фартуки";
        if (name.contains("футболка") || name.contains("лонгслив") || name.contains("тельняш") || name.contains("тельник"))
            return "футболки и лонгсливы";

        // Определяем подкатегории для аксессуаров
        if (name.contains("баска") || name.contains("пеплум")) return "баски";
        if (name.contains("пояс") || name.contains("ремен")) return "пояса";
        if (name.contains("платок") || name.contains("шарф") || name.contains("палантин") || name.contains("косынка"))
            return "платки";
        if (name.contains("манжет") || name.contains("нарукавник")) return "манжеты";
        if (name.contains("карман")) return "съемные карманы";

        // Определяем подкатегории для сумок
        if (name.contains("шоппер") || name.contains("тоут")) return "шопперы";
        if (name.contains("клатч") || name.contains("вечерняя сумка")) return "клатчи";
        if (name.contains("поясная сумка") || name.contains("бананка")) return "поясные сумки";
        if (name.contains("рюкзак") || name.contains("ранец")) return "рюкзаки";

        return null;
    }
}