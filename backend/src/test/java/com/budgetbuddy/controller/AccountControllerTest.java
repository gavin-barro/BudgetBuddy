package com.budgetbuddy.controller;

import com.budgetbuddy.dto.AccountDTO;
import com.budgetbuddy.entity.UserEntity;
import com.budgetbuddy.repository.AccountRepository;
import com.budgetbuddy.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
@Transactional
public class AccountControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private EntityManager entityManager;

    private UserEntity testUser;

    @BeforeEach
    public void setup() {

        // JPQL delete requires a transaction, should be safe because @Transactional is on the class
        entityManager.createQuery("DELETE FROM TransactionEntity").executeUpdate();

        accountRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new UserEntity();
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setPasswordHash("$2a$10$dummyhash1234567890123456");
        userRepository.saveAndFlush(testUser);
    }
    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateAccountSuccess() throws Exception {
        AccountDTO dto = new AccountDTO();
        dto.setName("My Checking Account");
        dto.setType("checking");
        dto.setBalance(1000.0);

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateAccountInvalidName() throws Exception {
        AccountDTO dto = new AccountDTO();
        dto.setType("savings");

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateAccountInvalidType() throws Exception {
        AccountDTO dto = new AccountDTO();
        dto.setName("My Account");

        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateAccountSuccess() throws Exception {
        AccountDTO createDto = new AccountDTO();
        createDto.setName("Old Name");
        createDto.setType("checking");
        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDto)))
                .andExpect(status().isCreated());

        Long id = accountRepository.findAll().get(0).getId();

        AccountDTO updateDto = new AccountDTO();
        updateDto.setName("New Name");

        mockMvc.perform(put("/api/accounts/" + id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDto)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateAccountNotFound() throws Exception {
        AccountDTO dto = new AccountDTO();
        dto.setName("Whatever");

        mockMvc.perform(put("/api/accounts/999999")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testDeleteAccountSuccess() throws Exception {
        AccountDTO dto = new AccountDTO();
        dto.setName("Delete Me");
        dto.setType("savings");
        mockMvc.perform(post("/api/accounts")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated());

        Long id = accountRepository.findAll().get(0).getId(); 

        mockMvc.perform(delete("/api/accounts/" + id))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testDeleteAccountNotFound() throws Exception {
        mockMvc.perform(delete("/api/accounts/999999"))
                .andExpect(status().isBadRequest());
    }
}