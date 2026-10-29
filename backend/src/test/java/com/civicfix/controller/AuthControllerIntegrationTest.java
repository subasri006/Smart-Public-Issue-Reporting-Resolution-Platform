package com.civicfix.controller;

import com.civicfix.dto.LoginRequest;
import com.civicfix.dto.RegisterRequest;
import com.civicfix.dto.StaffRegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @DisplayName("Should login successfully with initial admin credentials and return JWT token")
    void testSuccessfulLogin() throws Exception {
        LoginRequest request = new LoginRequest("admin", "Admin@123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Should reject invalid login credentials with 401 Unauthorized")
    void testInvalidLoginCredentials() throws Exception {
        LoginRequest request = new LoginRequest("admin", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Citizen registration assigns CITIZEN role strictly")
    void testCitizenRegistration() throws Exception {
        long timestamp = System.currentTimeMillis();
        RegisterRequest request = new RegisterRequest(
                "citizen_" + timestamp, "citizen_" + timestamp + "@test.com", "Password@123", "Test Citizen", "9988776655"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.role").value("ROLE_CITIZEN"));
    }

    @Test
    @DisplayName("Staff registration assigns STAFF role strictly")
    void testStaffRegistration() throws Exception {
        long timestamp = System.currentTimeMillis();
        StaffRegisterRequest request = new StaffRegisterRequest(
                "staff_" + timestamp, "staff_" + timestamp + "@civicfix.org", "Staff@123", "Officer Sharma", "9988771122", "Public Works"
        );

        mockMvc.perform(post("/api/auth/register/staff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.role").value("ROLE_STAFF"));
    }

    @Test
    @DisplayName("Duplicate email registration attempts are rejected with 400 Bad Request")
    void testDuplicateEmailRejected() throws Exception {
        // Attempt to register with the seeded admin email
        RegisterRequest duplicateEmailRequest = new RegisterRequest(
                "unique_user_" + System.currentTimeMillis(), "admin@civicfix.org", "Password@123", "Impostor", "9988770000"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(duplicateEmailRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Accessing /api/auth/me with valid Bearer token returns profile")
    void testGetProfileWithJwt() throws Exception {
        LoginRequest login = new LoginRequest("admin", "Admin@123");
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(login)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseBody).get("data").get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("admin"))
                .andExpect(jsonPath("$.data.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Accessing protected endpoint without JWT returns 401 Unauthorized")
    void testProtectedEndpointWithoutJwt() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }
}
