package com.budgetbuddy.service;

import com.budgetbuddy.dto.TransactionDTO;
import com.budgetbuddy.entity.AccountEntity;
import com.budgetbuddy.entity.TransactionEntity;
import com.budgetbuddy.entity.UserEntity;
import com.budgetbuddy.repository.AccountRepository;
import com.budgetbuddy.repository.TransactionRepository;
import com.budgetbuddy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

@Service
public class TransactionService {

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AccountRepository accountRepository;

    public TransactionEntity createTransaction(String userEmail, TransactionDTO transactionDTO) {
        // Validate input
        if (transactionDTO.getAccountId() == null) {
            throw new IllegalArgumentException("Account ID is required");
        }
        if (transactionDTO.getAmount() == null || transactionDTO.getAmount() <= 0) {
            throw new IllegalArgumentException("Valid amount is required");
        }
        if (transactionDTO.getType() == null || !(transactionDTO.getType().equals("income") || transactionDTO.getType().equals("expense"))) {
            throw new IllegalArgumentException("Type must be 'income' or 'expense'");
        }
        if (transactionDTO.getCategory() == null || transactionDTO.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category is required");
        }
        if (transactionDTO.getDate() == null || transactionDTO.getDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Date is required in YYYY-MM-DD format");
        }

        // Parse and validate date
        LocalDateTime transactionDate;
        try {
            transactionDate = LocalDateTime.parse(transactionDTO.getDate() + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
        }

        // Find the current user
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Find and validate account ownership
        AccountEntity account = accountRepository.findById(transactionDTO.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (!account.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only add transactions to your own accounts");
        }

        // Update account balance based on transaction type
        if ("expense".equals(transactionDTO.getType())) {
            account.setBalance(account.getBalance() - transactionDTO.getAmount());
        } else {
            account.setBalance(account.getBalance() + transactionDTO.getAmount());
        }
        accountRepository.save(account);

        // Create new transaction entity
        TransactionEntity transaction = new TransactionEntity();
        transaction.setAccount(account);
        transaction.setUser(user);
        transaction.setAmount(transactionDTO.getAmount());
        transaction.setType(TransactionEntity.TransactionType.valueOf(transactionDTO.getType().toUpperCase()));
        transaction.setCategory(transactionDTO.getCategory().trim());
        transaction.setDate(transactionDate);
        if (transactionDTO.getDescription() != null) {
            transaction.setDescription(transactionDTO.getDescription().trim());
        }

        // Save to database
        return transactionRepository.save(transaction);
    }
}