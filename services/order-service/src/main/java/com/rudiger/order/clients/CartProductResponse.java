package com.rudiger.order.clients;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartProductResponse {
    private Long id;
    private String name;
    private BigDecimal price;
}
