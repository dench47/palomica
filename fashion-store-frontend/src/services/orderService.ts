// services/orderService.ts
import type { CartItem } from '../context/CartContext';

export interface OrderData {
    name: string;
    email: string;
    phone: string;
    address: string;
    comment?: string;
    items: CartItem[];
    total: number;
}

export const orderService = {
    async sendOrder(orderData: OrderData): Promise<boolean> {
        try {
            // Отправка на бэкенд
            const response = await fetch('http://localhost:8085/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderData),
            });

            return response.ok;
        } catch (error) {
            console.error('Ошибка отправки заказа:', error);
            return false;
        }
    },

    // Альтернатива: отправка на email/WhatsApp через сервис
    async sendToTelegram(orderData: OrderData): Promise<boolean> {
        const message = `
🎉 НОВЫЙ ЗАКАЗ!
Имя: ${orderData.name}
Телефон: ${orderData.phone}
Email: ${orderData.email}
Адрес: ${orderData.address}
Сумма: ${orderData.total} ₽

Товары:
${orderData.items.map(item => `• ${item.product.name} (${item.quantity} шт.) - ${item.product.price * item.quantity} ₽`).join('\n')}
        `.trim();

        try {
            // Здесь можно подключить Telegram Bot API
            console.log('Сообщение для Telegram:', message);
            return true;
        } catch (error) {
            console.error('Ошибка отправки в Telegram:', error);
            return false;
        }
    }
};