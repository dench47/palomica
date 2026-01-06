// CartPage.tsx - ПОЛНЫЙ ФАЙЛ
import {useCart} from '../context/CartContext';
import {Link, useNavigate} from 'react-router-dom';
import MySwal from '../utils/swalConfig';
import {RefreshCw, Shield} from 'lucide-react';

const CartPage = () => {
    const {items, removeFromCart, totalPrice, clearCart} = useCart();
    const navigate = useNavigate();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    // Функция для показа модального окна выбора оформления
    const showCheckoutChoice = () => {
        MySwal.fire({
            title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300; font-size: 1.5rem">Как оформить заказ?</div>',
            html: `
                <div style="font-family: 'Cormorant Garamond', serif; color: #666; line-height: 1.6">
                    <p class="mb-4">Выберите способ оформления заказа:</p>
                    
                    <div class="mb-4">
                        <button id="guest-checkout" 
                            class="btn btn-dark rounded-0 w-100 py-3 fw-light mb-3"
                            style="letter-spacing: 0.1em; font-size: 0.9rem; font-family: 'Cormorant Garamond', serif">
                            ПРОДОЛЖИТЬ БЕЗ РЕГИСТРАЦИИ
                        </button>
                        <p class="small text-muted mb-4">
                            Быстрое оформление. Вам нужно будет указать только имя, телефон и email
                        </p>
                    </div>
                    
                    <div>
                        <button id="login-checkout" 
                            class="btn btn-outline-dark rounded-0 w-100 py-3 fw-light"
                            style="letter-spacing: 0.1em; font-size: 0.9rem; font-family: 'Cormorant Garamond', serif">
                            ВОЙТИ И ОФОРМИТЬ
                        </button>
                        <p class="small text-muted">
                            Для зарегистрированных пользователей. Данные подставятся автоматически
                        </p>
                    </div>
                </div>
            `,
            customClass: {
                popup: 'rounded-0 border-0',
                title: 'fw-light mb-3',
                htmlContainer: 'text-muted p-0',
                actions: 'd-none'
            },
            buttonsStyling: false,
            background: '#f8f9fa',
            width: '500px',
            showConfirmButton: false,
            showCloseButton: true,
            showClass: {
                popup: 'animate__animated animate__fadeInDown'
            },
            hideClass: {
                popup: 'animate__animated animate__fadeOutUp'
            },
            didOpen: () => {
                document.getElementById('guest-checkout')?.addEventListener('click', () => {
                    MySwal.close();
                    navigate('/checkout?guest=true');
                });

                document.getElementById('login-checkout')?.addEventListener('click', () => {
                    MySwal.close();
                    showLoginModal();
                });
            }
        });
    };

    // Функция для модалки входа
    const showLoginModal = () => {
        MySwal.fire({
            title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300">Вход в аккаунт</div>',
            html: `
                <div style="font-family: 'Cormorant Garamond', serif; color: #666">
                    <p class="mb-4">Функция входа будет реализована в ближайшее время.</p>
                    <p class="small text-muted">А пока вы можете оформить заказ без регистрации.</p>
                </div>
            `,
            icon: 'info',
            customClass: {
                popup: 'rounded-0 border-0',
                title: 'fw-light mb-3',
                htmlContainer: 'text-muted',
                confirmButton: 'btn btn-dark rounded-0 px-4 py-2',
                cancelButton: 'btn btn-outline-dark rounded-0 px-4 py-2'
            },
            buttonsStyling: false,
            background: '#f8f9fa',
            showConfirmButton: true,
            showCancelButton: true,
            confirmButtonText: 'Оформить как гость',
            cancelButtonText: 'Отмена',
            width: '450px'
        }).then((result) => {
            if (result.isConfirmed) {
                navigate('/checkout?guest=true');
            }
        });
    };

    // Функция подтверждения очистки корзины
    const handleClearCart = () => {
        MySwal.fire({
            title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300">Очистить корзину?</div>',
            html: `<div style="font-family: 'Cormorant Garamond', serif; color: #666">
                    Вы уверены, что хотите удалить все товары из корзины?<br>
                    <span class="text-danger small">Это действие нельзя отменить.</span>
                  </div>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Да, очистить',
            cancelButtonText: 'Отмена',
            customClass: {
                popup: 'rounded-0 border-0',
                title: 'fw-light mb-3',
                htmlContainer: 'text-muted',
                confirmButton: 'btn btn-danger rounded-0 px-4 py-2',
                cancelButton: 'btn btn-outline-dark rounded-0 px-4 py-2',
                actions: 'mt-4'
            },
            buttonsStyling: false,
            background: '#f8f9fa',
            width: '480px'
        }).then((result) => {
            if (result.isConfirmed) {
                clearCart();

                MySwal.fire({
                    title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300; color: #28a745">Корзина очищена</div>',
                    html: `<div style="font-family: 'Cormorant Garamond', serif; color: #666">
                            Все товары удалены из корзины.
                          </div>`,
                    icon: 'success',
                    customClass: {
                        popup: 'rounded-0 border-0',
                        title: 'fw-light mb-3',
                        htmlContainer: 'text-muted',
                        confirmButton: 'btn btn-dark rounded-0 px-4 py-2',
                        actions: 'mt-4'
                    },
                    buttonsStyling: false,
                    background: '#f8f9fa',
                    showConfirmButton: true,
                    confirmButtonText: 'Понятно',
                    confirmButtonColor: '#000',
                    width: '450px',
                    timer: 3000,
                    timerProgressBar: true
                });
            }
        });
    };

    // Функция подтверждения удаления одного товара
    const handleRemoveItem = (itemName: string, variantId: string) => {
        MySwal.fire({
            title: '<div style="font-family: \'Playfair Display\', serif; font-weight: 300">Удалить товар?</div>',
            html: `<div style="font-family: 'Cormorant Garamond', serif; color: #666">
                    Вы уверены, что хотите удалить <strong>"${itemName}"</strong> из корзины?
                  </div>`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Да, удалить',
            cancelButtonText: 'Отмена',
            customClass: {
                popup: 'rounded-0 border-0',
                title: 'fw-light mb-3',
                htmlContainer: 'text-muted',
                confirmButton: 'btn btn-danger rounded-0 px-4 py-2',
                cancelButton: 'btn btn-outline-dark rounded-0 px-4 py-2',
                actions: 'mt-4'
            },
            buttonsStyling: false,
            background: '#f8f9fa',
            width: '480px'
        }).then((result) => {
            if (result.isConfirmed) {
                removeFromCart(variantId);
            }
        });
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
            {/* Заголовок в стиле сайта */}
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
                {/* Список товаров */}
                <div className="col-lg-8 px-4 px-md-5 pb-5">
                    {items.map(item => (
                        <div key={item.variantId} className="mb-4 pb-4 border-bottom">
                            <div className="row g-0">
                                {/* Изображение */}
                                <div className="col-4 col-md-3">
                                    <div
                                        className="w-100"
                                        style={{
                                            backgroundImage: `url(${item.product.imageUrl})`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center',
                                            paddingBottom: '100%', // Квадратное изображение
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => navigate(`/product/${item.product.id}`)}
                                    ></div>
                                </div>

                                {/* Информация о товаре */}
                                <div className="col-8 col-md-9 ps-4 ps-md-5">
                                    <div className="d-flex flex-column h-100">
                                        <div className="flex-grow-1">
                                            <h3 className="h5 fw-light mb-2"
                                                style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                                {item.product.name}
                                            </h3>

                                            {item.selectedVariant && (
                                                <div className="mb-2">
                                                    {item.selectedVariant.size && (
                                                        <span
                                                            className="badge bg-dark text-light me-2 rounded-0 px-2 py-1"
                                                            style={{fontSize: '0.7rem', fontWeight: 'normal'}}>
                                                            Размер: {item.selectedVariant.size}
                                                        </span>
                                                    )}
                                                    {item.selectedVariant.color && (
                                                        <span className="badge bg-dark text-light rounded-0 px-2 py-1"
                                                              style={{fontSize: '0.7rem', fontWeight: 'normal'}}>
                                                            Цвет: {item.selectedVariant.color}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <p className="text-muted small mb-3">
                                                {item.product.description.length > 100
                                                    ? `${item.product.description.substring(0, 100)}...`
                                                    : item.product.description}
                                            </p>
                                            <p className="mb-0" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                                {formatPrice(item.product.price)} / шт.
                                            </p>
                                        </div>

                                        {/* Управление количеством */}
                                        <div className="d-flex justify-content-between align-items-center mt-3">
                                            <div>
                                                <span className="me-3">Количество: <strong>{item.quantity} шт.</strong></span>
                                                <span>Сумма: <strong>{formatPrice(item.product.price * item.quantity)}</strong></span>
                                            </div>
                                            <button
                                                className="btn btn-link text-dark p-0 text-decoration-none small"
                                                onClick={() => handleRemoveItem(item.product.name, item.variantId)}
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

                    {/* Кнопка очистки */}
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

                {/* Панель итогов */}
                <div className="col-lg-4 bg-light px-4 px-md-5 py-5">
                    <div className="sticky-top" style={{top: '2rem'}}>
                        <h3 className="h5 fw-light mb-4" style={{fontFamily: "'Playfair Display', serif"}}>
                            Итог заказа
                        </h3>

                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-2">
                                <span
                                    className="text-muted small">Товары ({items.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted small">Доставка</span>
                                <span className="text-success small">Бесплатно</span>
                            </div>
                            <div className="d-flex justify-content-between mt-3 pt-3 border-top">
                                <strong className="fw-normal">Общая сумма</strong>
                                <strong className="fs-5">{formatPrice(totalPrice)}</strong>
                            </div>
                        </div>

                        {/* Кнопка оформления */}
                        <button
                            onClick={showCheckoutChoice}
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

                        {/* Информация о синхронизации */}
                        <div className="mt-4 pt-3 border-top">
                            <p className="small text-muted mb-2">
                                <RefreshCw size={14} className="me-1"
                                           style={{color: '#17a2b8', verticalAlign: 'text-bottom'}}/>
                                Корзина автоматически синхронизируется
                            </p>
                            <p className="small text-muted">
                                <Shield size={14} className="me-1"
                                        style={{color: '#28a745', verticalAlign: 'text-bottom'}}/>
                                Товары зарезервированы на 30 минут
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;