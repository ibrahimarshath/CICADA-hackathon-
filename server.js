require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in development
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('.')); // Serve static files (HTML, CSS, JS)

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://jqxaufurcholgqwskybi.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUxNDI4NSwiZXhwIjoyMDc4MDkwMjg1fQ.j7liEK4JaMu74tQOBOu9ExkRbz87kz9NpZWsPppTP-o';
const JWT_SECRET = process.env.JWT_SECRET || 'UZZ3i1gCnesw79z7WLXt8FwD9/hmcYZ4B6NtMEJ3+ou1hK5URv5LwyZvvFV8RfeJtSJJnrved8LdVq8NVoCeCg==';

// Initialize Supabase client with service key
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// ========================================
// AUTH ROUTES
// ========================================

// Admin Login
app.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const timestamp = new Date().toISOString();

    if (!email || !password) {
      console.log(`[${timestamp}] [LOGIN FAILED] IP: ${clientIp} - Missing credentials`);
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Hardcoded admin credentials
    const ADMIN_EMAIL = 'admin@mastersolis-backend';
    const ADMIN_PASSWORD = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Generate JWT token
      const token = jwt.sign(
        { 
          email: email,
          role: 'admin',
          id: 'admin-1'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log successful login
      console.log(`[${timestamp}] [LOGIN SUCCESS] Email: ${email}, IP: ${clientIp}, Token: ${token.substring(0, 20)}...`);

      return res.json({
        success: true,
        token,
        user: {
          email: email,
          role: 'admin'
        }
      });
    } else {
      // Log failed login attempt
      console.log(`[${timestamp}] [LOGIN FAILED] Email: ${email}, IP: ${clientIp} - Invalid credentials`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [LOGIN ERROR]`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Legacy endpoint (keeping for backward compatibility)
app.post('/api/auth/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
    const timestamp = new Date().toISOString();

    if (!email || !password) {
      console.log(`[${timestamp}] [LOGIN FAILED] IP: ${clientIp} - Missing credentials`);
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const ADMIN_EMAIL = 'admin@mastersolis-backend';
    const ADMIN_PASSWORD = 'admin123';

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const token = jwt.sign(
        { 
          email: email,
          role: 'admin',
          id: 'admin-1'
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Log successful login
      console.log(`[${timestamp}] [LOGIN SUCCESS] Email: ${email}, IP: ${clientIp}, Token: ${token.substring(0, 20)}...`);

      return res.json({
        success: true,
        token,
        user: {
          email: email,
          role: 'admin'
        }
      });
    } else {
      // Log failed login attempt
      console.log(`[${timestamp}] [LOGIN FAILED] Email: ${email}, IP: ${clientIp} - Invalid credentials`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] [LOGIN ERROR]`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify Token
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.json({
    valid: true,
    user: req.user
  });
});

// ========================================
// HOMEPAGE CRUD ROUTES
// ========================================

// Get homepage content
app.get('/api/homepage', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('homepage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    res.json({ success: true, data: data || null });
  } catch (error) {
    console.error('Get homepage error:', error);
    res.status(500).json({ error: 'Failed to fetch homepage content' });
  }
});

// Alias endpoint for /api/home
app.get('/api/home', async (req, res) => {
  try {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { data, error } = await supabase
      .from('homepage')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ success: true, data: data || null });
  } catch (error) {
    console.error('Get home error:', error);
    res.status(500).json({ error: 'Failed to fetch home content' });
  }
});

// Create or Update homepage content
app.post('/api/homepage', authenticateToken, async (req, res) => {
  try {
    const { title, subtitle, description, hero_image, stats } = req.body;

    // Check if homepage exists
    const { data: existing } = await supabase
      .from('homepage')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      // Update existing
      const { data, error } = await supabase
        .from('homepage')
        .update({
          title,
          subtitle,
          description,
          hero_image,
          stats,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Create new
      const { data, error } = await supabase
        .from('homepage')
        .insert({
          title,
          subtitle,
          description,
          hero_image,
          stats
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Create/Update homepage error:', error);
    res.status(500).json({ error: 'Failed to save homepage content' });
  }
});

// Update homepage content
app.put('/api/homepage/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, description, hero_image, stats } = req.body;

    const { data, error } = await supabase
      .from('homepage')
      .update({
        title,
        subtitle,
        description,
        hero_image,
        stats,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update homepage error:', error);
    res.status(500).json({ error: 'Failed to update homepage content' });
  }
});

// Delete homepage content
app.delete('/api/homepage/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('homepage')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Homepage content deleted successfully' });
  } catch (error) {
    console.error('Delete homepage error:', error);
    res.status(500).json({ error: 'Failed to delete homepage content' });
  }
});

// ========================================
// ABOUT CRUD ROUTES
// ========================================

// Get about content
app.get('/api/about', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('about')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    res.json({ success: true, data: data || null });
  } catch (error) {
    console.error('Get about error:', error);
    res.status(500).json({ error: 'Failed to fetch about content' });
  }
});

// Create or Update about content
app.post('/api/about', authenticateToken, async (req, res) => {
  try {
    const { mission, vision, values, journey, team } = req.body;

    const { data: existing } = await supabase
      .from('about')
      .select('id')
      .limit(1)
      .single();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('about')
        .update({
          mission,
          vision,
          values,
          journey,
          team,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('about')
        .insert({
          mission,
          vision,
          values,
          journey,
          team
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error('Create/Update about error:', error);
    res.status(500).json({ error: 'Failed to save about content' });
  }
});

// Update about content
app.put('/api/about/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { mission, vision, values, journey, team } = req.body;

    const { data, error } = await supabase
      .from('about')
      .update({
        mission,
        vision,
        values,
        journey,
        team,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update about error:', error);
    res.status(500).json({ error: 'Failed to update about content' });
  }
});

// Delete about content
app.delete('/api/about/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('about')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'About content deleted successfully' });
  } catch (error) {
    console.error('Delete about error:', error);
    res.status(500).json({ error: 'Failed to delete about content' });
  }
});

// ========================================
// SERVICES CRUD ROUTES
// ========================================

// Get all services
app.get('/api/services', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get single service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get service error:', error);
    res.status(500).json({ error: 'Failed to fetch service' });
  }
});

// Create service
app.post('/api/services', authenticateToken, async (req, res) => {
  try {
    const { title, description, icon, features, benefits, category } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required' });
    }

    const { data, error } = await supabase
      .from('services')
      .insert({
        title,
        description,
        icon,
        features,
        benefits,
        category
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(500).json({ error: 'Failed to create service' });
  }
});

// Update service
app.put('/api/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, features, benefits, category } = req.body;

    const { data, error } = await supabase
      .from('services')
      .update({
        title,
        description,
        icon,
        features,
        benefits,
        category,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(500).json({ error: 'Failed to update service' });
  }
});

// Delete service
app.delete('/api/services/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({ error: 'Failed to delete service' });
  }
});

// ========================================
// CONTACT MESSAGES ROUTES
// ========================================

// Get all contact submissions
app.get('/api/contact-messages', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('contact_messages')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) throw error;

    res.json({
      success: true,
      data: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

// Get single contact message by ID
app.get('/api/contact-messages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get contact message error:', error);
    res.status(500).json({ error: 'Failed to fetch contact message' });
  }
});

// Create contact message (public endpoint)
app.post('/api/contact-messages', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Name, email, subject, and message are required' });
    }

    const { data, error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone: phone || null,
        subject,
        message
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Create contact message error:', error);
    res.status(500).json({ error: 'Failed to create contact message' });
  }
});

// Update contact message
app.put('/api/contact-messages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, subject, message } = req.body;

    const { data, error } = await supabase
      .from('contact_messages')
      .update({
        name,
        email,
        phone: phone || null,
        subject,
        message
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update contact message error:', error);
    res.status(500).json({ error: 'Failed to update contact message' });
  }
});

// Delete contact message
app.delete('/api/contact-messages/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Contact message deleted successfully' });
  } catch (error) {
    console.error('Delete contact message error:', error);
    res.status(500).json({ error: 'Failed to delete contact message' });
  }
});

// ========================================
// USER PROFILES ROUTES
// ========================================

// Get user profile
app.get('/api/profiles/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    res.json({ success: true, data: data || null });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update user profile
app.put('/api/profiles/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { full_name } = req.body;

    // Users can only update their own profile unless admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ========================================
// RESUMES ROUTES
// ========================================

// Get user's resumes
app.get('/api/resumes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get resumes error:', error);
    res.status(500).json({ error: 'Failed to fetch resumes' });
  }
});

// Get single resume
app.get('/api/resumes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Users can only view their own resumes unless admin
    if (req.user.role !== 'admin' && data.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get resume error:', error);
    res.status(500).json({ error: 'Failed to fetch resume' });
  }
});

// Create resume
app.post('/api/resumes', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone, experience, skills, education, ai_summary } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Set previous resumes to not latest
    await supabase
      .from('resumes')
      .update({ latest_active: false })
      .eq('user_id', userId);

    const { data, error } = await supabase
      .from('resumes')
      .insert({
        user_id: userId,
        name,
        email,
        phone: phone || null,
        experience: experience || null,
        skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
        education: education || null,
        ai_summary: ai_summary || null,
        latest_active: true
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Create resume error:', error);
    res.status(500).json({ error: 'Failed to create resume' });
  }
});

// Update resume
app.put('/api/resumes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { name, email, phone, experience, skills, education, ai_summary, latest_active } = req.body;

    // Check if user owns this resume
    const { data: existing } = await supabase
      .from('resumes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (req.user.role !== 'admin' && existing.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If setting as latest, unset others
    if (latest_active) {
      await supabase
        .from('resumes')
        .update({ latest_active: false })
        .eq('user_id', existing.user_id);
    }

    const { data, error } = await supabase
      .from('resumes')
      .update({
        name,
        email,
        phone: phone || null,
        experience: experience || null,
        skills: Array.isArray(skills) ? skills : (skills ? [skills] : []),
        education: education || null,
        ai_summary: ai_summary || null,
        latest_active: latest_active !== undefined ? latest_active : existing.latest_active,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update resume error:', error);
    res.status(500).json({ error: 'Failed to update resume' });
  }
});

// Delete resume
app.delete('/api/resumes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if user owns this resume
    const { data: existing } = await supabase
      .from('resumes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    if (req.user.role !== 'admin' && existing.user_id !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Delete resume error:', error);
    res.status(500).json({ error: 'Failed to delete resume' });
  }
});

// ========================================
// JOBS ROUTES (for completeness)
// ========================================

// Get all jobs
app.get('/api/jobs', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Get single job
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: 'Failed to fetch job' });
  }
});

// Create job (admin only)
app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, description, location, type, salary_range, requirements, responsibilities, skills, department, status } = req.body;

    if (!title || !description || !location || !type) {
      return res.status(400).json({ error: 'Title, description, location, and type are required' });
    }

    const { data, error } = await supabase
      .from('jobs')
      .insert({
        title,
        description,
        location,
        type,
        salary_range: salary_range || null,
        requirements: Array.isArray(requirements) ? requirements : [],
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        skills: Array.isArray(skills) ? skills : [],
        department: department || null,
        status: status || 'open'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

// Update job (admin only)
app.put('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { title, description, location, type, salary_range, requirements, responsibilities, skills, department, status } = req.body;

    const { data, error } = await supabase
      .from('jobs')
      .update({
        title,
        description,
        location,
        type,
        salary_range: salary_range || null,
        requirements: Array.isArray(requirements) ? requirements : [],
        responsibilities: Array.isArray(responsibilities) ? responsibilities : [],
        skills: Array.isArray(skills) ? skills : [],
        department: department || null,
        status: status || 'open',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job (admin only)
app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// ========================================
// HEALTH CHECK
// ========================================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Mastersolis Backend API is running',
    timestamp: new Date().toISOString()
  });
});

// ========================================
// START SERVER
// ========================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Supabase URL: ${SUPABASE_URL}`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
  console.log(`✅ Server is ready to accept connections`);
  console.log(`\n💡 Make sure to:`);
  console.log(`   1. Run 'npm install' if you haven't already`);
  console.log(`   2. Open http://localhost:${PORT} in your browser`);
  console.log(`   3. Check /api/health endpoint to verify server is running\n`);
});

