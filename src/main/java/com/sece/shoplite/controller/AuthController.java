package com.sece.shoplite.controller;

import com.sece.shoplite.dto.LoginRequest;
import com.sece.shoplite.dto.RegisterRequest;
import com.sece.shoplite.entity.User;
import com.sece.shoplite.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request
    ) {

        User user = authService.login(request);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("success", true);
        response.put("message", "Login successful");
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("role", user.getRole());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request
    ) {

        User user = authService.register(request);

        Map<String, Object> response = new LinkedHashMap<>();

        response.put("success", true);
        response.put("message", "Registration successful");
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }
}