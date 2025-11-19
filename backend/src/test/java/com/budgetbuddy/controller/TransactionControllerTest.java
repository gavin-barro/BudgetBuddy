package com.budgetbuddy.controller;

import com.budgetbuddy.dto.TransactionDTO;
import com.budgetbuddy.entity.*;
import com.budgetbuddy.repository.AccountRepository;
import com.budgetbuddy.repository.TransactionRepository;
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

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
public class TransactionControllerTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private TransactionRepository transactionRepository;

    private UserEntity testUser;
    private AccountEntity testAccount;

    @BeforeEach
    public void setup() {
        transactionRepository.deleteAll();
        accountRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new UserEntity();
        testUser.setFirstName("John"); testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setPasswordHash("$2a$10$hashed");
        testUser = userRepository.save(testUser);

        testAccount = new AccountEntity();
        testAccount.setUser(testUser);
        testAccount.setName("Main"); testAccount.setType(AccountEntity.AccountType.checking);
        testAccount.setBalance(0.0);
        testAccount = accountRepository.save(testAccount);
    }

    private void createTestTransaction(String category, double amount, String type, String date) {
        TransactionEntity t = new TransactionEntity();
        t.setAccount(testAccount);
        t.setUser(testUser);
        t.setAmount(amount);
        t.setType(type.equals("income") ? TransactionEntity.TransactionType.INCOME : TransactionEntity.TransactionType.EXPENSE);
        t.setCategory(category);
        t.setDate(LocalDateTime.parse(date + "T12:00:00"));
        transactionRepository.save(t);
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testGetTransactions_DefaultSortingAndPagination() throws Exception {
        createTestTransaction("Food", 50.0, "expense", "2025-01-01");
        createTestTransaction("Salary", 2000.0, "income", "2025-01-15");

        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalElements").value(2))
                .andExpect(jsonPath("$.number").value(0));
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testGetTransactions_FilterByCategory() throws Exception {
        createTestTransaction("Groceries", 120.0, "expense", "2025-02-01");
        createTestTransaction("Rent", 800.0, "expense", "2025-02-05");
        createTestTransaction("Groceries", 45.0, "expense", "2025-02-10");

        mockMvc.perform(get("/api/transactions?category=groceries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testGetTransactions_SortByAmountDesc() throws Exception {
        createTestTransaction("A", 100.0, "income", "2025-03-01");
        createTestTransaction("B", 500.0, "income", "2025-03-02");
        createTestTransaction("C", 300.0, "income", "2025-03-03");

        mockMvc.perform(get("/api/transactions?sortBy=amount_desc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].amount").value(500.0))
                .andExpect(jsonPath("$.content[2].amount").value(100.0));
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testGetTransactions_Pagination() throws Exception {
        for (int i = 0; i < 25; i++) {
            createTestTransaction("Test", 10.0, "expense", "2025-04-" + String.format("%02d", i + 1));
        }

        mockMvc.perform(get("/api/transactions?page=1&limit=10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(25))
                .andExpect(jsonPath("$.number").value(1))
                .andExpect(jsonPath("$.size").value(10));
    }
}