package com.rudiger.store.mappers;

import com.rudiger.store.dtos.CartDto;
import com.rudiger.store.dtos.CartItemDto;
import com.rudiger.store.entities.Cart;
import com.rudiger.store.entities.CartItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartMapper {
    @Mapping(target = "totalPrice", expression = "java(cart.getTotalPrice())")
    CartDto toDto(Cart cart);
    @Mapping(target = "totalPrice", expression = "java(cartItem.getTotalPrice())")
    CartItemDto toDto(CartItem cartItem);
}