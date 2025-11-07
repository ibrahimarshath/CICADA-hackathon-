const API_BASE_URL = '/api';

// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    window.location.href = 'index.html';
    return;
  }

  // Verify token
  verifyToken(token);
  
  // Load initial data
  loadStats();
  loadHomepage();
  loadAbout();
  loadServices();
});

// Verify JWT token
async function verifyToken(token) {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Invalid token');
    }
  } catch (error) {
    console.error('Token verification failed:', error);
    logout();
  }
}

// Get auth headers
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
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
  document.getElementById(`${sectionName}-section`).classList.remove('hidden');
  
  // Add active class to clicked button
  event.target.classList.add('active', 'border-primary-dark', 'text-primary-dark');
  event.target.classList.remove('border-transparent', 'text-gray');

  // Load data when switching sections
  if (sectionName === 'messages') {
    loadMessages();
  } else if (sectionName === 'services') {
    loadServices();
  }
}

// Logout
function logout() {
  localStorage.removeItem('adminToken');
  localStorage.removeItem('adminUser');
  window.location.href = 'index.html';
}

// Load stats
async function loadStats() {
  try {
    const token = localStorage.getItem('adminToken');
    
    const [messagesRes, servicesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/contact-messages?page=1&limit=1`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/services`)
    ]);

    if (messagesRes.ok) {
      const messagesData = await messagesRes.json();
      document.getElementById('messagesCount').textContent = messagesData.pagination?.total || 0;
    }

    if (servicesRes.ok) {
      const servicesData = await servicesRes.json();
      document.getElementById('servicesCount').textContent = servicesData.data?.length || 0;
    }

    document.getElementById('lastUpdated').textContent = new Date().toLocaleDateString();
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Homepage Management
async function loadHomepage() {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/homepage`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (result.success && result.data) {
      const form = document.getElementById('homepageForm');
      form.title.value = result.data.title || '';
      form.subtitle.value = result.data.subtitle || '';
      form.description.value = result.data.description || '';
      form.hero_image.value = result.data.hero_image || '';
    }
  } catch (error) {
    console.error('Error loading homepage:', error);
    showNotification('Failed to load homepage content', 'error');
  }
}

document.getElementById('homepageForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/homepage`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      showNotification('✅ Homepage saved successfully!', 'success');
      loadHomepage();
      loadStats();
    } else {
      showNotification('❌ Failed to save: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error saving homepage:', error);
    showNotification('❌ Failed to save homepage', 'error');
  }
});

// About Management
async function loadAbout() {
  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/about`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const result = await response.json();

    if (result.success && result.data) {
      const form = document.getElementById('aboutForm');
      form.mission.value = result.data.mission || '';
      form.vision.value = result.data.vision || '';
      form.values.value = result.data.values || '';
    }
  } catch (error) {
    console.error('Error loading about:', error);
    showNotification('Failed to load about content', 'error');
  }
}

document.getElementById('aboutForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/about`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      showNotification('✅ About page saved successfully!', 'success');
      loadAbout();
      loadStats();
    } else {
      showNotification('❌ Failed to save: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error saving about:', error);
    showNotification('❌ Failed to save about page', 'error');
  }
});

// Services Management
async function loadServices() {
  const servicesList = document.getElementById('servicesList');
  servicesList.innerHTML = '<div class="text-center py-8 text-gray"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>Loading services...</p></div>';

  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      servicesList.innerHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-light">
            <thead class="bg-light">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Title</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Description</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Category</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-light">
              ${result.data.map(service => `
                <tr class="hover:bg-light transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-dark">${service.title || 'N/A'}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray">${(service.description || '').substring(0, 100)}${service.description?.length > 100 ? '...' : ''}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style="background: linear-gradient(135deg, #c56567 0%, #a67552 100%); color: white;">${service.category || 'N/A'}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="deleteService('${service.id}')" class="text-secondary hover:text-primary-dark transition-colors">
                      <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    } else {
      servicesList.innerHTML = '<div class="text-center py-12 text-gray"><i class="fas fa-inbox text-4xl mb-4"></i><p>No services found</p></div>';
    }
  } catch (error) {
    console.error('Error loading services:', error);
    servicesList.innerHTML = '<div class="text-center py-12 text-secondary"><i class="fas fa-exclamation-triangle text-4xl mb-4"></i><p>Failed to load services</p></div>';
  }
}

async function deleteService(id) {
  if (!confirm('Are you sure you want to delete this service?')) {
    return;
  }

  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/services/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const result = await response.json();

    if (result.success) {
      showNotification('✅ Service deleted successfully!', 'success');
      loadServices();
      loadStats();
    } else {
      showNotification('❌ Failed to delete: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error deleting service:', error);
    showNotification('❌ Failed to delete service', 'error');
  }
}

document.getElementById('serviceForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/services`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (result.success) {
      showNotification('✅ Service added successfully!', 'success');
      form.reset();
      loadServices();
      loadStats();
    } else {
      showNotification('❌ Failed to add: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error adding service:', error);
    showNotification('❌ Failed to add service', 'error');
  }
});

// Messages Management
async function loadMessages() {
  const messagesList = document.getElementById('messagesList');
  messagesList.innerHTML = '<div class="text-center py-8 text-gray"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>Loading messages...</p></div>';

  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/contact-messages?page=1&limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      messagesList.innerHTML = `
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-light">
            <thead class="bg-light">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Email</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Phone</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Subject</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Message</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-light">
              ${result.data.map(msg => `
                <tr class="hover:bg-light transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-dark">${msg.name || 'N/A'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray">${msg.email || 'N/A'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray">${msg.phone || 'N/A'}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-dark">${msg.subject || 'N/A'}</div>
                  </td>
                  <td class="px-6 py-4">
                    <div class="text-sm text-gray max-w-xs truncate">${msg.message || 'N/A'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray">${msg.created_at ? new Date(msg.created_at).toLocaleDateString() : 'N/A'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onclick="deleteMessage('${msg.id}')" class="text-secondary hover:text-primary-dark transition-colors">
                      <i class="fas fa-trash mr-1"></i>Delete
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="mt-4 text-sm text-gray">
            Showing ${result.data.length} of ${result.pagination?.total || 0} messages
          </div>
        </div>
      `;
    } else {
      messagesList.innerHTML = '<div class="text-center py-12 text-gray"><i class="fas fa-inbox text-4xl mb-4"></i><p>No messages found</p></div>';
    }
  } catch (error) {
    console.error('Error loading messages:', error);
    messagesList.innerHTML = '<div class="text-center py-12 text-secondary"><i class="fas fa-exclamation-triangle text-4xl mb-4"></i><p>Failed to load messages. Make sure you are authenticated.</p></div>';
  }
}

async function deleteMessage(id) {
  if (!confirm('Are you sure you want to delete this message?')) {
    return;
  }

  try {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`${API_BASE_URL}/contact-messages/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    const result = await response.json();

    if (result.success) {
      showNotification('✅ Message deleted successfully!', 'success');
      loadMessages();
      loadStats();
    } else {
      showNotification('❌ Failed to delete: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error deleting message:', error);
    showNotification('❌ Failed to delete message', 'error');
  }
}

// Notification helper
function showNotification(message, type = 'info') {
  // Simple alert for now, can be enhanced with a toast library
  if (type === 'success') {
    alert(message);
  } else {
    alert(message);
  }
}
