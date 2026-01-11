package com.example.fashionstorebackend.component;

import com.example.fashionstorebackend.model.Product;
import java.util.Arrays;
import java.util.List;

public class ProductFactory {

    // Путь к изображениям в статических ресурсах
    private static final String IMAGE_BASE_PATH = "/images/products/";

    // Вспомогательный метод для создания вариантов
    private static void createVariantsForProduct(Product product, String sizeString, int quantityPerSize) {
        if (sizeString != null && !sizeString.trim().isEmpty()) {
            String[] sizes = sizeString.split(",");
            for (String size : sizes) {
                String trimmedSize = size.trim();
                if (!trimmedSize.isEmpty()) {
                    product.addVariant(trimmedSize, quantityPerSize);
                }
            }
        } else {
            // Если размеров нет, создаем один вариант без размера
            product.addVariant("ONE SIZE", quantityPerSize);
        }
    }

    // ========== ОДЕЖДА (CLOTHING) ==========

    public static Product createDress1() {
        Product dress = new Product(
                "Вечернее платье из шифона",
                "Элегантное вечернее платье из легкого шифона с цветочным принтом. Идеально для свадеб, выпускных и торжественных мероприятий. Имеет свободный крой и пояс для регулировки талии.",
                25900.0,
                IMAGE_BASE_PATH + "clothing/dress_1.jpg",
                "Чёрный с цветочным принтом",  // color
                "Шифон 100%",  // material
                "Стирка при 30°C, не отжимать, сушить в расправленном виде"  // careInstructions
        );
        // Создаем варианты по размерам
        createVariantsForProduct(dress, "XS,S,M,L", 3);

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
                "Хлопок 100%",  // material
                "Стирка при 40°C, гладить при средней температуре"  // careInstructions
        );
        createVariantsForProduct(dress, "S,M,L", 3);

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
                "Хлопок 100%",  // material
                "Стирка при 30°C, не отбеливать, гладить на низкой температуре"  // careInstructions
        );
        createVariantsForProduct(shirt, "XS,S,M,L", 3);

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
                "Атлас 100%",  // material
                "Химчистка, не стирать"  // careInstructions
        );
        createVariantsForProduct(top, "XS,S,M", 3);

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
                "Бархат 100%",  // material
                "Химчистка, хранить на вешалке"  // careInstructions
        );
        createVariantsForProduct(vest, "S,M,L", 3);

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
                "Натуральная кожа",  // material
                "Протирать влажной тканью, использовать средства для ухода за кожей"  // careInstructions
        );
        createVariantsForProduct(skirt, "36,38,40,42", 3);

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
                "Шерсть 80%, Полиэстер 20%",  // material
                "Химчистка, не гладить"  // careInstructions
        );
        createVariantsForProduct(skirt, "S,M,L", 3);

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
                "Хлопок 98%, Эластан 2%",  // material
                "Стирка при 40°C, не отбеливать"  // careInstructions
        );
        createVariantsForProduct(skirt, "36,38,40,42", 3);

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
                "Хлопок 100%",  // material
                "Ручная стирка, сушить в тени"  // careInstructions
        );
        createVariantsForProduct(blouse, "XS,S,M,L", 3);

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
                "Шёлк 70%, Вискоза 30%",  // material
                "Химчистка"  // careInstructions
        );
        createVariantsForProduct(blouse, "S,M,L", 3);

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
                "Натуральная кожа, металлическая фурнитура",  // material
                "Протирать влажной тканью, использовать крем для кожи"  // careInstructions
        );
        createVariantsForProduct(belt, "75-85 см, 85-95 см, 95-105 см", 3);

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
                "Полиэстер 100%",  // material
                "Стирка при 30°C, не отжимать"  // careInstructions
        );
        createVariantsForProduct(peplum, "Универсальный", 3);

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
                "Экокожа 100%, металлическая фурнитура",  // material
                "Протирать влажной тканью, избегать контакта с химическими веществами"  // careInstructions
        );
        // У сумки нет размеров, создаем один вариант
        createVariantsForProduct(bag, null, 3);

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