import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import CategoriesSection from '../components/CategoriesSection';
import FeaturesSection from '../components/FeaturesSection';
import { productService } from '../services/api';
import type { Product } from '../services/api';

const HomePage = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getAllProducts();
            setFeaturedProducts(data.slice(0, 4)); // Берем первые 4 товара
        } catch (err) {
            setError('Ошибка при загрузке товаров');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Главный слайдер */}
            <HeroSlider />

            {/* Категории товаров */}
            <CategoriesSection />

            {/* Популярные товары */}
            <section className="py-5">
                <div className="container">
                    <div className="mb-5 text-center">
                        <h2 className="fw-bold mb-3">ПОПУЛЯРНЫЕ ТОВАРЫ</h2>
                        <p className="text-muted">Самые востребованные модели этого сезона</p>
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
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
                            {featuredProducts.map((product) => (
                                <div className="col" key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-5">
                        <Link to="/catalog" className="btn btn-outline-dark btn-lg px-5">
                            Смотреть все товары →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Преимущества */}
            <FeaturesSection />

            {/* Распродажа */}
            <section className="py-5 bg-danger text-white">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h2 className="display-4 fw-bold mb-3">РАСПРОДАЖА</h2>
                            <p className="lead mb-4">Скидки до 70% на прошлые коллекции</p>
                            <p className="mb-4">Торопитесь! Предложение ограничено</p>
                            <Link to="/sale" className="btn btn-light btn-lg px-5">
                                Перейти к распродаже
                            </Link>
                        </div>
                        <div className="col-md-6 text-center">
                            <div className="display-1 fw-bold">-70%</div>
                            <p className="h5">на отдельные позиции</p>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;