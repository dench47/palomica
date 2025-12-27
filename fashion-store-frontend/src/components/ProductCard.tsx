import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

// Импортируем тип Product из api.ts
import type { Product } from '../services/api';

interface ProductCardProps {
    product: Product; // Используем полный тип Product
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart } = useCart();
    const navigate = useNavigate();

    const handleCardClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/product/${product.id}`);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        addToCart(product);
        alert(`Товар "${product.name}" добавлен в корзину!`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    };

    return (
        <div
            className="card h-100 border-0 rounded-0 hover-scale position-relative"
            onClick={handleCardClick}
            style={{ cursor: 'pointer', backgroundColor: '#edf2f2' }} // Белый фон карточки
        >
            {/* Изображение */}
            <div className="position-relative overflow-hidden" style={{ height: '400px' }}>
                <img
                    src={product.imageUrl}
                    className="card-img-top w-100 h-100 object-fit-cover transition-transform"
                    alt={product.name}
                    style={{ transition: 'transform 0.5s ease' }}
                />

                {/* Кнопка корзины */}
                <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center opacity-0 hover-opacity-100 translate-y-100 hover-translate-y-0"
                     style={{
                         transition: 'all 0.4s ease',
                         backgroundColor: 'rgba(255,255,255,0.95)'
                     }}
                     onClick={(e) => e.stopPropagation()}
                >
                    <button
                        className="btn btn-outline-dark rounded-0 border-2 px-4 fw-light"
                        onClick={handleAddToCart}
                        style={{
                            letterSpacing: '0.1em',
                            fontSize: '0.85rem',
                            fontFamily: "'Cormorant Garamond', serif"
                        }}
                    >
                        ДОБАВИТЬ В КОРЗИНУ
                    </button>
                </div>
            </div>

            {/* Информация */}
            <div className="card-body p-4 d-flex flex-column">
                <h5 className="card-title mb-2 fw-light"
                    style={{
                        fontSize: '1.1rem',
                        fontFamily: "'Cormorant Garamond', serif",
                        letterSpacing: '0.05em'
                    }}>
                    {product.name}
                </h5>
                <p className="card-text text-muted small flex-grow-1 mb-3"
                   style={{
                       fontSize: '0.85rem',
                       lineHeight: '1.4'
                   }}>
                    {product.description.length > 80
                        ? `${product.description.substring(0, 80)}...`
                        : product.description}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fw-light"
                          style={{
                              fontSize: '1rem',
                              fontFamily: "'Cormorant Garamond', serif"
                          }}>
                        {formatPrice(product.price)}
                    </span>
                    <span className="small text-uppercase text-muted" style={{ letterSpacing: '0.1em' }}>
                        Подробнее →
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;