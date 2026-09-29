package com.sece.shoplite.service;

import com.sece.shoplite.dto.SaleItemRequest;
import com.sece.shoplite.dto.SaleRequest;
import com.sece.shoplite.entity.Product;
import com.sece.shoplite.entity.Sale;
import com.sece.shoplite.entity.SaleItem;
import com.sece.shoplite.exception.ResourceNotFoundException;
import com.sece.shoplite.repository.ProductRepository;
import com.sece.shoplite.repository.SaleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class SaleService {

    private final SaleRepository saleRepository;
    private final ProductRepository productRepository;

    public SaleService(
            SaleRepository saleRepository,
            ProductRepository productRepository
    ) {
        this.saleRepository = saleRepository;
        this.productRepository = productRepository;
    }

    @Transactional
    public Sale createSale(SaleRequest request) {

        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new IllegalArgumentException(
                    "Sale must contain at least one item"
            );
        }

        String billNumber = generateBillNumber();

        Sale sale = new Sale(billNumber);

        for (SaleItemRequest itemRequest : request.getItems()) {

            Product product = productRepository.findById(
                    itemRequest.getProductId()
            ).orElseThrow(() ->
                    new ResourceNotFoundException(
                            "Product not found with ID: "
                                    + itemRequest.getProductId()
                    )
            );

            int requestedQuantity = itemRequest.getQuantity();

            if (requestedQuantity <= 0) {
                throw new IllegalArgumentException(
                        "Quantity must be greater than zero"
                );
            }

            if (product.getStockQuantity() < requestedQuantity) {
                throw new IllegalArgumentException(
                        "Insufficient stock for product: "
                                + product.getName()
                );
            }

            BigDecimal unitPrice = product.getPrice();

            SaleItem saleItem = new SaleItem(
                    product,
                    requestedQuantity,
                    unitPrice
            );

            sale.addSaleItem(saleItem);

            product.setStockQuantity(
                    product.getStockQuantity() - requestedQuantity
            );

            productRepository.save(product);
        }

        sale.calculateTotal();

        return saleRepository.save(sale);
    }

    public Sale getSaleById(Long id) {

        return saleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sale not found with ID: " + id
                        ));
    }

    public Sale getSaleByBillNumber(String billNumber) {

        return saleRepository.findByBillNumber(billNumber)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Sale not found with bill number: "
                                        + billNumber
                        ));
    }

    public List<Sale> getAllSales() {
        return saleRepository.findAllByOrderBySaleDateDesc();
    }

    public List<Sale> getSalesBetweenDates(
            LocalDate startDate,
            LocalDate endDate
    ) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        return saleRepository.findBySaleDateBetweenOrderBySaleDateDesc(
                start,
                end
        );
    }

    public BigDecimal getTotalSales(
            LocalDate startDate,
            LocalDate endDate
    ) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        return saleRepository.calculateTotalSales(
                start,
                end
        );
    }

    public long getSaleCount(
            LocalDate startDate,
            LocalDate endDate
    ) {

        LocalDateTime start = startDate.atStartOfDay();
        LocalDateTime end = endDate.atTime(LocalTime.MAX);

        return saleRepository.countBySaleDateBetween(
                start,
                end
        );
    }

    private String generateBillNumber() {

        String date = LocalDate.now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));

        String uniquePart = UUID.randomUUID()
                .toString()
                .substring(0, 6)
                .toUpperCase();

        return "SL-" + date + "-" + uniquePart;
    }
}