import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productService } from '../services/api';
import type { Product } from '../services/api';

const ProductPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState<string>('');

    useEffect(() => {
        if (id) {
            loadProduct();
        }
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            const productId = parseInt(id!);
            const data = await productService.getProductById(productId);

            if (data) {
                setProduct(data);
                // Если есть размеры, выбираем первый по умолчанию
                if (data.size) {
                    const sizes = data.size.split(',');
                    if (sizes.length > 0) {
                        setSelectedSize(sizes[0].trim());
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

    const handleAddToCart = () => {
        if (product) {
            addToCart(product);
            alert(`Товар "${product.name}" добавлен в корзину!`);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return (
            <div className="container py-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger">
                    {error || 'Товар не найден'}
                </div>
                <button
                    className="btn btn-outline-dark"
                    onClick={() => navigate('/')}
                >
                    ← Вернуться в магазин
                </button>
            </div>
        );
    }

    // Подготовка изображений для галереи
    const allImages = [
        product.imageUrl,
        ...(product.additionalImages || [])
    ].filter(Boolean);

    // Подготовка размеров
    const sizes = product.size ? product.size.split(',').map(s => s.trim()) : [];

    return (
        <div className="container py-5">
            {/* Хлебные крошки */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <a
                            href="/"
                            onClick={(e) => {
                                e.preventDefault();
                                navigate('/');
                            }}
                            className="text-decoration-none"
                        >
                            Главная
                        </a>
                    </li>
                    <li className="breadcrumb-item active" aria-current="page">
                        {product.name}
                    </li>
                </ol>
            </nav>

            <div className="row">
                {/* Галерея изображений - левая колонка */}
                <div className="col-lg-6 mb-4">
                    <div className="product-gallery">
                        {/* Главное изображение */}
                        <div className="main-image mb-3">
                            <img
                                src={allImages[selectedImage]}
                                alt={product.name}
                                className="img-fluid rounded-3 shadow"
                                style={{
                                    width: '100%',
                                    height: '500px',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>

                        {/* Миниатюры */}
                        {allImages.length > 1 && (
                            <div className="thumbnails d-flex gap-2 flex-wrap">
                                {allImages.map((img, index) => (
                                    <button
                                        key={index}
                                        className={`btn p-0 border ${selectedImage === index ? 'border-primary border-2' : 'border-secondary'}`}
                                        onClick={() => setSelectedImage(index)}
                                        style={{
                                            width: '80px',
                                            height: '80px',
                                            borderRadius: '8px',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        <img
                                            src={img}
                                            alt={`${product.name} - вид ${index + 1}`}
                                            className="w-100 h-100"
                                            style={{ objectFit: 'cover' }}
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Информация о товаре - правая колонка */}
                <div className="col-lg-6">
                    <h1 className="h2 fw-bold mb-3">{product.name}</h1>

                    <div className="mb-4">
                        <span className="h3 fw-bold text-primary">
                            {formatPrice(product.price)}
                        </span>
                    </div>

                    <div className="mb-4">
                        <h3 className="h5 mb-2">Описание</h3>
                        <p className="text-muted">{product.description}</p>
                    </div>

                    {/* Характеристики */}
                    <div className="mb-4">
                        <h3 className="h5 mb-3">Характеристики</h3>
                        <div className="row">
                            {product.color && (
                                <div className="col-md-6 mb-2">
                                    <strong className="text-muted">Цвет:</strong>
                                    <span className="ms-2">{product.color}</span>
                                </div>
                            )}
                            {product.material && (
                                <div className="col-md-6 mb-2">
                                    <strong className="text-muted">Материал:</strong>
                                    <span className="ms-2">{product.material}</span>
                                </div>
                            )}
                            {product.size && (
                                <div className="col-md-6 mb-2">
                                    <strong className="text-muted">Доступные размеры:</strong>
                                    <span className="ms-2">{product.size}</span>
                                </div>
                            )}
                            {product.careInstructions && (
                                <div className="col-12 mb-2">
                                    <strong className="text-muted">Уход:</strong>
                                    <span className="ms-2">{product.careInstructions}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Выбор размера */}
                    {sizes.length > 0 && (
                        <div className="mb-4">
                            <h3 className="h5 mb-3">Выберите размер</h3>
                            <div className="d-flex flex-wrap gap-2">
                                {sizes.map(size => (
                                    <button
                                        key={size}
                                        className={`btn ${selectedSize === size ? 'btn-dark' : 'btn-outline-dark'}`}
                                        onClick={() => setSelectedSize(size)}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {selectedSize && (
                                <small className="text-muted mt-2 d-block">
                                    Выбран размер: <strong>{selectedSize}</strong>
                                </small>
                            )}
                        </div>
                    )}

                    {/* Кнопки действий */}
                    <div className="d-grid gap-3 mt-4">
                        <button
                            className="btn btn-dark btn-lg py-3"
                            onClick={handleAddToCart}
                            disabled={!product}
                        >
                            🛒 Добавить в корзину
                        </button>

                        <button
                            className="btn btn-outline-dark btn-lg py-3"
                            onClick={() => navigate('/')}
                        >
                            ← Продолжить покупки
                        </button>
                    </div>

                    {/* Гарантии */}
                    <div className="mt-5 pt-4 border-top">
                        <div className="row g-3">
                            <div className="col-md-4 text-center">
                                <div className="text-primary fs-4 mb-2">🚚</div>
                                <div className="small">Бесплатная доставка от 5000₽</div>
                            </div>
                            <div className="col-md-4 text-center">
                                <div className="text-primary fs-4 mb-2">↩️</div>
                                <div className="small">Возврат в течение 14 дней</div>
                            </div>
                            <div className="col-md-4 text-center">
                                <div className="text-primary fs-4 mb-2">🛡️</div>
                                <div className="small">Гарантия качества</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductPage;