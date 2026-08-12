package com.rudiger.order.clients;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

@FeignClient(name = "cart-service")
public interface CartClient {
    @GetMapping("/carts/{cartId}")
    CartResponse getCart(@PathVariable("cartId") UUID cartId);

    @DeleteMapping("/carts/{cartId}/items")
    void clearCart(@PathVariable("cartId") UUID cartId);
}
