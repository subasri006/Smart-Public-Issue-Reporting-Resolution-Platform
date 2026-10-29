# CivicFix — RESTful API Documentation

## 1. Overview & Conventions

The CivicFix backend exposes a clean, standardized RESTful API over HTTP with JSON payloads.

- **Base URL**: `http://localhost:8080/api`
- **Authentication**: Bearer Token in `Authorization` header (`Authorization: Bearer <jwt_token>`)
- **Content Type**: `application/json` (or `multipart/form-data` for file uploads)
- **Error Format**: Uniform `ApiResponse<T>` structure with standard HTTP status codes (`200 OK`, `201 Created`, `400 Bad Request`, `401 Unauthorized`, `403 Forbidden`, `404 Not Found`).

### Standard Response Envelope
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... },
  "timestamp": "2026-10-24T20:30:00"
}
```

---

## 2. Authentication Endpoints

### 2.1 Register Citizen Account
- **POST** `/api/auth/register`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "johndoe",
  "email": "johndoe@example.com",
  "password": "Password@123",
  "fullName": "John Doe",
  "phone": "+1-555-0199"
}
```
- **Response (201 Created)**:
```json
{
  "success": true,
  "message": "Citizen registered successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 6,
    "username": "johndoe",
    "email": "johndoe@example.com",
    "fullName": "John Doe",
    "role": "ROLE_CITIZEN"
  }
}
```

### 2.2 User Login
- **POST** `/api/auth/login`
- **Access**: Public
- **Request Body**:
```json
{
  "username": "citizen1",
  "password": "Citizen@123"
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "type": "Bearer",
    "id": 4,
    "username": "citizen1",
    "email": "citizen1@civicfix.org",
    "fullName": "John Citizen",
    "role": "ROLE_CITIZEN"
  }
}
```

### 2.3 Get Current User Profile
- **GET** `/api/auth/me`
- **Access**: Authenticated (`ROLE_CITIZEN`, `ROLE_STAFF`, `ROLE_ADMIN`)
- **Response (200 OK)**: Returns user profile with statistics (total submitted, active, resolved).

---

## 3. Complaint Management Endpoints

### 3.1 Check Duplicate Complaints (Pre-Submission Warning)
- **POST** `/api/complaints/check-duplicates`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "title": "Large pothole causing tire damage",
  "categoryId": 1,
  "latitude": 40.7128,
  "longitude": -74.0060
}
```
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "potentialDuplicate": true,
    "matchScore": 78,
    "warningMessage": "Warning: A similar Road Damage issue was recently reported 120m away (CIV-20261024-0001 - IN_PROGRESS). You may still submit if your report is distinct.",
    "matches": [
      {
        "complaintId": 1,
        "referenceId": "CIV-20261024-0001",
        "title": "Deep Pothole on Main St",
        "status": "IN_PROGRESS",
        "distanceMeters": 120.5,
        "similarityScore": 78
      }
    ]
  }
}
```

### 3.2 Submit New Complaint
- **POST** `/api/complaints`
- **Access**: Authenticated (`ROLE_CITIZEN`, `ROLE_STAFF`, `ROLE_ADMIN`)
- **Content-Type**: `multipart/form-data`
- **Form Fields**:
  - `title`: String (5–200 chars)
  - `description`: String (10–2000 chars)
  - `categoryId`: Long
  - `severity`: String (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`)
  - `latitude`: Double (optional)
  - `longitude`: Double (optional)
  - `address`: String (optional)
  - `landmark`: String (optional)
  - `file`: MultipartFile (JPEG, PNG, WEBP, max 5MB, optional)
- **Response (201 Created)**: Returns created `ComplaintDetailResponse` with unique `referenceId`.

### 3.3 List Complaints (Filterable & Paged)
- **GET** `/api/complaints`
- **Access**: Authenticated (Citizens receive their own reports; Staff/Admin receive full registry)
- **Query Parameters**:
  - `status`: String (optional, e.g. `IN_PROGRESS`)
  - `severity`: String (optional, e.g. `CRITICAL`)
  - `categoryId`: Long (optional)
  - `search`: String (optional search keyword)
  - `assignedTo`: Long (optional user ID)
  - `page`: Integer (default 0)
  - `size`: Integer (default 10)
  - `sortBy`: String (default `createdAt`)
  - `direction`: String (`asc` or `desc`, default `desc`)

### 3.4 Get Complaint by ID
- **GET** `/api/complaints/{id}`
- **Access**: Citizen reporter or Staff/Admin
- **Response (200 OK)**: Returns full complaint detail including priority score breakdown, timeline, attachments, and comments.

---

## 4. Operational Workflow Endpoints

### 4.1 Assign Complaint to Staff
- **POST** `/api/complaints/{id}/assign`
- **Access**: `ROLE_STAFF`, `ROLE_ADMIN`
- **Request Body**:
```json
{
  "assignedToUserId": 2,
  "notes": "Assigned to Public Works rapid response unit."
}
```

### 4.2 Update Complaint Operational Status
- **PATCH** `/api/complaints/{id}/status`
- **Access**: `ROLE_STAFF`, `ROLE_ADMIN`
- **Request Body**:
```json
{
  "newStatus": "RESOLVED",
  "comments": "Pothole filled with cold asphalt mix. Surface rolled flat and road open."
}
```

### 4.3 Reopen Complaint
- **POST** `/api/complaints/{id}/reopen`
- **Access**: Citizen reporter or Admin
- **Request Body**:
```json
{
  "comment": "Road surface collapsed again after heavy rain this morning."
}
```

### 4.4 Add Comment
- **POST** `/api/complaints/{id}/comments`
- **Access**: Authenticated
- **Request Body**:
```json
{
  "comment": "Inspected site at 2:00 PM. Crew deployed.",
  "isInternal": false
}
```

---

## 5. Analytics & Export Endpoints

### 5.1 Analytics Executive Summary
- **GET** `/api/analytics/summary`
- **Access**: `ROLE_STAFF`, `ROLE_ADMIN`
- **Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "totalComplaints": 42,
    "submittedComplaints": 8,
    "assignedComplaints": 10,
    "inProgressComplaints": 9,
    "resolvedComplaints": 15,
    "reopenedComplaints": 2,
    "criticalPriorityComplaints": 6,
    "highPriorityComplaints": 14,
    "resolutionRatePercentage": 35.7,
    "averageResolutionHours": 46.2
  }
}
```

### 5.2 Category Distribution
- **GET** `/api/analytics/categories`
- **Access**: `ROLE_STAFF`, `ROLE_ADMIN`
- **Response (200 OK)**: Array of `{ categoryName, count, percentage }`.

### 5.3 30-Day Trends
- **GET** `/api/analytics/trends`
- **Access**: `ROLE_STAFF`, `ROLE_ADMIN`
- **Response (200 OK)**: Array of `{ date, submitted, resolved }`.

### 5.4 Area / Landmark Distribution
- **GET** `/api/analytics/areas`
- **Access**: `ROLE_STAFF`, `ROLE_ADMIN`
- **Response (200 OK)**: Array of `{ area, count }`.

### 5.5 CSV Data Export
- **GET** `/api/analytics/export`
- **Access**: `ROLE_STAFF`, `ROLE_ADMIN`
- **Produces**: `text/csv; charset=UTF-8` with `Content-Disposition: attachment; filename="complaints-export.csv"`
