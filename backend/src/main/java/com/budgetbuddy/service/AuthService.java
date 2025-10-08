package com.budgetbuddy.service;

import com.budgetbuddy.dto.UserDTO;
import com.budgetbuddy.entity.UserEntity;
import com.budgetbuddy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    public UserEntity registerUser(UserDTO userDTO) {
        // Basic validation
        if (userDTO.getFirstName() == null || userDTO.getFirstName().isEmpty()) {
            throw new IllegalArgumentException("First name is required");
        }
        if (userDTO.getLastName() == null || userDTO.getLastName().isEmpty()) {
            throw new IllegalArgumentException("Last name is required");
        }
        if (userDTO.getEmail() == null || userDTO.getEmail().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
        if (userDTO.getPassword() == null || userDTO.getPassword().isEmpty()) {
            throw new IllegalArgumentException("Password is required");
        }
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new IllegalArgumentException("Email is already in use");
        }

        // Create user entity
        UserEntity user = new UserEntity();
        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());
        user.setEmail(userDTO.getEmail());
        user.setPasswordHash(passwordEncoder.encode(userDTO.getPassword()));

        // Save user to database
        return userRepository.save(user);
    }
}