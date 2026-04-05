package com.projectrepo.projectreposystem.controller;

import com.projectrepo.projectreposystem.dto.AdminMetricsResponse;
import com.projectrepo.projectreposystem.service.AdminService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/metrics")
    public AdminMetricsResponse getMetrics() {
        return adminService.getMetrics();
    }
}
