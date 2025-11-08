const SUPABASE_URL = "https://jqxaufurcholgqwskybi.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpxeGF1ZnVyY2hvbGdxd3NreWJpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI1MTQyODUsImV4cCI6MjA3ODA5MDI4NX0.FYMlEiIecY00FKoE9jq3L8hI8fzNqQ3w7DLBiiWAy_g";

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("✅ Supabase initialized:", supabase);

// ========================================
// NAVIGATION
// ========================================

const navbar = document.querySelector('.navbar');
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

document.getElementById("adminLoginBtn")?.addEventListener("click", () => {
  window.location.href = "admin-login.html";
});

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            const offsetTop = targetSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
        
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        navMenu.classList.remove('active');
    });
});

window.addEventListener('scroll', () => {
    let current = '';
    const sections = document.querySelectorAll('section[id]');
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// ========================================
// PROJECT FILTERS
// ========================================

const filterButtons = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        const filter = button.getAttribute('data-filter');
        
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        projectCards.forEach(card => {
            if (filter === 'all') {
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                }, 10);
            } else {
                const categories = card.getAttribute('data-category');
                if (categories && categories.includes(filter)) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            }
        });
    });
});

// ========================================
// SERVICE LEARN MORE MODALS
// ========================================

const serviceModal = document.getElementById('serviceModal');
const serviceModalContent = serviceModal.querySelector('.service-modal-content');
const serviceModalClose = serviceModal.querySelector('.service-modal-close');
const serviceModalOverlay = serviceModal.querySelector('.service-modal-overlay');

const serviceData = {
    ai: {
        title: 'AI & Machine Learning Solutions',
        description: 'Transform your business with cutting-edge artificial intelligence and machine learning technologies.',
        features: [
            'Custom AI model development and training',
            'Natural Language Processing (NLP) solutions',
            'Computer Vision and image recognition',
            'Predictive analytics and forecasting',
            'AI-powered automation and optimization',
            'Machine learning pipeline development'
        ],
        benefits: [
            'Reduce operational costs by up to 40%',
            'Improve decision-making with data-driven insights',
            'Automate repetitive tasks and workflows',
            'Enhance customer experience with personalization',
            'Gain competitive advantage through innovation'
        ]
    },
    software: {
        title: 'Custom Software Development',
        description: 'Build scalable, secure, and tailored software solutions designed for your unique business needs.',
        features: [
            'Full-stack web application development',
            'Enterprise software solutions',
            'API development and integration',
            'Database design and optimization',
            'Legacy system modernization',
            'Microservices architecture'
        ],
        benefits: [
            'Tailored solutions that fit your exact requirements',
            'Scalable architecture for future growth',
            'Enhanced productivity and efficiency',
            'Seamless integration with existing systems',
            'Ongoing support and maintenance'
        ]
    },
    cloud: {
        title: 'Cloud Solutions',
        description: 'Migrate, manage, and optimize your infrastructure with enterprise-grade cloud solutions.',
        features: [
            'Cloud migration and deployment',
            'Multi-cloud and hybrid cloud strategies',
            'Infrastructure as Code (IaC)',
            'Cloud security and compliance',
            'Cost optimization and monitoring',
            'DevOps and CI/CD implementation'
        ],
        benefits: [
            'Reduce infrastructure costs by up to 50%',
            'Improve scalability and flexibility',
            'Enhanced security and compliance',
            '99.99% uptime and reliability',
            'Disaster recovery and backup solutions'
        ]
    },
    mobile: {
        title: 'Mobile App Development',
        description: 'Create exceptional mobile experiences for iOS and Android that engage and delight users.',
        features: [
            'Native iOS and Android development',
            'Cross-platform development (React Native, Flutter)',
            'Progressive Web Apps (PWA)',
            'Mobile UI/UX design',
            'App store optimization',
            'Mobile backend development'
        ],
        benefits: [
            'Reach millions of mobile users',
            'Increase customer engagement',
            'Drive revenue through mobile channels',
            'Seamless user experience across devices',
            'Regular updates and feature enhancements'
        ]
    },
    security: {
        title: 'Cybersecurity Solutions',
        description: 'Protect your digital assets with comprehensive security solutions and threat management.',
        features: [
            'Security audits and assessments',
            'Penetration testing and vulnerability scanning',
            'Security Operations Center (SOC)',
            'Incident response and forensics',
            'Compliance and regulatory support',
            'Security training and awareness'
        ],
        benefits: [
            'Protect against cyber threats and attacks',
            'Ensure compliance with regulations',
            'Minimize risk and potential data breaches',
            '24/7 security monitoring and response',
            'Build customer trust and confidence'
        ]
    },
    analytics: {
        title: 'Data Analytics',
        description: 'Transform data into actionable insights with advanced analytics and visualization solutions.',
        features: [
            'Business intelligence and reporting',
            'Data warehousing and ETL',
            'Real-time analytics and dashboards',
            'Big data processing and analysis',
            'Data visualization and storytelling',
            'Predictive and prescriptive analytics'
        ],
        benefits: [
            'Make data-driven business decisions',
            'Identify trends and opportunities',
            'Improve operational efficiency',
            'Increase revenue through insights',
            'Competitive advantage through data'
        ]
    }
};

document.querySelectorAll('.learn-more-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const service = e.target.closest('.learn-more-btn').dataset.service;
        if (service && serviceData[service]) {
            openServiceModal(serviceData[service]);
        }
    });
});

function openServiceModal(data) {
    serviceModalContent.innerHTML = `
        <h2>${data.title}</h2>
        <p style="font-size: 1.125rem; color: var(--gray); margin-bottom: 2rem;">${data.description}</p>
        
        <h3>Key Features</h3>
        <ul>
            ${data.features.map(feature => `<li>${feature}</li>`).join('')}
        </ul>
        
        <h3>Business Benefits</h3>
        <ul>
            ${data.benefits.map(benefit => `<li>${benefit}</li>`).join('')}
        </ul>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: var(--light); border-radius: var(--radius-lg); text-align: center;">
            <p style="margin-bottom: 1rem; color: var(--dark);">Ready to get started?</p>
            <a href="#contact" class="btn btn-primary" onclick="closeServiceModal()">Contact Us</a>
        </div>
    `;
    serviceModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeServiceModal() {
    serviceModal.classList.remove('show');
    document.body.style.overflow = '';
}

serviceModalClose.addEventListener('click', closeServiceModal);
serviceModalOverlay.addEventListener('click', closeServiceModal);

// ========================================
// PROJECT LEARN MORE MODALS
// ========================================

const projectModal = document.getElementById('projectModal');
const projectModalContent = projectModal.querySelector('.service-modal-content');
const projectModalClose = projectModal.querySelector('.service-modal-close');
const projectModalOverlay = projectModal.querySelector('.service-modal-overlay');

const projectData = {
    analytics: {
        title: 'AI-Powered Analytics Platform',
        description: 'A comprehensive enterprise analytics solution providing real-time insights and predictive capabilities.',
        challenge: 'Our client needed a unified platform to analyze data from multiple sources and provide actionable insights to decision-makers across the organization.',
        solution: 'We developed a custom AI-powered analytics platform that integrates with their existing systems, processes data in real-time, and provides intuitive dashboards and predictive models.',
        results: [
            '60% reduction in data processing time',
            '45% improvement in decision-making speed',
            '$2M annual cost savings',
            '95% user satisfaction rate'
        ],
        technologies: ['Python', 'TensorFlow', 'React', 'PostgreSQL', 'AWS']
    },
    ecommerce: {
        title: 'E-Commerce Platform',
        description: 'Modern shopping experience with advanced features including AI recommendations and seamless checkout.',
        challenge: 'The client required a scalable e-commerce platform with personalized shopping experiences and high-performance capabilities.',
        solution: 'We built a modern, responsive e-commerce platform with AI-powered recommendations, advanced search, and optimized checkout flow.',
        results: [
            '250% increase in conversion rate',
            '180% growth in average order value',
            '99.9% platform uptime',
            '4.8/5 customer satisfaction'
        ],
        technologies: ['React', 'Node.js', 'MongoDB', 'Stripe', 'AWS']
    },
    fitness: {
        title: 'Fitness Tracking App',
        description: 'Health & wellness mobile app with AI coaching and personalized workout plans.',
        challenge: 'Create an engaging fitness app that provides personalized coaching and tracks user progress across multiple metrics.',
        solution: 'Developed a cross-platform mobile app with AI-powered coaching, social features, and comprehensive health tracking.',
        results: [
            '500K+ active users',
            '4.7 star app store rating',
            '85% user retention rate',
            'Featured in App Store'
        ],
        technologies: ['React Native', 'Node.js', 'TensorFlow', 'Firebase']
    },
    cloud: {
        title: 'Cloud Infrastructure Migration',
        description: 'Enterprise-scale AWS migration and optimization for improved performance and cost efficiency.',
        challenge: 'Migrate legacy infrastructure to cloud while maintaining zero downtime and improving performance.',
        solution: 'Executed a phased migration strategy with Infrastructure as Code, implementing best practices for security, scalability, and cost optimization.',
        results: [
            '55% reduction in infrastructure costs',
            '3x improvement in deployment speed',
            'Zero downtime during migration',
            '99.99% uptime achieved'
        ],
        technologies: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'CI/CD']
    },
    crm: {
        title: 'Smart CRM System',
        description: 'Intelligent customer relationship management with predictive analytics and automation.',
        challenge: 'Replace outdated CRM with modern solution featuring AI-driven insights and workflow automation.',
        solution: 'Built custom CRM platform with AI-powered lead scoring, automated workflows, and comprehensive analytics.',
        results: [
            '40% increase in sales productivity',
            '65% faster lead response time',
            '90% process automation',
            '$1.5M additional revenue'
        ],
        technologies: ['React', 'Python', 'PostgreSQL', 'ML Models', 'AWS']
    },
    delivery: {
        title: 'Delivery Management App',
        description: 'Real-time tracking and route optimization for logistics and delivery services.',
        challenge: 'Optimize delivery routes and provide real-time tracking for customers and drivers.',
        solution: 'Created a comprehensive delivery management system with AI-powered route optimization and real-time GPS tracking.',
        results: [
            '35% reduction in delivery times',
            '25% fuel cost savings',
            '95% on-time delivery rate',
            '50K+ deliveries per month'
        ],
        technologies: ['Flutter', 'Node.js', 'MongoDB', 'Google Maps API', 'Firebase']
    }
};

document.querySelectorAll('.project-learn-more').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const project = e.target.closest('.project-learn-more').dataset.project;
        if (project && projectData[project]) {
            openProjectModal(projectData[project]);
        }
    });
});

function openProjectModal(data) {
    projectModalContent.innerHTML = `
        <h2>${data.title}</h2>
        <p style="font-size: 1.125rem; color: var(--gray); margin-bottom: 2rem;">${data.description}</p>
        
        <h3>The Challenge</h3>
        <p style="color: var(--gray); margin-bottom: 1.5rem;">${data.challenge}</p>
        
        <h3>Our Solution</h3>
        <p style="color: var(--gray); margin-bottom: 1.5rem;">${data.solution}</p>
        
        <h3>Results & Impact</h3>
        <ul>
            ${data.results.map(result => `<li>${result}</li>`).join('')}
        </ul>
        
        <h3>Technologies Used</h3>
        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 1rem;">
            ${data.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
        </div>
        
        <div style="margin-top: 2rem; padding: 1.5rem; background: var(--light); border-radius: var(--radius-lg); text-align: center;">
            <p style="margin-bottom: 1rem; color: var(--dark);">Interested in a similar solution?</p>
            <a href="#contact" class="btn btn-primary" onclick="closeProjectModal()">Get In Touch</a>
        </div>
    `;
    projectModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeProjectModal() {
    projectModal.classList.remove('show');
    document.body.style.overflow = '';
}

projectModalClose.addEventListener('click', closeProjectModal);
projectModalOverlay.addEventListener('click', closeProjectModal);

// ========================================
// CONTACT FORM
// ========================================

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);

        const { data: inserted, error, status } = await supabase
            .from("contact_messages")
            .insert([{
                name: data.name,
                email: data.email,
                phone: data.phone,
                subject: data.subject,
                message: data.message
            }])
            .select();

        console.log("Insert response status:", status, "error:", error, "data:", inserted);

        if (error) {
            toast.error(`Insert failed (${status ?? "n/a"}): ${error.message ?? "See console"}`);
            console.error("Insert Error details:", error);
            return;
        }

        toast.success("Your message was submitted successfully!");
        contactForm.reset();
    });
}

// ========================================
// LOGIN/SIGNUP MODAL
// ========================================

const loginBtn = document.getElementById('loginBtn');
const authModal = document.getElementById('authModal');
const authModalOverlay = document.getElementById('authModalOverlay');
const authClose = document.getElementById('authClose');

const loginFormContainer = document.getElementById('loginForm');
const signupFormContainer = document.getElementById('signupForm');
const adminLoginFormContainer = document.getElementById('adminLoginForm');

const showSignupBtn = document.getElementById('showSignup');
const showLoginBtn = document.getElementById('showLogin');
const showAdminLoginBtn = document.getElementById('showAdminLogin');
const backToUserLoginBtn = document.getElementById('backToUserLogin');

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
      authModal.classList.add('active');
      document.body.style.overflow = 'hidden';
  });
}

function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
}

if (authClose) {
  authClose.addEventListener('click', closeAuthModal);
}

if (authModalOverlay) {
  authModalOverlay.addEventListener('click', closeAuthModal);
}

if (showSignupBtn) {
  showSignupBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormContainer.style.display = 'none';
      signupFormContainer.style.display = 'block';
      adminLoginFormContainer.style.display = 'none';
  });
}

if (showLoginBtn) {
  showLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormContainer.style.display = 'block';
      signupFormContainer.style.display = 'none';
      adminLoginFormContainer.style.display = 'none';
  });
}

if (showAdminLoginBtn) {
  showAdminLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormContainer.style.display = 'none';
      signupFormContainer.style.display = 'none';
      adminLoginFormContainer.style.display = 'block';
  });
}

if (backToUserLoginBtn) {
  backToUserLoginBtn.addEventListener('click', (e) => {
      e.preventDefault();
      loginFormContainer.style.display = 'block';
      signupFormContainer.style.display = 'none';
      adminLoginFormContainer.style.display = 'none';
  });
}

const userLoginForm = document.getElementById('userLoginForm');
if (userLoginForm) {
    userLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(userLoginForm);
        const data = Object.fromEntries(formData);
        
        try {
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });

            if (error) throw error;

            toast.success('Login successful!');
            closeAuthModal();
            
            // Update UI immediately
            if (typeof updateAuthUI === 'function') {
                await updateAuthUI();
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.message || 'Login failed. Please check your credentials.');
        }
    });
}

const userSignupForm = document.getElementById('userSignupForm');
if (userSignupForm) {
    userSignupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(userSignupForm);
        const data = Object.fromEntries(formData);
        
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }

        if (data.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }
        
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        full_name: data.name
                    }
                }
            });

            if (error) throw error;

            toast.success('Account created successfully! Please check your email to verify your account.');
            
            loginFormContainer.style.display = 'block';
            signupFormContainer.style.display = 'none';
            userSignupForm.reset();
        } catch (error) {
            console.error('Signup error:', error);
            toast.error(error.message || 'Failed to create account. Please try again.');
        }
    });
}

const adminLoginFormSubmit = document.getElementById('adminLoginFormSubmit');

if (adminLoginFormSubmit) {
    adminLoginFormSubmit.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(adminLoginFormSubmit);
        const data = Object.fromEntries(formData);

        try {
            // Use Supabase Auth for admin login
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password
            });

            if (error) throw error;

            // Check if user has admin role in metadata
            const userRole = authData.user?.user_metadata?.role;
            if (userRole !== 'admin') {
                await supabase.auth.signOut();
                throw new Error('Access denied. Admin privileges required.');
            }

            // Store session info
            localStorage.setItem('adminSession', JSON.stringify(authData));
            localStorage.setItem('adminUser', JSON.stringify(authData.user));
            
            // Show success message
            toast.success('Admin login successful! Redirecting to admin dashboard...');

            // Close modal & redirect to admin dashboard
            setTimeout(() => {
                closeAuthModal();
                window.location.href = "admin.html";
            }, 1000);
        } catch (error) {
            console.error('Admin login error:', error);
            toast.error(error.message || 'Admin login failed. Please check your credentials.');
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (authModal.classList.contains('active')) closeAuthModal();
        if (serviceModal.classList.contains('show')) closeServiceModal();
        if (projectModal.classList.contains('show')) closeProjectModal();
        if (resumeModal.classList.contains('show')) closeResumeModal();
    }
});

// ========================================
// RESUME BUILDER MODAL
// ========================================

const openResumeModalBtn = document.getElementById('openResumeModal');
const resumeModal = document.getElementById('resumeModal');
const closeResumeModalBtn = document.getElementById('closeResumeModal');
const resumeModalOverlay = resumeModal ? resumeModal.querySelector('.resume-modal__overlay') : null;

const resumeFormStep = document.getElementById('resumeFormStep');
const resumeTemplateStep = document.getElementById('resumeTemplateStep');
const resumeForm = document.getElementById('resumeForm');

let resumeFormData = {};

if (openResumeModalBtn && resumeModal && resumeFormStep && resumeTemplateStep) {
  openResumeModalBtn.addEventListener('click', () => {
      resumeModal.classList.add('show');
      resumeFormStep.classList.add('active');
      resumeTemplateStep.classList.remove('active');
      document.body.style.overflow = 'hidden';
  });
}

function closeResumeModal() {
    resumeModal.classList.remove('show');
    resumeFormStep.classList.remove('active');
    resumeTemplateStep.classList.remove('active');
    document.body.style.overflow = '';
    resumeForm.reset();
    resumeFormData = {};
}

if (closeResumeModalBtn) {
  closeResumeModalBtn.addEventListener('click', closeResumeModal);
}

if (resumeModalOverlay) {
  resumeModalOverlay.addEventListener('click', closeResumeModal);
}

if (resumeForm) {
  resumeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const formData = new FormData(resumeForm);
      resumeFormData = Object.fromEntries(formData);
      
      if (resumeFormStep && resumeTemplateStep) {
        resumeFormStep.classList.remove('active');
        resumeTemplateStep.classList.add('active');
      }
  });
}

document.querySelectorAll('.template-card').forEach(card => {
    card.addEventListener('click', () => {
        const template = card.dataset.template;
        generateResume(template);
    });
});

function generateResume(template) {
    console.log('Generating resume with template:', template);
    console.log('Resume data:', resumeFormData);
    
    toast.success(`Resume generated successfully with ${template} template!<br><br>In production, this would generate a downloadable PDF resume with your information.`);
    closeResumeModal();
}

// ========================================
// JOB APPLICATION BUTTONS
// ========================================

const applyButtons = document.querySelectorAll('.apply-btn');

applyButtons.forEach(button => {
    button.addEventListener('click', () => {
        toast.info('Job application form will be implemented in the next phase. This will open a modal with an application form and resume upload functionality.');
    });
});

// ========================================
// CHATBOT WIDGET
// ========================================

const chatbotButton = document.getElementById('chatbotButton');
const chatbotWindow = document.getElementById('chatbotWindow');
const chatbotClose = document.getElementById('chatbotClose');
const chatbotInput = document.getElementById('chatbotInput');
const chatbotSend = document.getElementById('chatbotSend');
const chatbotMessages = document.getElementById('chatbotMessages');

chatbotButton.addEventListener('click', () => {
    chatbotWindow.classList.toggle('active');
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
});

function sendChatMessage() {
    const message = chatbotInput.value.trim();
    if (message) {
        addChatMessage(message, 'user');
        chatbotInput.value = '';
        
        setTimeout(() => {
            const botResponse = getBotResponse(message);
            addChatMessage(botResponse, 'bot');
        }, 1000);
    }
}

chatbotSend.addEventListener('click', sendChatMessage);

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

function addChatMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chatbot-message ${type}`;
    messageDiv.innerHTML = `<p>${message}</p>`;
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function getBotResponse(message) {
    const responses = {
        'hello': 'Hello! How can I assist you today?',
        'hi': 'Hi there! What can I help you with?',
        'services': 'We offer AI & ML, Custom Software Development, Cloud Solutions, Mobile Apps, Cybersecurity, and Data Analytics. Which service interests you?',
        'contact': 'You can reach us at info@mastersolis.com or call +1 (555) 123-4567. Would you like to schedule a consultation?',
        'careers': 'We have several open positions! Check out our Careers page to see current openings and apply.',
        'pricing': 'Our pricing varies based on project requirements. Would you like to schedule a consultation to discuss your specific needs?',
    };
    
    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return 'Thank you for your message! A team member will get back to you shortly. You can also reach us directly at info@mastersolis.com.';
}

// ========================================
// SCROLL TO TOP BUTTON
// ========================================

const scrollTopButton = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
    if (window.scrollY > 500) {
        scrollTopButton.classList.add('visible');
    } else {
        scrollTopButton.classList.remove('visible');
    }
});

scrollTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========================================
// ANIMATIONS ON SCROLL
// ========================================

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.service-card, .project-card, .blog-card, .team-card, .testimonial-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ========================================
// HERO SCROLL INDICATOR
// ========================================

const heroScroll = document.querySelector('.hero-scroll');

if (heroScroll) {
    heroScroll.addEventListener('click', () => {
        const aboutSection = document.getElementById('about');
        if (aboutSection) {
            const offsetTop = aboutSection.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
}

// ========================================
// FORM VALIDATION
// ========================================

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\+\(\)]+$/;
    return re.test(phone);
}

const emailInputs = document.querySelectorAll('input[type="email"]');
const phoneInputs = document.querySelectorAll('input[type="tel"]');

emailInputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.value && !validateEmail(input.value)) {
            input.style.borderColor = '#f43f5e';
        } else {
            input.style.borderColor = '';
        }
    });
});

phoneInputs.forEach(input => {
    input.addEventListener('blur', () => {
        if (input.value && !validatePhone(input.value)) {
            input.style.borderColor = '#f43f5e';
        } else {
            input.style.borderColor = '';
        }
    });
});

// ========================================
// STAT COUNTER ANIMATION
// ========================================

function animateCounter(element, target) {
    let current = 0;
    const increment = target / 100;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + '+';
        }
    }, 20);
}

const statNumbers = document.querySelectorAll('.stat-number');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !statsAnimated) {
            statsAnimated = true;
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent);
                animateCounter(stat, target);
            });
        }
    });
}, { threshold: 0.5 });

const statsSection = document.querySelector('.stats-section');
if (statsSection) {
    statsObserver.observe(statsSection);
}

// ========================================
// AUTH STATE MANAGEMENT
// ========================================

// Check auth state on load and update UI
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
        toast.info('You have been logged out');
        window.location.reload();
      };
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'inline-flex';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (myApplicationsNav) myApplicationsNav.style.display = 'none';
  }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  updateAuthUI();
  
  if (event === 'SIGNED_IN') {
    toast.success('Welcome back!');
  } else if (event === 'SIGNED_OUT') {
    toast.info('You have been logged out');
  }
});

// Initialize auth UI on page load
document.addEventListener('DOMContentLoaded', async () => {
  await updateAuthUI();
});

// ========================================
// INITIALIZE
// ========================================

console.log('Mastersolis Infotech website loaded successfully!');
console.log('Ready for backend integration.');