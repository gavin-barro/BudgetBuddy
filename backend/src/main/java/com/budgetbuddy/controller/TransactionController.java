package com.budgetbuddy.controller;

import com.budgetbuddy.dto.TransactionDTO;
import com.budgetbuddy.entity.TransactionEntity;
import com.budgetbuddy.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    // GET /api/transactions - with filtering, sorting, pagination
    @GetMapping
    public ResponseEntity<Page<TransactionEntity>> getTransactions(
            Principal principal,
            @RequestParam(required = false) String category,
            @RequestParam(required = false, defaultValue = "date_desc") String sortBy,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "20") int limit) {

        Page<TransactionEntity> transactions = transactionService.getTransactions(
                principal.getName(), category, sortBy, page, limit);

        return new ResponseEntity<>(transactions, HttpStatus.OK);
    }

    // POST /api/transactions
    @PostMapping
    public ResponseEntity<?> createTransaction(@RequestBody TransactionDTO transactionDTO, Principal principal) {
        try {
            TransactionEntity createdTransaction = transactionService.createTransaction(principal.getName(), transactionDTO);
            return new ResponseEntity<>("Transaction created successfully", HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while creating the transaction", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // PUT /api/transactions/{id}
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id, @RequestBody TransactionDTO transactionDTO, Principal principal) {
        try {
            TransactionEntity updatedTransaction = transactionService.updateTransaction(principal.getName(), id, transactionDTO);
            return new ResponseEntity<>("Transaction updated successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while updating the transaction", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // DELETE /api/transactions/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id, Principal principal) {
        try {
            transactionService.deleteTransaction(principal.getName(), id);
            return new ResponseEntity<>("Transaction deleted successfully", HttpStatus.OK);
        } catch (IllegalArgumentException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            return new ResponseEntity<>("An error occurred while deleting the transaction", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}