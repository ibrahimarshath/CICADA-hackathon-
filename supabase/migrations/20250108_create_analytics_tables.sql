-- 20250108_create_analytics_tables.sql
-- Create tables for visitor tracking and service click analytics

-- VISITORS TABLE
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_agent TEXT,
  ip_address TEXT,
  page_url TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SERVICE_CLICKS TABLE
CREATE TABLE IF NOT EXISTS service_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name TEXT NOT NULL,
  user_agent TEXT,
  ip_address TEXT,
  page_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_visitors_created_at ON visitors(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_service_clicks_service_name ON service_clicks(service_name);
CREATE INDEX IF NOT EXISTS idx_service_clicks_created_at ON service_clicks(created_at DESC);

