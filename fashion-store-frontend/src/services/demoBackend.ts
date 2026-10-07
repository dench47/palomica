// Локальный обработчик /api-запросов для демо-режима (VITE_DEMO=1).
// Возвращает те же формы ответов, что Spring-бэкенд, данные из demoData.
// Заказы сохраняются в localStorage, чтобы страница заказа работала после
// отправки корзины и перезагрузки.

import { DEMO_CATEGORIES, DEMO_PRODUCTS, DEMO_SUBCATEGORIES } from './demoData';
import type { DemoProduct } from './demoData';

interface StoredOrderItem {
    id: number;
    quantity: number;
    price: number;
    size?: string;
    color?: string;
    product: DemoProduct;
}

interface StoredOrder {
    id: number;
    orderNumber: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string;
    deliveryAddress: string;
    deliveryMethod: string;
    paymentMethod: string;
    comment?: string;
    totalAmount: number;
    status: string;
    accessToken: string;
    createdAt: string;
    items: StoredOrderItem[];
}

const ORDERS_KEY = 'demo_orders';

const readOrders = (): Record<string, StoredOrder> => {
    try {
        return JSON.parse(localStorage.getItem(ORDERS_KEY) || '{}');
    } catch {
        return {};
    }
};

const writeOrders = (orders: Record<string, StoredOrder>) => {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};

const json = (body: unknown, status = 200): Response =>
    new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

const publicProduct = (p: DemoProduct): DemoProduct & Record<string, unknown> => ({
    ...p,
    additionalImages: p.additionalImages,
});

/**
 * Обрабатывает запрос к /api в демо-режиме.
 * Возвращает Response для fetch-совместимой семантики.
 */
export const demoFetch = async (path: string, init?: RequestInit): Promise<Response> => {
    const method = (init?.method || 'GET').toUpperCase();
    const [rawPath, rawQuery] = path.split('?');
    const query = new URLSearchParams(rawQuery || '');
    const clean = rawPath.replace(/\/+$/, '') || '/';

    await new Promise((resolve) => setTimeout(resolve, 120)); // лёгкий "сетевой" такт

    if (clean === '/api/public/config/yandex') {
        return json({ geocoderApiKey: '' });
    }
    if (clean === '/api/public/config/all') {
        return json({ demo: true, siteName: 'PALOMICA demo' });
    }
    if (clean === '/api/categories') {
        return json(DEMO_CATEGORIES.map((c) => ({
            ...c,
            subcategories: DEMO_SUBCATEGORIES.filter((s) => s.categoryId === c.id),
        })));
    }
    let m = clean.match(/^\/api\/categories\/(\d+)\/subcategories$/);
    if (m) {
        return json(DEMO_SUBCATEGORIES.filter((s) => s.categoryId === Number(m![1])));
    }
    if (clean === '/api/products' && method === 'GET') {
        return json(DEMO_PRODUCTS.map(publicProduct));
    }
    m = clean.match(/^\/api\/products\/(\d+)$/);
    if (m) {
        const product = DEMO_PRODUCTS.find((p) => p.id === Number(m![1]));
        return product ? json(publicProduct(product)) : json({ error: 'not found' }, 404);
    }
    m = clean.match(/^\/api\/products\/(\d+)\/sizes$/);
    if (m) {
        const product = DEMO_PRODUCTS.find((p) => p.id === Number(m![1]));
        return product ? json(product.variants.map((v) => v.size)) : json([], 404);
    }
    m = clean.match(/^\/api\/products\/(\d+)\/availability$/);
    if (m) {
        const product = DEMO_PRODUCTS.find((p) => p.id === Number(m![1]));
        const size = query.get('size') || '';
        const v = product?.variants.find((x) => x.size === size);
        return json(v ? v.actuallyAvailable : 0);
    }
    if (clean === '/api/orders' && method === 'POST') {
        const body = JSON.parse(String(init?.body || '{}')) as {
            customerName: string;
            customerEmail: string;
            customerPhone: string;
            deliveryAddress: string;
            deliveryMethod: string;
            paymentMethod: string;
            comment?: string;
            items: { productId: number; quantity: number; size?: string; color?: string }[];
        };
        const id = Date.now();
        const orderNumber = `ORD-${String(id).slice(-6)}`;
        const items: StoredOrderItem[] = [];
        (body.items || []).forEach((row, index) => {
            const product = DEMO_PRODUCTS.find((p) => p.id === row.productId);
            if (!product) return;
            items.push({
                id: index + 1,
                quantity: row.quantity,
                price: product.price,
                size: row.size,
                color: row.color || product.color,
                product,
            });
        });
        const order: StoredOrder = {
            id,
            orderNumber,
            customerName: body.customerName,
            customerEmail: body.customerEmail,
            customerPhone: body.customerPhone,
            deliveryAddress: body.deliveryAddress,
            deliveryMethod: body.deliveryMethod,
            paymentMethod: body.paymentMethod,
            comment: body.comment,
            totalAmount: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            status: 'Оформлен (демо)',
            accessToken: 'demo-token',
            createdAt: new Date().toISOString(),
            items,
        };
        const orders = readOrders();
        orders[String(id)] = order;
        writeOrders(orders);
        return json({ orderId: id, orderNumber, accessToken: 'demo-token' });
    }
    m = clean.match(/^\/api\/public\/orders\/(\d+)$/);
    if (m) {
        const order = readOrders()[m![1]];
        return order ? json(order) : json({ error: 'not found' }, 404);
    }
    m = clean.match(/^\/api\/public\/orders\/(\d+)\/reorder$/);
    if (m) {
        const order = readOrders()[m![1]];
        return order ? json(order.items.map((i) => ({ ...i.product, quantity: i.quantity, size: i.size }))) : json([], 404);
    }

    return json({ error: 'demo: unknown route', path: clean }, 404);
};
