// CartContext.tsx - ОБНОВЛЕННЫЙ ДЛЯ РАБОТЫ С РАЗМЕРАМИ
import type {ReactNode} from 'react';
import {createContext, useContext, useEffect, useState, useCallback} from 'react';
import type {Product, CartSyncItemRequest} from '../services/api';
import { cartService } from '../services/api';
import MySwal from '../utils/swalConfig';
import toast from 'react-hot-toast';
import { RefreshCw, Check, AlertTriangle, AlertCircle, ShoppingBag, XCircle } from 'lucide-react';

// Тип для варианта товара (теперь обязателен размер)
export interface ProductVariant {
    size: string;  // Размер теперь обязателен
    color?: string;
}

// Товар в корзине теперь включает вариант с размером
export interface CartItem {
    product: Product;
    quantity: number;
    selectedVariant: ProductVariant;  // Теперь обязателен
    variantId: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (product: Product, variant: ProductVariant) => Promise<void>;
    removeFromCart: (variantId: string) => Promise<void>;
    updateQuantity: (variantId: string, quantity: number) => Promise<void>;
    clearCart: () => Promise<void>;
    totalItems: number;
    totalPrice: number;
    getVariantId: (productId: number, variant: ProductVariant) => string;
    syncWithServer: () => Promise<void>;
    isSyncing: boolean;
    lastSyncError?: string;
    getItemByVariantId: (variantId: string) => CartItem | undefined;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({children}: { children: ReactNode }) => {
    // Загружаем корзину из localStorage при инициализации
    const [items, setItems] = useState<CartItem[]>(() => {
        const savedCart = localStorage.getItem('fashionstore_cart');
        return savedCart ? JSON.parse(savedCart) : [];
    });

    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncError, setLastSyncError] = useState<string>();

    // Сохраняем корзину в localStorage при каждом изменении
    useEffect(() => {
        localStorage.setItem('fashionstore_cart', JSON.stringify(items));
    }, [items]);

    // Генерация уникального ID для варианта (теперь размер обязателен)
    const getVariantId = (productId: number, variant: ProductVariant): string => {
        // Размер теперь обязателен
        const size = variant.size || 'ONE SIZE';
        const colorPart = variant.color ? `-color-${variant.color.trim().toLowerCase()}` : '';
        return `${productId}-size-${size.trim().toLowerCase()}${colorPart}`;
    };

    // Получить элемент по variantId
    const getItemByVariantId = (variantId: string): CartItem | undefined => {
        return items.find(item => item.variantId === variantId);
    };

    // Преобразование CartItem в CartSyncItemRequest для API
    const convertToSyncItems = useCallback((cartItems: CartItem[]): CartSyncItemRequest[] => {
        return cartItems.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            size: item.selectedVariant.size,  // Размер теперь обязателен
            color: item.selectedVariant.color
        }));
    }, []);

    // Синхронизация корзины с сервером
    const syncWithServer = useCallback(async () => {
        if (items.length === 0) return;

        setIsSyncing(true);
        setLastSyncError(undefined);

        try {
            const syncItems = convertToSyncItems(items);
            const result = await cartService.syncCart(syncItems);

            if (result.updates && result.updates.length > 0) {
                const updates = result.updates;
                const removedProducts: Array<{name: string, size: string}> = [];
                const updatedProducts: Array<{name: string, size: string, oldQty: number, newQty: number}> = [];

                const newItems = items.map(item => {
                    // Находим обновление по productId и size
                    const update = updates.find(u =>
                        u.productId === item.product.id &&
                        u.size === item.selectedVariant.size
                    );

                    if (!update) return item;

                    // Товар полностью удален (куплен другим клиентом)
                    if (update.removed) {
                        removedProducts.push({
                            name: item.product.name,
                            size: item.selectedVariant.size
                        });
                        return null;
                    }

                    // Количество изменилось (меньше чем в корзине)
                    if (update.availableQuantity < item.quantity) {
                        updatedProducts.push({
                            name: item.product.name,
                            size: item.selectedVariant.size,
                            oldQty: item.quantity,
                            newQty: update.availableQuantity
                        });

                        return {
                            ...item,
                            quantity: update.availableQuantity
                        };
                    }

                    return item;
                }).filter(Boolean) as CartItem[];

                // Показываем уведомления о изменениях
                if (removedProducts.length > 0 || updatedProducts.length > 0) {
                    let notificationTitle = '';
                    let notificationHtml = '';
                    let notificationIcon: 'warning' | 'error' = 'warning';

                    if (removedProducts.length > 0 && updatedProducts.length === 0) {
                        // Только удаленные товары
                        notificationTitle = 'Товары удалены из корзины';
                        notificationIcon = 'error';
                        notificationHtml = `
                            <div style="font-family: 'Cormorant Garamond', serif; color: #666; line-height: 1.6">
                                <p>Следующие товары были куплены другими клиентами и удалены из вашей корзины:</p>
                                <ul style="padding-left: 20px; margin-top: 10px">
                                    ${removedProducts.map(({name, size}) =>
                            `<li><strong>"${name}"</strong> (Размер: ${size})</li>`
                        ).join('')}
                                </ul>
                            </div>
                        `;
                    }
                    else if (updatedProducts.length > 0 && removedProducts.length === 0) {
                        // Только измененные количества
                        notificationTitle = 'Количества изменены';
                        notificationIcon = 'warning';
                        notificationHtml = `
                            <div style="font-family: 'Cormorant Garamond', serif; color: #666; line-height: 1.6">
                                <p>Доступные количества товаров изменились:</p>
                                <ul style="padding-left: 20px; margin-top: 10px">
                                    ${updatedProducts.map(({name, size, oldQty, newQty}) =>
                            `<li><strong>"${name}"</strong> (Размер: ${size}): ${oldQty} → ${newQty} шт.</li>`
                        ).join('')}
                                </ul>
                                <p class="mt-3 small text-muted">Другие клиенты зарезервировали часть товаров.</p>
                            </div>
                        `;
                    }
                    else {
                        // И удаленные, и измененные
                        notificationTitle = 'Изменения в корзине';
                        notificationIcon = 'error';
                        notificationHtml = `
                            <div style="font-family: 'Cormorant Garamond', serif; color: #666; line-height: 1.6">
                                <p>В вашей корзине произошли изменения:</p>
                                
                                ${removedProducts.length > 0 ? `
                                <p class="mt-2"><strong>Удалены (куплены другими):</strong></p>
                                <ul style="padding-left: 20px">
                                    ${removedProducts.map(({name, size}) =>
                            `<li>"${name}" (Размер: ${size})</li>`
                        ).join('')}
                                </ul>
                                ` : ''}
                                
                                ${updatedProducts.length > 0 ? `
                                <p class="mt-2"><strong>Изменены количества:</strong></p>
                                <ul style="padding-left: 20px">
                                    ${updatedProducts.map(({name, size, oldQty, newQty}) =>
                            `<li>"${name}" (Размер: ${size}): ${oldQty} → ${newQty} шт.</li>`
                        ).join('')}
                                </ul>
                                ` : ''}
                                
                                <p class="mt-3 small text-muted">Рекомендуем проверить корзину перед оформлением заказа.</p>
                            </div>
                        `;
                    }

                    // Показываем SweetAlert2 для важных изменений
                    MySwal.fire({
                        title: `<div style="font-family: 'Playfair Display', serif; font-weight: 300">${notificationTitle}</div>`,
                        html: notificationHtml,
                        icon: notificationIcon,
                        customClass: {
                            popup: 'rounded-0 border-0',
                            title: 'fw-light mb-3',
                            htmlContainer: 'text-muted',
                            confirmButton: 'btn btn-dark rounded-0 px-4 py-2',
                            actions: 'mt-4'
                        },
                        buttonsStyling: false,
                        background: '#f8f9fa',
                        showConfirmButton: true,
                        confirmButtonText: 'Понятно',
                        confirmButtonColor: '#000',
                        width: '520px'
                    });

                    // Обновляем корзину
                    setItems(newItems);
                }
            }

            // Информационные сообщения показываем через toast (ненавязчиво)
            else if (result.message && result.message !== 'Корзина актуальна') {
                toast(
                    <div className="d-flex align-items-center">
                        <RefreshCw size={18} className="me-2" style={{ color: '#17a2b8' }} />
                        <div>
                            <div style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: '500',
                                fontSize: '0.95rem'
                            }}>
                                Корзина синхронизирована
                            </div>
                            <div style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '0.85rem',
                                color: '#666',
                                marginTop: '2px'
                            }}>
                                {result.message}
                            </div>
                        </div>
                    </div>,
                    {
                        duration: 3000,
                        position: 'bottom-right',
                        style: {
                            background: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderLeft: '3px solid #17a2b8',
                            borderRadius: '0',
                            padding: '12px 16px',
                            maxWidth: '350px'
                        }
                    }
                );
            }

        } catch (error) {
            console.error('Ошибка синхронизации корзины:', error);
            setLastSyncError('Не удалось синхронизировать корзину');

            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                // Сетевая ошибка - показываем короткий toast
                toast.error(
                    <div className="d-flex align-items-center">
                        <AlertTriangle size={18} className="me-2" />
                        <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.9rem' }}>
                            Нет соединения с сервером
                        </span>
                    </div>,
                    {
                        duration: 3000,
                        position: 'bottom-right',
                        style: {
                            background: '#f8f9fa',
                            border: '1px solid #ffc107',
                            borderRadius: '0',
                            padding: '12px 16px'
                        }
                    }
                );
            } else {
                toast.error(
                    <div className="d-flex align-items-center">
                        <AlertCircle size={18} className="me-2" />
                        <div>
                            <div style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontWeight: '500',
                                fontSize: '0.95rem'
                            }}>
                                Ошибка синхронизации
                            </div>
                            <div style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontSize: '0.85rem',
                                color: '#666',
                                marginTop: '2px'
                            }}>
                                Обновите страницу для проверки корзины
                            </div>
                        </div>
                    </div>,
                    {
                        duration: 4000,
                        position: 'bottom-right',
                        style: {
                            background: '#f8f9fa',
                            border: '1px solid #dc3545',
                            borderRadius: '0',
                            padding: '12px 16px'
                        }
                    }
                );
            }
        } finally {
            setIsSyncing(false);
        }
    }, [items, convertToSyncItems]);

    // Автоматическая синхронизация каждые 30 секунд
    useEffect(() => {
        if (items.length === 0) return;

        const interval = setInterval(syncWithServer, 30000); // 30 секунд

        // Также синхронизируем при загрузке страницы
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                syncWithServer();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [items, syncWithServer]);

    // Резервирование товаров при добавлении
    const reserveItems = async (itemsToReserve: CartSyncItemRequest[]) => {
        try {
            await cartService.reserveItems(itemsToReserve);
        } catch (error) {
            console.error('Ошибка резервирования товаров:', error);
        }
    };

    // Освобождение резервирования при удалении
    const releaseItems = async (itemsToRelease: CartSyncItemRequest[]) => {
        try {
            await cartService.releaseItems(itemsToRelease);
        } catch (error) {
            console.error('Ошибка освобождения товаров:', error);
        }
    };

    // Добавление товара с учётом варианта и резервированием
    const addToCart = async (product: Product, variant: ProductVariant) => {
        // Размер теперь обязателен
        if (!variant.size) {
            toast.error(
                <div className="d-flex align-items-center">
                    <AlertCircle size={18} className="me-2" />
                    <span style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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

        // Резервируем товар на сервере
        try {
            await reserveItems([{
                productId: product.id,
                quantity: 1,
                size: variant.size,
                color: variant.color
            }]);

            // Показываем уведомление об успешном добавлении через toast
            const itemName = product.name;
            const sizeText = ` (Размер: ${variant.size})`;
            const colorText = variant.color ? ` (Цвет: ${variant.color})` : '';

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
                            <strong>"{itemName}"</strong>{sizeText}{colorText}
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
        } catch (error) {
            console.error('Ошибка резервирования:', error);
        }
    };

    // Удаление конкретного варианта товара с освобождением резервирования
    const removeFromCart = async (variantId: string) => {
        const itemToRemove = items.find(item => item.variantId === variantId);

        if (itemToRemove) {
            // Освобождаем резервирование
            await releaseItems([{
                productId: itemToRemove.product.id,
                quantity: itemToRemove.quantity,
                size: itemToRemove.selectedVariant.size,
                color: itemToRemove.selectedVariant.color
            }]);

            // Показываем уведомление об удалении через toast
            toast(
                <div className="d-flex align-items-center">
                    <XCircle size={18} className="me-2" style={{ color: '#6c757d' }} />
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
                            <strong>"{itemToRemove.product.name}"</strong> (Размер: {itemToRemove.selectedVariant.size}) удален из корзины
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

    // Обновление количества для конкретного варианта
    const updateQuantity = async (variantId: string, quantity: number) => {
        if (quantity < 1) {
            await removeFromCart(variantId);
            return;
        }

        const oldItem = items.find(item => item.variantId === variantId);

        if (!oldItem) return;

        const oldQuantity = oldItem.quantity;

        // Обновляем в состоянии
        setItems(prevItems =>
            prevItems.map(item =>
                item.variantId === variantId ? {...item, quantity} : item
            )
        );

        // Обрабатываем резервирование
        const quantityDiff = quantity - oldQuantity;
        if (quantityDiff > 0) {
            // Добавили больше - резервируем разницу
            await reserveItems([{
                productId: oldItem.product.id,
                quantity: quantityDiff,
                size: oldItem.selectedVariant.size,
                color: oldItem.selectedVariant.color
            }]);
        } else if (quantityDiff < 0) {
            // Уменьшили количество - освобождаем разницу
            await releaseItems([{
                productId: oldItem.product.id,
                quantity: -quantityDiff, // положительное число
                size: oldItem.selectedVariant.size,
                color: oldItem.selectedVariant.color
            }]);
        }
    };

    const clearCart = async () => {
        if (items.length === 0) return;

        // Освобождаем все резервирования
        await releaseItems(convertToSyncItems(items));
        setItems([]);

        // Показываем уведомление об очистке через toast
        toast.success(
            <div className="d-flex align-items-center">
                <Check size={18} className="me-2" />
                <span style={{ fontFamily: "'Cormorant Garamond', serif" }}>
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

    // Общее количество товаров (сумма quantity всех вариантов)
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    // Общая стоимость
    const totalPrice = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

    // Синхронизация при монтировании компонента (только если есть товары)
    useEffect(() => {
        if (items.length > 0) {
            // Запускаем синхронизацию через 2 секунды после загрузки
            const timer = setTimeout(() => {
                syncWithServer();
            }, 2000);

            return () => clearTimeout(timer);
        }
    }, []); // Только при первом монтировании

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
            syncWithServer,
            isSyncing,
            lastSyncError,
            getItemByVariantId
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