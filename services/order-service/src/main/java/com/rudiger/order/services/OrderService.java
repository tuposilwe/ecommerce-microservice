package com.rudiger.order.services;

import com.rudiger.order.dtos.OrderDto;
import com.rudiger.order.entities.PaymentStatus;
import com.rudiger.order.exceptions.OrderNotFoundException;
import com.rudiger.order.mappers.OrderMapper;
import com.rudiger.order.repositories.OrderRepository;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

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
