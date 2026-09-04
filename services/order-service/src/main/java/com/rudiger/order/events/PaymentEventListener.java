package com.rudiger.order.events;

import com.rudiger.order.clients.CartClient;
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
    private final CartClient cartClient;

    @KafkaListener(topics = "payment-events", groupId = "order-service")
    public void onPaymentEvent(PaymentEvent event) {
        var order = orderRepository.findById(event.getOrderId()).orElse(null);
        if (order == null) {
            log.warn("Received payment event for unknown order {}", event.getOrderId());
            return;
        }

        var status = PaymentStatus.valueOf(event.getStatus());
        order.setStatus(status);
        orderRepository.save(order);
        log.info("Order {} updated to status {}", order.getId(), order.getStatus());

        if (status == PaymentStatus.PAID) {
            clearCart(order.getCartId(), order.getId());
        }
    }

    /**
     * Empties the cart the order was built from, now that it has actually been
     * paid for. Failure here must not fail the listener: the payment is real
     * and the order is already updated, so a retry would only re-apply the
     * status. A leftover cart is a far smaller problem than a redelivery loop.
     */
    private void clearCart(java.util.UUID cartId, Long orderId) {
        if (cartId == null) {
            log.debug("Order {} has no cart recorded; nothing to clear", orderId);
            return;
        }
        try {
            cartClient.clearCart(cartId);
            log.info("Cleared cart {} after payment for order {}", cartId, orderId);
        } catch (Exception ex) {
            log.warn("Could not clear cart {} for paid order {}: {}", cartId, orderId, ex.toString());
        }
    }
}
