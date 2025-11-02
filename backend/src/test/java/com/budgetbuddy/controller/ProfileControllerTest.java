package com.budgetbuddy.controller;

import com.budgetbuddy.dto.UserDTO;
import com.budgetbuddy.entity.UserEntity;
import com.budgetbuddy.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class ProfileControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private UserEntity testUser;

    @BeforeEach
    public void setup() {
        userRepository.deleteAll();
        testUser = new UserEntity();
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setPasswordHash(passwordEncoder.encode("securePassword123"));
        userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testGetProfile() throws Exception {
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("John"))
                .andExpect(jsonPath("$.lastName").value("Doe"))
                .andExpect(jsonPath("$.email").value("john.doe@example.com"));
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateName() throws Exception {
        ProfileController.UpdateNameDTO updateDTO = new ProfileController.UpdateNameDTO();
        updateDTO.setFirstName("Jane");
        updateDTO.setLastName("Smith");

        mockMvc.perform(put("/api/profile/name")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Name updated successfully"));

        // Verify update
        mockMvc.perform(get("/api/profile"))
                .andExpect(jsonPath("$.firstName").value("Jane"))
                .andExpect(jsonPath("$.lastName").value("Smith"));
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateEmail() throws Exception {
        ProfileController.UpdateEmailDTO updateDTO = new ProfileController.UpdateEmailDTO();
        updateDTO.setEmail("jane.smith@example.com");

        mockMvc.perform(put("/api/profile/email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Email updated successfully"));
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdatePassword() throws Exception {
        ProfileController.UpdatePasswordDTO updateDTO = new ProfileController.UpdatePasswordDTO();
        updateDTO.setCurrentPassword("securePassword123");
        updateDTO.setNewPassword("newSecurePassword456");

        mockMvc.perform(put("/api/profile/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Password updated successfully"));
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateNameInvalidInput() throws Exception {
        ProfileController.UpdateNameDTO updateDTO = new ProfileController.UpdateNameDTO();
        updateDTO.setFirstName(""); // Empty first name

        mockMvc.perform(put("/api/profile/name")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateEmailInvalidFormat() throws Exception {
        ProfileController.UpdateEmailDTO updateDTO = new ProfileController.UpdateEmailDTO();
        updateDTO.setEmail("invalid-email");

        mockMvc.perform(put("/api/profile/email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdatePasswordInvalidCurrent() throws Exception {
        ProfileController.UpdatePasswordDTO updateDTO = new ProfileController.UpdatePasswordDTO();
        updateDTO.setCurrentPassword("wrongPassword");
        updateDTO.setNewPassword("newPassword");

        mockMvc.perform(put("/api/profile/password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest());
    }
}