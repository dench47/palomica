package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.config.YandexConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/public/config")
@CrossOrigin(origins = {"https://palomika.ru", "http://localhost:5173"})
@RequiredArgsConstructor
public class PublicConfigController {

    private final YandexConfig yandexConfig;

    @GetMapping("/yandex")
    public ResponseEntity<Map<String, String>> getYandexConfig() {
        Map<String, String> config = new HashMap<>();
        String apiKey = yandexConfig.getGeocoderApiKey(); // получаем один ключ
        config.put("geocoderApiKey", apiKey); // для геокодера
        config.put("mapsApiKey", apiKey);     // тот же ключ для карт (СДЭК)
        return ResponseEntity.ok(config);
    }

    @GetMapping("/all")
    public ResponseEntity<Map<String, Object>> getAllPublicConfigs() {
        Map<String, Object> configs = new HashMap<>();

        // Яндекс конфигурация
        Map<String, String> yandexConfigs = new HashMap<>();
        String apiKey = yandexConfig.getGeocoderApiKey();
        yandexConfigs.put("geocoderApiKey", apiKey);
        yandexConfigs.put("mapsApiKey", apiKey); // добавляем для карт

        configs.put("yandex", yandexConfigs);
        configs.put("deliveryMethods", new String[]{"yandex", "pickup", "marketplace"});
        configs.put("paymentMethods", new String[]{"card", "cash", "sbp"});

        return ResponseEntity.ok(configs);
    }
}