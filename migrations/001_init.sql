-- Migration: 001_init.sql
-- Description: Create profile and questions tables for Neon Postgres

-- Profile Table (Single row with id = 1)
CREATE TABLE IF NOT EXISTS profile (
  id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  alias_ar VARCHAR(255) NOT NULL,
  alias_en VARCHAR(255) NOT NULL,
  name_ar VARCHAR(255) NOT NULL,
  name_en VARCHAR(255) NOT NULL,
  bio_ar TEXT NOT NULL,
  bio_en TEXT NOT NULL,
  linkedin VARCHAR(512) NOT NULL,
  github VARCHAR(512) NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id VARCHAR(64) PRIMARY KEY,
  question_text TEXT NOT NULL,
  answer_text TEXT,
  status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'dismissed')),
  is_anonymous BOOLEAN NOT NULL DEFAULT TRUE,
  asker_name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
  likes_count INTEGER NOT NULL DEFAULT 0,
  parent_id VARCHAR(64) REFERENCES questions(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  answered_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_questions_status_created ON questions(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_status_answered ON questions(status, answered_at DESC);
CREATE INDEX IF NOT EXISTS idx_questions_status_likes ON questions(status, likes_count DESC);
CREATE INDEX IF NOT EXISTS idx_questions_parent_id ON questions(parent_id);

-- Admin Login Attempts (persistent brute-force protection across serverless lambdas)
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  ip VARCHAR(64) PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

