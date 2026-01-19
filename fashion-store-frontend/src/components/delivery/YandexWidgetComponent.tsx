import { useEffect, useRef, useState, useCallback } from 'react';
import { MapPin } from 'lucide-react';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';

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

interface YandexWidgetComponentProps {
    city: string;
    onPointSelected: (point: YandexDeliveryPoint) => void;
    selectedPoint: YandexDeliveryPoint | null;
}

// Интерфейс для глобального объекта YaDelivery
interface YaDeliveryGlobal {
    createWidget: (config: {
        containerId: string;
        params: {
            city: string;
            size: { height: string; width: string };
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
    }) => unknown;
}

declare global {
    interface Window {
        YaDelivery: YaDeliveryGlobal;
    }
}

// Fallback компонент для ошибок
const YandexWidgetErrorFallback = ({ error, resetErrorBoundary }: FallbackProps) => {
    const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';

    return (
        <div className="alert alert-danger">
            <h5>Ошибка загрузки карты Яндекс</h5>
            <p>{errorMessage}</p>
            <button className="btn btn-sm btn-primary" onClick={resetErrorBoundary}>
                Повторить попытку
            </button>
        </div>
    );
};

// Основной компонент виджета
const YandexWidgetContent = ({ city, onPointSelected, selectedPoint }: YandexWidgetComponentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [widgetError, setWidgetError] = useState<string | null>(null);
    const [initialized, setInitialized] = useState(false);
    const externalContainerRef = useRef<HTMLDivElement | null>(null);

    const handlePointSelected = useCallback((event: Event) => {
        const customEvent = event as CustomEvent<YandexDeliveryPoint>;
        onPointSelected(customEvent.detail);
    }, [onPointSelected]);

    useEffect(() => {
        let mounted = true;

        const initWidget = async () => {
            if (!mounted || !containerRef.current) return;

            console.log('Инициализация виджета Яндекс для города:', city);
            setIsLoading(true);
            setWidgetError(null);

            try {
                // Загрузка скрипта
                if (!document.querySelector('script[src*="ndd-widget.landpro.site"]')) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://ndd-widget.landpro.site/widget.js';
                        script.async = true;

                        script.onload = () => {
                            console.log('Скрипт Яндекс.Доставки загружен');
                            setTimeout(resolve, 500);
                        };

                        script.onerror = () => {
                            reject(new Error('Не удалось загрузить скрипт Яндекс.Доставки'));
                        };

                        document.head.appendChild(script);
                    });
                } else {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                if (!window.YaDelivery) {
                    throw new Error('Библиотека Яндекс.Доставки не загрузилась');
                }

                // Добавляем обработчик событий
                document.addEventListener('YaNddWidgetPointSelected', handlePointSelected);

                // Создаем и добавляем контейнер
                const externalContainer = document.createElement('div');
                externalContainer.id = `yandex-widget-${Date.now()}`;
                externalContainer.style.width = '100%';
                externalContainer.style.height = '450px';
                externalContainer.style.borderRadius = '8px';
                externalContainer.style.overflow = 'hidden';

                externalContainerRef.current = externalContainer;
                containerRef.current.appendChild(externalContainer);

                // Создаем виджет
                window.YaDelivery.createWidget({
                    containerId: externalContainer.id,
                    params: {
                        city: city,
                        size: {
                            height: "450px",
                            width: "100%"
                        },
                        source_platform_station: "05e809bb-4521-42d9-a936-0fb0744c0fb3",
                        physical_dims_weight_gross: 10000,
                        delivery_price: (price: number) => price + " руб",
                        delivery_term: 3,
                        show_select_button: true,
                        filter: {
                            type: ["pickup_point", "terminal"],
                            is_yandex_branded: false,
                            payment_methods: ["already_paid", "card_on_receipt"],
                            payment_methods_filter: "or"
                        }
                    },
                });

                console.log('Виджет Яндекс.Доставки создан для города', city);
                setInitialized(true);
                setIsLoading(false);

            } catch (err) {
                console.error('Ошибка инициализации виджета Яндекс:', err);
                const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
                setWidgetError(`Не удалось загрузить карту пунктов выдачи Яндекс: ${errorMessage}`);
                setIsLoading(false);
            }
        };

        // Запускаем инициализацию с задержкой
        const timer = setTimeout(() => {
            if (mounted) {
                initWidget();
            }
        }, 300);

        return () => {
            mounted = false;
            clearTimeout(timer);

            console.log('Очистка виджета Яндекс');

            // Удаляем обработчик событий
            document.removeEventListener('YaNddWidgetPointSelected', handlePointSelected);

            // Удаляем внешний контейнер
            if (externalContainerRef.current && externalContainerRef.current.parentNode) {
                externalContainerRef.current.parentNode.removeChild(externalContainerRef.current);
            }
            externalContainerRef.current = null;

            setInitialized(false);
        };
    }, [city, handlePointSelected]);

    return (
        <div>
            {selectedPoint && (
                <div className="alert alert-warning mb-3" style={{ borderRadius: '8px' }}>
                    <div className="d-flex align-items-center">
                        <MapPin size={20} className="me-2" />
                        <div>
                            <strong>Выбран пункт выдачи Яндекс.Доставки:</strong><br />
                            <span className="small">{selectedPoint.address.full_address}</span>
                        </div>
                    </div>
                </div>
            )}

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

            <div
                ref={containerRef}
                style={{
                    minHeight: '450px',
                    backgroundColor: isLoading && !initialized ? '#f8f9fa' : 'transparent',
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
            >
                {isLoading && !initialized && (
                    <div className="text-center py-5" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#f8f9fa',
                        zIndex: 1
                    }}>
                        <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Загрузка карты...</span>
                        </div>
                        <p className="mt-3 text-muted small">Загрузка карты пунктов выдачи Яндекс...</p>
                    </div>
                )}
            </div>

            <small className="text-muted mt-2 d-block">
                ⓘ Выберите пункт выдачи на карте и нажмите "Продолжить" в виджете
            </small>
        </div>
    );
};

// Основной компонент с Error Boundary
const YandexWidgetComponent = (props: YandexWidgetComponentProps) => {
    return (
        <ErrorBoundary
            FallbackComponent={YandexWidgetErrorFallback}
            onReset={() => window.location.reload()}
        >
            <YandexWidgetContent {...props} />
        </ErrorBoundary>
    );
};

export default YandexWidgetComponent;