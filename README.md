# CivicFix — Smart Public Issue Reporting & Resolution Platform

[![Java 21](https://img.shields.io/badge/Java-21%20LTS-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://adoptium.net/)
[![Spring Boot 3.2](https://img.shields.io/badge/Spring_Boot-3.2.0-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React 18](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL 8](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)

---

## 1. Project Overview

**CivicFix** is an enterprise-grade, internship-ready full-stack web application designed to modernize municipal public grievance reporting and resolution. Moving beyond traditional static portals, CivicFix provides a real-time digital command center that connects citizens, operational staff, and municipal executives with full accountability, transparent priority scoring, geospatial clustering, and explainable duplicate detection.

### Key Highlights
- **Role-Based Access Control (RBAC)**: Enforced both on the frontend (React Route Guards) and the backend (Spring Security 6 with `@PreAuthorize`) across three distinct roles: **Citizen**, **Authority / Staff**, and **Administrator**.
- **Transparent Priority Scoring**: Deterministic rule-based formula combining severity weight, complaint age (capped), and category weight. Transparent breakdown displayed to authorized personnel.
- **Explainable Duplicate Detection**: Hybrid token-based Jaccard text similarity combined with geospatial Haversine great-circle distance. Employs a non-blocking warning modal with a *"Submit Anyway"* bypass so citizen voices are never silently discarded.
- **Interactive OpenStreetMap Visualization**: Interactive Leaflet engine with color-coded markers (by severity/status), click-to-pin report location, reverse geocoding, and popup detail cards. Zero paid mapping APIs required.
- **Full Complaint Lifecycle Management**: Strict backend-validated finite state machine: `SUBMITTED` $\to$ `ASSIGNED` $\to$ `IN_PROGRESS` $\to$ `RESOLVED` $\rightleftharpoons$ `REOPENED`.
- **Live Database-Backed Analytics**: Real-time Recharts visualizations (30-day trends, category volume, status breakdown, area distribution) and streaming CSV export.
- **Zero-Setup Development Mode**: Configured with a default `dev` profile using H2 in MySQL compatibility mode with pre-seeded data, while offering a full production-ready `mysql` profile and relational DDL scripts.

---

## 2. System Architecture

CivicFix follows a clean, decoupled multi-tier architecture:

```
CivicFix/
├── backend/                             # Spring Boot 3.2 (Java 21) REST Backend
│   ├── src/main/java/com/civicfix/
│   │   ├── config/                      # DataInitializer, WebMvcConfig
│   │   ├── controller/                  # REST API Controllers (Auth, Complaint, Analytics, Users, Categories)
│   │   ├── dto/                         # Typed Request & Response Data Transfer Objects
│   │   ├── entity/                      # JPA Entities (User, Complaint, History, Assignments, Comments, etc.)
│   │   ├── enums/                       # Domain Enums (Role, Severity, ComplaintStatus)
│   │   ├── exception/                   # Global Exception Handler & Standard API Envelopes
│   │   ├── repository/                  # Spring Data JPA Repositories with JPQL
│   │   ├── security/                    # JWT Provider, Auth Filter, Security Configuration
│   │   └── service/                     # Business Logic (Priority, Duplicate, File Storage, Lifecycle)
│   ├── src/main/resources/              # application.yml (dev/mysql profiles)
│   └── pom.xml                          # Maven configuration (Spring Boot 3.2.0, JJWT 0.12.3, Java 21)
├── frontend/                            # React 18 + Vite SPA Frontend
│   ├── src/
│   │   ├── api/                         # Axios client with JWT interceptor
│   │   ├── components/                  # Common badges, layout, modals, timeline, Leaflet maps
│   │   ├── context/                     # AuthContext (state, tokens, user roles)
│   │   ├── pages/                       # 16 complete views (Citizen, Staff, Admin, Analytics, Maps)
│   │   ├── App.jsx                      # App route definitions with Route Guards
│   │   └── main.jsx                     # Application entrypoint
│   ├── package.json                     # Frontend dependencies (React Router, Leaflet, Recharts)
│   └── vite.config.js                   # Vite configuration with API proxy and production build setup
├── database/                            # Database DDL & Seed Scripts
│   ├── schema.sql                       # Complete MySQL 8 relational schema with indexes & constraints
│   └── seed-data.sql                    # Realistic seed dataset with BCrypt hashed passwords
├── docs/                                # Technical Documentation & Specifications
│   ├── ARCHITECTURE.md                  # Comprehensive layered architecture & data flows
│   ├── WORKFLOW.md                      # Complaint state machine & transition rules
│   ├── ER_DIAGRAM.md                    # Mermaid ER diagram & database table specifications
│   ├── API_DOCUMENTATION.md             # Complete RESTful API documentation
│   ├── PRIORITY_SCORING_FORMULA.md      # Detailed mathematical breakdown of priority formula
│   ├── DUPLICATE_DETECTION_ALGORITHM.md # Explainable Jaccard + Haversine algorithm breakdown
│   └── SCREENSHOTS_CHECKLIST.md         # 16 views verification & internship evaluation checklist
├── uploads/complaints/                  # Configurable local directory for issue photo uploads
├── .env.example                         # Environment variables template
├── .gitignore                           # Git ignore configuration
└── README.md                            # Main project documentation
```

---

## 3. Pre-Seeded Default Accounts

For immediate evaluation, the platform is pre-loaded with sample accounts covering all three roles:

| Role | Username | Password | Full Name | Primary Responsibilities |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator** | `admin` | `Admin@123` | Platform Administrator | System governance, category weighting, user management, audit logs |
| **Authority / Staff** | `staff1` | `Staff@123` | Officer David Miller | Public Works triage, assignment, status update, evidence upload |
| **Authority / Staff** | `staff2` | `Staff@123` | Officer Sarah Jenkins | Water & Sanitation inspector, resolution and field notes |
| **Citizen** | `citizen1` | `Citizen@123` | John Citizen | Public issue reporting, personal complaint tracking, reopening |
| **Citizen** | `citizen2` | `Citizen@123` | Emily Carter | Public issue reporting, photo uploads, discussion comments |

*Note: The login page (`/login`) includes 1-click quick-fill credential chips for immediate testing.*

---

## 4. Quick Start Guide (Windows PowerShell)

### Prerequisites
- **Java JDK 21+** (e.g. Eclipse Adoptium Temurin or Oracle JDK)
- **Node.js 18+** and **npm**
- *(Optional for Production)* **MySQL 8.0+**

---

### Step 1: Run the Backend (Zero-Setup Mode)

The backend runs out-of-the-box using the embedded `dev` profile (H2 in MySQL mode). It automatically runs database schema setup, initializes standard municipal categories, and creates exactly **one initial Administrator account**. No sample complaints, demo staff, or demo citizens are seeded; the application starts completely fresh for live reporting.

**Configuring Initial Admin Credentials (Optional):**
By default, the initial admin credentials are:
- Email: `admin@civicfix.org`
- Password: `Admin@123`
- Username: `admin`

You can override these credentials securely prior to startup using environment variables:
```powershell
$env:ADMIN_EMAIL="custom.admin@civicfix.org"
$env:ADMIN_PASSWORD="SecureAdminPassword2026!"
$env:ADMIN_USERNAME="admin"
```

Open a PowerShell terminal:

```powershell
# Navigate to backend directory
cd "backend"

# Run with Maven Wrapper (local Java 21)
.\mvnw.cmd spring-boot:run
```

*Alternative direct execution if running through compiled bytecode:*
```powershell
java '@cp.txt' com.civicfix.CivicFixApplication
```

The backend starts at `http://localhost:8080`.
- Health check: `http://localhost:8080/api/categories` or `http://localhost:8080/h2-console`
- H2 JDBC URL: `jdbc:h2:mem:civicfix_db;MODE=MySQL;DB_CLOSE_DELAY=-1;DATABASE_TO_UPPER=false` (Username: `sa`, Password: *(leave blank)*)

---

### Step 2: Run the Frontend

Open a second PowerShell terminal:

```powershell
# Navigate to frontend directory
cd "frontend"

# Start the Vite development server
npm run dev
```

The frontend will start instantly at:
👉 **`http://localhost:5173`**

To verify a production build of the frontend:
```powershell
npm run build
npm run preview
```

---

### Step 3 (Optional): Switch to MySQL 8 Production Database

If you wish to run against a standalone MySQL 8 server:

1. Create the database in MySQL:
   ```sql
   CREATE DATABASE civicfix_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Execute the schema and essential seed scripts:
   ```powershell
   mysql -u root -p civicfix_db < "database/schema.sql"
   mysql -u root -p civicfix_db < "database/seed-data.sql"
   ```
3. Set environment variables in your terminal:
   ```powershell
   $env:SPRING_PROFILES_ACTIVE="mysql"
   $env:DB_URL="jdbc:mysql://localhost:3306/civicfix_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true"
   $env:DB_USERNAME="root"
   $env:DB_PASSWORD="YourMySQLPassword"
   $env:ADMIN_EMAIL="admin@civicfix.org"
   $env:ADMIN_PASSWORD="YourAdminPassword123"
   ```
4. Start the backend:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

*To reset existing demo records in a MySQL development database without altering schema:*
```powershell
mysql -u root -p civicfix_db < "database/cleanup-demo-data.sql"
```

---

## 5. Automated Testing

CivicFix includes automated unit and integration tests covering the priority scoring formula, lifecycle state transitions, geospatial duplicate detection, concurrent reference ID generation, and role-based access security:

```powershell
cd "backend"
java '@cp.txt' com.civicfix.TestRunner
```

### Verified Test Results
```
=================================================
   CIVICFIX AUTOMATED TEST SUITE EXECUTION       
=================================================

Running Test Class: PriorityScoringServiceTest
  [PASS] Critical severity should immediately receive CRITICAL priority level
  [PASS] Low severity fresh issue should receive LOW priority level
  [PASS] Age weight increases priority score as days pass and caps at maxAgeWeight

Running Test Class: WorkflowTransitionTest
  [PASS] IN_PROGRESS can transition to RESOLVED
  [PASS] RESOLVED can only transition to REOPENED
  [PASS] ASSIGNED can transition to IN_PROGRESS or reassigned
  [PASS] REOPENED can transition to ASSIGNED or IN_PROGRESS
  [PASS] SUBMITTED can only transition to ASSIGNED

Running Test Class: DuplicateDetectionServiceTest
  [PASS] Similar title and category yields high similarity score
  [PASS] Haversine distance calculation is accurate between known coordinates
  [PASS] Completely unrelated issue yields low similarity score

Running Test Class: ReferenceIdGenerationTest
  [PASS] Two or more complaints created via ComplaintService receive different unique reference IDs
  [PASS] Generator syncs with existing complaint reference IDs and avoids collision
  [PASS] Concurrent complaint reference ID generation produces zero duplicates
  [PASS] Multiple sequential reference ID generations produce strictly increasing values

Running Test Class: RoleAndRegistrationSecurityTest
  [PASS] 1. Citizen registration strictly assigns ROLE_CITIZEN
  [PASS] 2. Staff registration strictly assigns ROLE_STAFF
  [PASS] 3. Public registration payload cannot create or escalate to ROLE_ADMIN
  [PASS] 4. Only one admin account can exist in the application
  [PASS] 5. Duplicate email addresses are rejected across registrations
  [PASS] 6. Two or more complaints receive different unique reference IDs
  [PASS] 7. Citizens cannot access unauthorized users' complaints
  [PASS] 8. Staff and admin access restrictions work correctly
  [PASS] 9. Demo complaints and sample users are not recreated on application startup
  [PASS] 10. Existing login and complaint APIs remain compatible with frontend contracts

-------------------------------------------------
RESULTS: Passed: 25, Failed: 0, Total: 25
=================================================
```

---

## 6. Detailed Technical Documentation

Explore the comprehensive technical guides in the `docs/` directory:

- [**System Architecture & Data Flows**](file:///docs/ARCHITECTURE.md): Multi-tier design, JWT security pipeline, sequence diagrams, and access matrix.
- [**Complaint Lifecycle & State Machine**](file:///docs/WORKFLOW.md): Formal status transitions (`SUBMITTED` $\to$ `ASSIGNED` $\to$ `IN_PROGRESS` $\to$ `RESOLVED` $\rightleftharpoons$ `REOPENED`), transition guards, and audit trail details.
- [**Entity-Relationship (ER) Data Model**](file:///docs/ER_DIAGRAM.md): Mermaid ER diagram, 8 relational tables, data types, indexes, and foreign keys.
- [**REST API Documentation**](file:///docs/API_DOCUMENTATION.md): Complete OpenAPI reference, JSON request/response envelopes, query parameters, and status codes.
- [**Rule-Based Priority Formula**](file:///docs/PRIORITY_SCORING_FORMULA.md): Mathematical specification of `severity_weight + category_weight + age_weight` with worked numerical examples.
- [**Duplicate Detection Algorithm**](file:///docs/DUPLICATE_DETECTION_ALGORITHM.md): Explainable Jaccard token similarity and Haversine great-circle distance formulas.
- [**Screenshots & Evaluation Checklist**](file:///docs/SCREENSHOTS_CHECKLIST.md): Step-by-step verification checklist covering all 16 user interfaces.

---

## 7. License & Credits

Developed as a modern civic technology platform using open-source frameworks:
- Leaflet & OpenStreetMap contributors
- Recharts Visualization Library
- Lucide Open-Source Icons
- Spring Framework & Spring Boot (VMware / Broadcom)
