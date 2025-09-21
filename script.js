// Smooth scrolling for navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
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
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(this);
            const name = formData.get('name');
            const email = formData.get('email');
            const appIdea = formData.get('appIdea');
            const platform = formData.get('platform');
            
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
            
            // Simulate form submission
            const submitButton = this.querySelector('.form-submit');
            const originalText = submitButton.innerHTML;
            
            submitButton.innerHTML = '<span>Processing...</span>';
            submitButton.disabled = true;
            
            // Simulate form submission
        setTimeout(() => {
            // Hide form and show success message
            this.style.display = 'none';
            formSuccess.style.display = 'block';
            
            // Log the data (in a real app, this would be sent to a server)
            console.log('Form submitted:', {
                name: name,
                email: email,
                appIdea: appIdea,
                platform: platform,
                timestamp: new Date().toISOString()
            });
            
            // Store in localStorage for demo purposes
            localStorage.setItem('userSignup', JSON.stringify({
                name: name,
                email: email,
                appIdea: appIdea,
                platform: platform,
                timestamp: new Date().toISOString()
            }));
            
            // Show success toast notification
            showToast('Your app idea has been submitted! Our team will contact you via email within 1 week.', 'success');
            
            // Show donation popup after 3 seconds
            setTimeout(() => {
                showDonationPopup();
            }, 3000);
            
        }, 2000);
        });
    }
    
    // Pricing card interactions
    const pricingCards = document.querySelectorAll('.pricing-card');
    
    pricingCards.forEach(card => {
        const ctaButton = card.querySelector('.pricing-cta');
        
        ctaButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            const planName = card.querySelector('.plan-name').textContent;
            const price = card.querySelector('.amount').textContent;
            
            // Simulate plan selection
            localStorage.setItem('selectedPlan', JSON.stringify({
                plan: planName,
                price: price,
                timestamp: new Date().toISOString()
            }));
            
            // Scroll to signup form
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = contactSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
            
            // Visual feedback
            this.innerHTML = '<span>Selected!</span>';
            this.style.background = 'var(--accent-green)';
            
            setTimeout(() => {
                this.innerHTML = '<span>Get Started Free</span>';
                this.style.background = '';
            }, 1500);
        });
    });
    
    // CTA button interactions
    const heroCtas = document.querySelectorAll('.cta-button');
    
    heroCtas.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.classList.contains('primary')) {
                // Scroll to signup form for primary CTA
                e.preventDefault();
                
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    const headerHeight = document.querySelector('.header').offsetHeight;
                    const targetPosition = contactSection.offsetTop - headerHeight;
                    
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Nav CTA button
    const navCta = document.querySelector('.nav-cta');
    if (navCta) {
        navCta.addEventListener('click', function(e) {
            e.preventDefault();
            
            const contactSection = document.getElementById('contact');
            if (contactSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = contactSection.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
    
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .step, .pricing-card, .stat');
    
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
    
    // Mobile menu toggle (for future implementation)
    const createMobileMenu = () => {
        const nav = document.querySelector('.nav');
        const navMenu = document.querySelector('.nav-menu');
        
        // Create mobile menu button
        const mobileMenuBtn = document.createElement('button');
        mobileMenuBtn.className = 'mobile-menu-btn';
        mobileMenuBtn.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        
        // Add mobile menu styles
        const mobileMenuStyles = `
            .mobile-menu-btn {
                display: none;
                flex-direction: column;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.5rem;
            }
            
            .mobile-menu-btn span {
                width: 25px;
                height: 3px;
                background: var(--gray-700);
                margin: 3px 0;
                transition: 0.3s;
            }
            
            @media (max-width: 768px) {
                .mobile-menu-btn {
                    display: flex;
                }
                
                .nav-menu {
                    position: fixed;
                    top: 80px;
                    left: -100%;
                    width: 100%;
                    height: calc(100vh - 80px);
                    background: var(--white);
                    flex-direction: column;
                    padding: 2rem;
                    transition: left 0.3s ease;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                }
                
                .nav-menu.active {
                    left: 0;
                }
            }
        `;
        
        // Add styles to head
        const styleSheet = document.createElement('style');
        styleSheet.textContent = mobileMenuStyles;
        document.head.appendChild(styleSheet);
        
        // Insert button before nav-menu
        nav.insertBefore(mobileMenuBtn, navMenu);
        
        // Toggle mobile menu
        mobileMenuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            this.classList.toggle('active');
        });
        
        // Close menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    };
    
    // Initialize mobile menu
    createMobileMenu();
    
    // Add some interactive hover effects
    const addHoverEffects = () => {
        const featureCards = document.querySelectorAll('.feature-card');
        
        featureCards.forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0) scale(1)';
            });
        });
    };
    
    addHoverEffects();
    
    // FAQ Accordion functionality
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            const isActive = this.classList.contains('active');
            const answer = this.nextElementSibling;
            
            // Close all other FAQ items
            faqQuestions.forEach(q => {
                q.classList.remove('active');
                q.setAttribute('aria-expanded', 'false');
                q.nextElementSibling.classList.remove('active');
            });
            
            // If this item wasn't active, open it
            if (!isActive) {
                this.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
                answer.classList.add('active');
            }
        });
    });

    // Animate progress bars on page load
    const progressFills = document.querySelectorAll('.progress-fill');
    
    const animateProgressBars = () => {
        progressFills.forEach((fill, index) => {
            const targetWidth = fill.style.width;
            fill.style.width = '0%';
            
            setTimeout(() => {
                fill.style.transition = 'width 1.5s ease-out';
                fill.style.width = targetWidth;
            }, 500 + (index * 200));
        });
    };

    // Add subtle parallax effect to organic shapes
    const organicShapes = document.querySelectorAll('.organic-shape');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        organicShapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            shape.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.1}deg)`;
        });
    });

    // Add subtle hover effects to feature cards
    const featureCards = document.querySelectorAll('.feature-card');
    
    featureCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) rotate(0.5deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) rotate(0deg)';
        });
    });

    // Trigger animation when phone mockup comes into view
    const phoneMockup = document.querySelector('.phone-mockup');
    if (phoneMockup) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateProgressBars();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(phoneMockup);
    }
    
    console.log('🚀 DocuApp platform loaded successfully!');
});

// Utility function for creating toast notifications
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--accent-green)' : type === 'error' ? '#ef4444' : 'var(--primary-blue)'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        font-weight: 500;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(toast);
        }, 300);
    }, 3000);
}

// Add some CSS for the toast
const toastStyles = `
    .toast {
        font-family: 'Inter', sans-serif;
        max-width: 300px;
        word-wrap: break-word;
    }
`;

const toastStyleSheet = document.createElement('style');
toastStyleSheet.textContent = toastStyles;
document.head.appendChild(toastStyleSheet);

// Donation Popup Functions
function showDonationPopup() {
    const popup = document.getElementById('donationPopup');
    if (popup) {
        popup.classList.add('show');
        document.body.style.overflow = 'hidden';
        
        // Track popup show in localStorage to avoid showing too frequently
        localStorage.setItem('donationPopupShown', new Date().toISOString());
    }
}

function closeDonationPopup() {
    const popup = document.getElementById('donationPopup');
    if (popup) {
        popup.classList.remove('show');
        document.body.style.overflow = '';
    }
}

// Close popup when clicking outside content
function setupDonationPopup() {
    const popup = document.getElementById('donationPopup');
    const closeBtn = document.querySelector('.donation-popup-close');
    
    if (popup) {
        popup.addEventListener('click', function(e) {
            if (e.target === popup) {
                closeDonationPopup();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeDonationPopup);
    }
}

// Initialize donation popup
setupDonationPopup();

// --- Waitlist simulation & metrics ---
const WAITLIST_STORAGE_KEY = 'app_waitlist_queue_size';
// Update fallback constants to align with backend
const WAITLIST_AVG_MINS_PER_REQUEST = 60 * 24 * 7; // 1 week per request

function getQueueSize() {
  const stored = localStorage.getItem(WAITLIST_STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0; // default seed 0
}

function setQueueSize(size) {
  localStorage.setItem(WAITLIST_STORAGE_KEY, String(size));
}

function formatEtaFromMinutes(totalMinutes) {
  if (totalMinutes < 60) return `${Math.max(1, Math.round(totalMinutes))} min`;
  const hours = totalMinutes / 60;
  if (hours < 24) return `${Math.max(1, Math.round(hours))} hr`;
  const days = hours / 24;
  return `${Math.max(1, Math.round(days))} day${Math.round(days) > 1 ? 's' : ''}`;
}

function computeEta(position, avgMinsPerRequest) {
  const minutes = position * avgMinsPerRequest;
  return formatEtaFromMinutes(minutes);
}

function enqueueRequest() {
  const current = getQueueSize();
  const newSize = current + 1;
  setQueueSize(newSize);
  return newSize; // return user's position
}

function simulateProgress() {
  // decrement queue once every few minutes to simulate throughput
  const current = getQueueSize();
  if (current > 0) setQueueSize(current - 1);
}

// Initialize waitlist metrics on DOM ready
// updateWaitlistUI(true); // Removed - function no longer exists

// Periodically update displayed metrics (simulated)
setInterval(() => {
  simulateProgress();
  // updateWaitlistUI(true); // Removed - function no longer exists
}, 180000); // every 3 minutes

// Hook into existing form submission flow to place user in queue and show personalized ETA
// Update existing form submission block by hooking after success UI shows
// Backend API configuration
const API_BASE = window.location.origin; // same origin

// Replace enqueue + UI update logic to use backend
const signupForm = document.getElementById('waitlist-form');
if (signupForm) {
  signupForm.addEventListener('submit', function(e) { return; // disabled duplicate handler
    setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/waitlist/enqueue`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });
        if (!res.ok) throw new Error('Failed to enqueue');
        const data = await res.json();
        // metrics removed from DOM; nothing to populate here
      } catch (err) {
        console.error(err);
        const pos = enqueueRequest();
        const totalNow = getQueueSize();
        // metrics removed from DOM; nothing to populate here
      }
    }, 2100);
  });
}

// Optionally poll backend status (commented out for now)
// setInterval(async () => {
//   try {
//     const res = await fetch(`${API_BASE}/api/waitlist/status`);
//     if (!res.ok) return;
//     const data = await res.json();
//     // If success panel is visible, update
//     const successPanel = document.getElementById('formSuccess');
//     if (successPanel && successPanel.style.display !== 'none') {
//       const totalPostEl = document.getElementById('wlTotalPost');
//       if (totalPostEl) totalPostEl.textContent = data.total;
//     }
//   } catch {}
// }, 60000);

// Waitlist API config and helpers
const WAITLIST_API = {
  ENQUEUE: '/api/waitlist/enqueue',
  STATUS: '/api/waitlist/status'
};

// Remove ETA constants and fallbacks; keep weekly cap display

async function fetchWaitlistStatus() {
  try {
    const res = await fetch(WAITLIST_API.STATUS, { cache: 'no-store' });
    if (!res.ok) throw new Error('status failed');
    return await res.json();
  } catch (e) {
    return null;
  }
}

function updateWeeklyCapUI(status) {
  const capInfoEls = document.querySelectorAll('[data-weekly-cap-info]');
  if (!capInfoEls || capInfoEls.length === 0) return;
  if (!status) {
    capInfoEls.forEach(el => {
      el.textContent = 'Limited spots each week';
      // clear state classes
      if (el.classList.contains('weekly-cap-pill')) el.classList.remove('is-full', 'is-low');
      const container = el.closest('.form-availability');
      if (container) container.classList.remove('is-full', 'is-low');
    });
    return;
  }
  const remaining = status.remaining_this_week ?? 0;
  const cap = status.weekly_cap ?? 10;
  const nextOpen = (typeof status.next_open_human === 'string' && status.next_open_human.trim()) ? status.next_open_human.trim() : '';
  capInfoEls.forEach(el => {
    let text = '';
    if (remaining <= 0) {
      text = `Full this week — opens ${nextOpen || 'soon'}`;
    } else if (remaining === 1) {
      text = `Only 1 spot left — closes soon`;
    } else if (remaining <= 3) {
      text = `Only ${remaining} spots left — closes soon`;
    } else {
      text = `${remaining} of ${cap} spots left`;
    }
    el.textContent = text;

    const isFull = remaining <= 0;
    const isLow = !isFull && remaining <= 3;
    const isPill = el.classList.contains('weekly-cap-pill');
    const container = el.closest('.form-availability');

    // Toggle classes for states
    if (isFull) {
      if (isPill) el.classList.add('is-full');
      if (container) container.classList.add('is-full');
      if (isPill) el.classList.remove('is-low');
      if (container) container.classList.remove('is-low');
    } else if (isLow) {
      if (isPill) el.classList.add('is-low');
      if (container) container.classList.add('is-low');
      if (isPill) el.classList.remove('is-full');
      if (container) container.classList.remove('is-full');
    } else {
      if (isPill) el.classList.remove('is-full', 'is-low');
      if (container) container.classList.remove('is-full', 'is-low');
    }
  });
}

// Hook: on page load, show weekly cap info
window.addEventListener('DOMContentLoaded', async () => {
  const status = await fetchWaitlistStatus();
  updateWeeklyCapUI(status);
});

// Form submit logic - consolidated version
const form = document.getElementById('waitlist-form');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const emailInput = form.querySelector('input[name="email"]');
    const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
    const email = emailInput?.value?.trim();

    const showToast = (msg, type = 'info') => {
      const toast = document.querySelector('[data-toast]');
      if (toast) {
        toast.textContent = msg;
        toast.dataset.type = type;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3000);
      } else {
        alert(msg);
      }
    };

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email', 'error');
      return;
    }

    submitBtn?.setAttribute('disabled', 'true');

    try {
      const res = await fetch(WAITLIST_API.ENQUEUE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Failed to enqueue');
      const data = await res.json().catch(() => ({}));

      // Handle weekly cap acceptance
      if (data && data.accepted) {
        // Update weekly cap banner
        const status = await fetchWaitlistStatus();
        updateWeeklyCapUI(status);

        // Remove retrieving of removed metric elements in consolidated handler
        // Update waitlist metrics in success panel
        setTimeout(() => {
          // metrics removed from DOM; nothing to populate
        }, 2100);

        // Show success panel
        const successPanel = document.getElementById('formSuccess');
        if (successPanel) {
          successPanel.style.display = 'block';
          form.style.display = 'none';
        }
        showToast('You\'re in! We\'ll email you when your turn opens.', 'success');
        
        setTimeout(() => {
          // metrics removed from DOM; nothing to populate
        }, 2100);
      } else if (data && data.reason === 'weekly_cap_reached') {
        // Cap reached UX
        const cap = data.weekly_cap ?? 10;
        const msg = `This week\'s ${cap} spots are full. Please check back next week.`;
        showToast(msg, 'warning');
      } else {
        showToast('Something went wrong. Please try again later.', 'error');
      }
    } catch (err) {
      console.error(err);
      
      // Fallback: use local queue
      const pos = enqueueRequest();
      const totalNow = getQueueSize();
      
      // Show success panel (fallback path)
      const successPanel = document.getElementById('formSuccess');
      if (successPanel) {
        successPanel.style.display = 'block';
        form.style.display = 'none';
      }
      showToast('You\'re in! We\'ll email you when your turn opens.', 'success');
      
      setTimeout(() => {
        // metrics removed from DOM; nothing to populate
      }, 2100);
    } finally {
      submitBtn?.removeAttribute('disabled');
    }
  });
}