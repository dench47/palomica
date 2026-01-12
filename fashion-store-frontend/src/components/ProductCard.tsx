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

    return (
        <div
            className="card h-100 border-0 rounded-0 hover-scale position-relative"
            onClick={handleCardClick}
            style={{ cursor: 'pointer', backgroundColor: '#edf2f2' }}
        >
            {/* Изображение */}
            <div className="position-relative overflow-hidden" style={{ height: '400px' }}>
                <img
                    src={product.imageUrl}
                    className="card-img-top w-100 h-100 object-fit-cover transition-transform"
                    alt={product.name}
                    style={{ transition: 'transform 0.5s ease' }}
                />
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