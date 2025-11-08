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
// BLOG READ MORE MODAL
// ========================================

const blogModal = document.getElementById('blogModal');
const blogModalContent = blogModal.querySelector('.blog-modal-content');
const blogModalClose = blogModal.querySelector('.blog-modal-close');
const blogModalOverlay = blogModal.querySelector('.service-modal-overlay');

const blogData = {
    'ai-business': {
        title: 'The Future of AI in Business',
        author: 'Sarah Mitchell',
        date: 'Nov 5, 2025',
        category: 'AI & ML',
        image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop',
        content: `<p>Artificial intelligence is rapidly reshaping how businesses operate. From automating routine tasks to providing deep insights through predictive analytics, AI enables companies to make smarter, faster decisions.</p>
                  <p>In this article we explore the key areas where AI delivers immediate value: process automation, customer personalization, operational optimization, and data-driven strategy. We'll also look at practical steps organizations can take to adopt AI responsibly and effectively.</p>
                  <h4>Getting Started with AI</h4>
                  <p>Begin by identifying high-impact use cases, collect quality data, prototype quickly, and measure outcomes. Building cross-functional teams with domain experts will speed adoption and reduce risk.</p>`
    },
    'cloud-migration': {
        title: 'Cloud Migration Best Practices',
        author: 'Michael Chen',
        date: 'Nov 3, 2025',
        category: 'Cloud',
        image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=600&fit=crop',
        content: `<p>Migrating to the cloud can unlock scalability, resilience, and cost savings — but only when done with care. Successful migrations begin with an assessment of the current estate and a clear migration strategy.</p>
                  <p>We cover lift-and-shift vs refactor, data migration approaches, security and compliance considerations, and validation strategies to ensure minimal downtime and preserved data integrity.</p>`
    },
    'web-trends': {
        title: 'Modern Web Development Trends',
        author: 'Emma Rodriguez',
        date: 'Nov 1, 2025',
        category: 'Development',
        image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=1200&h=600&fit=crop',
        content: `<p>Web development continues to evolve rapidly. In 2025, developers are focusing on performance, accessibility, edge computing, and AI-assisted tooling.</p>
                  <p>Framework choices, API-first architectures, and strong developer experience are critical factors to build maintainable and scalable web applications.</p>`
    }
};

document.querySelectorAll('.blog-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const key = link.dataset.blog;
        if (key && blogData[key]) {
            openBlogModal(blogData[key]);
        } else {
            // fallback: try to derive from title text
            const card = link.closest('.blog-card');
            const title = card?.querySelector('h3')?.textContent?.trim() || '';
            const derivedKey = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            if (blogData[derivedKey]) openBlogModal(blogData[derivedKey]);
            else console.warn('No blog content found for', key || derivedKey);
        }
    });
});

function openBlogModal(data) {
    blogModalContent.innerHTML = `
        <div class="blog-modal-inner">
            <img src="${data.image}" alt="${data.title}" style="width:100%; height:auto; border-radius:8px; margin-bottom:1rem;" />
            <h2>${data.title}</h2>
            <div style="color:var(--gray); margin-bottom:0.75rem; font-size:0.95rem;">${data.date} · ${data.author} · ${data.category}</div>
            <div style="color:var(--dark); line-height:1.6;">${data.content}</div>
            <div style="margin-top:1.5rem; text-align:center;"><a href="#contact" class="btn btn-primary" onclick="closeBlogModal()">Contact Us</a></div>
        </div>
    `;
    blogModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

function closeBlogModal() {
    blogModal.classList.remove('show');
    document.body.style.overflow = '';
}

blogModalClose.addEventListener('click', closeBlogModal);
blogModalOverlay.addEventListener('click', closeBlogModal);

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

loginBtn.addEventListener('click', () => {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
}

authClose.addEventListener('click', closeAuthModal);
authModalOverlay.addEventListener('click', closeAuthModal);

showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    signupFormContainer.style.display = 'block';
    adminLoginFormContainer.style.display = 'none';
});

showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'block';
    signupFormContainer.style.display = 'none';
    adminLoginFormContainer.style.display = 'none';
});

showAdminLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'none';
    signupFormContainer.style.display = 'none';
    adminLoginFormContainer.style.display = 'block';
});

backToUserLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginFormContainer.style.display = 'block';
    signupFormContainer.style.display = 'none';
    adminLoginFormContainer.style.display = 'none';
});

const userLoginForm = document.getElementById('userLoginForm');
if (userLoginForm) {
    userLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(userLoginForm);
        const data = Object.fromEntries(formData);
        
        console.log('User login:', data);
        toast.info('Login functionality will be implemented in the backend integration phase.');
        closeAuthModal();
    });
}

const userSignupForm = document.getElementById('userSignupForm');
if (userSignupForm) {
    userSignupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(userSignupForm);
        const data = Object.fromEntries(formData);
        
        if (data.password !== data.confirmPassword) {
            toast.error('Passwords do not match!');
            return;
        }
        
<<<<<<< HEAD
        console.log('User signup:', data);
        toast.success('Account created successfully! You can now login.');
        
        loginFormContainer.style.display = 'block';
        signupFormContainer.style.display = 'none';
        userSignupForm.reset();
=======
        try {
            const { data: authData, error } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        name: data.name,
                        full_name: data.name
                    },
                    emailRedirectTo: window.location.origin
                }
            });

            if (error) {
                if (error.message.includes('already registered') || error.message.includes('User already registered')) {
                    toast.error('An account with this email already exists. Please log in instead.');
                    loginFormContainer.style.display = 'block';
                    signupFormContainer.style.display = 'none';
                    return;
                } else if (error.message.includes('Password')) {
                    toast.error('Password does not meet requirements. Please use a stronger password.');
                    return;
                } else {
                    throw error;
                }
            }

            // Create profile entry after signup
            if (authData.user) {
                try {
                    await supabase.from('profiles').insert({
                        id: authData.user.id,
                        full_name: data.name,
                        is_admin: false
                    });
                } catch (profileError) {
                    console.warn('Could not create profile:', profileError);
                    // Profile might already exist or table doesn't exist yet
                }
            }

            // Check if email confirmation is required
            if (authData.user && !authData.session) {
                toast.success('Account created successfully! Please check your email to verify your account before logging in.');
            } else {
                toast.success('Account created successfully! You can now log in.');
            }
            
            loginFormContainer.style.display = 'block';
            signupFormContainer.style.display = 'none';
            userSignupForm.reset();
        } catch (error) {
            console.error('Signup error:', error);
            toast.error(error.message || 'Failed to create account. Please try again.');
        }
>>>>>>> bd76b1ac5da89082c240eefed5fc44a143370125
    });
}

const adminLoginFormSubmit = document.getElementById('adminLoginFormSubmit');

if (adminLoginFormSubmit) {
    adminLoginFormSubmit.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(adminLoginFormSubmit);
        const data = Object.fromEntries(formData);

        try {
            // Check if server is running first
            try {
                const healthCheck = await fetch('/api/health');
                if (!healthCheck.ok) {
                    throw new Error('Server health check failed');
                }
            } catch (healthError) {
                toast.error("Cannot connect to server. Please make sure:<br>1. The backend server is running (npm start)<br>2. Server is running on http://localhost:3000<br>3. No firewall is blocking the connection");
                console.error('Server health check failed:', healthError);
                return;
            }

<<<<<<< HEAD
            // Call backend login endpoint
            const response = await fetch('/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: data.email,
                    password: data.password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ error: 'Network error' }));
                throw new Error(errorData.error || `HTTP ${response.status}`);
            }

            const result = await response.json();

            if (result.success && result.token) {
                // Store token in localStorage
                localStorage.setItem('adminToken', result.token);
                localStorage.setItem('adminUser', JSON.stringify(result.user));
                
                // Show success message
                toast.success('Login successful! Redirecting to admin dashboard...');
                
                // Close modal & redirect to admin dashboard
                setTimeout(() => {
                    closeAuthModal();
                    window.location.href = "admin.html";
                }, 1000);
            } else {
                toast.error(result.error || 'Login failed');
=======
            // Sign in with Supabase Auth
            const { data: authData, error } = await supabase.auth.signInWithPassword({
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD
            });

            if (error) {
                // If user doesn't exist, try to create admin user
                if (error.message.includes('Invalid login credentials') || error.message.includes('User not found')) {
                    console.log('Admin user not found, attempting to create...');
                    
                    // Try to create admin user
                    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                        email: ADMIN_EMAIL,
                        password: ADMIN_PASSWORD,
                        options: {
                            data: {
                                name: 'Admin',
                                full_name: 'Admin User'
                            },
                            emailRedirectTo: window.location.origin
                        }
                    });

                    if (signUpError) {
                        throw new Error('Unable to create admin account. Please contact support.');
                    }

                    // Create profile with is_admin = true
                    if (signUpData.user) {
                        try {
                            await supabase.from('profiles').insert({
                                id: signUpData.user.id,
                                full_name: 'Admin User',
                                is_admin: true
                            });
                        } catch (profileError) {
                            console.warn('Could not create admin profile:', profileError);
                        }
                    }

                    // User created, but might need email confirmation
                    if (signUpData.user && !signUpData.session) {
                        throw new Error('Admin account created. Please check your email to verify the account, then try logging in again.');
                    }

                    // If session exists, proceed with login
                    if (signUpData.session) {
                        // Check profile for admin status
                        const { data: profile } = await supabase
                            .from('profiles')
                            .select('is_admin')
                            .eq('id', signUpData.user.id)
                            .single();

                        if (!profile || !profile.is_admin) {
                            await supabase.auth.signOut();
                            throw new Error('Not admin');
                        }

                        // Store session and redirect
                        localStorage.setItem('adminSession', JSON.stringify(signUpData.session));
                        localStorage.setItem('adminUser', JSON.stringify(signUpData.user));
                        toast.success('Admin login successful! Redirecting to admin dashboard...');
                        setTimeout(() => {
                            closeAuthModal();
                            window.location.href = "admin.html";
                        }, 1000);
                        return;
                    }
                } else {
                    // Handle other errors
                    if (error.message.includes('Email not confirmed')) {
                        throw new Error('Please verify your email before logging in. Check your inbox for a confirmation link.');
                    } else {
                        throw error;
                    }
                }
            }

            // Check profile for admin status
            const user = authData?.user || authData?.session?.user;
            if (!user) {
                throw new Error('Failed to retrieve user information');
            }

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single();

            if (profileError || !profile) {
                // Profile doesn't exist, create it with admin status for this email
                if (user.email === ADMIN_EMAIL) {
                    try {
                        await supabase.from('profiles').insert({
                            id: user.id,
                            full_name: user.user_metadata?.full_name || 'Admin User',
                            is_admin: true
                        });
                    } catch (insertError) {
                        console.warn('Could not create admin profile:', insertError);
                    }
                    // Allow access for admin email even if profile creation fails
                } else {
                    await supabase.auth.signOut();
                    throw new Error('Not admin');
                }
            } else if (!profile.is_admin) {
                await supabase.auth.signOut();
                throw new Error('Not admin');
>>>>>>> bd76b1ac5da89082c240eefed5fc44a143370125
            }
        } catch (error) {
<<<<<<< HEAD
            console.error('Login error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                toast.error("Cannot connect to server. Please make sure:<br>1. The backend server is running (npm start)<br>2. Server is running on http://localhost:3000<br>3. No firewall is blocking the connection");
            } else {
                toast.error("Login failed: " + error.message);
=======
            console.error('Admin login error:', error);
            if (error.message === 'Not admin') {
                toast.error('Access denied. Admin privileges required.');
            } else {
                toast.error(error.message || 'Admin login failed. Please check your credentials.');
>>>>>>> bd76b1ac5da89082c240eefed5fc44a143370125
            }
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (authModal.classList.contains('active')) closeAuthModal();
        if (serviceModal.classList.contains('show')) closeServiceModal();
        if (projectModal.classList.contains('show')) closeProjectModal();
        if (resumeModal.classList.contains('show')) closeResumeModal();
        if (blogModal && blogModal.classList.contains('show')) closeBlogModal();
    }
});

// ========================================
// RESUME BUILDER MODAL
// ========================================

const openResumeModalBtn = document.getElementById('openResumeModal');
const resumeModal = document.getElementById('resumeModal');
const closeResumeModalBtn = document.getElementById('closeResumeModal');
const resumeModalOverlay = resumeModal.querySelector('.resume-modal__overlay');

const resumeFormStep = document.getElementById('resumeFormStep');
const resumeTemplateStep = document.getElementById('resumeTemplateStep');
const resumeForm = document.getElementById('resumeForm');

let resumeFormData = {};

openResumeModalBtn.addEventListener('click', () => {
    resumeModal.classList.add('show');
    resumeFormStep.classList.add('active');
    resumeTemplateStep.classList.remove('active');
    document.body.style.overflow = 'hidden';
});

function closeResumeModal() {
    resumeModal.classList.remove('show');
    resumeFormStep.classList.remove('active');
    resumeTemplateStep.classList.remove('active');
    document.body.style.overflow = '';
    resumeForm.reset();
    resumeFormData = {};
}

closeResumeModalBtn.addEventListener('click', closeResumeModal);
resumeModalOverlay.addEventListener('click', closeResumeModal);

resumeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(resumeForm);
    resumeFormData = Object.fromEntries(formData);
    
    resumeFormStep.classList.remove('active');
    resumeTemplateStep.classList.add('active');
});

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

    // Load dynamic about and homepage content for the public user page
    loadPublicAbout();
    loadPublicHomepage();
    loadPublicServices();
});

// Load About content for the public user-facing page
async function loadPublicAbout() {
    try {
        const res = await fetch('/api/about');
        if (!res.ok) return; // nothing to do
        const result = await res.json();
        if (result && result.success && result.data) {
            const data = result.data;
            const missionEl = document.getElementById('about-mission');
            const visionEl = document.getElementById('about-vision');
            const valuesEl = document.getElementById('about-values');

            if (missionEl) missionEl.innerHTML = data.mission || '';
            if (visionEl) visionEl.innerHTML = data.vision || '';
            if (valuesEl) valuesEl.innerHTML = data.values || '';
        }
    } catch (error) {
        console.error('Failed to load public about content:', error);
    }
}

// Load Homepage content for the public user-facing page
async function loadPublicHomepage() {
    try {
        const res = await fetch('/api/homepage');
        if (!res.ok) return;
        const result = await res.json();
        if (result && result.success && result.data) {
            const data = result.data;
            const heroTitle = document.querySelector('.hero-title');
            const heroSubtitle = document.querySelector('.hero-subtitle');
            const heroSection = document.querySelector('.hero-section');

            if (heroTitle && data.title) heroTitle.innerHTML = data.title;
            if (heroSubtitle && data.subtitle) heroSubtitle.innerHTML = data.subtitle;
            if (heroSection && data.hero_image) {
                heroSection.style.backgroundImage = `url('${data.hero_image}')`;
                heroSection.style.backgroundSize = 'cover';
                heroSection.style.backgroundPosition = 'center';
            }
        }
    } catch (error) {
        console.error('Failed to load public homepage content:', error);
    }
}

// Load Services for the public user-facing page
async function loadPublicServices() {
    try {
        const res = await fetch('/api/services');
        if (!res.ok) return;
        const result = await res.json();
        if (result && result.success && Array.isArray(result.data)) {
            const list = result.data;
            const grid = document.querySelector('.services-grid');
            if (!grid) return;
            // Render each service as a card similar to the static markup
            grid.innerHTML = list.map(s => {
                const icon = s.icon || 'fas fa-cogs';
                const title = s.title || 'Service';
                const desc = (s.description || '').length > 140 ? (s.description || '').slice(0, 137) + '...' : (s.description || '');
                const dataService = (s.category || '').toLowerCase() || '';
                return `
                    <div class="service-card" data-service="${dataService}">
                      <div class="service-icon"><i class="${icon}"></i></div>
                      <h3>${escapeHtml(title)}</h3>
                      <p>${escapeHtml(desc)}</p>
                      <button class="learn-more-btn" data-service="${dataService}">Learn More <i class="fas fa-arrow-right"></i></button>
                    </div>
                `;
            }).join('');

            // Re-bind learn-more buttons to open modals for predefined service keys if available
            document.querySelectorAll('.learn-more-btn').forEach(btn => {
                btn.removeEventListener('click', learnMoreHandler);
                btn.addEventListener('click', learnMoreHandler);
            });
        }
    } catch (error) {
        console.error('Failed to load public services:', error);
    }
}

// helper to open service modal when Learn More clicked (kept separate for attaching/removing)
function learnMoreHandler(e) {
    const service = e.target.closest('.learn-more-btn')?.dataset.service;
    if (service && serviceData[service]) {
        openServiceModal(serviceData[service]);
    } else {
        // If custom service, open a generic modal with the card content
        const card = e.target.closest('.service-card');
        if (!card) return;
        const title = card.querySelector('h3')?.textContent || '';
        const desc = card.querySelector('p')?.textContent || '';
        openServiceModal({ title, description: desc, features: [], benefits: [] });
    }
}

// simple HTML escaper for content coming from admin
function escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, function (m) {
        return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
    });
}

// Listen for broadcast updates from admin (same-origin tabs)
try {
    const bc = new BroadcastChannel('mastersolis_updates');
    bc.addEventListener('message', (ev) => {
        try {
            const msg = ev.data;
            if (!msg || !msg.type) return;
            if (msg.type === 'about-updated') {
                const data = msg.data || {};
                const missionEl = document.getElementById('about-mission');
                const visionEl = document.getElementById('about-vision');
                const valuesEl = document.getElementById('about-values');

                if (missionEl) missionEl.innerHTML = data.mission || '';
                if (visionEl) visionEl.innerHTML = data.vision || '';
                if (valuesEl) valuesEl.innerHTML = data.values || '';

                // show a subtle toast to indicate content changed
                if (typeof toast !== 'undefined') {
                    toast.info('About content updated');
                }
            } else if (msg.type === 'services-updated') {
                // Refresh services list when admin updates services
                try { loadPublicServices(); } catch (err) { console.warn('Failed to reload services on broadcast:', err); }
                if (typeof toast !== 'undefined') toast.info('Services updated');
            }
        } catch (err) {
            console.error('Error handling broadcast message:', err);
        }
    });
} catch (err) {
    // BroadcastChannel not supported; ignore
}

// Storage-event fallback: listen for localStorage updates from admin page
window.addEventListener('storage', (e) => {
    try {
        if (!e.key) return;
        if (e.key === 'mastersolis_about_update' && e.newValue) {
            const payload = JSON.parse(e.newValue);
            const data = payload?.data || {};
            const missionEl = document.getElementById('about-mission');
            const visionEl = document.getElementById('about-vision');
            const valuesEl = document.getElementById('about-values');

            if (missionEl) missionEl.innerHTML = data.mission || '';
            if (visionEl) visionEl.innerHTML = data.vision || '';
            if (valuesEl) valuesEl.innerHTML = data.values || '';

            if (typeof toast !== 'undefined') toast.info('About content updated');
        }
        if (e.key === 'mastersolis_services_update') {
            // reload services when admin saved/deleted a service
            try { loadPublicServices(); } catch (err) { console.warn('Failed to reload services on storage event:', err); }
            if (typeof toast !== 'undefined') toast.info('Services updated');
        }
    } catch (err) {
        console.error('Error handling storage event for about update:', err);
    }
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
<<<<<<< HEAD
=======
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
// VISITOR TRACKING
// ========================================

async function trackVisitor() {
  try {
    // Get user agent and page URL
    const userAgent = navigator.userAgent;
    const pageUrl = window.location.href;
    const referrer = document.referrer || null;

    // Insert visitor record
    await supabase.from('visitors').insert({
      user_agent: userAgent,
      page_url: pageUrl,
      referrer: referrer
      // IP address will be captured server-side if needed
    });
  } catch (error) {
    // Silently fail - don't interrupt user experience
    console.warn('Failed to track visitor:', error);
  }
}

// Track visitor on page load
if (window.location.pathname === '/' || window.location.pathname === '/index.html' || window.location.pathname.endsWith('index.html')) {
  trackVisitor();
}

// ========================================
// SERVICE CLICK TRACKING
// ========================================

// Track service card clicks
function setupServiceClickTracking() {
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', async (e) => {
      try {
        // Get service name from h3 element
        const serviceNameElement = card.querySelector('h3');
        if (!serviceNameElement) return;

        const serviceName = serviceNameElement.textContent.trim();
        const userAgent = navigator.userAgent;
        const pageUrl = window.location.href;

        // Insert service click record
        await supabase.from('service_clicks').insert({
          service_name: serviceName,
          user_agent: userAgent,
          page_url: pageUrl
        });
      } catch (error) {
        // Silently fail - don't interrupt user experience
        console.warn('Failed to track service click:', error);
      }
    });
  });
}

// Setup service click tracking after DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupServiceClickTracking);
} else {
  setupServiceClickTracking();
}

// ========================================
>>>>>>> bd76b1ac5da89082c240eefed5fc44a143370125
// INITIALIZE
// ========================================

console.log('Mastersolis Infotech website loaded successfully!');
console.log('Ready for backend integration.');