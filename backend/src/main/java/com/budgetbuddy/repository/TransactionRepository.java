package com.budgetbuddy.repository;

import com.budgetbuddy.entity.TransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long>, JpaSpecificationExecutor<TransactionEntity> {
    List<TransactionEntity> findByUserIdOrderByDateDesc(Long userId);
    List<TransactionEntity> findByAccountIdOrderByDateDesc(Long accountId);
    Page<TransactionEntity> findByUserId(Long userId, Pageable pageable);
    Page<TransactionEntity> findByUserIdAndCategoryContainingIgnoreCase(Long userId, String category, Pageable pageable);
}