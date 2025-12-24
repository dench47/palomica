import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {productService} from '../services/api';
import type {Product} from '../services/api';
import ProductCard from '../components/ProductCard'; // Для рекомендаций

// Тип для варианта товара (размер + цвет)
interface ProductVariant {
    size?: string;
    color?: string;
    sku?: string; // Артикул, если нужен
}

// Расширенный тип для товара в корзине с вариантами
interface CartProduct extends Product {
    selectedVariant?: ProductVariant;
    quantity: number;
}

const ProductPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {addToCart} = useCart();

    const [product, setProduct] = useState<CartProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant>({});
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    useEffect(() => {
        if (id) {
            loadProduct();
            loadRelatedProducts();
        }
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const productId = parseInt(id!);
            const data = await productService.getProductById(productId);

            if (data) {
                // Преобразуем Product в CartProduct
                const cartProduct: CartProduct = {
                    ...data,
                    quantity: 1,
                    selectedVariant: {}
                };
                setProduct(cartProduct);

                // Если есть размеры, выбираем первый по умолчанию
                if (data.size) {
                    const sizes = data.size.split(',');
                    if (sizes.length > 0) {
                        setSelectedVariant(prev => ({
                            ...prev,
                            size: sizes[0].trim()
                        }));
                    }
                }

                // Если есть цвета, выбираем первый по умолчанию
                if (data.color) {
                    const colors = data.color.split(',');
                    if (colors.length > 0) {
                        setSelectedVariant(prev => ({
                            ...prev,
                            color: colors[0].trim()
                        }));
                    }
                }
            } else {
                setError('Товар не найден');
            }
        } catch (err) {
            setError('Ошибка при загрузке товара');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedProducts = async () => {
        try {
            const data = await productService.getAllProducts();
            // Фильтруем товары той же категории (здесь просто берём 4 случайных)
            const shuffled = [...data].sort(() => 0.5 - Math.random());
            setRelatedProducts(shuffled.slice(0, 4));
        } catch (err) {
            console.error('Ошибка загрузки похожих товаров:', err);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            // Добавляем quantity раз
            for (let i = 0; i < quantity; i++) {
                addToCart(product, selectedVariant);
            }

            // Красивое сообщение
            let variantText = '';
            if (selectedVariant.size) variantText += `размер: ${selectedVariant.size}`;
            if (selectedVariant.color) {
                if (variantText) variantText += ', ';
                variantText += `цвет: ${selectedVariant.color}`;
            }

            alert(`Товар "${product.name}" ${variantText ? `(${variantText})` : ''} добавлен в корзину (${quantity} шт.)!`);

            // Сброс количества
            setQuantity(1);
        }
    };
    ;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Функции для выбора вариантов
    const handleSizeSelect = (size: string) => {
        setSelectedVariant(prev => ({...prev, size}));
    };

    const handleColorSelect = (color: string) => {
        setSelectedVariant(prev => ({...prev, color}));
    };

    if (loading) {
        return (
            <div
                className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100">
                    <div className="mb-4" style={{fontSize: '3rem', opacity: 0.1}}>⏳</div>
                    <h2 className="fw-light mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                        Загружаем товар
                    </h2>
                    <div className="spinner-border text-dark" role="status" style={{width: '3rem', height: '3rem'}}>
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div
                className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
                <div className="text-center w-100" style={{maxWidth: '500px'}}>
                    <div className="mb-4" style={{fontSize: '4rem'}}>❌</div>
                    <h2 className="fw-light mb-3" style={{fontFamily: "'Playfair Display', serif"}}>
                        {error || 'Товар не найден'}
                    </h2>
                    <button
                        className="btn btn-outline-dark rounded-0 px-5 py-3 fw-light"
                        onClick={() => navigate('/')}
                        style={{letterSpacing: '0.1em', fontSize: '0.9rem'}}
                    >
                        ← ВЕРНУТЬСЯ В МАГАЗИН
                    </button>
                </div>
            </div>
        );
    }

    // Подготовка данных
    const allImages = [
        product.imageUrl,
        ...(product.additionalImages || [])
    ].filter(Boolean);

    const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];
    const colors = product.color ? product.color.split(',').map(c => c.trim()) : [];

    return (
        <div className="container-fluid px-0">
            {/* Хлебные крошки в минималистичном стиле */}
            <div className="px-4 px-md-5 pt-4">
                <nav aria-label="Навигация" className="d-none d-md-block">
                    <div className="d-flex align-items-center small text-muted">
                        <button
                            className="btn btn-link p-0 text-dark text-decoration-none me-2"
                            onClick={() => navigate('/')}
                            style={{fontSize: '0.85rem'}}
                        >
                            ГЛАВНАЯ
                        </button>
                        <span className="mx-2">/</span>
                        <span className="opacity-50">{product.name}</span>
                    </div>
                </nav>
            </div>

            <div className="row g-0">
                {/* Галерея - левая колонка */}
                <div className="col-lg-6">
                    <div className="px-4 px-md-5 py-5">
                        {/* Главное изображение */}
                        <div className="main-image mb-4">
                            <div
                                className="w-100 bg-light"
                                style={{
                                    backgroundImage: `url(${allImages[selectedImage]})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    paddingBottom: '400px', // Квадратное соотношение
                                    cursor: 'zoom-in'
                                }}
                            ></div>
                        </div>

                        {/* Миниатюры */}
                        {allImages.length > 1 && (
                            <div className="d-flex gap-3 overflow-auto pb-2">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`flex-shrink-0 border-0 bg-transparent p-0 ${selectedImage === index ? 'opacity-100' : 'opacity-50'}`}
                                        onClick={() => setSelectedImage(index)}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    >
                                        <div
                                            className="w-100 h-100"
                                            style={{
                                                backgroundImage: `url(${img})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        ></div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Информация о товаре - правая колонка */}
                <div className="col-lg-6 bg-light">
                    <div className="px-4 px-md-5 py-5 h-100">
                        <div className="d-flex flex-column h-100">
                            {/* Заголовок и цена */}
                            <div className="mb-4">
                                <h1 className="fw-light mb-3" style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '2rem',
                                    lineHeight: '1.2'
                                }}>
                                    {product.name}
                                </h1>
                                <div className="d-flex align-items-center">
                                    <span className="fs-3 fw-light" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                        {formatPrice(product.price)}
                                    </span>
                                    {product.price > 10000 && (
                                        <span className="ms-3 small text-muted">(бесплатная доставка)</span>
                                    )}
                                </div>
                            </div>

                            {/* Описание */}
                            <div className="mb-5">
                                <p className="text-muted mb-4" style={{lineHeight: '1.6'}}>
                                    {product.description}
                                </p>

                                {/* Детали */}
                                <div className="row small text-muted">
                                    {product.material && (
                                        <div className="col-6 mb-2">
                                            <span className="d-block opacity-75">Материал</span>
                                            <span className="d-block">{product.material}</span>
                                        </div>
                                    )}
                                    {product.careInstructions && (
                                        <div className="col-6 mb-2">
                                            <span className="d-block opacity-75">Уход</span>
                                            <span className="d-block">{product.careInstructions}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ВАЖНО: Выбор размера (только если размеры есть) */}
                            {sizes.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="h6 fw-light mb-3"
                                        style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                        Размер
                                    </h3>
                                    <div className="d-flex flex-wrap gap-2">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                className={`btn ${selectedVariant.size === size ? 'btn-dark rounded-0 border-1' : 'btn-outline-dark rounded-0 border-1'}`}
                                                onClick={() => handleSizeSelect(size)}
                                                style={{
                                                    padding: '0.5rem 1.5rem',
                                                    fontSize: '0.85rem',
                                                    letterSpacing: '0.05em'
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ВАЖНО: Выбор цвета (только если цвета есть) */}
                            {colors.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="h6 fw-light mb-3"
                                        style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                        Цвет
                                    </h3>
                                    <div className="d-flex flex-wrap gap-2">
                                        {colors.map(color => (
                                            <button
                                                key={color}
                                                className={`btn ${selectedVariant.color === color ? 'btn-dark rounded-0 border-1' : 'btn-outline-dark rounded-0 border-1'}`}
                                                onClick={() => handleColorSelect(color)}
                                                style={{
                                                    padding: '0.5rem 1.5rem',
                                                    fontSize: '0.85rem',
                                                    letterSpacing: '0.05em'
                                                }}
                                            >
                                                {color}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Выбор количества */}
                            <div className="mb-5">
                                <h3 className="h6 fw-light mb-3" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                    Количество
                                </h3>
                                <span className="small text-muted">
            В наличии: <strong>10+ шт.</strong> {/* Пока заглушка */}
        </span>
                                <div className="d-flex align-items-center" style={{maxWidth: '150px'}}>
                                    <button
                                        className="btn btn-outline-dark rounded-0 border-1 px-3 py-2"
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                    >
                                        –
                                    </button>
                                    <span className="flex-grow-1 text-center px-3">{quantity}</span>
                                    <button
                                        className="btn btn-outline-dark rounded-0 border-1 px-3 py-2"
                                        onClick={() => setQuantity(prev => prev + 1)}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>

                            {/* Кнопка добавления */}
                            <div className="mt-auto pt-4">
                                <button
                                    className="btn btn-dark rounded-0 w-100 py-3 fw-light mb-3"
                                    onClick={handleAddToCart}
                                    disabled={!product}
                                    style={{
                                        letterSpacing: '0.1em',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => {
                                        e.currentTarget.style.backgroundColor = '#000';
                                    }}
                                    onMouseOut={(e) => {
                                        e.currentTarget.style.backgroundColor = '';
                                    }}
                                >
                                    ДОБАВИТЬ В КОРЗИНУ
                                </button>

                                <button
                                    className="btn btn-outline-dark rounded-0 w-100 py-3 fw-light"
                                    onClick={() => navigate('/')}
                                    style={{
                                        letterSpacing: '0.1em',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    ← ПРОДОЛЖИТЬ ПОКУПКИ
                                </button>
                            </div>

                            {/* Гарантии */}
                            <div className="mt-5 pt-4 border-top">
                                <div className="row g-0 text-center small text-muted">
                                    <div className="col-4 border-end">
                                        <div className="mb-2">🚚</div>
                                        <div>Бесплатная доставка</div>
                                    </div>
                                    <div className="col-4 border-end">
                                        <div className="mb-2">↩️</div>
                                        <div>Возврат 14 дней</div>
                                    </div>
                                    <div className="col-4">
                                        <div className="mb-2">🛡️</div>
                                        <div>Гарантия качества</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Рекомендации */}
            {relatedProducts.length > 0 && (
                <div className="px-4 px-md-5 py-5">
                    <h3 className="fw-light text-center mb-5" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.5rem',
                        letterSpacing: '0.05em'
                    }}>
                        Похожие товары
                    </h3>

                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                        {relatedProducts.map((product) => (
                            <div className="col" key={product.id}>
                                <ProductCard product={product}/>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductPage;