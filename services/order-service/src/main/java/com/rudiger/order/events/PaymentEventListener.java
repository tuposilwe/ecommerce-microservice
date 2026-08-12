package com.rudiger.order.events;

import com.rudiger.order.entities.PaymentStatus;
import com.rudiger.order.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class PaymentEventListener {
    private final OrderRepository orderRepository;

    @KafkaListener(topics = "payment-events", groupId = "order-service")
    public void onPaymentEvent(PaymentEvent event) {
        var order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order == null) {
            log.warn("Received payment event for unknown order {}", event.getOrderId());
            return;
        }

        order.setStatus(PaymentStatus.valueOf(event.getStatus()));
        orderRepository.save(order);
        log.info("Order {} updated to status {}", order.getId(), order.getStatus());
    }
}
