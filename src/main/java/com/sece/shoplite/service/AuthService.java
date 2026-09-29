package com.sece.shoplite.service;

import com.sece.shoplite.dto.LoginRequest;
import com.sece.shoplite.dto.RegisterRequest;
import com.sece.shoplite.entity.User;
import com.sece.shoplite.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // =========================
    // LOGIN
    // =========================
    public User login(LoginRequest request) {

        // The login box accepts either a username or an email address.
        String identifier = request.getUsername().trim();

        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Invalid username or password"
                        )
                );

        if (!user.isEnabled()) {
            throw new IllegalStateException(
                    "User account is disabled"
            );
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        )) {
            throw new IllegalArgumentException(
                    "Invalid username or password"
            );
        }

        return user;
    }

    // =========================
    // REGISTER
    // =========================
    public User register(RegisterRequest request) {

        String username = request.getUsername().trim();
        String email = request.getEmail().trim();
        String password = request.getPassword();

        // Check username
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException(
                    "Username already exists"
            );
        }

        // Check email
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email already exists"
            );
        }

        // Create new user
        User user = new User();

        user.setUsername(username);
        user.setEmail(email);

        // Encrypt password before saving
        user.setPassword(
                passwordEncoder.encode(password)
        );

        // Default role
        user.setRole("USER");

        // Enable account
        user.setEnabled(true);

        // Save to MySQL
        return userRepository.save(user);
    }
}