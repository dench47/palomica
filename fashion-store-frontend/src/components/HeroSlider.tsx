import {useEffect, useState} from "react";

const HeroSlider = () => {
    const slides = [
        {
            id: 1,
            title: "Новая коллекция",
            subtitle: "Осень-Зима 2025",
            description: "Эксклюзивные модели от российских дизайнеров",
            image: "https://images.unsplash.com/photo-1445205170230-053b83016050?w=1200&h=600&fit=crop",
            buttonText: "Смотреть коллекцию",
            buttonLink: "#collection"
        },
        {
            id: 2,
            title: "Скидка 30%",
            subtitle: "На первую покупку",
            description: "Только для новых клиентов",
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&h=600&fit=crop",
            buttonText: "Получить скидку",
            buttonLink: "#sale"
        },
        {
            id: 3,
            title: "Бесплатная доставка",
            subtitle: "По всей России",
            description: "При заказе от 5000 ₽",
            image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&h=600&fit=crop",
            buttonText: "Условия доставки",
            buttonLink: "#shipping"
        }
    ];

    const [currentSlide, setCurrentSlide] = useState(0);

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    };

    useEffect(() => {
        const interval = setInterval(nextSlide, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="hero-slider position-relative overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={slide.id}
                    className={`slide ${index === currentSlide ? 'active' : ''}`}
                    style={{
                        backgroundImage: `url(${slide.image})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '600px',
                        display: index === currentSlide ? 'block' : 'none'
                    }}
                >
                    <div className="container h-100">
                        <div className="row h-100 align-items-center">
                            <div className="col-lg-6">
                                <div className="slide-content text-white p-4" style={{
                                    backgroundColor: 'rgba(0,0,0,0.6)',
                                    borderRadius: '10px'
                                }}>
                                    <h2 className="display-4 fw-bold mb-3">{slide.title}</h2>
                                    <h3 className="h1 mb-3">{slide.subtitle}</h3>
                                    <p className="lead mb-4">{slide.description}</p>
                                    <a
                                        href={slide.buttonLink}
                                        className="btn btn-light btn-lg px-5"
                                    >
                                        {slide.buttonText}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Кнопки управления */}
            <button
                className="btn btn-outline-light position-absolute top-50 start-0 translate-middle-y ms-3"
                onClick={prevSlide}
                style={{ zIndex: 10 }}
            >
                ‹
            </button>
            <button
                className="btn btn-outline-light position-absolute top-50 end-0 translate-middle-y me-3"
                onClick={nextSlide}
                style={{ zIndex: 10 }}
            >
                ›
            </button>

            {/* Индикаторы */}
            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex" style={{ zIndex: 10 }}>
                {slides.map((_, index) => (
                    <button
                        key={index}
                        className={`btn btn-sm mx-1 ${index === currentSlide ? 'btn-light' : 'btn-outline-light'}`}
                        onClick={() => setCurrentSlide(index)}
                        style={{ width: '12px', height: '12px', padding: 0, borderRadius: '50%' }}
                    >
                        &nbsp;
                    </button>
                ))}
            </div>
        </div>
    );
};

export default HeroSlider;