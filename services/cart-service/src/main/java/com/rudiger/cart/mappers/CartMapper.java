package com.rudiger.cart.mappers;

import com.rudiger.cart.dtos.CartDto;
import com.rudiger.cart.dtos.CartItemDto;
import com.rudiger.cart.dtos.CartProductDto;
import com.rudiger.cart.entities.Cart;
import com.rudiger.cart.entities.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {
    @Mapping(target = "totalPrice", expression = "java(cart.getTotalPrice())")
    CartDto toDto(Cart cart);

    @Mapping(target = "totalPrice", expression = "java(cartItem.getTotalPrice())")
    @Mapping(target = "product", source = "cartItem")
    CartItemDto toDto(CartItem cartItem);

    @Mapping(target = "id", source = "productId")
    @Mapping(target = "name", source = "productName")
    @Mapping(target = "price", source = "productPrice")
    CartProductDto toProductDto(CartItem cartItem);
}
