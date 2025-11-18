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
        // Validate input (same as before)
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
        double balanceAdjustment = transactionDTO.getType().equals("expense") ? -transactionDTO.getAmount() : transactionDTO.getAmount();
        account.setBalance(account.getBalance() + balanceAdjustment);
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

    public TransactionEntity updateTransaction(String userEmail, Long transactionId, TransactionDTO transactionDTO) {
        // Validate input (similar to create, but allow partial updates)
        if (transactionDTO.getAccountId() != null && transactionDTO.getAccountId() <= 0) {
            throw new IllegalArgumentException("Valid account ID is required");
        }
        if (transactionDTO.getAmount() != null && (transactionDTO.getAmount() <= 0)) {
            throw new IllegalArgumentException("Valid amount is required");
        }
        if (transactionDTO.getType() != null && !(transactionDTO.getType().equals("income") || transactionDTO.getType().equals("expense"))) {
            throw new IllegalArgumentException("Type must be 'income' or 'expense'");
        }
        if (transactionDTO.getCategory() != null && transactionDTO.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("Category cannot be empty");
        }
        if (transactionDTO.getDate() != null && !transactionDTO.getDate().trim().isEmpty()) {
            LocalDateTime transactionDate;
            try {
                transactionDate = LocalDateTime.parse(transactionDTO.getDate() + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
            } catch (DateTimeParseException e) {
                throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
            }
        }

        // Find the current user
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Find the transaction
        TransactionEntity transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        // Ownership check
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only update your own transactions");
        }

        // Revert old balance adjustment
        double oldAdjustment = transaction.getType() == TransactionEntity.TransactionType.EXPENSE ? -transaction.getAmount() : transaction.getAmount();
        transaction.getAccount().setBalance(transaction.getAccount().getBalance() - oldAdjustment);
        accountRepository.save(transaction.getAccount());

        // Apply new balance adjustment if changed
        double newAdjustment = 0.0;
        if (transactionDTO.getAmount() != null || transactionDTO.getType() != null) {
            double newAmount = transactionDTO.getAmount() != null ? transactionDTO.getAmount() : transaction.getAmount();
            String newType = transactionDTO.getType() != null ? transactionDTO.getType() : transaction.getType().name().toLowerCase();
            newAdjustment = newType.equals("expense") ? -newAmount : newAmount;
        }

        // Update fields if provided
        if (transactionDTO.getAccountId() != null) {
            AccountEntity newAccount = accountRepository.findById(transactionDTO.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("New account not found"));
            if (!newAccount.getUser().getId().equals(user.getId())) {
                throw new IllegalArgumentException("You can only update to your own accounts");
            }
            // Revert old account balance (already done above), apply to new if changed
            if (!newAccount.getId().equals(transaction.getAccount().getId())) {
                transaction.setAccount(newAccount);
                // Apply new adjustment to new account
                newAccount.setBalance(newAccount.getBalance() + newAdjustment);
                accountRepository.save(newAccount);
            }
        }

        if (transactionDTO.getAmount() != null) {
            transaction.setAmount(transactionDTO.getAmount());
        }
        if (transactionDTO.getType() != null) {
            transaction.setType(TransactionEntity.TransactionType.valueOf(transactionDTO.getType().toUpperCase()));
        }
        if (transactionDTO.getCategory() != null) {
            transaction.setCategory(transactionDTO.getCategory().trim());
        }
        if (transactionDTO.getDate() != null && !transactionDTO.getDate().trim().isEmpty()) {
            transaction.setDate(LocalDateTime.parse(transactionDTO.getDate() + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME));
        }
        if (transactionDTO.getDescription() != null) {
            transaction.setDescription(transactionDTO.getDescription().trim());
        }

        // Apply the new adjustment to the (possibly new) account
        if (newAdjustment != 0.0) {
            transaction.getAccount().setBalance(transaction.getAccount().getBalance() + newAdjustment);
            accountRepository.save(transaction.getAccount());
        }

        // Save updated transaction
        return transactionRepository.save(transaction);
    }

    public void deleteTransaction(String userEmail, Long transactionId) {
        // Find the current user
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Find the transaction
        TransactionEntity transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));

        // Ownership check
        if (!transaction.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own transactions");
        }

        // Revert the transaction's effect on balance
        double adjustment = transaction.getType() == TransactionEntity.TransactionType.EXPENSE ? transaction.getAmount() : -transaction.getAmount();
        transaction.getAccount().setBalance(transaction.getAccount().getBalance() + adjustment);
        accountRepository.save(transaction.getAccount());

        // Delete the transaction
        transactionRepository.delete(transaction);
    }
}