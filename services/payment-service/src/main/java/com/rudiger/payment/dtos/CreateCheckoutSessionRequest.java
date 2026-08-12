package com.rudiger.payment.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateCheckoutSessionRequest {
    @NotNull
    private Long orderId;

    @NotEmpty
    private List<LineItemRequest> items;
}
