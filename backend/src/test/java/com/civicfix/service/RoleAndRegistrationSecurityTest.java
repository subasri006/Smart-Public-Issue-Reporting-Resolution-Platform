package com.civicfix.service;

import com.civicfix.config.DataInitializer;
import com.civicfix.dto.*;
import com.civicfix.entity.*;
import com.civicfix.enums.ComplaintStatus;
import com.civicfix.enums.Role;
import com.civicfix.enums.Severity;
import com.civicfix.exception.BadRequestException;
import com.civicfix.exception.ConflictException;
import com.civicfix.exception.ForbiddenException;
import com.civicfix.repository.*;
import com.civicfix.security.JwtTokenProvider;
import com.civicfix.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Proxy;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;

public class RoleAndRegistrationSecurityTest {

    private AuthService authService;
    private UserService userService;
    private ComplaintService complaintService;
    private ReferenceIdGeneratorService generatorService;

    private Map<Long, User> userByIdMap;
    private Map<String, User> userByUsernameMap;
    private Map<String, User> userByEmailMap;
    private AtomicLong userIdCounter;

    private Map<Long, Complaint> complaintByIdMap;
    private AtomicLong complaintIdCounter;

    private Map<Long, ComplaintCategory> categoryByIdMap;
    private Map<String, ComplaintSequence> sequenceStore;

    private UserRepository userRepository;
    private ComplaintRepository complaintRepository;
    private ComplaintCategoryRepository categoryRepository;
    private ComplaintSequenceRepository sequenceRepository;
    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider tokenProvider;
    private AuditService auditService;
    private PriorityScoringService priorityScoringService;

    // Track active user in test context
    private User currentMockUser;

    @BeforeEach
    void setUp() {
        userByIdMap = new ConcurrentHashMap<>();
        userByUsernameMap = new ConcurrentHashMap<>();
        userByEmailMap = new ConcurrentHashMap<>();
        userIdCounter = new AtomicLong(1);

        complaintByIdMap = new ConcurrentHashMap<>();
        complaintIdCounter = new AtomicLong(1);

        categoryByIdMap = new ConcurrentHashMap<>();
        sequenceStore = new ConcurrentHashMap<>();

        // Add standard category
        ComplaintCategory cat = new ComplaintCategory(1L, "Road Damage", "ROAD", "Potholes and broken asphalt", 20, "Construction", true);
        categoryByIdMap.put(1L, cat);

        // Simple mock password encoder
        passwordEncoder = new PasswordEncoder() {
            @Override
            public String encode(CharSequence rawPassword) {
                return "hash_" + rawPassword;
            }

            @Override
            public boolean matches(CharSequence rawPassword, String encodedPassword) {
                return ("hash_" + rawPassword).equals(encodedPassword);
            }
        };

        // In-memory UserRepository proxy
        userRepository = (UserRepository) Proxy.newProxyInstance(
                UserRepository.class.getClassLoader(),
                new Class<?>[]{UserRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("existsByUsername".equals(name)) {
                        return userByUsernameMap.containsKey(args[0]);
                    } else if ("existsByEmail".equals(name)) {
                        return userByEmailMap.containsKey(args[0]);
                    } else if ("findByUsername".equals(name)) {
                        return Optional.ofNullable(userByUsernameMap.get(args[0]));
                    } else if ("findByEmail".equals(name)) {
                        return Optional.ofNullable(userByEmailMap.get(args[0]));
                    } else if ("findById".equals(name)) {
                        return Optional.ofNullable(userByIdMap.get(args[0]));
                    } else if ("countByRole".equals(name)) {
                        Role r = (Role) args[0];
                        return userByIdMap.values().stream().filter(u -> u.getRole() == r).count();
                    } else if ("count".equals(name)) {
                        return (long) userByIdMap.size();
                    } else if ("save".equals(name) || "saveAndFlush".equals(name)) {
                        User u = (User) args[0];
                        if (u.getId() == null) {
                            u.setId(userIdCounter.getAndIncrement());
                            u.setCreatedAt(LocalDateTime.now());
                        }
                        userByIdMap.put(u.getId(), u);
                        userByUsernameMap.put(u.getUsername(), u);
                        userByEmailMap.put(u.getEmail(), u);
                        return u;
                    }
                    return null;
                }
        );

        // In-memory CategoryRepository proxy
        categoryRepository = (ComplaintCategoryRepository) Proxy.newProxyInstance(
                ComplaintCategoryRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintCategoryRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("findById".equals(name)) {
                        return Optional.ofNullable(categoryByIdMap.get(args[0]));
                    } else if ("count".equals(name)) {
                        return (long) categoryByIdMap.size();
                    } else if ("saveAll".equals(name)) {
                        Iterable<?> items = (Iterable<?>) args[0];
                        for (Object o : items) {
                            ComplaintCategory c = (ComplaintCategory) o;
                            if (c.getId() == null) c.setId((long) (categoryByIdMap.size() + 1));
                            categoryByIdMap.put(c.getId(), c);
                        }
                        return items;
                    }
                    return null;
                }
        );

        // In-memory SequenceRepository proxy
        sequenceRepository = (ComplaintSequenceRepository) Proxy.newProxyInstance(
                ComplaintSequenceRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintSequenceRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("findBySequenceKeyForUpdate".equals(name) || "findById".equals(name)) {
                        String key = (String) args[0];
                        return Optional.ofNullable(sequenceStore.get(key));
                    } else if ("saveAndFlush".equals(name) || "save".equals(name)) {
                        ComplaintSequence seq = (ComplaintSequence) args[0];
                        sequenceStore.put(seq.getSequenceKey(), seq);
                        return seq;
                    }
                    return null;
                }
        );

        // In-memory ComplaintRepository proxy
        complaintRepository = (ComplaintRepository) Proxy.newProxyInstance(
                ComplaintRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintRepository.class},
                (proxy, method, args) -> {
                    String name = method.getName();
                    if ("count".equals(name)) {
                        return (long) complaintByIdMap.size();
                    } else if ("findById".equals(name)) {
                        return Optional.ofNullable(complaintByIdMap.get(args[0]));
                    } else if ("existsByReferenceId".equals(name)) {
                        String ref = (String) args[0];
                        return complaintByIdMap.values().stream().anyMatch(c -> ref.equals(c.getReferenceId()));
                    } else if ("findReferenceIdsByPrefix".equals(name)) {
                        String prefix = (String) args[0];
                        List<String> list = new ArrayList<>();
                        for (Complaint c : complaintByIdMap.values()) {
                            if (c.getReferenceId() != null && c.getReferenceId().startsWith(prefix + "-")) {
                                list.add(c.getReferenceId());
                            }
                        }
                        return list;
                    } else if ("save".equals(name) || "saveAndFlush".equals(name)) {
                        Complaint c = (Complaint) args[0];
                        if (c.getId() == null) {
                            c.setId(complaintIdCounter.getAndIncrement());
                            c.setCreatedAt(LocalDateTime.now());
                        }
                        complaintByIdMap.put(c.getId(), c);
                        return c;
                    }
                    return null;
                }
        );

        // Mock AuditService
        auditService = new AuditService(null) {
            @Override
            public void log(String action, String entityName, Long entityId, User performedBy, String details) {}
        };

        // Token provider & auth manager
        tokenProvider = new JwtTokenProvider(
                "CivicFixSuperSecretKeyForJwtTokenGeneration2026SecureStringWith256Bits",
                86400000L
        );

        AuthenticationManager authManager = authentication -> authentication;

        // Concrete AuthService with getCurrentUser overridden for test harness
        authService = new AuthService(userRepository, passwordEncoder, authManager, tokenProvider, auditService) {
            @Override
            public User getCurrentUser() {
                if (currentMockUser != null) {
                    return currentMockUser;
                }
                return super.getCurrentUser();
            }
        };

        priorityScoringService = new PriorityScoringService();
        ReflectionTestUtils.setField(priorityScoringService, "ageWeightPerDay", 2.0);
        ReflectionTestUtils.setField(priorityScoringService, "maxAgeWeight", 30.0);

        generatorService = new ReferenceIdGeneratorService(sequenceRepository, complaintRepository);
        userService = new UserService(userRepository, complaintRepository, passwordEncoder, auditService, authService);

        // Dummy proxy for history & comments
        ComplaintStatusHistoryRepository historyRepo = (ComplaintStatusHistoryRepository) Proxy.newProxyInstance(
                ComplaintStatusHistoryRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintStatusHistoryRepository.class},
                (proxy, method, args) -> {
                    if ("findByComplaintOrderByCreatedAtAsc".equals(method.getName())) {
                        return Collections.emptyList();
                    }
                    return null;
                }
        );
        ComplaintCommentRepository commentRepo = (ComplaintCommentRepository) Proxy.newProxyInstance(
                ComplaintCommentRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintCommentRepository.class},
                (proxy, method, args) -> Collections.emptyList()
        );
        ComplaintAttachmentRepository attachRepo = (ComplaintAttachmentRepository) Proxy.newProxyInstance(
                ComplaintAttachmentRepository.class.getClassLoader(),
                new Class<?>[]{ComplaintAttachmentRepository.class},
                (proxy, method, args) -> null
        );

        complaintService = new ComplaintService(
                complaintRepository, categoryRepository, userRepository,
                historyRepo, null, commentRepo, attachRepo,
                priorityScoringService, null, authService, auditService, generatorService
        );

        // Seed initial admin account with specified email/username and secure password
        User initialAdmin = new User(
                null, "subasri04006@gmail.com", "subasri04006@gmail.com", passwordEncoder.encode("SecureLocalAdminEnvPassword2026!"),
                "Chief City Administrator", "Public Works Admin", "9876543210", Role.ROLE_ADMIN, true
        );
        userRepository.save(initialAdmin);
    }

    @Test
    @DisplayName("1. Citizen registration strictly assigns ROLE_CITIZEN")
    void testCitizenRegistrationAssignsCitizenRole() {
        RegisterRequest request = new RegisterRequest(
                "citizen_test", "citizen_test@example.com", "Password@123", "Jane Citizen", "9876540001"
        );
        AuthResponse response = authService.register(request);

        assertNotNull(response.getToken());
        assertEquals("citizen_test", response.getUsername());
        assertEquals(Role.ROLE_CITIZEN, response.getRole(), "Citizen registration must strictly assign ROLE_CITIZEN");

        User saved = userRepository.findByUsername("citizen_test").orElseThrow();
        assertEquals(Role.ROLE_CITIZEN, saved.getRole());
    }

    @Test
    @DisplayName("2. Staff registration strictly assigns ROLE_STAFF and preserves department")
    void testStaffRegistrationAssignsStaffRole() {
        StaffRegisterRequest request = new StaffRegisterRequest(
                "staff_test", "staff_test@civicfix.org", "Staff@123", "Officer Rao", "9876540002", "Public Works"
        );
        AuthResponse response = authService.registerStaff(request);

        assertNotNull(response.getToken());
        assertEquals("staff_test", response.getUsername());
        assertEquals(Role.ROLE_STAFF, response.getRole(), "Staff registration must strictly assign ROLE_STAFF");
        assertEquals("Officer Rao", response.getFullName());
        assertEquals("Public Works", response.getDepartment());

        User saved = userRepository.findByUsername("staff_test").orElseThrow();
        assertEquals(Role.ROLE_STAFF, saved.getRole());
        assertEquals("Public Works", saved.getDepartment());
    }

    @Test
    @DisplayName("3. Public registration payload cannot create or escalate to ROLE_ADMIN")
    void testPublicRegistrationCannotCreateAdmin() {
        RegisterRequest citizenReq = new RegisterRequest("hacker1", "hacker1@example.com", "Secret@123", "Attacker", "111");
        AuthResponse res1 = authService.register(citizenReq);
        assertEquals(Role.ROLE_CITIZEN, res1.getRole(), "Public register endpoint cannot grant ADMIN");

        StaffRegisterRequest staffReq = new StaffRegisterRequest("hacker2", "hacker2@example.com", "Secret@123", "Attacker 2", "222", "IT");
        AuthResponse res2 = authService.registerStaff(staffReq);
        assertEquals(Role.ROLE_STAFF, res2.getRole(), "Public staff register endpoint cannot grant ADMIN");
    }

    @Test
    @DisplayName("4. Only one admin account can exist in the application")
    void testOnlyOneAdminAccountCanExist() {
        assertEquals(1, userRepository.countByRole(Role.ROLE_ADMIN), "Exactly one admin must exist initially");

        // Attempting to create a second admin via UserService must fail
        User adminUser = userRepository.findByUsername("subasri04006@gmail.com").orElseThrow();
        currentMockUser = adminUser;

        CreateUserRequest createAdminAttempt = new CreateUserRequest();
        createAdminAttempt.setUsername("admin2");
        createAdminAttempt.setEmail("admin2@civicfix.org");
        createAdminAttempt.setPassword("Admin2@123");
        createAdminAttempt.setFullName("Second Admin");
        createAdminAttempt.setRole(Role.ROLE_ADMIN);

        assertThrows(BadRequestException.class, () -> userService.createUser(createAdminAttempt),
                "System must reject creating a second administrator account");

        // Attempting to promote a user to admin must fail
        User citizen = new User(null, "user_to_promote", "promote@test.com", "pass", "User", null, Role.ROLE_CITIZEN, true);
        userRepository.save(citizen);

        UserUpdateRequest promoteAttempt = new UserUpdateRequest();
        promoteAttempt.setRole(Role.ROLE_ADMIN);

        assertThrows(BadRequestException.class, () -> userService.updateUser(citizen.getId(), promoteAttempt),
                "System must reject promoting a user to admin when an admin already exists");
    }

    @Test
    @DisplayName("5. Duplicate email addresses and usernames are rejected with ConflictException (HTTP 409)")
    void testDuplicateEmailAndUsernameRejectedWithConflict() {
        RegisterRequest req1 = new RegisterRequest("user_alpha", "duplicate@test.com", "Pass@123", "Alpha", "111");
        authService.register(req1);

        RegisterRequest req2 = new RegisterRequest("user_beta", "duplicate@test.com", "Pass@123", "Beta", "222");
        assertThrows(ConflictException.class, () -> authService.register(req2),
                "Duplicate email must throw ConflictException (HTTP 409)");

        StaffRegisterRequest reqStaff = new StaffRegisterRequest("user_gamma", "duplicate@test.com", "Pass@123", "Gamma", "333", "Health");
        assertThrows(ConflictException.class, () -> authService.registerStaff(reqStaff),
                "Staff registration with existing email must throw ConflictException (HTTP 409)");

        RegisterRequest reqDupUsername = new RegisterRequest("user_alpha", "different@test.com", "Pass@123", "Alpha 2", "444");
        assertThrows(ConflictException.class, () -> authService.register(reqDupUsername),
                "Duplicate username must throw ConflictException (HTTP 409)");
    }

    @Test
    @DisplayName("6. Two or more complaints receive different unique reference IDs")
    void testTwoComplaintsReceiveDifferentReferenceIds() {
        User citizen = new User(null, "complaint_reporter", "reporter@test.com", "pass", "Reporter", null, Role.ROLE_CITIZEN, true);
        userRepository.save(citizen);
        currentMockUser = citizen;

        CreateComplaintRequest req1 = new CreateComplaintRequest(
                "Pothole on Main St", "Deep pothole near signal", 1L, Severity.HIGH, 12.9, 77.6, "Main St", null
        );
        CreateComplaintRequest req2 = new CreateComplaintRequest(
                "Broken curb on Main St", "Damaged curb stone", 1L, Severity.MEDIUM, 12.9, 77.6, "Main St", null
        );

        ComplaintDetailResponse res1 = complaintService.createComplaint(req1, null);
        ComplaintDetailResponse res2 = complaintService.createComplaint(req2, null);

        assertNotNull(res1.getReferenceId());
        assertNotNull(res2.getReferenceId());
        assertNotEquals(res1.getReferenceId(), res2.getReferenceId(), "Both complaints must receive different reference IDs");
        assertTrue(res1.getReferenceId().startsWith("CF-"), "Reference ID must start with CF-");
    }

    @Test
    @DisplayName("7. Citizens cannot access unauthorized users' complaints")
    void testCitizensCannotAccessUnauthorizedComplaints() {
        User citizenOwner = new User(null, "owner_user", "owner@test.com", "pass", "Owner", null, Role.ROLE_CITIZEN, true);
        userRepository.save(citizenOwner);

        User citizenOther = new User(null, "other_user", "other@test.com", "pass", "Other Citizen", null, Role.ROLE_CITIZEN, true);
        userRepository.save(citizenOther);

        currentMockUser = citizenOwner;
        CreateComplaintRequest req = new CreateComplaintRequest(
                "Private issue", "My street water issue", 1L, Severity.LOW, 12.0, 77.0, "Private Ln", null
        );
        ComplaintDetailResponse created = complaintService.createComplaint(req, null);

        // Switch to other citizen: viewing details should throw ForbiddenException
        currentMockUser = citizenOther;
        assertThrows(ForbiddenException.class, () -> complaintService.getComplaintDetails(created.getId()),
                "A citizen must not be permitted to view private details of another citizen's complaint");

        // Attempting to update another citizen's complaint must also throw ForbiddenException
        UpdateComplaintRequest updateReq = new UpdateComplaintRequest();
        updateReq.setTitle("Malicious Title Edit");
        assertThrows(ForbiddenException.class, () -> complaintService.updateComplaint(created.getId(), updateReq),
                "A citizen must not be permitted to update another citizen's complaint");
    }

    @Test
    @DisplayName("8. Staff and admin access restrictions work correctly")
    void testStaffAndAdminAccessRestrictions() {
        User citizen = new User(null, "cit_reporter", "cit@test.com", "pass", "Citizen", null, Role.ROLE_CITIZEN, true);
        userRepository.save(citizen);

        User staff = new User(null, "staff_officer", "staff@test.com", "pass", "Staff Officer", null, Role.ROLE_STAFF, true);
        userRepository.save(staff);

        User admin = userRepository.findByUsername("subasri04006@gmail.com").orElseThrow();

        // Citizen creates complaint
        currentMockUser = citizen;
        CreateComplaintRequest req = new CreateComplaintRequest("Light broken", "Pitch dark", 1L, Severity.MEDIUM, 12.0, 77.0, "Dark Ln", null);
        ComplaintDetailResponse created = complaintService.createComplaint(req, null);

        // Citizen cannot assign complaints
        AssignComplaintRequest assignReq = new AssignComplaintRequest(staff.getId(), "Triage note");
        assertThrows(ForbiddenException.class, () -> complaintService.assignComplaint(created.getId(), assignReq),
                "Citizen cannot assign complaints");

        // Staff CAN view the complaint details and assign it
        currentMockUser = staff;
        assertDoesNotThrow(() -> complaintService.getComplaintDetails(created.getId()),
                "Staff must have access to inspect citizen complaints");

        // Admin can also view and manage
        currentMockUser = admin;
        assertDoesNotThrow(() -> complaintService.getComplaintDetails(created.getId()),
                "Admin must have full access to inspect complaints");
    }

    @Test
    @DisplayName("9. Demo complaints and sample users are not recreated on application startup")
    void testDemoComplaintsNotRecreatedOnStartup() {
        // Clear all complaints and users
        complaintByIdMap.clear();
        userByIdMap.clear();
        userByUsernameMap.clear();
        userByEmailMap.clear();

        // Run DataInitializer with configured admin
        DataInitializer initializer = new DataInitializer(userRepository, categoryRepository, passwordEncoder);
        ReflectionTestUtils.setField(initializer, "adminEmail", "subasri04006@gmail.com");
        ReflectionTestUtils.setField(initializer, "adminPassword", "SecureLocalAdminEnvPassword2026!");
        ReflectionTestUtils.setField(initializer, "adminUsername", "subasri04006@gmail.com");
        ReflectionTestUtils.setField(initializer, "adminFullName", "Chief Administrator");

        initializer.run();

        // Verify: complaints table remains 0 (no sample complaints inserted)
        assertEquals(0, complaintRepository.count(), "Application startup must not recreate demo complaints");

        // Verify: only 1 admin account exists with configured email/username, no sample staff or sample citizens seeded
        assertEquals(1, userRepository.countByRole(Role.ROLE_ADMIN), "Exactly 1 admin should exist");
        User createdAdmin = userRepository.findByEmail("subasri04006@gmail.com").orElseThrow();
        assertEquals("subasri04006@gmail.com", createdAdmin.getUsername());
        assertEquals("subasri04006@gmail.com", createdAdmin.getEmail());
        assertEquals(0, userRepository.countByRole(Role.ROLE_STAFF), "No sample staff should be auto-seeded");
        assertEquals(0, userRepository.countByRole(Role.ROLE_CITIZEN), "No sample citizens should be auto-seeded");
        assertTrue(categoryRepository.count() > 0, "System complaint categories must be retained");
    }

    @Test
    @DisplayName("10. Existing login and complaint APIs remain compatible with frontend contracts")
    void testExistingLoginAndComplaintApiCompatibility() {
        // Verify AuthResponse DTO fields
        User admin = userRepository.findByUsername("subasri04006@gmail.com").orElseThrow();
        UserPrincipal principal = UserPrincipal.create(admin);
        String token = tokenProvider.generateToken(principal);

        AuthResponse authRes = new AuthResponse(token, admin.getId(), admin.getUsername(), admin.getEmail(), admin.getFullName(), admin.getDepartment(), admin.getRole());
        assertEquals("subasri04006@gmail.com", authRes.getUsername());
        assertEquals("subasri04006@gmail.com", authRes.getEmail());
        assertEquals(Role.ROLE_ADMIN, authRes.getRole());
        assertNotNull(authRes.getToken());

        // Verify ComplaintDetailResponse structure for frontend consumption
        currentMockUser = admin;
        CreateComplaintRequest createReq = new CreateComplaintRequest("Pothole", "Road damage", 1L, Severity.MEDIUM, 12.0, 77.0, "MG Rd", "Near Metro");
        ComplaintDetailResponse compRes = complaintService.createComplaint(createReq, null);

        assertNotNull(compRes.getId());
        assertNotNull(compRes.getReferenceId());
        assertEquals("Pothole", compRes.getTitle());
        assertEquals("Road Damage", compRes.getCategoryName());
        assertEquals(ComplaintStatus.SUBMITTED, compRes.getStatus());
        assertNotNull(compRes.getPriorityScore());
        assertNotNull(compRes.getPriorityLevel());
    }

    @Test
    @DisplayName("11. Image upload validation accepts JPG, PNG, WEBP and rejects invalid files")
    void testImageUploadValidation() {
        FileStorageService storageService = new FileStorageService();

        // Valid JPEG magic bytes (FF D8 FF ...)
        byte[] jpegBytes = new byte[]{(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0, 0, 0, 0, 0, 0, 0};
        assertTrue(storageService.isValidImageMagicBytes(jpegBytes, 12), "Valid JPEG magic bytes should be accepted");

        // Valid PNG magic bytes (89 50 4E 47 ...)
        byte[] pngBytes = new byte[]{(byte) 0x89, (byte) 0x50, (byte) 0x4E, (byte) 0x47, 0, 0, 0, 0, 0, 0, 0, 0};
        assertTrue(storageService.isValidImageMagicBytes(pngBytes, 12), "Valid PNG magic bytes should be accepted");

        // Valid WEBP magic bytes (RIFF....WEBP)
        byte[] webpBytes = new byte[]{'R', 'I', 'F', 'F', 0, 0, 0, 0, 'W', 'E', 'B', 'P'};
        assertTrue(storageService.isValidImageMagicBytes(webpBytes, 12), "Valid WEBP magic bytes should be accepted");

        // Invalid file (e.g. executable / script / plain text)
        byte[] scriptBytes = new byte[]{'<', '!', 'D', 'O', 'C', 'T', 'Y', 'P', 'E', ' ', 'h', 't'};
        assertFalse(storageService.isValidImageMagicBytes(scriptBytes, 12), "HTML/Script content should be rejected");

        byte[] exeBytes = new byte[]{'M', 'Z', (byte) 0x90, 0x00, 0x03, 0x00, 0x00, 0x00, 0x04, 0x00, 0x00, 0x00};
        assertFalse(storageService.isValidImageMagicBytes(exeBytes, 12), "Binary EXE headers should be rejected");
    }
}
