package com.rudiger.order.config;

import org.springframework.boot.autoconfigure.web.client.RestClientBuilderConfigurer;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpHeaders;
import org.springframework.web.client.RestClient;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class RestClientConfig {

    /**
     * A RestClient.Builder resolved through Eureka (baseUrl like
     * "http://cart-service" resolves to a live instance), still carrying
     * Boot's default customizers (Jackson, observation/tracing) via
     * RestClientBuilderConfigurer.
     *
     * <p>It also forwards the caller's Authorization header downstream, so
     * payment-service can require a JWT on its checkout-session endpoint
     * rather than trusting network placement. Calls made outside a request
     * (e.g. from the Kafka listener) simply carry no header.
     */
    @Bean
    @LoadBalanced
    public RestClient.Builder loadBalancedRestClientBuilder(RestClientBuilderConfigurer configurer) {
        return configurer.configure(RestClient.builder())
                .requestInterceptor((request, body, execution) -> {
                    if (!request.getHeaders().containsKey(HttpHeaders.AUTHORIZATION)) {
                        var attrs = RequestContextHolder.getRequestAttributes();
                        if (attrs instanceof ServletRequestAttributes servletAttrs) {
                            var auth = servletAttrs.getRequest().getHeader(HttpHeaders.AUTHORIZATION);
                            if (auth != null) {
                                request.getHeaders().set(HttpHeaders.AUTHORIZATION, auth);
                            }
                        }
                    }
                    return execution.execute(request, body);
                });
    }
}
