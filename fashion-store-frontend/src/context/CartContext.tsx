import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useState} from 'react';
import type {Product} from '../services/api';
import toast from 'react-hot-toast';
import {ShoppingBag, XCircle} from 'lucide-react';

// Тип для варианта товара
export interface ProductVariant {
    size: string;  // Размер обязателен
    color?: string;
}

// Товар в корзине
export interface CartItem {
    product: Product;
    quantity: number;
    selectedVariant: ProductVariant;
    variantId: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, variant: ProductVariant, quantity?: number) => void;
    removeFromCart: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    getVariantId: (productId: number, variant: ProductVariant) => string;
    getItemByVariantId: (variantId: string) => CartItem | undefined;
    isProductAvailable: (product: Product, variant: ProductVariant) => boolean;
    getMaxAvailableQuantity: (product: Product, variant: ProductVariant) => number;
    getRemainingQuantity: (product: Product, variant: ProductVariant) => number;
    getCartQuantityForProductAndSize: (productId: number, size: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({children}: { children: ReactNode }) => {
    // Загружаем корзину из localStorage
    const [items, setItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('fashionstore_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    // Сохраняем корзину в localStorage при каждом изменении
    useEffect(() => {
        localStorage.setItem('fashionstore_cart', JSON.stringify(items));
    }, [items]);

    // Генерация уникального ID для варианта
    const getVariantId = (productId: number, variant: ProductVariant): string => {
        const size = variant.size || 'ONE SIZE';
        const colorPart = variant.color ? `-color-${variant.color.trim().toLowerCase()}` : '';
        return `${productId}-size-${size.trim().toLowerCase()}${colorPart}`;
    };

    // Получить элемент по variantId
    const getItemByVariantId = (variantId: string): CartItem | undefined => {
        return items.find(item => item.variantId === variantId);
    };

    // Получить количество товара в корзине для конкретного продукта и размера
    const getCartQuantityForProductAndSize = (productId: number, size: string): number => {
        const variantId = getVariantId(productId, { size });
        const item = items.find(item => item.variantId === variantId);
        return item ? item.quantity : 0;
    };

    // Получить максимально доступное количество для варианта
    const getMaxAvailableQuantity = (product: Product, variant: ProductVariant): number => {
        if (!variant.size) return 0;

        if (product.getAvailableQuantityForSize) {
            return product.getAvailableQuantityForSize(variant.size);
        }

        // Fallback для обратной совместимости
        const variantData = product.variants?.find(v => v.size === variant.size);
        return variantData ? (variantData.actuallyAvailable || variantData.availableQuantity) : 0;
    };

    // Получить оставшееся доступное количество (с учетом уже в корзине)
    const getRemainingQuantity = (product: Product, variant: ProductVariant): number => {
        const maxAvailable = getMaxAvailableQuantity(product, variant);
        if (maxAvailable === 0) return 0;

        const variantId = getVariantId(product.id, variant);
        const existingItem = items.find(item => item.variantId === variantId);
        const inCartQuantity = existingItem ? existingItem.quantity : 0;

        return Math.max(0, maxAvailable - inCartQuantity);
    };

    // Проверка доступности товара с вариантом
    const isProductAvailable = (product: Product, variant: ProductVariant): boolean => {
        return getMaxAvailableQuantity(product, variant) > 0;
    };

    // Добавление товара в корзину с контролем лимита
    const addToCart = (product: Product, variant: ProductVariant, quantityToAdd: number = 1) => {
        // Проверяем размер
        if (!variant.size) {
            toast.error(
                <div className="d-flex align-items-center">
                    <span className="me-2">⚠️</span>
                    <span style={{fontFamily: "'Cormorant Garamond', serif"}}>
                        Пожалуйста, выберите размер
                    </span>
                </div>,
                {
                    duration: 3000
                    // УБРАЛИ position: 'bottom-right' - используем настройки из App.tsx
                }
            );
            return;
        }

        const variantId = getVariantId(product.id, variant);
        const maxAvailable = getMaxAvailableQuantity(product, variant);

        if (maxAvailable === 0) {
            toast.error(
                <div className="d-flex align-items-center">
                    <span className="me-2" style={{color: '#dc3545'}}>😔</span>
                    <span style={{fontFamily: "'Cormorant Garamond', serif"}}>
                        <strong>"{product.name}"</strong> (Размер: {variant.size}) закончился на складе
                    </span>
                </div>,
                {
                    duration: 4000
                    // УБРАЛИ position: 'bottom-right' - используем настройки из App.tsx
                }
            );
            return;
        }

        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.variantId === variantId);
            const currentQuantity = existingItem ? existingItem.quantity : 0;
            const totalAfterAdding = currentQuantity + quantityToAdd;

            // Проверяем, не превышает ли лимит
            if (totalAfterAdding > maxAvailable) {
                const canAdd = Math.max(0, maxAvailable - currentQuantity);

                if (canAdd === 0) {
                    // НЕ показываем toast при достижении лимита - просто не добавляем
                    return prevItems;
                }

                // Добавляем только доступное количество
                quantityToAdd = canAdd;
            }

            if (existingItem) {
                return prevItems.map(item =>
                    item.variantId === variantId
                        ? {...item, quantity: item.quantity + quantityToAdd}
                        : item
                );
            }

            const newItem: CartItem = {
                product,
                quantity: quantityToAdd,
                selectedVariant: variant,
                variantId
            };

            return [...prevItems, newItem];
        });

        // Показываем уведомление об успешном добавлении
        toast.success(
            <div className="d-flex align-items-center">
                <ShoppingBag size={18} className="me-2" style={{ color: 'var(--toast-brown)' }} />
                <div>
                    <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: '500',
                        fontSize: '0.95rem',
                        color: 'var(--toast-brown-dark)'
                    }}>
                        Товар добавлен в корзину
                    </div>
                    <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.85rem',
                        color: 'var(--toast-brown)',
                        marginTop: '2px'
                    }}>
                        <strong>"{product.name}"</strong> (Размер: {variant.size}) ×{quantityToAdd} шт.
                    </div>
                </div>
            </div>,
            {
                duration: 2500,
                icon: '🛒'
            }
        );
    };

    // Удаление товара из корзины
    const removeFromCart = (variantId: string) => {
        const itemToRemove = items.find(item => item.variantId === variantId);

        if (itemToRemove) {
            toast(
                <div className="d-flex align-items-center">
                    <XCircle size={18} className="me-2" style={{ color: 'var(--toast-brown)' }} />
                    <div>
                        <div style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: '500',
                            fontSize: '0.95rem',
                            color: 'var(--toast-brown-dark)'
                        }}>
                            Товар удален из корзины
                        </div>
                        <div style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.85rem',
                            color: 'var(--toast-brown)',
                            marginTop: '2px'
                        }}>
                            <strong>"{itemToRemove.product.name}"</strong> (Размер: {itemToRemove.selectedVariant.size})
                        </div>
                    </div>
                </div>,
                {
                    duration: 2500,
                    icon: '🗑️'
                }
            );
        }

        setItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
    };

    // Обновление количества с проверкой лимита
    const updateQuantity = (variantId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(variantId);
            return;
        }

        const oldItem = items.find(item => item.variantId === variantId);
        if (!oldItem) return;

        // Проверяем лимит
        const maxAvailable = getMaxAvailableQuantity(oldItem.product, oldItem.selectedVariant);
        if (quantity > maxAvailable) {
            // НЕ показываем toast - просто устанавливаем максимальное количество
            quantity = maxAvailable;
        }

        setItems(prevItems =>
            prevItems.map(item =>
                item.variantId === variantId ? {...item, quantity} : item
            )
        );
    };

    // Очистка корзины
    const clearCart = () => {
        setItems([]);
    };

    // Общее количество товаров
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
            getVariantId,
            getItemByVariantId,
            isProductAvailable,
            getMaxAvailableQuantity,
            getRemainingQuantity,
            getCartQuantityForProductAndSize
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