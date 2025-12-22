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

    const handleAddToCart = () => {
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
        <div className="card h-100 border-0 shadow-sm">
            <img
                src={product.imageUrl}
                className="card-img-top"
                alt={product.name}
                style={{ height: '300px', objectFit: 'cover' }}
            />
            <div className="card-body d-flex flex-column">
                <h5 className="card-title">{product.name}</h5>
                <p className="card-text text-muted flex-grow-1">{product.description}</p>
                <div className="d-flex justify-content-between align-items-center mt-auto">
                    <span className="h5 mb-0 fw-bold">{formatPrice(product.price)}</span>
                    <button
                        className="btn btn-outline-dark btn-sm"
                        onClick={handleAddToCart}
                    >
                        В корзину
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;