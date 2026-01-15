import { useCart } from '../context/CartContext';
import { useState, type FormEvent, type ChangeEvent, useEffect, useRef } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { FiSearch } from 'react-icons/fi';
import { ShoppingCart } from 'lucide-react';
import IconButton from './IconButton'; // Импортируем созданный компонент

const Header = () => {
    const { totalItems } = useCart();
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const logo = "/images/dark-logo.jpeg";

    // Автозакрытие при клике вне поля поиска
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current &&
                !searchRef.current.contains(event.target as Node) &&
                searchQuery === '') {
                setShowSearch(false);
            }
        };

        if (showSearch) {
            document.addEventListener('mousedown', handleClickOutside);
            inputRef.current?.focus();
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showSearch, searchQuery]);

    const handleSearch = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setShowSearch(false);
            setSearchQuery('');
        }
        if (e.key === 'Enter' && searchQuery.trim()) {
            e.preventDefault();
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
            setShowSearch(false);
        }
    };

    return (
        <header className="py-3" style={{ backgroundColor: '#282840' }}>
            <div className="container">
                <div className="d-flex justify-content-between align-items-center">
                    {/* Логотип */}
                    <div className="ms-5">
                        <Link to="/" className="text-decoration-none">
                            <img
                                src={logo}
                                alt="FashionStore"
                                style={{
                                    height: '77px',
                                    width: 'auto'
                                }}
                            />
                        </Link>
                    </div>

                    {/* Навигация */}
                    <nav className="d-none d-md-flex">
                        <Link to="/catalog" className="text-white text-decoration-none mx-3 fw-light">КАТАЛОГ</Link>
                        <a href="#gallery" className="text-white text-decoration-none mx-3 fw-light">ФОТОГАЛЕРЕЯ</a>
                        <a href="#souvenirs" className="text-white text-decoration-none mx-3 fw-light">СУВЕНИРЫ</a>
                    </nav>

                    {/* Иконки с профессиональными иконками */}
                    <div className="d-flex align-items-center gap-1">
                        {/* Поиск */}
                        <div className="me-1" ref={searchRef}>
                            {showSearch ? (
                                <form onSubmit={handleSearch} className="d-flex align-items-center">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Поиск..."
                                        value={searchQuery}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        style={{ width: '160px' }}
                                    />
                                    <button
                                        type="submit"
                                        className="btn btn-link text-white btn-sm ms-1"
                                        style={{ textDecoration: 'none' }}
                                    >
                                        <FiSearch size={18} />
                                    </button>
                                </form>
                            ) : (
                                <IconButton
                                    icon={FiSearch}
                                    onClick={() => setShowSearch(true)}
                                    size={20}
                                    className="text-white"
                                />
                            )}
                        </div>

                        {/*/!* Избранное *!/*/}
                        {/*<IconButton*/}
                        {/*    icon={Heart}*/}
                        {/*    onClick={() => navigate('/wishlist')}*/}
                        {/*    size={20}*/}
                        {/*    className="text-white"*/}
                        {/*/>*/}

                        {/* Корзина с бейджем */}
                        <IconButton
                            icon={ShoppingCart}
                            onClick={() => navigate('/cart')}
                            size={20}
                            className="text-white"
                            badge={totalItems}
                        />
                    </div>
                </div>

                {/* Мобильное меню */}
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