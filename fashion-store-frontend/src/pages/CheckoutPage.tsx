import {useState} from 'react';
import {useCart} from '../context/CartContext';
import {Link, useNavigate} from 'react-router-dom';
import {orderService} from '../services/orderService';
import {showCartNotification, showOrderNotification} from '../utils/swalConfig';
import {Truck, Package, Store, ShoppingBag, CreditCard, QrCode} from 'lucide-react';

const CheckoutPage = () => {
    const {items, totalPrice, clearCart} = useCart();
    const navigate = useNavigate();

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

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const handleCustomerDataChange = (field: string, value: string) => {
        setCustomerData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const orderData = {
                customerName: customerData.name,
                customerEmail: customerData.email,
                customerPhone: customerData.phone,
                deliveryAddress: deliveryMethod === 'pickup'
                    ? "Москва, ул. Тверская, 15 (самовывоз)"
                    : deliveryMethod === 'marketplace'
                        ? "Доставка через маркетплейсы"
                        : customerData.address,
                deliveryMethod,
                paymentMethod,
                comment,
                items,
                total: totalPrice
            };

            const result = await orderService.createOrder(orderData);

// В CheckoutPage.tsx исправить showOrderNotification
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

    const canGoToStep2 = () => {
        const hasBasicInfo = customerData.name.trim() !== '' &&
            customerData.email.trim() !== '' &&
            customerData.phone.trim() !== '';

        if (deliveryMethod === 'courier' || deliveryMethod === 'post') {
            return hasBasicInfo && customerData.address.trim() !== '';
        }

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
                                <h3 className="h5 fw-light mb-4" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                    Способ доставки
                                </h3>

                                <div className="row g-3 mb-5">
                                    {/* Курьерская доставка */}
                                    <div className="col-md-6">
                                        <div
                                            className={`delivery-option ${deliveryMethod === 'courier' ? 'selected' : ''}`}
                                            onClick={() => setDeliveryMethod('courier')}
                                        >
                                            <div className="delivery-icon">
                                                <Truck size={24}/>
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
                                                            onChange={() => setDeliveryMethod('courier')}
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
                                            onClick={() => setDeliveryMethod('post')}
                                        >
                                            <div className="delivery-icon">
                                                <Package size={24}/>
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
                                                            onChange={() => setDeliveryMethod('post')}
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
                                            onClick={() => setDeliveryMethod('pickup')}
                                        >
                                            <div className="delivery-icon">
                                                <Store size={24}/>
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
                                                            onChange={() => setDeliveryMethod('pickup')}
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
                                            onClick={() => setDeliveryMethod('marketplace')}
                                        >
                                            <div className="delivery-icon">
                                                <ShoppingBag size={24}/>
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
                                                            onChange={() => setDeliveryMethod('marketplace')}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* ПОТОМ - ДАННЫЕ КЛИЕНТА */}
                                <h3 className="h5 fw-light mb-4" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                    Ваши данные
                                </h3>

                                <div className="mb-5">
                                    <div className="row">
                                        <div className="col-md-4 mb-3">
                                            <label className="form-label small text-muted">Имя *</label>
                                            <input
                                                type="text"
                                                className="form-control"
                                                style={{borderRadius: '8px'}}
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
                                                style={{borderRadius: '8px'}}
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
                                                style={{borderRadius: '8px'}}
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
                                                    style={{borderRadius: '8px'}}
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
                                        style={{borderRadius: '8px'}}
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

                                <div className="row g-3 mb-5">
                                    {/* Карта онлайн */}
                                    <div className="col-md-6">
                                        <div
                                            className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                                            onClick={() => setPaymentMethod('card')}
                                        >
                                            <div className="payment-icon">
                                                <CreditCard size={24}/>
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
                                                <span style={{fontSize: '24px', fontWeight: 'bold'}}>₽</span>
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
                                                <QrCode size={24}/>
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
                                            <input type="checkbox" id="agree" required/>
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
                                            style={{minWidth: '150px'}}
                                        >
                                            ← НАЗАД
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn-fs btn-fs-primary btn-fs-lg"
                                            disabled={isSubmitting}
                                            style={{minWidth: '200px'}}
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

                <div className="col-lg-4 bg-light px-4 px-md-5 py-5" style={{backgroundColor: 'var(--cream-light)'}}>
                    <div className="sticky-top" style={{top: '2rem'}}>
                        <h3 className="h5 fw-light mb-4" style={{fontFamily: "'Playfair Display', serif"}}>
                            Ваш заказ
                        </h3>

                        {/* ВСЕ ТОВАРЫ СРАЗУ БЕЗ ОГРАНИЧЕНИЙ */}
                        <div className="mb-4" style={{maxHeight: '400px', overflowY: 'auto', paddingRight: '8px'}}>
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