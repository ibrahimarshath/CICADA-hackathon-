require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Local fallback storage for environments without Supabase or during dev
const DATA_DIR = path.join(__dirname, 'data');
const ABOUT_FILE = path.join(DATA_DIR, 'about.json');
const HOME_FILE = path.join(DATA_DIR, 'homepage.json');
const SERVICES_FILE = path.join(DATA_DIR, 'services.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    try { fs.mkdirSync(DATA_DIR, { recursive: true }); } catch (err) { console.warn('Failed to create data dir:', err); }
  }
}

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
function ensureUploadsDir() {
  ensureDataDir();
  if (!fs.existsSync(UPLOADS_DIR)) {
    try { fs.mkdirSync(UPLOADS_DIR, { recursive: true }); } catch (err) { console.warn('Failed to create uploads dir:', err); }
  }
}

ensureUploadsDir();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_DIR);
  },
  filename: function (req, file, cb) {
    const safe = Date.now() + '-' + file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, safe);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB

async function readAboutFile() {
  try {
    ensureDataDir();
    if (!fs.existsSync(ABOUT_FILE)) return null;
    const txt = fs.readFileSync(ABOUT_FILE, 'utf8');
    return JSON.parse(txt || 'null');
  } catch (err) {
    console.warn('readAboutFile error:', err);
    return null;
  }
}

async function writeAboutFile(obj) {
  try {
    ensureDataDir();
    fs.writeFileSync(ABOUT_FILE, JSON.stringify(obj || {}, null, 2), 'utf8');
    return obj;
  } catch (err) {
    console.warn('writeAboutFile error:', err);
    return null;
  }
}

async function readHomepageFile() {
  try {
    ensureDataDir();
    if (!fs.existsSync(HOME_FILE)) return null;
    const txt = fs.readFileSync(HOME_FILE, 'utf8');
    return JSON.parse(txt || 'null');
  } catch (err) {
    console.warn('readHomepageFile error:', err);
    return null;
  }
}

async function writeHomepageFile(obj) {
  try {
    ensureDataDir();
    fs.writeFileSync(HOME_FILE, JSON.stringify(obj || {}, null, 2), 'utf8');
    return obj;
  } catch (err) {
    console.warn('writeHomepageFile error:', err);
    return null;
  }
}

async function readServicesFile() {
  try {
    ensureDataDir();
    if (!fs.existsSync(SERVICES_FILE)) return [];
    const txt = fs.readFileSync(SERVICES_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    console.warn('readServicesFile error:', err);
    return [];
  }
}

async function writeServicesFile(arr) {
  try {
    ensureDataDir();
    fs.writeFileSync(SERVICES_FILE, JSON.stringify(arr || [], null, 2), 'utf8');
    return arr;
  } catch (err) {
    console.warn('writeServicesFile error:', err);
    return null;
  }
}

const app = express();
// Defensive PORT parsing: handle values like "3000 ;" or non-numeric env values
const rawPort = process.env.PORT;
const PORT = (() => {
  if (!rawPort) return 3000;
  // parseInt will extract leading number from strings like '3000 ;'
  const p = parseInt(String(rawPort).trim(), 10);
  return Number.isNaN(p) ? 3000 : p;
})();

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
    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('homepage')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        try { await writeHomepageFile(data); } catch (e) { /* ignore */ }
        return res.json({ success: true, data });
      }
      // no data in supabase -> fallthrough
    } catch (supErr) {
      console.warn('Supabase get /api/homepage failed, falling back to file:', supErr && supErr.message);
    }

    // File fallback
    const fileData = await readHomepageFile();
    return res.json({ success: true, data: fileData || null });
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
    // Try Supabase first but keep local backup
    try {
      const { data: existing } = await supabase
        .from('homepage')
        .select('id')
        .limit(1)
        .single();

      let result;
      if (existing) {
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

      // Write a local backup (best-effort)
      try { await writeHomepageFile(result); } catch (e) { console.warn('Failed to write local homepage backup:', e); }

      return res.json({ success: true, data: result });
    } catch (supErr) {
      console.warn('Supabase write /api/homepage failed, using local file fallback:', supErr && supErr.message);

      const fallback = {
        title: title || '',
        subtitle: subtitle || '',
        description: description || '',
        hero_image: hero_image || null,
        stats: stats || null,
        updated_at: new Date().toISOString()
      };

      const saved = await writeHomepageFile(fallback);
      if (saved) return res.json({ success: true, data: saved });

      throw supErr;
    }
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
    // Try Supabase first
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

      // If supabase has data, return it and also write a local backup
      if (data) {
        try { await writeAboutFile(data); } catch (e) { /* ignore */ }
        return res.json({ success: true, data });
      }
      // No data in supabase -> fallthrough to file fallback
    } catch (supErr) {
      console.warn('Supabase get /api/about failed, falling back to file:', supErr && supErr.message);
      // fall through to file fallback
    }

    // File fallback
    const fileData = await readAboutFile();
    return res.json({ success: true, data: fileData || null });
  } catch (error) {
    console.error('Get about error:', error);
    res.status(500).json({ error: 'Failed to fetch about content' });
  }
});

// Create or Update about content
app.post('/api/about', authenticateToken, async (req, res) => {
  try {
    const { mission, vision, values, journey, team } = req.body;
    // Try Supabase first, but always keep a local backup
    try {
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

      // Write a local backup (best-effort)
      try { await writeAboutFile(result); } catch (e) { console.warn('Failed to write local about backup:', e); }

      return res.json({ success: true, data: result });
    } catch (supErr) {
      console.warn('Supabase write /api/about failed, using local file fallback:', supErr && supErr.message);

      // Try to persist to local file as fallback
      const fallback = {
        mission: mission || '',
        vision: vision || '',
        values: values || '',
        journey: journey || null,
        team: team || null,
        updated_at: new Date().toISOString()
      };

      const saved = await writeAboutFile(fallback);
      if (saved) {
        return res.json({ success: true, data: saved });
      }

      // If even file write failed, return error
      throw supErr;
    }
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
    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Write local backup of services (best-effort)
      try { await writeServicesFile(data || []); } catch (e) { /* ignore */ }
      return res.json({ success: true, data: data || [] });
    } catch (supErr) {
      console.warn('Supabase get /api/services failed, falling back to file:', supErr && supErr.message);
    }

    // File fallback
    const fileData = await readServicesFile();
    res.json({ success: true, data: fileData || [] });
  } catch (error) {
    console.error('Get services error:', error);
    res.status(500).json({ error: 'Failed to fetch services' });
  }
});

// Get single service by ID
app.get('/api/services/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Try Supabase first
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return res.json({ success: true, data });
    } catch (supErr) {
      console.warn('Supabase get /api/services/:id failed, falling back to file:', supErr && supErr.message);
    }

    // File fallback
    const list = await readServicesFile();
    const found = list.find(s => String(s.id) === String(id));
    return res.json({ success: true, data: found || null });
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
    // Try Supabase first
    try {
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

      // Append to local backup list (best-effort)
      try {
        const list = await readServicesFile();
        // Supabase returns the created record (may have numeric id)
        list.unshift(data);
        await writeServicesFile(list);
      } catch (e) { /* ignore */ }

      return res.json({ success: true, data });
    } catch (supErr) {
      console.warn('Supabase write /api/services failed, falling back to file:', supErr && supErr.message);

      // Fallback to local file
      const list = await readServicesFile();
      const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      const now = new Date().toISOString();
      const entry = {
        id,
        title,
        description,
        icon: icon || null,
        features: features || null,
        benefits: benefits || null,
        category: category || null,
        created_at: now,
        updated_at: now
      };

      list.unshift(entry);
      const saved = await writeServicesFile(list);
      if (saved) return res.json({ success: true, data: entry });

      throw supErr;
    }
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
    // Try Supabase first
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Remove from local backup list (best-effort)
      try {
        const list = await readServicesFile();
        const filtered = list.filter(s => String(s.id) !== String(id));
        await writeServicesFile(filtered);
      } catch (e) { /* ignore */ }

      return res.json({ success: true, message: 'Service deleted successfully' });
    } catch (supErr) {
      console.warn('Supabase delete /api/services/:id failed, attempting local-file delete:', supErr && supErr.message);

      // File fallback: remove by id from services file
      const list = await readServicesFile();
      const filtered = list.filter(s => String(s.id) !== String(id));
      await writeServicesFile(filtered);
      return res.json({ success: true, message: 'Service deleted (local fallback)' });
    }
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
// JOB APPLICATION UPLOAD
// ========================================

// Save applications to local data/applications.json as fallback
const APPLICATIONS_FILE = path.join(DATA_DIR, 'applications.json');
function readApplicationsFile() {
  try {
    ensureDataDir();
    if (!fs.existsSync(APPLICATIONS_FILE)) return [];
    const txt = fs.readFileSync(APPLICATIONS_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    console.warn('readApplicationsFile error:', err);
    return [];
  }
}

function writeApplicationsFile(arr) {
  try {
    ensureDataDir();
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(arr || [], null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn('writeApplicationsFile error:', err);
    return false;
  }
}

app.post('/api/apply', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, message, position } = req.body;
    const file = req.file;

    if (!name || !email || !file || !position) {
      // minimal validation
      return res.status(400).json({ error: 'Name, email, position and resume are required' });
    }

    const record = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      name,
      email,
      phone: phone || null,
      message: message || null,
      position,
      resume_path: path.relative(__dirname, file.path),
      original_filename: file.originalname,
      uploaded_at: new Date().toISOString()
    };

    // Try to insert into Supabase 'applications' table; fallback to local file
    try {
      const { data, error } = await supabase
        .from('applications')
        .insert([record])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // keep local backup too
      const list = readApplicationsFile();
      list.unshift(data);
      writeApplicationsFile(list);

      return res.json({ success: true, message: 'Application submitted successfully (Supabase)', data });
    } catch (supErr) {
      // Supabase might not have the table; fallback to file
      console.warn('Supabase insert failed for /api/apply, saving locally:', supErr && supErr.message);
      const list = readApplicationsFile();
      list.unshift(record);
      writeApplicationsFile(list);
      return res.json({ success: true, message: 'Application submitted successfully (local backup)' });
    }
  } catch (err) {
    console.error('Application upload error:', err);
    res.status(500).json({ error: 'Failed to submit application' });
  }
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

