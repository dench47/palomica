const API_BASE = '/api/admin';
const AUTH_BASE = '/api/admin/auth';

export const adminService = {
    async login(username: string, password: string) {
        const response = await fetch(`${AUTH_BASE}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        return response.json();
    },

    async validateToken(token: string) {
        const response = await fetch(`${AUTH_BASE}/validate`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.json();
    },

    async getProducts(token: string) {
        const response = await fetch(`${API_BASE}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.json();
    },

    async getOrders(token: string) {
        const response = await fetch(`${API_BASE}/orders`, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

        return response.json();
    },
};