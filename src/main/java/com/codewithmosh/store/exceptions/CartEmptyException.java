package com.codewithmosh.store.exceptions;

public class CartEmptyException extends RuntimeException {
    public CartEmptyException(){
        // super calls the base constructor
        super("Cart is empty");
    }
}
