package com.rudiger.order.controllers;

import com.rudiger.order.dtos.CheckoutResponse;
import com.rudiger.order.dtos.ErrorDto;
import com.rudiger.order.dtos.OrderDto;
import com.rudiger.order.dtos.PageResponse;
import com.rudiger.order.dtos.UpdateOrderStatusRequest;
import com.rudiger.order.entities.PaymentStatus;
import com.rudiger.order.exceptions.OrderNotFoundException;
import com.rudiger.order.exceptions.OrderNotPendingException;
import com.rudiger.order.exceptions.PaymentException;
import com.rudiger.order.services.CheckoutService;
import com.rudiger.order.services.OrderService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;

@RestController
@AllArgsConstructor
@RequestMapping("/orders")
public class OrderController {
    private static final Set<String> SORTABLE_FIELDS =
            Set.of("id", "createdAt", "totalPrice", "status", "customerId");

    private final OrderService orderService;
    private final CheckoutService checkoutService;

    @GetMapping
    public List<OrderDto> getAllOrders() {
        return orderService.getAllOrders();
    }

    // Literal path wins over the /{orderId} template, so this never collides
    // with order lookups; ADMIN-only via SecurityConfig.
    @GetMapping("/admin")
    public PageResponse<OrderDto> getAllOrdersForAdmin(
            @RequestParam(required = false) PaymentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        if (!SORTABLE_FIELDS.contains(sort)) {
            sort = "createdAt";
        }
        var dir = "asc".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        var pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100), Sort.by(dir, sort));
        return PageResponse.of(orderService.getAllOrdersForAdmin(status, pageable));
    }

    @GetMapping("/{orderId}")
    public OrderDto getOrder(@PathVariable("orderId") Long orderId) {
        return orderService.getOrder(orderId);
    }

    @PutMapping("/{orderId}/status")
    public OrderDto updateOrderStatus(
            @PathVariable("orderId") Long orderId,
            @Valid @RequestBody UpdateOrderStatusRequest request
    ) {
        return orderService.updateStatus(orderId, request.getStatus());
    }

    @DeleteMapping("/{orderId}")
    public ResponseEntity<Void> deleteOrder(@PathVariable("orderId") Long orderId) {
        orderService.deleteOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{orderId}/checkout")
    public CheckoutResponse checkoutOrder(@PathVariable("orderId") Long orderId) {
        return checkoutService.checkoutOrder(orderId);
    }

    @ExceptionHandler(OrderNotPendingException.class)
    public ResponseEntity<ErrorDto> handleOrderNotPending(Exception ex) {
        return ResponseEntity.badRequest().body(new ErrorDto(ex.getMessage()));
    }

    @ExceptionHandler(PaymentException.class)
    public ResponseEntity<ErrorDto> handlePaymentException() {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ErrorDto("Error creating a checkout session"));
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ErrorDto> handleOrderNotFound(Exception ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorDto(ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDto> handleAccessDenied(Exception ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorDto(ex.getMessage()));
    }
}
