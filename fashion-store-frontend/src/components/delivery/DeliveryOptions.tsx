import { Store, ShoppingBag, MapPin, Truck } from 'lucide-react';

interface DeliveryOptionsProps {
    deliveryMethod: string;
    onDeliveryMethodChange: (method: string) => void;
}

const DeliveryOptions = ({ deliveryMethod, onDeliveryMethodChange }: DeliveryOptionsProps) => {
    const options = [
        {
            id: 'pickup',
            title: 'Самовывоз',
            description: 'Москва, ул. Тверская, 15',
            icon: <Store size={24} />,
            badge: { text: 'Бесплатно', color: 'bg-success' }
        },
        {
            id: 'marketplace',
            title: 'Маркетплейсы',
            description: 'Wildberries, OZON, Яндекс.Маркет',
            icon: <ShoppingBag size={24} />,
            badge: { text: 'от 100 ₽', color: 'bg-secondary' }
        },
        {
            id: 'yandex',
            title: 'Яндекс.Доставка',
            description: 'Пункты выдачи по всей России',
            icon: <MapPin size={24} />,
            badge: { text: 'от 150 ₽', color: 'bg-warning text-dark' }
        },
        {
            id: 'cdek',
            title: 'СДЭК',
            description: 'Пункты выдачи и до двери',
            icon: <Truck size={24} />,
            badge: { text: 'Рассчитать', color: 'bg-info text-dark' }
        }
    ];

    return (
        <div className="row g-3 mb-5">
            {options.map((option) => (
                <div className="col-md-6" key={option.id}>
                    <div
                        className={`delivery-option ${deliveryMethod === option.id ? 'selected' : ''}`}
                        onClick={() => onDeliveryMethodChange(option.id)}
                    >
                        <div className="delivery-icon">
                            {option.icon}
                        </div>
                        <div className="delivery-content">
                            <h4 className="h6 mb-1">{option.title}</h4>
                            <p className="small text-muted mb-1">{option.description}</p>
                            <div className="d-flex justify-content-between align-items-center mt-2">
                                <span className={`badge ${option.badge.color}`}>{option.badge.text}</span>
                                <div className="form-check">
                                    <input
                                        className="form-check-input"
                                        type="radio"
                                        name="delivery"
                                        checked={deliveryMethod === option.id}
                                        onChange={() => onDeliveryMethodChange(option.id)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default DeliveryOptions;