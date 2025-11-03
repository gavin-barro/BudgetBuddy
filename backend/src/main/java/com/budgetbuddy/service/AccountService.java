package com.budgetbuddy.service;

import com.budgetbuddy.dto.AccountDTO;
import com.budgetbuddy.entity.AccountEntity;
import com.budgetbuddy.entity.UserEntity;
import com.budgetbuddy.repository.AccountRepository;
import com.budgetbuddy.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AccountService {

    @Autowired
    private AccountRepository accountRepository;

    @Autowired
    private UserRepository userRepository;

    public Iterable<AccountEntity> getAccountsByUsername(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return accountRepository.findByUserId(user.getId());
    }

    public AccountEntity createAccount(String userEmail, AccountDTO accountDTO) {
        // Validate input
        if (accountDTO.getName() == null || accountDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Account name is required");
        }
        if (accountDTO.getType() == null || accountDTO.getType().isEmpty()) {
            throw new IllegalArgumentException("Account type is required");
        }

        // Find the current user
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Create new account entity
        AccountEntity account = new AccountEntity();
        account.setUser(user); // Associate with user
        account.setName(accountDTO.getName().trim());
        account.setType(AccountEntity.AccountType.valueOf(accountDTO.getType().toLowerCase()));
        account.setBalance(accountDTO.getBalance() != null ? accountDTO.getBalance() : 0.0);

        // Save to database
        return accountRepository.save(account);
    }

    public AccountEntity updateAccount(String userEmail, Long accountId, AccountDTO accountDTO) {
        // Find the current user
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Find the account
        Optional<AccountEntity> optionalAccount = accountRepository.findById(accountId);
        if (optionalAccount.isEmpty()) {
            throw new IllegalArgumentException("Account not found");
        }

        AccountEntity account = optionalAccount.get();

        // Ownership check: Ensure the account belongs to the user
        if (!account.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only update your own accounts");
        }

        // Validate and update fields (e.g., name; type and balance could be added if needed)
        if (accountDTO.getName() != null && !accountDTO.getName().trim().isEmpty()) {
            account.setName(accountDTO.getName().trim());
        }

        if (accountDTO.getType() != null && !accountDTO.getType().trim().isEmpty()) {
            String canonical = normalizeType(accountDTO.getType());
            account.setType(AccountEntity.AccountType.valueOf(canonical));
        }

        if (accountDTO.getBalance() != null) {
            Double b = accountDTO.getBalance();
            if (b.isNaN() || b.isInfinite()) {
                throw new IllegalArgumentException("Balance must be a valid number");
            }
            account.setBalance(b);
        }
        

        // Save updated account
        return accountRepository.save(account);
    }

    public void deleteAccount(String userEmail, Long accountId) {
        // Find the current user
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Find the account
        Optional<AccountEntity> optionalAccount = accountRepository.findById(accountId);
        if (optionalAccount.isEmpty()) {
            throw new IllegalArgumentException("Account not found");
        }

        AccountEntity account = optionalAccount.get();

        // Ownership check: Ensure the account belongs to the user
        if (!account.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own accounts");
        }

        // Delete the account
        accountRepository.delete(account);
    }


    // Helper method to help with adding account type
    private String normalizeType(String raw) {
    String s = raw == null ? "" : raw.trim().toLowerCase();
    switch (s) {
        case "checking": return "checking";
        case "savings": return "savings";
        case "credit":
        case "credit card":
        case "credit_card": return "credit";
        // If you don’t support these as first-class types, map them to "other"
        case "investment":
        case "loan":
        default: return "other";
    }
}
}