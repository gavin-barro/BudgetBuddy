package com.budgetbuddy.controller;

import com.budgetbuddy.dto.TransactionDTO;
import com.budgetbuddy.entity.AccountEntity;
import com.budgetbuddy.entity.TransactionEntity;
import com.budgetbuddy.entity.UserEntity;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class TransactionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    private UserEntity testUser;
    private AccountEntity testAccount;
    private TransactionEntity testTransaction;

    @BeforeEach
    public void setup() {
        transactionRepository.deleteAll();
        accountRepository.deleteAll();
        userRepository.deleteAll();

        testUser = new UserEntity();
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john.doe@example.com");
        testUser.setPasswordHash("$2a$10$..."); // Hashed password
        testUser = userRepository.save(testUser);

        testAccount = new AccountEntity();
        testAccount.setUser(testUser);
        testAccount.setName("Test Account");
        testAccount.setType(AccountEntity.AccountType.checking);
        testAccount.setBalance(0.0);
        testAccount = accountRepository.save(testAccount);
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateTransactionSuccess() throws Exception {
        TransactionDTO transactionDTO = new TransactionDTO();
        transactionDTO.setAccountId(testAccount.getId());
        transactionDTO.setAmount(100.0);
        transactionDTO.setType("income");
        transactionDTO.setCategory("Salary");
        transactionDTO.setDate("2023-10-01");

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transactionDTO)))
                .andExpect(status().isCreated());

        // Verify transaction created and balance updated
        assert transactionRepository.findAll().size() == 1;
        assert testAccount.getBalance() == 100.0; // Income increases balance
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateTransactionInvalidAccount() throws Exception {
        TransactionDTO transactionDTO = new TransactionDTO();
        transactionDTO.setAccountId(999L); // Non-existent
        transactionDTO.setAmount(50.0);
        transactionDTO.setType("expense");
        transactionDTO.setCategory("Food");
        transactionDTO.setDate("2023-10-02");

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transactionDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateTransactionInvalidAmount() throws Exception {
        TransactionDTO transactionDTO = new TransactionDTO();
        transactionDTO.setAccountId(testAccount.getId());
        transactionDTO.setAmount(-10.0); // Invalid (negative)
        transactionDTO.setType("expense");
        transactionDTO.setCategory("Groceries");
        transactionDTO.setDate("2023-10-03");

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transactionDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateTransactionInvalidType() throws Exception {
        TransactionDTO transactionDTO = new TransactionDTO();
        transactionDTO.setAccountId(testAccount.getId());
        transactionDTO.setAmount(200.0);
        transactionDTO.setType("invalid"); // Invalid type
        transactionDTO.setCategory("Bonus");
        transactionDTO.setDate("2023-10-04");

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transactionDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testCreateTransactionInvalidDate() throws Exception {
        TransactionDTO transactionDTO = new TransactionDTO();
        transactionDTO.setAccountId(testAccount.getId());
        transactionDTO.setAmount(75.0);
        transactionDTO.setType("expense");
        transactionDTO.setCategory("Rent");
        transactionDTO.setDate("invalid-date"); // Invalid format

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(transactionDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testUpdateTransactionSuccess() throws Exception {
        // Create initial transaction
        TransactionDTO createDTO = new TransactionDTO();
        createDTO.setAccountId(testAccount.getId());
        createDTO.setAmount(50.0);
        createDTO.setType("expense");
        createDTO.setCategory("Food");
        createDTO.setDate("2023-10-01");

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated());

        testTransaction = transactionRepository.findAll().get(0);
        Long transactionId = testTransaction.getId();

        // Verify initial balance decreased
        testAccount = accountRepository.findById(testAccount.getId()).orElse(null);
        assertEquals(-50.0, testAccount.getBalance());

        // Update to income with higher amount
        TransactionDTO updateDTO = new TransactionDTO();
        updateDTO.setAmount(200.0);
        updateDTO.setType("income");
        updateDTO.setCategory("Bonus");
        updateDTO.setDate("2023-10-02");

        mockMvc.perform(put("/api/transactions/" + transactionId)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk());

        // Verify balance adjusted: revert -50 (add 50), add +200 = +150 from original 0
        testAccount = accountRepository.findById(testAccount.getId()).orElse(null);
        assertEquals(150.0, testAccount.getBalance());
    }

    @Test
    @WithMockUser(username = "john.doe@example.com")
    public void testDeleteTransactionSuccess() throws Exception {
        // Create initial transaction
        TransactionDTO createDTO = new TransactionDTO();
        createDTO.setAccountId(testAccount.getId());
        createDTO.setAmount(75.0);
        createDTO.setType("expense");
        createDTO.setCategory("Rent");
        createDTO.setDate("2023-10-01");

        mockMvc.perform(post("/api/transactions")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(createDTO)))
                .andExpect(status().isCreated());

        testTransaction = transactionRepository.findAll().get(0);
        Long transactionId = testTransaction.getId();

        // Verify initial balance decreased
        testAccount = accountRepository.findById(testAccount.getId()).orElse(null);
        assertEquals(-75.0, testAccount.getBalance());

        // Delete transaction
        mockMvc.perform(delete("/api/transactions/" + transactionId))
                .andExpect(status().isOk());

        // Verify balance reverted to original
        testAccount = accountRepository.findById(testAccount.getId()).orElse(null);
        assertEquals(0.0, testAccount.getBalance());
        assertEquals(0, transactionRepository.findAll().size());
    }
}