package com.rudiger.store.controllers;

import com.rudiger.store.dtos.ProductDto;
import com.rudiger.store.entities.Product;
import com.rudiger.store.entities.ProductImage;
import com.rudiger.store.mappers.ProductMapper;
import com.rudiger.store.repositories.CategoryRepository;
import com.rudiger.store.repositories.ProductImageRepository;
import com.rudiger.store.repositories.ProductRepository;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@RestController
@RequestMapping("/products")
@AllArgsConstructor
public class ProductController {

    private final ProductRepository productRepository;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final ProductImageRepository productImageRepository;

    @GetMapping
    public List<ProductDto> getAllProducts(
            @RequestParam(name = "categoryId", required = false) Byte categoryId
    ) {
        List<Product> products;
        if (categoryId != null) {
            products = productRepository.findByCategoryId(categoryId);
        } else {
            products = productRepository.findAllWithCategory();
        }

        var dtos = products.stream().map(productMapper::toDto).toList();

        Set<Long> productIdsWithImages = new HashSet<>(
                productImageRepository.findExistingProductIds(dtos.stream().map(ProductDto::getId).toList())
        );
        dtos.forEach(dto -> dto.setHasImage(productIdsWithImages.contains(dto.getId())));

        return dtos;
    }

    @PostMapping
    public ResponseEntity<ProductDto> createProduct(
            @RequestBody ProductDto productDto,
            UriComponentsBuilder uriBuilder
    ) {
        var category = categoryRepository.findById(productDto.getCategoryId()).orElse(null);
        if (category == null) {
            return ResponseEntity.badRequest().build();
        }

        var product = productMapper.toEntity(productDto);
        product.setCategory(category);
        productRepository.save(product);
        productDto.setId(product.getId());
        productDto.setHasImage(false);

        var uri = uriBuilder.path("/api/products/{id}").buildAndExpand(productDto.getId()).toUri();

        return ResponseEntity.created(uri).body(productDto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductDto> updateProduct(
            @PathVariable Long id,
            @RequestBody ProductDto productDto
    ) {
        var category = categoryRepository.findById(productDto.getCategoryId()).orElse(null);
        if (category == null) {
            return ResponseEntity.badRequest().build();
        }

        var product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        productMapper.update(productDto, product);
        product.setCategory(category);
        productRepository.save(product);
        productDto.setId(product.getId());
        productDto.setHasImage(productImageRepository.existsById(id));

        return ResponseEntity.ok(productDto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        var product = productRepository.findById(id).orElse(null);
        if (product == null) {
            return ResponseEntity.notFound().build();
        }
        productRepository.delete(product);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> uploadImage(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file
    ) throws IOException {
        if (!productRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        var contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().build();
        }

        var productImage = productImageRepository.findById(id)
                .orElse(new ProductImage(id, null, null));
        productImage.setImage(file.getBytes());
        productImage.setContentType(contentType);
        productImageRepository.save(productImage);

        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/image")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {
        var productImage = productImageRepository.findById(id).orElse(null);
        if (productImage == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(productImage.getContentType()))
                .body(productImage.getImage());
    }

    @DeleteMapping("/{id}/image")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        if (!productImageRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        productImageRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
