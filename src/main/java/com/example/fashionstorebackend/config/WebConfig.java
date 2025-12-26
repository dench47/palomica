package com.example.fashionstorebackend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**") // Разрешаем запросы ко всем эндпоинтам, начинающимся с /api
                .allowedOrigins(
                        "http://localhost:5173",  // Для локальной разработки
                        "https://palomika.ru",     // Ваш основной домен (ОБЯЗАТЕЛЬНО с https)
                        "http://palomika.ru"       // На всякий случай, если кто-то введет без https
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true); // Если используете куки или авторизацию
    }
}