import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import CatalogPage from './pages/CatalogPage';
import SearchPage from './pages/SearchPage';
import AuthChoicePage from './pages/AuthChoicePage';

import './App.css';

function App() {
    return (
        <div className="App d-flex flex-column min-vh-100 bg-cream"> {/* ИЗМЕНЕНО: добавлен bg-cream */}
            <Header />
            <main className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/auth-choice" element={<AuthChoicePage />} />
                </Routes>
            </main>
            <Footer />
        </div>
    );
}

export default App;