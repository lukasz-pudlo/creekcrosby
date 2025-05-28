// Header scroll effect
window.addEventListener('scroll', function () {
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile menu functionality
function toggleMobileMenu() {
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.mobile-menu-toggle');

    nav.classList.toggle('mobile-open');

    const isOpen = nav.classList.contains('mobile-open');
    toggle.setAttribute('aria-expanded', isOpen);

    // Add class to toggle for hamburger animation
    toggle.classList.toggle('mobile-open');
}

function closeMobileMenu() {
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.mobile-menu-toggle');

    nav.classList.remove('mobile-open');
    toggle.classList.remove('mobile-open');
    toggle.setAttribute('aria-expanded', 'false');
}

// Close mobile menu when clicking outside
document.addEventListener('click', function (event) {
    const nav = document.getElementById('nav');
    const toggle = document.querySelector('.mobile-menu-toggle');

    if (!nav.contains(event.target) && !toggle.contains(event.target)) {
        closeMobileMenu();
    }
});

// Smooth scrolling for anchor links
document.addEventListener('click', function (event) {
    if (event.target.matches('a[href^="#"]')) {
        event.preventDefault();

        const targetId = event.target.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = targetElement.offsetTop - headerHeight;

            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// HTMX event handlers
document.addEventListener('htmx:beforeRequest', function (event) {
    // Add loading indicator
    const target = event.target;
    if (target.classList.contains('search-input')) {
        target.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
    }
});

document.addEventListener('htmx:afterRequest', function (event) {
    // Remove loading indicator
    const target = event.target;
    if (target.classList.contains('search-input')) {
        target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    }
});

// Form submission feedback
document.addEventListener('htmx:responseError', function (event) {
    console.error('HTMX Error:', event.detail);
    // Could show user-friendly error message here
});

// Initialize any necessary components when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    // Set initial header state
    const header = document.getElementById('header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    }

    // Add any other initialization code here
    console.log('Creek Crosby website loaded');
});