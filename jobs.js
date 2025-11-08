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
            <a href="job.html?id=${job.id}" class="btn btn-primary apply-btn">Apply Now</a>
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

