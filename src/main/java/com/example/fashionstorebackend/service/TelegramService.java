package com.example.fashionstorebackend.service;

import com.example.fashionstorebackend.config.TelegramConfig;
import com.example.fashionstorebackend.model.Order;
import com.example.fashionstorebackend.model.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class TelegramService {

    private final TelegramConfig telegramConfig;

    private static final String TELEGRAM_API_URL = "https://api.telegram.org/bot";
    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    public void sendNewOrderNotification(Order order) {
        try {
            String message = formatNewOrderMessage(order);
            List<String> adminChatIds = telegramConfig.getAdminChatIds();

            log.info("Отправка уведомлений о заказе #{} на chat_ids: {}",
                    order.getOrderNumber(), adminChatIds); // ИЗМЕНИТЬ!

            int sentCount = 0;
            int totalAdmins = adminChatIds.size();

            for (String chatId : adminChatIds) {
                try {
                    boolean sent = sendMessageToChat(message, chatId, true);
                    if (sent) {
                        sentCount++;
                        log.debug("✅ Уведомление отправлено на chat_id: {}", chatId);
                    } else {
                        log.error("❌ Не удалось отправить уведомление на chat_id: {}", chatId);
                    }
                } catch (Exception e) {
                    log.error("Ошибка при отправке на chat_id {}: {}", chatId, e.getMessage());
                }
            }

            if (sentCount == totalAdmins) {
                log.info("✅ Telegram уведомления о заказе #{} отправлены ВСЕМ {} админам",
                        order.getOrderNumber(), totalAdmins); // ИЗМЕНИТЬ!
            } else {
                log.warn("⚠️ Telegram уведомления о заказе #{} отправлены {}/{} админам",
                        order.getOrderNumber(), sentCount, totalAdmins); // ИЗМЕНИТЬ!
            }

        } catch (Exception e) {
            log.error("Ошибка отправки Telegram уведомления: {}", e.getMessage());
            e.printStackTrace();
        }
    }

    private String formatNewOrderMessage(Order order) {
        StringBuilder sb = new StringBuilder();

        sb.append("🆕 *НОВЫЙ ЗАКАЗ #").append(order.getOrderNumber()).append("*\n");
        sb.append("══════════════\n");
        sb.append("👤 *").append(escapeMarkdown(order.getCustomerName())).append("*\n");
        sb.append("📞 ").append(escapeMarkdown(order.getCustomerPhone())).append("\n"); // Экранируем
        sb.append("📧 ").append(escapeMarkdown(order.getCustomerEmail())).append("\n"); // Экранируем
        sb.append("══════════════\n");

        // Доставка и оплата
        String deliveryText = getDeliveryText(order.getDeliveryMethod());
        String paymentText = getPaymentText(order.getPaymentMethod());

        sb.append("📍 *Доставка:* ").append(deliveryText).append("\n");
        if (order.getDeliveryAddress() != null && !order.getDeliveryAddress().isEmpty()) {
            sb.append("🏠 *Адрес:* ").append(escapeMarkdown(order.getDeliveryAddress())).append("\n");
        }
        sb.append("💳 *Оплата:* ").append(paymentText).append("\n");
        sb.append("💰 *Сумма:* ").append(formatPrice(order.getTotalAmount())).append("\n");

        // Товары
        sb.append("══════════════\n");
        sb.append("📦 *Товары (").append(order.getItems().size()).append(" шт.):*\n");

        for (OrderItem item : order.getItems()) {
            sb.append("└ ").append(escapeMarkdown(item.getProduct().getName()));

            if (item.getSize() != null && !item.getSize().isEmpty()) {
                sb.append(" (").append(item.getSize()).append(")");
            }

            sb.append(" ×").append(item.getQuantity()).append("\n");
        }

        // Дата и ссылка
        sb.append("══════════════\n");
        sb.append("🕐 ").append(order.getCreatedAt().format(DATE_FORMATTER)).append("\n");
        sb.append("🔗 [Открыть в админке](https://palomika.ru/admin/orders)\n");

        return sb.toString();
    }

    private boolean sendMessageToChat(String text, String chatId, boolean markdown) {
        try {
            String url = TELEGRAM_API_URL + telegramConfig.getBotToken() + "/sendMessage";

            Map<String, Object> request = new HashMap<>();
            request.put("chat_id", chatId);
            request.put("text", text);

            if (markdown) {
                request.put("parse_mode", "Markdown");
            }

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(url, entity, String.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                return true;
            } else {
                log.error("Telegram API ошибка для chat_id {}: {} - {}",
                        chatId, response.getStatusCode(), response.getBody());
                return false;
            }

        } catch (Exception e) {
            log.error("Исключение при отправке на chat_id {}: {}", chatId, e.getMessage());
            return false;
        }
    }

    private String escapeMarkdown(String text) {
        if (text == null) return "";
        // Экранируем специальные символы Markdown
        return text.replace("_", "\\_")
                .replace("*", "\\*")
                .replace("[", "\\[")
                .replace("]", "\\]")
                .replace("(", "\\(")
                .replace(")", "\\)")
                .replace("~", "\\~")
                .replace("`", "\\`")
                .replace(">", "\\>")
                .replace("#", "\\#")
                .replace("+", "\\+")
                .replace("-", "\\-")
                .replace("=", "\\=")
                .replace("|", "\\|")
                .replace("{", "\\{")
                .replace("}", "\\}")
                .replace(".", "\\.")
                .replace("!", "\\!");
    }

    private String formatPrice(Double price) {
        if (price == null) return "0 ₽";
        return String.format("%,.0f ₽", price).replace(",", " ");
    }

    private String getDeliveryText(String method) {
        if (method == null) return "";
        switch (method.toLowerCase()) {
            case "yandex": return "Яндекс.Доставка (ПВЗ)";
            case "pickup": return "Самовывоз";
            case "marketplace": return "Маркетплейсы";
            default: return method;
        }
    }

    private String getPaymentText(String method) {
        if (method == null) return "";
        switch (method.toLowerCase()) {
            case "card": return "Картой онлайн";
            case "cash": return "Наличными";
            case "sbp": return "СБП";
            default: return method;
        }
    }
}