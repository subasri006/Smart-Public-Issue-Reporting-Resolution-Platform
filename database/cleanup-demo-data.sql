-- =====================================================================
-- CivicFix - Safe Development Data Cleanup Script
-- Purpose: Safely removes seeded demo users, sample complaints, and
--          related historical records while strictly preserving:
--          1. Database schema, constraints, indexes, and tables
--          2. System complaint categories
--          3. The single initial System Administrator account
--
-- Note: Foreign key constraints are respected by deleting child
--       records in the exact reverse-dependency order.
-- =====================================================================

USE civicfix_db;

-- 1. Delete complaint attachments
DELETE FROM complaint_attachments;

-- 2. Delete complaint comments
DELETE FROM complaint_comments;

-- 3. Delete complaint assignments
DELETE FROM complaint_assignments;

-- 4. Delete complaint status audit history
DELETE FROM complaint_status_history;

-- 5. Delete all complaints
DELETE FROM complaints;

-- 6. Reset complaint sequence counters
DELETE FROM complaint_sequences;

-- 7. Delete non-admin audit logs
DELETE FROM audit_logs WHERE performed_by_id IN (
    SELECT id FROM users WHERE role != 'ROLE_ADMIN'
) OR entity_name = 'Complaint';

-- 8. Delete demo/non-admin users (preserves the single ROLE_ADMIN account)
DELETE FROM users WHERE role != 'ROLE_ADMIN';

-- Verification Queries
SELECT 'Categories Retained:' AS status, COUNT(*) AS count FROM complaint_categories;
SELECT 'Admins Retained:' AS status, COUNT(*) AS count FROM users WHERE role = 'ROLE_ADMIN';
SELECT 'Non-Admin Users Remaining:' AS status, COUNT(*) AS count FROM users WHERE role != 'ROLE_ADMIN';
SELECT 'Complaints Remaining:' AS status, COUNT(*) AS count FROM complaints;
