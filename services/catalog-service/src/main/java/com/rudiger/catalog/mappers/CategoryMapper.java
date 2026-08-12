package com.rudiger.catalog.mappers;

import com.rudiger.catalog.dtos.CategoryDto;
import com.rudiger.catalog.entities.Category;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    CategoryDto toDto(Category category);
}
