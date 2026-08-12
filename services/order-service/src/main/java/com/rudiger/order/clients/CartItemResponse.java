package com.rudiger.order.clients;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class CartItemResponse {
    private CartProductResponse product;
    private int quantity;
    private BigDecimal totalPrice;
}
