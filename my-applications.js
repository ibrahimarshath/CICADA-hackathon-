// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// Check authentication and load applications
document.addEventListener('DOMContentLoaded', async () => {
  // Check if user is logged in
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  updateUI();
  if (currentUser) {
    await loadApplications();
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    updateUI();
    if (currentUser) {
      loadApplications();
    } else {
      showLoginRequired();
    }
  });
});

function updateUI() {
  const logoutBtn = document.getElementById('logoutBtn');
  const loginBtn = document.getElementById('loginBtn');
  const applicationsList = document.getElementById('applicationsList');
  const loginRequired = document.getElementById('loginRequired');

  if (currentUser) {
    logoutBtn.style.display = 'inline-flex';
    loginBtn.style.display = 'none';
    applicationsList.style.display = 'block';
    loginRequired.style.display = 'none';

    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
      toast.info('You have been logged out');
      window.location.reload();
    };
  } else {
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'inline-flex';
    applicationsList.style.display = 'none';
    loginRequired.style.display = 'block';

    loginBtn.onclick = () => {
      window.location.href = 'index.html';
    };
  }
}

function showLoginRequired() {
  const applicationsList = document.getElementById('applicationsList');
  applicationsList.innerHTML = '';
}

async function loadApplications() {
  const applicationsList = document.getElementById('applicationsList');
  applicationsList.innerHTML = `
    <div style="text-align: center; padding: 3rem; color: var(--gray);">
      <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
      <p>Loading your applications...</p>
    </div>
  `;

  try {
    // Fetch applications for current user
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          id,
          title,
          location,
          type,
          department
        )
      `)
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (applications && applications.length > 0) {
      applicationsList.innerHTML = applications.map(app => {
        const job = app.jobs;
        const statusColors = {
          'pending': { bg: 'var(--light)', color: 'var(--accent)', icon: 'fa-clock' },
          'reviewing': { bg: 'var(--primary-light)', color: 'var(--primary-dark)', icon: 'fa-eye' },
          'accepted': { bg: '#d1fae5', color: '#065f46', icon: 'fa-check-circle' },
          'rejected': { bg: '#fee2e2', color: '#991b1b', icon: 'fa-times-circle' }
        };
        const statusStyle = statusColors[app.status] || statusColors.pending;

        return `
          <div class="job-card">
            <div class="job-header">
              <div>
                <h4>${job?.title || 'Position'}</h4>
                <div class="job-meta">
                  ${job?.location ? `<span><i class="fas fa-map-marker-alt"></i> ${job.location}</span>` : ''}
                  ${job?.type ? `<span><i class="fas fa-briefcase"></i> ${job.type}</span>` : ''}
                  ${job?.department ? `<span><i class="fas fa-building"></i> ${job.department}</span>` : ''}
                  <span><i class="fas fa-calendar"></i> Applied ${new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem;">
                <span class="tag" style="background: ${statusStyle.bg}; color: ${statusStyle.color};">
                  <i class="fas ${statusStyle.icon}"></i> ${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                </span>
                ${job ? `<a href="job.html?id=${job.id}" class="btn btn-outline" style="white-space: nowrap;">View Job</a>` : ''}
              </div>
            </div>
            
            <div style="margin-top: 1rem; padding: 1rem; background: white; border-radius: var(--radius-lg); border-left: 4px solid var(--primary);">
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div>
                  <strong style="color: var(--dark);">Application ID:</strong>
                  <p style="color: var(--gray); margin: 0.25rem 0 0 0; font-size: 0.875rem;">${app.id.substring(0, 8)}...</p>
                </div>
                <div>
                  <strong style="color: var(--dark);">Email:</strong>
                  <p style="color: var(--gray); margin: 0.25rem 0 0 0; font-size: 0.875rem;">${app.email}</p>
                </div>
                ${app.phone ? `
                <div>
                  <strong style="color: var(--dark);">Phone:</strong>
                  <p style="color: var(--gray); margin: 0.25rem 0 0 0; font-size: 0.875rem;">${app.phone}</p>
                </div>
                ` : ''}
              </div>
              
              ${app.cover_letter ? `
                <div style="margin-top: 1rem;">
                  <strong style="color: var(--dark);">Cover Letter:</strong>
                  <p style="color: var(--gray); margin: 0.5rem 0 0 0; line-height: 1.6;">${app.cover_letter.substring(0, 200)}${app.cover_letter.length > 200 ? '...' : ''}</p>
                </div>
              ` : ''}
              
              ${app.resume_url ? `
                <div style="margin-top: 1rem;">
                  <a href="${app.resume_url}" target="_blank" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                    <i class="fas fa-file-pdf"></i> View Resume
                  </a>
                </div>
              ` : ''}
            </div>
          </div>
        `;
      }).join('');
    } else {
      applicationsList.innerHTML = `
        <div style="text-align: center; padding: 4rem; background: var(--light); border-radius: var(--radius-xl);">
          <i class="fas fa-inbox" style="font-size: 4rem; color: var(--gray-light); margin-bottom: 1.5rem;"></i>
          <h3 style="color: var(--dark); margin-bottom: 1rem;">No Applications Yet</h3>
          <p style="color: var(--gray); margin-bottom: 2rem;">You haven't applied for any positions yet. Browse our open positions and apply today!</p>
          <a href="jobs.html" class="btn btn-primary">
            <i class="fas fa-briefcase"></i> Browse Jobs
          </a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading applications:', error);
    applicationsList.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--secondary);">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>Failed to load applications. Please try again later.</p>
      </div>
    `;
  }
}

