package com.rudiger.catalog.controllers;

import com.rudiger.catalog.dtos.CategoryDto;
import com.rudiger.catalog.entities.Category;
import com.rudiger.catalog.mappers.CategoryMapper;
import com.rudiger.catalog.repositories.CategoryRepository;
import lombok.AllArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.stream.StreamSupport;

@RestController
@RequestMapping("/categories")
@AllArgsConstructor
public class CategoryController {
    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    @GetMapping
    public List<CategoryDto> getAllCategories() {
        return StreamSupport.stream(categoryRepository.findAll().spliterator(), false)
                .map(categoryMapper::toDto)
                .toList();
    }

    @PostMapping
    public ResponseEntity<CategoryDto> createCategory(@RequestBody CategoryDto request) {
        var category = categoryRepository.save(new Category(request.getName()));
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryMapper.toDto(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CategoryDto> updateCategory(
            @PathVariable Byte id,
            @RequestBody CategoryDto request
    ) {
        var category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }
        category.setName(request.getName());
        categoryRepository.save(category);
        return ResponseEntity.ok(categoryMapper.toDto(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Byte id) {
        if (!categoryRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        categoryRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // Products keep an FK to their category, so deleting a category that is
    // still in use fails at the database level.
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleCategoryInUse() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "Category is still assigned to products."));
    }
}
