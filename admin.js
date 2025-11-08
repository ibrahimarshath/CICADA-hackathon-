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

// Helper to get auth headers for admin requests
function getAuthHeaders() {
  const token = localStorage.getItem('adminToken');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
}

// Show section (called by nav tab buttons). Uses window.event when invoked via inline onclick.
function showSection(sectionName) {
  // Hide all admin sections
  document.querySelectorAll('.admin-section').forEach(section => section.classList.add('hidden'));

  // Remove active class from nav buttons
  document.querySelectorAll('.tab-button').forEach(btn => {
    btn.classList.remove('active', 'border-primary-dark', 'text-primary-dark');
    btn.classList.add('border-transparent', 'text-gray');
  });

  // Show the requested section
  const target = document.getElementById(`${sectionName}-section`);
  if (target) target.classList.remove('hidden');

  // Try to mark the clicked nav button as active. If called via inline onclick, window.event should be available.
  const trigger = (typeof window !== 'undefined' && window.event && window.event.target) ? window.event.target : document.querySelector(`.tab-button[onclick*="${sectionName}"]`);
  if (trigger) {
    trigger.classList.add('active', 'border-primary-dark', 'text-primary-dark');
    trigger.classList.remove('border-transparent', 'text-gray');
  }

  // Load related data when switching sections
  if (sectionName === 'messages') {
    loadMessages();
  } else if (sectionName === 'services') {
    loadServices();
  }
}

// Event delegation for delete buttons inside #servicesList so handlers remain after re-render
const servicesListEl = document.getElementById('servicesList');
if (servicesListEl) {
  servicesListEl.addEventListener('click', function (e) {
    const btn = e.target.closest('.service-delete-btn');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    if (!id) return;
    deleteService(id);
  });
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
      // broadcast to other tabs so public pages update immediately
      try {
        broadcastAboutUpdate(result.data || data);
      } catch (err) {
        console.warn('Failed to broadcast about update:', err);
      }
      try {
        // Storage fallback for older browsers / environments where BroadcastChannel isn't available
        localStorage.setItem('mastersolis_about_update', JSON.stringify({ data: result.data || data, ts: Date.now() }));
      } catch (err) {
        console.warn('Failed to write about update to localStorage:', err);
      }
    } else {
      showNotification('❌ Failed to save: ' + (result.error || 'Unknown error'), 'error');
    }
  } catch (error) {
    console.error('Error saving about:', error);
    showNotification('❌ Failed to save about page', 'error');
  }
});

// Broadcast updates to other open tabs (so public pages can refresh without reload)
function broadcastAboutUpdate(data) {
  try {
    const bc = new BroadcastChannel('mastersolis_updates');
    bc.postMessage({ type: 'about-updated', data });
    bc.close();
  } catch (err) {
    // BroadcastChannel may not be available in some older browsers; ignore silently
    console.warn('BroadcastChannel not available:', err);
  }
}

// Small reusable confirmation modal (injected at runtime) to replace native confirm()
function showConfirmModal(options, onConfirm, onCancel) {
  const { title = 'Confirm', message = 'Are you sure?', confirmText = 'OK', cancelText = 'Cancel' } = options || {};

  // overlay
  const overlay = document.createElement('div');
  overlay.className = 'admin-modal-overlay fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

  // modal card
  const modal = document.createElement('div');
  modal.className = 'bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4';
  modal.innerHTML = `
    <h3 class="text-lg font-semibold mb-2">${title}</h3>
    <p class="text-sm text-gray-700 mb-4">${message}</p>
    <div class="flex justify-end gap-3">
      <button class="modal-cancel px-4 py-2 rounded bg-gray-200 hover:bg-gray-300">${cancelText}</button>
      <button class="modal-confirm px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700">${confirmText}</button>
    </div>
  `;

  overlay.appendChild(modal);
  document.body.appendChild(overlay);

  // Focus confirm for keyboard users
  const confirmBtn = modal.querySelector('.modal-confirm');
  const cancelBtn = modal.querySelector('.modal-cancel');
  confirmBtn.focus();

  function cleanup() {
    try { overlay.remove(); } catch (e) {}
  }

  cancelBtn.addEventListener('click', () => {
    cleanup();
    if (typeof onCancel === 'function') onCancel();
  });

  // allow clicking outside modal to cancel
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      cleanup();
      if (typeof onCancel === 'function') onCancel();
    }
  });

  confirmBtn.addEventListener('click', async () => {
    // run the confirm handler and then remove modal
    try {
      await onConfirm();
    } catch (err) {
      console.error('Confirm handler failed:', err);
    }
    cleanup();
  });
}

// Services Management
async function loadServices() {
  const servicesList = document.getElementById('servicesList');
  servicesList.innerHTML = '<div class="text-center py-8 text-gray"><i class="fas fa-spinner fa-spin text-2xl mb-2"></i><p>Loading services...</p></div>';

  try {
    const response = await fetch(`${API_BASE_URL}/services`);
    const result = await response.json();

    if (result.success && result.data && result.data.length > 0) {
      // Render a responsive card list with a delete icon aligned to the side of each card
      servicesList.innerHTML = `
        <div class="grid grid-cols-1 gap-4">
          ${result.data.map(service => `
            <div class="relative bg-white rounded-lg p-4 border border-gray-light hover:shadow-colored transition-all">
              <button class="service-delete-btn absolute right-3 top-3 text-white bg-red-600 hover:bg-red-700 p-2 rounded-full shadow-sm" data-id="${service.id}" title="Delete service" aria-label="Delete service">
                <i class="fas fa-trash"></i>
              </button>
              <div class="flex items-start gap-4">
                <div class="flex-1">
                  <h3 class="text-lg font-semibold text-dark">${service.title || 'N/A'}</h3>
                  <p class="text-sm text-gray mt-2">${(service.description || '').substring(0, 220)}${service.description?.length > 220 ? '...' : ''}</p>
                  <div class="mt-3">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" style="background: linear-gradient(135deg, #c56567 0%, #a67552 100%); color: white;">${service.category || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          `).join('')}
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

function deleteService(id) {
  showConfirmModal({
    title: 'Delete service',
    message: 'Are you sure you want to delete this service? This action cannot be undone.',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  }, async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/services/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const result = await response.json();

      if (result.success) {
        showNotification('✅ Service deleted successfully!', 'success');
        loadServices();
        loadStats();
        // Broadcast services update so public pages can refresh
        try {
          const bc = new BroadcastChannel('mastersolis_updates');
          bc.postMessage({ type: 'services-updated' });
          bc.close();
        } catch (err) {}
        try { localStorage.setItem('mastersolis_services_update', JSON.stringify({ ts: Date.now() })); } catch (err) {}
      } else {
        showNotification('❌ Failed to delete: ' + (result.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error deleting service:', error);
      showNotification('❌ Failed to delete service', 'error');
    }
  }, () => {
    // canceled - no-op
  });
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
        // Broadcast services update so public pages can refresh
        try {
          const bc = new BroadcastChannel('mastersolis_updates');
          bc.postMessage({ type: 'services-updated' });
          bc.close();
        } catch (err) {
          // ignore
        }
        try { localStorage.setItem('mastersolis_services_update', JSON.stringify({ ts: Date.now() })); } catch (err) {}
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
                    <button onclick="deleteMessage('${msg.id}')" class="text-secondary hover:text-primary-dark transition-colors" title="Delete message" aria-label="Delete message">
                      <i class="fas fa-trash"></i>
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

function deleteMessage(id) {
  showConfirmModal({
    title: 'Delete message',
    message: 'Are you sure you want to delete this message?',
    confirmText: 'Delete',
    cancelText: 'Cancel'
  }, async () => {
    try {
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
  }, () => {
    // canceled
  });
}

// Notification helper
function showNotification(message, type = 'info') {
  // Use toast notification system
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
