package com.budgetbuddy.repository;

import com.budgetbuddy.entity.TransactionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByUserIdOrderByDateDesc(Long userId);
    List<TransactionEntity> findByAccountIdOrderByDateDesc(Long accountId);
}