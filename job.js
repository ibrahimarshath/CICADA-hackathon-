// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjUxNDI4NSwiZXhwIjoyMDc4MDkwMjg1fQ.j7liEK4JaMu74tQOBOu9ExkRbz87kz9NpZWsPppTP-o";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const supabaseAdmin = window.supabase.createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

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
    const fileExt = resumeFile.name.split('.').pop();
    const fileName = `${userId}/${jobId}/${Date.now()}.${fileExt}`;
    const filePath = fileName;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(filePath, resumeFile, {
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

    // Get public URL for the resume
    const { data: { publicUrl } } = supabase.storage
      .from('resumes')
      .getPublicUrl(filePath);

    // Step 2: Insert application into database
    const applicationData = {
      job_id: jobId,
      user_id: currentUser.id, // Use authenticated user ID
      candidate_id: currentUser.id, // Also set candidate_id for compatibility
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone') || null,
      cover_letter: formData.get('cover_letter') || null,
      resume_url: publicUrl,
      status: 'pending'
    };

    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (insertError) throw insertError;

    // Step 3: Call edge function to send confirmation email
    try {
      const edgeFunctionUrl = `https://jqxaufurcholgqwskybi.supabase.co/functions/v1/send-application-confirmation`;
      
      const emailResponse = await fetch(edgeFunctionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationData: {
            name: applicationData.name,
            email: applicationData.email,
            phone: applicationData.phone,
            position: document.querySelector('#jobDetails h1')?.textContent?.trim() || 'Position', // Job title
            resume_url: publicUrl
          }
        })
      });

      const emailResult = await emailResponse.json();
      if (!emailResponse.ok) {
        console.warn('Email sending failed:', emailResult);
        // Don't fail the application if email fails
      }
    } catch (emailError) {
      console.warn('Error sending confirmation email:', emailError);
      // Don't fail the application if email fails
    }

    // Step 4: Show success message
    toast.success('Application submitted successfully! We will review your application and get back to you soon.');
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

