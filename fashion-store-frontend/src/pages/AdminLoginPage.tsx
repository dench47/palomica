// src/pages/AdminLoginPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch('/api/admin/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && (data.token || data.success)) {
                if (data.token) {
                    localStorage.setItem('admin_token', data.token);
                }
                localStorage.setItem('admin_username', data.username || username);
                localStorage.setItem('admin_logged_in', 'true');
                localStorage.setItem('admin_role', data.role || 'ADMIN');

                navigate('/admin');
            } else {
                setError(data.message || 'Ошибка входа');
            }
        } catch  {
            setError('Ошибка соединения с сервером');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-fluid px-0 min-vh-100 d-flex align-items-center justify-content-center"
             style={{ backgroundColor: '#f8f9fa' }}>
            <div className="card rounded-0 border-0 shadow-sm" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body p-5">
                    <div className="text-center mb-4">
                        <h2 className="fw-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                            Вход в панель управления
                        </h2>
                        <p className="text-muted small">Fashion Store Administration</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        <div className="mb-3">
                            <label className="form-label small text-muted mb-2">Имя пользователя</label>
                            <input
                                type="text"
                                className="form-control rounded-0 border-1"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Введите логин"
                                required
                                autoFocus
                            />
                        </div>

                        <div className="mb-4">
                            <label className="form-label small text-muted mb-2">Пароль</label>
                            <input
                                type="password"
                                className="form-control rounded-0 border-1"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Введите пароль"
                                required
                            />
                        </div>

                        {error && (
                            <div className="alert alert-danger rounded-0 small mb-4" role="alert">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-dark rounded-0 w-100 py-3 fw-light"
                            disabled={loading}
                            style={{
                                letterSpacing: '0.1em',
                                fontSize: '0.9rem',
                                minHeight: '50px'
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                    ВХОД...
                                </>
                            ) : (
                                'ВОЙТИ'
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminLoginPage;