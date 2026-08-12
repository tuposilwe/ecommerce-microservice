package com.rudiger.order.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "payment-service")
public interface PaymentClient {
    @PostMapping("/checkout/sessions")
    CheckoutSessionResponse createCheckoutSession(@RequestBody CreateCheckoutSessionRequest request);
}
