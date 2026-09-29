package com.sece.shoplite.controller;

import com.sece.shoplite.entity.Product;
import com.sece.shoplite.entity.Sale;
import com.sece.shoplite.repository.ProductRepository;
import com.sece.shoplite.repository.SaleRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Feeds the dashboard page (dashboard.js calls /api/sales/dashboard).
 */
@RestController
public class DashboardController {

    private final ProductRepository productRepository;
    private final SaleRepository saleRepository;

    public DashboardController(
            ProductRepository productRepository,
            SaleRepository saleRepository
    ) {
        this.productRepository = productRepository;
        this.saleRepository = saleRepository;
    }

    @GetMapping("/api/sales/dashboard")
    public ResponseEntity<Map<String, Object>> dashboard() {

        List<Product> lowStock = productRepository.findLowStockProducts();
        List<Sale> sales = saleRepository.findAllByOrderBySaleDateDesc();

        BigDecimal revenue = BigDecimal.ZERO;
        for (Sale sale : sales) {
            if (sale.getTotalAmount() != null) {
                revenue = revenue.add(sale.getTotalAmount());
            }
        }

        List<Map<String, Object>> recentSales = new ArrayList<>();
        for (Sale sale : sales.stream().limit(5).toList()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", sale.getId());
            row.put("billNumber", sale.getBillNumber());
            row.put("saleDate", sale.getSaleDate());
            row.put("totalAmount", sale.getTotalAmount());
            recentSales.add(row);
        }

        List<Map<String, Object>> lowStockList = new ArrayList<>();
        for (Product product : lowStock.stream().limit(5).toList()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", product.getId());
            row.put("name", product.getName());
            row.put("stockQuantity", product.getStockQuantity());
            row.put("reorderLevel", product.getReorderLevel());
            lowStockList.add(row);
        }

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalProducts", productRepository.count());
        response.put("lowStockProducts", lowStock.size());
        response.put("totalSales", sales.size());
        response.put("totalRevenue", revenue);
        response.put("recentSales", recentSales);
        response.put("lowStock", lowStockList);

        return ResponseEntity.ok(response);
    }
}