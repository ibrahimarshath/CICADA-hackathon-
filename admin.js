// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

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

    // Check if user has admin role or is the hardcoded admin email
    const ADMIN_EMAIL = 'admin@mastersolis-backend';
    const userRole = currentUser.user_metadata?.role;
    const isAdminEmail = currentUser.email === ADMIN_EMAIL;
    
    if (userRole !== 'admin' && !isAdminEmail) {
      await supabase.auth.signOut();
      toast.error('Access denied. Admin privileges required.');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 2000);
      return;
    }

    // If admin email but role not set, update it
    if (isAdminEmail && userRole !== 'admin') {
      try {
        await supabase.auth.updateUser({
          data: { role: 'admin' }
        });
      } catch (updateError) {
        console.warn('Could not update user role:', updateError);
        // Still allow access if it's the admin email
      }
    }

    // Load initial data
    loadStats();
    loadHomepage();
    loadAbout();
    loadServices();
    loadJobs();
    loadJobSelector();
  } catch (error) {
    console.error('Auth check error:', error);
    window.location.href = 'index.html';
  }
});

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
  } catch (error) {
    console.error('Error saving homepage:', error);
    showNotification('Failed to save homepage content', 'error');
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
  } catch (error) {
    console.error('Error saving about:', error);
    showNotification('Failed to save about content', 'error');
  }
});

// ========================================
// SERVICES MANAGEMENT
// ========================================

async function loadServices() {
  const servicesList = document.getElementById('servicesList');
  try {
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
            <button onclick="deleteService('${service.id}')" class="ml-4 text-secondary hover:text-secondary-dark">
              <i class="fas fa-trash"></i>
            </button>
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

document.getElementById('serviceForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData);

  try {
    const { error } = await supabase
      .from('services')
      .insert([data]);

    if (error) throw error;
    showNotification('Service added successfully!', 'success');
    e.target.reset();
    loadServices();
  } catch (error) {
    console.error('Error adding service:', error);
    showNotification('Failed to add service', 'error');
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
    loadServices();
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
    document.getElementById('jobRequirements').value = job.requirements || '';
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
    loadJobs();
    loadJobSelector(); // Refresh job selector
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
    requirements: formData.get('requirements') || null,
    skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()).filter(s => s) : [],
    status: formData.get('status')
  };

  try {
    if (jobId) {
      // Update existing job
      const { error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', jobId);

      if (error) throw error;
      showNotification('Job updated successfully!', 'success');
    } else {
      // Create new job
      const { error } = await supabase
        .from('jobs')
        .insert([jobData]);

      if (error) throw error;
      showNotification('Job created successfully!', 'success');
    }

    cancelJobForm();
    loadJobs();
    loadJobSelector(); // Refresh job selector
  } catch (error) {
    console.error('Error saving job:', error);
    showNotification('Failed to save job', 'error');
  }
});

// ========================================
// APPLICATIONS VIEWER
// ========================================

async function loadJobSelector() {
  const jobSelector = document.getElementById('jobSelector');
  try {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select('id, title')
      .order('title', { ascending: true });

    if (error) throw error;

    if (jobs && jobs.length > 0) {
      jobSelector.innerHTML = '<option value="">Select a job...</option>' +
        jobs.map(job => `<option value="${job.id}">${job.title}</option>`).join('');
      
      jobSelector.addEventListener('change', (e) => {
        if (e.target.value) {
          loadApplications(e.target.value);
        } else {
          document.getElementById('applicationsList').innerHTML = `
            <div class="text-center py-8 text-gray">
              <i class="fas fa-info-circle text-2xl mb-2"></i>
              <p>Select a job to view applications</p>
            </div>
          `;
        }
      });
    } else {
      jobSelector.innerHTML = '<option value="">No jobs available</option>';
    }
  } catch (error) {
    console.error('Error loading job selector:', error);
    jobSelector.innerHTML = '<option value="">Error loading jobs</option>';
  }
}

async function loadApplications(jobId) {
  const applicationsList = document.getElementById('applicationsList');
  applicationsList.innerHTML = `
    <div class="text-center py-8 text-gray">
      <i class="fas fa-spinner fa-spin text-2xl mb-2"></i>
      <p>Loading applications...</p>
    </div>
  `;

  try {
    const { data: applications, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (
          id,
          title
        )
      `)
      .eq('job_id', jobId)
      .order('created_at', { ascending: false });

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

        return `
          <div class="border border-gray-light rounded-lg p-6 mb-4 hover:shadow-md transition-all">
            <div class="flex justify-between items-start mb-4">
              <div>
                <h4 class="font-bold text-dark text-lg mb-2">${app.name}</h4>
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
            
            ${app.resume_url ? `
              <div class="flex gap-2">
                <button onclick="downloadResume('${app.resume_url}', '${app.name}')" class="gradient-primary hover:shadow-colored-lg text-white px-4 py-2 rounded-lg font-medium transition-all text-sm">
                  <i class="fas fa-download mr-2"></i>Download Resume
                </button>
                <select onchange="updateApplicationStatus('${app.id}', this.value)" class="px-4 py-2 border-2 border-gray-light rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all text-sm">
                  <option value="pending" ${app.status === 'pending' ? 'selected' : ''}>Pending</option>
                  <option value="reviewing" ${app.status === 'reviewing' ? 'selected' : ''}>Reviewing</option>
                  <option value="accepted" ${app.status === 'accepted' ? 'selected' : ''}>Accepted</option>
                  <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                </select>
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    } else {
      applicationsList.innerHTML = `
        <div class="text-center py-8 text-gray">
          <i class="fas fa-inbox text-2xl mb-2"></i>
          <p>No applications found for this job</p>
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

async function downloadResume(resumeUrl, candidateName) {
  try {
    // Extract file path from URL
    const urlParts = resumeUrl.split('/');
    const bucket = 'resumes';
    const filePath = urlParts.slice(urlParts.indexOf(bucket) + 1).join('/');

    // Get signed URL for download
    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600); // 1 hour expiry

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
    
    // Reload applications
    const jobId = document.getElementById('jobSelector').value;
    if (jobId) {
      loadApplications(jobId);
    }
  } catch (error) {
    console.error('Error updating application status:', error);
    showNotification('Failed to update application status', 'error');
  }
}

// ========================================
// MESSAGES MANAGEMENT
// ========================================

async function loadMessages() {
  const messagesList = document.getElementById('messagesList');
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
            <div>
              <h4 class="font-bold text-dark">${msg.name}</h4>
              <p class="text-sm text-gray">${msg.email}</p>
            </div>
            <span class="text-xs text-gray">${new Date(msg.created_at).toLocaleDateString()}</span>
          </div>
          <p class="text-gray">${msg.message}</p>
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
