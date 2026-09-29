package com.sece.shoplite.service;

import com.sece.shoplite.dto.ProductRequest;
import com.sece.shoplite.entity.Product;
import com.sece.shoplite.exception.ResourceNotFoundException;
import com.sece.shoplite.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Product not found with ID: " + id
                        ));
    }

    public List<Product> searchProducts(String name) {
        return productRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Product> getProductsByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public List<Product> getLowStockProducts() {
        return productRepository.findLowStockProducts();
    }

    public List<Product> getOutOfStockProducts() {
        return productRepository.findByStockQuantityLessThanEqual(0);
    }

    public Product createProduct(ProductRequest request) {

        if (productRepository.existsByNameIgnoreCase(request.getName())) {
            throw new IllegalArgumentException(
                    "Product with this name already exists"
            );
        }

        Product product = new Product();

        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setReorderLevel(request.getReorderLevel());
        product.setImage(request.getImage());
        product.setDescription(request.getDescription());

        return productRepository.save(product);
    }

    public Product updateProduct(Long id, ProductRequest request) {

        Product product = getProductById(id);

        product.setName(request.getName());
        product.setCategory(request.getCategory());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setReorderLevel(request.getReorderLevel());
        product.setImage(request.getImage());
        product.setDescription(request.getDescription());

        return productRepository.save(product);
    }

    public void deleteProduct(Long id) {

        Product product = getProductById(id);

        productRepository.delete(product);
    }
}