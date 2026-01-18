import { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import { orderService, type YandexDeliveryData } from '../services/orderService';
import { showCartNotification, showOrderNotification } from '../utils/swalConfig';
import { Truck, Package, Store, ShoppingBag, CreditCard, QrCode, MapPin } from 'lucide-react';

// Интерфейс для данных Яндекс.Доставки
interface YandexDeliveryPoint {
    id: string;
    address: {
        full_address: string;
        country: string;
        locality: string;
        street: string;
        house: string;
        comment: string;
    };
    type: string;
    payment_methods: string[];
}

// Интерфейс для глобального объекта YaDelivery
interface YaDeliveryGlobal {
    createWidget: (config: YaDeliveryConfig) => unknown;
    setParams?: (params: Record<string, unknown>) => void;
    destroyWidget?: (containerId: string) => void;
}

interface YaDeliveryConfig {
    containerId: string;
    params: {
        city: string;
        size: {
            height: string;
            width: string;
        };
        source_platform_station: string;
        physical_dims_weight_gross: number;
        delivery_price: (price: number) => string;
        delivery_term: number;
        show_select_button: boolean;
        filter: {
            type: string[];
            is_yandex_branded: boolean;
            payment_methods: string[];
            payment_methods_filter: string;
        };
    };
}

// Объявление глобального интерфейса для Яндекс.Доставки
declare global {
    interface Window {
        YaDelivery: YaDeliveryGlobal;
    }
}

// Тип для экземпляра виджета
type WidgetInstance = unknown;

const CheckoutPage = () => {
    const { items, totalPrice, clearCart } = useCart();
    const navigate = useNavigate();
    const widgetContainerRef = useRef<HTMLDivElement>(null);
    const widgetInstanceRef = useRef<WidgetInstance>(null);

    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);
    const [comment, setComment] = useState('');

    const [customerData, setCustomerData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [deliveryMethod, setDeliveryMethod] = useState('courier');
    const [paymentMethod, setPaymentMethod] = useState('card');

    // Состояние для Яндекс.Доставки
    const [yandexDeliveryData, setYandexDeliveryData] = useState<YandexDeliveryPoint | null>(null);
    const [widgetError, setWidgetError] = useState<string | null>(null);


    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const handleCustomerDataChange = useCallback((field: string, value: string) => {
        setCustomerData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Функция для обработки выбора ПВЗ
    useCallback((event: Event) => {
        const customEvent = event as CustomEvent<YandexDeliveryPoint>;
        const pointData = customEvent.detail;
        setYandexDeliveryData(pointData);
        console.log('Выбран ПВЗ:', pointData);
    }, []);
// Функция инициализации виджета
    const startWidget = useCallback(() => {
        if (window.YaDelivery && widgetContainerRef.current) {
            try {
                // Проверяем, что элемент все еще существует
                if (!document.getElementById('delivery-widget')) {
                    console.error('Контейнер виджета не найден');
                    setWidgetError('Контейнер карты не найден. Пожалуйста, обновите страницу.');
                    return;
                }

                // Очищаем предыдущий виджет
                if (widgetContainerRef.current) {
                    widgetContainerRef.current.innerHTML = '';
                }

                widgetInstanceRef.current = window.YaDelivery.createWidget({
                    containerId: 'delivery-widget',
                    params: {
                        city: "Москва",
                        size: {
                            "height": "450px",
                            "width": "100%"
                        },
                        source_platform_station: "05e809bb-4521-42d9-a936-0fb0744c0fb3",
                        physical_dims_weight_gross: 10000,
                        delivery_price: (price: number) => price + " руб",
                        delivery_term: 3,
                        show_select_button: true,
                        filter: {
                            type: [
                                "pickup_point",
                                "terminal"
                            ],
                            is_yandex_branded: false,
                            payment_methods: [
                                "already_paid",
                                "card_on_receipt"
                            ],
                            payment_methods_filter: "or"
                        }
                    },
                });
                setWidgetError(null);
                console.log('Виджет Яндекс.Доставки инициализирован');
            } catch (error) {
                console.error('Ошибка инициализации виджета Яндекс.Доставки:', error);
                setWidgetError('Не удалось загрузить карту пунктов выдачи. Пожалуйста, попробуйте позже.');
            }
        } else {
            setWidgetError('Библиотека Яндекс.Доставки не загружена. Пожалуйста, обновите страницу.');
        }
    }, []);

// Функция уничтожения виджета
    const destroyWidget = useCallback(() => {
        // Не пытаемся вызывать destroyWidget, так как он может не существовать
        // Просто очищаем контейнер
        if (widgetContainerRef.current) {
            widgetContainerRef.current.innerHTML = '';
        }
        widgetInstanceRef.current = null;
    }, []);

    // Инициализация виджета Яндекс.Доставки
    useEffect(() => {
        if (deliveryMethod === 'yandex') {
            console.log('Активация Яндекс.Доставки');
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setWidgetError(null); // Очищаем ошибки при активации

            // Загружаем скрипт только если он еще не загружен
            if (!document.querySelector('script[src*="ndd-widget.landpro.site"]')) {
                const script = document.createElement('script');
                script.src = 'https://ndd-widget.landpro.site/widget.js';
                script.async = true;

                script.onload = () => {
                    console.log('Скрипт Яндекс.Доставки загружен');
                    // Даем время на инициализацию
                    setTimeout(() => {
                        if (deliveryMethod === 'yandex' && widgetContainerRef.current) {
                            startWidget();
                        }
                    }, 500);
                };

                script.onerror = () => {
                    console.error('Не удалось загрузить скрипт Яндекс.Доставки');
                };

                document.head.appendChild(script);
            } else if (window.YaDelivery) {
                // Скрипт уже загружен, инициализируем виджет
                setTimeout(() => {
                    if (deliveryMethod === 'yandex' && widgetContainerRef.current) {
                        startWidget();
                    }
                }, 100);
            }

            // Подписка на событие выбора ПВЗ
            const handlePointSelected = (event: Event) => {
                const customEvent = event as CustomEvent<YandexDeliveryPoint>;
                const pointData = customEvent.detail;
                setYandexDeliveryData(pointData);
                console.log('Выбран ПВЗ:', pointData);
            };

            document.addEventListener('YaNddWidgetPointSelected', handlePointSelected);

            return () => {
                document.removeEventListener('YaNddWidgetPointSelected', handlePointSelected);
                destroyWidget();
            };
        } else {
            // Если не Яндекс.Доставка, очищаем виджет и данные
            destroyWidget();
            setYandexDeliveryData(null);
            setWidgetError(null); // Очищаем ошибки

        }
    }, [deliveryMethod, startWidget, destroyWidget]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Подготовка адреса доставки в зависимости от метода
            let deliveryAddress = '';
            let yandexDeliveryDataPayload: YandexDeliveryData | null = null;

            switch (deliveryMethod) {
                case 'pickup':
                    deliveryAddress = "Москва, ул. Тверская, 15 (самовывоз)";
                    break;
                case 'marketplace':
                    deliveryAddress = "Доставка через маркетплейсы";
                    break;
                case 'yandex':
                    if (!yandexDeliveryData) {
                        showCartNotification(
                            'Ошибка',
                            'Пожалуйста, выберите пункт выдачи Яндекс.Доставки',
                            'error'
                        );
                        setIsSubmitting(false);
                        return;
                    }
                    deliveryAddress = yandexDeliveryData.address.full_address;
                    yandexDeliveryDataPayload = {
                        pointId: yandexDeliveryData.id,
                        address: yandexDeliveryData.address.full_address,
                        city: yandexDeliveryData.address.locality,
                        street: yandexDeliveryData.address.street,
                        house: yandexDeliveryData.address.house,
                        comment: yandexDeliveryData.address.comment
                    };
                    break;
                default:
                    deliveryAddress = customerData.address;
            }

            const orderData = {
                customerName: customerData.name,
                customerEmail: customerData.email,
                customerPhone: customerData.phone,
                deliveryAddress,
                deliveryMethod,
                paymentMethod,
                comment,
                items,
                total: totalPrice,
                // Данные Яндекс.Доставки
                yandexDeliveryPointId: yandexDeliveryDataPayload?.pointId || null,
                yandexDeliveryAddress: yandexDeliveryDataPayload?.address || null,
                yandexDeliveryCity: yandexDeliveryDataPayload?.city || null,
                yandexDeliveryStreet: yandexDeliveryDataPayload?.street || null,
                yandexDeliveryHouse: yandexDeliveryDataPayload?.house || null,
                yandexDeliveryComment: yandexDeliveryDataPayload?.comment || null
            };

            const result = await orderService.createOrder(orderData);

            if (result.success && result.orderId && result.accessToken) {
                const orderUrl = `/order/${result.orderId}?token=${result.accessToken}`;
                clearCart();

                showOrderNotification(
                    'Заказ оформлен!',
                    `Номер заказа: <strong>#${result.orderNumber || result.orderId}</strong><br><br>
                     Мы свяжемся с вами для подтверждения в течение 30 минут.<br>
                     Сумма заказа: <strong>${formatPrice(totalPrice)}</strong><br><br>
                     <a href="${orderUrl}" style="color: var(--accent-brown); text-decoration: underline;">
                         Ссылка для отслеживания заказа
                     </a>`
                ).then(() => {
                    setIsSubmitting(false);
                    setOrderComplete(true);
                    navigate(orderUrl);
                });
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
            <div
                className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{ fontSize: '3rem', opacity: 0.1 }}>📦</div>
                    <h2 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Корзина пуста
                    </h2>
                    <p className="text-muted mb-4 small">Добавьте товары для оформления заказа</p>
                    <Link
                        to="/"
                        className="btn-fs btn-fs-outline btn-fs-lg"
                        style={{ minWidth: '250px' }}
                    >
                        ВЕРНУТЬСЯ К ПОКУПКАМ
                    </Link>
                </div>
            </div>
        );
    }

    const canGoToStep2 = () => {
        const hasBasicInfo = customerData.name.trim() !== '' &&
            customerData.email.trim() !== '' &&
            customerData.phone.trim() !== '';

        // Для Яндекс.Доставки проверяем, выбран ли ПВЗ
        if (deliveryMethod === 'yandex') {
            return hasBasicInfo && yandexDeliveryData !== null;
        }

        // Для курьера и почты проверяем адрес
        if (deliveryMethod === 'courier' || deliveryMethod === 'post') {
            return hasBasicInfo && customerData.address.trim() !== '';
        }

        // Для самовывоза и маркетплейсов достаточно базовых данных
        return hasBasicInfo;
    };

    return (
        <div className="container-fluid px-0">
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
                <div className="col-lg-8 px-4 px-md-5 pb-5">
                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="mb-5">
                                {/* ПЕРВЫМ ДЕЛОМ - ВЫБОР ДОСТАВКИ */}
                                <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Способ доставки
                                </h3>

                                <div className="row g-3 mb-5">
                                    {/* Курьерская доставка */}
                                    <div className="col-md-6">
                                        <div
                                            className={`delivery-option ${deliveryMethod === 'courier' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setDeliveryMethod('courier');
                                                setYandexDeliveryData(null);
                                            }}
                                        >
                                            <div className="delivery-icon">
                                                <Truck size={24} />
                                            </div>
                                            <div className="delivery-content">
                                                <h4 className="h6 mb-1">Курьерская доставка</h4>
                                                <p className="small text-muted mb-1">1-3 рабочих дня</p>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <span className="badge bg-success">Бесплатно</span>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="delivery"
                                                            checked={deliveryMethod === 'courier'}
                                                            onChange={() => {
                                                                setDeliveryMethod('courier');
                                                                setYandexDeliveryData(null);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Почта России */}
                                    <div className="col-md-6">
                                        <div
                                            className={`delivery-option ${deliveryMethod === 'post' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setDeliveryMethod('post');
                                                setYandexDeliveryData(null);
                                            }}
                                        >
                                            <div className="delivery-icon">
                                                <Package size={24} />
                                            </div>
                                            <div className="delivery-content">
                                                <h4 className="h6 mb-1">Почта России</h4>
                                                <p className="small text-muted mb-1">5-14 рабочих дней</p>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <span className="badge bg-secondary">от 350 ₽</span>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="delivery"
                                                            checked={deliveryMethod === 'post'}
                                                            onChange={() => {
                                                                setDeliveryMethod('post');
                                                                setYandexDeliveryData(null);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Самовывоз */}
                                    <div className="col-md-6">
                                        <div
                                            className={`delivery-option ${deliveryMethod === 'pickup' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setDeliveryMethod('pickup');
                                                setYandexDeliveryData(null);
                                            }}
                                        >
                                            <div className="delivery-icon">
                                                <Store size={24} />
                                            </div>
                                            <div className="delivery-content">
                                                <h4 className="h6 mb-1">Самовывоз</h4>
                                                <p className="small text-muted mb-1">Москва, ул. Тверская, 15</p>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <span className="badge bg-success">Бесплатно</span>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="delivery"
                                                            checked={deliveryMethod === 'pickup'}
                                                            onChange={() => {
                                                                setDeliveryMethod('pickup');
                                                                setYandexDeliveryData(null);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Маркетплейсы */}
                                    <div className="col-md-6">
                                        <div
                                            className={`delivery-option ${deliveryMethod === 'marketplace' ? 'selected' : ''}`}
                                            onClick={() => {
                                                setDeliveryMethod('marketplace');
                                                setYandexDeliveryData(null);
                                            }}
                                        >
                                            <div className="delivery-icon">
                                                <ShoppingBag size={24} />
                                            </div>
                                            <div className="delivery-content">
                                                <h4 className="h6 mb-1">Маркетплейсы</h4>
                                                <p className="small text-muted mb-1">Wildberries, OZON,
                                                    Яндекс.Маркет</p>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <span className="badge bg-secondary">от 100 ₽</span>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="delivery"
                                                            checked={deliveryMethod === 'marketplace'}
                                                            onChange={() => {
                                                                setDeliveryMethod('marketplace');
                                                                setYandexDeliveryData(null);
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Яндекс.Доставка */}
                                    <div className="col-md-6">
                                        <div
                                            className={`delivery-option ${deliveryMethod === 'yandex' ? 'selected' : ''}`}
                                            onClick={() => setDeliveryMethod('yandex')}
                                        >
                                            <div className="delivery-icon">
                                                <MapPin size={24} />
                                            </div>
                                            <div className="delivery-content">
                                                <h4 className="h6 mb-1">Яндекс.Доставка</h4>
                                                <p className="small text-muted mb-1">Пункты выдачи по всей России</p>
                                                <div className="d-flex justify-content-between align-items-center mt-2">
                                                    <span className="badge bg-warning text-dark">от 150 ₽</span>
                                                    <div className="form-check">
                                                        <input
                                                            className="form-check-input"
                                                            type="radio"
                                                            name="delivery"
                                                            checked={deliveryMethod === 'yandex'}
                                                            onChange={() => setDeliveryMethod('yandex')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Блок выбора ПВЗ для Яндекс.Доставки */}
                                {deliveryMethod === 'yandex' && (
                                    <div className="mb-5">
                                        <h4 className="h6 fw-light mb-3" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                            Выберите пункт выдачи
                                        </h4>

                                        {/* ДОБАВЬ ЭТОТ БЛОК ДЛЯ ОШИБОК */}
                                        {widgetError && (
                                            <div className="alert alert-danger mb-3" style={{ borderRadius: '8px' }}>
                                                <div className="d-flex align-items-center">
                                                    <span className="me-2">⚠️</span>
                                                    <div>
                                                        <strong>Ошибка загрузки карты:</strong><br />
                                                        <span className="small">{widgetError}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {yandexDeliveryData && (
                                            <div className="alert alert-warning mb-3" style={{ borderRadius: '8px' }}>
                                                <div className="d-flex align-items-center">
                                                    <MapPin size={20} className="me-2" />
                                                    <div>
                                                        <strong>Выбран пункт выдачи:</strong><br />
                                                        <span className="small">{yandexDeliveryData.address.full_address}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            id="delivery-widget"
                                            ref={widgetContainerRef}
                                            className="delivery-widget-container"
                                            style={{
                                                minHeight: '450px',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                        />

                                        <small className="text-muted mt-2 d-block">
                                            ⓘ Выберите пункт выдачи на карте и нажмите "Продолжить" в виджете
                                        </small>
                                    </div>
                                )}

                                {/* ПОТОМ - ДАННЫЕ КЛИЕНТА */}
                                <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Ваши данные
                                </h3>

                                <div className="mb-5">
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label small text-muted">Имя *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{ borderRadius: '8px' }}
                                                required
                                                value={customerData.name}
                                                onChange={(e) => handleCustomerDataChange('name', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label small text-muted">Email *</label>
                                            <input
                                                type="email"
                                                className="form-control"
                                                style={{ borderRadius: '8px' }}
                                                required
                                                value={customerData.email}
                                                onChange={(e) => handleCustomerDataChange('email', e.target.value)}
                                            />
                                        </div>
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label small text-muted">Телефон *</label>
                                            <input
                                                type="tel"
                                                className="form-control"
                                                style={{ borderRadius: '8px' }}
                                                required
                                                value={customerData.phone}
                                                onChange={(e) => handleCustomerDataChange('phone', e.target.value)}
                                                placeholder="+7 (999) 123-45-67"
                                            />
                                        </div>
                                    </div>

                                    {/* Адрес показывается только для курьера и почты */}
                                    {(deliveryMethod === 'courier' || deliveryMethod === 'post') && (
                                        <div className="row">
                                            <div className="col-12 mb-3">
                                                <label className="form-label small text-muted">Адрес доставки *</label>
                                                <input
                                                    type="text"
                                                    className="form-control"
                                                    style={{ borderRadius: '8px' }}
                                                    required={deliveryMethod === 'courier' || deliveryMethod === 'post'}
                                                    value={customerData.address}
                                                    onChange={(e) => handleCustomerDataChange('address', e.target.value)}
                                                    placeholder="Город, улица, дом, квартира, индекс"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="mb-4">
                                    <label className="form-label small text-muted">Комментарий к заказу</label>
                                    <textarea
                                        className="form-control"
                                        style={{ borderRadius: '8px' }}
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
                                        className="btn-fs btn-fs-outline btn-fs-lg"
                                        onClick={() => navigate('/cart')}
                                        style={{ minWidth: '150px' }}
                                    >
                                        ← НАЗАД
                                    </button>

                                    <button
                                        type="button"
                                        className="btn-fs btn-fs-primary btn-fs-lg"
                                        onClick={() => setStep(2)}
                                        disabled={!canGoToStep2()}
                                        style={{
                                            minWidth: '200px',
                                            opacity: canGoToStep2() ? 1 : 0.5
                                        }}
                                    >
                                        ДАЛЕЕ: ОПЛАТА
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="mb-5">
                                <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                    Способ оплаты
                                </h3>

                                <div className="row g-3 mb-5">
                                    {/* Карта онлайн */}
                                    <div className="col-md-6">
                                        <div
                                            className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <div className="payment-icon">
                                                <CreditCard size={24} />
                                            </div>
                                            <div className="payment-content">
                                                <h4 className="h6 mb-1">Картой онлайн</h4>
                                                <p className="small text-muted mb-2">Visa, Mastercard, МИР</p>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="payment"
                                                        checked={paymentMethod === 'card'}
                                                        onChange={() => setPaymentMethod('card')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Наличными */}
                                    <div className="col-md-6">
                                        <div
                                            className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                                            onClick={() => setPaymentMethod('cash')}
                                        >
                                            <div className="payment-icon">
                                                {/* ЗНАК РУБЛЯ ВМЕСТО ДОЛЛАРА */}
                                                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>₽</span>
                                            </div>
                                            <div className="payment-content">
                                                <h4 className="h6 mb-1">Наличными</h4>
                                                <p className="small text-muted mb-2">При получении заказа</p>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="payment"
                                                        checked={paymentMethod === 'cash'}
                                                        onChange={() => setPaymentMethod('cash')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* СБП */}
                                    <div className="col-md-6">
                                        <div
                                            className={`payment-option ${paymentMethod === 'sbp' ? 'selected' : ''}`}
                                            onClick={() => setPaymentMethod('sbp')}
                                        >
                                            <div className="payment-icon">
                                                <QrCode size={24} />
                                            </div>
                                            <div className="payment-content">
                                                <h4 className="h6 mb-1">СБП</h4>
                                                <p className="small text-muted mb-2">Система быстрых платежей</p>
                                                <div className="form-check">
                                                    <input
                                                        className="form-check-input"
                                                        type="radio"
                                                        name="payment"
                                                        checked={paymentMethod === 'sbp'}
                                                        onChange={() => setPaymentMethod('sbp')}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-top">
                                    {/* НАША НОВАЯ ГАЛОЧКА - ВАРИАНТ 2 */}
                                    <div className="custom-agreement mb-4">
                                        <div className="custom-agreement-checkbox">
                                            <input type="checkbox" id="agree" required />
                                        </div>
                                        <label htmlFor="agree" className="custom-agreement-text">
                                            Я соглашаюсь с условиями обработки персональных данных и правилами возврата
                                        </label>
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <button
                                            type="button"
                                            className="btn-fs btn-fs-outline btn-fs-lg"
                                            onClick={() => setStep(1)}
                                            style={{ minWidth: '150px' }}
                                        >
                                            ← НАЗАД
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-fs btn-fs-primary btn-fs-lg"
                                            disabled={isSubmitting}
                                            style={{ minWidth: '200px' }}
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

                <div className="col-lg-4 bg-light px-4 px-md-5 py-5" style={{ backgroundColor: 'var(--cream-light)' }}>
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Ваш заказ
                        </h3>

                        {/* ВСЕ ТОВАРЫ СРАЗУ БЕЗ ОГРАНИЧЕНИЙ */}
                        <div className="mb-4" style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
                            {items.map(item => (
                                <div key={item.variantId} className="d-flex mb-3 pb-3 border-bottom">
                                    <div
                                        className="flex-shrink-0 me-3"
                                        style={{
                                            width: '60px',
                                            height: '60px',
                                            backgroundImage: `url(${item.product.imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            borderRadius: '6px'
                                        }}
                                    ></div>
                                    <div className="flex-grow-1">
                                        <p className="small mb-1">{item.product.name}</p>

                                        <div className="mb-1">
                                            <span className="badge me-1 rounded-pill px-2 py-1"
                                                  style={{
                                                      fontSize: '0.65rem',
                                                      backgroundColor: 'rgba(138, 122, 99, 0.15)',
                                                      color: 'var(--accent-brown)',
                                                      border: '1px solid rgba(138, 122, 99, 0.3)'
                                                  }}>
                                                Размер: {item.selectedVariant.size}
                                            </span>

                                            {item.selectedVariant.color && (
                                                <span className="badge rounded-pill px-2 py-1"
                                                      style={{
                                                          fontSize: '0.65rem',
                                                          backgroundColor: 'rgba(138, 122, 99, 0.15)',
                                                          color: 'var(--accent-brown)',
                                                          border: '1px solid rgba(138, 122, 99, 0.3)'
                                                      }}>
                                                    Цвет: {item.selectedVariant.color}
                                                </span>
                                            )}
                                        </div>

                                        <div className="d-flex justify-content-between">
                                            <span className="small text-muted">{item.quantity} шт.</span>
                                            <span
                                                className="small">{formatPrice(item.product.price * item.quantity)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-top pt-3">
                            <div className="d-flex justify-content-between mt-3">
                                <strong className="fw-normal fs-5">Итого к оплате</strong>
                                <strong className="fs-5" style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    color: 'var(--accent-brown)'
                                }}>
                                    {formatPrice(totalPrice)}
                                </strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;