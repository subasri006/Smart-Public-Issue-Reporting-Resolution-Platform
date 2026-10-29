package com.civicfix.controller;

import com.civicfix.dto.AssignComplaintRequest;
import com.civicfix.dto.CreateComplaintRequest;
import com.civicfix.dto.RegisterRequest;
import com.civicfix.dto.StaffRegisterRequest;
import com.civicfix.dto.UpdateStatusRequest;
import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Severity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.notNullValue;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ComplaintApiIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String citizenToken;
    private String staffToken;
    private Long staffUserId;

    @BeforeEach
    void setUp() throws Exception {
        long ts = System.currentTimeMillis();

        // 1. Register a dedicated test citizen
        RegisterRequest citizenReq = new RegisterRequest(
                "cit_" + ts, "cit_" + ts + "@example.com", "Password@123", "Test Citizen", "9988776655"
        );
        MvcResult citRes = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(citizenReq)))
                .andExpect(status().isOk())
                .andReturn();
        citizenToken = objectMapper.readTree(citRes.getResponse().getContentAsString())
                .get("data").get("token").asText();

        // 2. Register a dedicated test staff
        StaffRegisterRequest staffReq = new StaffRegisterRequest(
                "stf_" + ts, "stf_" + ts + "@civicfix.org", "Staff@123", "Field Officer", "9988771122", "Public Works"
        );
        MvcResult stfRes = mockMvc.perform(post("/api/auth/register/staff")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(staffReq)))
                .andExpect(status().isOk())
                .andReturn();
        staffToken = objectMapper.readTree(stfRes.getResponse().getContentAsString())
                .get("data").get("token").asText();
        staffUserId = objectMapper.readTree(stfRes.getResponse().getContentAsString())
                .get("data").get("id").asLong();
    }

    @Test
    @DisplayName("Citizen can report a new issue and receives human-readable reference ID")
    void testCitizenCreatesComplaint() throws Exception {
        CreateComplaintRequest request = new CreateComplaintRequest(
                "Large Broken Manhole Cover on Pedestrian Walkway",
                "Dangerous deep pit left open after construction work. Urgent barricading required.",
                1L, Severity.HIGH, 12.9716, 77.5946, "MG Road", "Near Metro Gate 2"
        );

        mockMvc.perform(post("/api/complaints")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.referenceId", notNullValue()))
                .andExpect(jsonPath("$.data.status").value("SUBMITTED"))
                .andExpect(jsonPath("$.data.priorityScore", greaterThan(0.0)));
    }

    @Test
    @DisplayName("Multiple complaint submissions receive unique, distinct reference IDs")
    void testMultipleComplaintsReceiveUniqueReferenceIds() throws Exception {
        CreateComplaintRequest request1 = new CreateComplaintRequest(
                "Broken streetlight near bus stop",
                "Flickering and going dark every few minutes at night",
                3L, Severity.MEDIUM, 12.9141, 77.6387, "Sector 2", "Bus stop"
        );
        CreateComplaintRequest request2 = new CreateComplaintRequest(
                "Pothole causing traffic slowdown on bridge",
                "Deep puddle forming inside pothole during rain creating skid risk",
                1L, Severity.HIGH, 12.9352, 77.6245, "Main Road", "Signal"
        );

        MvcResult res1 = mockMvc.perform(post("/api/complaints")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.referenceId", notNullValue()))
                .andReturn();

        MvcResult res2 = mockMvc.perform(post("/api/complaints")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.referenceId", notNullValue()))
                .andReturn();

        String ref1 = objectMapper.readTree(res1.getResponse().getContentAsString()).get("data").get("referenceId").asText();
        String ref2 = objectMapper.readTree(res2.getResponse().getContentAsString()).get("data").get("referenceId").asText();

        assertNotNull(ref1);
        assertNotNull(ref2);
        assertNotEquals(ref1, ref2, "Each complaint must receive a distinct reference ID");
        assertTrue(ref1.matches("^CF-\\d{4}-\\d{2}-\\d{4,}$"), "Reference ID 1 format valid: " + ref1);
        assertTrue(ref2.matches("^CF-\\d{4}-\\d{2}-\\d{4,}$"), "Reference ID 2 format valid: " + ref2);
    }

    @Test
    @DisplayName("Staff member can assign complaint to staff")
    void testStaffAssignsComplaint() throws Exception {
        // 1. Citizen creates a complaint
        CreateComplaintRequest createReq = new CreateComplaintRequest(
                "Overflowing Garbage Dumpster", "Waste piling up near market",
                2L, Severity.MEDIUM, 12.93, 77.62, "Market Road", "Near gate"
        );
        MvcResult createRes = mockMvc.perform(post("/api/complaints")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn();
        Long complaintId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // 2. Staff assigns the complaint to self
        AssignComplaintRequest assignReq = new AssignComplaintRequest(staffUserId, "Assigned to Sanitation inspector");
        mockMvc.perform(post("/api/complaints/" + complaintId + "/assign")
                        .header("Authorization", "Bearer " + staffToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(assignReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ASSIGNED"));
    }

    @Test
    @DisplayName("Citizen cannot update operational status directly (403 Forbidden)")
    void testCitizenCannotUpdateStatus() throws Exception {
        // 1. Citizen creates a complaint
        CreateComplaintRequest createReq = new CreateComplaintRequest(
                "Water leak", "Main pipe leaking",
                4L, Severity.HIGH, 12.98, 77.60, "Water Works Road", "Corner"
        );
        MvcResult createRes = mockMvc.perform(post("/api/complaints")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(createReq)))
                .andExpect(status().isOk())
                .andReturn();
        Long complaintId = objectMapper.readTree(createRes.getResponse().getContentAsString())
                .get("data").get("id").asLong();

        // 2. Citizen tries to change operational status to RESOLVED
        UpdateStatusRequest request = new UpdateStatusRequest(ComplaintStatus.RESOLVED, "Citizen attempting resolve", "Done");

        mockMvc.perform(patch("/api/complaints/" + complaintId + "/status")
                        .header("Authorization", "Bearer " + citizenToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Public map endpoint is accessible without authentication")
    void testPublicMapAccess() throws Exception {
        mockMvc.perform(get("/api/complaints/public-map"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", notNullValue()));
    }
}
