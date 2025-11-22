// assets/js/animations.js - GSAP animations for the application.

document.addEventListener('DOMContentLoaded', () => {

    /**
     * Animates the login page elements with a staggered entry.
     */
    function animateLoginPage() {
        const loginCard = document.querySelector('.login-card');
        if (loginCard) {
            // Select all child elements to be animated
            const elementsToAnimate = [
                loginCard.querySelector('h1'),
                loginCard.querySelector('p'),
                ...loginCard.querySelectorAll('.input-group'),
                loginCard.querySelector('.glass-btn'),
                loginCard.querySelector('.login-footer')
            ];

            gsap.from(elementsToAnimate, {
                duration: 0.8,
                opacity: 0,
                y: 30,
                ease: "power3.out",
                stagger: 0.1 // This creates the one-by-one effect
            });
        }
    }

    // --- Router: Automatically run login animation if on login page ---
    if (document.querySelector('.login-card')) {
        animateLoginPage();
    } 
});

/**
 * Animates the dashboard page elements.
 * Exposed globally so it can be triggered after data load.
 */
window.animateDashboardPage = function() {
    const tl = gsap.timeline({ defaults: { duration: 0.7, ease: "power3.out" } });

    // 1. Sidebar: Fade + Slide in from left
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
        tl.from(sidebar, { x: -40, opacity: 0 });
    }

    // 2. Top Bar: Fade + Slide in from top
    const topBar = document.querySelector('.top-bar'); // Adjust selector if needed based on dashboard.html
    if (topBar) {
        tl.from(topBar, { y: -30, opacity: 0 }, "-=0.5"); // Overlap slightly
    }

    // 3. Main Cards: Staggered entry from bottom
    // Select specific dashboard cards based on the request
    const cards = document.querySelectorAll('.glass-card'); 
    if (cards.length > 0) {
        tl.from(cards, { 
            y: 40, 
            opacity: 0, 
            stagger: 0.08 
        }, "-=0.4");
    }

    // 4. Transaction Rows: Light upward stagger
    const transactionRows = document.querySelectorAll('.activity-item, .transaction-item');
    if (transactionRows.length > 0) {
        tl.from(transactionRows, { 
            y: 20, 
            opacity: 0, 
            stagger: 0.04 
        }, "-=0.2");
    }

    // 5. Top Heading Shimmer Animation
    const heading = document.querySelector('.main-header h1');
    if (heading) {
        // Set initial styles for gradient text
        gsap.set(heading, {
            backgroundImage: "linear-gradient(120deg, #fff 0%, #D4AF37 50%, #fff 100%)",
            backgroundSize: "200% auto",
            color: "transparent",
            webkitBackgroundClip: "text",
            backgroundClip: "text"
        });

        // Animate background position
        gsap.to(heading, {
            backgroundPosition: "200% center",
            duration: 3,
            ease: "linear",
            repeat: -1
        });
    }
};

/**
 * Animates a number counting up to a final value.
 * @param {string} targetSelector - The CSS selector for the element.
 * @param {number} finalValue - The final number to show.
 */
window.animateBalanceCount = function(targetSelector, finalValue) {
    const element = document.querySelector(targetSelector);
    if (!element) return;

    const counter = { val: 0 };
    gsap.fromTo(counter, 
        { val: 0 }, 
        { 
            val: finalValue,
            duration: 2,
            ease: "power2.out",
            onUpdate: function() {
                element.textContent = '$' + counter.val.toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });
            }
        }
    );
};

/**
 * Animates the opening of a modal.
 * @param {HTMLElement} modal - The modal overlay element.
 */
window.animateModalOpen = function(modal) {
    modal.classList.remove('hidden');
    const content = modal.querySelector('.modal-content');
    
    gsap.to(modal, { opacity: 1, duration: 0.3 });
    gsap.to(content, { 
        scale: 1, 
        duration: 0.5, 
        ease: "back.out(1.7)" 
    });
};

/**
 * Animates the closing of a modal.
 * @param {HTMLElement} modal - The modal overlay element.
 */
window.animateModalClose = function(modal) {
    const content = modal.querySelector('.modal-content');
    
    gsap.to(modal, { opacity: 0, duration: 0.3, onComplete: () => modal.classList.add('hidden') });
    gsap.to(content, { scale: 0.8, duration: 0.3 });
};

/**
 * Shakes the modal to indicate an error.
 * @param {HTMLElement} modal - The modal overlay element.
 */
window.animateModalShake = function(modal) {
    const content = modal.querySelector('.modal-content');
    gsap.fromTo(content, 
        { x: -10 }, 
        { x: 10, duration: 0.1, repeat: 5, yoyo: true, ease: "power1.inOut", onComplete: () => gsap.set(content, { x: 0 }) }
    );
};

/**
 * Shows a toast notification.
 * @param {string} message - The message to display.
 * @param {string} type - 'success' or 'error'.
 */
window.showToast = function(message, type) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconClass = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = `<i class="fas ${iconClass}"></i> <span>${message}</span>`;
    
    container.appendChild(toast);

    // Animate In
    gsap.to(toast, { x: 0, duration: 0.5, ease: "power3.out" });

    // Remove after 3 seconds
    setTimeout(() => {
        gsap.to(toast, { 
            x: '100%', 
            opacity: 0, 
            duration: 0.5, 
            ease: "power3.in", 
            onComplete: () => toast.remove() 
        });
    }, 3000);
};

/**
 * Triggers a confetti celebration animation.
 */
window.fireConfetti = function() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '9999';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#D4AF37', '#FFFFFF', '#0a0a0a', '#f1c40f'];

    for (let i = 0; i < 100; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            speed: Math.random() * 3 + 2,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 5 + 2
        });
    }

    let animationId;
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let activeParticles = 0;

        particles.forEach(p => {
            p.y += p.speed;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x, p.y, p.size, p.size);

            if (p.y < canvas.height) activeParticles++;
        });

        if (activeParticles > 0) {
            animationId = requestAnimationFrame(animate);
        } else {
            cancelAnimationFrame(animationId);
            canvas.remove();
        }
    }

    animate();
};