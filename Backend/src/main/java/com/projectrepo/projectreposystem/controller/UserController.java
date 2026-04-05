package com.projectrepo.projectreposystem.controller;

import com.projectrepo.projectreposystem.domain.model.User;
import com.projectrepo.projectreposystem.domain.model.UserRole;
import com.projectrepo.projectreposystem.dto.UserActiveUpdateRequest;
import com.projectrepo.projectreposystem.dto.UserRoleUpdateRequest;
import com.projectrepo.projectreposystem.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping
    public List<User> listUsers() {
        return userService.listUsers();
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/search")
    public List<User> searchUsers(@RequestParam(required = false) UserRole role,
                                  @RequestParam(required = false) String query) {
        return userService.searchUsers(role, query);
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/role")
    public User updateUserRole(@PathVariable Long userId,
                               @Valid @RequestBody UserRoleUpdateRequest request) {
        return userService.updateUserRole(userId, request.getRole());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PatchMapping("/{userId}/active")
    public User updateUserActive(@PathVariable Long userId,
                                 @Valid @RequestBody UserActiveUpdateRequest request) {
        return userService.updateUserActive(userId, request.getActive());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/project-counts")
    public Map<Long, Long> getUserProjectCounts(@RequestParam List<Long> userIds) {
        return userService.getUserProjectCounts(userIds);
    }
}
