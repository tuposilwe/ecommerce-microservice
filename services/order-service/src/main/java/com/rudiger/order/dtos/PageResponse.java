package com.rudiger.order.dtos;

import org.springframework.data.domain.Page;

import java.util.List;

// Stable wire shape for paginated results (Spring's Page/PageImpl has no
// guaranteed JSON structure across versions).
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages()
        );
    }
}
