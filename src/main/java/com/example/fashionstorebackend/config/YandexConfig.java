package com.example.fashionstorebackend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Getter
@Configuration
public class YandexConfig {

    @Value("${yandex.geocoder.api-key}")
    private String geocoderApiKey;
}