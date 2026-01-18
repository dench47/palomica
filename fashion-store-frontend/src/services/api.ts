// ========== ТИПЫ ДАННЫХ ==========

// Вариант товара
export type ProductVariant = {
    id: number;
    size: string;
    availableQuantity: number;
    reservedQuantity: number;
    actuallyAvailable: number; // Вычисляемое поле
}

// Продукт
export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    color?: string;
    material?: string;
    careInstructions?: string;
    additionalImages?: string[];
    category: string;        // Название категории (строка)
    subcategory?: string;    // Название подкатегории (строка)
    variants: ProductVariant[]; // Варианты товара

    // Для обратной совместимости (опциональные поля)
    size?: string;                    // Устаревшее поле, теперь опциональное
    availableQuantity?: number;       // Устаревшее поле, теперь опциональное

    // Вычисляемые методы (опциональные)
    getSizes?: () => string[];
    getTotalAvailableQuantity?: () => number;
    getAvailableQuantityForSize?: (size: string) => number;
}

// Категория (соответствует CategoryDTO.java)
export interface Category {
    id: number;
    name: string;
    description?: string;
    displayOrder: number;
    isActive: boolean;
    subcategories?: Subcategory[];  // Может быть пустым или отсутствовать
}

// Подкатегория (соответствует SubcategoryDTO.java)
export interface Subcategory {
    id: number;
    name: string;
    description?: string;
    categoryId: number;
    categoryName?: string;
    displayOrder: number;
    isActive: boolean;
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

    // Поля для Яндекс.Доставки (ПВЗ)
    yandexDeliveryPointId?: string | null;
    yandexDeliveryAddress?: string | null;
    yandexDeliveryCity?: string | null;
    yandexDeliveryStreet?: string | null;
    yandexDeliveryHouse?: string | null;
    yandexDeliveryComment?: string | null;
}

// ========== КОНФИГУРАЦИЯ API ==========

// АВТОМАТИЧЕСКОЕ ОПРЕДЕЛЕНИЕ ПУТИ
const API_BASE_URL = import.meta.env.DEV
    ? 'http://localhost:8085'  // В разработке: полный URL бэкенда
    : '';  // В продакшене: пустая строка (относительный путь)

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

const processProduct = (product: Record<string, unknown>): Product => {
    const variants = product.variants as ProductVariant[] || [];

    const processedProduct: Product = {
        ...product as Omit<Product, 'variants' | 'getSizes' | 'getTotalAvailableQuantity' | 'getAvailableQuantityForSize'>,
        variants,
        // Для обратной совместимости добавляем устаревшие поля как опциональные
        size: variants.map(v => v.size).join(',') || '',
        availableQuantity: variants.reduce((sum, v) => sum + v.availableQuantity, 0) || 0,
    };

    // Добавляем вычисляемые методы
    processedProduct.getSizes = () =>
        variants.map(v => v.size) || [];

    processedProduct.getTotalAvailableQuantity = () =>
        variants.reduce((sum, v) => sum + v.availableQuantity, 0) || 0;

    processedProduct.getAvailableQuantityForSize = (size: string) => {
        const variant = variants.find(v => v.size === size);
        return variant ? variant.actuallyAvailable ||
            Math.max(0, variant.availableQuantity - variant.reservedQuantity) : 0;
    };

    return processedProduct;
};

// ========== СЕРВИСЫ ==========

// Сервис категорий
export const categoryService = {
    // Получить все активные категории с подкатегориями
    getAllCategories: async (): Promise<Category[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories`);
            if (!response.ok) {
                throw new Error(`Failed to fetch categories: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching categories:', error);
            throw error;
        }
    },

    getSubcategoriesByCategoryId: async (categoryId: number): Promise<Subcategory[]> => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/categories/${categoryId}/subcategories`);
            if (!response.ok) {
                throw new Error(`Failed to fetch subcategories: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            throw error;
        }
    }
};

// Сервис товаров
export const productService = {
    async getAllProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products`);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return [];
            }
            const products = await response.json() as Record<string, unknown>[];
            // Обрабатываем каждый продукт, добавляя вычисляемые поля
            return products.map(processProduct);
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
            const product = await response.json() as Record<string, unknown>;
            return processProduct(product);
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    },

    // Получить доступные размеры товара
    async getProductSizes(id: number): Promise<string[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/api/products/${id}/sizes`);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return [];
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product sizes:', error);
            return [];
        }
    },

    // Проверить доступность конкретного размера
    async checkAvailability(id: number, size: string): Promise<number> {
        try {
            const response = await fetch(
                `${API_BASE_URL}/api/products/${id}/availability?size=${encodeURIComponent(size)}`
            );
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return 0;
            }
            return await response.json();
        } catch (error) {
            console.error('Error checking availability:', error);
            return 0;
        }
    }
};

// Сервис S3
export const s3Service = {
    async deleteFile(fileUrl: string): Promise<boolean> {
        try {
            const token = localStorage.getItem('admin_token');
            if (!token) {
                console.error('No admin token found');
                return false;
            }

            const response = await fetch(`${API_BASE_URL}/api/admin/s3/files/delete?url=${encodeURIComponent(fileUrl)}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json() as { success: boolean };
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

            const response = await fetch(`${API_BASE_URL}/api/admin/s3/files/delete-multiple`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fileUrls)
            });

            const data = await response.json() as { success: boolean };
            return response.ok && data.success;
        } catch (error) {
            console.error('Error deleting multiple files from S3:', error);
            return false;
        }
    }
};