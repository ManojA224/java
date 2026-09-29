package com.sece.shoplite.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    /**
     * Main Spring Security configuration.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                // REST APIs will be accessed using JavaScript requests.
                .csrf(csrf -> csrf.disable())

                // Authorization rules.
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/",
                                "/login",
                                "/css/**",
                                "/js/**",
                                "/images/**",
                                "/api/auth/**"
                        ).permitAll()

                        // Temporarily allow the remaining pages/APIs.
                        // Authentication restrictions will be enabled
                        // after User and AuthService are implemented.
                        .anyRequest().permitAll()
                )

                // Disable the default browser login form for now.
                // We will use our professional login.html page.
                .formLogin(form -> form.disable())

                // Disable HTTP Basic browser popup authentication.
                .httpBasic(basic -> basic.disable());

        return http.build();
    }

    /**
     * Password encoder for secure password storage.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}