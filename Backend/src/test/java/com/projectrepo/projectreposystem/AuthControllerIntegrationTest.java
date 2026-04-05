package com.projectrepo.projectreposystem;
import com.projectrepo.projectreposystem.domain.model.User;
import com.projectrepo.projectreposystem.domain.model.UserRole;
import com.projectrepo.projectreposystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.web.WebAppConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;

@SpringBootTest
@WebAppConfiguration
class AuthControllerIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private WebApplicationContext webApplicationContext;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext)
                .apply(springSecurity())
                .build();
        userRepository.deleteAll();
    }

    @Test
    void loginReturnsTokenAndUserForActiveAccount() throws Exception {
        User user = new User();
        user.setName("Test User");
        user.setEmail("student@example.com");
        user.setPasswordHash(passwordEncoder.encode("secret123"));
        user.setRole(UserRole.CONTRIBUTOR);
        user.setDepartment("CSE");
        user.setActive(true);
        userRepository.save(user);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"Student@Example.com","password":"secret123"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("student@example.com"))
                .andExpect(jsonPath("$.user.role").value("CONTRIBUTOR"))
                .andExpect(jsonPath("$.user.passwordHash").doesNotExist());
    }

    @Test
    void loginRejectsInactiveAccount() throws Exception {
        User user = new User();
        user.setName("Disabled User");
        user.setEmail("disabled@example.com");
        user.setPasswordHash(passwordEncoder.encode("secret123"));
        user.setRole(UserRole.CONTRIBUTOR);
        user.setDepartment("CSE");
        user.setActive(false);
        userRepository.save(user);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"disabled@example.com","password":"secret123"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Account is deactivated. Contact an administrator."));
    }

    @Test
    void publicRegistrationCannotCreateAdmin() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Unauthorized Admin","email":"admin@example.com","password":"secret123","role":"ADMIN","department":"CSE"}
                                """))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Only administrators can create admin accounts"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void adminCanCreateAdminAccount() throws Exception {
        mockMvc.perform(post("/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Platform Admin","email":"platform-admin@example.com","password":"secret123","role":"ADMIN","department":"CSE"}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("platform-admin@example.com"))
                .andExpect(jsonPath("$.role").value("ADMIN"))
                .andExpect(jsonPath("$.passwordHash").doesNotExist());
    }
}
