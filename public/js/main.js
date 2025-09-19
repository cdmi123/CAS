// public/js/sidebar.js

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const sidebar = document.querySelector('.sidebar');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const mainContent = document.querySelector('.main-content');
    const closeSidebar = document.getElementById('closeSidebar');
    
    // Check if sidebar exists
    if (!sidebar) return;
    
    // Initialize sidebar state based on screen size
    function initSidebar() {
        if (window.innerWidth < 768) {
            sidebar.classList.remove('show');
            mainContent.classList.add('main-content-full');
        } else {
            sidebar.classList.add('show');
            mainContent.classList.remove('main-content-full');
        }
    }
    
    // Initialize on page load
    initSidebar();
    
    // Toggle sidebar when toggle button is clicked
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('show');
            mainContent.classList.toggle('main-content-full');
            
            // Save state to localStorage
            localStorage.setItem('sidebarOpen', sidebar.classList.contains('show'));
        });
    }
    
    // Close sidebar when close button is clicked (mobile only)
    if (closeSidebar) {
        closeSidebar.addEventListener('click', function() {
            sidebar.classList.remove('show');
            mainContent.classList.add('main-content-full');
            localStorage.setItem('sidebarOpen', 'false');
        });
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            // On resize, reset sidebar based on screen size
            if (window.innerWidth < 768) {
                // On small screens, hide sidebar
                sidebar.classList.remove('show');
                mainContent.classList.add('main-content-full');
            } else {
                // On larger screens, show sidebar
                sidebar.classList.add('show');
                mainContent.classList.remove('main-content-full');
            }
        }, 250);
    });
    
    // Restore sidebar state from localStorage (if available)
    const sidebarState = localStorage.getItem('sidebarOpen');
    if (sidebarState !== null) {
        if (sidebarState === 'true' && window.innerWidth >= 768) {
            sidebar.classList.add('show');
            mainContent.classList.remove('main-content-full');
        } else {
            sidebar.classList.remove('show');
            mainContent.classList.add('main-content-full');
        }
    }
    
    // Handle sidebar link clicks - close sidebar on mobile after navigation
    const sidebarLinks = sidebar.querySelectorAll('.nav-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 768) {
                sidebar.classList.remove('show');
                mainContent.classList.add('main-content-full');
                localStorage.setItem('sidebarOpen', 'false');
            }
        });
    });
    
    // Add overlay for mobile sidebar
    function createOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            z-index: 99;
            display: none;
        `;
        
        overlay.addEventListener('click', function() {
            sidebar.classList.remove('show');
            mainContent.classList.add('main-content-full');
            overlay.style.display = 'none';
            localStorage.setItem('sidebarOpen', 'false');
        });
        
        document.body.appendChild(overlay);
        return overlay;
    }
    
    const overlay = createOverlay();
    
    // Show/hide overlay based on sidebar state and screen size
    function updateOverlay() {
        if (window.innerWidth < 768 && sidebar.classList.contains('show')) {
            overlay.style.display = 'block';
        } else {
            overlay.style.display = 'none';
        }
    }
    
    // Update overlay when sidebar state changes
    const observer = new MutationObserver(updateOverlay);
    observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
    
    // Initial overlay update
    updateOverlay();
    
    // Update overlay on resize
    window.addEventListener('resize', updateOverlay);
});

// Add CSS for sidebar overlay via JavaScript
const style = document.createElement('style');
style.textContent = `
    @media (max-width: 767.98px) {
        .sidebar {
            position: fixed;
            top: 56px;
            left: 0;
            height: calc(100vh - 56px);
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.3s ease-in-out;
        }
        
        .sidebar.show {
            transform: translateX(0);
        }
        
        .main-content {
            margin-left: 0 !important;
            transition: margin-left 0.3s ease-in-out;
        }
        
        .main-content-full {
            margin-left: 0 !important;
        }
    }
    
    @media (min-width: 768px) {
        .sidebar {
            transform: translateX(0) !important;
        }
        
        .sidebar-overlay {
            display: none !important;
        }
    }
`;
document.head.appendChild(style);