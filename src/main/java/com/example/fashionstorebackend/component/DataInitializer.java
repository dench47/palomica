package com.example.fashionstorebackend.component;

import com.example.fashionstorebackend.Product;
import com.example.fashionstorebackend.repository.ProductRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer {

    private final ProductRepository productRepository;

    // Конструктор с зависимостью (Spring сам её внедрит)
    @Autowired
    public DataInitializer(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostConstruct
    public void initSomeData() {
        // Очищаем таблицу только если в ней уже есть данные
        if (productRepository.count() > 0) {
            System.out.println(">>> В базе данных уже есть товары, пропускаем инициализацию.");
            return;
        }

        // Создаем список тестовых товаров
        List<Product> products = Arrays.asList(
                new Product("Вечернее платье", "Элегантное платье для особых случаев", 29900.0, "https://via.placeholder.com/300x400/FFC0CB/000000?text=Dress+1"),
                new Product("Шерстяной пиджак", "Классический пиджак премиального кроя", 18900.0, "https://via.placeholder.com/300x400/ADD8E6/000000?text=Blazer+2"),
                new Product("Шелковая блуза", "Легкая блуза из натурального шелка", 12400.0, "https://via.placeholder.com/300x400/FFFACD/000000?text=Blouse+3"),
                new Product("Кожаная юбка", "Стильная юбка-карандаш из мягкой кожи", 25600.0, "https://via.placeholder.com/300x400/8FBC8F/000000?text=Skirt+4"),
                new Product("Кожаные брюки", "Узкие брюки из качественной кожи", 28700.0, "https://via.placeholder.com/300x400/D3D3D3/000000?text=Pants+5"),
                new Product("Кашемировое пальто", "Теплое пальто из кашемира", 45200.0, "https://via.placeholder.com/300x400/A0522D/FFFFFF?text=Coat+6")
        );

        // Сохраняем все товары в базу данных
        productRepository.saveAll(products);

        System.out.println(">>> Загружено " + products.size() + " тестовых товаров в базу данных.");
        System.out.println(">>> API доступно по адресу: http://localhost:8085/api/products");
    }
}