import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService, type Product } from '../services/api';

const SearchPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [products, setProducts] = useState<Product[]>([]);
    const [directMatches, setDirectMatches] = useState<Product[]>([]);
    const [complementaryItems, setComplementaryItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Извлечение поискового запроса из URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q') || '';
        setSearchQuery(query);
    }, [location]);

    // Загрузка всех товаров
    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                const allProducts = await productService.getAllProducts();
                setProducts(allProducts);
                filterProducts(allProducts, searchQuery);
            } catch (error) {
                console.error('Ошибка загрузки товаров:', error);
            } finally {
                setLoading(false);
            }
        };
        loadProducts();
    }, []);

    // Фильтрация при изменении запроса
    useEffect(() => {
        filterProducts(products, searchQuery);
    }, [searchQuery, products]);

    // Функция для разделения товаров
    const filterProducts = (allProducts: Product[], query: string) => {
        if (!query.trim()) {
            setDirectMatches([]);
            setComplementaryItems([]);
            return;
        }

        const queryLower = query.toLowerCase().trim();
        const direct: Product[] = [];
        const complementary: Product[] = [];

        allProducts.forEach(product => {
            if (product.name.toLowerCase().includes(queryLower)) {
                direct.push(product);
            } else if (
                product.description?.toLowerCase().includes(queryLower) ||
                product.material?.toLowerCase().includes(queryLower) ||
                product.color?.toLowerCase().includes(queryLower)
            ) {
                complementary.push(product);
            }
        });

        setDirectMatches(direct);
        setComplementaryItems(complementary);
    };

    // Функция для получения подсказки
    const getComplementaryHint = (product: Product, query: string): string => {
        if (product.name.toLowerCase().includes('баска') ||
            product.name.toLowerCase().includes('пеплум')) {
            return `Акцент на талии с ${query}`;
        }
        if (product.name.toLowerCase().includes('сумк')) {
            return `Завершает образ с ${query}`;
        }
        if (product.name.toLowerCase().includes('ремень') ||
            product.name.toLowerCase().includes('пояс')) {
            return `Подчеркивает силуэт ${query}`;
        }
        return `Сочетается с ${query}`;
    };

    const handleBackToCatalog = () => {
        navigate('/catalog');
    };

    return (
        <div className="min-vh-100" style={{
            backgroundColor: '#f5f3ee', // Более теплый кремовый фон
            paddingTop: '2rem',
            paddingBottom: '4rem'
        }}>
            <div className="container" style={{ maxWidth: '1200px' }}>
                {/* Кнопка назад */}
                <div className="text-center mb-4">
                    <button
                        onClick={handleBackToCatalog}
                        className="btn btn-link text-dark p-0 text-decoration-none"
                        style={{
                            fontSize: '0.95rem',
                            letterSpacing: '0.3px',
                            color: '#666'
                        }}
                    >
                        ← Каталог
                    </button>
                </div>

                {/* Счетчик результатов (вместо заголовка) */}
                {searchQuery && directMatches.length > 0 && (
                    <div className="text-center mb-4">
                        <div className="text-muted" style={{
                            fontSize: '0.95rem',
                            fontFamily: "'Helvetica Neue', Arial, sans-serif",
                            color: '#777'
                        }}>
                            Найдено {directMatches.length} {directMatches.length === 1 ? 'товар' :
                            directMatches.length < 5 ? 'товара' : 'товаров'}
                        </div>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border" role="status" style={{
                            width: '2.5rem',
                            height: '2.5rem',
                            borderWidth: '0.15em',
                            color: '#8a7a63'
                        }}>
                            <span className="visually-hidden">Загрузка...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Блок 1: Прямые совпадения */}
                        {directMatches.length > 0 && (
                            <section className="mb-5 pb-5">
                                <div className="text-center mb-4">
                                    <h2 className="h5 mb-0" style={{
                                        fontWeight: 400,
                                        letterSpacing: '1px',
                                        color: '#333',
                                        fontSize: '0.85rem',
                                        textTransform: 'uppercase'
                                    }}>
                                        Результаты поиска
                                    </h2>
                                </div>

                                {/* Карточки центрированы */}
                                <div className="row justify-content-center g-4">
                                    {directMatches.map(product => (
                                        <div key={product.id} className="col-xl-3 col-lg-4 col-md-6">
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Блок 2: Дополняющие товары */}
                        {complementaryItems.length > 0 && (
                            <section className="mt-5 pt-5" style={{
                                borderTop: '1px solid rgba(0,0,0,0.04)'
                            }}>
                                <div className="text-center mb-4">
                                    <h2 className="h5 mb-3" style={{
                                        fontWeight: 400,
                                        letterSpacing: '1px',
                                        color: '#8a7a63', // Теплый коричневый
                                        fontSize: '0.85rem',
                                        textTransform: 'uppercase'
                                    }}>
                                        Дополняет ваш выбор
                                    </h2>

                                    <p className="text-muted mb-4" style={{
                                        fontSize: '0.9rem',
                                        maxWidth: '500px',
                                        margin: '0 auto',
                                        lineHeight: '1.5',
                                        color: '#666'
                                    }}>
                                        {directMatches.length > 0 ?
                                            `Эти аксессуары создадут гармоничный образ` :
                                            `Товары, связанные с "${searchQuery}"`
                                        }
                                    </p>
                                </div>

                                {/* Компактные карточки дополнений */}
                                <div className="row justify-content-center g-3">
                                    {complementaryItems.map(product => (
                                        <div key={product.id} className="col-xl-4 col-lg-5 col-md-8">
                                            <div className="card border-0 h-100"
                                                 style={{
                                                     backgroundColor: 'rgba(255,255,255,0.7)',
                                                     borderRadius: '6px',
                                                     overflow: 'hidden',
                                                     transition: 'all 0.2s ease',
                                                     border: '1px solid rgba(0,0,0,0.03)'
                                                 }}
                                                 onMouseEnter={(e) => {
                                                     e.currentTarget.style.transform = 'translateY(-2px)';
                                                     e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.04)';
                                                 }}
                                                 onMouseLeave={(e) => {
                                                     e.currentTarget.style.transform = 'translateY(0)';
                                                     e.currentTarget.style.boxShadow = 'none';
                                                 }}>
                                                <div className="card-body p-3">
                                                    <div className="d-flex align-items-start">
                                                        <div className="me-3" style={{ minWidth: '80px' }}>
                                                            <img
                                                                src={product.imageUrl}
                                                                alt={product.name}
                                                                className="img-fluid rounded"
                                                                style={{
                                                                    width: '80px',
                                                                    height: '80px',
                                                                    objectFit: 'cover'
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="flex-grow-1">
                                                            <h3 className="h6 mb-1 fw-normal" style={{ color: '#333' }}>
                                                                {product.name}
                                                            </h3>
                                                            <p className="text-muted small mb-2" style={{
                                                                fontSize: '0.75rem',
                                                                color: '#888'
                                                            }}>
                                                                {product.category}
                                                            </p>
                                                            <div className="mb-2">
                                                                <span className="text-muted" style={{
                                                                    fontSize: '0.8rem',
                                                                    lineHeight: '1.3',
                                                                    color: '#666',
                                                                    fontStyle: 'italic'
                                                                }}>
                                                                    {getComplementaryHint(product, searchQuery)}
                                                                </span>
                                                            </div>
                                                            <div className="d-flex justify-content-between align-items-center mt-2">
                                                                <span className="h6 mb-0 fw-bold" style={{ color: '#333' }}>
                                                                    {product.price.toLocaleString()} ₽
                                                                </span>
                                                                <button
                                                                    className="btn btn-sm"
                                                                    style={{
                                                                        backgroundColor: 'transparent',
                                                                        color: '#8a7a63',
                                                                        border: '1px solid #d4cdc0',
                                                                        borderRadius: '3px',
                                                                        padding: '3px 10px',
                                                                        fontSize: '0.8rem'
                                                                    }}
                                                                    onClick={() => navigate(`/product/${product.id}`)}
                                                                >
                                                                    Подробнее
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Если ничего не найдено */}
                        {directMatches.length === 0 && complementaryItems.length === 0 && searchQuery && (
                            <div className="text-center py-5">
                                <div className="mb-3" style={{
                                    fontSize: '3rem',
                                    opacity: 0.08,
                                    color: '#333'
                                }}>
                                    ✕
                                </div>
                                <h3 className="h5 mb-3 fw-normal" style={{ color: '#555' }}>
                                    Ничего не найдено
                                </h3>
                                <p className="text-muted mb-4" style={{
                                    fontSize: '0.9rem',
                                    color: '#777'
                                }}>
                                    Попробуйте изменить запрос
                                </p>
                                <button
                                    onClick={handleBackToCatalog}
                                    className="btn btn-outline-dark"
                                    style={{
                                        padding: '6px 20px',
                                        borderRadius: '3px',
                                        fontSize: '0.85rem',
                                        borderColor: '#ddd'
                                    }}
                                >
                                    Весь каталог
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SearchPage;