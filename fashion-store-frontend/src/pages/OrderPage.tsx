// pages/OrderPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { OrderDetails } from '../services/orderService';

const OrderPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');


    const [order, setOrder] = useState<OrderDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderId && token) {
            loadOrder();
        } else {
            setError('Неверная ссылка на заказ');
            setLoading(false);
        }
    }, [orderId, token]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const data = await orderService.getOrder(parseInt(orderId!), token!);
            setOrder(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Не удалось загрузить заказ');
            console.error('Error loading order:', err);
        } finally {
            setLoading(false);
        }
    };


    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="spinner-border" role="status" style={{
                        width: '3rem',
                        height: '3rem',
                        color: 'var(--accent-brown)'
                    }}>
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                    <p className="mt-3 text-muted small">Загружаем информацию о заказе...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{ fontSize: '3rem', opacity: 0.1, color: 'var(--accent-brown)' }}>⚠️</div>
                    <h2 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {error || 'Заказ не найден'}
                    </h2>
                    <p className="text-muted mb-4">Проверьте ссылку или обратитесь в поддержку</p>
                    <Link
                        to="/"
                        className="btn-fs btn-fs-outline"
                    >
                        Вернуться в магазин
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-0">
            <div className="px-4 px-md-5 pt-5">
                <h1 className="fw-light text-center mb-1" style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.5rem',
                    letterSpacing: '0.05em'
                }}>
                    Заказ #{order.orderNumber || order.id} {/* ИЗМЕНИТЬ! */}
                </h1>
                <p className="text-center text-muted small mb-5">
                    {formatDate(order.createdAt)}
                </p>
            </div>

            <div className="row g-0">
                <div className="col-lg-8 px-4 px-md-5 pb-5">
                    <div className="mb-5">
                        <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Статус заказа
                        </h3>
                        <div className="status-card" data-status={order.status.toLowerCase()}>
                            <div className="status-icon">
                                {getStatusIcon(order.status)}
                            </div>
                            <div className="status-content">
                                <div className="d-flex align-items-center">
                                    <span className="status-badge">
                                        {getStatusText(order.status)}
                                    </span>
                                    <span className="small text-muted ms-3">
                                        Обновлено: {formatDate(order.createdAt)}
                                    </span>
                                </div>
                                <p className="small text-muted mb-0 mt-2">
                                    {getStatusDescription(order.status)}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="mb-5">
                        <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Товары в заказе
                        </h3>
                        <div className="border rounded-3 overflow-hidden">
                            {order.items.map((item, index) => (
                                <div key={`${item.product.id}-${index}`} className="p-4 border-bottom bg-cream-light">
                                    <div className="row">
                                        <div className="col-md-2">
                                            <div className="order-item-image" style={{
                                                width: '80px',
                                                height: '80px',
                                                backgroundImage: `url(${item.product.imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderRadius: '8px'
                                            }}></div>
                                        </div>
                                        <div className="col-md-6">
                                            <h5 className="mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                                {item.product.name}
                                            </h5>
                                            {item.size && (
                                                <div className="small text-muted">Размер: {item.size}</div>
                                            )}
                                            {item.color && (
                                                <div className="small text-muted">Цвет: {item.color}</div>
                                            )}
                                            <div className="small text-muted">Количество: {item.quantity} шт.</div>
                                        </div>
                                        <div className="col-md-4 text-end">
                                            <div className="fw-light" style={{
                                                fontFamily: "'Cormorant Garamond', serif",
                                                fontSize: '1.1rem',
                                                color: 'var(--accent-brown)'
                                            }}>
                                                {formatPrice(item.price * item.quantity)}
                                            </div>
                                            <div className="small text-muted">
                                                {formatPrice(item.price)} × {item.quantity}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 bg-light px-4 px-md-5 py-5" style={{ backgroundColor: 'var(--cream-light)' }}>
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Информация о заказе
                        </h3>

                        <div className="mb-4">
                            <h4 className="h6 fw-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                Контактная информация
                            </h4>
                            <div className="small">
                                <div><strong>{order.customerName}</strong></div>
                                <div>{order.customerEmail}</div>
                                <div>{order.customerPhone}</div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="h6 fw-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                Доставка
                            </h4>
                            <div className="small">
                                <div><strong>{getDeliveryMethodText(order.deliveryMethod)}</strong></div>
                                {order.deliveryAddress && (
                                    <div>{order.deliveryAddress}</div>
                                )}
                            </div>
                        </div>

                        <div className="mb-4">
                            <h4 className="h6 fw-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                Оплата
                            </h4>
                            <div className="small">
                                <div><strong>{getPaymentMethodText(order.paymentMethod)}</strong></div>
                            </div>
                        </div>

                        {order.comment && (
                            <div className="mb-4">
                                <h4 className="h6 fw-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Комментарий
                                </h4>
                                <div className="small text-muted">
                                    {order.comment}
                                </div>
                            </div>
                        )}

                        {/* УБИРАЕМ "Сумма товаров" - оставляем только ИТОГО */}
                        <div className="border-top pt-3 mt-3">
                            <div className="d-flex justify-content-between mt-3">
                                <strong className="fw-normal fs-5">Итого</strong>
                                <strong className="fs-5" style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: 'var(--accent-brown)'
                                }}>
                                    {formatPrice(order.totalAmount)}
                                </strong>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-top">
                            <div className="button-group">
                                <Link
                                    to="/"
                                    className="btn-fs btn-fs-primary btn-fs-lg btn-fs-block"
                                >
                                    ПРОДОЛЖИТЬ ПОКУПКИ
                                </Link>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Вспомогательные функции
const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
        case 'NEW': return '🆕';
        case 'PROCESSING': return '🔄';
        case 'SHIPPED': return '🚚'; // ДОБАВЛЯЕМ ДЛЯ SHIPPED
        case 'COMPLETED': return '✅';
        case 'CANCELLED': return '❌';
        default: return '📋';
    }
};

const getStatusText = (status: string): string => {
    switch (status?.toUpperCase()) {
        case 'NEW': return 'Новый';
        case 'PROCESSING': return 'В обработке';
        case 'SHIPPED': return 'В доставке'; // ДОБАВЛЯЕМ РУССКИЙ ТЕКСТ
        case 'COMPLETED': return 'Завершен';
        case 'CANCELLED': return 'Отменен';
        default: return status || 'Неизвестно';
    }
};

const getStatusDescription = (status: string): string => {
    switch (status?.toUpperCase()) {
        case 'NEW': return 'Заказ принят и ожидает обработки';
        case 'PROCESSING': return 'Заказ готовится к отправке';
        case 'SHIPPED': return 'Заказ передан в службу доставки'; // ДОБАВЛЯЕМ ОПИСАНИЕ
        case 'COMPLETED': return 'Заказ доставлен и завершен';
        case 'CANCELLED': return 'Заказ был отменен';
        default: return 'Статус заказа не определен';
    }
};

const getDeliveryMethodText = (method: string): string => {
    switch (method?.toLowerCase()) {
        case 'courier': return 'Курьерская доставка';
        case 'post': return 'Почта России';
        case 'pickup': return 'Самовывоз';
        case 'marketplace': return 'Маркетплейсы (Wildberries, OZON)';
        default: return method || 'Не указано';
    }
};

const getPaymentMethodText = (method: string): string => {
    switch (method?.toLowerCase()) {
        case 'card': return 'Банковской картой';
        case 'cash': return 'Наличными при получении';
        case 'sbp': return 'СБП (Система быстрых платежей)';
        default: return method || 'Не указано';
    }
};

export default OrderPage;