package com.projectrepo.projectreposystem.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.projectrepo.projectreposystem.domain.model.User;
import com.projectrepo.projectreposystem.domain.model.UserRole;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByActiveTrueOrderByNameAsc();

    List<User> findByActiveTrueAndRoleOrderByNameAsc(UserRole role);
}