package com.rudiger.order.dtos;

import com.rudiger.order.entities.PaymentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateOrderStatusRequest {
    @NotNull
    private PaymentStatus status;
}
