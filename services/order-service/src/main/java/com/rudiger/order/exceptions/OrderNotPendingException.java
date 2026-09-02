package com.rudiger.order.exceptions;

public class OrderNotPendingException extends RuntimeException {
    public OrderNotPendingException() {
        super("Order is not awaiting payment.");
    }
}
