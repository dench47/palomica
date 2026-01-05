export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    color?: string;
    size?: string;
    material?: string;
    careInstructions?: string;
    additionalImages?: string[];
    category: string;
    subcategory?: string;
    availableQuantity: number; // ← ДОБАВЛЕНО

}

// Типы для заказа
export interface OrderItemRequest {
    productId: number;
    quantity: number;
    size?: string;
    color?: string;
}

export interface OrderRequest {
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryMethod: string;
    paymentMethod: string;
    comment?: string;
    items: OrderItemRequest[];
}

// АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ ПУТИ
const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:8085'  // В разработке: полный URL бэкенда
    : '';  // В продакшене: пустая строка (относительный путь)

export const productService = {
    async getAllProducts(): Promise<Product[]> {
        try {
            // Всегда добавляем /api/ к пути
            const response = await fetch(`${API_BASE_URL}/api/products`);

            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching products:', error);
            return [];
        }
    },

    async getProductById(id: number): Promise<Product | null> {
        try {
            // ВАЖНО: здесь тоже добавляем /api/
            const response = await fetch(`${API_BASE_URL}/api/products/${id}`);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }
};