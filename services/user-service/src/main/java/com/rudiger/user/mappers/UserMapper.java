package com.rudiger.user.mappers;

import com.rudiger.user.dtos.RegisterUserRequest;
import com.rudiger.user.dtos.UpdateUserRequest;
import com.rudiger.user.dtos.UserDto;
import com.rudiger.user.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {
    @Mapping(target = "createdAt", expression = "java(java.time.LocalDateTime.now())")
    UserDto toDto(User user);

    User toEntity(RegisterUserRequest request);

    void update(UpdateUserRequest request, @MappingTarget User user);
}
