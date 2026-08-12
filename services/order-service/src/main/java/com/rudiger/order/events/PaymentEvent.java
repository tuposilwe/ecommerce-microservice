package com.rudiger.order.events;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * Mirrors payment-service's PaymentEvent published to the "payment-events"
 * Kafka topic. Kept as a separate compatible POJO rather than a shared
 * library, as is typical between independently-deployable services.
 */
@Data
@NoArgsConstructor
public class PaymentEvent implements Serializable {
    private Long orderId;
    private String status;
}
