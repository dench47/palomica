import {useCart} from '../context/CartContext';
import {Link, useNavigate} from 'react-router-dom';

const CartPage = () => {
    const {items, removeFromCart, totalPrice, clearCart} = useCart();
    const navigate = useNavigate();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const handleClearCart = () => {
        clearCart();
    };

    const handleRemoveItem = (variantId: string) => {
        removeFromCart(variantId);
    };

    const handleCheckout = () => {
        navigate('/checkout');
    };

    if (items.length === 0) {
        return (
            <div
                className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{fontSize: '3rem', opacity: 0.1}}>🛒</div>
                    <h2 className="fw-light mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                        Корзина пуста
                    </h2>
                    <p className="text-muted mb-4 small">Добавьте товары из каталога</p>
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
                <h1 className="fw-light text-center mb-5" style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.5rem',
                    letterSpacing: '0.05em'
                }}>
                    Корзина покупок
                </h1>
            </div>

            <div className="row g-0">
                <div className="col-lg-8 px-4 px-md-5 pb-5">
                    {items.map(item => (
                        <div key={item.variantId} className="mb-4 pb-4 border-bottom">
                            <div className="row g-0">
                                <div className="col-4 col-md-3">
                                    <div
                                        className="w-100 hover-lift"
                                        style={{
                                            backgroundImage: `url(${item.product.imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            paddingBottom: '100%',
                                            cursor: 'pointer',
                                            borderRadius: '8px'
                                        }}
                                        onClick={() => navigate(`/product/${item.product.id}`)}
                                    ></div>
                                </div>

                                <div className="col-8 col-md-9 ps-4 ps-md-5">
                                    <div className="d-flex flex-column h-100">
                                        <div className="flex-grow-1">
                                            <h3 className="h5 fw-light mb-2"
                                                style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                                {item.product.name}
                                            </h3>

                                            <div className="mb-2">
                                                <span
                                                    className="badge me-2 rounded-pill px-3 py-1"
                                                    style={{
                                                        fontSize: '0.8rem',
                                                        fontWeight: '500',
                                                        backgroundColor: 'rgba(138, 122, 99, 0.15)',
                                                        color: 'var(--accent-brown)',
                                                        border: '1px solid rgba(138, 122, 99, 0.3)'
                                                    }}>
                                                    Размер: {item.selectedVariant.size}
                                                </span>

                                                {item.selectedVariant.color && (
                                                    <span className="badge rounded-pill px-3 py-1"
                                                          style={{
                                                              fontSize: '0.8rem',
                                                              fontWeight: '500',
                                                              backgroundColor: 'rgba(138, 122, 99, 0.15)',
                                                              color: 'var(--accent-brown)',
                                                              border: '1px solid rgba(138, 122, 99, 0.3)'
                                                          }}>
                                                        Цвет: {item.selectedVariant.color}
                                                    </span>
                                                )}
                                            </div>

                                            <p className="text-muted small mb-3">
                                                {item.product.description && item.product.description.length > 100
                                                    ? `${item.product.description.substring(0, 100)}...`
                                                    : item.product.description || ''}
                                            </p>
                                            <p className="mb-0" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                                {formatPrice(item.product.price)} / шт.
                                            </p>
                                        </div>

                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div>
                                                <span className="me-3">Количество: <strong>{item.quantity} шт.</strong></span>
                                                <span>Сумма: <strong>{formatPrice(item.product.price * item.quantity)}</strong></span>
                                            </div>
                                            <button
                                                className="btn-fs btn-fs-ghost btn-fs-sm"
                                                onClick={() => handleRemoveItem(item.variantId)}
                                            >
                                                УДАЛИТЬ
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <div className="text-start mt-4">
                        <button
                            className="btn-fs btn-fs-outline btn-fs-sm"
                            onClick={handleClearCart}
                        >
                            ОЧИСТИТЬ КОРЗИНУ
                        </button>
                    </div>
                </div>

                <div className="col-lg-4 bg-light px-4 px-md-5 py-5" style={{backgroundColor: 'var(--cream-light)'}}>
                    <div className="sticky-top" style={{top: '2rem'}}>
                        <h3 className="h5 fw-light mb-4" style={{fontFamily: "'Playfair Display', serif"}}>
                            Итог заказа
                        </h3>

                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">
                                    Товары ({items.reduce((sum, item) => sum + item.quantity, 0)} шт.)
                                </span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>

                            <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <strong className="fw-normal">Общая сумма</strong>
                                <strong className="fs-5">{formatPrice(totalPrice)}</strong>
                            </div>
                        </div>

                        <div className="button-group">
                            <button
                                onClick={handleCheckout}
                                className="btn-fs btn-fs-checkout btn-fs-block"
                            >
                                ОФОРМИТЬ ЗАКАЗ
                            </button>

                            <Link
                                to="/"
                                className="btn-fs btn-fs-outline btn-fs-lg btn-fs-block"
                            >
                                ПРОДОЛЖИТЬ ПОКУПКИ
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;