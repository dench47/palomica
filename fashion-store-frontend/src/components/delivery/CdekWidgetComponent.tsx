import { useEffect, useRef, useState } from 'react';
import { Truck } from 'lucide-react';

// Интерфейсы для данных СДЭК
interface CdekTariff {
    tariff_code: number;
    tariff_name: string;
    delivery_sum: number;
    period_min: number;
    period_max: number;
}

interface CdekPoint {
    city_code?: number;
    city?: string;
    code?: string;
    name?: string;
    address?: string;
    formatted?: string;
    work_time?: string;
    location?: number[];
}

export interface CdekSelectedPoint {
    city_code: number;
    city: string;
    code: string;
    name: string;
    address: string;
    work_time: string;
    location: number[];
    tariff_code: number;
    tariff_name: string;
    delivery_sum: number;
    period_min: number;
    period_max: number;
    delivery_mode: string;
}

interface CdekWidgetComponentProps {
    apiKey: string;
    city: string;
    onPointSelected: (data: CdekSelectedPoint) => void;
    selectedPoint: CdekSelectedPoint | null;
}

// Интерфейс для глобального объекта CDEKWidget
interface CDEKWidgetGlobal {
    new (config: {
        from: string;
        root: string;
        apiKey: string;
        servicePath: string;
        defaultLocation: string;
        goods: Array<{
            weight: number;
            length: number;
            width: number;
            height: number;
        }>;
        canChoose: boolean;
        hideFilters: {
            have_cashless: boolean;
            have_cash: boolean;
            is_dressing_room: boolean;
            type: boolean;
        };
        hideDeliveryOptions: {
            door: boolean;
            office: boolean;
        };
        onReady: () => void;
        onChoose: (deliveryMode: string, tariff: CdekTariff, point: CdekPoint) => void;
    }): {
        close?: () => void;
    };
}

declare global {
    interface Window {
        CDEKWidget: CDEKWidgetGlobal;
    }
}

const CdekWidgetComponent = ({ apiKey, city, onPointSelected, selectedPoint }: CdekWidgetComponentProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const widgetInstanceRef = useRef<{ close?: () => void } | null>(null);
    const externalContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        let mounted = true;

        const initializeWidget = async () => {
            if (!apiKey || !city || !containerRef.current || !mounted) {
                return;
            }

            console.log('Инициализация компонента СДЭК для города:', city);
            setIsLoading(true);
            setError(null);

            try {
                // Загрузка скрипта
                if (!document.getElementById('cdek-widget-script')) {
                    await new Promise<void>((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/@cdek-it/widget@3';
                        script.charset = 'utf-8';
                        script.id = 'cdek-widget-script';
                        script.async = true;

                        script.onload = () => resolve();
                        script.onerror = () => reject(new Error('Не удалось загрузить скрипт СДЭК'));

                        document.head.appendChild(script);
                    });
                } else {
                    await new Promise(resolve => setTimeout(resolve, 100));
                }

                if (!window.CDEKWidget) {
                    throw new Error('Библиотека СДЭК не загрузилась');
                }

                // Создаем внешний контейнер
                const externalContainer = document.createElement('div');
                externalContainer.id = `cdek-widget-container-${Date.now()}`;
                externalContainer.style.width = '100%';
                externalContainer.style.height = '600px';
                externalContainer.style.borderRadius = '8px';
                externalContainer.style.overflow = 'hidden';

                externalContainerRef.current = externalContainer;

                // Добавляем контейнер в DOM React
                if (containerRef.current && mounted) {
                    containerRef.current.appendChild(externalContainer);
                }

                // Создаем виджет
                widgetInstanceRef.current = new window.CDEKWidget({
                    from: city,
                    root: externalContainer.id,
                    apiKey: apiKey,
                    servicePath: 'https://palomika.ru/service.php',
                    defaultLocation: city,
                    goods: [{
                        weight: 2000,
                        length: 30,
                        width: 20,
                        height: 10
                    }],
                    canChoose: true,
                    hideFilters: {
                        have_cashless: false,
                        have_cash: false,
                        is_dressing_room: false,
                        type: false
                    },
                    hideDeliveryOptions: {
                        door: false,
                        office: false
                    },
                    onReady: () => {
                        console.log('Виджет СДЭК загружен');
                        if (mounted) {
                            setIsLoading(false);
                        }
                    },
                    onChoose: (deliveryMode: string, tariff: CdekTariff, point: CdekPoint) => {
                        console.log('Выбран ПВЗ СДЭК:', { deliveryMode, tariff, point });

                        const selectedPoint: CdekSelectedPoint = {
                            city_code: point.city_code || 0,
                            city: point.city || 'Не указан',
                            code: point.code || '',
                            name: point.name || point.address || 'Не указано',
                            address: point.address || point.formatted || 'Не указан',
                            work_time: point.work_time || '',
                            location: point.location || [0, 0],
                            tariff_code: tariff.tariff_code,
                            tariff_name: tariff.tariff_name,
                            delivery_sum: tariff.delivery_sum,
                            period_min: tariff.period_min,
                            period_max: tariff.period_max,
                            delivery_mode: deliveryMode
                        };

                        onPointSelected(selectedPoint);
                    }
                });

                console.log('Виджет СДЭК создан');

            } catch (err) {
                console.error('Ошибка инициализации виджета СДЭК:', err);
                const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка';
                if (mounted) {
                    setError(errorMessage);
                    setIsLoading(false);
                }
            }
        };

        // Запускаем инициализацию с задержкой
        const timer = setTimeout(() => {
            if (mounted) {
                initializeWidget();
            }
        }, 300);

        return () => {
            mounted = false;
            clearTimeout(timer);

            console.log('Очистка компонента СДЭК');

            // Удаляем внешний контейнер
            if (externalContainerRef.current && externalContainerRef.current.parentNode) {
                externalContainerRef.current.parentNode.removeChild(externalContainerRef.current);
            }
            externalContainerRef.current = null;

            // Не вызываем close() - виджет СДЭК сам очищается при удалении DOM
            widgetInstanceRef.current = null;
        };
    }, [apiKey, city, onPointSelected]);

    return (
        <div>
            {selectedPoint && (
                <div className="alert alert-warning mb-3" style={{ borderRadius: '8px' }}>
                    <div className="d-flex align-items-center">
                        <Truck size={20} className="me-2" />
                        <div>
                            <strong>Выбран пункт выдачи СДЭК:</strong><br />
                            <span className="small">{selectedPoint.address}</span>
                            <br />
                            <small className="text-muted">
                                Стоимость: {selectedPoint.delivery_sum} ₽ •
                                Срок: {selectedPoint.period_min}-{selectedPoint.period_max} дн.
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger mb-3" style={{ borderRadius: '8px' }}>
                    <div className="d-flex align-items-center">
                        <span className="me-2">⚠️</span>
                        <div>
                            <strong>Ошибка загрузки виджета СДЭК:</strong><br />
                            <span className="small">{error}</span>
                        </div>
                    </div>
                </div>
            )}

            <div
                ref={containerRef}
                style={{
                    width: '100%',
                    height: '600px',
                    backgroundColor: isLoading ? '#f8f9fa' : 'transparent',
                    position: 'relative',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}
            >
                {isLoading && !error && (
                    <div className="text-center py-5" style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#f8f9fa',
                        zIndex: 1
                    }}>
                        <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Загрузка виджета СДЭК...</span>
                        </div>
                        <p className="mt-3 text-muted small">Инициализация виджета СДЭК...</p>
                    </div>
                )}
            </div>

            <small className="text-muted mt-2 d-block">
                ⓘ Выберите пункт выдачи на карте и нажмите "Выбрать" в описании ПВЗ
            </small>
        </div>
    );
};

export default CdekWidgetComponent;