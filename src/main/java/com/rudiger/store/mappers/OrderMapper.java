package com.rudiger.store.mappers;

import com.rudiger.store.dtos.OrderDto;
import com.rudiger.store.entities.Order;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    OrderDto toDto(Order order);
}
