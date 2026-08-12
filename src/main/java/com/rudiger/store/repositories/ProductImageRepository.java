package com.rudiger.store.repositories;

import com.rudiger.store.entities.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductImageRepository extends JpaRepository<ProductImage, Long> {
    @Query("SELECT pi.productId FROM ProductImage pi WHERE pi.productId IN :productIds")
    List<Long> findExistingProductIds(List<Long> productIds);
}
