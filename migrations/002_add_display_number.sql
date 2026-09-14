-- Migration: 002_add_display_number.sql
-- Description: Add display_number column, sequence, and unique index for sequential answer URLs

-- 1. Create a sequence for sequential answer numbering
CREATE SEQUENCE IF NOT EXISTS questions_display_number_seq START WITH 1 INCREMENT BY 1;

-- 2. Add display_number column to questions table
ALTER TABLE questions ADD COLUMN IF NOT EXISTS display_number INTEGER UNIQUE;

-- 3. Create index for fast lookups by display_number
CREATE INDEX IF NOT EXISTS idx_questions_display_number ON questions(display_number);
