package com.example.fashionstorebackend.component;

import com.example.fashionstorebackend.Product;
import com.example.fashionstorebackend.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer {

    private final ProductRepository productRepository;

    @Autowired
    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostConstruct
    public void initSomeData() {
        // Проверяем, есть ли уже товары в БД
        long count = productRepository.count();

        if (count > 0) {
            System.out.println(">>> В БД уже есть " + count + " товаров. Инициализация пропущена.");
            return;
        }

        System.out.println(">>> БД пустая, начинаем загрузку тестовых данных...");

        List<Product> products = new ArrayList<>();

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
        coat.setAdditionalImages(Arrays.asList(
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop"
        ));
        products.add(coat);

        // Сохраняем все товары
        productRepository.saveAll(products);

        System.out.println(">>> Загружено " + products.size() + " тестовых товаров.");
    }
}