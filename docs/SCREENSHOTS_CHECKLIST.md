# CivicFix — UI Views & Demonstration Checklist

This document details all 16 application views and interactive workflows for project verification and internship evaluation.

---

## 1. Views & Interface Inventory

| # | View Name | Route | Target Persona | Key Verification Elements |
| :---: | :--- | :--- | :--- | :--- |
| **1** | **Public Landing Page** | `/` | Anonymous / Public | Hero banner, value proposition cards, live metrics counters, category showcase, "How it Works" 4-step guide, recent public issues feed, navigation header with login/register CTAs. |
| **2** | **Login Page** | `/login` | All Personas | Role-tailored login form, show/hide password toggle, input validation error alerts, 1-click quick-fill demo credentials chips for Citizen, Staff, and Admin. |
| **3** | **Citizen Registration** | `/register` | Public / Citizen | Full registration form (username, email, password, full name, phone number), client-side input validation, instant automatic redirection to authenticated citizen dashboard upon success. |
| **4** | **Citizen Dashboard** | `/dashboard` | `ROLE_CITIZEN` | Metric KPI cards (Total Submitted, In Progress, Resolved), prominent "Report New Issue" callout card, quick filterable list of recent personal reports with status badges. |
| **5** | **Report New Issue** | `/report` | `ROLE_CITIZEN` | Responsive form, category selector, severity selector (`LOW` to `CRITICAL`), drag-and-drop / click photo upload with image preview, Leaflet interactive GPS pin picker with reverse geocoding, browser geolocation button, live duplicate detection warning banner with "Submit Anyway" bypass. |
| **6** | **My Complaints** | `/my-complaints` | `ROLE_CITIZEN` | Filterable and searchable complaints data table/cards, search input, status tabs, pagination controls, clickable complaint reference links (`CIV-YYYYMMDD-XXXX`). |
| **7** | **Complaint Details & Timeline** | `/complaints/:id` | Citizen, Staff, Admin | Detailed issue breakdown, high-resolution photo gallery, transparent rule-based priority score card with component weights breakdown, interactive visual timeline of status changes with actors and timestamps, public discussion thread with comment input, edit/withdraw button (for unassigned reports), dispute/reopen button (for resolved reports). |
| **8** | **Authority / Staff Dashboard** | `/authority/dashboard` | `ROLE_STAFF` | Operational workload metrics (Pending Triage, Active Assignments, Critical Issues, Today's Resolutions), urgency queue sorted by priority score, one-click quick assignment and triage modal triggers. |
| **9** | **Complaint Management Workbench** | `/authority/complaints` | `ROLE_STAFF`, `ROLE_ADMIN` | Multi-criteria filter bar (Status, Severity, Category, Search keyword), bulk complaint table, quick assign popover, status change action triggers, one-click CSV export button. |
| **10**| **Assignment & Status Modal** | Embedded Modal | `ROLE_STAFF`, `ROLE_ADMIN` | Modal interface allowing staff reassignment, state transition picker with backend lifecycle validation, internal notes field, public resolution comments, and resolution evidence file upload. |
| **11**| **Admin Executive Dashboard** | `/admin/dashboard` | `ROLE_ADMIN` | Executive metrics cards (Total Complaints, System Resolution Rate, Average Resolution Time, System Users), quick navigation to User Governance and Category Configuration, live platform audit stream log with actor IP addresses and timestamps. |
| **12**| **User Management Console** | `/admin/users` | `ROLE_ADMIN` | User accounts registry, role filtering (`CITIZEN`, `STAFF`, `ADMIN`), user activation/deactivation toggle, modal to provision new municipal staff and officer accounts. |
| **13**| **Category Management Console** | `/admin/categories` | `ROLE_ADMIN` | Issue category directory, weight configuration controls (adjusting $W_{\text{category}}$ for priority scoring), modal to add new municipal departments or categories. |
| **14**| **Interactive Issue Map** | `/map` | Citizen, Staff, Admin | Full-screen Leaflet OpenStreetMap canvas, color-coded markers by severity and status, auto-fit map bounds to available complaints, interactive marker popups with reference IDs, thumbnails, and status pills, category/status quick filter floating toolbar. |
| **15**| **Analytics & Reports Console** | `/analytics` | `ROLE_STAFF`, `ROLE_ADMIN` | Real-time database-backed Recharts visualizations: 30-Day Trend Area Chart (Submitted vs Resolved), Issue Status Donut Chart, Category Volume Bar Chart, Area/Landmark distribution table, date range filters, direct CSV export trigger. |
| **16**| **User Profile Page** | `/profile` | Authenticated Users | User account summary, role badge, personal activity counters, change password form with validation. |
| **17**| **Not Found / 404 Page** | `*` | All | Friendly branded civic 404 illustration, descriptive navigation message, "Return to Dashboard" action button. |

---

## 2. Evaluation Walkthrough Script

For project demonstration or review, execute this recommended sequence:

1. **Anonymous Exploration**:
   - Open `http://localhost:5173/` and scroll through landing page statistics, category showcase, and recent issue reports.
   - Click **Explore Map** in navbar to view the live Leaflet map with colored pins across the city.
2. **Citizen Issue Reporting**:
   - Navigate to `/login` and click the **Citizen** demo badge (`citizen1`).
   - Click **Report New Issue** (`/report`).
   - Enter title: `Deep Pothole on Main St`. Notice the **Duplicate Warning Banner** appear with existing reference ID `CIV-20261024-0001`!
   - Upload an image file, click on the Leaflet map to drop a pin, and click **Submit Complaint**.
   - Review the newly generated reference ID and transparent priority score breakdown on the Complaint Details page.
3. **Staff Triage & Resolution**:
   - Switch user: Log in as **Staff** (`staff1`).
   - Open `/authority/complaints`. Select the newly submitted complaint.
   - Click **Assign**, select `staff1`, and confirm. Notice status transition to `ASSIGNED`.
   - Click **Update Status**, change status to `IN_PROGRESS` with note *"Crew dispatched"*.
   - Click **Update Status** again, transition to `RESOLVED` with public resolution comments.
4. **Admin Executive Governance**:
   - Switch user: Log in as **Admin** (`admin`).
   - Navigate to `/admin/dashboard` to review real-time platform metrics and live audit log stream.
   - Open `/admin/categories` to view and adjust priority weights ($W_{\text{category}}$).
   - Open `/analytics` to inspect Recharts line and bar charts, and click **Export CSV** to download `complaints-export.csv`.
