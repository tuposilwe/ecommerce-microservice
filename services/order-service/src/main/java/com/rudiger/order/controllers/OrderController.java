package com.rudiger.order.controllers;

import com.rudiger.order.dtos.CheckoutResponse;
import com.rudiger.order.dtos.ErrorDto;
import com.rudiger.order.dtos.OrderDto;
import com.rudiger.order.exceptions.OrderNotFoundException;
import com.rudiger.order.exceptions.OrderNotPendingException;
import com.rudiger.order.exceptions.PaymentException;
import com.rudiger.order.services.CheckoutService;
import com.rudiger.order.services.OrderService;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/orders")
public class OrderController {
    private final OrderService orderService;
    private final CheckoutService checkoutService;

    @GetMapping
    public List<OrderDto> getAllOrders() {
        return orderService.getAllOrders();
    }

    @GetMapping("/{orderId}")
    public OrderDto getOrder(@PathVariable("orderId") Long orderId) {
        return orderService.getOrder(orderId);
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
