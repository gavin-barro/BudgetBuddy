package com.budgetbuddy.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.budgetbuddy.entity.TransactionEntity;
@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
     Page<TransactionEntity> findByUserId(Long userId, Pageable pageable);

    // Filtered by category for a user
    Page<TransactionEntity> findByUserIdAndCategory(
            Long userId,
            String category,
            Pageable pageable
    );

    // If you also need account scoped lists:
    Page<TransactionEntity> findByAccountId(Long accountId, Pageable pageable);

    Page<TransactionEntity> findByAccountIdAndCategory(
            Long accountId,
            String category,
            Pageable pageable
    );

}