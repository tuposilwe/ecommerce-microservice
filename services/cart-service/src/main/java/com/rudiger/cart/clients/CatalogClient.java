package com.rudiger.cart.clients;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

@Component
public class CatalogClient {
    private final RestClient restClient;

    public CatalogClient(@LoadBalanced RestClient.Builder loadBalancedRestClientBuilder) {
        this.restClient = loadBalancedRestClientBuilder.baseUrl("http://catalog-service").build();
    }

    public ProductSummaryDto getProduct(Long id) {
        return restClient.get()
                .uri("/products/{id}", id)
                .retrieve()
                .body(ProductSummaryDto.class);
    }
}
