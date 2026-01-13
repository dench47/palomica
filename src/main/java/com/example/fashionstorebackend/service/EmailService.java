package com.example.fashionstorebackend.service;

import com.example.fashionstorebackend.model.Order;
import com.example.fashionstorebackend.model.OrderItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import java.io.UnsupportedEncodingException;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${app.frontend-url}") // ИЗМЕНЯЕМ НА frontend-url
    private String frontendUrl;

    @Value("${app.email.from}")
    private String fromEmail;

    @Value("${app.email.from-name}")
    private String fromName;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");

    @Async
    public void sendOrderConfirmation(Order order) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // ФОРМИРУЕМ ССЫЛКУ НА ФРОНТЕНД
            String orderUrl = frontendUrl + "/order/" + order.getId() + "?token=" + order.getAccessToken();

            // Данные для шаблона
            Context context = new Context(Locale.getDefault());
            context.setVariable("order", order);
            context.setVariable("orderUrl", orderUrl);
            context.setVariable("orderDate", order.getCreatedAt().format(DATE_FORMATTER));
            context.setVariable("items", order.getItems());
            context.setVariable("totalAmount", formatPrice(order.getTotalAmount()));
            context.setVariable("deliveryMethod", getDeliveryMethodText(order.getDeliveryMethod()));
            context.setVariable("paymentMethod", getPaymentMethodText(order.getPaymentMethod()));

            // Генерируем HTML
            String htmlContent = templateEngine.process("email/order-confirmation", context);

            // Настраиваем письмо
            helper.setFrom(fromEmail, fromName);
            helper.setTo(order.getCustomerEmail());
            helper.setSubject("Заказ #" + order.getId() + " оформлен - Palomika.ru");
            helper.setText(htmlContent, true);

            // Отправляем
            mailSender.send(message);
            log.info("Письмо с подтверждением заказа #{} отправлено на {}",
                    order.getId(), order.getCustomerEmail());
            log.info("Ссылка в письме: {}", orderUrl);

        } catch (MessagingException e) {
            log.error("Ошибка отправки письма для заказа #{}: {}", order.getId(), e.getMessage());
        } catch (Exception e) {
            log.error("Неожиданная ошибка при отправке письма: {}", e.getMessage());
        }
    }

    private String formatPrice(Double price) {
        if (price == null) return "0 ₽";
        return String.format("%,.0f ₽", price);
    }

    private String getDeliveryMethodText(String method) {
        if (method == null) return "";
        switch (method.toLowerCase()) {
            case "courier": return "Курьерская доставка";
            case "post": return "Почта России";
            case "pickup": return "Самовывоз";
            default: return method;
        }
    }

    private String getPaymentMethodText(String method) {
        if (method == null) return "";
        switch (method.toLowerCase()) {
            case "card": return "Банковской картой";
            case "cash": return "Наличными при получении";
            case "sbp": return "СБП (Система быстрых платежей)";
            default: return method;
        }
    }
}