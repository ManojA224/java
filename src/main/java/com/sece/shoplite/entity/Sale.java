package com.sece.shoplite.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
        name = "sales",
        indexes = {
                @Index(name = "idx_sale_date", columnList = "sale_date"),
                @Index(name = "idx_bill_number", columnList = "bill_number")
        }
)
public class Sale {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "bill_number", nullable = false, unique = true, length = 30)
    private String billNumber;

    @Column(name = "sale_date", nullable = false)
    private LocalDateTime saleDate;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @OneToMany(
            mappedBy = "sale",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SaleItem> saleItems = new ArrayList<>();

    public Sale() {
        this.saleDate = LocalDateTime.now();
        this.totalAmount = BigDecimal.ZERO;
    }

    public Sale(String billNumber) {
        this.billNumber = billNumber;
        this.saleDate = LocalDateTime.now();
        this.totalAmount = BigDecimal.ZERO;
    }

    /**
     * Adds an item to this sale and automatically
     * establishes the relationship between Sale and SaleItem.
     */
    public void addSaleItem(SaleItem saleItem) {
        saleItems.add(saleItem);
        saleItem.setSale(this);
        calculateTotal();
    }

    /**
     * Removes an item from this sale.
     */
    public void removeSaleItem(SaleItem saleItem) {
        saleItems.remove(saleItem);
        saleItem.setSale(null);
        calculateTotal();
    }

    /**
     * Calculates the total amount from all sale items.
     */
    public void calculateTotal() {

        BigDecimal calculatedTotal = BigDecimal.ZERO;

        for (SaleItem item : saleItems) {
            if (item.getSubtotal() != null) {
                calculatedTotal = calculatedTotal.add(item.getSubtotal());
            }
        }

        this.totalAmount = calculatedTotal;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public LocalDateTime getSaleDate() {
        return saleDate;
    }

    public void setSaleDate(LocalDateTime saleDate) {
        this.saleDate = saleDate;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public List<SaleItem> getSaleItems() {
        return saleItems;
    }

    public void setSaleItems(List<SaleItem> saleItems) {
        this.saleItems = saleItems;
    }
}