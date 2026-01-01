import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {productService} from '../services/api';
import type {Product} from '../services/api';
import ProductCard from '../components/ProductCard';

interface ProductVariant {
    size?: string;
    color?: string;
    sku?: string;
}

interface CartProduct extends Product {
    selectedVariant?: ProductVariant;
    quantity: number;
}

const ProductPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {addToCart, items} = useCart();

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

    // Функция проверки, есть ли товар в корзине
    const isProductInCart = (productId: number) => {
        return items.some(item => item.product.id === productId);
    };

    // Функция получения количества товара в корзине
    const getCartQuantity = (productId: number) => {
        const item = items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    const loadProduct = async () => {
        try {
            setLoading(true);
            const productId = parseInt(id!);
            const data = await productService.getProductById(productId);

            if (data) {
                const cartProduct: CartProduct = {
                    ...data,
                    quantity: 1,
                    selectedVariant: {}
                };
                setProduct(cartProduct);

                if (data.size) {
                    const sizes = data.size.split(',');
                    if (sizes.length > 0) {
                        setSelectedVariant(prev => ({
                            ...prev,
                            size: sizes[0].trim()
                        }));
                    }
                }

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
            const shuffled = [...data].sort(() => 0.5 - Math.random());
            setRelatedProducts(shuffled.slice(0, 4));
        } catch (err) {
            console.error('Ошибка загрузки похожих товаров:', err);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            for (let i = 0; i < quantity; i++) {
                addToCart(product, selectedVariant);
            }

            let variantText = '';
            if (selectedVariant.size) variantText += `размер: ${selectedVariant.size}`;
            if (selectedVariant.color) {
                if (variantText) variantText += ', ';
                variantText += `цвет: ${selectedVariant.color}`;
            }

            alert(`Товар "${product.name}" ${variantText ? `(${variantText})` : ''} добавлен в корзину (${quantity} шт.)!`);
            setQuantity(1);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    };

    const handleSizeSelect = (size: string) => {
        setSelectedVariant(prev => ({...prev, size}));
    };

    const handleColorSelect = (color: string) => {
        setSelectedVariant(prev => ({...prev, color}));
    };

    if (loading) {
        return (
            <div className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
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
            <div className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center">
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

    const allImages = [
        product.imageUrl,
        ...(product.additionalImages || [])
    ].filter(Boolean);

    const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];
    const colors = product.color ? product.color.split(',').map(c => c.trim()) : [];
    const totalPrice = product.price * quantity;
    const isInCart = isProductInCart(product.id);
    const cartQuantity = getCartQuantity(product.id);

    return (
        <div className="container-fluid px-0">
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
                <div className="col-lg-6">
                    <div className="px-4 px-md-5 py-5">
                        <div className="main-image mb-4">
                            <div
                                className="w-100 bg-light"
                                style={{
                                    backgroundImage: `url(${allImages[selectedImage]})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    paddingBottom: '400px',
                                    cursor: 'zoom-in'
                                }}
                            ></div>
                        </div>

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

                <div className="col-lg-6 bg-light">
                    <div className="px-4 px-md-5 py-5 h-100">
                        <div className="d-flex flex-column h-100">
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

                            <div className="mb-5">
                                <p className="text-muted mb-4" style={{lineHeight: '1.6'}}>
                                    {product.description}
                                </p>

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

                            {/* НАДПИСЬ "ТОВАР В КОРЗИНЕ" НА СТРАНИЦЕ ТОВАРА */}
                            {isInCart && (
                                <div className="mb-4">
                                    <div className="bg-dark text-white px-4 py-3 rounded-0 d-inline-block"
                                         style={{
                                             fontSize: '0.9rem',
                                             letterSpacing: '0.05em',
                                             fontFamily: "'Cormorant Garamond', serif",
                                             opacity: 0.95,
                                             boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                                         }}>
                                        <div className="d-flex align-items-center">
                                            <span className="me-3">✓</span>
                                            <span>Товар в корзине</span>
                                            <span className="ms-3 fw-bold">{cartQuantity} шт.</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ОБНОВЛЕННЫЙ БЛОК С КОЛИЧЕСТВОМ */}
                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 className="h6 fw-light mb-0" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                        Количество
                                    </h3>
                                    <span className="small text-muted">
                                        В наличии: <strong>10+ шт.</strong>
                                    </span>
                                </div>

                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center" style={{maxWidth: '150px'}}>
                                        <button
                                            className="btn btn-outline-dark rounded-0 border-1 px-3 py-2"
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        >
                                            –
                                        </button>
                                        <span className="flex-grow-1 text-center px-3" style={{minWidth: '40px'}}>
                                            {quantity}
                                        </span>
                                        <button
                                            className="btn btn-outline-dark rounded-0 border-1 px-3 py-2"
                                            onClick={() => setQuantity(prev => prev + 1)}
                                        >
                                            +
                                        </button>
                                    </div>

                                    {/* ИТОГОВАЯ СУММА СПРАВА */}
                                    <div className="text-end">
                                        <div className="small text-muted mb-1">Сумма:</div>
                                        <div className="fs-5" style={{fontFamily: "'Cormorant Garamond', serif"}}>
                                            {formatPrice(totalPrice)}
                                        </div>
                                    </div>
                                </div>
                            </div>

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
                                    {isInCart ? 'ДОБАВИТЬ ЕЩЁ' : 'ДОБАВИТЬ В КОРЗИНУ'}
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
                        </div>
                    </div>
                </div>
            </div>

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