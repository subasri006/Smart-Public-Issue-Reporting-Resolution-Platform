package com.civicfix.config;

import com.civicfix.entity.ComplaintCategory;
import com.civicfix.entity.User;
import com.civicfix.enums.Role;
import com.civicfix.repository.ComplaintCategoryRepository;
import com.civicfix.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Initializes essential system data on application startup.
 * 
 * In accordance with production readiness:
 * - Automatically populates core municipal complaint categories if empty.
 * - Creates exactly ONE initial system administrator if no admin account exists.
 * - Admin credentials are configurable via ADMIN_EMAIL and ADMIN_PASSWORD environment variables.
 * - Never seeds demo complaints, demo staff, or demo citizens. The application starts fresh.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ComplaintCategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email:subasri04006@gmail.com}")
    private String adminEmail;

    @Value("${app.admin.password:}")
    private String adminPassword;

    @Value("${app.admin.username:subasri04006@gmail.com}")
    private String adminUsername;

    @Value("${app.admin.full-name:Chief Administrator}")
    private String adminFullName;

    public DataInitializer(UserRepository userRepository,
                           ComplaintCategoryRepository categoryRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() == 0) {
            seedCategories();
        }
        if (userRepository.countByRole(Role.ROLE_ADMIN) == 0) {
            seedInitialAdmin();
        } else {
            logger.info("Administrator account already exists. Skipping admin initialization.");
        }
    }

    private void seedCategories() {
        logger.info("Seeding standard municipal complaint categories...");
        List<ComplaintCategory> categories = List.of(
                new ComplaintCategory(null, "Road Damage", "ROAD", "Potholes, broken asphalt, dangerous cracks and damaged pavements", 20, "Construction", true),
                new ComplaintCategory(null, "Garbage & Sanitation", "GARBAGE", "Uncollected garbage, overflowing dumpsters and litter hotspots", 15, "Trash2", true),
                new ComplaintCategory(null, "Streetlight Outage", "LIGHT", "Dark intersections, flickering lamps, and non-functional street fixtures", 10, "Lightbulb", true),
                new ComplaintCategory(null, "Water Supply", "WATER", "Pipeline bursts, low pressure, dirty water, and distribution leaks", 25, "Droplets", true),
                new ComplaintCategory(null, "Drainage & Sewage", "DRAINAGE", "Blocked storm drains, sewage overflows, and standing contaminated water", 25, "Waves", true),
                new ComplaintCategory(null, "Public Safety & Hazards", "SAFETY", "Exposed electrical cables, open manholes, falling tree limbs, and building hazards", 30, "AlertTriangle", true),
                new ComplaintCategory(null, "Other Civic Issues", "OTHER", "Other community infrastructure and municipal maintenance concerns", 5, "HelpCircle", true)
        );
        categoryRepository.saveAll(categories);
        logger.info("Successfully seeded {} complaint categories.", categories.size());
    }

    private void seedInitialAdmin() {
        if (adminPassword == null || adminPassword.trim().isEmpty()) {
            logger.warn("CIVICFIX_ADMIN_PASSWORD environment variable is not configured. Initial admin account creation deferred until CIVICFIX_ADMIN_PASSWORD is set.");
            return;
        }

        logger.info("Initializing primary system administrator account: {}", adminEmail);

        // Defensive check: ensure email and username are not taken
        if (userRepository.existsByUsername(adminUsername) || userRepository.existsByEmail(adminEmail)) {
            logger.warn("Initial admin username or email already exists in users table. Skipping.");
            return;
        }

        User admin = new User(
                null,
                adminUsername,
                adminEmail,
                passwordEncoder.encode(adminPassword.trim()),
                adminFullName,
                "9876543210",
                Role.ROLE_ADMIN,
                true
        );

        userRepository.save(admin);
        logger.info("Initial system administrator account created successfully: [email: {}]", adminEmail);
    }
}
