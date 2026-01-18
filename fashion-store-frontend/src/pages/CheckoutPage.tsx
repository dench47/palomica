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

// Интерфейс для данных геокодера Яндекс
interface YandexGeocoderResponse {
    response: {
        GeoObjectCollection: {
            featureMember: Array<{
                GeoObject: {
                    metaDataProperty: {
                        GeocoderMetaData: {
                            Address: {
                                Components: Array<{
                                    kind: string;
                                    name: string;
                                }>;
                            };
                        };
                    };
                };
            }>;
        };
    };
}

// Интерфейс для компонента адреса
interface AddressComponent {
    kind: string;
    name: string;
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

    // Ref для контейнера виджета - создаем новый при каждом рендере Яндекс.Доставки
    const widgetContainerRef = useRef<HTMLDivElement>(null);
    const widgetInstanceRef = useRef<WidgetInstance>(null);

    // Флаги для управления состоянием
    const isScriptLoadedRef = useRef(false);
    const cleanupRef = useRef<(() => void) | null>(null);
    const isCityDetectedRef = useRef(false); // Флаг для предотвращения повторного определения города

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
    const [userCity, setUserCity] = useState<string>('Москва');
    const [isGeolocationLoading, setIsGeolocationLoading] = useState(false);
    const [widgetKey, setWidgetKey] = useState(0); // Ключ для принудительного ререндера виджета

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const handleCustomerDataChange = useCallback((field: string, value: string) => {
        setCustomerData(prev => ({
            ...prev,
            [field]: value
        }));
    }, []);

    // Функция для определения города пользователя по геолокации
    const detectUserCity = useCallback(async () => {
        // Если город уже определен, не делаем повторно
        if (isCityDetectedRef.current || isGeolocationLoading) return;

        setIsGeolocationLoading(true);

        try {
            if (!navigator.geolocation) {
                console.log('Геолокация не поддерживается браузером');
                isCityDetectedRef.current = true;
                return;
            }

            // Используем modern API геолокации
            const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 600000
                });
            });

            const { latitude, longitude } = position.coords;

            // Используем Yandex Geocoder API
            const apiKey = '7bc98a3f-0b9a-4170-b4de-8d09ba13d252';
            const response = await fetch(
                `https://geocode-maps.yandex.ru/1.x/?apikey=${apiKey}&format=json&geocode=${longitude},${latitude}`
            );

            if (response.ok) {
                const data: YandexGeocoderResponse = await response.json();
                const featureMember = data?.response?.GeoObjectCollection?.featureMember?.[0];
                const addressComponents = featureMember?.GeoObject?.metaDataProperty?.GeocoderMetaData?.Address?.Components;

                if (addressComponents) {
                    const cityComponent = addressComponents.find(
                        (component: AddressComponent) => component.kind === 'locality'
                    );

                    if (cityComponent?.name && cityComponent.name !== userCity) {
                        setUserCity(cityComponent.name);
                        console.log('Определен город пользователя:', cityComponent.name);
                    }
                }
            }
        } catch (error) {
            const geolocationError = error as GeolocationPositionError | Error;
            console.log('Пользователь не разрешил геолокацию или произошла ошибка:', geolocationError.message);
            // Оставляем Москву по умолчанию
        } finally {
            setIsGeolocationLoading(false);
            isCityDetectedRef.current = true;
        }
    }, [isGeolocationLoading, userCity]);

    // Функция для обработки выбора ПВЗ
    const handlePointSelected = useCallback((event: Event) => {
        const customEvent = event as CustomEvent<YandexDeliveryPoint>;
        const pointData = customEvent.detail;
        setYandexDeliveryData(pointData);
        console.log('Выбран ПВЗ:', pointData);
    }, []);

    // Функция очистки виджета
    const cleanupWidget = useCallback(() => {
        console.log('Очистка виджета');

        // Отписываемся от события
        document.removeEventListener('YaNddWidgetPointSelected', handlePointSelected);

        // Очищаем контейнер
        if (widgetContainerRef.current) {
            widgetContainerRef.current.innerHTML = '';
        }

        widgetInstanceRef.current = null;
        isScriptLoadedRef.current = false;
    }, [handlePointSelected]);

    // Инициализация виджета (вызывается только при изменении deliveryMethod или userCity)
    const initWidget = useCallback(async () => {
        if (deliveryMethod !== 'yandex' || !widgetContainerRef.current) {
            return;
        }

        console.log('Начало инициализации виджета для города:', userCity);

        // Сначала очищаем предыдущий виджет
        if (cleanupRef.current) {
            cleanupRef.current();
        }

        // Сохраняем функцию очистки
        cleanupRef.current = cleanupWidget;

        try {
            // Загружаем скрипт, если еще не загружен
            if (!isScriptLoadedRef.current) {
                if (!document.querySelector('script[src*="ndd-widget.landpro.site"]')) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://ndd-widget.landpro.site/widget.js';
                        script.async = true;

                        script.onload = () => {
                            console.log('Скрипт Яндекс.Доставки загружен');
                            isScriptLoadedRef.current = true;
                            setTimeout(resolve, 500); // Даем время на инициализацию
                        };

                        script.onerror = () => {
                            console.error('Ошибка загрузки скрипта Яндекс.Доставки');
                            reject(new Error('Не удалось загрузить скрипт Яндекс.Доставки'));
                        };

                        document.head.appendChild(script);
                    });
                } else {
                    isScriptLoadedRef.current = true;
                    // Даем время на инициализацию уже загруженного скрипта
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }

            if (!window.YaDelivery) {
                throw new Error('Библиотека Яндекс.Доставки не загрузилась');
            }

            // Подписываемся на событие выбора ПВЗ
            document.addEventListener('YaNddWidgetPointSelected', handlePointSelected);

            // Очищаем контейнер
            if (widgetContainerRef.current) {
                widgetContainerRef.current.innerHTML = '';
            }

            console.log('Создание виджета для города:', userCity);

            // Создаем виджет
            widgetInstanceRef.current = window.YaDelivery.createWidget({
                containerId: 'delivery-widget',
                params: {
                    city: userCity,
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

            console.log('Виджет Яндекс.Доставки создан для города', userCity);
            setWidgetError(null);

        } catch (error) {
            console.error('Ошибка инициализации виджета:', error);
            setWidgetError('Не удалось загрузить карту пунктов выдачи. Пожалуйста, попробуйте позже.');
        }
    }, [userCity, deliveryMethod, cleanupWidget, handlePointSelected]);

    // Определяем город один раз при загрузке компонента
    useEffect(() => {
        detectUserCity();
    }, []); // Пустой массив зависимостей - выполняется только один раз

    // Управление виджетом при изменении метода доставки или города
    useEffect(() => {
        console.log('Изменение deliveryMethod или userCity:', { deliveryMethod, userCity });

        if (deliveryMethod === 'yandex') {
            // Используем setTimeout чтобы дать время на рендер контейнера
            const timer = setTimeout(() => {
                initWidget();
            }, 100);

            return () => {
                clearTimeout(timer);
                if (cleanupRef.current) {
                    cleanupRef.current();
                }
            };
        } else {
            // Если не Яндекс.Доставка, очищаем
            if (cleanupRef.current) {
                cleanupRef.current();
            }
            setYandexDeliveryData(null);
            setWidgetError(null);
        }
    }, [deliveryMethod, userCity, initWidget]);

    // Обновляем ключ виджета при изменении города для принудительного ререндера
    useEffect(() => {
        if (deliveryMethod === 'yandex') {
            setWidgetKey(prev => prev + 1);
        }
    }, [userCity, deliveryMethod]);

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

                                        {/* Информация о городе */}
                                        <div className="alert alert-info mb-3" style={{ borderRadius: '8px' }}>
                                            <div className="d-flex align-items-center">
                                                <span className="me-2">📍</span>
                                                <div>
                                                    <strong>Поиск пунктов выдачи в:</strong> {userCity}
                                                    <br />
                                                    <small className="text-muted">
                                                        {isGeolocationLoading
                                                            ? 'Определение вашего местоположения...'
                                                            : userCity === 'Москва'
                                                                ? 'Используется город по умолчанию.'
                                                                : 'Город определен автоматически по вашей геолокации.'}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Блок ошибок */}
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

                                        {/* Выбранный ПВЗ */}
                                        {yandexDeliveryData && !widgetError && (
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

                                        {/* Контейнер виджета */}
                                        <div
                                            id="delivery-widget"
                                            ref={widgetContainerRef}
                                            key={`widget-${widgetKey}`}
                                            className="delivery-widget-container"
                                            style={{
                                                minHeight: '450px',
                                                backgroundColor: '#f8f9fa'
                                            }}
                                        >
                                            {/* Показываем индикатор загрузки пока виджет не загружен и нет ошибок */}
                                            {!widgetError && (
                                                <div className="text-center py-5">
                                                    <div className="spinner-border text-warning" role="status">
                                                        <span className="visually-hidden">Загрузка карты...</span>
                                                    </div>
                                                    <p className="mt-3 text-muted small">Загрузка карты пунктов выдачи...</p>
                                                </div>
                                            )}
                                        </div>

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