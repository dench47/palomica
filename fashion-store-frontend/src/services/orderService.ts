// services/orderService.ts
import type { CartItem } from '../context/CartContext';
import type { OrderRequest } from './api';

// АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ ПУТИ
const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:8085'  // В разработке: полный URL бэкенда
    : '';  // В продакшене: пустая строка (относительный путь)

export interface OrderData {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryMethod: string;
    paymentMethod: string;
    comment?: string;
    items: CartItem[];
    total: number;
}

export const orderService = {
    async createOrder(orderData: OrderData): Promise<{ success: boolean; orderId?: number; error?: string }> {
        try {
            // Преобразуем данные корзины в формат для бэкенда
            const orderRequest: OrderRequest = {
                customerName: orderData.customerName,
                customerEmail: orderData.customerEmail,
                customerPhone: orderData.customerPhone,
                deliveryAddress: orderData.deliveryAddress,
                deliveryMethod: orderData.deliveryMethod,
                paymentMethod: orderData.paymentMethod,
                comment: orderData.comment,
                items: orderData.items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    size: item.selectedVariant?.size,
                    color: item.selectedVariant?.color
                }))
            };

            console.log('Отправка заказа:', orderRequest);

            const response = await fetch(`${API_BASE_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderRequest),
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Ошибка сервера:', response.status, errorText);
                return {
                    success: false,
                    error: errorText || `Ошибка ${response.status}`
                };
            }

            const orderId = await response.json();
            return { success: true, orderId };

        } catch (error) {
            console.error('Ошибка отправки заказа:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        }
    }
};