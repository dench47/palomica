package com.example.fashionstorebackend.component;

import com.example.fashionstorebackend.model.Product;
import java.util.Arrays;
import java.util.List;

public class ProductFactory {

    // Путь к изображениям в статических ресурсах
    private static final String IMAGE_BASE_PATH = "/images/products/";

    // ========== ОДЕЖДА (CLOTHING) ==========

    public static Product createDress1() {
        Product dress = new Product(
                "Вечернее платье из шифона",
                "Элегантное вечернее платье из легкого шифона с цветочным принтом. Идеально для свадеб, выпускных и торжественных мероприятий. Имеет свободный крой и пояс для регулировки талии.",
                25900.0,
                IMAGE_BASE_PATH + "clothing/dress_1.jpg",
                "Чёрный с цветочным принтом",  // color
                "XS,S,M,L",  // size
                "Шифон 100%",  // material
                "Стирка при 30°C, не отжимать, сушить в расправленном виде"  // careInstructions
                // Category и Subcategory будут установлены в DataInitializer
        );
        dress.setAvailableQuantity(3);
        dress.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/dress_1.2.jpg",
                IMAGE_BASE_PATH + "clothing/dress_1.3.jpg"
        ));
        return dress;
    }

    public static Product createDress2() {
        Product dress = new Product(
                "Летнее платье с рюшами",
                "Стильное летнее платье с асимметричными рюшами и открытыми плечами. Идеально для летних вечеринок и отдыха. Выполнено из натурального хлопка.",
                18900.0,
                IMAGE_BASE_PATH + "clothing/dress_2.jpg",
                "Белый",  // color
                "S,M,L",  // size
                "Хлопок 100%",  // material
                "Стирка при 40°C, гладить при средней температуре"  // careInstructions
        );
        dress.setAvailableQuantity(3);
        dress.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/dress_2.2.jpg",
                IMAGE_BASE_PATH + "clothing/dress_2.3.jpg"
        ));
        return dress;
    }

    public static Product createShirt() {
        Product shirt = new Product(
                "Дизайнерская рубашка",
                "Стильная дизайнерская рубашка с объемными рукавами и вышивкой. Идеально сочетается с джинсами, брюками и юбками. Премиальное качество пошива.",
                14900.0,
                IMAGE_BASE_PATH + "clothing/shirt_1.jpg",
                "Бежевый",  // color
                "XS,S,M,L",  // size
                "Хлопок 100%",  // material
                "Стирка при 30°C, не отбеливать, гладить на низкой температуре"  // careInstructions
        );
        shirt.setAvailableQuantity(3);
        shirt.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/shirt_1.2.jpg",
                IMAGE_BASE_PATH + "clothing/shirt_1.3.jpg"
        ));
        return shirt;
    }

    public static Product createTop() {
        Product top = new Product(
                "Атласный топ с бантом",
                "Элегантный топ из атласной ткани с декоративным бантом на шее. Идеален для вечерних выходов и особых случаев. Комфортная посадка.",
                8900.0,
                IMAGE_BASE_PATH + "clothing/top_1.jpg",
                "Чёрный",  // color
                "XS,S,M",  // size
                "Атлас 100%",  // material
                "Химчистка, не стирать"  // careInstructions
        );
        top.setAvailableQuantity(3);
        top.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/top_1.2.jpg",
                IMAGE_BASE_PATH + "clothing/top_1.3.jpg"
        ));
        return top;
    }

    public static Product createVest() {
        Product vest = new Product(
                "Бархатный жилет",
                "Стильный бархатный жилет для создания элегантных образов. Идеально сочетается с рубашками, блузами и водолазками. Универсальный элемент гардероба.",
                12700.0,
                IMAGE_BASE_PATH + "clothing/vest_1.jpg",
                "Бордовый",  // color
                "S,M,L",  // size
                "Бархат 100%",  // material
                "Химчистка, хранить на вешалке"  // careInstructions
        );
        vest.setAvailableQuantity(3);
        vest.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/vest_1.2.jpg",
                IMAGE_BASE_PATH + "clothing/vest_1.3.jpg"
        ));
        return vest;
    }

    public static Product createSkirt1() {
        Product skirt = new Product(
                "Кожаная юбка-карандаш",
                "Стильная кожаная юбка-карандаш премиального качества. Идеальный выбор для офиса и вечерних выходов. Хорошо держит форму.",
                21800.0,
                IMAGE_BASE_PATH + "clothing/skirt_1.jpg",
                "Коричневый",  // color
                "36,38,40,42",  // size
                "Натуральная кожа",  // material
                "Протирать влажной тканью, использовать средства для ухода за кожей"  // careInstructions
        );
        skirt.setAvailableQuantity(3);
        skirt.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/skirt_1.2.jpg",
                IMAGE_BASE_PATH + "clothing/skirt_1.3.jpg"
        ));
        return skirt;
    }

    public static Product createSkirt2() {
        Product skirt = new Product(
                "Шерстяная юбка плиссе",
                "Элегантная юбка плиссе из шерсти. Классический фасон, подходит для любого времени года. Комфортная посадка.",
                15600.0,
                IMAGE_BASE_PATH + "clothing/skirt_2.jpg",
                "Серый",  // color
                "S,M,L",  // size
                "Шерсть 80%, Полиэстер 20%",  // material
                "Химчистка, не гладить"  // careInstructions
        );
        skirt.setAvailableQuantity(3);
        skirt.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/skirt_2.2.jpg",
                IMAGE_BASE_PATH + "clothing/skirt_2.3.jpg"
        ));
        return skirt;
    }

    public static Product createSkirt3() {
        Product skirt = new Product(
                "Джинсовая юбка миди",
                "Универсальная джинсовая юбка миди длины. Идеальна для повседневной носки. Выполнена из качественного денима.",
                9900.0,
                IMAGE_BASE_PATH + "clothing/skirt_3.jpg",
                "Голубой деним",  // color
                "36,38,40,42",  // size
                "Хлопок 98%, Эластан 2%",  // material
                "Стирка при 40°C, не отбеливать"  // careInstructions
        );
        skirt.setAvailableQuantity(3);
        skirt.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/skirt_3.2.jpg",
                IMAGE_BASE_PATH + "clothing/skirt_3.3.jpg"
        ));
        return skirt;
    }

    public static Product createAirBlouse() {
        Product blouse = new Product(
                "Воздушная блуза",
                "Легкая воздушная блуза из натуральной ткани. Имеет свободный крой и рюши. Идеальна для лета и теплой погоды.",
                11200.0,
                IMAGE_BASE_PATH + "clothing/air_1.jpg",
                "Белый",  // color
                "XS,S,M,L",  // size
                "Хлопок 100%",  // material
                "Ручная стирка, сушить в тени"  // careInstructions
        );
        blouse.setAvailableQuantity(3);
        blouse.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/air_1.2.jpg",
                IMAGE_BASE_PATH + "clothing/air_1.3.jpg"
        ));
        return blouse;
    }

    public static Product createPhotoBlouse() {
        Product blouse = new Product(
                "Блуза с драпировкой",
                "Элегантная блуза с драпировкой и французскими манжетами. Идеальна для деловых встреч и особых случаев.",
                13400.0,
                IMAGE_BASE_PATH + "clothing/photo_2025-12-26_22-55-22.jpg",
                "Бежевый",  // color
                "S,M,L",  // size
                "Шёлк 70%, Вискоза 30%",  // material
                "Химчистка"  // careInstructions
        );
        blouse.setAvailableQuantity(3);
        blouse.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "clothing/photo_2025-12-26_22-55-22_2.jpg",
                IMAGE_BASE_PATH + "clothing/photo_2025-12-26_22-55-22_3.jpg"
        ));
        return blouse;
    }

    // ========== АКСЕССУАРЫ (ACCESSORIES) ==========

    public static Product createBelt() {
        Product belt = new Product(
                "Кожаный ремень с пряжкой",
                "Качественный кожаный ремень с металлической пряжкой. Универсальный аксессуар для брюк, джинсов и юбок. Регулируемая длина.",
                4500.0,
                IMAGE_BASE_PATH + "accessories/belt_1.jpg",
                "Коричневый",  // color
                "75-85 см, 85-95 см, 95-105 см",  // size
                "Натуральная кожа, металлическая фурнитура",  // material
                "Протирать влажной тканью, использовать крем для кожи"  // careInstructions
        );
        belt.setAvailableQuantity(3);
        belt.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "accessories/belt_2.jpg",
                IMAGE_BASE_PATH + "accessories/belt_3.jpg"
        ));
        return belt;
    }

    public static Product createPeplum() {
        Product peplum = new Product(
                "Пеплум-баска",
                "Стильный пеплум (декоративная баска) для платьев и блузок. Создает эффект тонкой талии и добавляет элегантности любому наряду.",
                3200.0,
                IMAGE_BASE_PATH + "accessories/peplum_1.jpg",
                "Чёрный",  // color
                "Универсальный",  // size
                "Полиэстер 100%",  // material
                "Стирка при 30°C, не отжимать"  // careInstructions
        );
        peplum.setAvailableQuantity(3);
        peplum.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "accessories/peplum_2.jpg",
                IMAGE_BASE_PATH + "accessories/peplum_3.jpg"
        ));
        return peplum;
    }

    // ========== СУМКИ (BAGS) ==========

    public static Product createBag() {
        Product bag = new Product(
                "Сумка-тоут из экокожи",
                "Вместительная сумка-тоут из качественной экокожи. Имеет внутренний карман на молнии и крепкие ручки. Идеальна на каждый день.",
                18900.0,
                IMAGE_BASE_PATH + "bags/bag_1.jpg",
                "Чёрный",  // color
                null,  // size
                "Экокожа 100%, металлическая фурнитура",  // material
                "Протирать влажной тканью, избегать контакта с химическими веществами"  // careInstructions
        );
        bag.setAvailableQuantity(3);
        bag.setAdditionalImages(Arrays.asList(
                IMAGE_BASE_PATH + "bags/bag_1.2.jpg",
                IMAGE_BASE_PATH + "bags/bag_1.3.jpg"
        ));
        return bag;
    }

    // ========== ВСПОМОГАТЕЛЬНЫЙ МЕТОД ==========

    public static List<Product> createAllProducts() {
        return Arrays.asList(
                createDress1(),
                createDress2(),
                createShirt(),
                createTop(),
                createVest(),
                createSkirt1(),
                createSkirt2(),
                createSkirt3(),
                createAirBlouse(),
                createPhotoBlouse(),
                createBelt(),
                createPeplum(),
                createBag()
        );
    }
}