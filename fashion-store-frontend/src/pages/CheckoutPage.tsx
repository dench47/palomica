import {useState, useEffect, useCallback} from 'react';
import {useCart} from '../context/CartContext';
import {Link, useNavigate} from 'react-router-dom';
import {orderService} from '../services/orderService';
import {showCartNotification, showOrderNotification} from '../utils/swalConfig';
import {ErrorBoundary, type FallbackProps} from 'react-error-boundary';

// Импортируем компоненты
import DeliveryOptions from '../components/delivery/DeliveryOptions';
import CustomerForm from '../components/delivery/CustomerForm';
import YandexWidgetComponent from '../components/delivery/YandexWidgetComponent';
import CdekWidgetComponent from '../components/delivery/CdekWidgetComponent';

// Импортируем тип из CdekWidgetComponent
import type {CdekSelectedPoint} from '../components/delivery/CdekWidgetComponent';

// Интерфейсы
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

// Используем импортированный тип вместо своего
type CdekDeliveryPoint = CdekSelectedPoint;

// Fallback для ошибок CheckoutPage
const CheckoutErrorFallback = ({error, resetErrorBoundary}: FallbackProps) => {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

    return (
        <div className="container-fluid px-0">
            <div className="alert alert-danger m-4">
                <h4>Ошибка оформления заказа</h4>
                <p>{errorMessage}</p>
                <button className="btn btn-primary" onClick={resetErrorBoundary}>
                    Обновить страницу
                </button>
            </div>
        </div>
    );
};

const CheckoutPageContent = () => {
    const {items, totalPrice, clearCart} = useCart();
    const navigate = useNavigate();

    // Состояния
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderComplete, setOrderComplete] = useState(false);

    // По умолчанию НЕ ВЫБРАН способ доставки
    const [deliveryMethod, setDeliveryMethod] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [comment, setComment] = useState('');

    // Данные клиента
    const [customerData, setCustomerData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Данные доставки
    const [yandexDeliveryData, setYandexDeliveryData] = useState<YandexDeliveryPoint | null>(null);
    const [cdekDeliveryData, setCdekDeliveryData] = useState<CdekDeliveryPoint | null>(null);

    // API ключи
    const [yandexApiKey, setYandexApiKey] = useState<string>('');
    const [yandexStationId, setYandexStationId] = useState<string>('');
    const [userCity, setUserCity] = useState<string>('Москва');

    // Утилиты
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const handleCustomerDataChange = useCallback((field: string, value: string) => {
        setCustomerData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Загрузка конфигурации Яндекс
    const loadYandexConfig = useCallback(async () => {
        try {
            const response = await fetch('/api/public/config/yandex');
            if (!response.ok) throw new Error(`Failed to fetch Yandex config: ${response.status}`);
            const config = await response.json();
            setYandexApiKey(config.geocoderApiKey || config.mapsApiKey);
            setYandexStationId(config.widgetStationId || '');
            console.log('Yandex конфигурация загружена:', {
                apiKey: config.geocoderApiKey ? 'да' : 'нет',
                stationId: config.widgetStationId ? 'да' : 'нет'
            });
        } catch (error) {
            console.error('Ошибка загрузки конфигурации Яндекс:', error);
        }
    }, []);

    // Определение города
    const detectUserCity = useCallback(async () => {
        if (!yandexApiKey) return;

        try {
            if (!navigator.geolocation) {
                console.log('Геолокация не поддерживается браузером');
                return;
            }

            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 600000
                });
            });

            const {latitude, longitude} = position.coords;
            const response = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?apikey=${yandexApiKey}&format=json&geocode=${longitude},${latitude}`
            );

            if (response.ok) {
                const data = await response.json();
                const featureMember = data?.response?.GeoObjectCollection?.featureMember?.[0];
                const addressComponents = featureMember?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.Components;

                if (addressComponents) {
                    const cityComponent = addressComponents.find(
                        (component: { kind: string; name: string }) => component.kind === 'locality'
                    );

                    if (cityComponent?.name && cityComponent.name !== userCity) {
                        setUserCity(cityComponent.name);
                        console.log('Определен город пользователя:', cityComponent.name);
                    }
                }
            }
        } catch (error) {
            console.log('Не удалось определить город:', error);
        }
    }, [yandexApiKey, userCity]);

    // Эффекты
    useEffect(() => {
        loadYandexConfig();
    }, [loadYandexConfig]);

    useEffect(() => {
        if (yandexApiKey) {
            detectUserCity();
        }
    }, [yandexApiKey, detectUserCity]);

    // Обработчики
    const handleDeliveryMethodChange = (method: string) => {
        setDeliveryMethod(method);
        // Сбрасываем выбранные пункты доставки
        if (method !== 'yandex') setYandexDeliveryData(null);
        if (method !== 'cdek') setCdekDeliveryData(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Проверка выбора способа доставки
        if (!deliveryMethod) {
            showCartNotification(
                'Ошибка',
                'Пожалуйста, выберите способ доставки',
                'error'
            );
            return;
        }

        // Проверка ПВЗ для Яндекс
        if (deliveryMethod === 'yandex' && !yandexDeliveryData) {
            showCartNotification(
                'Ошибка',
                'Пожалуйста, выберите пункт выдачи Яндекс.Доставки',
                'error'
            );
            return;
        }

        // Проверка ПВЗ для СДЭК
        if (deliveryMethod === 'cdek' && !cdekDeliveryData) {
            showCartNotification(
                'Ошибка',
                'Пожалуйста, выберите пункт выдачи СДЭК',
                'error'
            );
            return;
        }

        setIsSubmitting(true);

        try {
            // Формирование адреса доставки
            let deliveryAddress = '';
            switch (deliveryMethod) {
                case 'pickup':
                    deliveryAddress = "Москва, ул. Тверская, 15 (самовывоз)";
                    break;
                case 'marketplace':
                    deliveryAddress = "Доставка через маркетплейсы";
                    break;
                case 'yandex':
                    deliveryAddress = yandexDeliveryData!.address.full_address;
                    break;
                case 'cdek':
                    deliveryAddress = cdekDeliveryData ? `СДЭК: ${cdekDeliveryData.address}` : 'СДЭК (адрес будет уточнен)';
                    break;
            }

            // Подготовка данных заказа
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
                // Данные Яндекс
                yandexDeliveryPointId: yandexDeliveryData?.id || null,
                yandexDeliveryAddress: yandexDeliveryData?.address.full_address || null,
                yandexDeliveryCity: yandexDeliveryData?.address.locality || null,
                yandexDeliveryStreet: yandexDeliveryData?.address.street || null,
                yandexDeliveryHouse: yandexDeliveryData?.address.house || null,
                yandexDeliveryComment: yandexDeliveryData?.address.comment || null,
                // Данные СДЭК
                cdekDeliveryPointCode: cdekDeliveryData?.code || null,
                cdekDeliveryPointAddress: cdekDeliveryData?.address || null,
                cdekDeliveryPointCity: cdekDeliveryData?.city || null,
                cdekDeliveryPointName: cdekDeliveryData?.name || null,
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

    // Проверка возможности перехода к шагу 2
    const canGoToStep2 = () => {
        const hasBasicInfo = customerData.name.trim() !== '' &&
            customerData.email.trim() !== '' &&
            customerData.phone.trim() !== '';

        const hasDeliveryMethod = deliveryMethod !== '';

        // Для Яндекс проверяем выбран ли ПВЗ
        if (deliveryMethod === 'yandex') {
            return hasBasicInfo && hasDeliveryMethod && yandexDeliveryData !== null;
        }

        // Для СДЭК проверяем выбран ли ПВЗ
        if (deliveryMethod === 'cdek') {
            return hasBasicInfo && hasDeliveryMethod && cdekDeliveryData !== null;
        }

        // Для pickup и marketplace достаточно базовых данных
        return hasBasicInfo && hasDeliveryMethod;
    };

    // Если корзина пуста
    if (items.length === 0 && !orderComplete) {
        return (
            <div
                className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{fontSize: '3rem', opacity: 0.1}}>📦</div>
                    <h2 className="fw-light mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                        Корзина пуста
                    </h2>
                    <p className="text-muted mb-4 small">Добавьте товары для оформления заказа</p>
                    <Link
                        to="/"
                        className="btn-fs btn-fs-outline btn-fs-lg"
                        style={{minWidth: '250px'}}
                    >
                        ВЕРНУТЬСЯ К ПОКУПКАМ
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
                                {/* ВЫБОР ДОСТАВКИ */}
                                <h3 className="h5 fw-light mb-4" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                    Способ доставки
                                </h3>

                                <DeliveryOptions
                                    deliveryMethod={deliveryMethod}
                                    onDeliveryMethodChange={handleDeliveryMethodChange}
                                />

                                {/* Виджет Яндекс */}
                                {deliveryMethod === 'yandex' && (
                                    <div className="mb-5">
                                        <h4 className="h6 fw-light mb-3"
                                            style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                            Выберите пункт выдачи Яндекс.Доставки
                                        </h4>

                                        {yandexStationId ? (
                                            <YandexWidgetComponent
                                                city={userCity}
                                                onPointSelected={setYandexDeliveryData}
                                                selectedPoint={yandexDeliveryData}
                                                stationId={yandexStationId}
                                            />
                                        ) : (
                                            <div className="alert alert-warning">
                                                <p className="mb-0">Конфигурация Яндекс.Доставки не загружена.</p>
                                                <p className="small mb-0 mt-1">Пожалуйста, обновите страницу или свяжитесь с администратором.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Виджет СДЭК */}
                                {deliveryMethod === 'cdek' && (
                                    <div className="mb-5">
                                        <h4 className="h6 fw-light mb-3"
                                            style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                            Выберите пункт выдачи СДЭК
                                        </h4>

                                        <CdekWidgetComponent
                                            apiKey={yandexApiKey}
                                            city={userCity}
                                            onPointSelected={setCdekDeliveryData}
                                            selectedPoint={cdekDeliveryData}
                                        />
                                    </div>
                                )}

                                {/* ФОРМА КЛИЕНТА */}
                                <CustomerForm
                                    customerData={customerData}
                                    onCustomerDataChange={handleCustomerDataChange}
                                    comment={comment}
                                    onCommentChange={setComment}
                                />

                                {/* КНОПКИ НАВИГАЦИИ */}
                                <div className="mt-5 d-flex justify-content-between">
                                    <button
                                        type="button"
                                        className="btn-fs btn-fs-outline btn-fs-lg"
                                        onClick={() => navigate('/cart')}
                                        style={{minWidth: '150px'}}
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
                                <h3 className="h5 fw-light mb-4" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                    Способ оплаты
                                </h3>

                                {/* Блок оплаты */}
                                <div className="row g-3 mb-5">
                                    <div className="col-md-6">
                                        <div className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                                             onClick={() => setPaymentMethod('card')}>
                                            <div className="payment-icon">💳</div>
                                            <div className="payment-content">
                                                <h4 className="h6 mb-1">Картой онлайн</h4>
                                                <p className="small text-muted mb-2">Visa, Mastercard, МИР</p>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="payment"
                                                           checked={paymentMethod === 'card'}
                                                           onChange={() => setPaymentMethod('card')}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <div className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                                             onClick={() => setPaymentMethod('cash')}>
                                            <div className="payment-icon">₽</div>
                                            <div className="payment-content">
                                                <h4 className="h6 mb-1">Наличными</h4>
                                                <p className="small text-muted mb-2">При получении заказа</p>
                                                <div className="form-check">
                                                    <input className="form-check-input" type="radio" name="payment"
                                                           checked={paymentMethod === 'cash'}
                                                           onChange={() => setPaymentMethod('cash')}/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5 pt-3 border-top">
                                    <div className="custom-agreement mb-4">
                                        <div className="custom-agreement-checkbox">
                                            <input type="checkbox" id="agree" required/>
                                        </div>
                                        <label htmlFor="agree" className="custom-agreement-text">
                                            Я соглашаюсь с условиями обработки персональных данных и правилами возврата
                                        </label>
                                    </div>

                                    <div className="d-flex justify-content-between">
                                        <button type="button" className="btn-fs btn-fs-outline btn-fs-lg"
                                                onClick={() => setStep(1)} style={{minWidth: '150px'}}>
                                            ← НАЗАД
                                        </button>
                                        <button type="submit" className="btn-fs btn-fs-primary btn-fs-lg"
                                                disabled={isSubmitting} style={{minWidth: '200px'}}>
                                            {isSubmitting ? (
                                                <>⏳ ОФОРМЛЯЕМ...</>
                                            ) : 'ПОДТВЕРДИТЬ ЗАКАЗ'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </form>
                </div>

                {/* Боковая панель с заказом */}
                <div className="col-lg-4 bg-light px-4 px-md-5 py-5" style={{backgroundColor: 'var(--cream-light)'}}>
                    <div className="sticky-top" style={{top: '2rem'}}>
                        <h3 className="h5 fw-light mb-4" style={{fontFamily: "'Playfair Display', serif"}}>
                            Ваш заказ
                        </h3>

                        <div className="mb-4" style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '8px'}}>
                            {items.map(item => (
                                <div key={item.variantId} className="d-flex mb-3 pb-3 border-bottom">
                                    <div className="product-image me-3" style={{
                                        width: '60px', height: '60px',
                                        backgroundImage: `url(${item.product.imageUrl})`,
                                        backgroundSize: 'cover', backgroundPosition: 'center',
                                        borderRadius: '6px'
                                    }}></div>
                                    <div className="flex-grow-1">
                                        <p className="small mb-1">{item.product.name}</p>
                                        <div className="mb-1">
                                            <span
                                                className="badge me-1 small">Размер: {item.selectedVariant.size}</span>
                                            {item.selectedVariant.color && (
                                                <span className="badge small">Цвет: {item.selectedVariant.color}</span>
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

// Основной компонент CheckoutPage с Error Boundary
const CheckoutPage = () => {
    return (
        <ErrorBoundary
            FallbackComponent={CheckoutErrorFallback}
            onReset={() => window.location.reload()}
        >
            <CheckoutPageContent/>
        </ErrorBoundary>
    );
};

export default CheckoutPage;