package com.sece.shoplite.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class pageController {

    @GetMapping("/login")
    public String loginPage() {
        return "login";
    }

    @GetMapping("/")
    public String homePage() {
        return "login";
    }

    @GetMapping("/dashboard")
    public String dashboardPage() {
        return "dashboard";
    }

    @GetMapping("/products")
    public String productsPage() {
        return "products";
    }

    @GetMapping("/add-product")
    public String addProductPage() {
        return "add-product";
    }

    @GetMapping("/edit-product")
    public String editProductPage() {
        return "edit-product";
    }

    @GetMapping("/sales")
    public String salesPage() {
        return "sales";
    }

    @GetMapping("/billing")
    public String billingPage() {
        return "billing";
    }

    @GetMapping("/bill")
    public String billPage() {
        return "bill";
    }

    @GetMapping("/low-stock")
    public String lowStockPage() {
        return "low-stock";
    }

    @GetMapping("/account")
    public String accountPage() {
        return "account";
    }
}
