package com.example.fashionstorebackend.controller;

import com.example.fashionstorebackend.dto.ProductDTO;
import com.example.fashionstorebackend.model.Product;
import com.example.fashionstorebackend.model.ProductVariant;
import com.example.fashionstorebackend.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductRepository productRepository;

    @Autowired
    public ProductController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping
    public List<ProductDTO> getAllProducts() {
        List<Product> products = productRepository.findAll();
        return products.stream()
                .map(ProductDTO::new)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductDTO> getProductById(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(new ProductDTO(product)))
                .orElse(ResponseEntity.notFound().build());
    }

    // Новый эндпоинт для получения доступных размеров товара
    @GetMapping("/{id}/sizes")
    public ResponseEntity<List<String>> getProductSizes(@PathVariable Long id) {
        return productRepository.findById(id)
                .map(product -> ResponseEntity.ok(product.getSizes()))
                .orElse(ResponseEntity.notFound().build());
    }

    // Новый эндпоинт для проверки доступности размера
    @GetMapping("/{id}/availability")
    public ResponseEntity<Integer> checkAvailability(
            @PathVariable Long id,
            @RequestParam String size) {

        return productRepository.findById(id)
                .map(product -> {
                    ProductVariant variant = product.getVariantBySize(size);
                    if (variant != null) {
                        return ResponseEntity.ok(variant.getActuallyAvailable());
                    }
                    return ResponseEntity.ok(0);
                })
                .orElse(ResponseEntity.ok(0));
    }
}