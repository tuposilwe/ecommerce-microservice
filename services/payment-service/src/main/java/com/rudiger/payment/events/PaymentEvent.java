package com.rudiger.payment.events;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Published to the "payment-events" Kafka topic when Stripe confirms or
 * rejects a payment. order-service consumes this to update order status.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentEvent implements Serializable {
    private Long orderId;
    private String status;
}
