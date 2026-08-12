package com.rudiger.order.clients;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class CartResponse {
    private UUID id;
    private List<CartItemResponse> items;
    private BigDecimal totalPrice;
}
