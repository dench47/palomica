// src/pages/AuthChoicePage.tsx
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const AuthChoicePage = () => {
    const navigate = useNavigate();
    const { items } = useCart();

    if (items.length === 0) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{ fontSize: '3rem', opacity: 0.1 }}>🛒</div>
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

    const handleGuestCheckout = () => {
        // Передаем параметр, что это гостевое оформление
        navigate('/checkout?guest=true');
    };

    const handleLogin = () => {
        // Передаем параметр, что пользователь вошел
        navigate('/checkout?guest=false');
    };

    return (
        <div className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
            <div className="text-center w-100" style={{ maxWidth: '500px' }}>
                <div className="mb-4" style={{ fontSize: '2.5rem' }}>🔐</div>
                <h2 className="fw-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Как вы хотите оформить заказ?
                </h2>

                <div className="mb-4">
                    <button
                        onClick={handleGuestCheckout}
                        className="btn btn-dark rounded-0 px-5 py-3 fw-light w-100 mb-3"
                        style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                    >
                        ПРОДОЛЖИТЬ БЕЗ РЕГИСТРАЦИИ
                    </button>
                    <p className="small text-muted mb-4">
                        Быстрое оформление. Вам нужно будет указать только имя, телефон и email
                    </p>

                    <button
                        onClick={handleLogin}
                        className="btn btn-outline-dark rounded-0 px-5 py-3 fw-light w-100"
                        style={{ letterSpacing: '0.1em', fontSize: '0.9rem' }}
                    >
                        ВОЙТИ И ОФОРМИТЬ
                    </button>
                    <p className="small text-muted">
                        Для зарегистрированных пользователей. Данные подставятся автоматически
                    </p>
                </div>

                <div className="mt-5 pt-4 border-top">
                    <Link
                        to="/cart"
                        className="btn btn-link text-muted small text-decoration-none"
                    >
                        ← Вернуться в корзину
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthChoicePage;