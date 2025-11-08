// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

// Use anon key - RLS is disabled, so anon key has full access to all tables
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Check authentication on page load
window.addEventListener('DOMContentLoaded', async () => {
  try {
    // Check Supabase auth session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      window.location.href = 'index.html';
    return;
  }

    if (!session || !session.user) {
      // Try to get user directly
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        window.location.href = 'index.html';
    return;
  }

      // If we have a user but no session, try to refresh
      const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();
      
      if (refreshError || !newSession) {
        window.location.href = 'index.html';
    return;
      }
    }

    const currentUser = session?.user || (await supabase.auth.getUser()).data?.user;
    
    if (!currentUser) {
      window.location.href = 'index.html';
    return;
  }

    // Check profile for admin status
    const ADMIN_EMAIL = 'admin@mastersolis-backend';
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', currentUser.id)
      .single();

    if (profileError || !profile) {
      // Profile doesn't exist, create it with admin status for admin email
      if (currentUser.email === ADMIN_EMAIL) {
        try {
          await supabase.from('profiles').insert({
            id: currentUser.id,
            full_name: currentUser.user_metadata?.full_name || 'Admin User',
            is_admin: true
          });
          // Allow access for admin email
        } catch (insertError) {
          console.warn('Could not create admin profile:', insertError);
          await supabase.auth.signOut();
          toast.error('Access denied. Admin privileges required.');
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
          return;
        }
      } else {
        await supabase.auth.signOut();
        toast.error('Access denied. Admin privileges required.');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
        return;
      }
    } else if (!profile.is_admin) {
      await supabase.auth.signOut();
      toast.error('Access denied. Admin privileges required.');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
    return;
  }

  // Load initial data
  loadStats();
  loadHomepage();
  loadAbout();
  loadServices();
  loadJobs();
  loadJobSelector();
  loadApplications(); // Load all applications on page load
  
  // Set up real-time subscriptions
  setupRealtimeSubscriptions();
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = 'index.html';
  }
});

// ========================================
// REALTIME SUBSCRIPTIONS
// ========================================

function setupRealtimeSubscriptions() {
  // Subscribe to services changes
  supabase
    .channel('services-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'services' },
      (payload) => {
        console.log('Services change detected:', payload.eventType);
        loadServices();
        loadStats(); // Update stats
      }
    )
    .subscribe();

  // Subscribe to jobs changes
  supabase
    .channel('jobs-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'jobs' },
      (payload) => {
        console.log('Jobs change detected:', payload.eventType);
        loadJobs();
        loadJobSelector(); // Refresh job selector
        loadStats(); // Update stats
      }
    )
    .subscribe();

  // Subscribe to contact messages changes
  supabase
    .channel('messages-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'contact_messages' },
      (payload) => {
        console.log('Messages change detected:', payload.eventType);
        loadMessages();
        loadStats(); // Update stats
      }
    )
    .subscribe();

  // Subscribe to applications changes
  supabase
    .channel('applications-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'applications' },
      (payload) => {
        console.log('Applications change detected:', payload.eventType);
        const jobSelector = document.getElementById('jobSelector');
        const jobId = jobSelector ? jobSelector.value || null : null;
        loadApplications(jobId);
        loadStats(); // Update stats
      }
    )
    .subscribe();

  // Subscribe to homepage changes
  supabase
    .channel('homepage-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'homepage' },
      (payload) => {
        console.log('Homepage change detected:', payload.eventType);
        loadHomepage();
      }
    )
    .subscribe();

  // Subscribe to about changes
  supabase
    .channel('about-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'about' },
      (payload) => {
        console.log('About change detected:', payload.eventType);
        loadAbout();
      }
    )
    .subscribe();

  console.log('✅ Real-time subscriptions set up');
}

// Show section
function showSection(sectionName) {
  // Hide all sections
  document.querySelectorAll('.admin-section').forEach(section => {
    section.classList.add('hidden');
  });

  // Remove active class from all nav buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active', 'border-primary-dark', 'text-primary-dark');
    btn.classList.add('border-transparent', 'text-gray');
  });

  // Show selected section
  const section = document.getElementById(`${sectionName}-section`);
  if (section) {
    section.classList.remove('hidden');
  }
  
  // Add active class to clicked button
  if (event && event.target) {
    event.target.classList.add('active', 'border-primary-dark', 'text-primary-dark');
    event.target.classList.remove('border-transparent', 'text-gray');
  }

  // Load data when switching sections
  if (sectionName === 'messages') {
    loadMessages();
  } else if (sectionName === 'services') {
    loadServices();
  } else if (sectionName === 'jobs') {
    loadJobs();
  } else if (sectionName === 'applications') {
    loadJobSelector();
    loadApplications(); // Load all applications when switching to applications tab
  } else if (sectionName === 'analytics') {
    fetchAnalytics(); // Load analytics when switching to analytics tab
  }
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem('adminSession');
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
}

// Load stats
async function loadStats() {
  try {
    const [messagesRes, servicesRes] = await Promise.all([
      supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
      supabase.from('services').select('id', { count: 'exact', head: true })
    ]);

    if (messagesRes.count !== null) {
      document.getElementById('messagesCount').textContent = messagesRes.count || 0;
    }

    if (servicesRes.count !== null) {
      document.getElementById('servicesCount').textContent = servicesRes.count || 0;
    }

    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString();
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// ========================================
// HOMEPAGE MANAGEMENT
// ========================================

async function loadHomepage() {
  try {
    const { data, error } = await supabase
      .from('homepage')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      document.querySelector('#homepageForm input[name="title"]').value = data.title || '';
      document.querySelector('#homepageForm input[name="subtitle"]').value = data.subtitle || '';
      document.querySelector('#homepageForm textarea[name="description"]').value = data.description || '';
      document.querySelector('#homepageForm input[name="hero_image"]').value = data.hero_image || '';
    }
  } catch (error) {
    console.error('Error loading homepage:', error);
    showNotification('Failed to load homepage content', 'error');
  }
}

document.getElementById('homepageForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const { error } = await supabase
      .from('homepage')
      .upsert({
        id: 1,
        ...data,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    showNotification('Homepage content saved successfully!', 'success');
    await loadHomepage(); // Reload immediately
  } catch (error) {
    console.error('Error saving homepage:', error);
    showNotification('Failed to save homepage content: ' + (error.message || 'Unknown error'), 'error');
  }
});

// ========================================
// ABOUT MANAGEMENT
// ========================================

async function loadAbout() {
  try {
  const { data, error } = await supabase
      .from('about')
      .select('*')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (data) {
      document.querySelector('#aboutForm textarea[name="mission"]').value = data.mission || '';
      document.querySelector('#aboutForm textarea[name="vision"]').value = data.vision || '';
      document.querySelector('#aboutForm textarea[name="values"]').value = data.values || '';
    }
  } catch (error) {
    console.error('Error loading about:', error);
    showNotification('Failed to load about content', 'error');
  }
}

document.getElementById('aboutForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const { error } = await supabase
      .from('about')
      .upsert({
        id: 1,
        ...data,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
    showNotification('About content saved successfully!', 'success');
    await loadAbout(); // Reload immediately
  } catch (error) {
    console.error('Error saving about:', error);
    showNotification('Failed to save about content: ' + (error.message || 'Unknown error'), 'error');
  }
});

// ========================================
// SERVICES MANAGEMENT
// ========================================

async function loadServices() {
  const servicesList = document.getElementById('servicesList');
  if (!servicesList) return;
  
  try {
    // Add cache busting with timestamp
    const { data: services, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (services && services.length > 0) {
      servicesList.innerHTML = services.map(service => `
        <div class="border border-gray-light rounded-lg p-4 mb-4 hover:shadow-md transition-all">
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <h4 class="font-bold text-dark mb-2">${service.title}</h4>
              <p class="text-gray text-sm mb-2">${service.description}</p>
              <span class="inline-block bg-primary/10 text-primary-dark px-3 py-1 rounded text-sm">${service.category || 'Uncategorized'}</span>
            </div>
            <div class="flex gap-2 ml-4">
              <button onclick="editService('${service.id}')" class="text-primary hover:text-primary-dark transition-colors" title="Edit">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteService('${service.id}')" class="text-secondary hover:text-secondary-dark transition-colors" title="Delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    } else {
      servicesList.innerHTML = '<p class="text-gray">No services found</p>';
    }
  } catch (error) {
    console.error('Error loading services:', error);
    servicesList.innerHTML = '<p class="text-secondary">Failed to load services</p>';
  }
}

function showAddServiceForm() {
  document.getElementById('serviceFormTitle').textContent = 'Add New Service';
  document.getElementById('serviceForm').reset();
  document.getElementById('serviceId').value = '';
  document.getElementById('serviceFormContainer').classList.remove('hidden');
  document.getElementById('serviceFormContainer').scrollIntoView({ behavior: 'smooth' });
}

function cancelServiceForm() {
  document.getElementById('serviceFormContainer').classList.add('hidden');
  document.getElementById('serviceForm').reset();
}

async function editService(id) {
  try {
    const { data: service, error } = await supabase
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    document.getElementById('serviceFormTitle').textContent = 'Edit Service';
    document.getElementById('serviceId').value = service.id;
    document.getElementById('serviceTitle').value = service.title || '';
    document.getElementById('serviceDescription').value = service.description || '';
    document.getElementById('serviceCategory').value = service.category || '';
    document.getElementById('serviceIcon').value = service.icon || '';
    document.getElementById('serviceFeatures').value = Array.isArray(service.features) ? service.features.join('\n') : (service.features || '');
    document.getElementById('serviceBenefits').value = Array.isArray(service.benefits) ? service.benefits.join('\n') : (service.benefits || '');

    document.getElementById('serviceFormContainer').classList.remove('hidden');
    document.getElementById('serviceFormContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });
  } catch (error) {
    console.error('Error loading service:', error);
    showNotification('Failed to load service details', 'error');
  }
}

document.getElementById('serviceForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const serviceId = formData.get('id');
  
  const serviceData = {
    title: formData.get('title'),
    description: formData.get('description'),
    category: formData.get('category') || null,
    icon: formData.get('icon') || null,
    features: formData.get('features') ? formData.get('features').split('\n').filter(f => f.trim()) : null,
    benefits: formData.get('benefits') ? formData.get('benefits').split('\n').filter(b => b.trim()) : null
  };

  try {
    if (serviceId) {
      // Update existing service
      const { data, error } = await supabase
        .from('services')
        .update({
          ...serviceData,
          updated_at: new Date().toISOString()
        })
        .eq('id', serviceId)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      showNotification('Service updated successfully!', 'success');
    } else {
      // Create new service
      const { data, error } = await supabase
        .from('services')
        .insert([serviceData])
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      showNotification('Service added successfully!', 'success');
    }

    cancelServiceForm();
    // Force immediate refresh with cache busting
    await loadServices();
    loadStats(); // Update stats immediately
  } catch (error) {
    console.error('Error saving service:', error);
    showNotification('Failed to save service: ' + (error.message || 'Unknown error'), 'error');
  }
});

async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) return;

  try {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) throw error;
    showNotification('Service deleted successfully!', 'success');
    await loadServices();
    loadStats(); // Update stats immediately
  } catch (error) {
    console.error('Error deleting service:', error);
    showNotification('Failed to delete service', 'error');
  }
}

// ========================================
// JOBS MANAGEMENT
// ========================================

async function loadJobs() {
  const jobsTableBody = document.getElementById('jobsTableBody');
  if (!jobsTableBody) return;
  
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (jobs && jobs.length > 0) {
      jobsTableBody.innerHTML = jobs.map(job => {
        const statusColors = {
          'open': 'bg-green-100 text-green-800',
          'closed': 'bg-red-100 text-red-800',
          'draft': 'bg-yellow-100 text-yellow-800'
        };
        const statusClass = statusColors[job.status] || 'bg-gray-100 text-gray-800';

        return `
          <tr class="border-b border-gray-light hover:bg-light transition-colors">
            <td class="px-4 py-3">
              <div class="font-semibold text-dark">${job.title}</div>
              ${job.department ? `<div class="text-sm text-gray">${job.department}</div>` : ''}
            </td>
            <td class="px-4 py-3 text-gray">${job.location}</td>
            <td class="px-4 py-3 text-gray">${job.type}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-1 rounded text-xs font-medium ${statusClass}">${job.status}</span>
            </td>
            <td class="px-4 py-3 text-gray text-sm">${new Date(job.created_at).toLocaleDateString()}</td>
            <td class="px-4 py-3">
              <div class="flex justify-center gap-2">
                <button onclick="editJob('${job.id}')" class="text-primary hover:text-primary-dark transition-colors">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteJob('${job.id}')" class="text-secondary hover:text-secondary-dark transition-colors">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      jobsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="px-4 py-8 text-center text-gray">
            <i class="fas fa-inbox text-2xl mb-2"></i>
            <p>No jobs found</p>
          </td>
        </tr>
      `;
    }
  } catch (error) {
    console.error('Error loading jobs:', error);
    jobsTableBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-secondary">
          <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
          <p>Failed to load jobs</p>
        </td>
    </tr>
    `;
  }
}

function showAddJobForm() {
  document.getElementById('jobFormTitle').textContent = 'Add New Job';
  document.getElementById('jobForm').reset();
  document.getElementById('jobId').value = '';
  document.getElementById('jobFormContainer').classList.remove('hidden');
  document.getElementById('jobFormContainer').scrollIntoView({ behavior: 'smooth' });
}

function cancelJobForm() {
  document.getElementById('jobFormContainer').classList.add('hidden');
  document.getElementById('jobForm').reset();
}

async function editJob(id) {
  try {
    const { data: job, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    document.getElementById('jobFormTitle').textContent = 'Edit Job';
    document.getElementById('jobId').value = job.id;
    document.getElementById('jobTitle').value = job.title || '';
    document.getElementById('jobLocation').value = job.location || '';
    document.getElementById('jobType').value = job.type || 'Full-time';
    document.getElementById('jobDepartment').value = job.department || '';
    document.getElementById('jobSalary').value = job.salary_range || '';
    document.getElementById('jobDescription').value = job.description || '';
    document.getElementById('jobRequirements').value = Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || '');
    document.getElementById('jobSkills').value = Array.isArray(job.skills) ? job.skills.join(', ') : (job.skills || '');
    document.getElementById('jobStatus').value = job.status || 'open';

    document.getElementById('jobFormContainer').classList.remove('hidden');
    document.getElementById('jobFormContainer').scrollIntoView({ behavior: 'smooth' });
  } catch (error) {
    console.error('Error loading job:', error);
    showNotification('Failed to load job details', 'error');
  }
}

async function deleteJob(id) {
  if (!confirm('Are you sure you want to delete this job? This will also delete all associated applications.')) return;

  try {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    showNotification('Job deleted successfully!', 'success');
    await loadJobs();
    await loadJobSelector(); // Refresh job selector
    loadStats(); // Update stats immediately
  } catch (error) {
    console.error('Error deleting job:', error);
    showNotification('Failed to delete job', 'error');
  }
}

document.getElementById('jobForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const jobId = formData.get('id');
  
    const jobData = {
      title: formData.get('title'),
      location: formData.get('location'),
      type: formData.get('type'),
      department: formData.get('department') || null,
      salary_range: formData.get('salary_range') || null,
      description: formData.get('description'),
      requirements: formData.get('requirements') ? formData.get('requirements').split('\n').map(r => r.trim()).filter(r => r) : [],
      responsibilities: [], // Can be added later if needed
      skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()).filter(s => s) : [],
      status: formData.get('status')
    };

  try {
    if (jobId) {
      // Update existing job
      const { data, error } = await supabase
        .from('jobs')
        .update({
          ...jobData,
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId)
        .select();

      if (error) {
        console.error('Update error:', error);
        throw error;
      }
      showNotification('Job updated successfully!', 'success');
    } else {
      // Create new job
      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select();

      if (error) {
        console.error('Insert error:', error);
        throw error;
      }
      showNotification('Job created successfully!', 'success');
    }

    cancelJobForm();
    // Force immediate refresh
    await loadJobs();
    await loadJobSelector(); // Refresh job selector
    loadStats(); // Update stats immediately
  } catch (error) {
    console.error('Error saving job:', error);
    showNotification('Failed to save job: ' + (error.message || 'Unknown error'), 'error');
  }
});

// ========================================
// APPLICATIONS VIEWER
// ========================================

async function loadJobSelector() {
  const jobSelector = document.getElementById('jobSelector');
  if (!jobSelector) return;
  
  try {
    // Force fresh data
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title')
      .order('title', { ascending: true });

    if (error) throw error;

    if (jobs && jobs.length > 0) {
      // Update the selector directly to preserve event listeners
      const currentValue = jobSelector.value;
      jobSelector.innerHTML = '<option value="">All Applications</option>' +
        jobs.map(job => `<option value="${job.id}">${job.title}</option>`).join('');
      
      // Restore previous selection if it still exists
      if (currentValue) {
        jobSelector.value = currentValue;
      }
      
      // Ensure change listener is attached
      jobSelector.onchange = (e) => {
        const selectedJobId = e.target.value || null;
        loadApplications(selectedJobId);
      };
    } else {
      jobSelector.innerHTML = '<option value="">No jobs available</option>';
    }
  } catch (error) {
    console.error('Error loading job selector:', error);
    if (jobSelector) {
      jobSelector.innerHTML = '<option value="">Error loading jobs</option>';
    }
  }
}

async function loadApplications(jobId = null) {
  const applicationsList = document.getElementById('applicationsList');
  if (!applicationsList) return;
  
  applicationsList.innerHTML = `
    <div class="text-center py-8 text-gray">
      <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
      <p>Loading applications...</p>
    </div>
  `;

  try {
    let query = supabase
      .from('applications')
      .select(`
        *,
        jobs (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false });

    // If jobId is provided, filter by job
    if (jobId) {
      query = query.eq('job_id', jobId);
    }

    const { data: applications, error } = await query;

    if (error) throw error;

    if (applications && applications.length > 0) {
      applicationsList.innerHTML = applications.map(app => {
        const statusColors = {
          'pending': { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: 'fa-clock' },
          'reviewing': { bg: 'bg-blue-100', text: 'text-blue-800', icon: 'fa-eye' },
          'accepted': { bg: 'bg-green-100', text: 'text-green-800', icon: 'fa-check-circle' },
          'rejected': { bg: 'bg-red-100', text: 'text-red-800', icon: 'fa-times-circle' }
        };
        const statusStyle = statusColors[app.status] || statusColors.pending;
        const jobTitle = app.jobs?.title || 'Unknown Job';

        return `
          <div class="border border-gray-light rounded-lg p-6 mb-4 hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-2">
                  <h4 class="font-bold text-dark text-lg">${app.name}</h4>
                  <span class="text-xs text-gray bg-gray-100 px-2 py-1 rounded">${jobTitle}</span>
                </div>
                <div class="flex flex-wrap gap-2 text-sm text-gray">
                  <span><i class="fas fa-envelope"></i> ${app.email}</span>
                  ${app.phone ? `<span><i class="fas fa-phone"></i> ${app.phone}</span>` : ''}
                  <span><i class="fas fa-calendar"></i> ${new Date(app.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              <span class="px-3 py-1 rounded text-sm font-medium ${statusStyle.bg} ${statusStyle.text}">
                <i class="fas ${statusStyle.icon} mr-1"></i>${app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </span>
            </div>
            
            ${app.cover_letter ? `
              <div class="mb-4">
                <h5 class="font-semibold text-dark mb-2">Cover Letter:</h5>
                <p class="text-gray text-sm leading-relaxed">${app.cover_letter}</p>
              </div>
            ` : ''}
            
            <div class="flex gap-2 mt-4 flex-wrap">
              ${app.resume_path ? `
                <button onclick="downloadResume('${app.resume_path}', '${app.name}')" class="gradient-primary hover:shadow-colored-lg text-white px-4 py-2 rounded-lg font-medium transition-all text-sm">
                  <i class="fas fa-download mr-2"></i>Download Resume
                </button>
                <button onclick="parseResume('${app.resume_path}', '${app.job_id || ''}', '${app.id}')" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm">
                  <i class="fas fa-brain mr-2"></i>Parse Resume
                </button>
              ` : app.resume_url ? `
                <a href="${app.resume_url}" target="_blank" class="gradient-primary hover:shadow-colored-lg text-white px-4 py-2 rounded-lg font-medium transition-all text-sm inline-flex items-center">
                  <i class="fas fa-download mr-2"></i>Download Resume
                </a>
              ` : ''}
              <select onchange="updateApplicationStatus('${app.id}', this.value)" class="px-4 py-2 border-2 border-gray-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm">
                <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                <option value="reviewing" ${app.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
              </select>
            </div>
            
            <!-- Parsed Resume Data Display -->
            <div id="parsedData-${app.id}" class="hidden mt-4 p-4 bg-gray-50 rounded-lg border-2 border-primary/20">
              <div class="flex justify-between items-center mb-3">
                <h5 class="font-semibold text-dark">Parsed Resume Data</h5>
                <button onclick="document.getElementById('parsedData-${app.id}').classList.add('hidden')" class="text-gray hover:text-dark">
                  <i class="fas fa-times"></i>
                </button>
              </div>
              <div id="parsedContent-${app.id}"></div>
            </div>
          </div>
        `;
      }).join('');
    } else {
      applicationsList.innerHTML = `
        <div class="text-center py-8 text-gray">
          <i class="fas fa-inbox text-2xl mb-2"></i>
          <p>${jobId ? 'No applications found for this job' : 'No applications found'}</p>
        </div>
      `;
    }
  } catch (error) {
    console.error('Error loading applications:', error);
    applicationsList.innerHTML = `
      <div class="text-center py-8 text-secondary">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p>Failed to load applications</p>
      </div>
    `;
  }
}

async function downloadResume(resumePath, candidateName) {
  try {
    // Get signed URL for download
    const { data, error } = await supabase.storage
      .from('resumes')
      .createSignedUrl(resumePath, 3600); // 1 hour expiry

    if (error) throw error;

    // Download file
    const link = document.createElement('a');
    link.href = data.signedUrl;
    link.download = `${candidateName}_resume.pdf`;
    link.click();

    showNotification('Resume download started', 'success');
  } catch (error) {
    console.error('Error downloading resume:', error);
    showNotification('Failed to download resume', 'error');
  }
}

async function updateApplicationStatus(applicationId, newStatus) {
  try {
    const { error } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', applicationId);

    if (error) throw error;
    showNotification('Application status updated!', 'success');
    
    // Reload applications immediately
    const jobSelector = document.getElementById('jobSelector');
    const jobId = jobSelector ? jobSelector.value || null : null;
    await loadApplications(jobId);
    loadStats(); // Update stats immediately
  } catch (error) {
    console.error('Error updating application status:', error);
    showNotification('Failed to update application status', 'error');
  }
}

// ========================================
// RESUME PARSING
// ========================================

async function parseResume(resumePath, jobId, applicationId) {
  const parsedContainer = document.getElementById(`parsedData-${applicationId}`);
  const parsedContent = document.getElementById(`parsedContent-${applicationId}`);
  
  if (!parsedContainer || !parsedContent) {
    showNotification('Error: Could not find parsed data container', 'error');
        return;
      }

  // Show loading state
  parsedContainer.classList.remove('hidden');
  parsedContent.innerHTML = `
    <div class="text-center py-4">
      <i class="fas fa-spinner fa-spin text-2xl mb-2 text-primary"></i>
      <p class="text-gray">Parsing resume with AI...</p>
    </div>
  `;

  try {
    // Get session token
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      throw new Error('Not authenticated. Please log in again.');
    }

    // Call the parse-resume edge function
    const response = await fetch(`${SUPABASE_URL}/functions/v1/parse-resume`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        resume_path: resumePath,
        job_id: jobId || null
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Failed to parse resume');
    }

    // Display parsed data in a table
    const data = result.data;
    const fitScore = result.fit_score;

    let html = '';

    // Fit Score
    if (fitScore !== null) {
      const scoreColor = fitScore >= 70 ? 'text-green-600' : fitScore >= 50 ? 'text-yellow-600' : 'text-red-600';
      html += `
        <div class="mb-4 p-3 bg-white rounded-lg border-2 border-primary/30">
          <div class="flex items-center justify-between">
            <span class="font-semibold text-dark">AI Fit Score:</span>
            <span class="text-2xl font-bold ${scoreColor}">${fitScore}%</span>
          </div>
        </div>
      `;
    }

    // Create structured table
    html += `
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <tbody class="bg-white">
            ${data.name ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark w-1/3">Name</td>
                <td class="px-4 py-2 text-gray">${data.name}</td>
              </tr>
            ` : ''}
            ${data.email ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark">Email</td>
                <td class="px-4 py-2 text-gray">${data.email}</td>
              </tr>
            ` : ''}
            ${data.phone ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark">Phone</td>
                <td class="px-4 py-2 text-gray">${data.phone}</td>
              </tr>
            ` : ''}
            ${data.summary ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark align-top">Summary</td>
                <td class="px-4 py-2 text-gray">${data.summary}</td>
              </tr>
            ` : ''}
            ${data.skills && Array.isArray(data.skills) && data.skills.length > 0 ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark align-top">Skills</td>
                <td class="px-4 py-2 text-gray">
                  <div class="flex flex-wrap gap-2">
                    ${data.skills.map(skill => `<span class="px-2 py-1 bg-primary/10 text-primary-dark rounded text-xs">${skill}</span>`).join('')}
                  </div>
                </td>
              </tr>
            ` : ''}
            ${data.experience && Array.isArray(data.experience) && data.experience.length > 0 ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark align-top">Experience</td>
                <td class="px-4 py-2 text-gray">
                  ${data.experience.map(exp => `
                    <div class="mb-3 pb-3 border-b border-gray-light last:border-0">
                      <div class="font-semibold text-dark">${exp.position || 'N/A'}</div>
                      <div class="text-sm text-gray">${exp.company || 'N/A'} ${exp.duration ? `• ${exp.duration}` : ''}</div>
                      ${exp.description ? `<div class="text-sm text-gray mt-1">${exp.description}</div>` : ''}
                    </div>
                  `).join('')}
                </td>
              </tr>
            ` : ''}
            ${data.education && Array.isArray(data.education) && data.education.length > 0 ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark align-top">Education</td>
                <td class="px-4 py-2 text-gray">
                  ${data.education.map(edu => `
                    <div class="mb-2">
                      <div class="font-semibold text-dark">${edu.degree || 'N/A'}</div>
                      <div class="text-sm text-gray">${edu.institution || 'N/A'} ${edu.year ? `• ${edu.year}` : ''}</div>
                    </div>
                  `).join('')}
                </td>
              </tr>
            ` : ''}
            ${data.certifications && Array.isArray(data.certifications) && data.certifications.length > 0 ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark">Certifications</td>
                <td class="px-4 py-2 text-gray">
                  <ul class="list-disc list-inside">
                    ${data.certifications.map(cert => `<li>${cert}</li>`).join('')}
                  </ul>
                </td>
              </tr>
            ` : ''}
            ${data.languages && Array.isArray(data.languages) && data.languages.length > 0 ? `
              <tr class="border-b border-gray-light">
                <td class="px-4 py-2 font-semibold text-dark">Languages</td>
                <td class="px-4 py-2 text-gray">
                  <div class="flex flex-wrap gap-2">
                    ${data.languages.map(lang => `<span class="px-2 py-1 bg-gray-100 rounded text-xs">${lang}</span>`).join('')}
                  </div>
                </td>
              </tr>
            ` : ''}
          </tbody>
        </table>
      </div>
      
      <!-- Raw JSON View -->
      <details class="mt-4">
        <summary class="cursor-pointer text-sm font-semibold text-primary-dark hover:text-primary">View Raw JSON</summary>
        <pre class="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-64">${JSON.stringify(data, null, 2)}</pre>
      </details>
    `;

    parsedContent.innerHTML = html;

    // Update application with fit score if available
    if (fitScore !== null) {
      try {
        await supabase
          .from('applications')
          .update({ ai_fit_score: fitScore })
          .eq('id', applicationId);
      } catch (updateError) {
        console.warn('Could not update fit score:', updateError);
      }
    }

    showNotification('Resume parsed successfully!', 'success');
  } catch (error) {
    console.error('Error parsing resume:', error);
    parsedContent.innerHTML = `
      <div class="text-center py-4 text-secondary">
        <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
        <p class="font-semibold">Failed to parse resume</p>
        <p class="text-sm mt-1">${error.message || 'Unknown error occurred'}</p>
      </div>
    `;
    showNotification('Failed to parse resume: ' + error.message, 'error');
  }
}

// ========================================
// MESSAGES MANAGEMENT
// ========================================

async function loadMessages() {
  const messagesList = document.getElementById('messagesList');
  if (!messagesList) return;
  
  try {
    const { data: messages, error } = await supabase
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    if (messages && messages.length > 0) {
      messagesList.innerHTML = messages.map(msg => `
        <div class="border border-gray-light rounded-lg p-4 mb-4 hover:shadow-md transition-all">
          <div class="flex justify-between items-start mb-2">
            <div class="flex-1">
              <h4 class="font-bold text-dark">${msg.name}</h4>
              <p class="text-sm text-gray">${msg.email}</p>
              ${msg.phone ? `<p class="text-sm text-gray"><i class="fas fa-phone"></i> ${msg.phone}</p>` : ''}
              <p class="text-sm font-semibold text-primary-dark mt-1">Subject: ${msg.subject}</p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <span class="text-xs text-gray">${new Date(msg.created_at).toLocaleDateString()}</span>
              <div class="flex gap-2">
                <button onclick="editMessage('${msg.id}')" class="text-primary hover:text-primary-dark transition-colors" title="Edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteMessage('${msg.id}')" class="text-secondary hover:text-secondary-dark transition-colors" title="Delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
          </div>
          <p class="text-gray mt-2">${msg.message}</p>
        </div>
      `).join('');
    } else {
      messagesList.innerHTML = '<p class="text-gray">No messages found</p>';
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    messagesList.innerHTML = '<p class="text-secondary">Failed to load messages</p>';
  }
}

async function editMessage(id) {
  try {
    const { data: message, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Show edit form (you can create a modal or inline form)
    const newName = prompt('Edit Name:', message.name);
    if (newName === null) return;

    const newEmail = prompt('Edit Email:', message.email);
    if (newEmail === null) return;

    const newPhone = prompt('Edit Phone (optional):', message.phone || '');
    const newSubject = prompt('Edit Subject:', message.subject);
    if (newSubject === null) return;

    const newMessage = prompt('Edit Message:', message.message);
    if (newMessage === null) return;

    const { data, error: updateError } = await supabase
      .from('contact_messages')
      .update({
        name: newName,
        email: newEmail,
        phone: newPhone || null,
        subject: newSubject,
        message: newMessage
      })
      .eq('id', id)
      .select();

    if (updateError) {
      console.error('Update error:', updateError);
      throw updateError;
    }
    showNotification('Message updated successfully!', 'success');
    await loadMessages();
    loadStats(); // Update stats immediately
  } catch (error) {
    console.error('Error editing message:', error);
    showNotification('Failed to edit message: ' + (error.message || 'Unknown error'), 'error');
  }
}

async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
    showNotification('Message deleted successfully!', 'success');
    await loadMessages();
    loadStats(); // Update stats immediately
  } catch (error) {
    console.error('Error deleting message:', error);
    showNotification('Failed to delete message', 'error');
  }
}

// ========================================
// NOTIFICATION HELPER
// ========================================

function showNotification(message, type = 'info') {
  if (type === 'success') {
    toast.success(message);
  } else if (type === 'error') {
    toast.error(message);
  } else if (type === 'warning') {
    toast.warning(message);
  } else {
    toast.info(message);
  }
}

// ========================================
// ANALYTICS
// ========================================

let visitorsChart = null;
let applicationsChart = null;

async function fetchAnalytics() {
  try {
    const session = (await supabase.auth.getSession()).data.session;
    
    if (!session) {
      showNotification('Please log in to view analytics', 'error');
      return;
    }

    // Show loading state
    document.querySelector('#visitorsCount').textContent = '...';
    document.querySelector('#applicantsCount').textContent = '...';
    document.querySelector('#serviceClicksCount').textContent = '...';
    document.querySelector('#topService').textContent = '...';
    document.querySelector('#summaryText').innerHTML = `
      <div class="text-center py-4">
        <i class="fas fa-spinner fa-spin text-2xl mb-2 text-primary"></i>
        <p>Loading analytics...</p>
      </div>
    `;

    // Fetch analytics from edge function
    const analyticsResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/analytics`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'summary' })
      }
    );

    if (!analyticsResponse.ok) {
      throw new Error(`Analytics API error: ${analyticsResponse.status}`);
    }

    const analytics = await analyticsResponse.json();

    if (!analytics.success) {
      throw new Error(analytics.error || 'Failed to fetch analytics');
    }

    // Fetch applications count
    const { count: applicantsCount, error: applicantsError } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true });

    if (applicantsError) {
      console.warn('Failed to fetch applicants count:', applicantsError);
    }

    // Display counts
    document.querySelector('#visitorsCount').textContent = analytics.summary?.total_visitors || analytics.visitors?.total || 0;
    document.querySelector('#applicantsCount').textContent = applicantsCount || 0;
    document.querySelector('#serviceClicksCount').textContent = analytics.summary?.total_service_clicks || analytics.service_clicks?.total || 0;
    
    // Display top service
    const topService = analytics.summary?.top_services?.[0];
    if (topService) {
      document.querySelector('#topService').textContent = `${topService.name} (${topService.count})`;
    } else {
      document.querySelector('#topService').textContent = 'N/A';
    }

    // Create charts
    createVisitorsChart(analytics.visitors?.data || []);
    createApplicationsChart();

    // Generate AI summary
    const summaryResponse = await fetch(
      `${SUPABASE_URL}/functions/v1/ai-summary`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          stats: {
            total_visitors: analytics.summary?.total_visitors || 0,
            total_applicants: applicantsCount || 0,
            total_service_clicks: analytics.summary?.total_service_clicks || 0,
            top_service: topService?.name || 'N/A',
            last_visitor: analytics.summary?.last_visitor || null,
            last_click: analytics.summary?.last_click || null
          }
        })
      }
    );

    if (summaryResponse.ok) {
      const summary = await summaryResponse.json();
      if (summary.success && summary.summary) {
        document.querySelector('#summaryText').textContent = summary.summary;
      } else {
        document.querySelector('#summaryText').innerHTML = `
          <p class="text-gray">No summary available at this time.</p>
        `;
      }
    } else {
      // If AI summary fails, show a basic summary
      const basicSummary = `Total Visitors: ${analytics.summary?.total_visitors || 0}, Total Applicants: ${applicantsCount || 0}, Total Service Clicks: ${analytics.summary?.total_service_clicks || 0}. Top Service: ${topService?.name || 'N/A'}.`;
      document.querySelector('#summaryText').textContent = basicSummary;
    }

    showNotification('Analytics loaded successfully', 'success');
  } catch (error) {
    console.error('Error fetching analytics:', error);
    showNotification('Failed to load analytics: ' + error.message, 'error');
    
    // Show error state
    document.querySelector('#visitorsCount').textContent = 'Error';
    document.querySelector('#applicantsCount').textContent = 'Error';
    document.querySelector('#serviceClicksCount').textContent = 'Error';
    document.querySelector('#topService').textContent = 'Error';
    document.querySelector('#summaryText').innerHTML = `
      <p class="text-secondary">Failed to load analytics summary. Please try again.</p>
    `;
  }
}

function createVisitorsChart(visitorsData) {
  const ctx = document.getElementById('visitorsChart');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (visitorsChart) {
    visitorsChart.destroy();
  }

  // Group visitors by date
  const visitorsByDate = {};
  const dateMap = {}; // Map formatted date to actual date for sorting
  
  visitorsData.forEach(visitor => {
    const dateObj = new Date(visitor.created_at);
    const date = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    visitorsByDate[date] = (visitorsByDate[date] || 0) + 1;
    if (!dateMap[date]) {
      dateMap[date] = dateObj;
    }
  });

  // Sort dates by actual date and get last 30 days
  const sortedDates = Object.keys(visitorsByDate).sort((a, b) => {
    return dateMap[a] - dateMap[b];
  }).slice(-30);

  const labels = sortedDates;
  const data = sortedDates.map(date => visitorsByDate[date] || 0);

  visitorsChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Visitors',
        data: data,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
        fill: true,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      }
    }
  });
}

async function createApplicationsChart() {
  const ctx = document.getElementById('applicationsChart');
  if (!ctx) return;

  // Destroy existing chart if it exists
  if (applicationsChart) {
    applicationsChart.destroy();
  }

  try {
    // Fetch applications grouped by job
    const { data: applications, error } = await supabase
      .from('applications')
      .select('job_id, jobs(title)');

    if (error) {
      throw error;
    }

    // Group applications by job
    const applicationsByJob = {};
    applications.forEach(app => {
      const jobTitle = app.jobs?.title || 'Unknown Job';
      applicationsByJob[jobTitle] = (applicationsByJob[jobTitle] || 0) + 1;
    });

    // Sort by count (descending) and take top 10
    const sortedJobs = Object.entries(applicationsByJob)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    const labels = sortedJobs.map(([title]) => title.length > 20 ? title.substring(0, 20) + '...' : title);
    const data = sortedJobs.map(([, count]) => count);

    applicationsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Applications',
          data: data,
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
          borderColor: 'rgb(99, 102, 241)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    });
  } catch (error) {
    console.error('Error creating applications chart:', error);
    // Show empty chart
    applicationsChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [{
          label: 'Applications',
          data: [],
          backgroundColor: 'rgba(99, 102, 241, 0.8)',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
      }
    });
  }
}
