package com.rudiger.order.clients;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LineItemRequest {
    private String productName;
    private BigDecimal unitPrice;
    private Integer quantity;
}
