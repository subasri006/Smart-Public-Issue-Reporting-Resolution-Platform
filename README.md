# CivicFix — Smart Public Issue Reporting & Resolution Platform (MERN Stack)

[![Node.js](https://img.shields.io/badge/Node.js-20%20LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%7C%20Mongoose%208-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![React 18](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-199900?style=for-the-badge&logo=leaflet&logoColor=white)](https://leafletjs.com/)
[![Jest](https://img.shields.io/badge/Jest-37%2F37%20Passing-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)

---

## 1. Project Overview

**CivicFix** is an enterprise-grade full-stack digital civic grievance management platform built on the **MERN stack** (MongoDB, Express.js, React, Node.js). Moving beyond traditional static complaint portals, CivicFix provides a real-time digital command center connecting citizens, municipal operational staff, and city administrators with transparent priority scoring, geospatial clustering, explainable duplicate detection, and robust role-based security.

### Core Capabilities
- **Role-Based Access Control (RBAC)**: Strictly enforced at both the API middleware layer (JWT + Role Guards) and the React frontend (ProtectedRoute guards) across three distinct roles: `ROLE_CITIZEN`, `ROLE_STAFF`, and `ROLE_ADMIN`.
- **Deterministic Priority Scoring**: Explainable mathematical formula combining severity weight ($W_{sev}$), category priority ($W_{cat}$), and age weighting ($W_{age}$ capped at 30 pts).
- **Explainable Duplicate Detection**: Hybrid tokenized Jaccard similarity combined with Haversine great-circle distance. Non-blocking warning modal allows citizens to *"Submit Anyway"* so legitimate distinct issues are never discarded.
- **Interactive OpenStreetMap Visualization**: Zero-cost Leaflet mapping engine featuring color-coded markers, click-to-pin report location, reverse geocoding, and popup detail cards.
- **Strict Complaint Lifecycle State Machine**: Finite transition rules validated on the backend: `SUBMITTED` $\to$ `ASSIGNED` $\to$ `IN_PROGRESS` $\to$ `RESOLVED` $\rightleftharpoons$ `REOPENED`.
- **Live Database-Backed Analytics**: Real-time aggregation pipelines computing 30-day trends, category distributions, status breakdowns, and streaming UTF-8 CSV exports.
- **Single Administrator Protection**: Strict single-administrator rule preventing multiple admins, role escalation, or accidental admin deactivation.

---

## 2. System Architecture & Folder Structure

```
CivicFix/
├── backend/                             # Node.js + Express.js + Mongoose REST Backend
│   ├── src/
│   │   ├── config/                      # Database (Mongoose), CORS, and validated Environment
│   │   │   ├── database.js
│   │   │   ├── env.js
│   │   │   └── cors.js
│   │   ├── controllers/                 # Express route controllers (Auth, Complaints, Admin, Analytics, etc.)
│   │   │   ├── authController.js
│   │   │   ├── complaintController.js
│   │   │   ├── categoryController.js
│   │   │   ├── adminController.js
│   │   │   ├── staffController.js
│   │   │   ├── analyticsController.js
│   │   │   ├── fileUploadController.js
│   │   │   └── healthController.js
│   │   ├── middleware/                  # Security, authentication, authorization, upload, & errors
│   │   │   ├── authenticate.js
│   │   │   ├── authorize.js
│   │   │   ├── validate.js
│   │   │   ├── errorHandler.js
│   │   │   ├── notFound.js
│   │   │   └── upload.js
│   │   ├── models/                      # Mongoose data schemas and indexes
│   │   │   ├── User.js
│   │   │   ├── Complaint.js
│   │   │   ├── ComplaintCategory.js
│   │   │   ├── ComplaintStatusHistory.js
│   │   │   ├── ComplaintAssignment.js
│   │   │   ├── ComplaintComment.js
│   │   │   ├── ComplaintAttachment.js
│   │   │   ├── ComplaintSequence.js
│   │   │   ├── AuditLog.js
│   │   │   └── index.js
│   │   ├── routes/                      # Modular Express route declarations
│   │   │   ├── authRoutes.js
│   │   │   ├── complaintRoutes.js
│   │   │   ├── categoryRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── staffRoutes.js
│   │   │   ├── analyticsRoutes.js
│   │   │   ├── uploadRoutes.js
│   │   │   └── index.js
│   │   ├── services/                    # Core business logic, scoring, algorithms, and generators
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   ├── complaintService.js
│   │   │   ├── categoryService.js
│   │   │   ├── priorityScoringService.js
│   │   │   ├── duplicateDetectionService.js
│   │   │   ├── referenceIdGeneratorService.js
│   │   │   ├── analyticsService.js
│   │   │   ├── auditService.js
│   │   │   └── fileStorageService.js
│   │   ├── validators/                  # Zod validation schemas for requests
│   │   ├── utils/                       # ApiResponse & PagedResponse compatibility wrappers
│   │   ├── jobs/                        # Automated startup data initializer
│   │   ├── app.js                       # Express app configuration & middleware
│   │   └── server.js                    # Server startup and graceful shutdown
│   ├── tests/                           # Complete Jest test suite (37 tests across 8 suites)
│   ├── uploads/complaints/              # Local photo upload directory
│   ├── .env.example                     # Backend environment configuration template
│   ├── Dockerfile                       # Multi-stage production container build
│   └── package.json                     # Backend dependencies & test scripts
├── frontend/                            # React 18 + Vite SPA Frontend
│   ├── src/
│   │   ├── api/                         # Axios client with JWT interceptor & auto-redirect
│   │   ├── components/                  # Common UI badges, modals, timeline, Leaflet maps
│   │   ├── context/                     # AuthContext (state, tokens, user roles)
│   │   ├── pages/                       # 16 complete views across Citizen, Staff, Admin, Maps, & Analytics
│   │   ├── App.jsx                      # App route definitions with Route Guards
│   │   └── main.jsx                     # Application entrypoint
│   ├── package.json                     # Frontend dependencies
│   ├── vite.config.js                   # Vite config with API proxy
│   └── vercel.json                      # Vercel SPA rewrite routing configuration
├── database/                            # Database schemas, migrations, & SQL references
│   ├── migration/                       # Reusable MySQL-to-MongoDB idempotent migration script
│   ├── schema.sql                       # Original MySQL schema reference
│   └── seed-data.sql                    # Original seed data reference
├── docs/                                # Technical specifications
└── README.md                            # Comprehensive project guide
```

---

## 3. Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Node.js | `20+ LTS` | Scalable asynchronous JavaScript server runtime |
| **Backend Framework** | Express.js | `4.21.x` | RESTful routing, middleware, controllers |
| **Database & ODM** | MongoDB Atlas & Mongoose | `8.7.x` | Document persistence, schemas, GeoJSON indexes |
| **Security & Auth** | JWT (`jsonwebtoken`) + BCrypt | `9.0.x / 2.4.x` | Stateless tokens, salt hashing, role authorization |
| **Input Validation** | Zod | `3.23.x` | Strict type validation for request payloads |
| **File Handling** | Multer | `1.4.x` | Secure photo and evidence file uploads (5MB max) |
| **Testing** | Jest + Supertest | `29.7.x / 7.0.x` | Unit, integration, security, and lifecycle tests |
| **Frontend Framework** | React + Vite | `18.3.x / 5.4.x` | Single Page Application (SPA) with hot reload |
| **Styling** | Tailwind CSS | `3.4.x` | Responsive modern UI design system |
| **Maps & Geospatial** | Leaflet + OpenStreetMap | `1.9.x` | Interactive issue map and click-to-pin picker |
| **Data Visualization** | Recharts | `2.15.x` | Responsive bar charts, area trends, and breakdown graphs |

---

## 4. Local Quickstart (Windows PowerShell)

### Prerequisites
- Node.js `20.x` or later installed (`node -v`)
- npm `10.x` or later installed (`npm -v`)
- Running MongoDB instance (local or MongoDB Atlas connection string)

### Step 1: Configure Backend Environment
In your Windows PowerShell terminal:
```powershell
# Copy environment template
Copy-Item backend/.env.example backend/.env

# Open backend/.env in your editor and ensure MONGODB_URI and CIVICFIX_ADMIN_PASSWORD are set
```

### Step 2: Install Backend Dependencies & Start Server
```powershell
cd backend
npm install
npm run dev
```
*The backend server will start on `http://localhost:5000`.*

### Step 3: Install Frontend Dependencies & Start App
In a second Windows PowerShell terminal:
```powershell
cd frontend
npm install
npm run dev
```
*The frontend application will start on `http://localhost:5173`.*

---

## 5. Environment Variables Reference

### Backend (`backend/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Express server listen port |
| `NODE_ENV` | `development` | Runtime environment (`development` / `production` / `test`) |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017/civicfix` | MongoDB connection string (local or Atlas) |
| `JWT_SECRET` | *(64-character secret string)* | Cryptographic key for signing JWT tokens |
| `JWT_EXPIRES_IN` | `24h` | Token expiration period |
| `CLIENT_URL` | `http://localhost:5173` | Allowed CORS frontend origin |
| `UPLOAD_DIR` | `./uploads/complaints` | Directory for photo/attachment storage |
| `CIVICFIX_ADMIN_EMAIL` | `admin@civicfix.org` | Initial system administrator email |
| `CIVICFIX_ADMIN_USERNAME`| `admin` | Initial system administrator username |
| `CIVICFIX_ADMIN_PASSWORD`| *(required)* | Initial administrator master password |
| `CIVICFIX_ADMIN_NAME` | `Chief Administrator` | Initial administrator full name |

### Frontend (`frontend/.env`)
| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `/api` | Base API route (proxied locally, or cloud backend URL) |

---

## 6. Role Matrix & Security Architecture

The platform recognizes exactly three user roles:

| Capability / Resource | ROLE_CITIZEN | ROLE_STAFF | ROLE_ADMIN |
| :--- | :---: | :---: | :---: |
| Self-Registration | Yes | Yes (with department) | **No** (Private Bootstrap only) |
| Submit New Complaint | Yes | Yes | Yes |
| View Own Complaints | Yes | Yes | Yes |
| View Private Details of Other Citizens' Complaints | **No** | Yes | Yes |
| Update/Withdraw Complaint Before Assignment | Yes (Owner only) | No | Yes |
| Assign / Reassign Complaints | **No** | Yes | Yes |
| Update Status (`IN_PROGRESS`, `RESOLVED`) | **No** | Yes | Yes |
| Reopen Resolved Complaints | Yes (Owner only) | Yes | Yes |
| Add Internal Staff Notes | **No** | Yes | Yes |
| Add Public Comments | Yes | Yes | Yes |
| Access Public Map & Recent List | Yes | Yes | Yes |
| Access Detailed Analytics & CSV Export | **No** | Yes | Yes |
| Manage User Accounts & Single Admin Rule | **No** | **No** | Yes |
| Manage Municipal Categories | **No** | **No** | Yes |
| View System Audit Logs | **No** | **No** | Yes |

---

## 7. Automated Test Suite & Verification Results

CivicFix includes a comprehensive automated test suite covering algorithms, lifecycle transitions, concurrency, security, and API endpoints:

```powershell
# Run the complete test suite
node "backend/node_modules/jest/bin/jest.js" --runInBand --detectOpenHandles --forceExit
```

### Actual Test Execution Output:
```
PASS backend/tests/workflowTransition.test.js (5 tests passed)
PASS backend/tests/authController.integration.test.js (7 tests passed)
PASS backend/tests/roleAndRegistrationSecurity.test.js (7 tests passed)
PASS backend/tests/complaintApi.integration.test.js (5 tests passed)
PASS backend/tests/analyticsAndDataIntegrity.test.js (4 tests passed)
PASS backend/tests/referenceIdGeneration.test.js (3 tests passed)
PASS backend/tests/duplicateDetection.test.js (3 tests passed)
PASS backend/tests/priorityScoring.test.js (3 tests passed)

Test Suites: 8 passed, 8 total
Tests:       37 passed, 37 total
Snapshots:   0 total
Time:        18.667 s
```

---

## 8. Data Migration: MySQL to MongoDB

To migrate existing relational MySQL data into MongoDB:
```powershell
# Dry run validation (validates relationships without writing data)
node database/migration/migrate.js --dry-run

# Execute migration
node database/migration/migrate.js
```

---

## 9. Production Deployment Guide

### A. MongoDB Atlas (Database)
1. Create a free M0 cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a database user with read/write privileges.
3. Under Network Access, allow access from `0.0.0.0/0` (or Render's outbound IP range).
4. Copy the connection string: `mongodb+srv://<user>:<password>@cluster.mongodb.net/civicfix?retryWrites=true&w=majority`.

### B. Render (Backend Web Service)
1. In the [Render Dashboard](https://dashboard.render.com/), create a new **Web Service**.
2. Connect your repository.
3. Settings:
   - **Root Directory:** `backend`
   - **Environment:** `Docker` (or Node.js native)
   - **Build Command:** `npm ci --omit=dev`
   - **Start Command:** `node src/server.js`
4. Configure Environment Variables:
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<your-atlas-uri>`
   - `JWT_SECRET`: `<strong-64-character-secret>`
   - `CIVICFIX_ADMIN_PASSWORD`: `<secure-master-password>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`

### C. Vercel (Frontend SPA)
1. In the [Vercel Dashboard](https://vercel.com/), import the repository.
2. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
3. Environment Variables:
   - `VITE_API_BASE_URL`: `https://your-backend.onrender.com/api`
4. Deploy. The included [`frontend/vercel.json`](file:///frontend/vercel.json) handles React Router SPA deep links automatically.
