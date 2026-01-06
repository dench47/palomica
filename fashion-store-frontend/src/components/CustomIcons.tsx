import { ShoppingBag, CheckCircle, AlertCircle, Info, XCircle, RefreshCw, Package, Truck, Shield } from 'lucide-react';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const CartIcons = {
    success: <CheckCircle size={20} color="#28a745" />,
    error: <XCircle size={20} color="#dc3545" />,
    warning: <AlertCircle size={20} color="#ffc107" />,
    info: <Info size={20} color="#17a2b8" />,
    bag: <ShoppingBag size={20} color="#212529" />,
    sync: <RefreshCw size={20} color="#17a2b8" />,
    package: <Package size={20} color="#28a745" />,
    truck: <Truck size={20} color="#28a745" />,
    shield: <Shield size={20} color="#28a745" />
};


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { CartIcons } from './CustomIcons';
import toast from "react-hot-toast";

// В toast:
toast.success(
    <div className="d-flex align-items-center">
        {CartIcons.success}
        <span className="ms-2" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
            Товар добавлен в корзину
        </span>
    </div>,
    { /* ... options */ }
);