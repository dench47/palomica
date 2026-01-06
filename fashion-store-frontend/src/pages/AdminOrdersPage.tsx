import { useState, useEffect } from 'react';
import { Eye, CheckCircle, XCircle, Clock, Package } from 'lucide-react';

interface OrderItem {
    product: {
        id: number;
        name: string;
        price: number;
    };
    quantity: number;
    size?: string;
    color?: string;
}

interface Order {
    id: number;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryMethod: string;
    paymentMethod: string;
    totalAmount: number;
    status: string; // Измените на string
    createdAt: string;
    items: OrderItem[];
    comment?: string;
}

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const token = localStorage.getItem('admin_token');

            const response = await fetch('/api/admin/orders', {
                headers: {
                    'Authorization': `Bearer ${token}` // ← ДОБАВЬТЕ
                },
            });

            if (!response.ok) throw new Error('Ошибка загрузки');
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateOrderStatus = async (orderId: number, status: string) => {
        try {
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                setOrders(orders.map(order =>
                    order.id === orderId ? { ...order, status } : order
                ));
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('ru-RU').format(price) + ' ₽';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'info';
            case 'PROCESSING': return 'warning';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'NEW': return <Clock size={16} />;
            case 'PROCESSING': return <Package size={16} />;
            case 'COMPLETED': return <CheckCircle size={16} />;
            case 'CANCELLED': return <XCircle size={16} />;
            default: return null;
        }
    };

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                <div className="spinner-border text-dark" role="status">
                    <span className="visually-hidden">Загрузка...</span>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Заголовок */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="fw-light mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Управление заказами
                    </h2>
                    <p className="text-muted small mb-0">
                        Всего заказов: {orders.length}
                    </p>
                </div>

                <button
                    className="btn btn-outline-dark rounded-0"
                    onClick={fetchOrders}
                >
                    Обновить
                </button>
            </div>

            {/* Фильтры по статусу */}
            <div className="mb-4">
                <div className="d-flex flex-wrap gap-2">
                    {['ALL', 'NEW', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            className="btn btn-outline-dark rounded-0 btn-sm"
                            onClick={() => {
                                // Фильтрацию можно добавить позже
                            }}
                        >
                            {status === 'ALL' ? 'Все' :
                                status === 'NEW' ? 'Новые' :
                                    status === 'PROCESSING' ? 'В обработке' :
                                        status === 'COMPLETED' ? 'Завершенные' : 'Отмененные'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Таблица заказов */}
            <div className="card rounded-0 border-1">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                        <tr>
                            <th className="border-0 small text-muted fw-normal">ID</th>
                            <th className="border-0 small text-muted fw-normal">Клиент</th>
                            <th className="border-0 small text-muted fw-normal">Дата</th>
                            <th className="border-0 small text-muted fw-normal">Сумма</th>
                            <th className="border-0 small text-muted fw-normal">Статус</th>
                            <th className="border-0 small text-muted fw-normal text-end">Действия</th>
                        </tr>
                        </thead>
                        <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="align-middle">
                                <td className="small text-muted">#{order.id}</td>
                                <td>
                                    <div>
                                        <div className="fw-medium">{order.customerName}</div>
                                        <div className="small text-muted">{order.customerPhone}</div>
                                    </div>
                                </td>
                                <td className="small">
                                    {formatDate(order.createdAt)}
                                </td>
                                <td className="fw-medium">
                                    {formatPrice(order.totalAmount)}
                                </td>
                                <td>
                                        <span className={`badge bg-${getStatusColor(order.status)} rounded-0 d-inline-flex align-items-center gap-1`}>
                                            {getStatusIcon(order.status)}
                                            {order.status === 'NEW' ? 'Новый' :
                                                order.status === 'PROCESSING' ? 'В обработке' :
                                                    order.status === 'COMPLETED' ? 'Завершен' : 'Отменен'}
                                        </span>
                                </td>
                                <td className="text-end">
                                    <div className="d-flex justify-content-end gap-2">
                                        <button
                                            className="btn btn-outline-dark btn-sm rounded-0"
                                            onClick={() => setSelectedOrder(order)}
                                            title="Просмотр"
                                        >
                                            <Eye size={14} />
                                        </button>

                                        {order.status === 'NEW' && (
                                            <>
                                                <button
                                                    className="btn btn-outline-success btn-sm rounded-0"
                                                    onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                                                    title="Взять в обработку"
                                                >
                                                    В обработку
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm rounded-0"
                                                    onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                                    title="Отменить"
                                                >
                                                    Отменить
                                                </button>
                                            </>
                                        )}

                                        {order.status === 'PROCESSING' && (
                                            <>
                                                <button
                                                    className="btn btn-outline-success btn-sm rounded-0"
                                                    onClick={() => updateOrderStatus(order.id, 'COMPLETED')}
                                                    title="Завершить"
                                                >
                                                    Завершить
                                                </button>
                                                <button
                                                    className="btn btn-outline-danger btn-sm rounded-0"
                                                    onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                                                    title="Отменить"
                                                >
                                                    Отменить
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {orders.length === 0 && (
                        <div className="text-center py-5">
                            <div className="mb-3" style={{ fontSize: '2rem', opacity: 0.1 }}>📋</div>
                            <p className="text-muted">Заказы не найдены</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Модальное окно просмотра заказа */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onStatusChange={updateOrderStatus}
                />
            )}
        </div>
    );
};

// Модальное окно деталей заказа
interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    onStatusChange: (orderId: number, status: string) => Promise<void>;
}

const OrderDetailModal = ({ order, onClose, onStatusChange }: OrderDetailModalProps) => {
    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content rounded-0 border-1">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Заказ #{order.id}
                        </h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="row mb-4">
                            <div className="col-md-6">
                                <h6 className="small text-muted mb-3">Информация о клиенте</h6>
                                <div className="mb-2">
                                    <strong>Имя:</strong> {order.customerName}
                                </div>
                                <div className="mb-2">
                                    <strong>Email:</strong> {order.customerEmail}
                                </div>
                                <div className="mb-2">
                                    <strong>Телефон:</strong> {order.customerPhone}
                                </div>
                            </div>

                            <div className="col-md-6">
                                <h6 className="small text-muted mb-3">Доставка и оплата</h6>
                                <div className="mb-2">
                                    <strong>Адрес:</strong> {order.deliveryAddress}
                                </div>
                                <div className="mb-2">
                                    <strong>Способ доставки:</strong> {order.deliveryMethod}
                                </div>
                                <div className="mb-2">
                                    <strong>Способ оплаты:</strong> {order.paymentMethod}
                                </div>
                                <div className="mb-2">
                                    <strong>Статус:</strong>{' '}
                                    <span className={`badge bg-${order.status === 'NEW' ? 'info' :
                                        order.status === 'PROCESSING' ? 'warning' :
                                            order.status === 'COMPLETED' ? 'success' : 'danger'} rounded-0`}>
                                        {order.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {order.comment && (
                            <div className="mb-4">
                                <h6 className="small text-muted mb-2">Комментарий к заказу</h6>
                                <div className="card rounded-0 border-1 bg-light">
                                    <div className="card-body small">
                                        {order.comment}
                                    </div>
                                </div>
                            </div>
                        )}

                        <h6 className="small text-muted mb-3">Состав заказа</h6>
                        <div className="table-responsive mb-4">
                            <table className="table table-sm">
                                <thead>
                                <tr>
                                    <th className="small text-muted">Товар</th>
                                    <th className="small text-muted text-center">Количество</th>
                                    <th className="small text-muted text-end">Цена</th>
                                    <th className="small text-muted text-end">Сумма</th>
                                </tr>
                                </thead>
                                <tbody>
                                {order.items.map((item, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div>
                                                {item.product.name}
                                                {(item.size || item.color) && (
                                                    <div className="small text-muted">
                                                        {item.size && `Размер: ${item.size} `}
                                                        {item.color && `Цвет: ${item.color}`}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="text-center">{item.quantity} шт.</td>
                                        <td className="text-end">
                                            {new Intl.NumberFormat('ru-RU').format(item.product.price)} ₽
                                        </td>
                                        <td className="text-end">
                                            {new Intl.NumberFormat('ru-RU').format(item.product.price * item.quantity)} ₽
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                                <tfoot>
                                <tr>
                                    <td colSpan={3} className="text-end fw-medium">Итого:</td>
                                    <td className="text-end fw-bold">
                                        {new Intl.NumberFormat('ru-RU').format(order.totalAmount)} ₽
                                    </td>
                                </tr>
                                </tfoot>
                            </table>
                        </div>

                        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                            <div className="small text-muted">
                                Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
                            </div>

                            <div className="d-flex gap-2">
                                {order.status === 'NEW' && (
                                    <>
                                        <button
                                            className="btn btn-success btn-sm rounded-0"
                                            onClick={() => {
                                                onStatusChange(order.id, 'PROCESSING');
                                                onClose();
                                            }}
                                        >
                                            Взять в обработку
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm rounded-0"
                                            onClick={() => {
                                                onStatusChange(order.id, 'CANCELLED');
                                                onClose();
                                            }}
                                        >
                                            Отменить
                                        </button>
                                    </>
                                )}

                                {order.status === 'PROCESSING' && (
                                    <>
                                        <button
                                            className="btn btn-success btn-sm rounded-0"
                                            onClick={() => {
                                                onStatusChange(order.id, 'COMPLETED');
                                                onClose();
                                            }}
                                        >
                                            Завершить
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm rounded-0"
                                            onClick={() => {
                                                onStatusChange(order.id, 'CANCELLED');
                                                onClose();
                                            }}
                                        >
                                            Отменить
                                        </button>
                                    </>
                                )}

                                <button
                                    className="btn btn-outline-dark btn-sm rounded-0"
                                    onClick={onClose}
                                >
                                    Закрыть
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;