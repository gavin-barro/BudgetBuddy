package com.budgetbuddy.controller;

import com.budgetbuddy.dto.AccountDTO;
import com.budgetbuddy.entity.AccountEntity;
import com.budgetbuddy.entity.UserEntity;
import com.budgetbuddy.repository.AccountRepository;
import com.budgetbuddy.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class AccountControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    private UserEntity testUser;
    private AccountEntity testAccount;

    @BeforeEach
    public void setup() {
        accountRepository.deleteAll();
        userRepository.deleteAll();
        testUser = new UserEntity();
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setPasswordHash("$2a$10$..."); // Hashed password
        testUser = userRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateAccountSuccess() throws Exception {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("My Checking Account");
        accountDTO.setType("checking");
        accountDTO.setBalance(1000.0);

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountDTO)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateAccountInvalidName() throws Exception {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setType("savings");

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateAccountInvalidType() throws Exception {
        AccountDTO accountDTO = new AccountDTO();
        accountDTO.setName("My Account");

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(accountDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateAccountSuccess() throws Exception {
        // Create a test account first
        AccountDTO createDTO = new AccountDTO();
        createDTO.setName("Old Name");
        createDTO.setType("checking");

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated());

        // Get the created account ID (for simplicity, assume first account; in real tests, extract from response)
        testAccount = accountRepository.findAll().get(0);
        Long accountId = testAccount.getId();

        // Update name
        AccountDTO updateDTO = new AccountDTO();
        updateDTO.setName("New Name");

        mockMvc.perform(put("/api/accounts/" + accountId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateAccountNotFound() throws Exception {
        AccountDTO updateDTO = new AccountDTO();
        updateDTO.setName("New Name");

        mockMvc.perform(put("/api/accounts/999")  // Non-existent ID
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testDeleteAccountSuccess() throws Exception {
        // Create a test account first
        AccountDTO createDTO = new AccountDTO();
        createDTO.setName("To Delete");
        createDTO.setType("savings");

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated());

        // Get the created account ID
        testAccount = accountRepository.findAll().get(0);
        Long accountId = testAccount.getId();

        // Delete account
        mockMvc.perform(delete("/api/accounts/" + accountId))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testDeleteAccountNotFound() throws Exception {
        mockMvc.perform(delete("/api/accounts/999"))  // Non-existent ID
                .andExpect(status().isBadRequest());
    }
}