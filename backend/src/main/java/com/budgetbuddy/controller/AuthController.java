package com.budgetbuddy.controller;

import com.budgetbuddy.dto.UserDTO;
// import com.budgetbuddy.entity.UserEntity;
import com.budgetbuddy.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody UserDTO userDTO) {
        try {
            authService.registerUser(userDTO);
            return new ResponseEntity<>("User registered successfully", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred during registration", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody UserDTO userDTO) {
        try {
            String token = authService.loginUser(userDTO.getEmail(), userDTO.getPassword());
            return new ResponseEntity<>(new LoginResponse(token), HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred during login", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logoutUser() {
        // JWT is stateless - logout is handled client-side by discarding the token
        return new ResponseEntity<>("Logged out successfully", HttpStatus.OK);
    }

    // Inner class for login response
    private static class LoginResponse {
        private final String token;

        public LoginResponse(String token) {
            this.token = token;
        }

        public String getToken() {
            return this.token;
        }
    }
}