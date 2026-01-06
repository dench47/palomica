// src/components/admin/ProtectedRoute.tsx
import {type ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('admin_token');
            const loggedIn = localStorage.getItem('admin_logged_in') === 'true';
            setIsAuthenticated(!!(token && loggedIn));
        };

        checkAuth();
    }, []);

    if (isAuthenticated === null) {
        return (
            <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
                <div className="text-center">
                    <div className="spinner-border text-dark mb-3" role="status">
                        <span className="visually-hidden">Загрузка...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }

    return <>{children}</>;
};
export default ProtectedRoute;