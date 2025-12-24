const Footer = () => {
    return (
        <footer className="bg-black text-light py-5">
            <div className="container">
                <div className="row">
                    {/* Колонка 1: Клиентам */}
                    <div className="col-md-3 col-6 mb-4">
                        <h6 className="text-uppercase mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>Клиентам</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><a href="#" className="text-light text-decoration-none small opacity-75 hover-opacity-100">Правила покупки</a></li>
                            <li className="mb-2"><a href="#" className="text-light text-decoration-none small opacity-75 hover-opacity-100">Оплата товара</a></li>
                            <li className="mb-2"><a href="#" className="text-light text-decoration-none small opacity-75 hover-opacity-100">Уход за изделиями</a></li>
                            <li className="mb-2"><a href="#" className="text-light text-decoration-none small opacity-75 hover-opacity-100">Таблица размеров</a></li>
                        </ul>
                    </div>

                    {/* Колонка 2: Сервис */}
                    <div className="col-md-3 col-6 mb-4">
                        <h6 className="text-uppercase mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>Сервис</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2"><a href="#" className="text-light text-decoration-none small opacity-75 hover-opacity-100">Доставка</a></li>
                            <li className="mb-2"><a href="#" className="text-light text-decoration-none small opacity-75 hover-opacity-100">Возврат и обмен</a></li>
                            <li className="mb-2"><a href="#" className="text-light text-decoration-none small opacity-75 hover-opacity-100">Контакты</a></li>
                        </ul>
                    </div>

                    {/* Колонка 3: Контакты */}
                    <div className="col-md-3 col-6 mb-4">
                        <h6 className="text-uppercase mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>Контакты</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <a href="tel:+74951057025" className="text-light text-decoration-none small opacity-75 hover-opacity-100">
                                    +7 495 105 70 25
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="mailto:info@palomica.ru" className="text-light text-decoration-none small opacity-75 hover-opacity-100">
                                    info@palomica.ru
                                </a>
                            </li>
                        </ul>
                        <p className="small opacity-75 mt-3">
                            Служба поддержки:<br/>
                            Пн-Пт: 10:00–20:00
                        </p>
                    </div>

                    {/* Колонка 4: Подписка */}
                    <div className="col-md-3 col-6 mb-4">
                        <h6 className="text-uppercase mb-3" style={{ fontSize: '0.9rem', letterSpacing: '0.1em' }}>Рассылка</h6>
                        <p className="small opacity-75 mb-3">
                            Подпишитесь на новости о новых коллекциях
                        </p>
                        <div className="input-group input-group-sm mb-3">
                            <input
                                type="email"
                                className="form-control bg-dark border-dark text-light rounded-0"
                                placeholder="E-mail"
                                style={{ fontSize: '0.85rem' }}
                            />
                            <button className="btn btn-outline-light rounded-0 border-dark" style={{ fontSize: '0.85rem' }}>
                                →
                            </button>
                        </div>
                        <p className="small opacity-50">
                            Подписываясь, вы соглашаетесь с политикой конфиденциальности
                        </p>
                    </div>
                </div>

                <hr className="bg-dark my-5"/>

                <div className="text-center">
                    <p className="small opacity-75 mb-1">© 2025 PALOMICA. Все права защищены.</p>
                    <p className="small opacity-50">Мы используем cookie, чтобы улучшить работу сайта</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;