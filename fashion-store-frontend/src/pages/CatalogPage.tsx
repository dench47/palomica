import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/api';
import type { Product } from '../services/api';

interface Category {
    id: string;
    name: string;
    subcategories?: string[];
}

const CatalogPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('все');
    useNavigate();
// Категории как в твоём плане
    const categories: Category[] = [
        { id: 'все', name: 'Все товары' },
        { id: 'одежда', name: 'Одежда', subcategories: ['платья', 'блузки и рубашки', 'топы', 'жилеты', 'юбки', 'брюки'] },
        { id: 'аксессуары', name: 'Аксессуары', subcategories: ['платки', 'пояса', 'баски', 'воротники', 'манжеты'] },
        { id: 'сумки', name: 'Сумки' },
        { id: 'сувениры', name: 'Сувениры' }
    ];

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [selectedCategory, products]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            setProducts(data);
            setFilteredProducts(data);
        } catch (err) {
            setError('Ошибка при загрузке товаров');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        if (selectedCategory === 'все') {
            setFilteredProducts(products);
            return;
        }

        // Если выбрана основная категория
        const filtered = products.filter(product =>
            product.category?.toLowerCase() === selectedCategory.toLowerCase()
        );

        // Если ничего не найдено в основной категории, ищем в подкатегориях по названию
        if (filtered.length === 0) {
            const subcategoryFiltered = products.filter(product =>
                product.name.toLowerCase().includes(selectedCategory.toLowerCase()) ||
                product.description.toLowerCase().includes(selectedCategory.toLowerCase())
            );
            setFilteredProducts(subcategoryFiltered);
        } else {
            setFilteredProducts(filtered);
        }
    };

    const getCategoryCount = (categoryId: string): number => {
        if (categoryId === 'все') return products.length;

        // Для основных категорий
        const mainCategory = categories.find(c => c.id === categoryId);
        if (mainCategory?.subcategories) {
            // Для категорий с подкатегориями считаем все товары этой категории
            return products.filter(p => p.category?.toLowerCase() === categoryId.toLowerCase()).length;
        }

        // Для подкатегорий ищем по названию
        return products.filter(product =>
            product.name.toLowerCase().includes(categoryId.toLowerCase()) ||
            product.description.toLowerCase().includes(categoryId.toLowerCase())
        ).length;
    };

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategory(categoryId);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubcategoryClick = (subcategory: string) => {
        setSelectedCategory(subcategory);
    };

    if (loading) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
                        <span className="visually-hidden">Загрузка каталога...</span>
                    </div>
                    <p className="mt-3 text-muted small">Загружаем каталог товаров...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{ fontSize: '3rem', opacity: 0.1 }}>⚠️</div>
                    <h2 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Ошибка загрузки
                    </h2>
                    <p className="text-muted mb-4">{error}</p>
                    <button
                        className="btn btn-outline-dark rounded-0 px-4 py-2"
                        onClick={loadProducts}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-0">
            {/* Заголовок */}
            <div className="px-4 px-md-5 pt-5">
                <h1 className="fw-light text-center mb-1" style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.5rem',
                    letterSpacing: '0.05em'
                }}>
                    КАТАЛОГ
                </h1>
                <p className="text-center text-muted small mb-5">
                    {selectedCategory === 'все'
                        ? `${products.length} товаров`
                        : `${filteredProducts.length} товаров в "${categories.find(c => c.id === selectedCategory)?.name || selectedCategory}"`}
                </p>
            </div>

            <div className="row g-0">
                {/* Сайдбар с категориями */}
                <div className="col-lg-3 col-xl-2 px-4 px-md-5 pb-5">
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <h3 className="h6 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                            Категории
                        </h3>

                        <nav className="nav flex-column">
                            {categories.map(category => (
                                <div key={category.id} className="mb-3">
                                    <button
                                        className={`btn btn-link p-0 text-start text-decoration-none ${selectedCategory === category.id ? 'text-dark fw-normal' : 'text-muted'}`}
                                        onClick={() => handleCategoryClick(category.id)}
                                        style={{
                                            fontSize: '0.9rem',
                                            letterSpacing: '0.05em',
                                            border: 'none',
                                            background: 'none',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        {category.name}
                                        <span className="ms-2 small opacity-75">
                                            ({getCategoryCount(category.id)})
                                        </span>
                                    </button>

                                    {/* Подкатегории */}
                                    {category.subcategories && selectedCategory === category.id && (
                                        <div className="ms-3 mt-2">
                                            {category.subcategories.map(sub => (
                                                <button
                                                    key={sub}
                                                    className={`btn btn-link p-0 d-block text-start text-decoration-none small ${selectedCategory === sub ? 'text-dark' : 'text-muted'}`}
                                                    onClick={() => handleSubcategoryClick(sub)}
                                                    style={{
                                                        fontSize: '0.85rem',
                                                        border: 'none',
                                                        background: 'none',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {sub}
                                                    <span className="ms-2 opacity-75">
                                                        ({getCategoryCount(sub)})
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Основной контент - товары */}
                <div className="col-lg-9 col-xl-10 px-4 px-md-5 pb-5">
                    {/* Сообщение если нет товаров в категории */}
                    {filteredProducts.length === 0 && !loading && (
                        <div className="text-center py-5">
                            <div className="mb-4" style={{ fontSize: '3rem', opacity: 0.1 }}>🛍️</div>
                            <h3 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Товары не найдены
                            </h3>
                            <p className="text-muted mb-4">
                                В категории "{categories.find(c => c.id === selectedCategory)?.name || selectedCategory}" пока нет товаров
                            </p>
                            <button
                                className="btn btn-outline-dark rounded-0 px-4 py-2"
                                onClick={() => setSelectedCategory('все')}
                            >
                                Показать все товары
                            </button>
                        </div>
                    )}

                    {/* Сетка товаров */}
                    {filteredProducts.length > 0 && (
                        <>
                            {/* Фильтр выбранной категории */}
                            <div className="mb-4 pb-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h2 className="h5 fw-light mb-0" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                                    </h2>
                                    <span className="small text-muted">
                                        {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' :
                                        filteredProducts.length > 1 && filteredProducts.length < 5 ? 'товара' : 'товаров'}
                                    </span>
                                </div>
                            </div>

                            {/* Карточки товаров */}
                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                {filteredProducts.map((product) => (
                                    <div className="col" key={product.id}>
                                        <ProductCard product={product} />
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Кнопка "Наверх" для мобильных */}
                    <div className="d-lg-none text-center mt-5">
                        <button
                            className="btn btn-outline-dark rounded-0 px-4 py-2"
                            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        >
                            ↑ Наверх к категориям
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CatalogPage;