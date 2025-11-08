// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// Get resume ID from URL
const urlParams = new URLSearchParams(window.location.search);
const resumeId = urlParams.get('id');

// Check authentication and load resume
document.addEventListener('DOMContentLoaded', async () => {
  if (!resumeId) {
    window.location.href = 'profile.html';
    return;
  }

  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  updateUI();
  if (currentUser) {
    await loadResume();
  } else {
    showLoginRequired();
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    updateUI();
    if (currentUser) {
      loadResume();
    } else {
      showLoginRequired();
    }
  });
});

function updateUI() {
  const logoutBtn = document.getElementById('logoutBtn');
  const loginBtn = document.getElementById('loginBtn');

  if (currentUser) {
    logoutBtn.style.display = 'inline-flex';
    loginBtn.style.display = 'none';

    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
      toast.info('You have been logged out');
      window.location.href = 'index.html';
    };
  } else {
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'inline-flex';

    loginBtn.onclick = () => {
      window.location.href = 'index.html';
    };
  }
}

function showLoginRequired() {
  const resumeDisplay = document.getElementById('resumeDisplay');
  resumeDisplay.innerHTML = `
    <div style="text-align: center; padding: 4rem;">
      <i class="fas fa-lock" style="font-size: 4rem; color: var(--primary-dark); margin-bottom: 1.5rem;"></i>
      <h3 style="color: var(--dark); margin-bottom: 1rem;">Login Required</h3>
      <p style="color: var(--gray); margin-bottom: 2rem;">Please log in to view this resume.</p>
      <a href="index.html" class="btn btn-primary">
        <i class="fas fa-sign-in-alt"></i> Go to Login
      </a>
    </div>
  `;
}

async function loadResume() {
  const resumeDisplay = document.getElementById('resumeDisplay');
  
  try {
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .eq('user_id', currentUser.id)
      .single();

    if (error) throw error;

    // Format education if it's JSON
    let educationText = '';
    if (resume.education) {
      if (typeof resume.education === 'string') {
        educationText = resume.education;
      } else {
        educationText = JSON.stringify(resume.education, null, 2);
      }
    }

    resumeDisplay.innerHTML = `
      <div style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
        <div style="text-align: center; margin-bottom: 2rem; border-bottom: 3px solid var(--primary-dark); padding-bottom: 1rem;">
          <h1 style="color: var(--primary-dark); margin-bottom: 0.5rem; font-size: 2.5rem;">${resume.name || 'Resume'}</h1>
          ${resume.latest_active ? '<span class="tag" style="background: var(--primary-light); color: var(--primary-dark);">Active Resume</span>' : ''}
        </div>
        
        <div style="margin-bottom: 2rem; text-align: center; color: #666;">
          <p style="margin: 0.5rem 0;"><i class="fas fa-envelope"></i> ${resume.email || 'N/A'}</p>
          ${resume.phone ? `<p style="margin: 0.5rem 0;"><i class="fas fa-phone"></i> ${resume.phone}</p>` : ''}
          <p style="margin: 0.5rem 0;"><i class="fas fa-calendar"></i> Created: ${new Date(resume.created_at).toLocaleDateString()}</p>
          ${resume.updated_at ? `<p style="margin: 0.5rem 0;"><i class="fas fa-edit"></i> Updated: ${new Date(resume.updated_at).toLocaleDateString()}</p>` : ''}
        </div>

        ${resume.ai_summary ? `
          <div style="margin-bottom: 2rem; padding: 1rem; background: var(--primary-light); border-left: 4px solid var(--primary-dark); border-radius: var(--radius-md);">
            <h3 style="color: var(--primary-dark); margin-bottom: 0.5rem;">
              <i class="fas fa-magic"></i> AI Summary
            </h3>
            <p style="color: var(--dark); white-space: pre-line;">${resume.ai_summary}</p>
          </div>
        ` : ''}

        ${resume.experience ? `
          <div style="margin-bottom: 2rem;">
            <h2 style="color: var(--primary-dark); border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <i class="fas fa-briefcase"></i> Professional Summary / Experience
            </h2>
            <div style="white-space: pre-line; text-align: justify;">${resume.experience}</div>
          </div>
        ` : ''}

        ${resume.skills && resume.skills.length > 0 ? `
          <div style="margin-bottom: 2rem;">
            <h2 style="color: var(--primary-dark); border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <i class="fas fa-tools"></i> Skills
            </h2>
            <div class="job-tags">
              ${resume.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
          </div>
        ` : ''}

        ${educationText ? `
          <div style="margin-bottom: 2rem;">
            <h2 style="color: var(--primary-dark); border-bottom: 2px solid var(--primary-light); padding-bottom: 0.5rem; margin-bottom: 1rem;">
              <i class="fas fa-graduation-cap"></i> Education
            </h2>
            <div style="white-space: pre-line;">${educationText}</div>
          </div>
        ` : ''}

        <div style="margin-top: 3rem; padding-top: 2rem; border-top: 2px solid var(--gray-light); display: flex; gap: 1rem; justify-content: center;">
          <a href="resume-builder.html?id=${resume.id}" class="btn btn-primary">
            <i class="fas fa-edit"></i> Edit Resume
          </a>
          <button onclick="window.print()" class="btn btn-outline">
            <i class="fas fa-print"></i> Print
          </button>
        </div>
      </div>
    `;
  } catch (error) {
    console.error('Error loading resume:', error);
    resumeDisplay.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: var(--secondary);">
        <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 1.5rem;"></i>
        <h3 style="color: var(--dark); margin-bottom: 1rem;">Resume Not Found</h3>
        <p style="color: var(--gray); margin-bottom: 2rem;">The resume you're looking for doesn't exist or you don't have permission to view it.</p>
        <a href="profile.html" class="btn btn-primary">
          <i class="fas fa-arrow-left"></i> Back to Profile
        </a>
      </div>
    `;
  }
}

