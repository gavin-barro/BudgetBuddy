package com.budgetbuddy.controller;

import com.budgetbuddy.dto.AccountDTO;
import com.budgetbuddy.entity.AccountEntity;
import com.budgetbuddy.service.AccountService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/accounts")
public class AccountController {

    @Autowired
    private AccountService accountService;


    @GetMapping
    public ResponseEntity<?> getAccounts(Principal principal) {
        try {
            return new ResponseEntity<>(accountService.getAccountsByUsername(principal.getName()), HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while fetching accounts", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // POST /api/accounts - Create a new account for the authenticated user
    @PostMapping
    public ResponseEntity<?> createAccount(@RequestBody AccountDTO accountDTO, Principal principal) {
        try {
            AccountEntity createdAccount = accountService.createAccount(principal.getName(), accountDTO);
            return new ResponseEntity<>("Account created successfully", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while creating the account", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PUT /api/accounts/{id} - Update an existing account (e.g., name)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAccount(@PathVariable Long id, @RequestBody AccountDTO accountDTO, Principal principal) {
        try {
            AccountEntity updatedAccount = accountService.updateAccount(principal.getName(), id, accountDTO);
            return new ResponseEntity<>("Account updated successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating the account", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /api/accounts/{id} - Delete an existing account
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id, Principal principal) {
        try {
            accountService.deleteAccount(principal.getName(), id);
            return new ResponseEntity<>("Account deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while deleting the account", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}