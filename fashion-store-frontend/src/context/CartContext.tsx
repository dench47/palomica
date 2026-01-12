// CartContext.tsx - УПРОЩЕННЫЙ (без синхронизации)
import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useState} from 'react';
import type {Product} from '../services/api';
import toast from 'react-hot-toast';
import {ShoppingBag, XCircle, Check} from 'lucide-react';

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
    addToCart: (product: Product, variant: ProductVariant) => void;
    removeFromCart: (variantId: string) => void;
    updateQuantity: (variantId: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    getVariantId: (productId: number, variant: ProductVariant) => string;
    getItemByVariantId: (variantId: string) => CartItem | undefined;
    isProductAvailable: (product: Product, variant: ProductVariant) => boolean;
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

    // Проверка доступности товара с вариантом
    const isProductAvailable = (product: Product, variant: ProductVariant): boolean => {
        if (!variant.size) return false;

        // Если у товара есть метод для проверки
        if (product.getAvailableQuantityForSize) {
            return product.getAvailableQuantityForSize(variant.size) > 0;
        }

        // Fallback для обратной совместимости
        const variantData = product.variants?.find(v => v.size === variant.size);
        return variantData ? (variantData.actuallyAvailable || variantData.availableQuantity) > 0 : false;
    };

    // Добавление товара в корзину (без резервирования)
    const addToCart = (product: Product, variant: ProductVariant) => {
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
                    duration: 3000,
                    position: 'bottom-right',
                    style: {
                        background: '#f8f9fa',
                        border: '1px solid #dc3545',
                        borderRadius: '0',
                        padding: '12px 16px'
                    }
                }
            );
            return;
        }

        // Проверяем доступность
        if (!isProductAvailable(product, variant)) {
            toast.error(
                <div className="d-flex align-items-center">
                    <span className="me-2" style={{color: '#dc3545'}}>😔</span>
                    <span style={{fontFamily: "'Cormorant Garamond', serif"}}>
                        <strong>"{product.name}"</strong> (Размер: {variant.size}) закончился на складе
                    </span>
                </div>,
                {
                    duration: 4000,
                    style: {
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '0',
                        padding: '16px 20px'
                    }
                }
            );
            return;
        }

        const variantId = getVariantId(product.id, variant);

        const newItem: CartItem = {
            product,
            quantity: 1,
            selectedVariant: variant,
            variantId
        };

        setItems(prevItems => {
            const existingItem = prevItems.find(item => item.variantId === variantId);

            if (existingItem) {
                return prevItems.map(item =>
                    item.variantId === variantId
                        ? {...item, quantity: item.quantity + 1}
                        : item
                );
            }

            return [...prevItems, newItem];
        });

        // Показываем уведомление
        toast.success(
            <div className="d-flex align-items-center">
                <ShoppingBag size={18} className="me-2" />
                <div>
                    <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontWeight: '500',
                        fontSize: '0.95rem'
                    }}>
                        Товар добавлен
                    </div>
                    <div style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: '0.85rem',
                        color: '#666',
                        marginTop: '2px'
                    }}>
                        <strong>"{product.name}"</strong> (Размер: {variant.size})
                    </div>
                </div>
            </div>,
            {
                duration: 2500,
                position: 'bottom-right',
                style: {
                    background: '#f8f9fa',
                    border: '1px solid #28a745',
                    borderLeft: '3px solid #28a745',
                    borderRadius: '0',
                    padding: '12px 16px'
                }
            }
        );
    };

    // Удаление товара из корзины
    const removeFromCart = (variantId: string) => {
        const itemToRemove = items.find(item => item.variantId === variantId);

        if (itemToRemove) {
            toast(
                <div className="d-flex align-items-center">
                    <XCircle size={18} className="me-2" style={{color: '#6c757d'}} />
                    <div>
                        <div style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: '500',
                            fontSize: '0.95rem'
                        }}>
                            Товар удален
                        </div>
                        <div style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '0.85rem',
                            color: '#666',
                            marginTop: '2px'
                        }}>
                            <strong>"{itemToRemove.product.name}"</strong> (Размер: {itemToRemove.selectedVariant.size})
                        </div>
                    </div>
                </div>,
                {
                    duration: 2500,
                    position: 'bottom-right',
                    style: {
                        background: '#f8f9fa',
                        border: '1px solid #6c757d',
                        borderLeft: '3px solid #6c757d',
                        borderRadius: '0',
                        padding: '12px 16px'
                    }
                }
            );
        }

        setItems(prevItems => prevItems.filter(item => item.variantId !== variantId));
    };

    // Обновление количества
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

    // Очистка корзины
    const clearCart = () => {
        setItems([]);
        toast.success(
            <div className="d-flex align-items-center">
                <Check size={18} className="me-2" />
                <span style={{fontFamily: "'Cormorant Garamond', serif"}}>
                    Корзина очищена
                </span>
            </div>,
            {
                duration: 2500,
                position: 'bottom-right',
                style: {
                    background: '#f8f9fa',
                    border: '1px solid #28a745',
                    borderLeft: '3px solid #28a745',
                    borderRadius: '0',
                    padding: '12px 16px'
                }
            }
        );
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
            isProductAvailable
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