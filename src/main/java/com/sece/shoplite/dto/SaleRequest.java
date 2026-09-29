package com.sece.shoplite.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

public class SaleRequest {

    @NotEmpty(message = "Sale must contain at least one item")
    @Size(max = 100, message = "A sale cannot contain more than 100 items")
    @Valid
    private List<SaleItemRequest> items;

    public SaleRequest() {
    }

    public SaleRequest(List<SaleItemRequest> items) {
        this.items = items;
    }

    public List<SaleItemRequest> getItems() {
        return items;
    }

    public void setItems(List<SaleItemRequest> items) {
        this.items = items;
    }
}