import { useState, useEffect } from 'react'; // Добавляем useEffect
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

const CheckoutPage = () => {
    const { items, totalPrice, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [orderNumber, setOrderNumber] = useState<string>(''); // Добавляем состояние для номера заказа

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        comment: ''
    });

    // Генерируем номер заказа один раз при монтировании
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setOrderNumber('ORD' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0'));
    }, []);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Имитация отправки на сервер
        setTimeout(() => {
            console.log('Заказ отправлен:', { formData, items, totalPrice });
            setIsSubmitting(false);
            setOrderComplete(true);
            // Очищаем корзину только после успешного оформления
            clearCart();
        }, 1500);
    };

    // Выносим проверку пустой корзины в отдельную логику
    const shouldShowEmptyCart = items.length === 0 && !orderComplete;

    if (shouldShowEmptyCart) {
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
            <div className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100" style={{ maxWidth: '600px' }}>
                    <div className="mb-4" style={{ fontSize: '4rem' }}>✅</div>
                    <h2 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Заказ оформлен!
                    </h2>
                    <p className="text-muted mb-4">
                        Мы отправили детали заказа на email: <strong>{formData.email}</strong>
                    </p>
                    <p className="small text-muted mb-5">
                        Номер заказа: #{orderNumber}<br/>
                        Менеджер свяжется с вами для подтверждения в течение 30 минут.
                    </p>
                    <Link
                        to="/"
                        className="btn btn-dark rounded-0 px-5 py-3 fw-light"
                        style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                    >
                        НА ГЛАВНУЮ
                    </Link>
                </div>
            </div>
        );
    }

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
                    Шаг {step} из 3
                </p>
            </div>

            <div className="row g-0">
                {/* Форма */}
                <div className="col-lg-8 px-4 px-md-5 pb-5">
                    <form onSubmit={handleSubmit}>
                        {/* Шаг 1: Контактные данные */}
                        {step === 1 && (
                            <div className="mb-5">
                                <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Контактные данные
                                </h3>

                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Имя и фамилия *</label>
                                        <input
                                            type="text"
                                            className="form-control rounded-0 border-1"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label small text-muted">Телефон *</label>
                                        <input
                                            type="tel"
                                            className="form-control rounded-0 border-1"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small text-muted">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control rounded-0 border-1"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small text-muted">Адрес доставки *</label>
                                        <textarea
                                            className="form-control rounded-0 border-1"
                                            rows={3}
                                            value={formData.address}
                                            onChange={(e) => setFormData({...formData, address: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="col-12">
                                        <label className="form-label small text-muted">Комментарий к заказу</label>
                                        <textarea
                                            className="form-control rounded-0 border-1"
                                            rows={2}
                                            value={formData.comment}
                                            onChange={(e) => setFormData({...formData, comment: e.target.value})}
                                            placeholder="Например: позвоните за час до доставки"
                                        />
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <button
                                        type="button"
                                        className="btn btn-dark rounded-0 px-5 py-3 fw-light"
                                        onClick={() => setStep(2)}
                                        style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                                    >
                                        ДАЛЕЕ: ДОСТАВКА
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Шаг 2: Доставка */}
                        {step === 2 && (
                            <div className="mb-5">
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
                                            defaultChecked
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

                                <div className="d-flex justify-content-between mt-5">
                                    <button
                                        type="button"
                                        className="btn btn-outline-dark rounded-0 px-5 py-3 fw-light"
                                        onClick={() => setStep(1)}
                                        style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                                    >
                                        ← НАЗАД
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-dark rounded-0 px-5 py-3 fw-light"
                                        onClick={() => setStep(3)}
                                        style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                                    >
                                        ДАЛЕЕ: ОПЛАТА
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Шаг 3: Оплата */}
                        {step === 3 && (
                            <div className="mb-5">
                                <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Способ оплаты
                                </h3>

                                <div className="mb-4">
                                    <div className="form-check mb-3 border-bottom pb-3">
                                        <input
                                            className="form-check-input rounded-0"
                                            type="radio"
                                            name="payment"
                                            id="card"
                                            defaultChecked
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
                                            onClick={() => setStep(2)}
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

                {/* Корзина рядом */}
                <div className="col-lg-4 bg-light px-4 px-md-5 py-5">
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Ваш заказ
                        </h3>

                        <div className="mb-4">
                            {items.slice(0, 3).map(item => (
                                <div key={item.product.id} className="d-flex mb-3 pb-3 border-bottom">
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
                            <div className="d-flex justify-content-between mb-2">
                                <span className="small text-muted">Доставка</span>
                                <span className="text-success small">Бесплатно</span>
                            </div>
                            <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <strong className="fw-normal">Итого к оплате</strong>
                                <strong className="fs-5">{formatPrice(totalPrice)}</strong>
                            </div>
                        </div>

                        <div className="mt-4 pt-3 border-top">
                            <p className="small text-muted">
                                <span className="text-success">✓</span> Бесплатная доставка от 3000 ₽
                            </p>
                            <p className="small text-muted">
                                <span className="text-success">✓</span> Возврат в течение 14 дней
                            </p>
                            <p className="small text-muted">
                                <span className="text-success">✓</span> Конфиденциальность данных
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;