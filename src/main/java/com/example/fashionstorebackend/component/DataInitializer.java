package com.example.fashionstorebackend.component;

import com.example.fashionstorebackend.model.AdminUser;
import com.example.fashionstorebackend.model.Product;
import com.example.fashionstorebackend.model.Category;
import com.example.fashionstorebackend.model.Subcategory;
import com.example.fashionstorebackend.repository.AdminUserRepository;
import com.example.fashionstorebackend.repository.ProductRepository;
import com.example.fashionstorebackend.repository.CategoryRepository;
import com.example.fashionstorebackend.repository.SubcategoryRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class DataInitializer {

    private final ProductRepository productRepository;
    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private SubcategoryRepository subcategoryRepository;

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
            admin.setRole("ROLE_ADMIN");
            adminUserRepository.save(admin);
            log.info("Создан администратор: admin / admin123");
        }
    }

    @PostConstruct
    public void initCategories() {
        log.info("Инициализация категорий и подкатегорий...");

        // Проверяем, есть ли уже категории в базе
        if (categoryRepository.count() > 0) {
            log.info("Категории уже существуют, пропускаем инициализацию");
            return;
        }

        // Создаем основные категории
        Category clothing = createCategory("одежда", "Одежда для женщин и мужчин", 1);
        Category bags = createCategory("сумки", "Сумки, рюкзаки, кошельки", 2);
        Category accessories = createCategory("аксессуары", "Аксессуары и украшения", 3);
        Category shoes = createCategory("обувь", "Обувь для любого сезона", 4);

        // Создаем подкатегории для "одежда"
        Subcategory dresses = createSubcategory("платья", "Вечерние и повседневные платья", clothing, 1);
        Subcategory skirts = createSubcategory("юбки", "Юбки различных фасонов", clothing, 2);
        Subcategory blouses = createSubcategory("блузки", "Блузки и топы", clothing, 3);
        Subcategory pants = createSubcategory("брюки", "Брюки и джинсы", clothing, 4);
        Subcategory suits = createSubcategory("костюмы", "Костюмы и жакеты", clothing, 5);
        Subcategory outerwear = createSubcategory("верхняя одежда", "Пальто, куртки, пуховики", clothing, 6);
        Subcategory tops = createSubcategory("топы", "Топы и майки", clothing, 7);
        Subcategory shirts = createSubcategory("рубашки", "Рубашки и сорочки", clothing, 8);
        Subcategory tshirts = createSubcategory("футболки", "Футболки и лонгсливы", clothing, 9);

        // Создаем подкатегории для "сумки"
        Subcategory clutches = createSubcategory("клатчи", "Вечерние клатчи", bags, 1);
        Subcategory shoulderBags = createSubcategory("сумки через плечо", "Повседневные сумки", bags, 2);
        Subcategory backpacks = createSubcategory("рюкзаки", "Стильные рюкзаки", bags, 3);
        Subcategory wallets = createSubcategory("кошельки", "Кошельки и портмоне", bags, 4);
        Subcategory travelBags = createSubcategory("дорожные сумки", "Сумки для путешествий", bags, 5);
        Subcategory shoppers = createSubcategory("шопперы", "Сумки-шопперы", bags, 6);

        // Создаем подкатегории для "аксессуары"
        Subcategory jewelry = createSubcategory("украшения", "Бижутерия и ювелирные изделия", accessories, 1);
        Subcategory belts = createSubcategory("пояса", "Ремни и пояса", accessories, 2);
        Subcategory scarves = createSubcategory("шарфы", "Шарфы и платки", accessories, 3);
        Subcategory hats = createSubcategory("головные уборы", "Шляпы, кепки, береты", accessories, 4);
        Subcategory gloves = createSubcategory("перчатки", "Перчатки и варежки", accessories, 5);
        Subcategory basques = createSubcategory("баски", "Пеплумы и баски", accessories, 6);

        // Создаем подкатегории для "обувь"
        Subcategory shoesHeels = createSubcategory("туфли", "Туфли на каблуке и без", shoes, 1);
        Subcategory sandals = createSubcategory("босоножки", "Летние босоножки", shoes, 2);
        Subcategory sneakers = createSubcategory("кроссовки", "Спортивная обувь", shoes, 3);
        Subcategory boots = createSubcategory("сапоги", "Сапоги и ботинки", shoes, 4);
        Subcategory flats = createSubcategory("балетки", "Удобные балетки", shoes, 5);
        Subcategory sandalsBeach = createSubcategory("сандалии", "Пляжные сандалии", shoes, 6);

        log.info("Инициализация категорий завершена. Создано: {} категорий, {} подкатегорий",
                categoryRepository.count(), subcategoryRepository.count());
    }

    @PostConstruct
    public void initSomeData() {
        // Сначала инициализируем категории (если еще не сделано)
        initCategories();

        // Теперь создаем товары с правильными связями
        createProductsWithCategoryEntities();

        long totalCount = productRepository.count();
        System.out.println(">>> Всего в базе: " + totalCount + " товаров.");

        Map<String, Long> categoryCount = productRepository.findAll().stream()
                .filter(p -> p.getCategoryEntity() != null)
                .collect(Collectors.groupingBy(p -> p.getCategoryEntity().getName(), Collectors.counting()));

        categoryCount.forEach((category, count) ->
                System.out.println(">>>   " + category + ": " + count + " товаров"));

        Map<String, Long> subcategoryCount = productRepository.findAll().stream()
                .filter(p -> p.getSubcategoryEntity() != null)
                .collect(Collectors.groupingBy(p -> p.getSubcategoryEntity().getName(), Collectors.counting()));

        if (!subcategoryCount.isEmpty()) {
            System.out.println(">>> Подкатегории:");
            subcategoryCount.forEach((subcategory, count) ->
                    System.out.println(">>>   " + subcategory + ": " + count + " товаров"));
        }

        System.out.println(">>> Изображения товаров размещены в: src/main/resources/static/images/products/");
    }

    private Category createCategory(String name, String description, Integer displayOrder) {
        Category category = new Category(name, description, displayOrder);
        category = categoryRepository.save(category);
        log.info("Создана категория: {}", name);
        return category;
    }

    private Subcategory createSubcategory(String name, String description, Category category, Integer displayOrder) {
        Subcategory subcategory = new Subcategory(name, description, category, displayOrder);
        subcategory = subcategoryRepository.save(subcategory);
        log.info("Создана подкатегория: {} для категории {}", name, category.getName());
        return subcategory;
    }

    private void createProductsWithCategoryEntities() {
        // Проверяем, есть ли уже товары в базе
        if (productRepository.count() > 0) {
            log.info("Товары уже существуют, пропускаем создание");
            return;
        }

        log.info("Создание товаров с правильными связями категорий...");

        // Получаем все категории и подкатегории
        List<Category> categories = categoryRepository.findAll();
        List<Subcategory> subcategories = subcategoryRepository.findAll();

        // Создаем мапу для быстрого поиска категорий и подкатегорий
        Map<String, Category> categoryMap = categories.stream()
                .collect(Collectors.toMap(Category::getName, c -> c));

        Map<String, Subcategory> subcategoryMap = subcategories.stream()
                .collect(Collectors.toMap(Subcategory::getName, s -> s));

        // Создаем товары с правильными связями
        List<Product> products = new ArrayList<>();

        // 1. Вечернее платье из шифона
        Product dress1 = ProductFactory.createDress1();
        dress1.setCategoryEntity(categoryMap.get("одежда"));
        dress1.setSubcategoryEntity(subcategoryMap.get("платья"));
        products.add(dress1);

        // 2. Летнее платье с рюшами
        Product dress2 = ProductFactory.createDress2();
        dress2.setCategoryEntity(categoryMap.get("одежда"));
        dress2.setSubcategoryEntity(subcategoryMap.get("платья"));
        products.add(dress2);

        // 3. Дизайнерская рубашка
        Product shirt = ProductFactory.createShirt();
        shirt.setCategoryEntity(categoryMap.get("одежда"));
        shirt.setSubcategoryEntity(subcategoryMap.get("рубашки"));
        products.add(shirt);

        // 4. Атласный топ с бантом
        Product top = ProductFactory.createTop();
        top.setCategoryEntity(categoryMap.get("одежда"));
        top.setSubcategoryEntity(subcategoryMap.get("топы"));
        products.add(top);

        // 5. Бархатный жилет
        Product vest = ProductFactory.createVest();
        vest.setCategoryEntity(categoryMap.get("одежда"));
        vest.setSubcategoryEntity(subcategoryMap.get("костюмы"));
        products.add(vest);

        // 6. Кожаная юбка-карандаш
        Product skirt1 = ProductFactory.createSkirt1();
        skirt1.setCategoryEntity(categoryMap.get("одежда"));
        skirt1.setSubcategoryEntity(subcategoryMap.get("юбки"));
        products.add(skirt1);

        // 7. Шерстяная юбка плиссе
        Product skirt2 = ProductFactory.createSkirt2();
        skirt2.setCategoryEntity(categoryMap.get("одежда"));
        skirt2.setSubcategoryEntity(subcategoryMap.get("юбки"));
        products.add(skirt2);

        // 8. Джинсовая юбка миди
        Product skirt3 = ProductFactory.createSkirt3();
        skirt3.setCategoryEntity(categoryMap.get("одежда"));
        skirt3.setSubcategoryEntity(subcategoryMap.get("юбки"));
        products.add(skirt3);

        // 9. Воздушная блуза
        Product blouse1 = ProductFactory.createAirBlouse();
        blouse1.setCategoryEntity(categoryMap.get("одежда"));
        blouse1.setSubcategoryEntity(subcategoryMap.get("блузки"));
        products.add(blouse1);

        // 10. Блуза с драпировкой
        Product blouse2 = ProductFactory.createPhotoBlouse();
        blouse2.setCategoryEntity(categoryMap.get("одежда"));
        blouse2.setSubcategoryEntity(subcategoryMap.get("блузки"));
        products.add(blouse2);

        // 11. Кожаный ремень с пряжкой
        Product belt = ProductFactory.createBelt();
        belt.setCategoryEntity(categoryMap.get("аксессуары"));
        belt.setSubcategoryEntity(subcategoryMap.get("пояса"));
        products.add(belt);

        // 12. Пеплум-баска
        Product peplum = ProductFactory.createPeplum();
        peplum.setCategoryEntity(categoryMap.get("аксессуары"));
        peplum.setSubcategoryEntity(subcategoryMap.get("баски"));
        products.add(peplum);

        // 13. Сумка-тоут из экокожи
        Product bag = ProductFactory.createBag();
        bag.setCategoryEntity(categoryMap.get("сумки"));
        bag.setSubcategoryEntity(subcategoryMap.get("шопперы"));
        products.add(bag);

        // Сохраняем все товары
        productRepository.saveAll(products);

        log.info("Создано {} товаров с правильными связями категорий", products.size());

        // Логируем для проверки
        for (Product product : products) {
            log.info("Создан товар: ID={}, название='{}', категория='{}' (ID={}), подкатегория='{}' (ID={})",
                    product.getId(),
                    product.getName(),
                    product.getCategory(),
                    product.getCategoryEntity() != null ? product.getCategoryEntity().getId() : "null",
                    product.getSubcategory(),
                    product.getSubcategoryEntity() != null ? product.getSubcategoryEntity().getId() : "null");
        }
    }

    // Метод для обновления старых товаров (если нужно)
    private void updateExistingProducts() {
        List<Product> existingProducts = productRepository.findAll();
        boolean updated = false;

        for (Product product : existingProducts) {
            boolean needsUpdate = false;

            // Если у товара нет категории, устанавливаем по умолчанию
            if (product.getCategoryEntity() == null) {
                Category defaultCategory = categoryRepository.findByName("одежда").orElse(null);
                if (defaultCategory != null) {
                    product.setCategoryEntity(defaultCategory);
                    needsUpdate = true;
                    log.info("Установлена категория по умолчанию для товара {}", product.getId());
                }
            }

            if (needsUpdate) {
                updated = true;
            }
        }

        if (updated) {
            productRepository.saveAll(existingProducts);
            log.info("Обновлены данные у существующих товаров.");
        }
    }
}