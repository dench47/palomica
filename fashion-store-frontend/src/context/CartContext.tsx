import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useState} from 'react';
import type {Product} from '../services/api';

// Тип для варианта товара
export interface ProductVariant {
    size?: string;
    color?: string;
}

// Товар в корзине теперь включает вариант
export interface CartItem {
    product: Product;
    quantity: number;
    selectedVariant?: ProductVariant;
    // Уникальный ID для комбинации товар+вариант
    variantId: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, variant?: ProductVariant) => void;
    removeFromCart: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    getVariantId: (productId: number, variant?: ProductVariant) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({children}: { children: ReactNode }) => {
    // Загружаем корзину из localStorage при инициализации
    const [items, setItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('fashionstore_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Сохраняем корзину в localStorage при каждом изменении
    useEffect(() => {
        localStorage.setItem('fashionstore_cart', JSON.stringify(items));
    }, [items]);

    // Генерация уникального ID для варианта
    const getVariantId = (productId: number, variant?: ProductVariant): string => {
        if (!variant || (!variant.size && !variant.color)) {
            return `${productId}-base`;
        }
        const sizePart = variant.size ? `-size-${variant.size.trim().toLowerCase()}` : '';
        const colorPart = variant.color ? `-color-${variant.color.trim().toLowerCase()}` : '';
        return `${productId}${sizePart}${colorPart}`;
    };

    // Добавление товара с учётом варианта
    const addToCart = (product: Product, variant?: ProductVariant) => {

        const variantId = getVariantId(product.id, variant);

        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.variantId === variantId);

            if (existingItem) {
                return prevItems.map(item =>
                    item.variantId === variantId
                        ? {...item, quantity: item.quantity + 1}
                        : item
                );
            }

            const newItem = {
                product,
                quantity: 1,
                selectedVariant: variant,
                variantId
            };
            return [...prevItems, newItem];
        });
    };

    // Удаление конкретного варианта товара
    const removeFromCart = (variantId: string) => {
        setItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
    };

    // Обновление количества для конкретного варианта
    const updateQuantity = (variantId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(variantId);
            return;
        }
        setItems(prevItems =>
            prevItems.map(item =>
                item.variantId === variantId ? {...item, quantity} : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    // Общее количество товаров (сумма quantity всех вариантов)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Общая стоимость
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
            getVariantId
        }}>
            {children}
        </CartContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};