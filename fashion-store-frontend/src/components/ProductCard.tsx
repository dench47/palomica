import { useNavigate } from 'react-router-dom';
import type { Product } from '../services/api';

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const navigate = useNavigate();

    const handleCardClick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        navigate(`/product/${product.id}`);
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU', {
            style: 'currency',
            currency: 'RUB',
            minimumFractionDigits: 0
        }).format(price);
    };

    // Проверяем, есть ли товар в наличии
    const isInStock = () => {
        if (product.getTotalAvailableQuantity) {
            return product.getTotalAvailableQuantity() > 0;
        }
        return product.variants?.some(v => v.actuallyAvailable > 0) || false;
    };

    const inStock = isInStock();

    return (
        <div
            className="card h-100 border-0 rounded-0 hover-scale position-relative"
            onClick={handleCardClick}
            style={{
                cursor: 'pointer',
                backgroundColor: '#edf2f2',
                opacity: inStock ? 1 : 0.6,
                transition: 'opacity 0.3s ease'
            }}
        >
            {/* Изображение */}
            <div className="position-relative overflow-hidden" style={{ height: '400px' }}>
                <img
                    src={product.imageUrl}
                    className="card-img-top w-100 h-100 object-fit-cover transition-transform"
                    alt={product.name}
                    style={{
                        transition: 'transform 0.5s ease',
                        filter: inStock ? 'none' : 'grayscale(20%)'
                    }}
                />

                {/* Бейдж "Нет в наличии" */}
                {!inStock && (
                    <div className="position-absolute top-0 end-0 m-2">
                        <span className="badge bg-dark text-light rounded-0 px-2 py-1"
                              style={{ fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                            НЕТ В НАЛИЧИИ
                        </span>
                    </div>
                )}
            </div>

            {/* Информация */}
            <div className="card-body p-4 d-flex flex-column">
                <h5 className="card-title mb-2 fw-light"
                    style={{
                        fontSize: '1.1rem',
                        fontFamily: "'Cormorant Garamond', serif",
                        letterSpacing: '0.05em',
                        color: inStock ? 'inherit' : 'var(--text-medium)'
                    }}>
                    {product.name}
                </h5>
                <p className="card-text small flex-grow-1 mb-3"
                   style={{
                       fontSize: '0.85rem',
                       lineHeight: '1.4',
                       color: inStock ? 'var(--text-medium)' : 'var(--text-light)'
                   }}>
                    {product.description.length > 80
                        ? `${product.description.substring(0, 80)}...`
                        : product.description}
                </p>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="fw-light"
                          style={{
                              fontSize: '1rem',
                              fontFamily: "'Cormorant Garamond', serif",
                              color: inStock ? 'inherit' : 'var(--text-medium)'
                          }}>
                        {formatPrice(product.price)}
                    </span>
                    <span className="small text-uppercase"
                          style={{
                              letterSpacing: '0.1em',
                              color: inStock ? 'var(--text-medium)' : 'var(--text-light)'
                          }}>
                        Подробнее →
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;