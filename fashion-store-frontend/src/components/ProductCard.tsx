import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
    product: {
        id: number;
        name: string;
        description: string;
        price: number;
        imageUrl: string;
    };
}

const ProductCard = ({ product }: ProductCardProps) => {
    const { addToCart } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
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
        <Link to={`/product/${product.id}`} className="text-decoration-none text-dark position-relative">
            <div className="card h-100 border-0 rounded-0 hover-scale">
                {/* Контейнер изображения с эффектом при наведении */}
                <div className="position-relative overflow-hidden" style={{ height: '400px' }}>
                    <img
                        src={product.imageUrl}
                        className="card-img-top w-100 h-100 object-fit-cover transition-transform"
                        alt={product.name}
                        style={{ transition: 'transform 0.5s ease' }}
                    />
                    {/* Затемнение при наведении */}
                    <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-0 hover-opacity-20"
                         style={{ transition: 'opacity 0.3s ease' }}></div>

                    {/* Кнопка "Быстрый просмотр" появляется при наведении */}
                    <div className="position-absolute bottom-0 start-0 w-100 p-3 text-center opacity-0 hover-opacity-100 translate-y-100 hover-translate-y-0"
                         style={{
                             transition: 'all 0.4s ease',
                             backgroundColor: 'rgba(255,255,255,0.95)'
                         }}>
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

                {/* Минималистичная текстовая информация */}
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
        </Link>
    );
};

export default ProductCard;