package com.sece.shoplite.repository;

import com.sece.shoplite.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {

    // Get all items belonging to a particular sale
    List<SaleItem> findBySaleId(Long saleId);

    // Get all sale records for a particular product
    List<SaleItem> findByProductId(Long productId);

    // Delete all items belonging to a particular sale
    void deleteBySaleId(Long saleId);
}