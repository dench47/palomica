// services/orderService.ts
import type { CartItem } from '../context/CartContext';
import type { OrderRequest as ApiOrderRequest, Product, ProductVariant } from './api';

// АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ ПУТИ
const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:8085'  // В разработке: полный URL бэкенда
    : '';  // В продакшене: пустая строка (относительный путь)

// Интерфейс для данных Яндекс.Доставки (используется в CheckoutPage)
export interface YandexDeliveryData {
    pointId: string;
    address: string;
    city: string;
    street: string;
    house: string;
    comment: string;
}

// Интерфейс для отправки заказа (должен совпадать с OrderRequest.java)
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

    // Данные Яндекс.Доставки (опционально)
    yandexDeliveryPointId?: string | null;
    yandexDeliveryAddress?: string | null;
    yandexDeliveryCity?: string | null;
    yandexDeliveryStreet?: string | null;
    yandexDeliveryHouse?: string | null;
    yandexDeliveryComment?: string | null;

    // Данные СДЭК (опционально)
    cdekDeliveryPointCode?: string | null;
    cdekDeliveryPointAddress?: string | null;
    cdekDeliveryPointCity?: string | null;
    cdekDeliveryPointName?: string | null;
}

export interface OrderResponse {
    success: boolean;
    orderId?: number;
    orderNumber?: string;
    accessToken?: string;
    error?: string;
}

// Интерфейс для данных заказа с бэкенда
export interface OrderDetails {
    id: number;
    orderNumber: string;
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

    // Поля Яндекс.Доставки для отображения в админке
    yandexDeliveryPointId?: string;
    yandexDeliveryAddress?: string;
    yandexDeliveryCity?: string;
    yandexDeliveryStreet?: string;
    yandexDeliveryHouse?: string;
    yandexDeliveryComment?: string;

    // Поля СДЭК для отображения в админке
    cdekDeliveryPointCode?: string;
    cdekDeliveryPointAddress?: string;
    cdekDeliveryPointCity?: string;
    cdekDeliveryPointName?: string;
}

// Интерфейс для сырых данных заказа с бэкенда
interface RawOrderDetails extends Omit<OrderDetails, 'items'> {
    items: RawOrderItem[];
}

// Интерфейс для сырых данных элемента заказа
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
            const orderRequest: ApiOrderRequest = {
                customerName: orderData.customerName,
                customerEmail: orderData.customerEmail,
                customerPhone: orderData.customerPhone,
                deliveryAddress: orderData.deliveryAddress,
                deliveryMethod: orderData.deliveryMethod,
                paymentMethod: orderData.paymentMethod,
                comment: orderData.comment || '',
                items: orderData.items.map(item => ({
                    productId: item.product.id,
                    quantity: item.quantity,
                    size: item.selectedVariant?.size,
                    color: item.selectedVariant?.color
                })),

                // Данные Яндекс.Доставки
                yandexDeliveryPointId: orderData.yandexDeliveryPointId || null,
                yandexDeliveryAddress: orderData.yandexDeliveryAddress || null,
                yandexDeliveryCity: orderData.yandexDeliveryCity || null,
                yandexDeliveryStreet: orderData.yandexDeliveryStreet || null,
                yandexDeliveryHouse: orderData.yandexDeliveryHouse || null,
                yandexDeliveryComment: orderData.yandexDeliveryComment || null,

                // Данные СДЭК - ДОБАВЛЯЕМ!
                cdekDeliveryPointCode: orderData.cdekDeliveryPointCode || null,
                cdekDeliveryPointAddress: orderData.cdekDeliveryPointAddress || null,
                cdekDeliveryPointCity: orderData.cdekDeliveryPointCity || null,
                cdekDeliveryPointName: orderData.cdekDeliveryPointName || null
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

            const result = await response.json() as { orderId: number; orderNumber: string; accessToken: string };
            return {
                success: true,
                orderId: result.orderId,
                orderNumber: result.orderNumber,
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

            const rawOrderData = await response.json() as RawOrderDetails;

            // Обрабатываем продукт в каждом элементе заказа
            const processedItems = rawOrderData.items.map((item: RawOrderItem) => ({
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
                id: rawOrderData.id,
                orderNumber: rawOrderData.orderNumber || `ORD-${rawOrderData.id}`,
                customerName: rawOrderData.customerName,
                customerEmail: rawOrderData.customerEmail,
                customerPhone: rawOrderData.customerPhone,
                deliveryAddress: rawOrderData.deliveryAddress,
                deliveryMethod: rawOrderData.deliveryMethod,
                paymentMethod: rawOrderData.paymentMethod,
                comment: rawOrderData.comment,
                totalAmount: rawOrderData.totalAmount,
                status: rawOrderData.status,
                accessToken: rawOrderData.accessToken,
                createdAt: rawOrderData.createdAt,
                items: processedItems,
                // Поля Яндекс.Доставки (если есть)
                yandexDeliveryPointId: rawOrderData.yandexDeliveryPointId,
                yandexDeliveryAddress: rawOrderData.yandexDeliveryAddress,
                yandexDeliveryCity: rawOrderData.yandexDeliveryCity,
                yandexDeliveryStreet: rawOrderData.yandexDeliveryStreet,
                yandexDeliveryHouse: rawOrderData.yandexDeliveryHouse,
                yandexDeliveryComment: rawOrderData.yandexDeliveryComment,
                // Поля СДЭК (если есть)
                cdekDeliveryPointCode: rawOrderData.cdekDeliveryPointCode,
                cdekDeliveryPointAddress: rawOrderData.cdekDeliveryPointAddress,
                cdekDeliveryPointCity: rawOrderData.cdekDeliveryPointCity,
                cdekDeliveryPointName: rawOrderData.cdekDeliveryPointName
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