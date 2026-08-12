package com.rudiger.payment.dtos;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class LineItemRequest {
    private String productName;
    private BigDecimal unitPrice;
    private Integer quantity;
}
