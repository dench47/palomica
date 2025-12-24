const FeaturesSection = () => {
    const features = [
        {
            id: 1,
            icon: "🚚",
            title: "Бесплатная доставка",
            description: "По России при заказе от 5000 ₽"
        },
        {
            id: 2,
            icon: "↩️",
            title: "Возврат 14 дней",
            description: "Легкий возврат и обмен"
        },
        {
            id: 3,
            icon: "🛡️",
            title: "Гарантия качества",
            description: "Официальная гарантия на все товары"
        },
        {
            id: 4,
            icon: "📞",
            title: "Поддержка 24/7",
            description: "Консультации по телефону и WhatsApp"
        }
    ];

    return (
        <section className="py-5 bg-light">
            <div className="container">
                <div className="row g-4">
                    {features.map(feature => (
                        <div className="col-md-3 col-sm-6" key={feature.id}>
                            <div className="text-center p-4 h-100" style={{
                                backgroundColor: 'white',
                                borderRadius: '10px',
                                boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                            }}>
                                <div className="display-4 mb-3">{feature.icon}</div>
                                <h4 className="h5 mb-2">{feature.title}</h4>
                                <p className="text-muted small mb-0">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturesSection;