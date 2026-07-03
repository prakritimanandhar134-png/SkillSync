-- ═══════════════════════════════════════════════
--  MIGRATION: Add new features to SkillSync DB
--  Run this in phpMyAdmin → skillsync → SQL tab
-- ═══════════════════════════════════════════════

USE skillsync;

-- ── 1. Add course_duration to sessions table ──
ALTER TABLE sessions 
ADD COLUMN course_duration ENUM('1 Session','1 Week','2 Weeks','1 Month','2 Months','3 Months') 
DEFAULT '1 Session' AFTER topic;

-- ── 2. Add reject_reason + auto-reject tracking to barter_requests ──
ALTER TABLE barter_requests 
ADD COLUMN reject_reason TEXT NULL AFTER status,
ADD COLUMN responded_at DATETIME NULL AFTER reject_reason,
ADD COLUMN auto_rejected BOOLEAN DEFAULT FALSE AFTER responded_at;

-- ── 3. Add course_duration to barter_requests too ──
ALTER TABLE barter_requests 
ADD COLUMN course_duration ENUM('1 Session','1 Week','2 Weeks','1 Month','2 Months','3 Months') 
DEFAULT '1 Session' AFTER message;

-- ── 4. Verify changes ──
DESCRIBE sessions;
DESCRIBE barter_requests;
