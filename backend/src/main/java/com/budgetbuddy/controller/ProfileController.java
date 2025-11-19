package com.budgetbuddy.controller;

import com.budgetbuddy.dto.UserDTO;
import com.budgetbuddy.entity.UserEntity;
import com.budgetbuddy.service.ProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private ProfileService profileService;

    // GET /api/profile - Retrieve current user's profile (excluding password)
    @GetMapping
    public ResponseEntity<UserDTO> getProfile(Principal principal) {
        try {
            UserEntity user = profileService.getUserByEmail(principal.getName());
            UserDTO userDTO = new UserDTO();
            userDTO.setFirstName(user.getFirstName());
            userDTO.setLastName(user.getLastName());
            userDTO.setEmail(user.getEmail());
            return new ResponseEntity<>(userDTO, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    // PUT /api/profile/name - Update first and last name
    @PutMapping("/name")
    public ResponseEntity<?> updateName(@RequestBody UpdateNameDTO updateNameDTO, Principal principal) {
        try {
            profileService.updateName(principal.getName(), updateNameDTO.getFirstName(), updateNameDTO.getLastName());
            return new ResponseEntity<>("Name updated successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating name", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PUT /api/profile/email - Update email
    @PutMapping("/email")
    public ResponseEntity<?> updateEmail(@RequestBody UpdateEmailDTO updateEmailDTO, Principal principal) {
        try {
            profileService.updateEmail(principal.getName(), updateEmailDTO.getEmail());
            return new ResponseEntity<>("Email updated successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating email", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PUT /api/profile/password - Update password
    @PutMapping("/password")
    public ResponseEntity<?> updatePassword(@RequestBody UpdatePasswordDTO updatePasswordDTO, Principal principal) {
        try {
            profileService.updatePassword(principal, updatePasswordDTO.getCurrentPassword(), updatePasswordDTO.getNewPassword());
            return new ResponseEntity<>("Password updated successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating password", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DTOs for updates
    public static class UpdateNameDTO {
        private String firstName;
        private String lastName;

        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }
        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }
    }

    public static class UpdateEmailDTO {
        private String email;

        // Getter and setter
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class UpdatePasswordDTO {
        private String currentPassword;
        private String newPassword;

        // Getters and setters
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}