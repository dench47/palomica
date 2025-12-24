import { useCart } from '../context/CartContext';
import logo from '../assets/logo.png'; // <- Импорт логотипа

const Header = () => {
    const { totalItems } = useCart();

    return (
        <header className="bg-light py-3 border-bottom">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    {/* Логотип */}
                    <div>
                        <a href="/" className="text-decoration-none">
                            <img
                                src={logo} // <- Используем импортированную переменную
                                alt="Название магазина"
                                style={{
                                    height: '50px',
                                    width: 'auto'
                                }}
                            />
                        </a>
                    </div>

                    {/* Навигация */}
                    <nav className="d-none d-md-flex">
                        <a href="#new" className="text-dark text-decoration-none mx-3">НОВИНКИ</a>
                        <a href="#dresses" className="text-dark text-decoration-none mx-3">ПЛАТЬЯ</a>
                        <a href="#tops" className="text-dark text-decoration-none mx-3">ВЕРХ</a>
                        <a href="#bottoms" className="text-dark text-decoration-none mx-3">НИЗ</a>
                        <a href="#accessories" className="text-dark text-decoration-none mx-3">АКСЕССУАРЫ</a>
                        <a href="#sale" className="text-danger text-decoration-none mx-3">SALE</a>
                    </nav>

                    {/* Иконки */}
                    <div className="d-flex align-items-center">
                        <div className="input-group me-3" style={{ width: '200px' }}>
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Поиск..."
                            />
                            <button className="btn btn-outline-secondary btn-sm">
                                🔍
                            </button>
                        </div>

                        <a href="#account" className="text-dark me-3" style={{ fontSize: '1.2rem' }}>
                            👤
                        </a>

                        <a href="#" className="text-dark position-relative" onClick={(e) => {
                            e.preventDefault();
                            alert('Страница корзины будет добавлена позже!');
                        }}>                            🛒
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.6rem' }}>
                                {totalItems}
                            </span>
                        </a>
                    </div>
                </div>

                {/* Мобильное меню */}
                <div className="d-md-none mt-3">
                    <div className="d-flex justify-content-around">
                        <a href="#new" className="text-dark text-decoration-none small">НОВИНКИ</a>
                        <a href="#dresses" className="text-dark text-decoration-none small">ПЛАТЬЯ</a>
                        <a href="#tops" className="text-dark text-decoration-none small">ВЕРХ</a>
                        <a href="#sale" className="text-danger text-decoration-none small">SALE</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;