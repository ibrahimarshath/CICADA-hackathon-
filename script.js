// ========================================
// NAVIGATION
// ========================================

const navbar = document.querySelector('.navbar');
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Smooth scrolling and active nav link
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
        
        // Update active link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        
        // Close mobile menu
        navMenu.classList.remove('active');
    });
});

// Update active nav link on scroll
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
        
        // Update active button
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        
        // Filter projects
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
// CONTACT FORM
// ========================================

const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData);
        
        console.log('Form submitted:', data);
        
        // Show success message (you'll replace this with actual form submission)
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
        
        // Here you would typically send the data to your backend
        // fetch('/api/contact', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
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

// Open modal
loginBtn.addEventListener('click', () => {
    authModal.classList.add('active');
    document.body.style.overflow = 'hidden';
});

// Close modal
function closeAuthModal() {
    authModal.classList.remove('active');
    document.body.style.overflow = '';
}

authClose.addEventListener('click', closeAuthModal);
authModalOverlay.addEventListener('click', closeAuthModal);

// Switch between forms
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

// User Login Form
const userLoginForm = document.getElementById('userLoginForm');
if (userLoginForm) {
    userLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(userLoginForm);
        const data = Object.fromEntries(formData);
        
        console.log('User login:', data);
        alert('Login functionality will be implemented in the backend integration phase.');
        closeAuthModal();
        
        // Backend integration placeholder
        // fetch('/api/user/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
    });
}

// User Signup Form
const userSignupForm = document.getElementById('userSignupForm');
if (userSignupForm) {
    userSignupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(userSignupForm);
        const data = Object.fromEntries(formData);
        
        // Validate passwords match
        if (data.password !== data.confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        console.log('User signup:', data);
        alert('Account created successfully! You can now login.');
        
        // Switch to login form
        loginFormContainer.style.display = 'block';
        signupFormContainer.style.display = 'none';
        userSignupForm.reset();
        
        // Backend integration placeholder
        // fetch('/api/user/signup', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
    });
}

// Admin Login Form
const adminLoginFormSubmit = document.getElementById('adminLoginFormSubmit');
if (adminLoginFormSubmit) {
    adminLoginFormSubmit.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(adminLoginFormSubmit);
        const data = Object.fromEntries(formData);
        
        console.log('Admin login:', data);
        alert('Admin authentication will be implemented in the backend integration phase.');
        closeAuthModal();
        
        // Backend integration placeholder
        // fetch('/api/admin/login', {
        //     method: 'POST',
        //     headers: { 'Content-Type': 'application/json' },
        //     body: JSON.stringify(data)
        // });
    });
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && authModal.classList.contains('active')) {
        closeAuthModal();
    }
});

// ========================================
// ADMIN LOGIN FORM (Old - Remove if exists)
// ========================================

// Remove old admin login form code
const oldAdminLoginForm = document.getElementById('adminLoginForm');
if (oldAdminLoginForm && oldAdminLoginForm !== adminLoginFormSubmit) {
    // This is just a safety check for old code
}

// ========================================
// JOB APPLICATION BUTTONS
// ========================================

const applyButtons = document.querySelectorAll('.apply-btn');

applyButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Placeholder for job application modal/form
        alert('Job application form will be implemented in the next phase. This will open a modal with an application form and resume upload functionality.');
        
        // In the actual implementation, this would open a modal with:
        // - Application form
        // - Resume upload
        // - AI-powered resume builder option
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

// Toggle chatbot window
chatbotButton.addEventListener('click', () => {
    chatbotWindow.classList.toggle('active');
});

chatbotClose.addEventListener('click', () => {
    chatbotWindow.classList.remove('active');
});

// Send message
function sendChatMessage() {
    const message = chatbotInput.value.trim();
    if (message) {
        // Add user message
        addChatMessage(message, 'user');
        chatbotInput.value = '';
        
        // Simulate bot response (replace with actual AI integration)
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
    // Placeholder responses (replace with actual AI chatbot)
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

// Observe elements for animation
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

// Add real-time validation to forms
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

// Animate stats when they come into view
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
// INITIALIZE
// ========================================

console.log('Mastersolis Infotech website loaded successfully!');
console.log('Ready for backend integration.');