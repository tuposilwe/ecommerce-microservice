package com.rudiger.order.services;

import com.rudiger.order.clients.CartClient;
import com.rudiger.order.clients.CreateCheckoutSessionRequest;
import com.rudiger.order.clients.LineItemRequest;
import com.rudiger.order.clients.PaymentClient;
import com.rudiger.order.dtos.CheckoutRequest;
import com.rudiger.order.dtos.CheckoutResponse;
import com.rudiger.order.entities.Order;
import com.rudiger.order.entities.OrderItem;
import com.rudiger.order.entities.PaymentStatus;
import com.rudiger.order.exceptions.CartEmptyException;
import com.rudiger.order.exceptions.CartNotFoundException;
import com.rudiger.order.exceptions.PaymentException;
import com.rudiger.order.repositories.OrderRepository;
import feign.FeignException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class CheckoutService {
    private final CartClient cartClient;
    private final PaymentClient paymentClient;
    private final OrderRepository orderRepository;
    private final CurrentUserProvider currentUserProvider;

    @Transactional
    public CheckoutResponse checkout(CheckoutRequest request) {
        var cart = fetchCart(request.getCartId());
        if (cart.getItems().isEmpty()) {
            throw new CartEmptyException();
        }

        var order = new Order();
        order.setCustomerId(currentUserProvider.getCurrentUserId());
        order.setStatus(PaymentStatus.PENDING);
        order.setTotalPrice(cart.getTotalPrice());
        cart.getItems().forEach(item -> order.getItems().add(new OrderItem(
                order,
                item.getProduct().getId(),
                item.getProduct().getName(),
                item.getProduct().getPrice(),
                item.getQuantity()
        )));

        orderRepository.save(order);

        try {
            var sessionRequest = new CreateCheckoutSessionRequest(
                    order.getId(),
                    order.getItems().stream()
                            .map(item -> new LineItemRequest(item.getProductName(), item.getUnitPrice(), item.getQuantity()))
                            .toList()
            );
            var session = paymentClient.createCheckoutSession(sessionRequest);

            cartClient.clearCart(cart.getId());

            return new CheckoutResponse(order.getId(), session.getCheckoutUrl());
        } catch (FeignException ex) {
            orderRepository.delete(order);
            throw new PaymentException("Error creating a checkout session");
        }
    }

    private com.rudiger.order.clients.CartResponse fetchCart(java.util.UUID cartId) {
        try {
            return cartClient.getCart(cartId);
        } catch (FeignException.NotFound ex) {
            throw new CartNotFoundException();
        }
    }
}
