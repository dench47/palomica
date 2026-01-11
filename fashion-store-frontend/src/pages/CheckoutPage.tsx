// Заменяем весь файл CheckoutPage.tsx на этот код:
import { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { orderService } from '../services/orderService';
import {showCartNotification, showOrderNotification} from '../utils/swalConfig';






const CheckoutPage = () => {
    const { items, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const isGuest = searchParams.get('guest') === 'true';

    const [step, setStep] = useState(1); // 1 - доставка, 2 - оплата
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [comment, setComment] = useState('');

       // Состояние для полей клиента (только для гостей)
    const [customerData, setCustomerData] = useState({
        name: '',
        email: '',
        phone: ''
    });

    // Состояние для выбора доставки и оплаты
    const [deliveryMethod, setDeliveryMethod] = useState('courier');
    const [paymentMethod, setPaymentMethod] = useState('card');

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Для реального приложения здесь нужно получать данные из профиля пользователя
            const finalCustomerData = isGuest ? customerData : {
                name: "Имя из профиля", // TODO: заменить на реальные данные
                email: "email@example.com",
                phone: "+79991234567"
            };

            // Собираем данные для заказа
            const orderData = {
                customerName: finalCustomerData.name,
                customerEmail: finalCustomerData.email,
                customerPhone: finalCustomerData.phone,
                deliveryAddress: "Москва, ул. Тверская, 15", // TODO: добавить поле адреса
                deliveryMethod,
                paymentMethod,
                comment,
                items,
                total: totalPrice
            };

            console.log('Отправка заказа:', orderData);

            // Отправляем заказ на сервер
            const result = await orderService.createOrder(orderData);

            if (result.success && result.orderId) {
                const generatedOrderNumber = 'ORD' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

                // Очищаем корзину
                clearCart();

                // Показываем красивое уведомление о заказе
                showOrderNotification(
                    'Заказ оформлен!',
                    `Номер заказа: <strong>#${generatedOrderNumber}</strong><br><br>
                 Мы свяжемся с вами для подтверждения в течение 30 минут.<br>
                 Сумма заказа: <strong>${formatPrice(totalPrice)}</strong>`
                ).then(() => {
                    setIsSubmitting(false);
                    setOrderComplete(true);
                });
            } else {
                setIsSubmitting(false);
                showCartNotification(
                    'Ошибка оформления',
                    result.error || 'Не удалось оформить заказ',
                    'error'
                );
            }
        } catch {
            setIsSubmitting(false);
            showCartNotification(
                'Ошибка',
                'Произошла ошибка при оформлении заказа',
                'error'
            );
        }
    };

    if (items.length === 0 && !orderComplete) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{ fontSize: '3rem', opacity: 0.1 }}>📦</div>
                    <h2 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Корзина пуста
                    </h2>
                    <p className="text-muted mb-4 small">Добавьте товары для оформления заказа</p>
                    <Link
                        to="/"
                        className="btn btn-outline-dark rounded-0 px-5 py-3 fw-light"
                        style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                    >
                        ВЕРНУТЬСЯ К ПОКУПКАМ
                    </Link>
                </div>
            </div>
        );
    }

    if (orderComplete) {
        return (
            <div style={{
                backgroundColor: '#9696a8',
                minHeight: '100vh',
                width: '100%',
                paddingTop: '120px' // Добавляем отступ сверу для шапки
            }}>
                <div className="container-fluid px-0 d-flex flex-column align-items-center justify-content-center">
                    <div className="text-center w-100" style={{ maxWidth: '900px' }}>
                        {/* Логотип из бэкенда */}
                        <div className="mb-4 d-flex justify-content-center">
                            <img
                                src="/images/logo-thanks.jpg"
                                alt="Fashion Store"
                                className="img-fluid"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '40vh', // Уменьшили высоту логотипа
                                    objectFit: 'contain'
                                }}
                            />
                        </div>

                        {/* Текст и кнопка */}
                        <div className="mt-2">
                            {/* Новая надпись */}
                            <div className="mb-4">
                                <h2
                                    className="fw-light mb-3"
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        color: '#282840',
                                        fontSize: '1.8rem',
                                        letterSpacing: '0.05em'
                                    }}
                                >
                                    Спасибо за заказ!
                                </h2>

                            </div>

                            {/* Кнопка */}
                            <div className="d-flex justify-content-center">
                                <Link
                                    to="/"
                                    className="btn btn-dark rounded-0 px-5 py-3 fw-light"
                                    style={{
                                        letterSpacing: '0.1em',
                                        fontSize: '0.9rem',
                                        minWidth: '200px',
                                        backgroundColor: '#282840',
                                        borderColor: '#282840',
                                        marginTop: '10px'
                                    }}
                                >
                                    НА ГЛАВНУЮ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const handleCustomerDataChange = (field: string, value: string) => {
        setCustomerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Проверяем, можно ли перейти к шагу 2
    const canGoToStep2 = () => {
        if (isGuest) {
            return customerData.name.trim() !== '' &&
                customerData.email.trim() !== '' &&
                customerData.phone.trim() !== '';
        }
        return true; // Для вошедших пользователей всегда можно
    };

    return (
        <div className="container-fluid px-0">
            {/* Заголовок */}
            <div className="px-4 px-md-5 pt-5">
                <h1 className="fw-light text-center mb-1" style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.5rem',
                    letterSpacing: '0.05em'
                }}>
                    Оформление заказа
                </h1>
                <p className="text-center text-muted small mb-5">
                    {step === 1 ? 'Доставка' : 'Оплата и подтверждение'}
                </p>
            </div>

            <div className="row g-0">
                {/* Форма */}
                <div className="col-lg-8 px-4 px-md-5 pb-5">
                    <form onSubmit={handleSubmit}>
                        {/* Шаг 1: Доставка и данные клиента */}
                        {step === 1 && (
                            <div className="mb-5">
                                {/* Данные клиента (только для гостей) */}
                                {isGuest && (
                                    <div className="mb-5">
                                        <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                            Ваши данные
                                        </h3>
                                        <div className="row">
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted">Имя *</label>
                                                <input
                                                    type="text"
                                                    className="form-control rounded-0 border-1"
                                                    required
                                                    value={customerData.name}
                                                    onChange={(e) => handleCustomerDataChange('name', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted">Email *</label>
                                                <input
                                                    type="email"
                                                    className="form-control rounded-0 border-1"
                                                    required
                                                    value={customerData.email}
                                                    onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                                                />
                                            </div>
                                            <div className="col-md-4 mb-3">
                                                <label className="form-label small text-muted">Телефон *</label>
                                                <input
                                                    type="tel"
                                                    className="form-control rounded-0 border-1"
                                                    required
                                                    value={customerData.phone}
                                                    onChange={(e) => handleCustomerDataChange('phone', e.target.value)}
                                                    placeholder="+7 (999) 123-45-67"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Способ доставки */}
                                <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Способ доставки
                                </h3>

                                <div className="mb-4">
                                    <div className="form-check mb-3 border-bottom pb-3">
                                        <input
                                            className="form-check-input rounded-0"
                                            type="radio"
                                            name="delivery"
                                            id="courier"
                                            checked={deliveryMethod === 'courier'}
                                            onChange={() => setDeliveryMethod('courier')}
                                        />
                                        <label className="form-check-label w-100" htmlFor="courier">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <strong>Курьерская доставка</strong>
                                                    <p className="small text-muted mb-0">1-3 рабочих дня · Бесплатно</p>
                                                </div>
                                                <span className="text-success">Бесплатно</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="form-check mb-3 border-bottom pb-3">
                                        <input
                                            className="form-check-input rounded-0"
                                            type="radio"
                                            name="delivery"
                                            id="post"
                                            checked={deliveryMethod === 'post'}
                                            onChange={() => setDeliveryMethod('post')}
                                        />
                                        <label className="form-check-label w-100" htmlFor="post">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <strong>Почта России</strong>
                                                    <p className="small text-muted mb-0">5-14 рабочих дней</p>
                                                </div>
                                                <span>от 350 ₽</span>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            className="form-check-input rounded-0"
                                            type="radio"
                                            name="delivery"
                                            id="pickup"
                                            checked={deliveryMethod === 'pickup'}
                                            onChange={() => setDeliveryMethod('pickup')}
                                        />
                                        <label className="form-check-label w-100" htmlFor="pickup">
                                            <div className="d-flex justify-content-between">
                                                <div>
                                                    <strong>Самовывоз из магазина</strong>
                                                    <p className="small text-muted mb-0">Москва, ул. Тверская, 15</p>
                                                </div>
                                                <span className="text-success">Бесплатно</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small text-muted">Комментарий к заказу</label>
                                    <textarea
                                        className="form-control rounded-0 border-1"
                                        rows={3}
                                        value={comment}
                                        onChange={(e) => setComment(e.target.value)}
                                        placeholder="Например: позвоните за час до доставки, нужна подарочная упаковка, код домофона и т.д."
                                    />
                                    <small className="text-muted">Необязательно</small>
                                </div>

                                <div className="mt-5 d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark rounded-0 px-5 py-3 fw-light"
                                        onClick={() => navigate('/cart')}
                                        style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                                    >
                                        ← НАЗАД
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-dark rounded-0 px-5 py-3 fw-light"
                                        onClick={() => setStep(2)}
                                        disabled={!canGoToStep2()}
                                        style={{
                                            letterSpacing: '0.1em',
                                            fontSize: '0.9rem',
                                            opacity: canGoToStep2() ? 1 : 0.5
                                        }}
                                    >
                                        ДАЛЕЕ: ОПЛАТА
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Шаг 2: Оплата */}
                        {step === 2 && (
                            <div className="mb-5">
                                <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Способ оплаты
                                </h3>

                                <div className="mb-5">
                                    <div className="form-check mb-3 border-bottom pb-3">
                                        <input
                                            className="form-check-input rounded-0"
                                            type="radio"
                                            name="payment"
                                            id="card"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                        />
                                        <label className="form-check-label w-100" htmlFor="card">
                                            <div>
                                                <strong>Банковской картой онлайн</strong>
                                                <p className="small text-muted mb-0">Visa, Mastercard, МИР</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="form-check mb-3 border-bottom pb-3">
                                        <input
                                            className="form-check-input rounded-0"
                                            type="radio"
                                            name="payment"
                                            id="cash"
                                            checked={paymentMethod === 'cash'}
                                            onChange={() => setPaymentMethod('cash')}
                                        />
                                        <label className="form-check-label w-100" htmlFor="cash">
                                            <div>
                                                <strong>Наличными при получении</strong>
                                                <p className="small text-muted mb-0">Только для курьерской доставки</p>
                                            </div>
                                        </label>
                                    </div>

                                    <div className="form-check">
                                        <input
                                            className="form-check-input rounded-0"
                                            type="radio"
                                            name="payment"
                                            id="sbp"
                                            checked={paymentMethod === 'sbp'}
                                            onChange={() => setPaymentMethod('sbp')}
                                        />
                                        <label className="form-check-label w-100" htmlFor="sbp">
                                            <div>
                                                <strong>СБП (Система быстрых платежей)</strong>
                                                <p className="small text-muted mb-0">По QR-коду или номеру телефона</p>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-top">
                                    <div className="form-check mb-4">
                                        <input
                                            className="form-check-input rounded-0"
                                            type="checkbox"
                                            id="agree"
                                            required
                                        />
                                        <label className="form-check-label small text-muted" htmlFor="agree">
                                            Я соглашаюсь с условиями обработки персональных данных и правилами возврата
                                        </label>
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <button
                                            type="button"
                                            className="btn btn-outline-dark rounded-0 px-5 py-3 fw-light"
                                            onClick={() => setStep(1)}
                                            style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                                        >
                                            ← НАЗАД
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-dark rounded-0 px-5 py-3 fw-light"
                                            disabled={isSubmitting}
                                            style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                    ОФОРМЛЯЕМ...
                                                </>
                                            ) : (
                                                'ПОДТВЕРДИТЬ ЗАКАЗ'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Панель итогов */}
                <div className="col-lg-4 bg-light px-4 px-md-5 py-5">
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Ваш заказ
                        </h3>

                        <div className="mb-4">
                            {items.slice(0, 3).map(item => (
                                <div key={item.variantId} className="d-flex mb-3 pb-3 border-bottom">
                                    <div
                                        className="flex-shrink-0 me-3"
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            backgroundImage: `url(${item.product.imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    ></div>
                                    <div className="flex-grow-1">
                                        <p className="small mb-1">{item.product.name}</p>

                                        <div className="mb-1">
    <span className="badge bg-dark text-light me-1 rounded-0 px-1 py-0"
          style={{ fontSize: '0.65rem' }}>
        Размер: {item.selectedVariant.size}
    </span>

                                            {item.selectedVariant.color && (
                                                <span className="badge bg-dark text-light rounded-0 px-1 py-0"
                                                      style={{ fontSize: '0.65rem' }}>
            Цвет: {item.selectedVariant.color}
        </span>
                                            )}
                                        </div>

                                        <div className="d-flex justify-content-between">
                                            <span className="small text-muted">{item.quantity} шт.</span>
                                            <span className="small">{formatPrice(item.product.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {items.length > 3 && (
                                <p className="small text-muted text-center mb-0">
                                    и еще {items.length - 3} товара
                                </p>
                            )}
                        </div>

                        <div className="border-top pt-3">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="small text-muted">Сумма товаров</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>

                            <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <strong className="fw-normal">Итого к оплате</strong>
                                <strong className="fs-5">{formatPrice(totalPrice)}</strong>
                            </div>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;