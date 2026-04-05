package com.projectrepo.projectreposystem.service;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

import com.projectrepo.projectreposystem.repository.UserRepository;
import com.projectrepo.projectreposystem.repository.ProjectMemberRepository;
import com.projectrepo.projectreposystem.domain.model.User;
import com.projectrepo.projectreposystem.domain.model.UserRole;
import com.projectrepo.projectreposystem.domain.model.AuditActionType;
import com.projectrepo.projectreposystem.domain.model.AuditTargetType;
import com.projectrepo.projectreposystem.dto.UserRegistrationRequest;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ProjectMemberRepository projectMemberRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public UserService(UserRepository userRepository,
                       ProjectMemberRepository projectMemberRepository,
                       PasswordEncoder passwordEncoder,
                       AuditService auditService) {
        this.userRepository = userRepository;
        this.projectMemberRepository = projectMemberRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    public User registerUser(UserRegistrationRequest request) {
        String normalizedEmail = request.getEmail().trim().toLowerCase(Locale.ROOT);

        if (userRepository.findByEmailIgnoreCase(normalizedEmail).isPresent()) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        user.setRole(request.getRole());
        user.setDepartment(request.getDepartment().trim());
        user.setActive(true);

        String hashedPassword = passwordEncoder.encode(request.getPassword());
        user.setPasswordHash(hashedPassword);

        User savedUser = userRepository.save(user);

        auditService.record(
            savedUser,
            AuditActionType.USER_CREATED,
            AuditTargetType.USER,
            savedUser.getId(),
            "User registered with role: " + savedUser.getRole()
        );

        return savedUser;
        }

        public List<User> listUsers() {
        return userRepository.findAll();
        }

        public List<User> searchUsers(UserRole role,
                                      String query) {
            String normalized = (query == null || query.isBlank())
                    ? null
                    : query.trim().toLowerCase(Locale.ROOT);

            List<User> activeUsers = role == null
                    ? userRepository.findByActiveTrueOrderByNameAsc()
                    : userRepository.findByActiveTrueAndRoleOrderByNameAsc(role);

            return activeUsers.stream()
                    .filter(user -> {
                        if (normalized == null) {
                            return true;
                        }

                        String userName = user.getName() == null ? "" : user.getName().toLowerCase(Locale.ROOT);
                        String userEmail = user.getEmail() == null ? "" : user.getEmail().toLowerCase(Locale.ROOT);

                        return userName.contains(normalized) || userEmail.contains(normalized);
                    })
                    .limit(20)
                    .toList();
        }

        public User updateUserRole(Long userId,
                       UserRole role) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setRole(role);
        return userRepository.save(user);
        }

        public User updateUserActive(Long userId,
                     Boolean active) {

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setActive(active);
        User updatedUser = userRepository.save(user);

        if (!Boolean.TRUE.equals(active)) {
            auditService.record(
                updatedUser,
                AuditActionType.USER_DEACTIVATED,
                AuditTargetType.USER,
                updatedUser.getId(),
                "User deactivated"
            );
        }

        return updatedUser;
    }

    public Map<Long, Long> getUserProjectCounts(List<Long> userIds) {
        return userIds.stream()
                .distinct()
                .collect(Collectors.toMap(userId -> userId, projectMemberRepository::countByUserId));
    }
}
