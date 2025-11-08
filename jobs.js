// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Check auth state and update UI
async function updateAuthUI() {
  const { data: { user } } = await supabase.auth.getUser();
  const loginBtn = document.getElementById('loginBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const myApplicationsNav = document.getElementById('myApplicationsNav');

  if (user) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-flex';
    if (myApplicationsNav) myApplicationsNav.style.display = 'block';
    
    if (logoutBtn) {
      logoutBtn.onclick = async () => {
        await supabase.auth.signOut();
        window.location.reload();
      };
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (myApplicationsNav) myApplicationsNav.style.display = 'none';
    
    if (loginBtn) {
      loginBtn.onclick = () => {
        window.location.href = 'index.html';
      };
    }
  }
}

// Load jobs on page load
document.addEventListener('DOMContentLoaded', async () => {
  await updateAuthUI();
  await loadJobs();
  
  // Set up real-time subscription for jobs
  setupRealtimeSubscriptions();
});

// Real-time subscriptions for jobs
function setupRealtimeSubscriptions() {
  supabase
    .channel('jobs-list-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'jobs',
        filter: 'status=eq.open'
      },
      (payload) => {
        console.log('Job change detected:', payload.eventType);
        loadJobs();
      }
    )
    .subscribe();

  console.log('✅ Real-time subscriptions set up for jobs');
}

// Global variable to store current job being applied for
let currentJobId = null;
let currentJobData = null;

// Open apply modal
async function openApplyModal(jobId) {
  currentJobId = jobId;
  
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    toast.error('Please log in to apply for this position');
    window.location.href = 'index.html';
    return;
  }

  // Fetch job details
  try {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) throw error;
    currentJobData = job;

    // Show modal with job details
    showApplyModal(job);
    
    // Load user's resumes
    await loadUserResumes();
  } catch (error) {
    console.error('Error loading job:', error);
    toast.error('Failed to load job details');
  }
}

// Show apply modal
function showApplyModal(job) {
  const modal = document.createElement('div');
  modal.id = 'applyJobModal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 2rem;
    overflow-y: auto;
    animation: fadeIn 0.3s ease;
  `;

  modal.innerHTML = `
    <div style="
      background: white;
      border-radius: var(--radius-xl);
      max-width: 800px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: var(--shadow-xl);
      animation: slideUp 0.3s ease;
      position: relative;
    ">
      <button onclick="closeApplyModal()" style="
        position: absolute;
        top: 1rem;
        right: 1rem;
        background: var(--light);
        border: none;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 1.5rem;
        color: var(--gray);
        transition: var(--transition);
        z-index: 10;
      " onmouseover="this.style.background='var(--secondary)'; this.style.color='white'" onmouseout="this.style.background='var(--light)'; this.style.color='var(--gray)'">
        <i class="fas fa-times"></i>
      </button>

      <div style="padding: 3rem;">
        <!-- Job Details Header -->
        <div style="margin-bottom: 2rem; border-bottom: 2px solid var(--light); padding-bottom: 1.5rem;">
          <h2 style="color: var(--dark); margin-bottom: 1rem; font-size: 2rem;">${job.title}</h2>
          <div style="display: flex; flex-wrap: wrap; gap: 1rem; color: var(--gray);">
            <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
            <span><i class="fas fa-briefcase"></i> ${job.type}</span>
            ${job.department ? `<span><i class="fas fa-building"></i> ${job.department}</span>` : ''}
            ${job.salary_range ? `<span><i class="fas fa-dollar-sign"></i> ${job.salary_range}</span>` : ''}
          </div>
        </div>

        <!-- Job Description -->
        <div style="margin-bottom: 2rem;">
          <h3 style="color: var(--dark); margin-bottom: 1rem; font-size: 1.25rem;">
            <i class="fas fa-info-circle"></i> Job Description
          </h3>
          <p style="color: var(--gray); line-height: 1.8; white-space: pre-wrap;">${job.description || 'No description available.'}</p>
        </div>

        <!-- Requirements -->
        ${job.requirements && Array.isArray(job.requirements) && job.requirements.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--dark); margin-bottom: 1rem; font-size: 1.25rem;">
              <i class="fas fa-list-check"></i> Requirements
            </h3>
            <ul style="color: var(--gray); line-height: 1.8; padding-left: 1.5rem;">
              ${job.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        <!-- Skills -->
        ${job.skills && Array.isArray(job.skills) && job.skills.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--dark); margin-bottom: 1rem; font-size: 1.25rem;">
              <i class="fas fa-tools"></i> Required Skills
            </h3>
            <div style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${job.skills.map(skill => `<span class="tag" style="background: var(--primary-light); color: var(--primary-dark); padding: 0.5rem 1rem; border-radius: var(--radius);">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Resume Selection -->
        <div style="margin-bottom: 2rem; border-top: 2px solid var(--light); padding-top: 2rem;">
          <h3 style="color: var(--dark); margin-bottom: 1rem; font-size: 1.25rem;">
            <i class="fas fa-file-alt"></i> Select Your Resume
          </h3>
          <div id="resumesList" style="margin-bottom: 1.5rem;">
            <div style="text-align: center; padding: 2rem; color: var(--gray);">
              <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
              <p>Loading your resumes...</p>
            </div>
          </div>
          <div style="text-align: center;">
            <a href="resume-builder.html" class="btn btn-outline" style="color: var(--primary-dark); border-color: var(--primary-dark);">
              <i class="fas fa-plus"></i> Create New Resume
            </a>
          </div>
        </div>

        <!-- Cover Letter (Optional) -->
        <div style="margin-bottom: 2rem;">
          <label style="display: block; color: var(--dark); font-weight: 600; margin-bottom: 0.5rem;">
            <i class="fas fa-envelope-open-text"></i> Cover Letter (Optional)
          </label>
          <textarea id="coverLetter" rows="6" placeholder="Tell us why you're a great fit for this position..." style="
            width: 100%;
            padding: 1rem;
            border: 2px solid var(--gray-light);
            border-radius: var(--radius-lg);
            font-family: inherit;
            font-size: 1rem;
            resize: vertical;
            transition: var(--transition);
          " onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--gray-light)'"></textarea>
        </div>

        <!-- Submit Button -->
        <div style="display: flex; gap: 1rem; justify-content: center;">
          <button onclick="closeApplyModal()" class="btn btn-outline" style="color: var(--gray); border-color: var(--gray-light); min-width: 150px;">
            <i class="fas fa-times"></i> Cancel
          </button>
          <button id="submitApplicationBtn" onclick="submitApplication()" class="btn btn-primary" style="min-width: 200px;" disabled>
            <i class="fas fa-paper-plane"></i> Submit Application
          </button>
        </div>
      </div>
    </div>
  `;

  // Add animations if not already added
  if (!document.getElementById('applyModalAnimations')) {
    const style = document.createElement('style');
    style.id = 'applyModalAnimations';
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
  }

  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

// Load user's resumes
async function loadUserResumes() {
  const resumesList = document.getElementById('resumesList');
  if (!resumesList) return;

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      resumesList.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: var(--secondary);">
          <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>Please log in to view your resumes</p>
        </div>
      `;
      return;
    }

    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (resumes && resumes.length > 0) {
      resumesList.innerHTML = resumes.map(resume => `
        <div class="resume-option" style="
          border: 2px solid var(--gray-light);
          border-radius: var(--radius-lg);
          padding: 1.5rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transition: var(--transition);
          background: var(--light);
        " onclick="selectResume('${resume.id}', this)" data-resume-id="${resume.id}">
          <div style="display: flex; justify-content: space-between; align-items: start;">
            <div style="flex: 1;">
              <h4 style="color: var(--dark); margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                ${resume.name || 'Untitled Resume'}
                ${resume.latest_active ? '<span style="background: var(--primary-light); color: var(--primary-dark); padding: 0.25rem 0.75rem; border-radius: var(--radius); font-size: 0.75rem; font-weight: 600;">Active</span>' : ''}
              </h4>
              <p style="color: var(--gray); margin-bottom: 0.5rem; font-size: 0.9rem;">
                <i class="fas fa-envelope"></i> ${resume.email}
              </p>
              <p style="color: var(--gray); font-size: 0.85rem;">
                <i class="fas fa-calendar"></i> Created ${new Date(resume.created_at).toLocaleDateString()}
              </p>
              ${resume.skills && Array.isArray(resume.skills) && resume.skills.length > 0 ? `
                <div style="margin-top: 0.75rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
                  ${resume.skills.slice(0, 5).map(skill => `<span style="background: white; color: var(--primary-dark); padding: 0.25rem 0.75rem; border-radius: var(--radius); font-size: 0.8rem;">${skill}</span>`).join('')}
                  ${resume.skills.length > 5 ? `<span style="color: var(--gray); font-size: 0.8rem;">+${resume.skills.length - 5} more</span>` : ''}
                </div>
              ` : ''}
            </div>
            <div style="margin-left: 1rem;">
              <i class="fas fa-check-circle" style="font-size: 1.5rem; color: var(--primary-dark); display: none;"></i>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      resumesList.innerHTML = `
        <div style="text-align: center; padding: 2rem; background: var(--light); border-radius: var(--radius-lg); border: 2px dashed var(--gray-light);">
          <i class="fas fa-file-alt" style="font-size: 3rem; color: var(--gray-light); margin-bottom: 1rem;"></i>
          <h4 style="color: var(--dark); margin-bottom: 0.5rem;">No Resumes Found</h4>
          <p style="color: var(--gray); margin-bottom: 1rem;">Create a resume in your profile to apply for jobs.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading resumes:', error);
    resumesList.innerHTML = `
      <div style="text-align: center; padding: 2rem; color: var(--secondary);">
        <i class="fas fa-exclamation-triangle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
        <p>Failed to load resumes. Please try again.</p>
      </div>
    `;
  }
}

// Selected resume ID
let selectedResumeId = null;

// Select resume
function selectResume(resumeId, element) {
  // Remove previous selection
  document.querySelectorAll('.resume-option').forEach(opt => {
    opt.style.borderColor = 'var(--gray-light)';
    opt.style.background = 'var(--light)';
    opt.querySelector('.fa-check-circle').style.display = 'none';
  });

  // Mark as selected
  element.style.borderColor = 'var(--primary-dark)';
  element.style.background = 'var(--primary-light)';
  element.querySelector('.fa-check-circle').style.display = 'block';
  selectedResumeId = resumeId;

  // Enable submit button
  const submitBtn = document.getElementById('submitApplicationBtn');
  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';
  }
}

// Submit application
async function submitApplication() {
  if (!selectedResumeId || !currentJobId) {
    toast.error('Please select a resume');
    return;
  }

  const submitBtn = document.getElementById('submitApplicationBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('Please log in to apply');
    }

    // Get resume data
    const { data: resume, error: resumeError } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', selectedResumeId)
      .eq('user_id', user.id)
      .single();

    if (resumeError || !resume) {
      throw new Error('Resume not found');
    }

    // Get cover letter
    const coverLetter = document.getElementById('coverLetter')?.value || null;

    // Create application
    const applicationData = {
      job_id: currentJobId,
      user_id: user.id,
      candidate_id: user.id,
      name: resume.name || user.user_metadata?.full_name || user.email?.split('@')[0],
      email: resume.email || user.email,
      phone: resume.phone || null,
      cover_letter: coverLetter,
      resume_id: selectedResumeId,
      status: 'pending'
    };

    const { data: application, error: insertError } = await supabase
      .from('applications')
      .insert([applicationData])
      .select()
      .single();

    if (insertError) throw insertError;

    // Close modal
    closeApplyModal();

    // Show success modal
    showApplicationSuccessModal(applicationData.name, currentJobData?.title || 'Position');

  } catch (error) {
    console.error('Error submitting application:', error);
    toast.error(error.message || 'Failed to submit application. Please try again.');
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
}

// Close apply modal
function closeApplyModal() {
  const modal = document.getElementById('applyJobModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
      currentJobId = null;
      currentJobData = null;
      selectedResumeId = null;
    }, 300);
  }
}

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
    z-index: 10001;
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

// Make functions globally available
window.openApplyModal = openApplyModal;
window.closeApplyModal = closeApplyModal;
window.selectResume = selectResume;
window.submitApplication = submitApplication;
window.closeApplicationSuccessModal = closeApplicationSuccessModal;

async function loadJobs() {
  const jobsList = document.getElementById('jobsList');
  
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (jobs && jobs.length > 0) {
      jobsList.innerHTML = jobs.map(job => `
        <div class="job-card">
          <div class="job-header">
            <div>
              <h4>${job.title}</h4>
              <div class="job-meta">
                <span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>
                <span><i class="fas fa-briefcase"></i> ${job.type}</span>
                ${job.salary_range ? `<span><i class="fas fa-dollar-sign"></i> ${job.salary_range}</span>` : ''}
              </div>
            </div>
            <button onclick="openApplyModal('${job.id}')" class="btn btn-primary apply-btn">Apply Now</button>
          </div>
          <p class="job-description">${job.description}</p>
          ${job.skills && job.skills.length > 0 ? `
            <div class="job-tags">
              ${job.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');
    } else {
      jobsList.innerHTML = `
        <div style="text-align: center; padding: 3rem; color: var(--gray);">
          <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 1rem; color: var(--gray-light);"></i>
          <p>No open positions at the moment. Check back soon!</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    jobsList.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--secondary);">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>Failed to load jobs. Please try again later.</p>
      </div>
    `;
  }
}

