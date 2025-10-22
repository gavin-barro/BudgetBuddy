package com.budgetbuddy.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 1) Enable CORS with our CorsConfigurationSource bean
            .cors(Customizer.withDefaults())
            // 2) Disable CSRF for stateless APIs
            .csrf(csrf -> csrf.disable())
            // 3) Authorize requests (permit auth endpoints + preflight)
            .authorizeHttpRequests(auth -> auth
                // Allow browser preflight requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public auth endpoints
                .requestMatchers("/api/auth/register", "/api/auth/login", "/api/auth/logout").permitAll()
                // Everything else requires auth (once you add your JWT filter later)
                .anyRequest().authenticated()
            )
            // 4) Stateless sessions for JWT
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        return http.build();
    }

    /**
     * CORS configuration for local dev with Vite.
     * Adjust the origins to match where your frontend runs.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Frontend dev origins — add/remove as needed
        config.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "http://127.0.0.1:5173"
        ));
        // If you prefer patterns, you can use setAllowedOriginPatterns(List.of("http://localhost:*"))

        // Methods you allow the browser to use
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // Headers the browser is allowed to send
        config.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));

        // If you send cookies (usually false with JWT Authorization headers)
        config.setAllowCredentials(true);

        // Headers the browser is allowed to read from the response
        config.setExposedHeaders(List.of("Authorization"));

        // Preflight cache duration
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        // Apply to your API paths (or "/**")
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
