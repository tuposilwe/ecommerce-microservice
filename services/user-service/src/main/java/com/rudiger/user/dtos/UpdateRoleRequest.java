package com.rudiger.user.dtos;

import com.rudiger.user.entities.Role;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateRoleRequest {
    @NotNull
    private Role role;
}
