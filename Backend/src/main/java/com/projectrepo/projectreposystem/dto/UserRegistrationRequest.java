package com.projectrepo.projectreposystem.dto;

import jakarta.validation.constraints.*;

import com.projectrepo.projectreposystem.domain.model.UserRole;

public class UserRegistrationRequest {

    @NotBlank(message = "Name required")
    private String name;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email required")
    private String email;

    @NotBlank(message = "Password required")
    @Size(min = 6, message = "Password too short")
    private String password;

    @NotNull(message = "Role required")
    private UserRole role;

    @NotBlank(message = "Department required")
    private String department;

    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
    public UserRole getRole() { return role; }
    public String getDepartment() { return department; }

    public void setName(String name) { this.name = name; }
    public void setEmail(String email) { this.email = email; }
    public void setPassword(String password) { this.password = password; }
    public void setRole(UserRole role) { this.role = role; }
    public void setDepartment(String department) { this.department = department; }
}