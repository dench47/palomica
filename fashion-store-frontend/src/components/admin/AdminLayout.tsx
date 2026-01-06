// src/components/admin/AdminLayout.tsx
// src/components/admin/AdminLayout.tsx
import type {ReactNode} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Package, ShoppingBag, BarChart3, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('admin_logged_in');
        navigate('/admin/login');
    };

    const menuItems = [
        { path: '/admin', icon: BarChart3, label: 'Дашборд' },
        { path: '/admin/products', icon: Package, label: 'Товары' },
        { path: '/admin/orders', icon: ShoppingBag, label: 'Заказы' },
    ];

    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="container-fluid px-0" style={{ minHeight: '100vh' }}>
            {/* Mobile Header */}
            <div className="d-lg-none d-flex align-items-center justify-content-between p-3 border-bottom bg-white">
                <div>
                    <h5 className="mb-0 fw-light" style={{ fontFamily: "'Playfair Display', serif" }}>
                        Админ-панель
                    </h5>
                </div>
                <button
                    className="btn btn-link text-dark p-0"
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            <div className="row g-0">
                {/* Sidebar */}
                <div className={`col-lg-2 ${sidebarOpen ? 'd-block' : 'd-none'} d-lg-block bg-dark text-white`}
                     style={{ minHeight: '100vh' }}>
                    <div className="p-4">
                        {/* Logo/Title */}
                        <div className="mb-5">
                            <h4 className="fw-light mb-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                                Fashion Store
                            </h4>
                            <p className="small text-muted mb-0">Админ-панель</p>
                        </div>

                        {/* Menu */}
                        <nav className="mb-5">
                            {menuItems.map((item) => {
                                const Icon = item.icon;
                                const active = isActive(item.path);

                                return (
                                    <button
                                        key={item.path}
                                        className={`btn w-100 text-start mb-2 rounded-0 py-3 d-flex align-items-center ${
                                            active
                                                ? 'bg-white text-dark'
                                                : 'text-white hover-bg-gray-800'
                                        }`}
                                        onClick={() => {
                                            navigate(item.path);
                                            setSidebarOpen(false);
                                        }}
                                        style={{
                                            border: 'none',
                                            fontFamily: "'Cormorant Garamond', serif",
                                            fontSize: '1rem'
                                        }}
                                    >
                                        <Icon size={18} className="me-3" />
                                        {item.label}
                                    </button>
                                );
                            })}
                        </nav>

                        {/* Logout Button */}
                        <div className="mt-5 pt-5 border-top">
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline-light rounded-0 w-100 py-3 d-flex align-items-center justify-content-center"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '0.9rem',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <LogOut size={16} className="me-2" />
                                ВЫЙТИ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="col-lg-10">
                    {/* Desktop Header */}
                    <div className="d-none d-lg-block border-bottom bg-white p-4">
                        <div className="d-flex justify-content-between align-items-center">
                            <div>
                                <h3 className="fw-light mb-0" style={{ fontFamily: "'Playfair Display', serif" }}>
                                    {menuItems.find(item => isActive(item.path))?.label || 'Админ-панель'}
                                </h3>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="btn btn-outline-dark rounded-0 d-flex align-items-center"
                                style={{
                                    fontFamily: "'Cormorant Garamond', serif",
                                    fontSize: '0.9rem',
                                    letterSpacing: '0.05em'
                                }}
                            >
                                <LogOut size={16} className="me-2" />
                                Выйти
                            </button>
                        </div>
                    </div>

                    {/* Page Content */}
                    <div className="p-4">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;