-- =====================================================================
-- CivicFix - Smart Public Issue Reporting & Resolution Platform
-- MySQL 8.0 Relational Database Schema DDL
-- =====================================================================

CREATE DATABASE IF NOT EXISTS civicfix_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE civicfix_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(60) NOT NULL UNIQUE,
    email VARCHAR(120) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_username (username),
    INDEX idx_user_email (email),
    INDEX idx_user_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Complaint Categories Table
CREATE TABLE IF NOT EXISTS complaint_categories (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(60) NOT NULL UNIQUE,
    code VARCHAR(40) NOT NULL UNIQUE,
    description VARCHAR(255),
    weight INT NOT NULL DEFAULT 15,
    icon VARCHAR(50),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Complaints Table
CREATE TABLE IF NOT EXISTS complaints (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_id VARCHAR(30) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    category_id BIGINT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED',
    priority_score DOUBLE NOT NULL DEFAULT 0.0,
    latitude DOUBLE,
    longitude DOUBLE,
    address VARCHAR(255),
    landmark VARCHAR(150),
    citizen_id BIGINT NOT NULL,
    assigned_staff_id BIGINT,
    resolution_notes TEXT,
    resolved_at DATETIME,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_category FOREIGN KEY (category_id) REFERENCES complaint_categories (id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_citizen FOREIGN KEY (citizen_id) REFERENCES users (id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_staff FOREIGN KEY (assigned_staff_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_complaint_ref (reference_id),
    INDEX idx_complaint_status (status),
    INDEX idx_complaint_severity (severity),
    INDEX idx_complaint_priority (priority_score),
    INDEX idx_complaint_citizen (citizen_id),
    INDEX idx_complaint_assigned (assigned_staff_id),
    INDEX idx_complaint_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Complaint Status History Table
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    previous_status VARCHAR(20),
    new_status VARCHAR(20) NOT NULL,
    changed_by_id BIGINT,
    comment VARCHAR(1000),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_history_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_history_user FOREIGN KEY (changed_by_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_history_complaint (complaint_id),
    INDEX idx_history_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Complaint Assignments Table
CREATE TABLE IF NOT EXISTS complaint_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    assigned_to_id BIGINT NOT NULL,
    assigned_by_id BIGINT NOT NULL,
    notes VARCHAR(500),
    assigned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_staff FOREIGN KEY (assigned_to_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_by FOREIGN KEY (assigned_by_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_assign_complaint (complaint_id),
    INDEX idx_assign_staff (assigned_to_id),
    INDEX idx_assign_created (assigned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Complaint Comments Table
CREATE TABLE IF NOT EXISTS complaint_comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    comment VARCHAR(1500) NOT NULL,
    is_internal BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_author FOREIGN KEY (author_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_comment_complaint (complaint_id),
    INDEX idx_comment_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Complaint Attachments Table
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    complaint_id BIGINT NOT NULL,
    file_name VARCHAR(150) NOT NULL,
    file_original_name VARCHAR(200) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    file_path VARCHAR(300) NOT NULL,
    is_resolution_evidence BOOLEAN NOT NULL DEFAULT FALSE,
    uploaded_by_id BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachment_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_attachment_uploader FOREIGN KEY (uploaded_by_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_attachment_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action VARCHAR(60) NOT NULL,
    entity_name VARCHAR(50),
    entity_id BIGINT,
    performed_by_id BIGINT,
    details VARCHAR(2000),
    ip_address VARCHAR(50),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_audit_user FOREIGN KEY (performed_by_id) REFERENCES users (id) ON DELETE SET NULL,
    INDEX idx_audit_action (action),
    INDEX idx_audit_entity (entity_name, entity_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Complaint Sequences Table (Concurrency-Safe Reference ID Generation)
CREATE TABLE IF NOT EXISTS complaint_sequences (
    sequence_key VARCHAR(30) NOT NULL PRIMARY KEY,
    current_value BIGINT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
