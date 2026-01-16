import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Package,
    Truck,
    Filter,
    RefreshCw,
    Search
} from 'lucide-react';
import Swal from 'sweetalert2';

interface OrderItem {
    id: number;
    product: {
        id: number;
        name: string;
        price: number;
        imageUrl?: string;
    };
    quantity: number;
    price: number;
    size?: string;
    color?: string;
}

interface Order {
    id: number;
    orderNumber: string; // Уникальный номер заказа
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryMethod: string;
    paymentMethod: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items: OrderItem[];
    comment?: string;
    accessToken?: string;
}

const AdminOrdersPage = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [refreshing, setRefreshing] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (statusFilter === 'ALL') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === statusFilter));
        }
    }, [orders, statusFilter]);

    const fetchOrders = async (status?: string) => {
        try {
            setRefreshing(true);
            const token = localStorage.getItem('admin_token');
            let url = '/api/admin/orders';

            if (status && status !== 'ALL') {
                url += `?status=${encodeURIComponent(status)}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                if (response.status === 403) {
                    alert('Доступ запрещен. Пожалуйста, войдите в систему как администратор.');
                    return;
                }
                throw new Error(`Ошибка загрузки: ${response.status}`);
            }

            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            alert('Ошибка загрузки заказов. Проверьте консоль для деталей.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const searchOrders = async () => {
        if (!searchTerm.trim()) {
            fetchOrders();
            return;
        }

        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/admin/orders/search?orderNumber=${encodeURIComponent(searchTerm.trim())}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
            });

            if (!response.ok) {
                throw new Error(`Ошибка поиска: ${response.status}`);
            }

            const data = await response.json();
            setOrders(data);
            setStatusFilter('ALL');
        } catch (error) {
            console.error('Error searching orders:', error);
            Swal.fire({
                title: 'Ошибка!',
                text: 'Заказы не найдены',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#dc3545',
                customClass: {
                    popup: 'rounded-0',
                    confirmButton: 'btn btn-danger rounded-0'
                },
                buttonsStyling: false
            });
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        searchOrders();
    };

    const clearSearch = () => {
        setSearchTerm('');
        fetchOrders();
    };

    const updateOrderStatus = async (orderId: number, status: string) => {
        try {
            const token = localStorage.getItem('admin_token');
            const response = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status }),
            });

            if (response.ok) {
                const updatedOrder = await response.json();
                setOrders(orders.map(order =>
                    order.id === orderId ? updatedOrder : order
                ));
                return true;
            } else {
                const errorData = await response.json();
                showErrorAlert(`Ошибка обновления статуса: ${errorData.message || 'Неизвестная ошибка'}`);
                return false;
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            showErrorAlert('Ошибка обновления статуса заказа');
            return false;
        }
    };

    const showCancelConfirm = async (orderId: number) => {
        const result = await Swal.fire({
            title: 'Отменить заказ?',
            text: 'Вы уверены, что хотите отменить этот заказ? Это действие нельзя отменить.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Да, отменить',
            cancelButtonText: 'Нет, оставить',
            confirmButtonColor: '#dc3545',
            cancelButtonColor: '#6c757d',
            customClass: {
                popup: 'rounded-0',
                confirmButton: 'btn btn-danger rounded-0',
                cancelButton: 'btn btn-outline-dark rounded-0'
            },
            buttonsStyling: false
        });

        if (result.isConfirmed) {
            const success = await updateOrderStatus(orderId, 'CANCELLED');
            if (success) {
                Swal.fire({
                    title: 'Отменено!',
                    text: 'Заказ был успешно отменен.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#dc3545',
                    customClass: {
                        popup: 'rounded-0',
                        confirmButton: 'btn btn-danger rounded-0'
                    },
                    buttonsStyling: false
                });
            }
        }
    };

    const showErrorAlert = (text: string) => {
        Swal.fire({
            title: 'Ошибка!',
            text,
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: '#dc3545',
            customClass: {
                popup: 'rounded-0',
                confirmButton: 'btn btn-danger rounded-0'
            },
            buttonsStyling: false
        });
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
            case 'SHIPPED': return 'primary';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'NEW': return <Clock size={16} />;
            case 'PROCESSING': return <Package size={16} />;
            case 'SHIPPED': return <Truck size={16} />;
            case 'COMPLETED': return <CheckCircle size={16} />;
            case 'CANCELLED': return <XCircle size={16} />;
            default: return null;
        }
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'NEW': return 'Новый заказ';
            case 'PROCESSING': return 'В обработке';
            case 'SHIPPED': return 'Передан в доставку';
            case 'COMPLETED': return 'Завершен';
            case 'CANCELLED': return 'Отменен';
            default: return status;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'NEW': return 'Новый';
            case 'PROCESSING': return 'В обработке';
            case 'SHIPPED': return 'В доставке';
            case 'COMPLETED': return 'Завершен';
            case 'CANCELLED': return 'Отменен';
            default: return status;
        }
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        setSearchTerm('');
        fetchOrders(status === 'ALL' ? undefined : status);
    };

    const handleRefresh = () => {
        setSearchTerm('');
        fetchOrders(statusFilter === 'ALL' ? undefined : statusFilter);
    };

    const translateDeliveryMethod = (method: string) => {
        const methodLower = method.toLowerCase();
        if (methodLower.includes('pickup') || methodLower.includes('самовывоз')) return 'Самовывоз';
        if (methodLower.includes('delivery') || methodLower.includes('курьер')) return 'Доставка курьером';
        if (methodLower.includes('post') || methodLower.includes('почта')) return 'Почта России';
        return method;
    };

    const translatePaymentMethod = (method: string) => {
        const methodLower = method.toLowerCase();
        if (methodLower.includes('cash') || methodLower.includes('наличн')) return 'Наличными при получении';
        if (methodLower.includes('card') && methodLower.includes('online')) return 'Картой онлайн';
        if (methodLower.includes('card') && methodLower.includes('receiving')) return 'Картой при получении';
        if (methodLower.includes('card')) return 'Картой';
        return method;
    };

    if (loading && orders.length === 0) {
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
                        Всего заказов: {orders.length} | Показано: {filteredOrders.length}
                    </p>
                </div>

                <button
                    className="btn btn-outline-dark rounded-0 d-flex align-items-center gap-2"
                    onClick={handleRefresh}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                        <RefreshCw size={16} />
                    )}
                    Обновить
                </button>
            </div>

            {/* Поиск по номеру заказа */}
            <div className="mb-4">
                <form onSubmit={handleSearch} className="d-flex gap-2">
                    <div className="flex-grow-1">
                        <input
                            type="text"
                            className="form-control rounded-0"
                            placeholder="Поиск по номеру заказа"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button
                        type="submit"
                        className="btn btn-dark rounded-0 d-flex align-items-center gap-2"
                        disabled={refreshing || !searchTerm.trim()}
                    >
                        <Search size={16} />
                        Найти
                    </button>
                    {searchTerm && (
                        <button
                            type="button"
                            className="btn btn-outline-secondary rounded-0"
                            onClick={clearSearch}
                            disabled={refreshing}
                        >
                            Сбросить
                        </button>
                    )}
                </form>
            </div>

            {/* Фильтры по статусу */}
            <div className="mb-4">
                <h6 className="small text-muted mb-2 d-flex align-items-center gap-1">
                    <Filter size={14} /> Фильтр по статусу
                </h6>
                <div className="d-flex flex-wrap gap-2">
                    {['ALL', 'NEW', 'PROCESSING', 'SHIPPED', 'COMPLETED', 'CANCELLED'].map((status) => (
                        <button
                            key={status}
                            className={`btn btn-outline-dark rounded-0 btn-sm ${statusFilter === status ? 'active' : ''}`}
                            onClick={() => handleStatusFilter(status)}
                            disabled={refreshing}
                        >
                            {status === 'ALL' ? 'Все' :
                                status === 'NEW' ? 'Новые' :
                                    status === 'PROCESSING' ? 'В обработке' :
                                        status === 'SHIPPED' ? 'В доставке' :
                                            status === 'COMPLETED' ? 'Завершенные' : 'Отмененные'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Таблица заказов */}
            {/* Таблица заказов */}
            <div className="card rounded-0 border-1">
                <div className="table-responsive">
                    <table className="table table-hover mb-0">
                        <thead>
                        <tr>
                            <th className="border-0 small text-muted fw-normal">ID</th>
                            <th className="border-0 small text-muted fw-normal">Номер заказа</th>
                            <th className="border-0 small text-muted fw-normal">Клиент</th>
                            <th className="border-0 small text-muted fw-normal">Дата</th>
                            <th className="border-0 small text-muted fw-normal">Сумма</th>
                            <th className="border-0 small text-muted fw-normal">Статус</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredOrders.map((order) => (
                            <tr
                                key={order.id}
                                className="align-middle"
                                onClick={() => setSelectedOrder(order)}
                                style={{ cursor: 'pointer' }}>
                                <td className="small text-muted">{order.id}</td>
                                <td className="fw-medium text-brown">{order.orderNumber}</td>
                                <td>
                                    <div className="fw-medium">{order.customerName}</div>
                                    <div className="small text-muted">{order.customerPhone}</div>
                                </td>
                                <td className="small">{formatDate(order.createdAt)}</td>
                                <td className="fw-medium">{formatPrice(order.totalAmount)}</td>
                                <td>
                                    <div className="d-flex flex-column">
                                <span className={`badge bg-${getStatusColor(order.status)} rounded-0 d-inline-flex align-items-center gap-1`}>
                                    {getStatusIcon(order.status)}
                                    {getStatusText(order.status)}
                                </span>
                                        <small className="text-muted mt-1">
                                            {getStatusDescription(order.status)}
                                        </small>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>

                    {filteredOrders.length === 0 && !loading && (
                        <div className="text-center py-5">
                            <div className="mb-3" style={{ fontSize: '2rem', opacity: 0.1 }}>📋</div>
                            <p className="text-muted">
                                {searchTerm
                                    ? `Заказы по запросу "${searchTerm}" не найдены`
                                    : statusFilter === 'ALL'
                                        ? 'Заказы не найдены'
                                        : `Нет заказов со статусом "${getStatusText(statusFilter)}"`}
                            </p>
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
                    onCancelOrder={showCancelConfirm}
                    translateDeliveryMethod={translateDeliveryMethod}
                    translatePaymentMethod={translatePaymentMethod}
                />
            )}
        </div>
    );
};

// Компонент модального окна деталей заказа
interface OrderDetailModalProps {
    order: Order;
    onClose: () => void;
    onStatusChange: (orderId: number, status: string) => Promise<boolean>;
    onCancelOrder: (orderId: number) => Promise<void>;
    translateDeliveryMethod: (method: string) => string;
    translatePaymentMethod: (method: string) => string;
}

const OrderDetailModal = ({
                              order,
                              onClose,
                              onStatusChange,
                              onCancelOrder,
                              translateDeliveryMethod,
                              translatePaymentMethod
                          }: OrderDetailModalProps) => {
    const [updating, setUpdating] = useState<string | null>(null);

    const handleStatusChange = async (status: string) => {
        setUpdating(status);
        const success = await onStatusChange(order.id, status);
        setUpdating(null);
        if (success) {
            onClose();
        }
    };

    const handleCancelOrder = async () => {
        await onCancelOrder(order.id);
        onClose();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'info';
            case 'PROCESSING': return 'warning';
            case 'SHIPPED': return 'primary';
            case 'COMPLETED': return 'success';
            case 'CANCELLED': return 'danger';
            default: return 'secondary';
        }
    };

    const getStatusDescription = (status: string) => {
        switch (status) {
            case 'NEW': return 'Новый заказ';
            case 'PROCESSING': return 'В обработке';
            case 'SHIPPED': return 'Заказ передан в службу доставки';
            case 'COMPLETED': return 'Заказ завершен';
            case 'CANCELLED': return 'Заказ отменен';
            default: return status;
        }
    };
    return (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className="modal-dialog modal-lg modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
                <div className="modal-content rounded-0 border-1">
                    <div className="modal-header border-0 pb-0">
                        <h5 className="modal-title fw-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Заказ {order.orderNumber}
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
                                    <strong>Адрес доставки:</strong> {order.deliveryAddress}
                                </div>
                                <div className="mb-2">
                                    <strong>Способ доставки:</strong> {translateDeliveryMethod(order.deliveryMethod)}
                                </div>
                                <div className="mb-2">
                                    <strong>Способ оплаты:</strong> {translatePaymentMethod(order.paymentMethod)}
                                </div>
                                <div className="mb-2">
                                    <strong>Статус:</strong>{' '}
                                    <span className={`badge bg-${getStatusColor(order.status)} rounded-0`}>
                                        {getStatusDescription(order.status)}
                                    </span>
                                </div>
                                {order.comment && (
                                    <div className="mb-2">
                                        <strong>Комментарий клиента:</strong>
                                        <div className="small text-muted mt-1">{order.comment}</div>
                                    </div>
                                )}
                            </div>
                        </div>

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
                                                <strong>{item.product.name}</strong>
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
                                            {new Intl.NumberFormat('ru-RU').format(item.price)} ₽
                                        </td>
                                        <td className="text-end">
                                            {new Intl.NumberFormat('ru-RU').format(item.price * item.quantity)} ₽
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

                        {/* В модальном окне OrderDetailModal */}
                        <div className="d-flex justify-content-between align-items-center pt-3 border-top">
                            <div className="small text-muted">
                                Создан: {new Date(order.createdAt).toLocaleString('ru-RU')}
                            </div>

                            <div className="d-flex gap-2">
                                {/* Основные кнопки изменения статуса */}
                                <div className="d-flex gap-2">
                                    {order.status === 'NEW' && (
                                        <button
                                            className="btn btn-success btn-sm rounded-0"
                                            onClick={() => handleStatusChange('PROCESSING')}
                                            disabled={updating !== null}
                                        >
                                            {updating === 'PROCESSING' ? (
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                            ) : 'Взять в обработку'}
                                        </button>
                                    )}

                                    {order.status === 'PROCESSING' && (
                                        <button
                                            className="btn btn-primary btn-sm rounded-0 d-flex align-items-center gap-1"
                                            onClick={() => handleStatusChange('SHIPPED')}
                                            disabled={updating !== null}
                                        >
                                            {updating === 'SHIPPED' ? (
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                            ) : (
                                                <>
                                                    <Truck size={14} />
                                                    В доставку
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {order.status === 'SHIPPED' && (
                                        <button
                                            className="btn btn-success btn-sm rounded-0"
                                            onClick={() => handleStatusChange('COMPLETED')}
                                            disabled={updating !== null}
                                        >
                                            {updating === 'COMPLETED' ? (
                                                <span className="spinner-border spinner-border-sm" role="status"></span>
                                            ) : 'Завершить заказ'}
                                        </button>
                                    )}
                                </div>

                                {/* Кнопка отмены - показываем только если заказ НЕ завершен и НЕ отменен */}
                                {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                                    <div className="border-start ps-3 ms-4">
                                        <button
                                            className="btn btn-outline-danger btn-sm rounded-0"
                                            onClick={handleCancelOrder}
                                            disabled={updating !== null}
                                            title="Отменить заказ"
                                        >
                                            <XCircle size={14} className="me-1" />
                                            Отменить заказ
                                        </button>
                                    </div>
                                )}

                                {/* УБИРАЕМ кнопку "Закрыть" - закрытие по клику на фон или крестик */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminOrdersPage;