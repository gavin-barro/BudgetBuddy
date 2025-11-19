package com.budgetbuddy.dto;

public class TransactionDTO {
    private Long id;                 
    private Long accountId;
    private Double amount;
    private String type;
    private String category;
    private String date;
    private String description;
    private String createdAt;      

    // Getters and setters
    public Long getId() { 
        return this.id; 
    }
    public void setId(Long id) { 
        this.id = id; 
    }

    public Long getAccountId() { 
        return this.accountId; 
    }

    public void setAccountId(Long accountId) { 
        this.accountId = accountId; 
    }

    public Double getAmount() { 
        return this.amount; 
    }

    public void setAmount(Double amount) { 
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

    public String getDescription() {
        return this.description; 
    }

    public void setDescription(String description) { 
        this.description = description;
    }

    public String getCreatedAt() { 
        return this.createdAt; 
    }

    public void setCreatedAt(String createdAt) { 
        this.createdAt = createdAt; 
    }
}