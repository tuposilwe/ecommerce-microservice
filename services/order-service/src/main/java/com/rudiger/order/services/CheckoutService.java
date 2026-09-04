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
import com.rudiger.order.exceptions.OrderNotFoundException;
import com.rudiger.order.exceptions.OrderNotPendingException;
import com.rudiger.order.exceptions.PaymentException;
import com.rudiger.order.repositories.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;

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
        order.setCartId(cart.getId());
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

            // The cart is deliberately NOT cleared here: at this point the
            // customer has only been handed a Stripe URL, and may never pay.
            // PaymentEventListener empties it once the webhook confirms the
            // payment, so an abandoned checkout leaves the cart intact.
            return new CheckoutResponse(order.getId(), session.getCheckoutUrl());
        } catch (RestClientException ex) {
            orderRepository.delete(order);
            throw new PaymentException("Error creating a checkout session");
        }
    }

    // Re-initiates payment for an order whose earlier Stripe session was
    // abandoned or failed. Stripe sessions are single-use, so a fresh one is
    // created each time; the order itself is left untouched until the webhook
    // confirms payment.
    public CheckoutResponse checkoutOrder(Long orderId) {
        var order = orderRepository
                .getOrderWithItems(orderId)
                .orElseThrow(OrderNotFoundException::new);
        if (!order.isPlacedBy(currentUserProvider.getCurrentUserId())) {
            throw new AccessDeniedException("You don't have access to this order.");
        }
        if (order.getStatus() != PaymentStatus.PENDING) {
            throw new OrderNotPendingException();
        }

        try {
            var sessionRequest = new CreateCheckoutSessionRequest(
                    order.getId(),
                    order.getItems().stream()
                            .map(item -> new LineItemRequest(item.getProductName(), item.getUnitPrice(), item.getQuantity()))
                            .toList()
            );
            var session = paymentClient.createCheckoutSession(sessionRequest);
            return new CheckoutResponse(order.getId(), session.getCheckoutUrl());
        } catch (RestClientException ex) {
            throw new PaymentException("Error creating a checkout session");
        }
    }

    private com.rudiger.order.clients.CartResponse fetchCart(java.util.UUID cartId) {
        try {
            return cartClient.getCart(cartId);
        } catch (HttpClientErrorException.NotFound ex) {
            throw new CartNotFoundException();
        }
    }
}
