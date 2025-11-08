// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;

// Check authentication and load profile
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  updateUI();
  if (currentUser) {
    await loadProfile();
    await loadResumes();
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    updateUI();
    if (currentUser) {
      loadProfile();
      loadResumes();
      setupRealtimeSubscriptions();
    } else {
      showLoginRequired();
    }
  });

  // Set up real-time subscription for resumes
  if (currentUser) {
    setupRealtimeSubscriptions();
  }
});

// Real-time subscriptions for resumes
function setupRealtimeSubscriptions() {
  if (!currentUser) return;

  supabase
    .channel('user-resumes-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'resumes',
        filter: `user_id=eq.${currentUser.id}`
      },
      (payload) => {
        console.log('Resume change detected:', payload.eventType);
        loadResumes();
      }
    )
    .subscribe();

  supabase
    .channel('user-profile-changes')
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${currentUser.id}`
      },
      (payload) => {
        console.log('Profile change detected:', payload.eventType);
        loadProfile();
      }
    )
    .subscribe();

  console.log('✅ Real-time subscriptions set up for profile');
}

function updateUI() {
  const logoutBtn = document.getElementById('logoutBtn');
  const loginBtn = document.getElementById('loginBtn');
  const profileSection = document.getElementById('profileSection');
  const loginRequired = document.getElementById('loginRequired');

  if (currentUser) {
    logoutBtn.style.display = 'inline-flex';
    loginBtn.style.display = 'none';
    profileSection.style.display = 'block';
    loginRequired.style.display = 'none';

    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
      toast.info('You have been logged out');
      window.location.reload();
    };
  } else {
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'inline-flex';
    profileSection.style.display = 'none';
    loginRequired.style.display = 'block';

    loginBtn.onclick = () => {
      window.location.href = 'index.html';
    };
  }
}

function showLoginRequired() {
  const profileSection = document.getElementById('profileSection');
  profileSection.style.display = 'none';
}

async function loadProfile() {
  try {
    // Get profile from profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    // Get email from auth user
    const email = currentUser.email;

    // Populate form
    document.getElementById('fullName').value = profile?.full_name || currentUser.user_metadata?.full_name || '';
    document.getElementById('email').value = email || '';

    // If profile doesn't exist, create it
    if (profileError && profileError.code === 'PGRST116') {
      try {
        await supabase.from('profiles').insert({
          id: currentUser.id,
          full_name: currentUser.user_metadata?.full_name || '',
          is_admin: false
        });
      } catch (insertError) {
        console.warn('Could not create profile:', insertError);
      }
    }
  } catch (error) {
    console.error('Error loading profile:', error);
    toast.error('Failed to load profile');
  }
}

// Handle form submission
document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const full_name = formData.get('full_name');

  try {
    // Update profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        id: currentUser.id,
        full_name,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    toast.success('Profile updated successfully!');
    await loadProfile(); // Reload immediately
  } catch (error) {
    console.error('Error updating profile:', error);
    toast.error('Failed to update profile');
  }
});

async function loadResumes() {
  const resumesList = document.getElementById('resumesList');
  resumesList.innerHTML = `
    <div style="text-align: center; padding: 2rem; color: var(--gray);">
      <i class="fas fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 1rem;"></i>
      <p>Loading resumes...</p>
    </div>
  `;

  try {
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (resumes && resumes.length > 0) {
      resumesList.innerHTML = resumes.map(resume => `
        <div class="job-card" style="margin-bottom: 1rem;">
          <div class="job-header">
            <div>
              <h4>${resume.name} ${resume.latest_active ? '<span class="tag" style="background: var(--primary-light); color: var(--primary-dark); margin-left: 0.5rem;">Active</span>' : ''}</h4>
              <div class="job-meta">
                <span><i class="fas fa-envelope"></i> ${resume.email}</span>
                ${resume.phone ? `<span><i class="fas fa-phone"></i> ${resume.phone}</span>` : ''}
                <span><i class="fas fa-calendar"></i> Created ${new Date(resume.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <div style="display: flex; gap: 0.5rem;">
              <a href="resume-builder.html?id=${resume.id}" class="btn btn-outline">
                <i class="fas fa-edit"></i> Edit
              </a>
              <a href="resume-view.html?id=${resume.id}" class="btn btn-primary">
                <i class="fas fa-eye"></i> View
              </a>
            </div>
          </div>
          ${resume.skills && resume.skills.length > 0 ? `
            <div class="job-tags" style="margin-top: 1rem;">
              ${resume.skills.map(skill => `<span class="tag">${skill}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('');

      resumesList.innerHTML += `
        <div style="margin-top: 1.5rem; text-align: center;">
          <a href="resume-builder.html" class="btn btn-primary">
            <i class="fas fa-plus"></i> Create New Resume
          </a>
        </div>
      `;
    } else {
      resumesList.innerHTML = `
        <div style="text-align: center; padding: 3rem; background: var(--light); border-radius: var(--radius-xl);">
          <i class="fas fa-file-alt" style="font-size: 3rem; color: var(--gray-light); margin-bottom: 1rem;"></i>
          <h3 style="color: var(--dark); margin-bottom: 1rem;">No Resumes Yet</h3>
          <p style="color: var(--gray); margin-bottom: 2rem;">Create your first resume to get started!</p>
          <a href="resume-builder.html" class="btn btn-primary">
            <i class="fas fa-plus"></i> Create Resume
          </a>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading resumes:', error);
    resumesList.innerHTML = `
      <div style="text-align: center; padding: 3rem; color: var(--secondary);">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem;"></i>
        <p>Failed to load resumes. Please try again later.</p>
      </div>
    `;
  }
}

