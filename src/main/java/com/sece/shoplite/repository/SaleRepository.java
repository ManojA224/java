package com.sece.shoplite.repository;

import com.sece.shoplite.entity.Sale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface SaleRepository extends JpaRepository<Sale, Long> {

    // Find a bill using its bill number
    Optional<Sale> findByBillNumber(String billNumber);

    // Check whether a bill number already exists
    boolean existsByBillNumber(String billNumber);

    // Get sales from newest to oldest
    List<Sale> findAllByOrderBySaleDateDesc();

    // Get sales within a specific date/time range
    List<Sale> findBySaleDateBetweenOrderBySaleDateDesc(
            LocalDateTime start,
            LocalDateTime end
    );

    // Calculate total sales amount within a period
    @Query("""
            SELECT COALESCE(SUM(s.totalAmount), 0)
            FROM Sale s
            WHERE s.saleDate BETWEEN :start AND :end
            """)
    BigDecimal calculateTotalSales(
            LocalDateTime start,
            LocalDateTime end
    );

    // Count number of sales within a period
    long countBySaleDateBetween(
            LocalDateTime start,
            LocalDateTime end
    );
}