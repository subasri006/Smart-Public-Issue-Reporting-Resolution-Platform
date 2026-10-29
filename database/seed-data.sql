-- =====================================================================
-- CivicFix - Essential System Seed Data for MySQL 8.0
-- Seeds only the essential initial configuration:
-- 1. Complaint Categories
-- 2. Single Initial Administrator Account
-- (Configurable via environment variables in the Spring Boot backend)
-- No demo complaints, demo staff, or demo citizens are included.
-- =====================================================================

USE civicfix_db;

-- 1. Insert Complaint Categories
INSERT INTO complaint_categories (id, name, code, description, weight, icon, active, created_at) VALUES
(1, 'Road Damage', 'ROAD', 'Potholes, broken asphalt, dangerous cracks and damaged pavements', 20, 'Construction', TRUE, NOW()),
(2, 'Garbage & Sanitation', 'GARBAGE', 'Uncollected garbage, overflowing dumpsters and litter hotspots', 15, 'Trash2', TRUE, NOW()),
(3, 'Streetlight Outage', 'LIGHT', 'Dark intersections, flickering lamps, and non-functional street fixtures', 10, 'Lightbulb', TRUE, NOW()),
(4, 'Water Supply', 'WATER', 'Pipeline bursts, low pressure, dirty water, and distribution leaks', 25, 'Droplets', TRUE, NOW()),
(5, 'Drainage & Sewage', 'DRAINAGE', 'Blocked storm drains, sewage overflows, and standing contaminated water', 25, 'Waves', TRUE, NOW()),
(6, 'Public Safety & Hazards', 'SAFETY', 'Exposed electrical cables, open manholes, falling tree limbs, and building hazards', 30, 'AlertTriangle', TRUE, NOW()),
(7, 'Other Civic Issues', 'OTHER', 'Other community infrastructure and municipal maintenance concerns', 5, 'HelpCircle', TRUE, NOW())
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- 2. Initial Administrator Account
-- The single primary administrator account (subasri04006@gmail.com) is provisioned
-- securely and dynamically during Spring Boot application startup using the
-- CIVICFIX_ADMIN_PASSWORD environment variable. No passwords are hardcoded in SQL scripts.
