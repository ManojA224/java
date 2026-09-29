package com.sece.shoplite.repository;

import com.sece.shoplite.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByNameContainingIgnoreCase(String name);

    List<Product> findByCategoryIgnoreCase(String category);

    @Query("""
            SELECT p
            FROM Product p
            WHERE p.stockQuantity <= p.reorderLevel
            ORDER BY p.stockQuantity ASC
            """)
    List<Product> findLowStockProducts();

    List<Product> findByStockQuantityLessThanEqual(Integer stockQuantity);

    boolean existsByNameIgnoreCase(String name);
}