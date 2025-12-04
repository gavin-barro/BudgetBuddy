package com.budgetbuddy.dto;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

public class DashboardSummaryDTO {

    private BigDecimal totalBalance;
    private List<TransactionSummary> recentTransactions;
    private List<MonthlyTotal> monthlyIncomeExpense;
    private List<CategorySpending> categorySpendingLast6Months;

    // Constructors
    public DashboardSummaryDTO() {}

    public DashboardSummaryDTO(BigDecimal totalBalance,
                               List<TransactionSummary> recentTransactions,
                               List<MonthlyTotal> monthlyIncomeExpense,
                               List<CategorySpending> categorySpendingLast6Months) {
        this.totalBalance = totalBalance;
        this.recentTransactions = recentTransactions;
        this.monthlyIncomeExpense = monthlyIncomeExpense;
        this.categorySpendingLast6Months = categorySpendingLast6Months;
    }

    // Inner classes
    public static class TransactionSummary {
        private Long id;
        private String accountName;
        private BigDecimal amount;
        private String type; // "income" or "expense"
        private String category;
        private String date; // "2025-04-01"

        // getters and setters
        public Long getId() { 
            return this.id; 
        }

        public void setId(Long id) { 
            this.id = id; 
        }

        public String getAccountName() { 
            return this.accountName; 
        }

        public void setAccountName(String accountName) { 
            this.accountName = accountName; 
        }

        public BigDecimal getAmount() { 
            return this.amount; 
        }

        public void setAmount(BigDecimal amount) { 
            this.amount = amount; 
        }

        public String getType() { 
            return this.type; 
        }

        public void setType(String type) { 
            this.type = type; 
        }

        public String getCategory() { 
            return this.category; 
        }

        public void setCategory(String category) { 
            this.category = category; 
        }

        public String getDate() { 
            return this.date; 
        }

        public void setDate(String date) { 
            this.date = date; 
        }
    }

    public static class MonthlyTotal {
        private YearMonth month; // e.g., 2025-04
        private BigDecimal income;
        private BigDecimal expense;

        // getters and setters
        public YearMonth getMonth() { 
            return this.month; 
        }

        public void setMonth(YearMonth month) { 
            this.month = month; 
        }

        public BigDecimal getIncome() { 
            return this.income; 
        }

        public void setIncome(BigDecimal income) { 
            this.income = income; 
        }

        public BigDecimal getExpense() { 
            return this.expense; 
        }

        public void setExpense(BigDecimal expense) { 
            this.expense = expense; 
        }
    }

    public static class CategorySpending {
        private String category;
        private BigDecimal totalSpent;

        // getters and setters
        public String getCategory() { 
            return this.category; 
        }

        public void setCategory(String category) { 
            this.category = category; 
        }

        public BigDecimal getTotalSpent() { 
            return this.totalSpent; 
        }

        public void setTotalSpent(BigDecimal totalSpent) { 
            this.totalSpent = totalSpent; 
        }
    }

    // Getters and setters for main class
    public BigDecimal getTotalBalance() { 
        return this.totalBalance; 
    }

    public void setTotalBalance(BigDecimal totalBalance) { 
        this.totalBalance = totalBalance; 
    }

    public List<TransactionSummary> getRecentTransactions() { 
        return this.recentTransactions; 
    }

    public void setRecentTransactions(List<TransactionSummary> recentTransactions) { 
        this.recentTransactions = recentTransactions; 
    }

    public List<MonthlyTotal> getMonthlyIncomeExpense() { 
        return this.monthlyIncomeExpense; 
    }

    public void setMonthlyIncomeExpense(List<MonthlyTotal> monthlyIncomeExpense) { 
        this.monthlyIncomeExpense = monthlyIncomeExpense; 
    }

    public List<CategorySpending> getCategorySpendingLast6Months() { 
        return this.categorySpendingLast6Months; 
    }

    public void setCategorySpendingLast6Months(List<CategorySpending> categorySpendingLast6Months) { 
        this.categorySpendingLast6Months = categorySpendingLast6Months; 
    }
}