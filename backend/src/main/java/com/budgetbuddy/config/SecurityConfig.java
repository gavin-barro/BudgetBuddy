package com.budgetbuddy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // Disable CSRF for stateless JWT-based authentication
        http.csrf(csrf -> csrf.disable()).authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout").permitAll() // Allow public access to auth endpoints
                .anyRequest().authenticated() // Require authentication for all other endpoints
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // No server-side sessions for JWT
            );

        return http.build();
    }
}