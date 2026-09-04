package com.rudiger.order.services;

import com.rudiger.order.dtos.OrderDto;
import com.rudiger.order.entities.PaymentStatus;
import com.rudiger.order.exceptions.OrderNotFoundException;
import com.rudiger.order.exceptions.OrderNotPendingException;
import com.rudiger.order.mappers.OrderMapper;
import com.rudiger.order.repositories.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class OrderService {
    private final CurrentUserProvider currentUserProvider;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public List<OrderDto> getAllOrders() {
        var userId = currentUserProvider.getCurrentUserId();
        var orders = orderRepository.getOrdersByCustomer(userId);
        return orders.stream().map(orderMapper::toDto).toList();
    }

    // Admin-only (enforced in SecurityConfig). Any transition is allowed - an
    // admin correcting a stuck order needs to move it in both directions. Note
    // this only edits our record: setting PAID here does not take a payment,
    // and Stripe remains the system of record for what was actually charged.
    @Transactional
    public OrderDto updateStatus(Long orderId, PaymentStatus status) {
        var order = orderRepository
                .getOrderWithItems(orderId)
                .orElseThrow(OrderNotFoundException::new);
        order.setStatus(status);
        orderRepository.save(order);
        return orderMapper.toDto(order);
    }

    // A customer may remove an order only while it is still PENDING: once
    // Stripe has taken payment the order is the record of a real transaction,
    // so deleting it would destroy history the customer cannot recreate. An
    // admin can delete regardless.
    public void deleteOrder(Long orderId) {
        var order = orderRepository
                .getOrderWithItems(orderId)
                .orElseThrow(OrderNotFoundException::new);

        if (!currentUserProvider.isAdmin()) {
            if (!order.isPlacedBy(currentUserProvider.getCurrentUserId())) {
                throw new AccessDeniedException("You don't have access to this order.");
            }
            if (order.getStatus() != PaymentStatus.PENDING) {
                throw new OrderNotPendingException();
            }
        }

        orderRepository.delete(order);
    }

    // Admin-only (enforced in SecurityConfig): every customer's orders,
    // optionally filtered by status.
    public Page<OrderDto> getAllOrdersForAdmin(PaymentStatus status, Pageable pageable) {
        var page = status == null
                ? orderRepository.findAllBy(pageable)
                : orderRepository.findAllByStatus(status, pageable);
        return page.map(orderMapper::toDto);
    }

    public OrderDto getOrder(Long orderId) {
        var order = orderRepository
                .getOrderWithItems(orderId)
                .orElseThrow(OrderNotFoundException::new);
        var userId = currentUserProvider.getCurrentUserId();
        if (!order.isPlacedBy(userId)) {
            throw new AccessDeniedException("You don't have access to this order.");
        }
        return orderMapper.toDto(order);
    }
}
