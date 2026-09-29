package com.sece.shoplite.controller;

import com.sece.shoplite.dto.SaleRequest;
import com.sece.shoplite.entity.Sale;
import com.sece.shoplite.service.SaleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
public class SaleController {

    private final SaleService saleService;

    public SaleController(SaleService saleService) {
        this.saleService = saleService;
    }

    @PostMapping
    public ResponseEntity<Sale> createSale(
            @Valid @RequestBody SaleRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(saleService.createSale(request));
    }

    @GetMapping
    public ResponseEntity<List<Sale>> getAllSales() {
        return ResponseEntity.ok(
                saleService.getAllSales()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Sale> getSaleById(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                saleService.getSaleById(id)
        );
    }

    @GetMapping("/bill/{billNumber}")
    public ResponseEntity<Sale> getSaleByBillNumber(
            @PathVariable String billNumber
    ) {
        return ResponseEntity.ok(
                saleService.getSaleByBillNumber(billNumber)
        );
    }

    @GetMapping("/filter")
    public ResponseEntity<List<Sale>> getSalesBetweenDates(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(
                saleService.getSalesBetweenDates(
                        startDate,
                        endDate
                )
        );
    }

    @GetMapping("/summary/total")
    public ResponseEntity<BigDecimal> getTotalSales(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(
                saleService.getTotalSales(
                        startDate,
                        endDate
                )
        );
    }

    @GetMapping("/summary/count")
    public ResponseEntity<Long> getSaleCount(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate
    ) {
        return ResponseEntity.ok(
                saleService.getSaleCount(
                        startDate,
                        endDate
                )
        );
    }
}