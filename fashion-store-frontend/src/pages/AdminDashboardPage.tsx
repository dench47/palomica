// src/pages/AdminDashboardPage.tsx
import { useEffect, useState } from 'react';

const AdminDashboardPage = () => {
    const [stats, setStats] = useState({ totalProducts: 0, totalOrders: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('admin_token');

            const response = await fetch('/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}` // ← ДОБАВЬТЕ
                },
            });

            if (!response.ok) throw new Error('Ошибка загрузки');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div>Загрузка...</div>;
    }

    return (
        <div>
            <h2 className="fw-light mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Дашборд
            </h2>

            <div className="row mb-4">
                <div className="col-md-6 mb-3">
                    <div className="card rounded-0 border-1 h-100">
                        <div className="card-body">
                            <h5 className="card-title text-muted small mb-2">Товаров в каталоге</h5>
                            <h3 className="fw-light" style={{ fontSize: '2.5rem' }}>
                                {stats.totalProducts}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="col-md-6 mb-3">
                    <div className="card rounded-0 border-1 h-100">
                        <div className="card-body">
                            <h5 className="card-title text-muted small mb-2">Всего заказов</h5>
                            <h3 className="fw-light" style={{ fontSize: '2.5rem' }}>
                                {stats.totalOrders}
                            </h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Дополнительная статистика будет здесь */}
        </div>
    );
};

export default AdminDashboardPage;