package com.rudiger.gateway;

import org.springframework.core.Ordered;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.web.server.WebFilter;
import org.springframework.web.server.WebFilterChain;
import reactor.core.publisher.Mono;

/**
 * Rewrites unmatched GET requests (client-side routes like /cart, /orders/5)
 * to /index.html so React Router can take over. Requests under /api/** are
 * handled by gateway routes before this filter ever sees them; requests for
 * real static assets (main.js, favicon.svg, ...) are left alone since they
 * contain a "." and are served directly by WebFlux's static resource handler.
 */
@Component
public class SpaWebFilter implements WebFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, WebFilterChain chain) {
        var request = exchange.getRequest();
        var path = request.getURI().getPath();

        if (request.getMethod() == HttpMethod.GET
                && !path.startsWith("/api")
                && !path.startsWith("/actuator")
                && !path.contains(".")) {
            return chain.filter(exchange.mutate()
                    .request(request.mutate().path("/index.html").build())
                    .build());
        }

        return chain.filter(exchange);
    }

    @Override
    public int getOrder() {
        return Ordered.LOWEST_PRECEDENCE;
    }
}
