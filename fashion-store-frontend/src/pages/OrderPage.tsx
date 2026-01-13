// pages/OrderPage.tsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../services/orderService';
import type { OrderDetails } from '../services/orderService';
import { useCart } from '../context/CartContext';

const OrderPage = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();
    const { addToCart } = useCart();

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

    const handleReorder = async () => {
        if (!order) return;

        try {
            // Добавляем все товары из заказа в корзину
            for (const item of order.items) {
                // Создаем объект variant
                const variant = {
                    size: item.size || 'ONE SIZE',
                    color: item.color || undefined
                };

                // Добавляем каждый товар в корзину (product уже полный из orderService)
                addToCart(item.product, variant, item.quantity);
            }

            // Перенаправляем в корзину
            navigate('/cart');
        } catch (err) {
            console.error('Error reordering:', err);
            alert('Не удалось добавить товары в корзину');
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
                    <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
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
                    <div className="mb-4" style={{ fontSize: '3rem', opacity: 0.1 }}>⚠️</div>
                    <h2 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {error || 'Заказ не найден'}
                    </h2>
                    <p className="text-muted mb-4">Проверьте ссылку или обратитесь в поддержку</p>
                    <Link
                        to="/"
                        className="btn btn-outline-dark rounded-0 px-4 py-2"
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
                    Заказ #{order.id}
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
                        <div className="p-4 border" style={{ backgroundColor: 'var(--cream-light)' }}>
                            <div className="d-flex align-items-center">
                                <span className={`badge ${getStatusBadgeClass(order.status)} me-3 rounded-0`}
                                      style={{ padding: '6px 12px', fontSize: '0.85rem' }}>
                                    {getStatusText(order.status)}
                                </span>
                                <span className="small text-muted">
                                    Обновлено: {formatDate(order.createdAt)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mb-5">
                        <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Товары в заказе
                        </h3>
                        <div className="border">
                            {order.items.map((item, index) => (
                                <div key={`${item.product.id}-${index}`} className="p-4 border-bottom">
                                    <div className="row">
                                        <div className="col-md-2">
                                            <div style={{
                                                width: '80px',
                                                height: '80px',
                                                backgroundImage: `url(${item.product.imageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
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
                                                fontSize: '1.1rem'
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

                <div className="col-lg-4 bg-light px-4 px-md-5 py-5">
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

                        <div className="border-top pt-3 mt-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="small text-muted">Сумма товаров</span>
                                <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                            <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <strong className="fw-normal">Итого</strong>
                                <strong className="fs-5" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    {formatPrice(order.totalAmount)}
                                </strong>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-top">
                            <Link
                                to="/"
                                className="btn btn-dark rounded-0 w-100 py-3 fw-light mb-3"
                                style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                            >
                                ПРОДОЛЖИТЬ ПОКУПКИ
                            </Link>

                            <button
                                className="btn btn-outline-dark rounded-0 w-100 py-3 fw-light"
                                onClick={handleReorder}
                                style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                            >
                                ПОВТОРИТЬ ЗАКАЗ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Вспомогательные функции
const getStatusBadgeClass = (status: string): string => {
    switch (status?.toUpperCase()) {
        case 'NEW': return 'bg-primary';
        case 'PROCESSING': return 'bg-warning text-dark';
        case 'COMPLETED': return 'bg-success';
        case 'CANCELLED': return 'bg-danger';
        default: return 'bg-secondary';
    }
};

const getStatusText = (status: string): string => {
    switch (status?.toUpperCase()) {
        case 'NEW': return 'Новый';
        case 'PROCESSING': return 'В обработке';
        case 'COMPLETED': return 'Завершен';
        case 'CANCELLED': return 'Отменен';
        default: return status || 'Неизвестно';
    }
};

const getDeliveryMethodText = (method: string): string => {
    switch (method?.toLowerCase()) {
        case 'courier': return 'Курьерская доставка';
        case 'post': return 'Почта России';
        case 'pickup': return 'Самовывоз';
        default: return method || 'Не указано';
    }
};

const getPaymentMethodText = (method: string): string => {
    switch (method?.toLowerCase()) {
        case 'card': return 'Банковской картой';
        case 'cash': return 'Наличными при получении';
        case 'sbp': return 'СБП';
        default: return method || 'Не указано';
    }
};

export default OrderPage;