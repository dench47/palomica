import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import './App.css';

function App() {
    return (
        <div className="App d-flex flex-column min-vh-100">
            <Header />

            <main className="flex-grow-1">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductPage />} />
                    {/* Позже добавим другие маршруты:
                    <Route path="/catalog" element={<CatalogPage />} />
                    <Route path="/cart" element={<CartPage />} />
                    <Route path="/checkout" element={<CheckoutPage />} />
                    */}
                </Routes>
            </main>

            <Footer />
        </div>
    );
}

export default App;