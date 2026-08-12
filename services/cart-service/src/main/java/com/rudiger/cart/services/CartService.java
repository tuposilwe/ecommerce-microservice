package com.rudiger.cart.services;

import com.rudiger.cart.clients.CatalogClient;
import com.rudiger.cart.dtos.CartDto;
import com.rudiger.cart.dtos.CartItemDto;
import com.rudiger.cart.entities.Cart;
import com.rudiger.cart.exceptions.CartNotFoundException;
import com.rudiger.cart.exceptions.ProductNotFoundException;
import com.rudiger.cart.mappers.CartMapper;
import com.rudiger.cart.repositories.CartRepository;
import feign.FeignException;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class CartService {
    private final CartRepository cartRepository;
    private final CartMapper cartMapper;
    private final CatalogClient catalogClient;

    public CartDto createCart() {
        var cart = new Cart();
        cartRepository.save(cart);

        return cartMapper.toDto(cart);
    }

    public CartItemDto addToCart(UUID cartId, Long productId) {
        var cart = cartRepository.getCartWithItems(cartId).orElse(null);
        if (cart == null) {
            throw new CartNotFoundException();
        }

        var product = fetchProduct(productId);

        var cartItem = cart.addItem(product.getId(), product.getName(), product.getPrice());

        cartRepository.save(cart);
        return cartMapper.toDto(cartItem);
    }

    public CartDto getCart(UUID cartId) {
        var cart = cartRepository.getCartWithItems(cartId).orElse(null);
        if (cart == null) {
            throw new CartNotFoundException();
        }
        return cartMapper.toDto(cart);
    }

    public CartItemDto updateItem(UUID cartId, Long productId, Integer quantity) {
        var cart = cartRepository.getCartWithItems(cartId).orElse(null);
        if (cart == null) {
            throw new CartNotFoundException();
        }

        var cartItem = cart.getItem(productId);

        if (cartItem == null) {
            throw new ProductNotFoundException();
        }

        cartItem.setQuantity(quantity);
        cartRepository.save(cart);

        return cartMapper.toDto(cartItem);
    }

    public void removeItem(UUID cartId, Long productId) {
        var cart = cartRepository.getCartWithItems(cartId).orElse(null);
        if (cart == null) {
            throw new CartNotFoundException();
        }

        cart.removeItem(productId);

        cartRepository.save(cart);
    }

    public void clearCart(UUID cartId) {
        var cart = cartRepository.getCartWithItems(cartId).orElse(null);
        if (cart == null) {
            throw new CartNotFoundException();
        }
        cart.clear();
        cartRepository.save(cart);
    }

    private com.rudiger.cart.clients.ProductSummaryDto fetchProduct(Long productId) {
        try {
            return catalogClient.getProduct(productId);
        } catch (FeignException.NotFound ex) {
            throw new ProductNotFoundException();
        }
    }
}
