package com.rudiger.store.mappers;

import com.rudiger.store.dtos.CategoryDto;
import com.rudiger.store.entities.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryDto toDto(Category category);
}
