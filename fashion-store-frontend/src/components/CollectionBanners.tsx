const CollectionBanners = () => {
    const collections = [
        {
            id: 1,
            title: "ВЕЧЕРНИЙ СТИЛЬ",
            subtitle: "Коллекция 2025",
            description: "Элегантные платья и костюмы для особых случаев",
            image: "/images/banners/ban1.jpeg",
            link: "/collection/evening",
            buttonText: "СМОТРЕТЬ КОЛЛЕКЦИЮ"
        },
        {
            id: 2,
            title: "ПОВСЕДНЕВНАЯ КЛАССИКА",
            subtitle: "Новая коллекция",
            description: "Удобная и стильная одежда на каждый день",
            image: "/images/banners/ban2.jpeg",
            link: "/collection/casual",
            buttonText: "ИССЛЕДОВАТЬ"
        }
    ];

    return (
        <div className="container-fluid px-0">
            <div className="row g-0">
                {collections.map((collection) => (
                    <div className="col-md-6" key={collection.id}>
                        <div
                            className="collection-banner position-relative"
                            style={{
                                backgroundImage: `url(${collection.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                minHeight: '600px'
                            }}
                        >
                            {/* Затемнение фона для читаемости текста */}
                            <div className="position-absolute w-100 h-100"
                                 style={{
                                     backgroundColor: 'rgba(0,0,0,0.3)',
                                     transition: 'background-color 0.3s ease'
                                 }}>
                            </div>

                            {/* Контент баннера */}
                            <div className="position-absolute top-50 start-0 end-0 translate-middle-y px-4 px-md-5">
                                <div className="row justify-content-center">
                                    <div className="col-12 col-md-10 col-lg-8 text-center text-white">
                                        <h2 className="display-4 fw-light mb-3"
                                            style={{
                                                fontFamily: "'Playfair Display', serif",
                                                letterSpacing: '0.05em'
                                            }}>
                                            {collection.title}
                                        </h2>
                                        <h3 className="h2 mb-3" style={{ fontWeight: 300 }}>
                                            {collection.subtitle}
                                        </h3>
                                        <p className="lead mb-4 opacity-85" style={{ fontSize: '1.25rem' }}>
                                            {collection.description}
                                        </p>
                                        <a
                                            href={collection.link}
                                            className="btn btn-outline-light btn-lg px-5 py-3 rounded-0 border-2 fw-light"
                                            style={{
                                                letterSpacing: '0.1em',
                                                fontSize: '0.9rem',
                                                transition: 'all 0.3s ease'
                                            }}
                                            onMouseOver={(e) => {
                                                e.currentTarget.style.background = 'white';
                                                e.currentTarget.style.color = 'black';
                                            }}
                                            onMouseOut={(e) => {
                                                e.currentTarget.style.background = 'transparent';
                                                e.currentTarget.style.color = 'white';
                                            }}
                                        >
                                            {collection.buttonText}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CollectionBanners;