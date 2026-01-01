import {useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import {productService} from '../services/api';
import type {Product} from '../services/api';

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

    // ОБНОВЛЕННЫЕ КАТЕГОРИИ (сувениры удалены)
    const categories: Category[] = [
        {id: 'все', name: 'Все товары'},
        {
            id: 'одежда',
            name: 'Одежда',
            subcategories: ['топы', 'футболки и лонгсливы', 'блузки и рубашки', 'жакеты', 'платья', 'сарафаны и фартуки', 'брюки', 'юбки']
        },
        {
            id: 'аксессуары',
            name: 'Аксессуары',
            subcategories: ['баски', 'манжеты', 'платки', 'пояса', 'съемные карманы']
        },
        {
            id: 'сумки',
            name: 'Сумки',
            subcategories: ['клатчи', 'поясные сумки', 'рюкзаки', 'шопперы']
        }
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

        const isMainCategory = categories.some(c => c.id === selectedCategory);
        const isSubcategory = Object.keys(subcategoryKeywords).includes(selectedCategory) ||
            categories.some(c => c.subcategories?.includes(selectedCategory));

        if (isMainCategory) {
            const filtered = products.filter(product =>
                product.category?.toLowerCase() === selectedCategory.toLowerCase()
            );
            setFilteredProducts(filtered);
        } else if (isSubcategory) {
            const keywords = subcategoryKeywords[selectedCategory] || [selectedCategory.toLowerCase()];
            const filtered = products.filter(product => {
                const name = product.name.toLowerCase();
                return keywords.some(keyword => name.includes(keyword));
            });
            setFilteredProducts(filtered);
        } else {
            setFilteredProducts(products);
        }
    };

    const subcategoryKeywords: Record<string, string[]> = {
        'топы': ['топ', 'топы', 'майка', 'безрукавка'],
        'футболки и лонгсливы': ['футболка', 'лонгслив', 'лонгс', 'тельняшка', 'тельник'],
        'блузки и рубашки': ['блузка', 'рубашка', 'блузки', 'рубашки', 'сорочка'],
        'жакеты': ['жакет', 'пиджак', 'костюм', 'кардиган', 'блейзер'],
        'платья': ['платье', 'платья', 'платьице'],
        'сарафаны и фартуки': ['сарафан', 'фартук', 'передник', 'юбка-сарафан'],
        'брюки': ['брюки', 'брюк', 'штаны', 'брюки-', 'шорты', 'бриджи'],
        'юбки': ['юбка', 'юбки', 'юбочка', 'миди', 'мини', 'макси'],

        'баски': ['баска', 'пеплум', 'пеплум-баска'],
        'манжеты': ['манжета', 'манжеты', 'нарукавник'],
        'платки': ['платок', 'платки', 'шарф', 'кашне', 'палантин', 'косынка'],
        'пояса': ['пояс', 'пояса', 'ремень', 'поясок'],
        'съемные карманы': ['карман', 'карманы', 'кармашек', 'кармашик'],

        'клатчи': ['клатч', 'клатчи', 'вечерняя сумка', 'мини-сумка'],
        'поясные сумки': ['поясная сумка', 'бананка', 'поясные', 'на пояс'],
        'рюкзаки': ['рюкзак', 'ранец', 'рюкзаки', 'заплечный'],
        'шопперы': ['шоппер', 'шопперы', 'холщовая сумка', 'эко-сумка', 'сумка-шоппер']
    };

    const getCategoryCount = (categoryId: string): number => {
        if (categoryId === 'все') return products.length;

        const isMainCategory = categories.some(c => c.id === categoryId);

        if (isMainCategory) {
            return products.filter(p =>
                p.category?.toLowerCase() === categoryId.toLowerCase()
            ).length;
        }

        const keywords = subcategoryKeywords[categoryId] || [categoryId.toLowerCase()];

        return products.filter(product => {
            const name = product.name.toLowerCase();
            return keywords.some(keyword => name.includes(keyword));
        }).length;
    };

    const handleCategoryClick = (categoryId: string) => {
        setSelectedCategory(categoryId);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    const handleSubcategoryClick = (subcategory: string) => {
        const keywords = subcategoryKeywords[subcategory] || [subcategory.toLowerCase()];

        const filtered = products.filter(product => {
            const name = product.name.toLowerCase();
            return keywords.some(keyword => name.includes(keyword));
        });

        setFilteredProducts(filtered);
        setSelectedCategory(subcategory);
        window.scrollTo({top: 0, behavior: 'smooth'});
    };

    if (loading) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="spinner-border text-dark" role="status" style={{width: '3rem', height: '3rem'}}>
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
                    <div className="mb-4" style={{fontSize: '3rem', opacity: 0.1}}>⚠️</div>
                    <h2 className="fw-light mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
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
                <div className="col-lg-3 col-xl-2 px-4 px-md-5 pb-5">
                    <div className="sticky-top" style={{top: '2rem'}}>
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

                <div className="col-lg-9 col-xl-10 px-4 px-md-5 pb-5">
                    {filteredProducts.length === 0 && !loading && (
                        <div className="text-center py-5">
                            <div className="mb-4" style={{fontSize: '3rem', opacity: 0.1}}>🛍️</div>
                            <h3 className="fw-light mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                                Товары не найдены
                            </h3>
                            <p className="text-muted mb-4">
                                В категории "{categories.find(c => c.id === selectedCategory)?.name || selectedCategory}"
                                пока нет товаров
                            </p>
                            <button
                                className="btn btn-outline-dark rounded-0 px-4 py-2"
                                onClick={() => setSelectedCategory('все')}
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
                                        style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                        {categories.find(c => c.id === selectedCategory)?.name || selectedCategory}
                                    </h2>
                                    <span className="small text-muted">
                                        {filteredProducts.length} {filteredProducts.length === 1 ? 'товар' :
                                        filteredProducts.length > 1 && filteredProducts.length < 5 ? 'товара' : 'товаров'}
                                    </span>
                                </div>
                            </div>

                            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                                {filteredProducts.map((product) => (
                                    <div className="col" key={product.id}>
                                        <ProductCard product={product}/>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="d-lg-none text-center mt-5">
                        <button
                            className="btn btn-outline-dark rounded-0 px-4 py-2"
                            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
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