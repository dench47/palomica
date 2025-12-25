package com.example.fashionstorebackend.component;

import com.example.fashionstorebackend.Product;
import com.example.fashionstorebackend.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
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


    private List<Product> createAllProducts() {
        List<Product> products = new ArrayList<>();
        // ========== ОДЕЖДА ==========

        // Товар 1: Вечернее платье
        Product dress = new Product(
                "Вечернее платье",
                "Элегантное платье для особых случаев. Идеально подходит для свадеб, выпускных и торжественных мероприятий.",
                29900.0,
                "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop"
        );
        dress.setColor("Чёрный");
        dress.setSize("XS,S,M,L");
        dress.setMaterial("Шёлк 100%");
        dress.setCareInstructions("Стирка при 30°C, не отбеливать, гладить на низкой температуре");
        dress.setCategory("одежда");
        dress.setAdditionalImages(Arrays.asList(
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop"
        ));
        products.add(dress);

        // Товар 2: Шерстяной пиджак
        Product blazer = new Product(
                "Шерстяной пиджак",
                "Классический пиджак премиального кроя. Идеален для офиса и деловых встреч.",
                18900.0,
                "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&h=1000&fit=crop"
        );
        blazer.setColor("Серый");
        blazer.setSize("46,48,50,52,54");
        blazer.setMaterial("Шерсть 80%, Полиэстер 20%");
        blazer.setCareInstructions("Химчистка, не стирать");
        blazer.setCategory("одежда");
        blazer.setAdditionalImages(Arrays.asList(
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop"
        ));
        products.add(blazer);

        // Товар 3: Шелковая блуза
        Product blouse = new Product(
                "Шелковая блуза",
                "Легкая блуза из натурального шелка. Удобная и элегантная на каждый день.",
                12400.0,
                "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=1000&fit=crop"
        );
        blouse.setColor("Белый");
        blouse.setSize("XS,S,M,L");
        blouse.setMaterial("Шёлк 100%");
        blouse.setCareInstructions("Только ручная стирка, сухая чистка");
        blouse.setCategory("одежда");
        products.add(blouse);

        // Товар 4: Кожаная юбка
        Product skirt = new Product(
                "Кожаная юбка",
                "Стильная юбка-карандаш из мягкой итальянской кожи. Тренд сезона.",
                25600.0,
                "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800&h=1000&fit=crop"
        );
        skirt.setColor("Коричневый");
        skirt.setSize("36,38,40,42");
        skirt.setMaterial("Натуральная кожа");
        skirt.setCareInstructions("Протирать влажной тряпкой, не стирать");
        skirt.setCategory("одежда");
        skirt.setAdditionalImages(Arrays.asList(
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop"
        ));
        products.add(skirt);

        // Товар 5: Кожаные брюки
        Product pants = new Product(
                "Кожаные брюки",
                "Узкие брюки из качественной кожи. Создают эффектный образ.",
                28700.0,
                "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=1000&fit=crop"
        );
        pants.setColor("Чёрный");
        pants.setSize("38,40,42,44");
        pants.setMaterial("Натуральная кожа");
        pants.setCareInstructions("Протирать влажной тряпкой, специальный уход за кожей");
        pants.setCategory("одежда");
        products.add(pants);

        // Товар 6: Кашемировое пальто
        Product coat = new Product(
                "Кашемировое пальто",
                "Теплое пальто из кашемира. Защищает от холода и выглядит роскошно.",
                45200.0,
                "https://images.unsplash.com/photo-1539533018447-63f8ffe8568a?w=800&h=1000&fit=crop"
        );
        coat.setColor("Бежевый");
        coat.setSize("S,M,L,XL");
        coat.setMaterial("Кашемир 90%, Шерсть 10%");
        coat.setCareInstructions("Химчистка, хранить в чехле");
        coat.setCategory("одежда");
        coat.setAdditionalImages(Arrays.asList(
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop"
        ));
        products.add(coat);

        // Товар 7: Блузка с вышивкой (НОВЫЙ)
        Product embroideredBlouse = new Product(
                "Блузка с ручной вышивкой",
                "Шелковая блузка с цветочной вышивкой. Идеально сочетается с юбками и брюками.",
                15600.0,
                "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        embroideredBlouse.setColor("Белый,Голубой");
        embroideredBlouse.setSize("XS,S,M,L");
        embroideredBlouse.setMaterial("Шёлк 100%, Хлопок 20%");
        embroideredBlouse.setCareInstructions("Ручная стирка при 30°C");
        embroideredBlouse.setCategory("одежда");
        embroideredBlouse.setAdditionalImages(Arrays.asList(
                "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=1000&fit=crop"
        ));
        products.add(embroideredBlouse);

        // Товар 8: Топ атласный (НОВЫЙ)
        Product satinTop = new Product(
                "Атласный топ",
                "Гладкий топ для вечернего образа или под пиджак.",
                8900.0,
                "https://images.unsplash.com/photo-1585487000160-6eb9ce6b5a74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        satinTop.setColor("Чёрный,Бордовый");
        satinTop.setSize("XS,S,M");
        satinTop.setMaterial("Атлас 100%");
        satinTop.setCareInstructions("Химчистка");
        satinTop.setCategory("одежда");
        products.add(satinTop);

        // Товар 9: Юбка-карандаш шерстяная (НОВЫЙ)
        Product woolSkirt = new Product(
                "Юбка-карандаш шерстяная",
                "Классическая юбка для офиса и деловых встреч.",
                13400.0,
                "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        woolSkirt.setColor("Серый,Чёрный");
        woolSkirt.setSize("36,38,40,42");
        woolSkirt.setMaterial("Шерсть 80%, Полиэстер 20%");
        woolSkirt.setCareInstructions("Химчистка");
        woolSkirt.setCategory("одежда");
        products.add(woolSkirt);

        // Товар 14: Жилет бархатный (НОВЫЙ)
        Product velvetVest = new Product(
                "Бархатный жилет",
                "Тёплый жилет для осенних образов.",
                18700.0,
                "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        velvetVest.setColor("Бордовый,Тёмно-зелёный");
        velvetVest.setSize("XS,S,M,L,XL");
        velvetVest.setMaterial("Бархат 100%");
        velvetVest.setCareInstructions("Химчистка");
        velvetVest.setCategory("одежда");
        products.add(velvetVest);

        // ========== АКСЕССУАРЫ ==========

        // Товар 10: Платок шёлковый (НОВЫЙ)
        Product silkScarf = new Product(
                "Шёлковый платок с принтом",
                "Большой платок для волос, шеи или как аксессуар к сумке.",
                6700.0,
                "https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        silkScarf.setColor("Разноцветный");
        silkScarf.setMaterial("Шёлк 100%");
        silkScarf.setCareInstructions("Ручная стирка");
        silkScarf.setCategory("аксессуары");
        products.add(silkScarf);

        // Товар 11: Пояс кожаный (НОВЫЙ)
        Product leatherBelt = new Product(
                "Кожаный пояс с пряжкой",
                "Узкий пояс для платьев и пальто.",
                4500.0,
                "https://images.unsplash.com/photo-1553062407-98feb4068f2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        leatherBelt.setColor("Коричневый,Чёрный");
        leatherBelt.setSize("S/M,M/L");
        leatherBelt.setMaterial("Натуральная кожа");
        leatherBelt.setCategory("аксессуары");
        products.add(leatherBelt);

        // ========== СУМКИ ==========

        // Товар 12: Сумка кожаная (НОВЫЙ)
        Product leatherBag = new Product(
                "Сумка-тоут из кожи",
                "Вместительная сумка на каждый день.",
                28900.0,
                "https://images.unsplash.com/photo-1584917865442-de89df76afd3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        leatherBag.setColor("Коричневый,Чёрный,Бежевый");
        leatherBag.setMaterial("Натуральная кожа, Латунная фурнитура");
        leatherBag.setCategory("сумки");
        products.add(leatherBag);

        // ========== СУВЕНИРЫ ==========

        // Товар 13: Сувенирная брошь (НОВЫЙ)
        Product souvenirBrooch = new Product(
                "Брошь 'Цветок' ручной работы",
                "Искусственный цветок для пальто или платья.",
                3200.0,
                "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        souvenirBrooch.setColor("Золотистый,Серебряный");
        souvenirBrooch.setMaterial("Ткань, Бусины, Фурнитура");
        souvenirBrooch.setCategory("сувениры");
        products.add(souvenirBrooch);
        // Ещё платья для теста фильтрации
        Product summerDress = new Product(
                "Летнее платье",
                "Лёгкое хлопковое платье для жарких дней.",
                12900.0,
                "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        summerDress.setColor("Белый,Голубой");
        summerDress.setSize("XS,S,M,L");
        summerDress.setMaterial("Хлопок 100%");
        summerDress.setCategory("одежда");
        products.add(summerDress);

        Product eveningDress2 = new Product(
                "Коктейльное платье",
                "Короткое платье для вечеринок.",
                21900.0,
                "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        eveningDress2.setColor("Красный,Чёрный");
        eveningDress2.setSize("XS,S,M");
        eveningDress2.setMaterial("Атлас 100%");
        eveningDress2.setCategory("одежда");
        products.add(eveningDress2);

        // Ещё аксессуары
        Product leatherGloves = new Product(
                "Кожаные перчатки",
                "Тёплые перчатки из мягкой кожи.",
                8900.0,
                "https://images.unsplash.com/photo-1554561583-61cbf5c57f00?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        leatherGloves.setColor("Коричневый,Чёрный");
        leatherGloves.setSize("S,M,L");
        leatherGloves.setMaterial("Кожа, Мех");
        leatherGloves.setCategory("аксессуары");
        products.add(leatherGloves);

        // Ещё сувениры
        Product souvenirMagnet = new Product(
                "Магнит 'Париж'",
                "Сувенирный магнит для холодильника.",
                1200.0,
                "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
        );
        souvenirMagnet.setColor("Разноцветный");
        souvenirMagnet.setMaterial("Металл, Пластик");
        souvenirMagnet.setCategory("сувениры");
        products.add(souvenirMagnet);

        return products;
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

        // 3. Создаём список ВСЕХ товаров, которые должны быть
        List<Product> allProducts = createAllProducts();

        // 4. Фильтруем только те, которых ещё нет
        List<Product> newProducts = allProducts.stream()
                .filter(product -> !existingProductNames.contains(product.getName()))
                .toList();

        // 5. Добавляем только новые товары
        if (!newProducts.isEmpty()) {
            productRepository.saveAll(newProducts);
            System.out.println(">>> Добавлено " + newProducts.size() + " новых товаров.");
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
    }

    private void updateCategoriesForExistingProducts() {
        List<Product> existingProducts = productRepository.findAll();
        boolean updated = false;

        for (Product product : existingProducts) {
            if (product.getCategory() == null || product.getCategory().isEmpty()) {
                // Определяем категорию автоматически
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

        if (name.contains("платье") || name.contains("пиджак") ||
                name.contains("блузка") || name.contains("юбка") ||
                name.contains("брюки") || name.contains("пальто") ||
                name.contains("жилет") || name.contains("топ") ||
                name.contains("костюм") || name.contains("жакет")) {
            return "одежда";
        } else if (name.contains("платок") || name.contains("пояс") ||
                name.contains("баска") || name.contains("воротник") ||
                name.contains("манжета") || name.contains("шарф") ||
                name.contains("перчатка") || name.contains("шляпа")) {
            return "аксессуары";
        } else if (name.contains("сумка") || name.contains("рюкзак") ||
                name.contains("клатч") || name.contains("кошелёк") ||
                name.contains("портфель")) {
            return "сумки";
        } else if (name.contains("брошь") || name.contains("сувенир") ||
                name.contains("открытка") || name.contains("магнит") ||
                name.contains("упаковка") || name.contains("подарок")) {
            return "сувениры";
        }

        return "одежда"; // категория по умолчанию
    }
}