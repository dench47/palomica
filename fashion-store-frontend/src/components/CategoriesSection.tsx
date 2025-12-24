const CategoriesSection = () => {
    const categories = [
        {
            id: 1,
            name: "Каталог",
            image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop",
            count: 120,
            link: "#catalog"
        },
        {
            id: 2,
            name: "Фотогалерея",
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=500&fit=crop",
            count: 85,
            link: "#gallery"
        },
        {
            id: 3,
            name: "Сувениры",
            image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=500&fit=crop",
            count: 42,
            link: "#souvenirs"
        }
    ];

    return (
        <section className="py-5">
            <div className="container">
                <h2 className="text-center mb-5 fw-bold">КАТЕГОРИИ</h2>

                <div className="row g-4 justify-content-center">
                    {categories.map(category => (
                        <div className="col-md-4 col-sm-6" key={category.id}>
                            <a href={category.link} className="text-decoration-none text-dark">
                                <div className="category-card position-relative overflow-hidden rounded-3">
                                    <img
                                        src={category.image}
                                        alt={category.name}
                                        className="img-fluid w-100"
                                        style={{ height: '400px', objectFit: 'cover' }}
                                    />
                                    <div className="category-overlay position-absolute bottom-0 start-0 w-100 p-3 text-white"
                                         style={{
                                             background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)'
                                         }}>
                                        <h3 className="h4 mb-1">{category.name}</h3>
                                        <p className="small mb-0">{category.count} товаров</p>
                                    </div>
                                </div>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default CategoriesSection;