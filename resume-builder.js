// Initialize Supabase
const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let currentUser = null;
let resumeId = null;

// Check if editing existing resume
const urlParams = new URLSearchParams(window.location.search);
const editResumeId = urlParams.get('id');

// Check authentication
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabase.auth.getUser();
  currentUser = user;

  updateUI();
  if (currentUser) {
    if (editResumeId) {
      await loadResume(editResumeId);
    } else {
      // Pre-fill with user info
      await prefillUserInfo();
    }
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    currentUser = session?.user || null;
    updateUI();
    if (currentUser && !editResumeId) {
      prefillUserInfo();
    }
  });
});

function updateUI() {
  const logoutBtn = document.getElementById('logoutBtn');
  const loginBtn = document.getElementById('loginBtn');
  const builderSection = document.getElementById('builderSection');
  const loginRequired = document.getElementById('loginRequired');

  if (currentUser) {
    logoutBtn.style.display = 'inline-flex';
    loginBtn.style.display = 'none';
    builderSection.style.display = 'block';
    loginRequired.style.display = 'none';

    logoutBtn.onclick = async () => {
      await supabase.auth.signOut();
      toast.info('You have been logged out');
      window.location.reload();
    };
  } else {
    logoutBtn.style.display = 'none';
    loginBtn.style.display = 'inline-flex';
    builderSection.style.display = 'none';
    loginRequired.style.display = 'block';

    loginBtn.onclick = () => {
      window.location.href = 'index.html';
    };
  }
}

async function prefillUserInfo() {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();

    if (profile) {
      document.getElementById('name').value = profile.full_name || '';
    }
    document.getElementById('email').value = currentUser.email || '';
  } catch (error) {
    console.warn('Could not prefill user info:', error);
  }
}

async function loadResume(id) {
  try {
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', id)
      .eq('user_id', currentUser.id)
      .single();

    if (error) throw error;

    resumeId = id;
    document.getElementById('resumeId').value = id;
    document.getElementById('name').value = resume.name || '';
    document.getElementById('email').value = resume.email || '';
    document.getElementById('phone').value = resume.phone || '';
    document.getElementById('summary').value = resume.experience || '';
    document.getElementById('skills').value = Array.isArray(resume.skills) ? resume.skills.join(', ') : (resume.skills || '');
    document.getElementById('experience').value = resume.experience || '';
    document.getElementById('education').value = typeof resume.education === 'string' ? resume.education : (resume.education ? JSON.stringify(resume.education) : '');
  } catch (error) {
    console.error('Error loading resume:', error);
    toast.error('Failed to load resume');
  }
}

// AI Generation
document.getElementById('useAI')?.addEventListener('click', async () => {
  const name = document.getElementById('name').value || currentUser.user_metadata?.full_name || '';
  const email = document.getElementById('email').value || currentUser.email || '';
  
  if (!name || !email) {
    toast.error('Please fill in at least your name and email first');
    return;
  }

  const aiBtn = document.getElementById('useAI');
  const originalText = aiBtn.innerHTML;
  aiBtn.disabled = true;
  aiBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

  try {
    // Try to use AI function, fallback to prefix strings
    let aiSummary = null;
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-summary`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'resume',
            name: name,
            email: email,
            user_id: currentUser.id
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success && result.summary) {
            aiSummary = result.summary;
          }
        }
      }
    } catch (aiError) {
      console.warn('AI generation failed, using fallback:', aiError);
    }

    // Fallback: Use prefix strings to generate resume
    if (!aiSummary) {
      aiSummary = generateResumeWithPrefixStrings(name, email);
    }

    // Parse and fill form
    const parsed = parseResumeText(aiSummary);
    
    document.getElementById('name').value = parsed.name || name;
    document.getElementById('email').value = parsed.email || email;
    document.getElementById('phone').value = parsed.phone || '';
    document.getElementById('summary').value = parsed.summary || '';
    document.getElementById('skills').value = parsed.skills ? parsed.skills.join(', ') : '';
    document.getElementById('experience').value = parsed.experience || '';
    document.getElementById('education').value = parsed.education || '';

    toast.success('Resume generated successfully! Review and edit as needed.');
  } catch (error) {
    console.error('Error generating resume:', error);
    toast.error('Failed to generate resume. Please fill in manually.');
  } finally {
    aiBtn.disabled = false;
    aiBtn.innerHTML = originalText;
  }
});

// Generate resume using prefix strings (fallback)
function generateResumeWithPrefixStrings(name, email) {
  const templates = {
    summary: [
      `Experienced professional with a strong background in technology and innovation.`,
      `Dedicated professional seeking opportunities to contribute to dynamic teams.`,
      `Results-driven individual with expertise in software development and problem-solving.`
    ],
    skills: [
      'JavaScript, React, Node.js, Python, SQL, Git',
      'Project Management, Communication, Team Leadership, Problem Solving',
      'HTML, CSS, JavaScript, React, Node.js, MongoDB, Express'
    ],
    experience: [
      `Software Developer - Tech Company (2020-Present)\n• Developed and maintained web applications\n• Collaborated with cross-functional teams\n• Improved application performance by 30%`,
      `Junior Developer - Startup Inc (2018-2020)\n• Built responsive web interfaces\n• Participated in agile development processes\n• Fixed bugs and implemented new features`
    ],
    education: [
      `Bachelor of Science in Computer Science - University Name (2014-2018)\n• GPA: 3.7/4.0\n• Relevant coursework: Data Structures, Algorithms, Database Systems`,
      `Associate Degree in Information Technology - Community College (2012-2014)\n• Graduated with honors\n• Focus on web development and networking`
    ]
  };

  const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

  return `
Name: ${name}
Email: ${email}
Phone: +1 (555) 123-4567

PROFESSIONAL SUMMARY
${random(templates.summary)}

SKILLS
${random(templates.skills)}

EXPERIENCE
${random(templates.experience)}

EDUCATION
${random(templates.education)}
  `.trim();
}

// Parse resume text into structured format
function parseResumeText(text) {
  const lines = text.split('\n');
  const result = {
    name: '',
    email: '',
    phone: '',
    summary: '',
    skills: [],
    experience: '',
    education: ''
  };

  let currentSection = '';
  let sectionContent = [];

  for (let line of lines) {
    line = line.trim();
    if (!line) continue;

    // Detect sections
    if (line.match(/^name:?/i)) {
      result.name = line.replace(/^name:?\s*/i, '');
    } else if (line.match(/^email:?/i)) {
      result.email = line.replace(/^email:?\s*/i, '');
    } else if (line.match(/^phone:?/i)) {
      result.phone = line.replace(/^phone:?\s*/i, '');
    } else if (line.match(/^professional summary/i) || line.match(/^summary/i)) {
      currentSection = 'summary';
      sectionContent = [];
    } else if (line.match(/^skills/i)) {
      currentSection = 'skills';
      sectionContent = [];
    } else if (line.match(/^experience/i)) {
      currentSection = 'experience';
      sectionContent = [];
    } else if (line.match(/^education/i)) {
      currentSection = 'education';
      sectionContent = [];
    } else if (currentSection) {
      sectionContent.push(line);
    }
  }

  // Process sections
  if (currentSection === 'summary') {
    result.summary = sectionContent.join('\n');
  } else if (currentSection === 'skills') {
    result.skills = sectionContent.join(', ').split(',').map(s => s.trim()).filter(s => s);
  } else if (currentSection === 'experience') {
    result.experience = sectionContent.join('\n');
  } else if (currentSection === 'education') {
    result.education = sectionContent.join('\n');
  }

  return result;
}

// Handle form submission
document.getElementById('resumeForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  const resumeData = {
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone') || null,
    experience: formData.get('summary') || formData.get('experience') || null,
    skills: formData.get('skills') ? formData.get('skills').split(',').map(s => s.trim()).filter(s => s) : [],
    education: formData.get('education') || null
  };

  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';

  try {
    if (resumeId) {
      // Update existing resume
      const { data, error } = await supabase
        .from('resumes')
        .update({
          ...resumeData,
          updated_at: new Date().toISOString()
        })
        .eq('id', resumeId)
        .eq('user_id', currentUser.id)
        .select()
        .single();

      if (error) throw error;
      
      // Show success modal
      showResumeSuccessModal('updated');
    } else {
      // Set previous resumes to not latest
      await supabase
        .from('resumes')
        .update({ latest_active: false })
        .eq('user_id', currentUser.id);

      // Create new resume
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: currentUser.id,
          ...resumeData,
          latest_active: true
        })
        .select()
        .single();

      if (error) throw error;
      resumeId = data.id;
      document.getElementById('resumeId').value = data.id;
      
      // Show success modal
      showResumeSuccessModal('created');
    }
  } catch (error) {
    console.error('Error saving resume:', error);
    toast.error('Failed to save resume');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = originalText;
  }
});

// Preview functionality
document.getElementById('previewBtn')?.addEventListener('click', () => {
  const formData = new FormData(document.getElementById('resumeForm'));
  const previewContent = document.getElementById('previewContent');
  
  previewContent.innerHTML = `
    <div style="font-family: 'Georgia', serif; line-height: 1.6; color: #333;">
      <h1 style="border-bottom: 3px solid var(--primary-dark); padding-bottom: 0.5rem; margin-bottom: 1rem;">
        ${formData.get('name') || 'Your Name'}
      </h1>
      
      <div style="margin-bottom: 1.5rem; color: #666;">
        <p style="margin: 0.25rem 0;"><i class="fas fa-envelope"></i> ${formData.get('email') || 'your.email@example.com'}</p>
        ${formData.get('phone') ? `<p style="margin: 0.25rem 0;"><i class="fas fa-phone"></i> ${formData.get('phone')}</p>` : ''}
        ${formData.get('location') ? `<p style="margin: 0.25rem 0;"><i class="fas fa-map-marker-alt"></i> ${formData.get('location')}</p>` : ''}
      </div>

      ${formData.get('summary') ? `
        <div style="margin-bottom: 1.5rem;">
          <h2 style="color: var(--primary-dark); border-bottom: 2px solid var(--primary-light); padding-bottom: 0.25rem; margin-bottom: 0.75rem;">Professional Summary</h2>
          <p style="text-align: justify;">${formData.get('summary').replace(/\n/g, '<br>')}</p>
        </div>
      ` : ''}

      ${formData.get('skills') ? `
        <div style="margin-bottom: 1.5rem;">
          <h2 style="color: var(--primary-dark); border-bottom: 2px solid var(--primary-light); padding-bottom: 0.25rem; margin-bottom: 0.75rem;">Skills</h2>
          <p>${formData.get('skills').split(',').map(s => s.trim()).join(' • ')}</p>
        </div>
      ` : ''}

      ${formData.get('experience') ? `
        <div style="margin-bottom: 1.5rem;">
          <h2 style="color: var(--primary-dark); border-bottom: 2px solid var(--primary-light); padding-bottom: 0.25rem; margin-bottom: 0.75rem;">Experience</h2>
          <div style="white-space: pre-line;">${formData.get('experience')}</div>
        </div>
      ` : ''}

      ${formData.get('education') ? `
        <div style="margin-bottom: 1.5rem;">
          <h2 style="color: var(--primary-dark); border-bottom: 2px solid var(--primary-light); padding-bottom: 0.25rem; margin-bottom: 0.75rem;">Education</h2>
          <div style="white-space: pre-line;">${formData.get('education')}</div>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('previewModal').style.display = 'block';
  document.body.style.overflow = 'hidden';
});

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
  document.body.style.overflow = '';
}

// Show resume success modal
function showResumeSuccessModal(action = 'created') {
  const modal = document.createElement('div');
  modal.id = 'resumeSuccessModal';
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
    z-index: 10000;
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
      <h2 style="color: var(--dark); margin-bottom: 1rem; font-size: 1.75rem;">Resume ${action === 'created' ? 'Created' : 'Updated'}!</h2>
      <p style="color: var(--gray); margin-bottom: 2rem; line-height: 1.6;">
        Your resume has been ${action === 'created' ? 'created' : 'updated'} successfully. You can view and manage it in your profile.
      </p>
      <div style="display: flex; gap: 1rem; justify-content: center;">
        <button onclick="closeResumeSuccessModal()" class="btn btn-primary" style="min-width: 150px;">
          <i class="fas fa-check"></i> OK
        </button>
        <a href="profile.html" class="btn btn-outline" style="min-width: 150px; color: var(--primary-dark); border-color: var(--primary-dark);">
          <i class="fas fa-user"></i> View Profile
        </a>
      </div>
    </div>
  `;
  
  // Add animations if not already added
  if (!document.getElementById('resumeModalAnimations')) {
    const style = document.createElement('style');
    style.id = 'resumeModalAnimations';
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

function closeResumeSuccessModal() {
  const modal = document.getElementById('resumeSuccessModal');
  if (modal) {
    modal.style.animation = 'fadeOut 0.3s ease';
    setTimeout(() => {
      modal.remove();
      document.body.style.overflow = '';
    }, 300);
  }
}

// Make function globally available
window.closeResumeSuccessModal = closeResumeSuccessModal;

