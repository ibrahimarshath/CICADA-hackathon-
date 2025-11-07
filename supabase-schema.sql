-- ========================================
-- Supabase Table Schemas for Mastersolis Backend
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- HOMEPAGE TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS homepage (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  hero_image TEXT,
  stats JSONB, -- For storing statistics like {projects: 500, clients: 200, awards: 50}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_homepage_created_at ON homepage(created_at DESC);

-- ========================================
-- ABOUT TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS about (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mission TEXT,
  vision TEXT,
  values TEXT,
  journey JSONB, -- Array of journey items: [{year: "2018", title: "Foundation", description: "..."}]
  team JSONB, -- Array of team members: [{name: "John", role: "CEO", image: "..."}]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at
CREATE INDEX IF NOT EXISTS idx_about_created_at ON about(created_at DESC);

-- ========================================
-- SERVICES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT, -- Font Awesome icon class (e.g., "fas fa-brain")
  category TEXT, -- e.g., "ai", "cloud", "mobile"
  features JSONB, -- Array of features: ["Feature 1", "Feature 2"]
  benefits JSONB, -- Array of benefits: ["Benefit 1", "Benefit 2"]
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_services_category ON services(category);
CREATE INDEX IF NOT EXISTS idx_services_created_at ON services(created_at DESC);

-- ========================================
-- CONTACT MESSAGES TABLE
-- ========================================
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_contact_messages_email ON contact_messages(email);
CREATE INDEX IF NOT EXISTS idx_contact_messages_created_at ON contact_messages(created_at DESC);

-- ========================================
-- ADMIN LOGIN LOGS TABLE (Optional - for tracking admin logins)
-- ========================================
CREATE TABLE IF NOT EXISTS admin_login_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  ip_address TEXT,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on created_at for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_created_at ON admin_login_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_email ON admin_login_logs(email);
CREATE INDEX IF NOT EXISTS idx_admin_logs_success ON admin_login_logs(success);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE homepage ENABLE ROW LEVEL SECURITY;
ALTER TABLE about ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_login_logs ENABLE ROW LEVEL SECURITY;

-- Homepage: Allow public read, admin write
CREATE POLICY "Public read homepage" ON homepage FOR SELECT USING (true);
CREATE POLICY "Admin write homepage" ON homepage FOR ALL USING (false); -- Service key bypasses RLS

-- About: Allow public read, admin write
CREATE POLICY "Public read about" ON about FOR SELECT USING (true);
CREATE POLICY "Admin write about" ON about FOR ALL USING (false); -- Service key bypasses RLS

-- Services: Allow public read, admin write
CREATE POLICY "Public read services" ON services FOR SELECT USING (true);
CREATE POLICY "Admin write services" ON services FOR ALL USING (false); -- Service key bypasses RLS

-- Contact Messages: Allow public insert, admin read/delete
CREATE POLICY "Public insert contact_messages" ON contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin read contact_messages" ON contact_messages FOR SELECT USING (false); -- Service key bypasses RLS
CREATE POLICY "Admin delete contact_messages" ON contact_messages FOR DELETE USING (false); -- Service key bypasses RLS

-- Admin Login Logs: Admin only
CREATE POLICY "Admin read login_logs" ON admin_login_logs FOR SELECT USING (false); -- Service key bypasses RLS

-- ========================================
-- TRIGGERS FOR UPDATED_AT
-- ========================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_homepage_updated_at BEFORE UPDATE ON homepage
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_updated_at BEFORE UPDATE ON about
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================
-- SAMPLE DATA (Optional)
-- ========================================

-- Insert sample homepage data
INSERT INTO homepage (title, subtitle, description, hero_image, stats) 
VALUES (
  'Welcome to Mastersolis Infotech',
  'Transforming Ideas Into Digital Reality',
  'Empowering businesses with cutting-edge AI and technology solutions',
  'https://images.unsplash.com/photo-1451187580459-43490279c0fa',
  '{"projects": 500, "clients": 200, "awards": 50}'::jsonb
) ON CONFLICT DO NOTHING;

-- Insert sample about data
INSERT INTO about (mission, vision, values) 
VALUES (
  'To empower businesses worldwide with innovative technology solutions that drive growth, efficiency, and digital transformation.',
  'To be the global leader in AI-powered solutions, creating a future where technology seamlessly enhances every aspect of business and life.',
  'Innovation, integrity, excellence, and customer-centricity guide every decision and every solution we deliver.'
) ON CONFLICT DO NOTHING;

-- Insert sample services
INSERT INTO services (title, description, icon, category, features, benefits) 
VALUES 
(
  'AI & Machine Learning',
  'Harness the power of AI to automate processes, gain insights, and drive innovation.',
  'fas fa-brain',
  'ai',
  '["Custom AI model development", "Natural Language Processing", "Computer Vision"]'::jsonb,
  '["Reduce operational costs by 40%", "Improve decision-making with data-driven insights"]'::jsonb
),
(
  'Custom Software Development',
  'Scalable, secure, and tailored software solutions built for your specific needs.',
  'fas fa-code',
  'software',
  '["Full-stack web application development", "Enterprise software solutions", "API development"]'::jsonb,
  '["Tailored solutions that fit your exact requirements", "Scalable architecture for future growth"]'::jsonb
),
(
  'Cloud Solutions',
  'Migrate, manage, and optimize your infrastructure with cutting-edge cloud technology.',
  'fas fa-cloud',
  'cloud',
  '["Cloud migration and deployment", "Multi-cloud strategies", "Infrastructure as Code"]'::jsonb,
  '["Reduce infrastructure costs by 50%", "Improve scalability and flexibility"]'::jsonb
) ON CONFLICT DO NOTHING;

