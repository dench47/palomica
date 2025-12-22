import { useEffect, useState } from 'react';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import Footer from './components/Footer';
import { productService } from './services/api';
import type { Product } from './services/api';
import './App.css';

function App() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            setProducts(data);
        } catch (err) {
            setError('Ошибка при загрузке товаров');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="App">
            <Header />

            {/* Главный баннер */}
            <div className="bg-light py-5 mb-5">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h1 className="display-4 fw-bold mb-4">
                                Новая коллекция<br />
                                <span className="text-primary">Осень-Зима 2025</span>
                            </h1>
                            <p className="lead mb-4">
                                Эксклюзивные модели от российских дизайнеров.
                                Ограниченный тираж.
                            </p>
                            <button className="btn btn-dark btn-lg px-5">
                                Смотреть коллекцию
                            </button>
                        </div>
                        <div className="col-md-6">
                            <div
                                className="rounded-3 overflow-hidden shadow-lg"
                                style={{
                                    height: '400px',
                                    background: 'linear-gradient(45deg, #667eea 0%, #764ba2 100%)'
                                }}
                            >
                                <div className="h-100 d-flex align-items-center justify-content-center text-white">
                                    <h2 className="display-3">-30%</h2>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Сетка товаров */}
            <div className="container py-5">
                <div className="mb-5 text-center">
                    <h2 className="fw-bold mb-3">ПОПУЛЯРНЫЕ ТОВАРЫ</h2>
                    <p className="text-muted">Эксклюзивные модели из новой коллекции</p>
                </div>

                {loading && (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Загрузка...</span>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert alert-danger text-center">
                        {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 row-cols-xl-4 g-4">
                        {products.map((product) => (
                            <div className="col" key={product.id}>
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
}

export default App;