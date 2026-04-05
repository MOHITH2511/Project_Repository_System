package com.projectrepo.projectreposystem.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import java.util.Locale;

import com.projectrepo.projectreposystem.service.UserService;
import com.projectrepo.projectreposystem.repository.UserRepository;
import com.projectrepo.projectreposystem.security.JwtUtil;
import com.projectrepo.projectreposystem.security.CustomUserDetails;
import com.projectrepo.projectreposystem.domain.model.User;
import com.projectrepo.projectreposystem.domain.model.UserRole;
import com.projectrepo.projectreposystem.dto.AuthResponse;
import com.projectrepo.projectreposystem.dto.LoginRequest;
import com.projectrepo.projectreposystem.dto.UserRegistrationRequest;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final AuthenticationManager authenticationManager;

    public AuthController(UserRepository userRepository,
                          JwtUtil jwtUtil,
                          UserService userService,
                          AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.authenticationManager = authenticationManager;
    }

    @PostMapping("/register")
    public User register(@Valid @RequestBody UserRegistrationRequest request,
                         Authentication authentication) {
        if (request.getRole() == UserRole.ADMIN && !isAdmin(authentication)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only administrators can create admin accounts");
        }

        return userService.registerUser(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedEmail, request.getPassword())
            );

            CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();
            User user = principal.getUser();

            return new AuthResponse(jwtUtil.generateToken(user.getEmail()), user);
        } catch (DisabledException ex) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Account is deactivated. Contact an administrator.");
        } catch (BadCredentialsException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
    }

    @GetMapping("/me")
    public User me(Authentication authentication) {

        String email = authentication.getName();

        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(authority -> "ROLE_ADMIN".equals(authority.getAuthority()));
    }
}
