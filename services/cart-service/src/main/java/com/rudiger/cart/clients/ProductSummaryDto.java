package com.rudiger.cart.clients;

import lombok.Data;

import java.math.BigDecimal;

/**
 * Subset of catalog-service's ProductDto that cart-service actually needs.
 * Jackson ignores the extra fields (description, hasImage, categoryId) in
 * the real response by default.
 */
@Data
public class ProductSummaryDto {
    private Long id;
    private String name;
    private BigDecimal price;
}
