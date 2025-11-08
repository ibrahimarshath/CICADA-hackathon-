const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("✅ Admin Login - Supabase initialized");

// Admin login form handler
const adminLoginForm = document.getElementById('adminLoginForm');
const loginMsg = document.getElementById('loginMsg');

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(adminLoginForm);
    const email = formData.get('email');
    const password = formData.get('password');
    
    // Clear previous messages
    if (loginMsg) {
      loginMsg.textContent = '';
      loginMsg.className = 'msg';
    }
    
    try {
      console.log('Attempting admin login with:', email);
      
      // Use Supabase Auth for admin login
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', authData);

      // Check if user has admin role in metadata
      const userRole = authData.user?.user_metadata?.role;
      console.log('User role:', userRole);
      
      if (userRole !== 'admin') {
        console.warn('Access denied - not an admin user');
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }

      // Store session info
      localStorage.setItem('adminSession', JSON.stringify(authData));
      localStorage.setItem('adminUser', JSON.stringify(authData.user));
      
      // Show success message
      if (typeof toast !== 'undefined') {
        toast.success('Admin login successful! Redirecting...');
      } else if (loginMsg) {
        loginMsg.textContent = 'Admin login successful! Redirecting...';
        loginMsg.className = 'msg success';
      }

      // Redirect to admin dashboard
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 1000);
    } catch (error) {
      console.error('Admin login error:', error);
      if (typeof toast !== 'undefined') {
        toast.error(error.message || 'Admin login failed. Please check your credentials.');
      } else if (loginMsg) {
        loginMsg.textContent = error.message || 'Admin login failed. Please check your credentials.';
        loginMsg.className = 'msg error';
      }
    }
  });
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session && session.user) {
      const userRole = session.user.user_metadata?.role;
      if (userRole === 'admin') {
        // Already logged in as admin, redirect to admin page
        console.log('Already logged in as admin, redirecting...');
        window.location.href = 'admin.html';
      }
    }
  } catch (error) {
    console.error('Session check error:', error);
  }
});
