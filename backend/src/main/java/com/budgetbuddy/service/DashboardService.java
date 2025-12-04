package com.budgetbuddy.service;

import com.budgetbuddy.dto.DashboardSummaryDTO;
import com.budgetbuddy.entity.*;
import com.budgetbuddy.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

@Service
public class DashboardService {

    @Autowired private UserRepository userRepository;
    @Autowired private AccountRepository accountRepository;
    @Autowired private TransactionRepository transactionRepository;

    public DashboardSummaryDTO getDashboardSummary(String userEmail) {
        UserEntity user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Total balance – Double → BigDecimal
        BigDecimal totalBalance = accountRepository.findByUserId(user.getId()).stream().map(acc -> BigDecimal.valueOf(acc.getBalance()))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        //  Recent transactions (last 10)
        List<TransactionEntity> recentTxns = transactionRepository.findByUserIdOrderByDateDesc(user.getId()).stream().limit(10).toList();

        List<DashboardSummaryDTO.TransactionSummary> recentSummary = recentTxns.stream()
                .map(t -> {
                    DashboardSummaryDTO.TransactionSummary s = new DashboardSummaryDTO.TransactionSummary();
                    s.setId(t.getId());
                    s.setAccountName(t.getAccount().getName());
                    s.setAmount(BigDecimal.valueOf(t.getAmount())); 
                    s.setType(t.getType().name().toLowerCase());
                    s.setCategory(t.getCategory());
                    s.setDate(t.getDate().toLocalDate().toString());
                    return s;
                }).toList();

        // Monthly income/expense for current year
        LocalDate yearStart = LocalDate.now().withDayOfYear(1);
        List<TransactionEntity> yearTxns = transactionRepository.findByUserIdAndDateAfter(user.getId(), yearStart.atStartOfDay());

        Map<YearMonth, BigDecimal> incomeByMonth = new TreeMap<>();
        Map<YearMonth, BigDecimal> expenseByMonth = new TreeMap<>();

        yearTxns.forEach(t -> {
            YearMonth ym = YearMonth.from(t.getDate());
            BigDecimal amount = BigDecimal.valueOf(t.getAmount());    
            if (t.getType() == TransactionEntity.TransactionType.INCOME) {
                incomeByMonth.merge(ym, amount, BigDecimal::add);
            } else {
                expenseByMonth.merge(ym, amount, BigDecimal::add);
            }
        });

        // Build the 12-month list (most recent first)
        List<DashboardSummaryDTO.MonthlyTotal> monthlyTotals = new ArrayList<>();
        for (int i = 11; i >= 0; i--) {
            YearMonth ym = YearMonth.now().minusMonths(i);
            DashboardSummaryDTO.MonthlyTotal mt = new DashboardSummaryDTO.MonthlyTotal();
            mt.setMonth(ym);
            mt.setIncome(incomeByMonth.getOrDefault(ym, BigDecimal.ZERO));
            mt.setExpense(expenseByMonth.getOrDefault(ym, BigDecimal.ZERO));
            monthlyTotals.add(mt);
        }

        // Category spending – last 6 months
        LocalDate sixMonthsAgo = LocalDate.now().minusMonths(6);
        List<Object[]> categoryTotals = transactionRepository
                .sumAmountByCategoryForUserAndDateAfter(user.getId(), sixMonthsAgo.atStartOfDay());

        List<DashboardSummaryDTO.CategorySpending> categorySpending = categoryTotals.stream()
                .map(row -> {
                    DashboardSummaryDTO.CategorySpending cs = new DashboardSummaryDTO.CategorySpending();
                    cs.setCategory((String) row[0]);
                    cs.setTotalSpent((BigDecimal) row[1]); 
                    return cs;
                }).sorted(Comparator.comparing(DashboardSummaryDTO.CategorySpending::getTotalSpent).reversed()).toList();

        return new DashboardSummaryDTO(totalBalance, recentSummary, monthlyTotals, categorySpending);
    }
}