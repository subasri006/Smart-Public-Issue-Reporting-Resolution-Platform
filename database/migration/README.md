# CivicFix Database Migration: MySQL to MongoDB

This directory contains utilities and instructions for migrating relational data from MySQL 8.0 to MongoDB.

## Architecture Mapping

| MySQL Table | MongoDB Collection | Key ID Transformation |
| :--- | :--- | :--- |
| `users` | `users` | `id` (BIGINT) &rarr; `_id` (ObjectId) |
| `complaint_categories` | `complaintcategories` | `id` (BIGINT) &rarr; `_id` (ObjectId) |
| `complaints` | `complaints` | `category_id`, `citizen_id`, `assigned_staff_id` &rarr; ObjectIds |
| `complaint_status_history` | `complaintstatushistories` | `complaint_id`, `changed_by_id` &rarr; ObjectIds |
| `complaint_assignments` | `complaintassignments` | `complaint_id`, `assigned_to_id`, `assigned_by_id` &rarr; ObjectIds |
| `complaint_comments` | `complaintcomments` | `complaint_id`, `author_id` &rarr; ObjectIds |
| `complaint_attachments` | `complaintattachments` | `complaint_id`, `uploaded_by_id` &rarr; ObjectIds |
| `audit_logs` | `auditlogs` | `performed_by_id` &rarr; ObjectId |
| `complaint_sequences` | `complaintsequences` | `sequence_key` &rarr; `sequenceKey` |

## How to Run Migration

### 1. Dry Run (Validate without writing)
```bash
node database/migration/migrate.js --dry-run
```

### 2. Live Migration
```bash
node database/migration/migrate.js
```
