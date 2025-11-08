// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

// Use anon key - RLS is disabled, so anon key has full access to all tables
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Get job ID from URL
const urlParams = new URLSearchParams(window.location.search);
const jobId = urlParams.get('id');

let currentUser = null;

// Check authentication on load
document.addEventListener('DOMContentLoaded', async () => {
  if (!jobId) {
    window.location.href = 'jobs.html';
    return;
  }

  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  await loadJobDetails();
  checkAuthAndShowForm();

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    checkAuthAndShowForm();
    
    if (event === 'SIGNED_IN') {
      toast.success('Welcome back!');
    } else if (event === 'SIGNED_OUT') {
      toast.info('You have been logged out');
    }
  });
});

async function loadJobDetails() {
  const jobDetails = document.getElementById('jobDetails');
  
  try {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;

    if (job) {
      jobDetails.innerHTML = `
        <div style="margin-bottom: 2rem;">
          <a href="jobs.html" style="color: var(--primary-dark); text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; margin-bottom: 1.5rem;">
            <i class="fas fa-arrow-left"></i> Back to Jobs
          </a>
          <h1 style="color: var(--dark); margin-bottom: 1rem;">${job.title}</h1>
          <div class="job-meta" style="margin-bottom: 1.5rem;">
            <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
            <span><i class="fas fa-briefcase"></i> ${job.type}</span>
            ${job.salary_range ? `<span><i class="fas fa-dollar-sign"></i> ${job.salary_range}</span>` : ''}
            ${job.department ? `<span><i class="fas fa-building"></i> ${job.department}</span>` : ''}
          </div>
        </div>

        <div style="margin-bottom: 2rem;">
          <h3 style="color: var(--primary-dark); margin-bottom: 1rem;">Job Description</h3>
          <p style="color: var(--gray); line-height: 1.8;">${job.description}</p>
        </div>

        ${job.responsibilities && job.responsibilities.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--primary-dark); margin-bottom: 1rem;">Key Responsibilities</h3>
            <ul style="color: var(--gray); line-height: 1.8; padding-left: 1.5rem;">
              ${job.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${job.requirements && job.requirements.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--primary-dark); margin-bottom: 1rem;">Requirements</h3>
            <ul style="color: var(--gray); line-height: 1.8; padding-left: 1.5rem;">
              ${job.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${job.skills && job.skills.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--primary-dark); margin-bottom: 1rem;">Required Skills</h3>
            <div class="job-tags">
              ${job.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}
      `;

      document.getElementById('jobId').value = job.id;
    } else {
      jobDetails.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: var(--secondary); margin-bottom: 1rem;"></i>
          <h3 style="color: var(--dark); margin-bottom: 1rem;">Job Not Found</h3>
          <p style="color: var(--gray); margin-bottom: 1.5rem;">The job you're looking for doesn't exist or has been removed.</p>
          <a href="jobs.html" class="btn btn-primary">View All Jobs</a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading job:', error);
    jobDetails.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--secondary);">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>Failed to load job details. Please try again later.</p>
      </div>
    `;
  }
}

function checkAuthAndShowForm() {
  const applicationSection = document.getElementById('applicationSection');
  const loginPrompt = document.getElementById('loginPrompt');

  if (currentUser) {
    // User is logged in - show application form
    applicationSection.style.display = 'block';
    loginPrompt.style.display = 'none';
  } else {
    // User not logged in - show login prompt
    applicationSection.style.display = 'none';
    loginPrompt.style.display = 'block';
  }
}

// Show selected file name
document.getElementById('resume').addEventListener('change', (e) => {
  const fileName = e.target.files[0]?.name;
  const fileNameDisplay = document.getElementById('resumeFileName');
  if (fileName) {
    fileNameDisplay.textContent = `Selected: ${fileName}`;
    fileNameDisplay.style.color = 'var(--primary-dark)';
  } else {
    fileNameDisplay.textContent = '';
  }
});

function showLoginModal() {
  const authModal = document.getElementById('authModal');
  authModal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeAuthModal() {
  const authModal = document.getElementById('authModal');
  authModal.classList.remove('active');
  document.body.style.overflow = '';
}

function showSignup() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('signupForm').style.display = 'block';
}

function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('signupForm').style.display = 'none';
}

// Handle login form submission in job.html
document.getElementById('userLoginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    });

    if (error) {
      if (error.message.includes('Email not confirmed') || error.message.includes('email_not_confirmed')) {
        toast.error('Please verify your email before logging in. Check your inbox for a confirmation link.');
        return;
      } else if (error.message.includes('Invalid login credentials') || error.message.includes('invalid_credentials')) {
        toast.error('Invalid email or password. Please try again.');
        return;
      } else {
        throw error;
      }
    }

    if (!authData?.session && !authData?.user) {
      throw new Error('Login failed: No session created');
    }

    toast.success('Login successful!');
    closeAuthModal();
    // Auth state change will automatically show the form
  } catch (error) {
    console.error('Login error:', error);
    toast.error(error.message || 'Login failed. Please check your credentials.');
  }
});

// Handle signup form submission in job.html
document.getElementById('userSignupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);
  
  if (data.password !== data.confirmPassword) {
    toast.error('Passwords do not match!');
    return;
  }

  if (data.password.length < 6) {
    toast.error('Password must be at least 6 characters long');
    return;
  }
  
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          full_name: data.name
        },
        emailRedirectTo: window.location.origin
      }
    });

    if (error) {
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        toast.error('An account with this email already exists. Please log in instead.');
        showLogin();
        return;
      } else {
        throw error;
      }
    }

    // Create profile entry after signup
    if (authData.user) {
      try {
        await supabase.from('profiles').insert({
          id: authData.user.id,
          full_name: data.name,
          is_admin: false
        });
      } catch (profileError) {
        console.warn('Could not create profile:', profileError);
        // Profile might already exist or table doesn't exist yet
      }
    }

    if (authData.user && !authData.session) {
      toast.success('Account created successfully! Please check your email to verify your account before logging in.');
    } else {
      toast.success('Account created successfully! You can now log in.');
    }
    
    showLogin();
    e.target.reset();
  } catch (error) {
    console.error('Signup error:', error);
    toast.error(error.message || 'Failed to create account. Please try again.');
  }
});

// Handle application form submission
document.getElementById('applicationForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const formData = new FormData(form);
  const resumeFile = formData.get('resume');
  
  if (!resumeFile || resumeFile.size === 0) {
    toast.error('Please upload your resume');
    return;
  }

  // Validate file type
  const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  if (!allowedTypes.includes(resumeFile.type)) {
    toast.error('Resume must be a PDF, DOC, or DOCX file');
    return;
  }

  // Validate file size (max 5MB)
  if (resumeFile.size > 5 * 1024 * 1024) {
    toast.error('Resume file size must be less than 5MB');
    return;
  }

  const submitBtn = form.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

  try {
    // Get user ID (must be logged in to apply)
    if (!currentUser) {
      toast.error('Please log in to apply for this position');
      showLoginModal();
      return;
    }

    const userId = currentUser.id;
    const jobId = formData.get('jobId');

    // Step 1: Upload resume to Supabase Storage
    const path = `user/${userId}/${jobId}/${Date.now()}-${resumeFile.name}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(path, resumeFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      if (uploadError.message.includes('Bucket not found') || uploadError.message.includes('new row violates')) {
        throw new Error('Storage bucket not configured. Please contact administrator or check STORAGE_SETUP.md');
      }
      throw new Error('Failed to upload resume: ' + uploadError.message);
    }

    // Step 2: Get public URL for resume
    const { data: urlData } = await supabase.storage
      .from('resumes')
      .getPublicUrl(path);
    
    const publicUrl = urlData?.publicUrl || '';

    // Step 3: Insert application into database
    const applicationData = {
      job_id: jobId,
      user_id: currentUser.id,
      candidate_id: currentUser.id,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      cover_letter: formData.get('cover_letter') || null,
      resume_path: path, // Store the path for signed URL generation
      resume_url: publicUrl,
      status: 'pending'
    };

    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (insertError) throw insertError;

    // Step 4: Show success popup/modal
    showApplicationSuccessModal(applicationData.name, document.querySelector('#jobDetails h1')?.textContent?.trim() || 'Position');
    
    form.reset();
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

  } catch (error) {
    console.error('Error submitting application:', error);
    toast.error(error.message || 'Failed to submit application. Please try again.');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
});

// Show application success modal
function showApplicationSuccessModal(name, jobTitle) {
  const modal = document.createElement('div');
  modal.id = 'applicationSuccessModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    animation: fadeIn 0.3s ease;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: var(--radius-xl);
      padding: 3rem;
      max-width: 500px;
      width: 90%;
      text-align: center;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s ease;
    ">
      <div style="
        width: 80px;
        height: 80px;
        background: var(--gradient-success);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 1.5rem;
        animation: scaleIn 0.5s ease;
      ">
        <i class="fas fa-check" style="font-size: 2.5rem; color: white;"></i>
      </div>
      <h2 style="color: var(--dark); margin-bottom: 1rem; font-size: 1.75rem;">Application Submitted!</h2>
      <p style="color: var(--gray); margin-bottom: 1.5rem; line-height: 1.6;">
        Thank you, <strong>${name}</strong>! Your application for <strong>${jobTitle}</strong> has been submitted successfully.
      </p>
      <p style="color: var(--gray); margin-bottom: 2rem; font-size: 0.9rem;">
        We will review your application and get back to you soon. You can track your application status in your profile.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="closeApplicationSuccessModal()" class="btn btn-primary" style="min-width: 150px;">
          <i class="fas fa-check"></i> OK
        </button>
        <a href="profile.html" class="btn btn-outline" style="min-width: 150px; color: var(--primary-dark); border-color: var(--primary-dark);">
          <i class="fas fa-user"></i> View Profile
        </a>
      </div>
    </div>
  `;
  
  // Add animations
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes scaleIn {
      from { transform: scale(0); }
      to { transform: scale(1); }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function closeApplicationSuccessModal() {
  const modal = document.getElementById('applicationSuccessModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// Make function globally available
window.closeApplicationSuccessModal = closeApplicationSuccessModal;

