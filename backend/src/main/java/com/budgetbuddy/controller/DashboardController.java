package com.budgetbuddy.controller;

import com.budgetbuddy.dto.DashboardSummaryDTO;
import com.budgetbuddy.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.security.Principal;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(Principal principal) {
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(principal.getName());
        return new ResponseEntity<>(summary, HttpStatus.OK);
    }
}