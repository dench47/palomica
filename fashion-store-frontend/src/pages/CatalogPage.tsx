import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { productService, categoryService } from '../services/api';
import type { Product, Category } from '../services/api';

const CatalogPage = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [openCategoryId, setOpenCategoryId] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [selectedCategory, products]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Загружаем категории и товары параллельно
            const [categoriesData, productsData] = await Promise.all([
                categoryService.getAllCategories(),
                productService.getAllProducts()
            ]);

            setCategories(categoriesData);
            setProducts(productsData);
            setFilteredProducts(productsData);

        } catch (err) {
            setError('Ошибка при загрузке данных');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterProducts = () => {
        if (selectedCategory === 'all') {
            setFilteredProducts(products);
            return;
        }

        // Ищем категорию по имени
        const category = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());

        if (category) {
            // Фильтруем по основной категории
            const filtered = products.filter(product =>
                product.category?.toLowerCase() === category.name.toLowerCase()
            );
            setFilteredProducts(filtered);
            return;
        }

        // Если не нашли категорию, ищем подкатегорию
        const filtered = products.filter(product =>
            product.subcategory?.toLowerCase() === selectedCategory.toLowerCase()
        );
        setFilteredProducts(filtered);
    };

    const getCategoryCount = (categoryName: string): number => {
        if (categoryName === 'all') {
            return products.filter(p => p.availableQuantity > 0).length;
        }

        // Проверяем, является ли это категорией
        const isCategory = categories.some(c => c.name.toLowerCase() === categoryName.toLowerCase());

        if (isCategory) {
            return products.filter(p =>
                p.category?.toLowerCase() === categoryName.toLowerCase() &&
                p.availableQuantity > 0
            ).length;
        }

        // Если не категория, значит подкатегория
        return products.filter(p =>
            p.subcategory?.toLowerCase() === categoryName.toLowerCase() &&
            p.availableQuantity > 0
        ).length;
    };

    const handleCategoryClick = (categoryId: number, categoryName: string) => {
        if (openCategoryId === categoryId) {
            setOpenCategoryId(null);
        } else {
            setOpenCategoryId(categoryId);
        }
        setSelectedCategory(categoryName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSubcategoryClick = (subcategoryName: string) => {
        setSelectedCategory(subcategoryName);
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                        onClick={loadData}
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid px-0">
            <div className="px-4 px-md-5 pt-5">
                <h1 className="fw-light text-center mb-1" style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '2.5rem',
                    letterSpacing: '0.05em'
                }}>
                    КАТАЛОГ
                </h1>

                <p className="text-center text-muted small mb-5">
                    {selectedCategory === 'all'
                        ? `${products.filter(p => p.availableQuantity > 0).length} товаров`
                        : `${filteredProducts.filter(p => p.availableQuantity > 0).length} товаров в "${selectedCategory}"`}
                </p>
            </div>

            <div className="row g-0">
                <div className="col-lg-3 col-xl-2 px-4 px-md-5 pb-5">
                    <div className="sticky-top" style={{ top: '2rem' }}>
                        <nav className="nav flex-column">
                            <div className="mb-3">
                                <button
                                    className={`btn btn-link p-0 text-start text-decoration-none ${selectedCategory === 'all' ? 'text-dark fw-normal' : 'text-muted'}`}
                                    onClick={() => setSelectedCategory('all')}
                                    style={{
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.05em',
                                        border: 'none',
                                        background: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Все товары
                                    <span className="ms-2 small opacity-75">
                                        ({getCategoryCount('all')})
                                    </span>
                                </button>
                            </div>

                            {categories.map(category => (
                                <div key={category.id} className="mb-3">
                                    <button
                                        className={`btn btn-link p-0 text-start text-decoration-none ${selectedCategory === category.name ? 'text-dark fw-normal' : 'text-muted'}`}
                                        onClick={() => handleCategoryClick(category.id, category.name)}
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
                                            ({getCategoryCount(category.name)})
                                        </span>
                                    </button>

                                    {category.subcategories && category.subcategories.length > 0 && openCategoryId === category.id && (
                                        <div className="ms-3 mt-2">
                                            {category.subcategories
                                                .filter(sub => getCategoryCount(sub.name) > 0)
                                                .map(sub => (
                                                    <button
                                                        key={sub.id}
                                                        className={`btn btn-link p-0 d-block text-start text-decoration-none small ${selectedCategory === sub.name ? 'text-dark' : 'text-muted'}`}
                                                        onClick={() => handleSubcategoryClick(sub.name)}
                                                        style={{
                                                            fontSize: '0.85rem',
                                                            border: 'none',
                                                            background: 'none',
                                                            cursor: 'pointer'
                                                        }}
                                                    >
                                                        {sub.name}
                                                        <span className="ms-2 opacity-75">
                                                            ({getCategoryCount(sub.name)})
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

                <div className="col-lg-9 col-xl-10 px-4 px-md-5 pb-5">
                    {filteredProducts.filter(p => p.availableQuantity > 0).length === 0 && (
                        <div className="text-center py-5">
                            <div className="mb-4" style={{ fontSize: '3rem', opacity: 0.1 }}>🛍️</div>
                            <h3 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Товары не найдены
                            </h3>
                            <p className="text-muted mb-4">
                                В категории "{selectedCategory}" пока нет товаров в наличии
                            </p>
                            <button
                                className="btn btn-outline-dark rounded-0 px-4 py-2"
                                onClick={() => setSelectedCategory('all')}
                            >
                                Показать все товары
                            </button>
                        </div>
                    )}

                    {filteredProducts.length > 0 && (
                        <>
                            <div className="mb-4 pb-3 border-bottom">
                                <div className="d-flex justify-content-between align-items-center">
                                    <h2 className="h5 fw-light mb-0"
                                        style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                        {selectedCategory === 'all' ? 'Все товары' : selectedCategory}
                                    </h2>
                                    <span className="small text-muted">
                                        {filteredProducts.filter(p => p.availableQuantity > 0).length} товаров
                                    </span>
                                </div>
                            </div>

                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                {filteredProducts
                                    .filter(product => product.availableQuantity > 0)
                                    .map((product) => (
                                        <div className="col" key={product.id}>
                                            <ProductCard product={product} />
                                        </div>
                                    ))}
                            </div>
                        </>
                    )}

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