package com.budgetbuddy.repository;

import com.budgetbuddy.entity.TransactionEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {

    // For GET /api/transactions (filtering, sorting, pagination)
    Page<TransactionEntity> findByUserId(Long userId, Pageable pageable);

    Page<TransactionEntity> findByUserIdAndCategoryContainingIgnoreCase(
            Long userId, String category, Pageable pageable);

    // For dashboard: recent transactions
    List<TransactionEntity> findByUserIdOrderByDateDesc(Long userId);

    // For dashboard: monthly totals in current year
    @Query("SELECT t FROM TransactionEntity t WHERE t.user.id = :userId AND t.date >= :dateAfter")
    List<TransactionEntity> findByUserIdAndDateAfter(
            @Param("userId") Long userId,
            @Param("dateAfter") LocalDateTime dateAfter);

    // For dashboard: spending by category in last 6 months
    @Query("""
        SELECT t.category, SUM(t.amount)
        FROM TransactionEntity t
        WHERE t.user.id = :userId
          AND t.type = 'EXPENSE'
          AND t.date >= :dateAfter
        GROUP BY t.category
        ORDER BY SUM(t.amount) DESC
        """)
    List<Object[]> sumAmountByCategoryForUserAndDateAfter(
            @Param("userId") Long userId,
            @Param("dateAfter") LocalDateTime dateAfter);
}