import {useCart} from '../context/CartContext';
import logo from '../assets/logo.png';
import {useState, type FormEvent, type ChangeEvent} from 'react';
import {Link} from "react-router-dom"; // Добавили типы

const Header = () => {
    const {totalItems} = useCart();
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Указываем тип FormEvent для события формы
    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            alert(`Поиск: ${searchQuery}`);
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    // Указываем тип ChangeEvent для события input
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <header className="bg-light py-3 border-bottom">
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    {/* Логотип с увеличенным размером и отступом */}
                    <div className="ms-4">
                        <a href="/" className="text-decoration-none">
                            <img
                                src={logo}
                                alt="Название магазина"
                                style={{
                                    height: '70px',
                                    width: 'auto'
                                }}
                            />
                        </a>
                    </div>

                    {/* Навигация */}
                    <nav className="d-none d-md-flex">
                        <Link to="/catalog" className="text-dark text-decoration-none mx-3">КАТАЛОГ</Link>
                        <a href="#gallery" className="text-dark text-decoration-none mx-3">ФОТОГАЛЕРЕЯ</a>
                        <a href="#souvenirs" className="text-dark text-decoration-none mx-3">СУВЕНИРЫ</a>
                    </nav>

                    {/* Иконки с интерактивным поиском */}
                    <div className="d-flex align-items-center">
                        {/* Поиск - только иконка или поле ввода */}
                        <div className="me-3">
                            {showSearch ? (
                                <form onSubmit={handleSearch} className="d-flex">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Поиск..."
                                        value={searchQuery}
                                        onChange={handleInputChange} // Используем отдельную функцию
                                        autoFocus
                                        style={{width: '150px'}}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-outline-secondary btn-sm ms-1"
                                    >
                                        🔍
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-outline-secondary btn-sm ms-1"
                                        onClick={() => {
                                            setShowSearch(false);
                                            setSearchQuery('');
                                        }}
                                    >
                                        ✕
                                    </button>
                                </form>
                            ) : (
                                <button
                                    className="btn btn-outline-secondary btn-sm"
                                    onClick={() => setShowSearch(true)}
                                    style={{fontSize: '1.2rem'}}
                                >
                                    🔍
                                </button>
                            )}
                        </div>

                        <a href="#account" className="text-dark me-3" style={{fontSize: '1.2rem'}}>
                            👤
                        </a>

                        <Link to="/cart" className="text-dark position-relative text-decoration-none">
                            🛒
                            {totalItems > 0 && (
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-dark"
                                    style={{fontSize: '0.6rem', padding: '2px 5px'}}>
            {totalItems}
        </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Мобильное меню */}
                <div className="d-md-none mt-3">
                    <div className="d-flex justify-content-around">
                        <Link to="/catalog" className="text-dark text-decoration-none mx-3">КАТАЛОГ</Link>
                        <a href="#gallery" className="text-dark text-decoration-none small">ФОТОГАЛЕРЕЯ</a>
                        <a href="#souvenirs" className="text-dark text-decoration-none small">СУВЕНИРЫ</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;