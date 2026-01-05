import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
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
            setFeaturedProducts(data.slice(0, 4));
        } catch (err) {
            setError('Ошибка при загрузке товаров');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Первый баннер */}
            <HeroSlider
                title="FASHIONSTORE"
                subtitle="Новое измерение стиля. Эксклюзивные коллекции."
                buttonText="Открыть коллекцию"
                image="images/banners/banner.jpg"
                link="#products"
            />

            {/* Второй баннер */}
            <HeroSlider
                title="ВЕЧЕРНИЙ СТИЛЬ"
                subtitle="Коллекция 2025. Элегантные платья и костюмы для особых случаев."
                buttonText="СМОТРЕТЬ КОЛЛЕКЦИЮ"
                image="/images/banners/ban1.jpeg"
                link="/catalog?category=одежда"
            />

            {/* Третий баннер */}
            <HeroSlider
                title="ПОВСЕДНЕВНАЯ КЛАССИКА"
                subtitle="Новая коллекция. Удобная и стильная одежда на каждый день."
                buttonText="ИССЛЕДОВАТЬ"
                image="/images/banners/ban2.jpeg"
                link="/catalog?category=одежда"
            />

            {/* Секция товаров - ИЗМЕНЕНО: убран bg-white */}
            <section id="products" className="py-5 bg-cream-light">
                <div className="container-fluid px-0">
                    <div className="mb-5 text-center">
                        <h2 className="fw-light mb-2" style={{
                            fontFamily: "'Playfair Display', serif",
                            fontSize: '2.5rem',
                            color: 'var(--text-dark)' /* Добавил явный цвет */
                        }}>
                            Избранное
                        </h2>
                        <p className="text-muted">Отобранные коллекционные предметы</p>
                        <div className="mx-auto" style={{
                            width: '60px',
                            borderTop: '1px solid var(--text-dark)', /* Обновил цвет */
                            marginTop: '1rem'
                        }}></div>
                    </div>

                    {loading && (
                        <div className="text-center py-5">
                            <div className="spinner-border" role="status" style={{
                                width: '3rem',
                                height: '3rem',
                                color: 'var(--accent-brown)' /* Обновил цвет спиннера */
                            }}>
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
                        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-4 g-0">
                            {featuredProducts.map((product) => (
                                <div className="col" key={product.id}>
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="text-center mt-5 pt-3">
                        <Link
                            to="/catalog"
                            className="btn btn-outline-dark btn-lg px-5 rounded-0 border-2 fw-light"
                            style={{
                                letterSpacing: '0.1em',
                                borderColor: 'var(--text-dark)',
                                color: 'var(--text-dark)'
                            }}
                            onClick={() => window.scrollTo(0, 0)}
                        >
                            ВЕСЬ КАТАЛОГ
                        </Link>
                    </div>
                </div>
            </section>
        </>
    );
};

export default HomePage;