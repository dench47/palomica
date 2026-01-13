import {Routes, Route} from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CatalogPage from './pages/CatalogPage';
import SearchPage from './pages/SearchPage';
import CartNotifications from './components/CartNotifications';
import {CartProvider} from './context/CartContext';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductsPage from './pages/AdminProductsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import OrderPage from './pages/OrderPage';



import {Toaster} from 'react-hot-toast';
import './App.css';

function App() {
    return (
        <CartProvider>
            <div className="App d-flex flex-column min-vh-100 bg-cream">
                <Toaster
                    position="bottom-right"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            background: '#f8f9fa',
                            color: '#212529',
                            border: '1px solid #dee2e6',
                            fontFamily: "'Cormorant Garamond', serif",
                            fontSize: '1rem',
                            borderRadius: '0',
                            padding: '16px 20px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            letterSpacing: '0.02em'
                        },
                        success: {
                            style: {
                                borderLeft: '4px solid #28a745',
                            },
                            iconTheme: {
                                primary: '#28a745',
                                secondary: '#fff',
                            },
                        },
                        error: {
                            style: {
                                borderLeft: '4px solid #dc3545',
                            },
                            iconTheme: {
                                primary: '#dc3545',
                                secondary: '#fff',
                            },
                        },
                    }}
                />
                <CartNotifications/>
                <Header/>
                <main className="flex-grow-1">
                    <Routes>
                        <Route path="/" element={<HomePage/>}/>
                        <Route path="/product/:id" element={<ProductPage/>}/>
                        <Route path="/cart" element={<CartPage/>}/>
                        <Route path="/checkout" element={<CheckoutPage/>}/>
                        <Route path="/catalog" element={<CatalogPage/>}/>
                        <Route path="/search" element={<SearchPage/>}/>
                        <Route path="/order/:orderId" element={<OrderPage />} />

                        {/* Админ маршруты */}
                        <Route path="/admin/login" element={<AdminLoginPage />} />

                        <Route path="/admin" element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminDashboardPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/products" element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminProductsPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        } />

                        <Route path="/admin/orders" element={
                            <ProtectedRoute>
                                <AdminLayout>
                                    <AdminOrdersPage />
                                </AdminLayout>
                            </ProtectedRoute>
                        } />
                    </Routes>
                </main>
                <Footer/>
            </div>
        </CartProvider>
    );
}

export default App;