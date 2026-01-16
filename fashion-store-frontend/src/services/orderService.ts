// services/orderService.ts
import type { CartItem } from '../context/CartContext';
import type { OrderRequest, Product, ProductVariant } from './api';

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

export interface OrderResponse {
    success: boolean;
    orderId?: number;
    orderNumber?: string; // ДОБАВИТЬ ЭТО!
    accessToken?: string;
    error?: string;
}

export interface OrderDetails {
    id: number;
    orderNumber: string; // ДОБАВИТЬ ЭТО!
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryMethod: string;
    paymentMethod: string;
    comment?: string;
    totalAmount: number;
    status: string;
    accessToken: string;
    createdAt: string;
    items: OrderItemDetails[];
}

// Обновляем интерфейс OrderItemDetails чтобы Product был полным
export interface OrderItemDetails {
    id: number;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    product: Product;
}

export const orderService = {
    async createOrder(orderData: OrderData): Promise<OrderResponse> {
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

            const result = await response.json();
            return {
                success: true,
                orderId: result.orderId,
                orderNumber: result.orderNumber, // ДОБАВИТЬ ЭТО!
                accessToken: result.accessToken
            };

        } catch (error) {
            console.error('Ошибка отправки заказа:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        }
    },

    // Получить информацию о заказе
    async getOrder(orderId: number, accessToken: string): Promise<OrderDetails> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/public/orders/${orderId}?token=${accessToken}`
            );

            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Заказ не найден');
                }
                if (response.status === 403) {
                    throw new Error('Доступ запрещен. Неверная ссылка.');
                }
                throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
            }

            const orderData = await response.json();

            // Интерфейс для сырых данных из API
            interface RawOrderItem {
                id: number;
                quantity: number;
                price: number;
                size?: string;
                color?: string;
                product: {
                    id: number;
                    name: string;
                    imageUrl: string;
                    price: number;
                    description?: string;
                    category?: string;
                    color?: string;
                    material?: string;
                    careInstructions?: string;
                    additionalImages?: string[];
                    variants?: ProductVariant[];
                };
            }

            // Обрабатываем продукт в каждом элементе заказа
            const processedItems = (orderData.items as RawOrderItem[]).map((item: RawOrderItem) => ({
                id: item.id,
                quantity: item.quantity,
                price: item.price,
                size: item.size,
                color: item.color,
                product: {
                    id: item.product.id,
                    name: item.product.name,
                    imageUrl: item.product.imageUrl,
                    price: item.product.price,
                    description: item.product.description || '',
                    category: item.product.category || '',
                    color: item.product.color,
                    material: item.product.material,
                    careInstructions: item.product.careInstructions,
                    additionalImages: item.product.additionalImages || [],
                    variants: item.product.variants || [],
                    // Вычисляемые методы
                    getSizes: () => (item.product.variants || []).map(v => v.size),
                    getTotalAvailableQuantity: () =>
                        (item.product.variants || []).reduce((sum: number, v: ProductVariant) =>
                            sum + v.availableQuantity, 0),
                    getAvailableQuantityForSize: (size: string) => {
                        const variant = (item.product.variants || []).find(v => v.size === size);
                        return variant ? variant.actuallyAvailable ||
                            Math.max(0, variant.availableQuantity - variant.reservedQuantity) : 0;
                    }
                }
            }));

            return {
                id: orderData.id,
                orderNumber: orderData.orderNumber || `ORD-${orderData.id}`, // ДОБАВИТЬ ЭТО!
                customerName: orderData.customerName,
                customerEmail: orderData.customerEmail,
                customerPhone: orderData.customerPhone,
                deliveryAddress: orderData.deliveryAddress,
                deliveryMethod: orderData.deliveryMethod,
                paymentMethod: orderData.paymentMethod,
                comment: orderData.comment,
                totalAmount: orderData.totalAmount,
                status: orderData.status,
                accessToken: orderData.accessToken,
                createdAt: orderData.createdAt,
                items: processedItems
            };

        } catch (error) {
            console.error('Ошибка получения заказа:', error);
            throw error;
        }
    },

    // Получить товары для повторного заказа
    async getReorderItems(orderId: number, accessToken: string): Promise<unknown> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/public/orders/${orderId}/reorder?token=${accessToken}`
            );

            if (!response.ok) {
                throw new Error(`Ошибка ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка получения товаров для повторного заказа:', error);
            throw error;
        }
    }
};