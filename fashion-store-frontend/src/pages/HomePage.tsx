import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider'; // Это теперь статичный баннер
import CollectionBanners from '../components/CollectionBanners'; // вместо TwoPhotosSection
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
            setFeaturedProducts(data.slice(0, 8));
        } catch (err) {
            setError('Ошибка при загрузке товаров');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Главный full-screen баннер вместо слайдера */}
            <HeroSlider />


            <CollectionBanners />

            {/* Секция товаров - минималистичная */}
            <section id="products" className="py-5 bg-white">

                <div className="container-fluid px-0">
                    {/* Заголовок секции в минималистичном стиле */}
                    <div className="mb-5 text-center">
                        <h2 className="fw-light mb-2" style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem' }}>
                            Избранное
                        </h2>
                        <p className="text-muted">Отобранные коллекционные предметы</p>
                        <div className="mx-auto" style={{ width: '60px', borderTop: '1px solid #000', marginTop: '1rem' }}></div>
                    </div>

                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border text-dark" role="status" style={{ width: '3rem', height: '3rem' }}>
                                <span className="visually-hidden">Загрузка...</span>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="alert alert-danger text-center rounded-0 border-0">
                            {error}
                        </div>
                    )}

                    {!loading && !error && (
                        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-0">
                            {featuredProducts.map((product) => (
                                <div className="col" key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Кнопка "Смотреть всё" */}
                    <div className="text-center mt-5 pt-3">
                        <Link to="/catalog" className="btn btn-outline-dark btn-lg px-5 rounded-0 border-2 fw-light"
                              style={{ letterSpacing: '0.1em' }}
                              onClick={() => window.scrollTo(0, 0)}>
                            ВЕСЬ КАТАЛОГ
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;