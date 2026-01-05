interface HeroSliderProps {
    title: string;
    subtitle: string;
    buttonText: string;
    image: string;
    link: string;
}

const HeroSlider = ({
                        title,
                        subtitle,
                        buttonText,
                        image,
                        link
                    }: HeroSliderProps) => {
    return (
        <div className="hero-banner position-relative vh-100 overflow-hidden">
            {/* Фоновое изображение */}
            <div
                className="w-100 h-100"
                style={{
                    backgroundImage: `url(${image})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundRepeat: 'no-repeat'
                }}
            >
                {/* Оверлей для контраста */}
                <div className="position-absolute w-100 h-100"
                     style={{
                         backgroundColor: 'rgba(0,0,0,0.25)',
                         transition: 'background-color 0.5s ease'
                     }}></div>
            </div>

            {/* Контент - стилизовано минималистично */}
            <div className="container-fluid position-absolute top-50 start-0 end-0 translate-middle-y px-4 px-md-5">
                <div className="row justify-content-center">
                    <div className="col-12 col-lg-9 col-xl-8 text-center text-white">
                        {/* Заголовок с эффектом появления */}
                        <h1
                            className="display-1 fw-light mb-4"
                            style={{
                                fontFamily: "'Playfair Display', serif",
                                letterSpacing: '0.1em',
                                lineHeight: '1.1',
                                textTransform: 'uppercase',
                                opacity: '0.95'
                            }}
                        >
                            {title}
                        </h1>

                        {/* Подзаголовок с тонкой анимацией */}
                        <div className="overflow-hidden">
                            <p className="lead mb-5"
                               style={{
                                   fontSize: '1.5rem',
                                   fontFamily: "'Cormorant Garamond', serif",
                                   fontWeight: '300',
                                   letterSpacing: '0.05em',
                                   opacity: '0.9',
                                   transform: 'translateY(0)',
                                   transition: 'all 0.8s ease'
                               }}
                            >
                                {subtitle}
                            </p>
                        </div>

                        {/* Кнопка с эффектом наведения */}
                        <div className="overflow-hidden">
                            <a
                                href={link}
                                className="btn btn-outline-light btn-lg px-5 py-3 rounded-0 border-1 fw-light d-inline-block"
                                style={{
                                    letterSpacing: '0.15em',
                                    fontSize: '0.85rem',
                                    fontFamily: "'Cormorant Garamond', serif",
                                    textTransform: 'uppercase',
                                    transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                    transform: 'translateY(0)',
                                    backgroundColor: 'transparent'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.backgroundColor = 'white';
                                    e.currentTarget.style.color = 'black';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = 'white';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                }}
                            >
                                {buttonText}
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Тонкая линия внизу для акцента */}
            <div className="position-absolute bottom-0 start-0 w-100">
                <div className="container-fluid">
                    <div className="row justify-content-center">
                        <div className="col-12 col-lg-9 col-xl-8">
                            <div style={{
                                height: '1px',
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                marginBottom: '2rem'
                            }}></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeroSlider;