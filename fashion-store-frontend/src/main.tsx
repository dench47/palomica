// ЗАМЕНИТЬ ВЕСЬ main.tsx на:
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { CartProvider } from './context/CartContext';
import { BrowserRouter as Router } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')!).render(
    // УБРАЛ <React.StrictMode> - это вызывает двойной рендеринг в dev
    <Router>
        <CartProvider>
            <App />
        </CartProvider>
    </Router>
);