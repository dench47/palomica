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
                {/* Единый Toaster для всего приложения */}
                <Toaster
                    position="top-center"
                    toastOptions={{
                        duration: 3000,
                        style: {
                            fontFamily: "'Cormorant Garamond', serif",
                        },
                        success: {
                            iconTheme: {
                                primary: '#28a745',
                                secondary: '#faf9f6'
                            }
                        },
                        error: {
                            iconTheme: {
                                primary: '#dc3545',
                                secondary: '#faf9f6'
                            }
                        }
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