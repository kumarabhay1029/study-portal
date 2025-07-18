/**
 * Study Portal Main Application JavaScript
 * Handles navigation, UI interactions, and core functionality
 */

// Global variable to track current active section in the Study Portal
let currentSection = 'home';

/* ==========================================================================
   SECTION SWITCHING FUNCTIONALITY - SINGLE PAGE APPLICATION BEHAVIOR
   ========================================================================== */

/**
 * Show a specific section and hide all others (SPA-like navigation)
 * This function implements the main navigation system for the Study Portal
 * @param {string} sectionName - Name of the section to show (e.g., 'home', 'dashboard', 'books')
 */
function showSection(sectionName) {
    // Hide all sections by removing 'active' class from all section containers
    document.querySelectorAll('.section-container').forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section by adding 'active' class to target section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName; // Update global state
    }

    // Update navigation buttons to show which section is currently active
    updateActiveNavigation(sectionName);

    // Close mobile menu if it's open (for mobile/tablet users)
    closeMobileMenu();
}

/**
 * Update active state of navigation items across Study Portal
 * Ensures consistent visual feedback for current section
 * @param {string} sectionName - Name of the active section
 */
function updateActiveNavigation(sectionName) {
    // Remove 'active' class from all navigation items (sidebar + main nav)
    document.querySelectorAll('.nav-btn, .sidebar a').forEach(item => {
        item.classList.remove('active');
    });

    // Add 'active' class to current navigation items that match the active section
    document.querySelectorAll(`[data-section="${sectionName}"]`).forEach(item => {
        item.classList.add('active');
    });
}

/* ==========================================================================
   MOBILE MENU FUNCTIONALITY - HAMBURGER MENU SYSTEM
   ========================================================================== */

/**
 * Toggle mobile menu visibility (open/close sidebar)
 * Controls the hamburger menu animation and sidebar slide-in/out
 */
function toggleMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileMenuToggle');
    const backdrop = document.getElementById('mobileBackdrop');
    
    // Toggle 'active' class on all mobile menu elements
    sidebar.classList.toggle('active');      // Slides sidebar in/out
    toggle.classList.toggle('active');       // Animates hamburger to X
    backdrop.classList.toggle('active');     // Shows/hides dark overlay
}

/**
 * Close mobile menu (hide sidebar)
 * Used when user clicks outside menu or selects a navigation item
 */
function closeMobileMenu() {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileMenuToggle');
    const backdrop = document.getElementById('mobileBackdrop');
    
    // Remove 'active' class from all mobile menu elements
    sidebar.classList.remove('active');      // Slides sidebar out
    toggle.classList.remove('active');       // Animates X back to hamburger
    backdrop.classList.remove('active');     // Hides dark overlay
}

/* ==========================================================================
   EVENT LISTENERS - AUTOMATIC BEHAVIOR
   ========================================================================== */

// Close mobile menu when clicking outside sidebar or toggle button
document.addEventListener('click', function(event) {
    const sidebar = document.getElementById('sidebar');
    const toggle = document.getElementById('mobileMenuToggle');
    
    // Check if click is outside both sidebar and toggle button
    if (!sidebar.contains(event.target) && !toggle.contains(event.target)) {
        closeMobileMenu(); // Auto-close menu for better user experience
    }
});

/* ==========================================================================
   PLACEHOLDER FUNCTIONS - FUTURE FEATURES
   ========================================================================== */

/**
 * Open member panel (placeholder for future member management)
 * TODO: Implement member list display, statistics, and management features
 */
function openMemberPanel() {
    alert('Member panel will be implemented here!');
}

/* ==========================================================================
   STUDY PORTAL INITIALIZATION AND SETUP
   ========================================================================== */

// Initialize the Study Portal when DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Set home section as active by default (landing page)
    showSection('home');
    
    // Prevent default link behavior for sidebar links (we use JavaScript navigation)
    document.querySelectorAll('.sidebar a').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent page reload
        });
    });
});

/* ==========================================================================
   BROWSER HISTORY MANAGEMENT
   ========================================================================== */

// Handle browser back/forward buttons
window.addEventListener('popstate', function(event) {
    if (event.state && event.state.section) {
        showSection(event.state.section);
    }
});

/**
 * Update browser URL when section changes (optional feature)
 * @param {string} section - Section name to add to URL
 */
function updateURL(section) {
    const url = new URL(window.location);
    url.hash = section;
    history.pushState({section: section}, '', url);
}

/* ==========================================================================
   SMOOTH SCROLLING
   ========================================================================== */

// Add smooth scrolling for internal links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});

/* ==========================================================================
   DYNAMIC MEMBER STATISTICS
   ========================================================================== */

/**
 * Update member statistics with random values (demo functionality)
 */
function updateMemberStats() {
    // Generate random member counts
    const totalMembers = Math.floor(Math.random() * 50) + 20;
    const activeMembers = Math.floor(totalMembers * 0.7);
    const offlineMembers = totalMembers - activeMembers;
    
    // Update DOM elements with new values
    document.getElementById('totalMembers').textContent = totalMembers;
    document.getElementById('activeMembers').textContent = activeMembers;
    document.getElementById('offlineMembers').textContent = offlineMembers;
}

// Update member statistics every 30 seconds
setInterval(updateMemberStats, 30000);

/* ==========================================================================
   NOTIFICATION BAR FUNCTIONALITY
   ========================================================================== */

/**
 * Close the notification bar
 * Hides the notification bar with a smooth animation
 */
function closeNotification() {
    const notificationBar = document.querySelector('.notification-bar');
    if (notificationBar) {
        notificationBar.style.transform = 'translateY(100%)';
        notificationBar.style.opacity = '0';
        
        // Completely hide after animation
        setTimeout(() => {
            notificationBar.style.display = 'none';
            
            // Adjust content area margin when notification is hidden
            const contentArea = document.querySelector('.content-area');
            if (contentArea) {
                contentArea.style.marginBottom = '0px';
            }
        }, 300);
    }
}

/**
 * Show notification bar (can be used to show it again)
 * Displays the notification bar with a smooth animation
 */
function showNotification() {
    const notificationBar = document.querySelector('.notification-bar');
    if (notificationBar) {
        notificationBar.style.display = 'flex';
        notificationBar.style.transform = 'translateY(0)';
        notificationBar.style.opacity = '1';
        
        // Restore content area margin
        const contentArea = document.querySelector('.content-area');
        if (contentArea) {
            contentArea.style.marginBottom = '70px';
        }
    }
}

/**
 * Add a new notification item
 * @param {string} icon - Emoji icon for the notification
 * @param {string} message - Notification message text
 */
function addNotification(icon, message) {
    const notificationContent = document.querySelector('.notification-content');
    if (notificationContent) {
        // Create separator
        const separator = document.createElement('span');
        separator.className = 'notification-separator';
        separator.textContent = '|';
        
        // Create notification item
        const notificationItem = document.createElement('div');
        notificationItem.className = 'notification-item';
        notificationItem.innerHTML = `
            <span class="icon">${icon}</span>
            <span>${message}</span>
        `;
        
        // Add to notification content
        notificationContent.appendChild(separator);
        notificationContent.appendChild(notificationItem);
    }
}

/* ==========================================================================
   ERROR HANDLING
   ========================================================================== */

// Handle image loading errors (hide broken images)
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            this.style.display = 'none';
        });
    });
});
