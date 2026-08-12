package com.rudiger.order.mappers;

import com.rudiger.order.dtos.OrderDto;
import com.rudiger.order.dtos.OrderItemDto;
import com.rudiger.order.dtos.OrderProductDto;
import com.rudiger.order.entities.Order;
import com.rudiger.order.entities.OrderItem;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderDto toDto(Order order);

    @Mapping(target = "product", source = "orderItem")
    OrderItemDto toDto(OrderItem orderItem);

    @Mapping(target = "id", source = "productId")
    @Mapping(target = "name", source = "productName")
    @Mapping(target = "price", source = "unitPrice")
    OrderProductDto toProductDto(OrderItem orderItem);
}
