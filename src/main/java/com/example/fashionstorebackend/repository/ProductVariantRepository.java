package com.example.fashionstorebackend.repository;

import com.example.fashionstorebackend.model.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, Long> {

    // Найти все варианты для продукта
    List<ProductVariant> findByProductId(Long productId);

    // Найти вариант по продукту и размеру
    Optional<ProductVariant> findByProductIdAndSize(Long productId, String size);

    // Найти варианты по списку ID продуктов
    List<ProductVariant> findByProductIdIn(List<Long> productIds);

    // Найти вариант по ID продукта и размеру (с блокировкой для обновления)
    @Query("SELECT v FROM ProductVariant v WHERE v.product.id = :productId AND v.size = :size")
    Optional<ProductVariant> findByProductIdAndSizeWithLock(@Param("productId") Long productId, @Param("size") String size);

    // Резервирование количества
    @Modifying
    @Transactional
    @Query("UPDATE ProductVariant v SET v.reservedQuantity = v.reservedQuantity + :quantity " +
            "WHERE v.id = :variantId AND v.availableQuantity - v.reservedQuantity >= :quantity")
    int reserveQuantity(@Param("variantId") Long variantId, @Param("quantity") Integer quantity);

    // Освобождение резервирования
    @Modifying
    @Transactional
    @Query("UPDATE ProductVariant v SET v.reservedQuantity = GREATEST(0, v.reservedQuantity - :quantity) " +
            "WHERE v.id = :variantId")
    int releaseQuantity(@Param("variantId") Long variantId, @Param("quantity") Integer quantity);

    // Получить фактически доступное количество
    @Query("SELECT COALESCE(v.availableQuantity - v.reservedQuantity, 0) FROM ProductVariant v WHERE v.id = :variantId")
    Integer getActuallyAvailableQuantity(@Param("variantId") Long variantId);

    // Проверить, доступно ли количество для резервирования
    @Query("SELECT CASE WHEN (v.availableQuantity - v.reservedQuantity >= :quantity) THEN true ELSE false END " +
            "FROM ProductVariant v WHERE v.id = :variantId")
    Boolean isQuantityAvailable(@Param("variantId") Long variantId, @Param("quantity") Integer quantity);
}