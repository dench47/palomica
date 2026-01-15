import {useState, useEffect} from 'react';
import {useParams, useNavigate} from 'react-router-dom';
import {useCart} from '../context/CartContext';
import {productService} from '../services/api';
import type {Product} from '../services/api';
import ProductCard from '../components/ProductCard';
import {Package, Ruler, Palette, Check} from 'lucide-react';
import toast from 'react-hot-toast';

interface CartProduct extends Product {
    selectedVariant?: {
        size?: string;
        color?: string;
    };
    quantity: number;
}

const ProductPage = () => {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {addToCart, isProductAvailable, getRemainingQuantity, getCartQuantityForProductAndSize} = useCart();

    const [product, setProduct] = useState<CartProduct | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>('');
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

    // Получить список доступных размеров
    const getAvailableSizes = (): string[] => {
        if (!product) return [];

        if (product.getSizes) {
            return product.getSizes();
        }

        // Fallback: фильтруем размеры, где есть товар в наличии
        return product.variants
            ?.filter(v => v.actuallyAvailable > 0)
            .map(v => v.size) || [];
    };

    // Автоматически выбираем размер если он один
    useEffect(() => {
        if (product) {
            const availableSizes = getAvailableSizes();
            if (availableSizes.length === 1 && !selectedSize) {
                setSelectedSize(availableSizes[0]);
            }
        }
    }, [product, selectedSize]);

    // Проверка, есть ли выбранный размер в корзине
    const isCurrentSizeInCart = (): boolean => {
        if (!product || !selectedSize) return false;
        return getCartQuantityForProductAndSize(product.id, selectedSize) > 0;
    };

    // Получить количество выбранного размера в корзине
    const getCartQuantityForSelectedSize = (): number => {
        if (!product || !selectedSize) return 0;
        return getCartQuantityForProductAndSize(product.id, selectedSize);
    };

    // Проверка доступности для выбранного размера
    const isSizeAvailable = (): boolean => {
        if (!product || !selectedSize) return false;
        return isProductAvailable(product, { size: selectedSize });
    };

    // Получить оставшееся доступное количество для выбранного размера
    const getRemainingAvailableQuantity = (): number => {
        if (!product || !selectedSize) return 0;
        return getRemainingQuantity(product, { size: selectedSize });
    };

    // Проверка общего наличия товара (хотя бы один размер доступен)
    const isProductInStock = (): boolean => {
        if (!product) return false;
        const availableSizes = getAvailableSizes();
        return availableSizes.length > 0;
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
        if (product && selectedSize) {
            // Добавляем все выбранное количество сразу
            addToCart(product, { size: selectedSize }, quantity);
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
        setSelectedSize(size);
        // Сбрасываем количество при смене размера
        setQuantity(1);
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
                        className="btn-fs btn-fs-outline"
                        onClick={() => navigate('/')}
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

    const availableSizes = getAvailableSizes();
    const hasOnlyOneSize = availableSizes.length === 1;
    const totalPrice = product.price * quantity;
    const isAvailable = isSizeAvailable();
    const remainingQuantity = getRemainingAvailableQuantity();
    const cartQuantityForSelectedSize = getCartQuantityForSelectedSize();
    const isSelectedSizeInCart = isCurrentSizeInCart();

    return (
        <div className="container-fluid px-0" style={{backgroundColor: 'var(--cream-bg)'}}>
            <div className="px-4 px-md-5 pt-4">
                <nav aria-label="Навигация" className="d-none d-md-block">
                    <div className="d-flex align-items-center small" style={{color: 'var(--text-medium)'}}>
                        <button
                            className="btn-fs btn-fs-ghost p-0 me-2"
                            onClick={() => navigate('/')}
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

                                    {availableSizes.length > 0 && (
                                        <div className="col-12 col-sm-6 d-flex align-items-start">
                                            <Ruler size={18} className="me-2 flex-shrink-0" style={{
                                                color: 'var(--accent-brown)',
                                                marginTop: '2px'
                                            }}/>
                                            <div>
                                                <div className="small"
                                                     style={{opacity: 0.75, color: 'var(--text-medium)'}}>
                                                    {hasOnlyOneSize ? 'Размер' : 'Доступные размеры'}
                                                </div>
                                                <div style={{color: 'var(--text-dark)'}}>
                                                    {hasOnlyOneSize ? availableSizes[0] : availableSizes.join(', ')}
                                                </div>
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

                            {/* Выбор размера */}
                            {availableSizes.length > 0 && !hasOnlyOneSize && (
                                <div className="mb-4">
                                    <h3 className="h6 fw-light mb-3" style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        color: 'var(--text-dark)'
                                    }}>
                                        Выберите размер
                                    </h3>
                                    <div className="d-flex flex-wrap gap-2">
                                        {availableSizes.map(size => (
                                            <button
                                                key={size}
                                                className={`btn-fs btn-fs-size ${selectedSize === size ? 'active' : ''}`}
                                                onClick={() => handleSizeSelect(size)}
                                            >
                                                {size}
                                            </button>
                                        ))}
                                    </div>

                                    {selectedSize && (
                                        <div className="mt-2 small" style={{color: 'var(--text-medium)'}}>
                                            {isAvailable ? (
                                                <span style={{color: '#28a745'}}>✓ В наличии</span>
                                            ) : (
                                                <span style={{color: '#dc3545'}}>✗ Нет в наличии</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Если только один размер */}
                            {hasOnlyOneSize && selectedSize && (
                                <div className="mb-4">
                                    <h3 className="h6 fw-light mb-2" style={{
                                        fontFamily: "'Cormorant Garamond', serif",
                                        color: 'var(--text-dark)'
                                    }}>
                                        Размер
                                    </h3>
                                    <div className="d-flex flex-wrap gap-2 align-items-center">
                                        <span className="border px-3 py-2" style={{
                                            fontSize: '0.85rem',
                                            letterSpacing: '0.05em',
                                            borderColor: 'var(--accent-brown)',
                                            color: 'var(--accent-brown)',
                                            borderRadius: '6px'
                                        }}>
                                            {selectedSize}
                                        </span>
                                        <span className="small" style={{
                                            color: isAvailable ? '#28a745' : '#dc3545',
                                            marginLeft: '10px'
                                        }}>
                                            {isAvailable ? '✓ В наличии' : '✗ Нет в наличии'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {/* Товар в корзине */}
                            {isSelectedSizeInCart && (
                                <div className="mb-4">
                                    <div className="px-4 py-3 d-inline-block" style={{
                                        backgroundColor: 'rgba(254, 114, 44, 0.1)',
                                        color: 'var(--accent-brown)',
                                        fontSize: '0.9rem',
                                        letterSpacing: '0.05em',
                                        fontFamily: "'Cormorant Garamond', serif",
                                        border: '1px solid rgba(254, 114, 44, 0.2)',
                                        borderRadius: '8px'
                                    }}>
                                        <div className="d-flex align-items-center">
                                            <span className="me-3">✓</span>
                                            <span>Товар в корзине</span>
                                            <span className="ms-3 fw-bold">{cartQuantityForSelectedSize} шт.</span>
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

                                    {selectedSize ? (
                                        <span className="small" style={{color: 'var(--text-medium)'}}>
                                            Размер <strong style={{color: 'var(--accent-brown)'}}>{selectedSize}</strong>
                                            {' '}
                                            {isAvailable ? (
                                                <span style={{color: '#28a745'}}>✓ В наличии</span>
                                            ) : (
                                                <span style={{color: '#dc3545'}}>✗ Нет в наличии</span>
                                            )}
                                        </span>
                                    ) : (
                                        <span className="small" style={{color: 'var(--text-medium)'}}>
                                            {isProductInStock() ? (
                                                <span style={{color: '#28a745'}}>✓ Товар в наличии</span>
                                            ) : (
                                                <span style={{color: '#dc3545'}}>✗ Товар закончился</span>
                                            )}
                                        </span>
                                    )}
                                </div>

                                <div className="d-flex align-items-center justify-content-between">
                                    <div className="d-flex align-items-center" style={{maxWidth: '150px'}}>
                                        <button
                                            className="btn-fs btn-fs-outline btn-fs-sm"
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            style={{
                                                opacity: quantity === 1 ? 0.5 : 1,
                                                minWidth: '40px',
                                                padding: '8px'
                                            }}
                                            disabled={!selectedSize && availableSizes.length > 0}
                                        >
                                            –
                                        </button>
                                        <span className="flex-grow-1 text-center px-3" style={{
                                            minWidth: '40px',
                                            color: 'var(--text-dark)',
                                            fontSize: '1.1rem',
                                            fontWeight: '500'
                                        }}>
                                            {quantity}
                                        </span>

                                        {isAvailable && remainingQuantity > 0 ? (
                                            <button
                                                className="btn-fs btn-fs-outline btn-fs-sm"
                                                onClick={() => {
                                                    if (!selectedSize && availableSizes.length > 0) {
                                                        toast.error(
                                                            'Сначала выберите размер',
                                                            {
                                                                duration: 3000
                                                            }
                                                        );
                                                        return;
                                                    }

                                                    if (quantity < remainingQuantity) {
                                                        setQuantity(prev => prev + 1);
                                                    }
                                                }}
                                                style={{
                                                    opacity: quantity >= remainingQuantity ? 0.5 : 1,
                                                    minWidth: '40px',
                                                    padding: '8px'
                                                }}
                                                disabled={(!selectedSize && availableSizes.length > 0) || quantity >= remainingQuantity}
                                            >
                                                +
                                            </button>
                                        ) : (
                                            <button
                                                className="btn-fs btn-fs-outline btn-fs-sm"
                                                style={{
                                                    opacity: 0.5,
                                                    minWidth: '40px',
                                                    padding: '8px',
                                                    cursor: 'not-allowed'
                                                }}
                                                disabled
                                            >
                                                +
                                            </button>
                                        )}
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

                            {/* Самый простой вариант - обернуть все кнопки в div с классами */}
                            <div className="mt-auto pt-4 button-group">
                                {/* Основная кнопка */}
                                <button
                                    className="btn-fs btn-fs-primary btn-fs-lg btn-fs-block"
                                    onClick={handleAddToCart}
                                    disabled={!product || !selectedSize || !isAvailable || remainingQuantity === 0}
                                >
                                    {!selectedSize && availableSizes.length > 0 ? 'ВЫБЕРИТЕ РАЗМЕР' :
                                        !isAvailable ? 'НЕТ В НАЛИЧИИ' :
                                            remainingQuantity === 0 ? 'ДОСТИГНУТ ЛИМИТ' :
                                                (isSelectedSizeInCart ? 'ДОБАВИТЬ ЕЩЁ' : 'ДОБАВИТЬ В КОРЗИНУ')}
                                </button>

                                {/* Кнопка корзины */}
                                {isSelectedSizeInCart && (
                                    <button
                                        className="btn-fs btn-fs-outline btn-fs-lg btn-fs-block"
                                        onClick={() => navigate('/cart')}
                                    >
                                        ПЕРЕЙТИ В КОРЗИНУ
                                    </button>
                                )}

                                {/* Кнопка продолжения покупок */}
                                <button
                                    className="btn-fs btn-fs-outline btn-fs-lg btn-fs-block"
                                    onClick={() => navigate('/')}
                                >
                                    ← ПРОДОЛЖИТЬ ПОКУПКИ
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {relatedProducts.filter(p => {
                if (p.getTotalAvailableQuantity) {
                    return p.getTotalAvailableQuantity() > 0;
                }
                return (p.variants?.reduce((sum, v) => sum + v.availableQuantity, 0) || 0) > 0;
            }).length > 0 && (
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