package com.example.fashionstorebackend.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Getter
@Configuration
public class TelegramConfig {

    @Value("${telegram.bot.token}")
    private String botToken;

    @Value("${telegram.bot.username}")
    private String botUsername;

    @Value("${telegram.bot.admin-chat-ids}")
    private String adminChatIds;

    // Метод для получения списка ID
    public List<String> getAdminChatIds() {
        return Arrays.asList(adminChatIds.split(","));
    }
}