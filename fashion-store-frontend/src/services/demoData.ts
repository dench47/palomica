// Демо-данные витрины: воссоздают отклик Spring-бэкенда без сервера.
// Источник: DataInitializer / ProductFactory из fashion-store-backend.

export interface DemoVariant {
    id: number;
    size: string;
    availableQuantity: number;
    reservedQuantity: number;
    actuallyAvailable: number;
}

export interface DemoProduct {
    id: number;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    color: string;
    material: string;
    careInstructions: string;
    additionalImages: string[];
    category: string;
    subcategory: string;
    variants: DemoVariant[];
}

let variantId = 1;
const variant = (size: string): DemoVariant => ({
    id: variantId++,
    size,
    availableQuantity: 3,
    reservedQuantity: 0,
    actuallyAvailable: 3,
});

const IMG = (p: string) => `${import.meta.env.BASE_URL}images/products/${p}`;

export const DEMO_CATEGORIES = [
    { id: 1, name: 'одежда', description: 'Одежда для женщин и мужчин', displayOrder: 1, isActive: true },
    { id: 2, name: 'сумки', description: 'Сумки, рюкзаки, кошельки', displayOrder: 2, isActive: true },
    { id: 3, name: 'аксессуары', description: 'Аксессуары и украшения', displayOrder: 3, isActive: true },
    { id: 4, name: 'обувь', description: 'Обувь для любого сезона', displayOrder: 4, isActive: true },
];

export const DEMO_SUBCATEGORIES = [
    { id: 1, name: 'платья', description: 'Вечерние и повседневные платья', categoryId: 1, categoryName: 'одежда', displayOrder: 1, isActive: true },
    { id: 2, name: 'юбки', description: 'Юбки различных фасонов', categoryId: 1, categoryName: 'одежда', displayOrder: 2, isActive: true },
    { id: 3, name: 'блузки', description: 'Блузки и топы', categoryId: 1, categoryName: 'одежда', displayOrder: 3, isActive: true },
    { id: 4, name: 'брюки', description: 'Брюки и джинсы', categoryId: 1, categoryName: 'одежда', displayOrder: 4, isActive: true },
    { id: 5, name: 'костюмы', description: 'Костюмы и жакеты', categoryId: 1, categoryName: 'одежда', displayOrder: 5, isActive: true },
    { id: 6, name: 'верхняя одежда', description: 'Пальто, куртки, пуховики', categoryId: 1, categoryName: 'одежда', displayOrder: 6, isActive: true },
    { id: 7, name: 'топы', description: 'Топы и майки', categoryId: 1, categoryName: 'одежда', displayOrder: 7, isActive: true },
    { id: 8, name: 'рубашки', description: 'Рубашки и сорочки', categoryId: 1, categoryName: 'одежда', displayOrder: 8, isActive: true },
    { id: 9, name: 'футболки', description: 'Футболки и лонгсливы', categoryId: 1, categoryName: 'одежда', displayOrder: 9, isActive: true },
    { id: 10, name: 'клатчи', description: 'Вечерние клатчи', categoryId: 2, categoryName: 'сумки', displayOrder: 1, isActive: true },
    { id: 11, name: 'сумки через плечо', description: 'Повседневные сумки', categoryId: 2, categoryName: 'сумки', displayOrder: 2, isActive: true },
    { id: 12, name: 'рюкзаки', description: 'Стильные рюкзаки', categoryId: 2, categoryName: 'сумки', displayOrder: 3, isActive: true },
    { id: 13, name: 'кошельки', description: 'Кошельки и портмоне', categoryId: 2, categoryName: 'сумки', displayOrder: 4, isActive: true },
    { id: 14, name: 'дорожные сумки', description: 'Сумки для путешествий', categoryId: 2, categoryName: 'сумки', displayOrder: 5, isActive: true },
    { id: 15, name: 'шопперы', description: 'Сумки-шопперы', categoryId: 2, categoryName: 'сумки', displayOrder: 6, isActive: true },
    { id: 16, name: 'украшения', description: 'Бижутерия и ювелирные изделия', categoryId: 3, categoryName: 'аксессуары', displayOrder: 1, isActive: true },
    { id: 17, name: 'пояса', description: 'Ремни и пояса', categoryId: 3, categoryName: 'аксессуары', displayOrder: 2, isActive: true },
    { id: 18, name: 'шарфы', description: 'Шарфы и платки', categoryId: 3, categoryName: 'аксессуары', displayOrder: 3, isActive: true },
    { id: 19, name: 'головные уборы', description: 'Шляпы, кепки, береты', categoryId: 3, categoryName: 'аксессуары', displayOrder: 4, isActive: true },
    { id: 20, name: 'перчатки', description: 'Перчатки и варежки', categoryId: 3, categoryName: 'аксессуары', displayOrder: 5, isActive: true },
    { id: 21, name: 'баски', description: 'Пеплумы и баски', categoryId: 3, categoryName: 'аксессуары', displayOrder: 6, isActive: true },
    { id: 22, name: 'туфли', description: 'Туфли на каблуке и без', categoryId: 4, categoryName: 'обувь', displayOrder: 1, isActive: true },
    { id: 23, name: 'босоножки', description: 'Летние босоножки', categoryId: 4, categoryName: 'обувь', displayOrder: 2, isActive: true },
    { id: 24, name: 'кроссовки', description: 'Спортивная обувь', categoryId: 4, categoryName: 'обувь', displayOrder: 3, isActive: true },
    { id: 25, name: 'сапоги', description: 'Сапоги и ботинки', categoryId: 4, categoryName: 'обувь', displayOrder: 4, isActive: true },
    { id: 26, name: 'балетки', description: 'Удобные балетки', categoryId: 4, categoryName: 'обувь', displayOrder: 5, isActive: true },
    { id: 27, name: 'сандалии', description: 'Пляжные сандалии', categoryId: 4, categoryName: 'обувь', displayOrder: 6, isActive: true },
];

const P = (
    id: number, name: string, description: string, price: number,
    img: string, color: string, material: string, care: string,
    add: string[], category: string, subcategory: string, sizes: string[],
): DemoProduct => ({
    id, name, description, price,
    imageUrl: IMG(img),
    color, material, careInstructions: care,
    additionalImages: add.map(IMG),
    category, subcategory,
    variants: sizes.map(variant),
});

export const DEMO_PRODUCTS: DemoProduct[] = [
    P(1, 'Вечернее платье из шифона',
        'Элегантное вечернее платье из легкого шифона с цветочным принтом. Идеально для свадеб, выпускных и торжественных мероприятий. Имеет свободный крой и пояс для регулировки талии.',
        25900, 'clothing/dress_1.jpg', 'Чёрный с цветочным принтом', 'Шифон 100%',
        'Стирка при 30°C, не отжимать, сушить в расправленном виде',
        ['clothing/dress_1.2.jpg', 'clothing/dress_1.3.jpg'],
        'одежда', 'платья', ['XS', 'S', 'M', 'L']),
    P(2, 'Летнее платье с рюшами',
        'Стильное летнее платье с асимметричными рюшами и открытыми плечами. Идеально для летних вечеринок и отдыха. Выполнено из натурального хлопка.',
        18900, 'clothing/dress_2.jpg', 'Белый', 'Хлопок 100%',
        'Стирка при 40°C, гладить при средней температуре',
        ['clothing/dress_2.2.jpg', 'clothing/dress_2.3.jpg'],
        'одежда', 'платья', ['S', 'M', 'L']),
    P(3, 'Дизайнерская рубашка',
        'Стильная дизайнерская рубашка с объемными рукавами и вышивкой. Идеально сочетается с джинсами, брюками и юбками. Премиальное качество пошива.',
        14900, 'clothing/shirt_1.jpg', 'Бежевый', 'Хлопок 100%',
        'Стирка при 30°C, не отбеливать, гладить на низкой температуре',
        ['clothing/shirt_1.2.jpg', 'clothing/shirt_1.3.jpg'],
        'одежда', 'рубашки', ['XS', 'S', 'M', 'L']),
    P(4, 'Атласный топ с бантом',
        'Элегантный топ из атласной ткани с декоративным бантом на шее. Идеален для вечерних выходов и особых случаев. Комфортная посадка.',
        8900, 'clothing/top_1.jpg', 'Чёрный', 'Атлас 100%',
        'Химчистка, не стирать',
        ['clothing/top_1.2.jpg', 'clothing/top_1.3.jpg'],
        'одежда', 'топы', ['XS', 'S', 'M']),
    P(5, 'Бархатный жилет',
        'Стильный бархатный жилет для создания элегантных образов. Идеально сочетается с рубашками, блузами и водолазками. Универсальный элемент гардероба.',
        12700, 'clothing/vest_1.jpg', 'Бордовый', 'Бархат 100%',
        'Химчистка, хранить на вешалке',
        ['clothing/vest_1.2.jpg', 'clothing/vest_1.3.jpg'],
        'одежда', 'костюмы', ['S', 'M', 'L']),
    P(6, 'Кожаная юбка-карандаш',
        'Стильная кожаная юбка-карандаш премиального качества. Идеальный выбор для офиса и вечерних выходов. Хорошо держит форму.',
        21800, 'clothing/skirt_1.jpg', 'Коричневый', 'Натуральная кожа',
        'Протирать влажной тканью, использовать средства для ухода за кожей',
        [],
        'одежда', 'юбки', ['36', '38', '40', '42']),
    P(7, 'Шерстяная юбка плиссе',
        'Элегантная юбка плиссе из шерсти. Классический фасон, подходит для любого времени года. Комфортная посадка.',
        15600, 'clothing/skirt_2.jpg', 'Серый', 'Шерсть 80%, Полиэстер 20%',
        'Химчистка, не гладить',
        [],
        'одежда', 'юбки', ['S', 'M', 'L']),
    P(8, 'Джинсовая юбка миди',
        'Универсальная джинсовая юбка миди длины. Идеальна для повседневной носки. Выполнена из качественного денима.',
        9900, 'clothing/skirt_3.jpg', 'Голубой деним', 'Хлопок 98%, Эластан 2%',
        'Стирка при 40°C, не отбеливать',
        [],
        'одежда', 'юбки', ['36', '38', '40', '42']),
    P(9, 'Воздушная блуза',
        'Легкая воздушная блуза из натуральной ткани. Имеет свободный крой и рюши. Идеальна для лета и теплой погоды.',
        11200, 'clothing/air_1.jpg', 'Белый', 'Хлопок 100%',
        'Ручная стирка, сушить в тени',
        [],
        'одежда', 'блузки', ['XS', 'S', 'M', 'L']),
    P(10, 'Блуза с драпировкой',
        'Элегантная блуза с драпировкой и французскими манжетами. Идеальна для деловых встреч и особых случаев.',
        13400, 'clothing/photo_2025-12-26_22-55-22.jpg', 'Бежевый', 'Шёлк 70%, Вискоза 30%',
        'Химчистка',
        ['clothing/photo_2025-12-26_22-55-22 (2).jpg', 'clothing/photo_2025-12-26_22-55-22 (3).jpg'],
        'одежда', 'блузки', ['S', 'M', 'L']),
    P(11, 'Кожаный ремень с пряжкой',
        'Качественный кожаный ремень с металлической пряжкой. Универсальный аксессуар для брюк, джинсов и юбок. Регулируемая длина.',
        4500, 'accessories/belt_1.jpg', 'Коричневый', 'Натуральная кожа, металлическая фурнитура',
        'Протирать влажной тканью, использовать крем для кожи',
        ['accessories/belt_2.jpg', 'accessories/belt_3.jpg'],
        'аксессуары', 'пояса', ['75-85 см', '85-95 см', '95-105 см']),
    P(12, 'Пеплум-баска',
        'Стильный пеплум (декоративная баска) для платьев и блузок. Создает эффект тонкой талии и добавляет элегантности любому наряду.',
        3200, 'accessories/peplum_1.jpg', 'Чёрный', 'Полиэстер 100%',
        'Стирка при 30°C, не отжимать',
        ['accessories/peplum_2.jpg', 'accessories/peplum_3.jpg'],
        'аксессуары', 'баски', ['Универсальный']),
    P(13, 'Сумка-тоут из экокожи',
        'Вместительная сумка-тоут из качественной экокожи. Имеет внутренний карман на молнии и крепкие ручки. Идеальна на каждый день.',
        18900, 'bags/bag_1.jpg', 'Чёрный', 'Экокожа 100%, металлическая фурнитура',
        'Протирать влажной тканью, избегать контакта с химическими веществами',
        ['bags/bag_1.2.jpg', 'bags/bag_1.3.jpg'],
        'сумки', 'шопперы', ['ONE SIZE']),
];
