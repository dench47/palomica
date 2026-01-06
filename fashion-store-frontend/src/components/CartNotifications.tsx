import { useState, useEffect } from 'react';

interface Notification {
    id: number;
    message: string;
    type: 'info' | 'warning' | 'error';
}

const CartNotifications = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        const handleCartUpdate = (event: CustomEvent) => {
            setNotifications(prev => [{
                id: Date.now(),
                message: event.detail.message,
                type: event.detail.type || 'info'
            }, ...prev.slice(0, 4)]); // Максимум 5 уведомлений

            // Автоматическое удаление через 5 секунд
            setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== Date.now()));
            }, 5000);
        };

        window.addEventListener('cart-notification', handleCartUpdate as EventListener);
        return () => window.removeEventListener('cart-notification', handleCartUpdate as EventListener);
    }, []);

    if (notifications.length === 0) return null;

    return (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1050 }}>
            {notifications.map(notification => (
                <div
                    key={notification.id}
                    className={`alert alert-${notification.type} alert-dismissible fade show shadow`}
                    style={{ minWidth: '300px' }}
                >
                    {notification.message}
                    <button
                        type="button"
                        className="btn-close"
                        onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
                    />
                </div>
            ))}
        </div>
    );
};

export default CartNotifications;