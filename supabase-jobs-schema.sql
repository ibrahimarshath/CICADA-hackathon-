-- ========================================
-- JOBS AND APPLICATIONS TABLES
-- ========================================

-- JOBS TABLE
CREATE TABLE IF NOT EXISTS jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL, -- 'Full-time', 'Part-time', 'Contract', 'Internship'
  salary_range TEXT, -- e.g., '$120k - $160k'
  requirements TEXT[], -- Array of requirements
  responsibilities TEXT[], -- Array of responsibilities
  skills TEXT[], -- Array of required skills
  department TEXT,
  status TEXT DEFAULT 'open', -- 'open', 'closed', 'draft'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Links to Supabase Auth user
  candidate_id UUID, -- Alias for user_id (for compatibility)
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cover_letter TEXT,
  resume_url TEXT, -- URL to uploaded resume in storage
  experience TEXT,
  skills TEXT,
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewing', 'accepted', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_email ON applications(email);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);

-- Function to auto-update updated_at
CREATE TRIGGER update_jobs_updated_at 
    BEFORE UPDATE ON jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Sample jobs data
INSERT INTO jobs (title, description, location, type, salary_range, requirements, responsibilities, skills, department, status) 
VALUES 
(
  'Senior Full-Stack Developer',
  'Build scalable apps, collaborate with cross-functional teams, and ship quality features. You will work on cutting-edge projects using modern technologies.',
  'Remote / Hybrid',
  'Full-time',
  '$120k - $160k',
  ARRAY['5+ years of experience', 'Strong problem-solving skills', 'Excellent communication'],
  ARRAY['Build scalable applications', 'Collaborate with cross-functional teams', 'Ship quality features', 'Mentor junior developers'],
  ARRAY['React', 'Node.js', 'PostgreSQL', 'AWS'],
  'Engineering',
  'open'
),
(
  'AI/ML Engineer',
  'Develop cutting-edge AI models, implement ML pipelines, and drive innovation in AI solutions. Work on exciting projects that push the boundaries of technology.',
  'San Francisco, CA',
  'Full-time',
  '$140k - $180k',
  ARRAY['3+ years ML experience', 'PhD or Masters in related field', 'Strong research background'],
  ARRAY['Develop AI models', 'Implement ML pipelines', 'Drive innovation', 'Publish research papers'],
  ARRAY['Python', 'TensorFlow', 'PyTorch', 'Kubernetes'],
  'AI Research',
  'open'
),
(
  'UI/UX Designer',
  'Create beautiful, intuitive interfaces and exceptional user experiences for our products. Work closely with product and engineering teams.',
  'Remote',
  'Full-time',
  '$90k - $120k',
  ARRAY['3+ years design experience', 'Strong portfolio', 'User-centered design approach'],
  ARRAY['Create user interfaces', 'Design user experiences', 'Conduct user research', 'Create prototypes'],
  ARRAY['Figma', 'Adobe XD', 'User Research', 'Prototyping'],
  'Design',
  'open'
)
ON CONFLICT DO NOTHING;

