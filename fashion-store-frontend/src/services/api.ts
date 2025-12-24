export type Product = {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    color?: string;
    size?: string;
    material?: string;
    careInstructions?: string;
    additionalImages?: string[];
}

const API_BASE_URL = 'https://api.palomica.ru/api';

export const productService = {
    async getAllProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return getMockProducts();
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching products:', error);
            return getMockProducts();
        }
    },

    async getProductById(id: number): Promise<Product | null> {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${id}`);
            if (!response.ok) {
                console.error(`HTTP error! status: ${response.status}`);
                return null;
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching product:', error);
            return null;
        }
    }
};

// Тестовые данные на случай если API не доступен
function getMockProducts(): Product[] {
    return [
        {
            id: 1,
            name: "Вечернее платье",
            description: "Элегантное платье для особых случаев. Идеально подходит для свадеб, выпускных и торжественных мероприятий.",
            price: 29900.0,
            imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
            color: "Чёрный",
            size: "XS,S,M,L",
            material: "Шёлк 100%",
            careInstructions: "Стирка при 30°C, не отбеливать, гладить на низкой температуре",
            additionalImages: [
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop"
            ]
        },
        {
            id: 2,
            name: "Шерстяной пиджак",
            description: "Классический пиджак премиального кроя. Идеален для офиса и деловых встреч.",
            price: 18900.0,
            imageUrl: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=800&h=1000&fit=crop",
            color: "Серый",
            size: "46,48,50,52,54",
            material: "Шерсть 80%, Полиэстер 20%",
            careInstructions: "Химчистка, не стирать",
            additionalImages: [
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop"
            ]
        },
        {
            id: 3,
            name: "Шелковая блуза",
            description: "Легкая блуза из натурального шелка. Удобная и элегантная на каждый день.",
            price: 12400.0,
            imageUrl: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=1000&fit=crop",
            color: "Белый",
            size: "XS,S,M,L",
            material: "Шёлк 100%",
            careInstructions: "Только ручная стирка, сухая чистка"
        },
        {
            id: 4,
            name: "Кожаная юбка",
            description: "Стильная юбка-карандаш из мягкой итальянской кожи. Тренд сезона.",
            price: 25600.0,
            imageUrl: "https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=800&h=1000&fit=crop",
            color: "Коричневый",
            size: "36,38,40,42",
            material: "Натуральная кожа",
            careInstructions: "Протирать влажной тряпкой, не стирать",
            additionalImages: [
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop"
            ]
        },
        {
            id: 5,
            name: "Кожаные брюки",
            description: "Узкие брюки из качественной кожи. Создают эффектный образ.",
            price: 28700.0,
            imageUrl: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=800&h=1000&fit=crop",
            color: "Чёрный",
            size: "38,40,42,44",
            material: "Натуральная кожа",
            careInstructions: "Протирать влажной тряпкой, специальный уход за кожей"
        },
        {
            id: 6,
            name: "Кашемировое пальто",
            description: "Теплое пальто из кашемира. Защищает от холода и выглядит роскошно.",
            price: 45200.0,
            imageUrl: "https://images.unsplash.com/photo-1539533018447-63f8ffe8568a?w=800&h=1000&fit=crop",
            color: "Бежевый",
            size: "S,M,L,XL",
            material: "Кашемир 90%, Шерсть 10%",
            careInstructions: "Химчистка, хранить в чехле",
            additionalImages: [
                "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop",
                "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop"
            ]
        }
    ];
}