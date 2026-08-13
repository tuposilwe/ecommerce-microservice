package com.rudiger.order.clients;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class PaymentClient {
    private final RestClient restClient;

    public PaymentClient(@LoadBalanced RestClient.Builder loadBalancedRestClientBuilder) {
        this.restClient = loadBalancedRestClientBuilder.baseUrl("http://payment-service").build();
    }

    public CheckoutSessionResponse createCheckoutSession(CreateCheckoutSessionRequest request) {
        return restClient.post()
                .uri("/checkout/sessions")
                .body(request)
                .retrieve()
                .body(CheckoutSessionResponse.class);
    }
}
