import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { items, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

    if (items.length === 0) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <h2>Корзина пуста</h2>
                    <p className="text-muted mb-4">Добавьте товары из каталога</p>
                    {/*<Link to="/" className="btn btn-dark">*/}
                    {/*    Вернуться к покупкам*/}
                    {/*</Link>*/}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <h1 className="mb-4">Корзина покупок</h1>

            <div className="row">
                <div className="col-md-8">
                    {items.map(item => (
                        <div key={item.product.id} className="card mb-3">
                            <div className="row g-0">
                                <div className="col-md-3">
                                    <img
                                        src={item.product.imageUrl}
                                        className="img-fluid rounded-start"
                                        alt={item.product.name}
                                        style={{ height: '150px', objectFit: 'cover' }}
                                    />
                                </div>
                                <div className="col-md-9">
                                    <div className="card-body">
                                        <div className="d-flex justify-content-between">
                                            <div>
                                                <h5 className="card-title">{item.product.name}</h5>
                                                <p className="card-text text-muted">{item.product.description}</p>
                                                <p className="card-text">
                                                    <strong>{item.product.price.toLocaleString('ru-RU')} ₽</strong>
                                                </p>
                                            </div>
                                            <div className="d-flex align-items-center">
                                                <div className="input-group me-3" style={{ width: '120px' }}>
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                                    >
                                                        -
                                                    </button>
                                                    <input
                                                        type="text"
                                                        className="form-control text-center"
                                                        value={item.quantity}
                                                        readOnly
                                                    />
                                                    <button
                                                        className="btn btn-outline-secondary"
                                                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                                    >
                                                        +
                                                    </button>
                                                </div>
                                                <button
                                                    className="btn btn-danger btn-sm"
                                                    onClick={() => removeFromCart(item.product.id)}
                                                >
                                                    Удалить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    <button className="btn btn-outline-danger" onClick={clearCart}>
                        Очистить корзину
                    </button>
                </div>

                <div className="col-md-4">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">Итого</h5>
                            <div className="d-flex justify-content-between mb-2">
                                <span>Товары ({items.reduce((sum, item) => sum + item.quantity, 0)} шт.)</span>
                                <span>{totalPrice.toLocaleString('ru-RU')} ₽</span>
                            </div>
                            <div className="d-flex justify-content-between mb-3">
                                <span>Доставка</span>
                                <span>Бесплатно</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between mb-4">
                                <strong>Общая сумма</strong>
                                <strong className="fs-5">{totalPrice.toLocaleString('ru-RU')} ₽</strong>
                            </div>
                            <button className="btn btn-dark w-100 btn-lg">
                                Перейти к оформлению
                            </button>
                            {/*<Link to="/" className="btn btn-outline-dark w-100 mt-2">*/}
                            {/*    Продолжить покупки*/}
                            {/*</Link>*/}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;