// Тестовые данные вместо запроса к API
const mockProducts = [
    {
        id: 1,
        name: "Вечернее платье",
        description: "Элегантное платье для особых случаев",
        price: 29900.0,
        imageUrl: "https://via.placeholder.com/300x400/FFC0CB/000000?text=Dress+1"
    },
    {
        id: 2,
        name: "Шерстяной пиджак",
        description: "Классический пиджак премиального кроя",
        price: 18900.0,
        imageUrl: "https://via.placeholder.com/300x400/ADD8E6/000000?text=Blazer+2"
    },
    {
        id: 3,
        name: "Шелковая блуза",
        description: "Легкая блуза из натурального шелка",
        price: 12400.0,
        imageUrl: "https://via.placeholder.com/300x400/FFFACD/000000?text=Blouse+3"
    },
    {
        id: 4,
        name: "Кожаная юбка",
        description: "Стильная юбка-карандаш из мягкой кожи",
        price: 25600.0,
        imageUrl: "https://via.placeholder.com/300x400/8FBC8F/000000?text=Skirt+4"
    },
    {
        id: 5,
        name: "Кожаные брюки",
        description: "Узкие брюки из качественной кожи",
        price: 28700.0,
        imageUrl: "https://via.placeholder.com/300x400/D3D3D3/000000?text=Pants+5"
    },
    {
        id: 6,
        name: "Кашемировое пальто",
        description: "Теплое пальто из кашемира",
        price: 45200.0,
        imageUrl: "https://via.placeholder.com/300x400/A0522D/FFFFFF?text=Coat+6"
    }
];

export const productService = {
    async getAllProducts() {
        // Имитируем загрузку с задержкой
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockProducts;
    }
};

export type Product = typeof mockProducts[0];