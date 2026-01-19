interface CustomerFormProps {
    customerData: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    onCustomerDataChange: (field: string, value: string) => void;
    comment: string;
    onCommentChange: (comment: string) => void;
}

const CustomerForm = ({
                          customerData,
                          onCustomerDataChange,
                          comment,
                          onCommentChange
                      }: CustomerFormProps) => {
    return (
        <div>
            <h3 className="h5 fw-light mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Ваши данные
            </h3>

            <div className="mb-5">
                <div className="row">
                    <div className="col-md-4 mb-3">
                        <label className="form-label small text-muted">Имя *</label>
                        <input
                            type="text"
                            className="form-control"
                            style={{ borderRadius: '8px' }}
                            required
                            value={customerData.name}
                            onChange={(e) => onCustomerDataChange('name', e.target.value)}
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label small text-muted">Email *</label>
                        <input
                            type="email"
                            className="form-control"
                            style={{ borderRadius: '8px' }}
                            required
                            value={customerData.email}
                            onChange={(e) => onCustomerDataChange('email', e.target.value)}
                        />
                    </div>
                    <div className="col-md-4 mb-3">
                        <label className="form-label small text-muted">Телефон *</label>
                        <input
                            type="tel"
                            className="form-control"
                            style={{ borderRadius: '8px' }}
                            required
                            value={customerData.phone}
                            onChange={(e) => onCustomerDataChange('phone', e.target.value)}
                            placeholder="+7 (999) 123-45-67"
                        />
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label className="form-label small text-muted">Комментарий к заказу</label>
                <textarea
                    className="form-control"
                    style={{ borderRadius: '8px' }}
                    rows={3}
                    value={comment}
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Например: позвоните за час до доставки, нужна подарочная упаковка, код домофона и т.д."
                />
                <small className="text-muted">Необязательно</small>
            </div>
        </div>
    );
};

export default CustomerForm;
