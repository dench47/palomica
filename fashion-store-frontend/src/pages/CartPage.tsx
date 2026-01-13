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
        // Прямой переход на оформление заказа без всяких окон
        navigate('/checkout');
    };

    if (items.length === 0) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{fontSize: '3rem', opacity: 0.1}}>🛒</div>
                    <h2 className="fw-light mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                        Корзина пуста
                    </h2>
                    <p className="text-muted mb-4 small">Добавьте товары из каталога</p>
                    <Link
                        to="/"
                        className="btn btn-outline-dark rounded-0 px-5 py-3 fw-light"
                        style={{letterSpacing: '0.1em', fontSize: '0.9rem'}}
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
                                        className="w-100"
                                        style={{
                                            backgroundImage: `url(${item.product.imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            paddingBottom: '100%',
                                            cursor: 'pointer'
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
                                                    className="badge bg-dark text-light me-2 rounded-0 px-2 py-1"
                                                    style={{fontSize: '0.7rem', fontWeight: 'normal'}}>
                                                    Размер: {item.selectedVariant.size}
                                                </span>

                                                {item.selectedVariant.color && (
                                                    <span className="badge bg-dark text-light rounded-0 px-2 py-1"
                                                          style={{fontSize: '0.7rem', fontWeight: 'normal'}}>
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
                                                className="btn btn-link text-dark p-0 text-decoration-none small"
                                                onClick={() => handleRemoveItem(item.variantId)}
                                                style={{letterSpacing: '0.05em'}}
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
                            className="btn btn-outline-dark rounded-0 border-1 px-4 py-2 fw-light"
                            onClick={handleClearCart}
                            style={{fontSize: '0.85rem', letterSpacing: '0.1em'}}
                        >
                            ОЧИСТИТЬ КОРЗИНУ
                        </button>
                    </div>
                </div>

                <div className="col-lg-4 bg-light px-4 px-md-5 py-5">
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

                        <button
                            onClick={handleCheckout}
                            className="btn btn-dark rounded-0 w-100 py-3 fw-light mb-3"
                            style={{letterSpacing: '0.1em', fontSize: '0.9rem'}}
                        >
                            ОФОРМИТЬ ЗАКАЗ
                        </button>

                        <Link
                            to="/"
                            className="btn btn-outline-dark rounded-0 w-100 py-3 fw-light"
                            style={{letterSpacing: '0.1em', fontSize: '0.85rem'}}
                        >
                            ПРОДОЛЖИТЬ ПОКУПКИ
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;