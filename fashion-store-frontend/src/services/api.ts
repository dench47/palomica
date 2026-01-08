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
    availableQuantity: number;
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

// Типы для синхронизации корзины
export interface CartSyncItemRequest {
    productId: number;
    quantity: number;
    size?: string;
    color?: string;
}

export interface CartSyncRequest {
    sessionId: string;
    items: CartSyncItemRequest[];
}

export interface ProductUpdate {
    productId: number;
    availableQuantity: number;
    reservedQuantity: number;
    message?: string;
    removed: boolean;
}

export interface CartSyncResponse {
    updates: ProductUpdate[];
    message: string;
}

// Генерируем уникальный sessionId для пользователя
const getSessionId = (): string => {
    let sessionId = localStorage.getItem('cart_session_id');
    if (!sessionId) {
        sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('cart_session_id', sessionId);
    }
    return sessionId;
};

export const cartService = {
    // Синхронизация корзины с сервером
    async syncCart(items: CartSyncItemRequest[]): Promise<CartSyncResponse> {
        try {
            const sessionId = getSessionId();
            const request: CartSyncRequest = { sessionId, items };

            const response = await fetch(`${API_BASE_URL}/api/cart/sync`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Error syncing cart:', error);
            return { updates: [], message: 'Ошибка синхронизации' };
        }
    },

    // Резервирование товаров
    async reserveItems(items: CartSyncItemRequest[]): Promise<boolean> {
        try {
            const sessionId = getSessionId();
            const request: CartSyncRequest = { sessionId, items };

            const response = await fetch(`${API_BASE_URL}/api/cart/reserve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            return response.ok;
        } catch (error) {
            console.error('Error reserving items:', error);
            return false;
        }
    },

    // Освобождение резервирования
    async releaseItems(items: CartSyncItemRequest[]): Promise<boolean> {
        try {
            const sessionId = getSessionId();
            const request: CartSyncRequest = { sessionId, items };

            const response = await fetch(`${API_BASE_URL}/api/cart/release`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request),
            });

            return response.ok;
        } catch (error) {
            console.error('Error releasing items:', error);
            return false;
        }
    },
};

export const productService = {
    async getAllProducts(): Promise<Product[]> {
        try {
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

// ========== S3 Service ==========
export const s3Service = {
    async deleteFile(fileUrl: string): Promise<boolean> {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                console.error('No admin token found');
                return false;
            }

            const response = await fetch(`/api/admin/s3/files/delete?url=${encodeURIComponent(fileUrl)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            return response.ok && data.success;
        } catch (error) {
            console.error('Error deleting file from S3:', error);
            return false;
        }
    },

    async deleteMultipleFiles(fileUrls: string[]): Promise<boolean> {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                console.error('No admin token found');
                return false;
            }

            const response = await fetch(`/api/admin/s3/files/delete-multiple`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fileUrls)
            });

            const data = await response.json();
            return response.ok && data.success;
        } catch (error) {
            console.error('Error deleting multiple files from S3:', error);
            return false;
        }
    }
};