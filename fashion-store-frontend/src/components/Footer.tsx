const Footer = () => {
    return (
        <footer className="text-white py-2" style={{ backgroundColor: '#282840' }}>
            <div className="container">
                <div className="row">
                    {/* Колонка 1: Клиентам */}
                    <div className="col-md-3 col-6 mb-1">
                        <h6 className="text-uppercase mb-1" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>Клиентам</h6>
                        <ul className="list-unstyled">
                            <li>
                                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    Правила покупки
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    Оплата товара
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    Уход за изделиями
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    Таблица размеров
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Колонка 2: Сервис */}
                    <div className="col-md-3 col-6 mb-1">
                        <h6 className="text-uppercase mb-1" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>Сервис</h6>
                        <ul className="list-unstyled">
                            <li>
                                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    Доставка
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    Возврат и обмен
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    Контакты
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Колонка 3: Контакты */}
                    <div className="col-md-3 col-6 mb-1">
                        <h6 className="text-uppercase mb-1" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>Контакты</h6>
                        <ul className="list-unstyled">
                            <li>
                                <a href="tel:+74951057025" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    +7 495 105 70 25
                                </a>
                            </li>
                            <li>
                                <a href="mailto:info@palomika.ru" className="text-white text-decoration-none opacity-75 hover-opacity-100" style={{ fontSize: '0.8rem' }}>
                                    info@palomika.ru
                                </a>
                            </li>
                        </ul>
                        <p className="opacity-75 mt-1" style={{ fontSize: '0.75rem' }}>
                            Служба поддержки:<br/>
                            Пн-Пт: 10:00–20:00
                        </p>
                    </div>

                    {/* Колонка 4: Подписка */}
                    <div className="col-md-3 col-6 mb-1">
                        <h6 className="text-uppercase mb-1" style={{ fontSize: '0.85rem', letterSpacing: '0.1em' }}>Рассылка</h6>
                        <p className="opacity-75 mb-1" style={{ fontSize: '0.8rem' }}>
                            Подпишитесь на новости о новых коллекциях
                        </p>
                        <div className="input-group input-group-sm mb-1">
                            <input
                                type="email"
                                className="form-control bg-dark border-dark text-white rounded-0"
                                placeholder="E-mail"
                                style={{ fontSize: '0.8rem', height: '2rem' }}
                            />
                            <button className="btn btn-outline-light rounded-0 border-dark" style={{ fontSize: '0.8rem', height: '2rem' }}>
                                →
                            </button>
                        </div>
                        <p className="opacity-50" style={{ fontSize: '0.7rem' }}>
                            Подписываясь, вы соглашаетесь с политикой конфиденциальности
                        </p>
                    </div>
                </div>

                <hr className="my-2" style={{ borderColor: 'rgba(255,255,255,0.1)' }}/>

                <div className="text-center">
                    <p className="small opacity-75 mb-0" style={{ fontSize: '0.7rem' }}>
                        © 2025 PALOMIKA. Все права защищены.
                    </p>
                    <p className="small opacity-50 mt-0" style={{ fontSize: '0.65rem' }}>
                        Мы используем cookie, чтобы улучшить работу сайта
                    </p>

                    {/* ДОБАВЬТЕ ЭТОТ БЛОК ДЛЯ ССЫЛКИ НА УСЛОВИЯ ИСПОЛЬЗОВАНИЯ */}
                    <div className="mt-1">
                        <a
                            href="https://yandex.ru/legal/maps_api/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white text-decoration-none opacity-75 hover-opacity-100"
                            style={{ fontSize: '0.65rem' }}
                        >
                            Условия использования Яндекс Карт
                        </a>
                    </div>

                    {/* Также можно добавить ссылку на политику конфиденциальности, если еще нет */}
                    <div className="mt-1">
                        <a
                            href="/privacy-policy"
                            className="text-white text-decoration-none opacity-75 hover-opacity-100"
                            style={{ fontSize: '0.65rem' }}
                        >
                            Политика конфиденциальности
                        </a>
                        <span className="mx-2 opacity-50">|</span>
                        <a
                            href="/terms-of-service"
                            className="text-white text-decoration-none opacity-75 hover-opacity-100"
                            style={{ fontSize: '0.65rem' }}
                        >
                            Пользовательское соглашение
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;