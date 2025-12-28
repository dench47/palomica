import {useCart} from '../context/CartContext';
import {useState, type FormEvent, type ChangeEvent} from 'react';
import {Link} from "react-router-dom";

const Header = () => {
    const {totalItems} = useCart();
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const logo = "/images/dark-logo.jpeg";


    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            alert(`Поиск: ${searchQuery}`);
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    return (
        <header className="py-3" style={{ backgroundColor: '#282840' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    {/* Логотип увеличен на 10% */}
                    <div className="ms-5">
                        <a href="/" className="text-decoration-none">
                            <img
                                src={logo}
                                alt="FashionStore"
                                style={{
                                    height: '77px',  // Было 70px, стало 77px (+10%)
                                    width: 'auto'
                                }}
                            />
                        </a>
                    </div>

                    {/* Навигация - белый текст */}
                    <nav className="d-none d-md-flex">
                        <Link to="/catalog" className="text-white text-decoration-none mx-3 fw-light">КАТАЛОГ</Link>
                        <a href="#gallery" className="text-white text-decoration-none mx-3 fw-light">ФОТОГАЛЕРЕЯ</a>
                        <a href="#souvenirs" className="text-white text-decoration-none mx-3 fw-light">СУВЕНИРЫ</a>
                    </nav>

                    {/* Иконки с интерактивным поиском - белый цвет */}
                    <div className="d-flex align-items-center">
                        {/* Поиск - только иконка без рамки */}
                        <div className="me-3">
                            {showSearch ? (
                                <form onSubmit={handleSearch} className="d-flex">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Поиск..."
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                        autoFocus
                                        style={{width: '150px'}}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-link text-white btn-sm ms-1"
                                        style={{textDecoration: 'none'}}
                                    >
                                        🔍
                                    </button>
                                    <button
                                        type="button"
                                        className="btn btn-link text-white btn-sm ms-1"
                                        style={{textDecoration: 'none'}}
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
                                    className="btn btn-link text-white p-0"
                                    onClick={() => setShowSearch(true)}
                                    style={{
                                        fontSize: '1.2rem',
                                        textDecoration: 'none',
                                        border: 'none',
                                        background: 'none',
                                        boxShadow: 'none'
                                    }}
                                >
                                    🔍
                                </button>
                            )}
                        </div>

                        {/* Иконки - белый цвет */}
                        <a href="#account" className="text-white me-3" style={{fontSize: '1.2rem', textDecoration: 'none'}}>
                            👤
                        </a>

                        <Link to="/cart" className="text-white position-relative" style={{textDecoration: 'none'}}>
                            🛒
                            {totalItems > 0 && (
                                <span
                                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-white text-dark"
                                    style={{fontSize: '0.6rem', padding: '2px 5px'}}>
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>

                {/* Мобильное меню - белый текст */}
                <div className="d-md-none mt-3">
                    <div className="d-flex justify-content-around">
                        <Link to="/catalog" className="text-white text-decoration-none mx-3 small fw-light">КАТАЛОГ</Link>
                        <a href="#gallery" className="text-white text-decoration-none small fw-light">ФОТОГАЛЕРЕЯ</a>
                        <a href="#souvenirs" className="text-white text-decoration-none small fw-light">СУВЕНИРЫ</a>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;