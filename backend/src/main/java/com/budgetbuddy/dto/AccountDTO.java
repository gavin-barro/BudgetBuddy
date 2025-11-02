package com.budgetbuddy.dto;

public class AccountDTO {
    private String name;
    private String type; // 'checking', 'savings', 'credit', 'other'
    private Double balance; // Optional, defaults to 0.0
    

    // Getters and setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getBalance() {
        return balance;
    }

    public void setBalance(Double balance) {
        this.balance = balance;
    }
}