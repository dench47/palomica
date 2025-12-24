const Footer = () => {
    return (
        <footer className="bg-dark text-light py-5 mt-5">
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mb-4">
                        <h5 className="mb-3">FASHION STORE</h5>
                        <p className="text-muted small">
                            Эксклюзивная одежда от российских дизайнеров.
                            Качество, стиль и индивидуальность в каждой детали.
                        </p>
                    </div>

                    <div className="col-md-4 mb-4">
                        <h5 className="mb-3">ПОМОЩЬ</h5>
                        <ul className="list-unstyled">
                            <li><a href="#shipping" className="text-muted text-decoration-none small">Доставка и оплата</a></li>
                            <li><a href="#returns" className="text-muted text-decoration-none small">Возврат и обмен</a></li>
                            <li><a href="#sizing" className="text-muted text-decoration-none small">Размерная сетка</a></li>
                            <li><a href="#faq" className="text-muted text-decoration-none small">FAQ</a></li>
                        </ul>
                    </div>

                    <div className="col-md-4 mb-4">
                        <h5 className="mb-3">РАССЫЛКА</h5>
                        <p className="text-muted small mb-3">
                            Подпишитесь на новости о новых коллекциях и акциях
                        </p>
                        <div className="input-group mb-3">
                            <input
                                type="email"
                                className="form-control bg-dark text-light border-secondary"
                                placeholder="Ваш email"
                            />
                            <button className="btn btn-outline-light">
                                Подписаться
                            </button>
                        </div>
                        <p className="text-muted small">
                            Подписываясь, вы соглашаетесь с условиями политики конфиденциальности
                        </p>
                    </div>
                </div>

                <hr className="bg-secondary my-4" />

                <div className="text-center text-muted">
                    <p className="mb-1 small">© 2025 FASHION STORE. Все права защищены.</p>
                    <p className="mb-0 small">Служба поддержки: +7 495 105 70 25</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;