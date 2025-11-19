package com.budgetbuddy.service;

import com.budgetbuddy.dto.TransactionDTO;
import com.budgetbuddy.entity.*;
import com.budgetbuddy.repository.AccountRepository;
import com.budgetbuddy.repository.TransactionRepository;
import com.budgetbuddy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
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

    // GET with filtering, sorting, pagination
    public Page<TransactionEntity> getTransactions(String userEmail,
                                                   String category,
                                                   String sortBy,
                                                   int page,
                                                   int limit) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Sort sort = Sort.by(Sort.Direction.DESC, "date"); // default date_desc
        if (sortBy != null) {
            switch (sortBy.toLowerCase()) {
                case "date_asc" -> sort = Sort.by(Sort.Direction.ASC, "date");
                case "amount_desc" -> sort = Sort.by(Sort.Direction.DESC, "amount");
                case "amount_asc" -> sort = Sort.by(Sort.Direction.ASC, "amount");
            }
        }

        Pageable pageable = PageRequest.of(page, limit, sort);

        if (category != null && !category.trim().isEmpty()) {
            return transactionRepository.findByUserIdAndCategoryContainingIgnoreCase(
                    user.getId(), category.trim(), pageable);
        } else {
            return transactionRepository.findByUserId(user.getId(), pageable);
        }
    }

    // CREATE
    public TransactionEntity createTransaction(String userEmail, TransactionDTO dto) {
        validateCommonFields(dto);

        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        AccountEntity account = accountRepository.findById(dto.getAccountId())
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        if (!account.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only add transactions to your own accounts");
        }

        LocalDateTime date = parseDate(dto.getDate());

        // Update balance
        double adjustment = dto.getType().equals("expense") ? -dto.getAmount() : dto.getAmount();
        account.setBalance(account.getBalance() + adjustment);
        accountRepository.save(account);

        TransactionEntity t = new TransactionEntity();
        t.setAccount(account);
        t.setUser(user);
        t.setAmount(dto.getAmount());
        t.setType(TransactionEntity.TransactionType.valueOf(dto.getType().toUpperCase()));
        t.setCategory(dto.getCategory().trim());
        t.setDate(date);
        if (dto.getDescription() != null) t.setDescription(dto.getDescription().trim());

        return transactionRepository.save(t);
    }

    // UPDATE
    public TransactionEntity updateTransaction(String userEmail, Long transactionId, TransactionDTO dto) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TransactionEntity t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        if (!t.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only update your own transactions");
        }

        // Revert old balance effect
        double oldAdjustment = t.getType() == TransactionEntity.TransactionType.EXPENSE
                ? -t.getAmount() : t.getAmount();
        t.getAccount().setBalance(t.getAccount().getBalance() - oldAdjustment);

        // Apply new values where provided
        if (dto.getAccountId() != null) {
            AccountEntity newAccount = accountRepository.findById(dto.getAccountId())
                    .orElseThrow(() -> new IllegalArgumentException("Account not found"));
            if (!newAccount.getUser().getId().equals(user.getId())) {
                throw new IllegalArgumentException("You can only move to your own accounts");
            }
            if (!newAccount.getId().equals(t.getAccount().getId())) {
                t.setAccount(newAccount);
            }
        }
        if (dto.getAmount() != null) t.setAmount(dto.getAmount());
        if (dto.getType() != null) t.setType(TransactionEntity.TransactionType.valueOf(dto.getType().toUpperCase()));
        if (dto.getCategory() != null) t.setCategory(dto.getCategory().trim());
        if (dto.getDate() != null) t.setDate(parseDate(dto.getDate()));
        if (dto.getDescription() != null) t.setDescription(dto.getDescription().trim());

        // Apply new balance effect
        double newAdjustment = t.getType() == TransactionEntity.TransactionType.EXPENSE
                ? -t.getAmount() : t.getAmount();
        t.getAccount().setBalance(t.getAccount().getBalance() + newAdjustment);
        accountRepository.save(t.getAccount());

        return transactionRepository.save(t);
    }

    // DELETE
    public void deleteTransaction(String userEmail, Long transactionId) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        TransactionEntity t = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Transaction not found"));
        if (!t.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own transactions");
        }

        // Revert balance
        double adjustment = t.getType() == TransactionEntity.TransactionType.EXPENSE
                ? t.getAmount() : -t.getAmount();
        t.getAccount().setBalance(t.getAccount().getBalance() + adjustment);
        accountRepository.save(t.getAccount());

        transactionRepository.delete(t);
    }

    // Helper validation
    private void validateCommonFields(TransactionDTO dto) {
        if (dto.getAccountId() == null) throw new IllegalArgumentException("Account ID is required");
        if (dto.getAmount() == null || dto.getAmount() <= 0) throw new IllegalArgumentException("Valid amount is required");
        if (dto.getType() == null || !dto.getType().matches("(?i)income|expense"))
            throw new IllegalArgumentException("Type must be 'income' or 'expense'");
        if (dto.getCategory() == null || dto.getCategory().trim().isEmpty())
            throw new IllegalArgumentException("Category is required");
        if (dto.getDate() == null || dto.getDate().trim().isEmpty())
            throw new IllegalArgumentException("Date is required (YYYY-MM-DD)");
    }

    private LocalDateTime parseDate(String dateStr) {
        try {
            return LocalDateTime.parse(dateStr + "T00:00:00", DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Invalid date format. Use YYYY-MM-DD");
        }
    }
}