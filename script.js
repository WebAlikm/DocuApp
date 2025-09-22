// Smooth scrolling for navigation links
function initializeApp() {
    console.log('Initializing app...');
    console.log('Convex available:', typeof window.Convex);
    if (typeof window.Convex !== 'undefined') {
        console.log('Convex object:', window.Convex);
    }
    
    // Wait for Convex to be available
    function initializeConvex() {
        if (typeof window.Convex === 'undefined' || !window.Convex.ConvexClient) {
            console.error('Convex library not loaded. Available globals:', Object.keys(window).filter(k => k.toLowerCase().includes('convex')));
            return null;
        }
        console.log('Creating Convex client...');
        return new window.Convex.ConvexClient('https://grandiose-chihuahua-641.convex.cloud');
    }
    
    const convex = initializeConvex();
    if (!convex) {
        console.error('Failed to initialize Convex client');
        return;
    }
    
    console.log('Convex client initialized successfully!');
    
    // Get anchor links for smooth scrolling
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    // Load weekly cap status
    async function loadWeeklyStatus() {
        try {
            const status = await convex.query('waitlist:getWaitlistStatus');
            const weeklyCapInfo = document.querySelector('[data-weekly-cap-info]');
            if (weeklyCapInfo) {
                if (status.remainingThisWeek > 0) {
                    weeklyCapInfo.textContent = `${status.remainingThisWeek} spots remaining this week`;
                } else {
                    weeklyCapInfo.textContent = 'Weekly cap reached - join next week!';
                    weeklyCapInfo.style.color = '#ff6b6b';
                }
            }
        } catch (error) {
            console.error('Failed to load weekly status:', error);
        }
    }
    
    // Load status on page load
    loadWeeklyStatus();
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Header background on scroll
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }
    });
    
    // Form submission handling
    const signupForm = document.getElementById('signupForm');
    const formSuccess = document.getElementById('formSuccess');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const appIdea = formData.get('appIdea');
            const platform = formData.get('platform');
            // Collect selected documents
            const docCheckboxes = this.querySelectorAll('input[name="documents"]:checked');
            const documents = Array.from(docCheckboxes).map(cb => cb.value);
            
            // Simple validation
            if (!name || !email || !appIdea || !platform) {
                alert('Please fill in all fields.');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }
            
            // Submit using Convex mutation
            try {
                // Compute ETA details on the backend to ensure consistency
                const response = await convex.mutation('waitlist:submitWaitlist', {
                    name: String(name),
                    email: String(email),
                    appIdea: String(appIdea),
                    platform: String(platform),
                    documents: documents // pass selected docs
                });
                
                if (response.accepted) {
                    // Update UI to success state
                    const formContainer = document.querySelector('.signup-form');
                    const successSection = document.getElementById('formSuccess');
                    
                    if (formContainer && successSection) {
                        this.style.display = 'none';
                        successSection.style.display = 'block';
                    }
                } else {
                    if (response.reason === 'weekly_cap_reached') {
                        alert('We\'re at capacity this week. Please try again next week!');
                    } else if (response.reason === 'email_already_submitted') {
                        alert('This email has already been submitted. We\'ll be in touch!');
                    } else {
                        alert('Submission not accepted. Please try again later.');
                    }
                }
            } catch (error) {
                console.error('Failed to submit:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }
}

// Initialize app on DOMContentLoaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}