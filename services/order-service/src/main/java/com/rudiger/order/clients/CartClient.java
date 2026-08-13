package com.rudiger.order.clients;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Component
public class CartClient {
    private final RestClient restClient;

    public CartClient(@LoadBalanced RestClient.Builder loadBalancedRestClientBuilder) {
        this.restClient = loadBalancedRestClientBuilder.baseUrl("http://cart-service").build();
    }

    public CartResponse getCart(UUID cartId) {
        return restClient.get()
                .uri("/carts/{cartId}", cartId)
                .retrieve()
                .body(CartResponse.class);
    }

    public void clearCart(UUID cartId) {
        restClient.delete()
                .uri("/carts/{cartId}/items", cartId)
                .retrieve()
                .toBodilessEntity();
    }
}
