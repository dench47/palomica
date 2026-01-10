import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {productService} from '../services/api';
import type {Product} from '../services/api';
import ProductCard from '../components/ProductCard';
import {Package, Ruler, Palette, Check} from 'lucide-react';
import toast from "react-hot-toast";

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
        }
    }, [id]);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    useEffect(() => {
        if (product) {
            loadRelatedProducts();
        }
    }, [product]);

    const isProductInCart = (productId: number) => {
        return items.some(item => item.product.id === productId);
    };

    const isCurrentProductInCart = items.some(item => item.product.id === product?.id);

    const getCartQuantity = (productId: number) => {
        const item = items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    const getAvailableQuantity = (): number => {
        if (!product) return 0;
        return product.availableQuantity || 0;
    };

    const getRemainingToAdd = (): number => {
        if (!product) return 0;

        const baseQuantity = product.availableQuantity || 0;
        const cartItemsForThisProduct = items.filter(item =>
            item.product.id === product.id
        );
        const inCartQuantity = cartItemsForThisProduct.reduce((sum, item) => sum + item.quantity, 0);

        return Math.max(0, baseQuantity - inCartQuantity);
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
            console.error('Error loading product:', err);
        } finally {
            setLoading(false);
        }
    };

    const loadRelatedProducts = async () => {
        try {
            const data = await productService.getAllProducts();

            if (!product || !product.subcategory) {
                setRelatedProducts([]);
                return;
            }

            // Фильтруем товары из той же подкатегории
            const sameSubcategoryProducts = data.filter(p =>
                p.id !== product.id &&
                p.subcategory &&
                p.subcategory === product.subcategory
            );

            if (sameSubcategoryProducts.length < 1) {
                setRelatedProducts([]);
                return;
            }

            const shuffled = [...sameSubcategoryProducts]
                .sort(() => 0.5 - Math.random())
                .slice(0, 4);

            setRelatedProducts(shuffled);
        } catch (err) {
            console.error('Ошибка загрузки похожих товаров:', err);
            setRelatedProducts([]);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            const remainingToAdd = getRemainingToAdd();

            if (remainingToAdd === 0) {
                toast.error(
                    <div className="d-flex align-items-center">
                        <span className="me-2" style={{color: '#dc3545'}}>😔</span>
                        <span style={{fontFamily: "'Cormorant Garamond', serif"}}>
                            <strong>"{product.name}"</strong> закончился на складе
                        </span>
                    </div>,
                    {
                        duration: 4000,
                        style: {
                            background: '#f8f9fa',
                            border: '1px solid #dee2e6',
                            borderRadius: '0',
                            padding: '16px 20px',
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '1rem'
                        }
                    }
                );
                return;
            }

            const maxToAdd = Math.min(quantity, remainingToAdd);

            if (maxToAdd < quantity) {
                toast(
                    <div className="d-flex align-items-center">
                        <span className="me-2" style={{color: '#ffc107'}}>⚠️</span>
                        <span style={{fontFamily: "'Cormorant Garamond', serif"}}>
                            <strong>"{product.name}"</strong> доступно только {remainingToAdd} шт.
                        </span>
                    </div>,
                    {
                        duration: 4000,
                        style: {
                            background: '#fff3cd',
                            color: '#856404',
                            border: '1px solid #ffc107',
                            borderRadius: '0',
                            padding: '16px 20px',
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '1rem'
                        }
                    }
                );
            }

            for (let i = 0; i < maxToAdd; i++) {
                addToCart(product, selectedVariant);
            }

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

    if (loading) {
        return (
            <div
                className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center"
                style={{backgroundColor: 'var(--cream-bg)'}}>
                <div className="text-center w-100">
                    <div className="mb-4" style={{fontSize: '3rem', opacity: 0.1, color: 'var(--accent-brown)'}}>⏳</div>
                    <h2 className="fw-light mb-3"
                        style={{fontFamily: "'Playfair Display', serif", color: 'var(--text-dark)'}}>
                        Загружаем товар
                    </h2>
                    <div className="spinner-border" role="status" style={{
                        width: '3rem',
                        height: '3rem',
                        color: 'var(--accent-brown)'
                    }}>
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div
                className="container-fluid px-4 px-md-5 py-5 min-vh-50 d-flex align-items-center justify-content-center"
                style={{backgroundColor: 'var(--cream-bg)'}}>
                <div className="text-center w-100" style={{maxWidth: '500px'}}>
                    <div className="mb-4" style={{fontSize: '4rem', color: 'var(--accent-brown)', opacity: 0.7}}>❌</div>
                    <h2 className="fw-light mb-3"
                        style={{fontFamily: "'Playfair Display', serif", color: 'var(--text-dark)'}}>
                        {error || 'Товар не найден'}
                    </h2>
                    <button
                        className="btn btn-outline-dark rounded-0 px-5 py-3 fw-light"
                        onClick={() => navigate('/')}
                        style={{
                            letterSpacing: '0.1em',
                            fontSize: '0.9rem',
                            borderColor: 'var(--text-dark)',
                            color: 'var(--text-dark)'
                        }}
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
    const totalPrice = product.price * quantity;
    const isInCart = isProductInCart(product.id);
    const cartQuantity = getCartQuantity(product.id);

    return (
        <div className="container-fluid px-0" style={{backgroundColor: 'var(--cream-bg)'}}>
            <div className="px-4 px-md-5 pt-4">
                <nav aria-label="Навигация" className="d-none d-md-block">
                    <div className="d-flex align-items-center small" style={{color: 'var(--text-medium)'}}>
                        <button
                            className="btn btn-link p-0 text-decoration-none me-2"
                            onClick={() => navigate('/')}
                            style={{
                                fontSize: '0.85rem',
                                color: 'var(--text-dark)'
                            }}
                        >
                            ГЛАВНАЯ
                        </button>
                        <span className="mx-2">/</span>
                        <span style={{opacity: 0.6, color: 'var(--text-medium)'}}>{product.name}</span>
                    </div>
                </nav>
            </div>

            <div className="row g-0">
                <div className="col-lg-6">
                    <div className="px-4 px-md-5 py-5">
                        <div className="main-image mb-4">
                            <div
                                className="w-100"
                                style={{
                                    backgroundColor: 'var(--cream-light)',
                                    backgroundImage: `url(${allImages[selectedImage]})`,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center',
                                    paddingBottom: '400px',
                                    cursor: 'zoom-in',
                                    border: '1px solid var(--cream-dark)'
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
                                                backgroundPosition: 'center',
                                                border: '1px solid var(--cream-dark)'
                                            }}
                                        ></div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="col-lg-6 bg-cream-light" style={{
                    borderLeft: '1px solid var(--cream-dark)',
                    boxShadow: 'inset 1px 0 0 rgba(0,0,0,0.03)'
                }}>
                    <div className="px-4 px-md-5 py-5 h-100">
                        <div className="d-flex flex-column h-100">
                            <div className="mb-4">
                                <h1 className="fw-light mb-3" style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontSize: '2rem',
                                    lineHeight: '1.2',
                                    color: 'var(--text-dark)'
                                }}>
                                    {product.name}
                                </h1>
                                <div className="d-flex align-items-center">
                                    <span className="fs-3 fw-light" style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        color: 'var(--accent-brown)'
                                    }}>
                                        {formatPrice(product.price)}
                                    </span>

                                </div>
                            </div>

                            <div className="mb-5">
                                <p className="mb-4" style={{
                                    lineHeight: '1.6',
                                    color: 'var(--text-medium)'
                                }}>
                                    {product.description}
                                </p>

                                <div className="row g-3 mb-4">
                                    {product.material && (
                                        <div className="col-12 col-sm-6 d-flex align-items-start">
                                            <Package size={18} className="me-2 flex-shrink-0" style={{
                                                color: 'var(--accent-brown)',
                                                marginTop: '2px'
                                            }}/>
                                            <div>
                                                <div className="small"
                                                     style={{opacity: 0.75, color: 'var(--text-medium)'}}>Материал
                                                </div>
                                                <div style={{color: 'var(--text-dark)'}}>{product.material}</div>
                                            </div>
                                        </div>
                                    )}

                                    {product.size && (
                                        <div className="col-12 col-sm-6 d-flex align-items-start">
                                            <Ruler size={18} className="me-2 flex-shrink-0" style={{
                                                color: 'var(--accent-brown)',
                                                marginTop: '2px'
                                            }}/>
                                            <div>
                                                <div className="small"
                                                     style={{opacity: 0.75, color: 'var(--text-medium)'}}>Размеры
                                                </div>
                                                <div style={{color: 'var(--text-dark)'}}>{product.size}</div>
                                            </div>
                                        </div>
                                    )}

                                    {product.color && (
                                        <div className="col-12 col-sm-6 d-flex align-items-start">
                                            <Palette size={18} className="me-2 flex-shrink-0" style={{
                                                color: 'var(--accent-brown)',
                                                marginTop: '2px'
                                            }}/>
                                            <div>
                                                <div className="small"
                                                     style={{opacity: 0.75, color: 'var(--text-medium)'}}>Цвет
                                                </div>
                                                <div style={{color: 'var(--text-dark)'}}>{product.color}</div>
                                            </div>
                                        </div>
                                    )}

                                    {product.careInstructions && (
                                        <div className="col-12 col-sm-6 d-flex align-items-start">
                                            <Check size={18} className="me-2 flex-shrink-0" style={{
                                                color: 'var(--accent-brown)',
                                                marginTop: '2px'
                                            }}/>
                                            <div>
                                                <div className="small"
                                                     style={{opacity: 0.75, color: 'var(--text-medium)'}}>Уход
                                                </div>
                                                <div
                                                    style={{color: 'var(--text-dark)'}}>{product.careInstructions}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {sizes.length > 0 && (
                                <div className="mb-4">
                                    <h3 className="h6 fw-light mb-3" style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        color: 'var(--text-dark)'
                                    }}>
                                        Размер
                                    </h3>
                                    <div className="d-flex flex-wrap gap-2">
                                        {sizes.map(size => (
                                            <button
                                                key={size}
                                                className={`btn ${selectedVariant.size === size ? '' : 'btn-outline-dark'} rounded-0 border-1`}
                                                onClick={() => handleSizeSelect(size)}
                                                style={{
                                                    padding: '0.5rem 1.5rem',
                                                    fontSize: '0.85rem',
                                                    letterSpacing: '0.05em',
                                                    backgroundColor: selectedVariant.size === size ? 'var(--text-dark)' : 'transparent',
                                                    borderColor: 'var(--text-dark)',
                                                    color: selectedVariant.size === size ? 'var(--cream-light)' : 'var(--text-dark)'
                                                }}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {isInCart && (
                                <div className="mb-4">
                                    <div className="px-4 py-3 rounded-0 d-inline-block" style={{
                                        backgroundColor: 'var(--accent-brown)',
                                        color: 'white',
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.05em',
                                        fontFamily: "'Cormorant Garamond', serif",
                                        opacity: 0.95,
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        border: '1px solid var(--accent-brown-light)'
                                    }}>
                                        <div className="d-flex align-items-center">
                                            <span className="me-3">✓</span>
                                            <span>Товар в корзине</span>
                                            <span className="ms-3 fw-bold">{cartQuantity} шт.</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="mb-5">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <h3 className="h6 fw-light mb-0" style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        color: 'var(--text-dark)'
                                    }}>
                                        Количество
                                    </h3>

                                    <span className="small" style={{color: 'var(--text-medium)'}}>
                                        В наличии: <strong style={{color: 'var(--text-dark)'}}>{getAvailableQuantity()} шт.</strong>
                                        {getCartQuantity(product.id) > 0 && (
                                            <span style={{marginLeft: '8px', color: 'var(--accent-brown)'}}>
                                                (в корзине: {getCartQuantity(product.id)} шт.)
                                            </span>
                                        )}
                                    </span>
                                </div>

                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center" style={{maxWidth: '150px'}}>
                                        <button
                                            className="btn btn-outline-dark rounded-0 border-1 px-3 py-2"
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            style={{
                                                borderColor: 'var(--text-dark)',
                                                color: 'var(--text-dark)'
                                            }}
                                        >
                                            –
                                        </button>
                                        <span className="flex-grow-1 text-center px-3" style={{
                                            minWidth: '40px',
                                            color: 'var(--text-dark)'
                                        }}>
                                            {quantity}
                                        </span>

                                        <button
                                            className="btn btn-outline-dark rounded-0 border-1 px-3 py-2"
                                            onClick={() => {
                                                const remainingToAdd = getRemainingToAdd();
                                                const currentInCart = getCartQuantity(product.id);

                                                if (currentInCart + quantity + 1 <= getAvailableQuantity()) {
                                                    setQuantity(prev => prev + 1);
                                                } else {
                                                    toast(
                                                        <div className="d-flex align-items-center">
                                                            <span className="me-2" style={{ color: '#ffc107' }}>⚠️</span>
                                                            <span style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                                                                <strong>"{product.name}"</strong> доступно только {remainingToAdd} шт.
                                                            </span>
                                                        </div>,
                                                        {
                                                            duration: 3000,
                                                            position: 'bottom-right',
                                                            style: {
                                                                background: '#fff3cd',
                                                                color: '#856404',
                                                                border: '1px solid #ffc107',
                                                                borderRadius: '0',
                                                                padding: '12px 16px'
                                                            }
                                                        }
                                                    );
                                                }
                                            }}
                                            style={{
                                                borderColor: 'var(--text-dark)',
                                                color: 'var(--text-dark)'
                                            }}
                                        >
                                            +
                                        </button>
                                    </div>

                                    <div className="text-end">
                                        <div className="small mb-1" style={{color: 'var(--text-medium)'}}>Сумма:</div>
                                        <div className="fs-5" style={{
                                            fontFamily: "'Cormorant Garamond', serif",
                                            color: 'var(--accent-brown)'
                                        }}>
                                            {formatPrice(totalPrice)}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-auto pt-4">
                                <button
                                    className="btn rounded-0 w-100 py-3 fw-light mb-3"
                                    onClick={handleAddToCart}
                                    disabled={!product || getRemainingToAdd() === 0}
                                    style={{
                                        letterSpacing: '0.1em',
                                        fontSize: '0.9rem',
                                        transition: 'all 0.3s ease',
                                        backgroundColor: getRemainingToAdd() === 0 ? 'var(--text-medium)' : 'var(--text-dark)',
                                        color: 'var(--cream-light)',
                                        border: `1px solid ${getRemainingToAdd() === 0 ? 'var(--text-medium)' : 'var(--text-dark)'}`,
                                        cursor: getRemainingToAdd() === 0 ? 'not-allowed' : 'pointer'
                                    }}
                                    onMouseOver={(e) => {
                                        if (getRemainingToAdd() > 0) {
                                            e.currentTarget.style.backgroundColor = 'var(--accent-brown)';
                                            e.currentTarget.style.borderColor = 'var(--accent-brown)';
                                        }
                                    }}
                                    onMouseOut={(e) => {
                                        if (getRemainingToAdd() > 0) {
                                            e.currentTarget.style.backgroundColor = 'var(--text-dark)';
                                            e.currentTarget.style.borderColor = 'var(--text-dark)';
                                        }
                                    }}
                                >
                                    {getRemainingToAdd() === 0 ? 'ТОВАР ЗАКОНЧИЛСЯ' : (isInCart ? 'ДОБАВИТЬ ЕЩЁ' : 'ДОБАВИТЬ В КОРЗИНУ')}
                                </button>

                                {isCurrentProductInCart && (
                                    <div style={{
                                        overflow: 'hidden',
                                        transition: 'all 0.3s ease',
                                        maxHeight: '60px',
                                        opacity: 1,
                                        marginBottom: '1rem'
                                    }}>
                                        <button
                                            className="btn rounded-0 w-100 py-3 fw-light"
                                            onClick={() => navigate('/cart')}
                                            style={{
                                                letterSpacing: '0.1em',
                                                fontSize: '0.85rem',
                                                transition: 'all 0.3s ease',
                                                backgroundColor: 'transparent',
                                                color: 'var(--text-dark)',
                                                border: '1px solid var(--text-dark)'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.backgroundColor = 'var(--accent-brown)';
                                                e.currentTarget.style.borderColor = 'var(--accent-brown)';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.borderColor = 'var(--text-dark)';
                                                e.currentTarget.style.color = 'var(--text-dark)';
                                            }}
                                        >
                                            ПЕРЕЙТИ В КОРЗИНУ
                                        </button>
                                    </div>
                                )}

                                <button
                                    className="btn btn-outline-dark rounded-0 w-100 py-3 fw-light"
                                    onClick={() => navigate('/')}
                                    style={{
                                        letterSpacing: '0.1em',
                                        fontSize: '0.85rem',
                                        borderColor: 'var(--text-dark)',
                                        color: 'var(--text-dark)'
                                    }}
                                >
                                    ← ПРОДОЛЖИТЬ ПОКУПКИ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {relatedProducts.filter(p => p.availableQuantity > 0).length > 0 && (
                <div className="px-4 px-md-5 py-5" style={{backgroundColor: 'var(--cream-bg)'}}>
                    <h3 className="fw-light text-center mb-5" style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: '1.5rem',
                        letterSpacing: '0.05em',
                        color: 'var(--text-dark)'
                    }}>
                        {product.subcategory
                            ? `Похожие товары: ${product.subcategory}`
                            : `Рекомендуем также: ${product.category}`}
                    </h3>

                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                        {relatedProducts
                            .filter(p => p.availableQuantity > 0)
                            .slice(0, 4)
                            .map((product) => (
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