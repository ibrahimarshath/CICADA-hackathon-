-- 20250108_add_missing_resume_fields.sql
-- Safe migration to add missing columns and tables
-- Only adds columns/tables that don't already exist

-- Create resumes table if it doesn't exist
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  experience TEXT,
  skills TEXT[],
  education JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add missing columns to resumes table
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS pdf_url TEXT;
ALTER TABLE resumes ADD COLUMN IF NOT EXISTS latest_active BOOLEAN DEFAULT true;

-- Add missing columns to jobs table
-- Note: salary_range already exists in current schema, but adding IF NOT EXISTS for safety
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary_range TEXT;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Add missing columns to applications table
-- Note: cover_letter already exists in current schema, but adding IF NOT EXISTS for safety
ALTER TABLE applications ADD COLUMN IF NOT EXISTS ai_fit_score INT;
ALTER TABLE applications ADD COLUMN IF NOT EXISTS cover_letter TEXT;

-- Create indexes for new columns if needed
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_latest_active ON resumes(latest_active) WHERE latest_active = true;
CREATE INDEX IF NOT EXISTS idx_applications_ai_fit_score ON applications(ai_fit_score);

