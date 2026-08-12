package com.rudiger.payment.services;

import com.rudiger.payment.events.PaymentEvent;
import com.rudiger.payment.events.PaymentEventPublisher;
import com.rudiger.payment.exceptions.PaymentException;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.PaymentIntent;
import com.stripe.net.Webhook;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class WebhookService {
    @Value("${stripe.webhookSecretKey}")
    private String webhookSecretKey;

    private final PaymentEventPublisher paymentEventPublisher;

    public void handle(Map<String, String> headers, String payload) {
        try {
            var signature = headers.get("stripe-signature");
            var event = Webhook.constructEvent(payload, signature, webhookSecretKey);

            switch (event.getType()) {
                case "payment_intent.succeeded" ->
                        paymentEventPublisher.publish(new PaymentEvent(extractOrderId(event), "PAID"));
                case "payment_intent.payment_failed" ->
                        paymentEventPublisher.publish(new PaymentEvent(extractOrderId(event), "FAILED"));
                default -> { /* ignore other event types */ }
            }
        } catch (SignatureVerificationException e) {
            throw new PaymentException("Invalid signature");
        }
    }

    private Long extractOrderId(Event event) {
        var stripeObject = event.getDataObjectDeserializer()
                .getObject()
                .orElseThrow(() -> new PaymentException(
                        "Could not deserialize Stripe event. Check the SDK and API version."));
        var paymentIntent = (PaymentIntent) stripeObject;

        return Long.valueOf(paymentIntent.getMetadata().get("order_id"));
    }
}
