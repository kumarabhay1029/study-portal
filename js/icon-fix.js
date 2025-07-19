/**
 * 🎨 ICON FIX SCRIPT
 * Fixes emoji encoding issues by providing fallback icons
 */

console.log('🎨 Icon Fix Script Loading...');

// Function to update login button with proper icons
function updateLoginButtonIcon(isLoggedIn, userEmail) {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;
    
    if (isLoggedIn) {
        // Profile button
        loginBtn.innerHTML = `
            <span class="btn-icon" data-icon="profile" data-text="USER">👤</span>
            <span class="btn-text">Profile</span>
        `;
        loginBtn.classList.add('logged-in');
        loginBtn.setAttribute('title', userEmail ? `Logged in as ${userEmail}` : 'Logged in');
        console.log('✅ Button updated to Profile with user icon');
    } else {
        // Login button
        loginBtn.innerHTML = `
            <span class="btn-icon" data-icon="login" data-text="KEY">🔓</span>
            <span class="btn-text">Login</span>
        `;
        loginBtn.classList.remove('logged-in');
        loginBtn.setAttribute('title', 'Click to login or register');
        console.log('✅ Button updated to Login with key icon');
    }
}

// Function to initialize button with proper icon
function initializeLoginButton() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn && !loginBtn.querySelector('.btn-icon[data-icon]')) {
        loginBtn.innerHTML = `
            <span class="btn-icon" data-icon="login" data-text="KEY">🔓</span>
            <span class="btn-text">Login</span>
        `;
        console.log('✅ Login button initialized with icon');
    }
}

// Override the global updateUI function if it exists
if (typeof window !== 'undefined') {
    // Store original function
    let originalUpdateUI = null;
    
    // Function to enhance auth system with icon fixes
    function enhanceAuthSystemWithIcons() {
        if (window.authSystem && typeof window.authSystem.updateUI === 'function') {
            originalUpdateUI = window.authSystem.updateUI.bind(window.authSystem);
            
            // Override with icon-aware version
            window.authSystem.updateUI = function(user) {
                updateLoginButtonIcon(!!user, user?.email);
            };
            
            console.log('✅ Auth system enhanced with icon fixes');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeLoginButton();
            enhanceAuthSystemWithIcons();
        });
    } else {
        initializeLoginButton();
        enhanceAuthSystemWithIcons();
    }
    
    // Try to enhance after a delay as well (in case auth system loads later)
    setTimeout(enhanceAuthSystemWithIcons, 1000);
    setTimeout(enhanceAuthSystemWithIcons, 3000);
    
    // Make functions available globally
    window.updateLoginButtonIcon = updateLoginButtonIcon;
    window.initializeLoginButton = initializeLoginButton;
}

console.log('✅ Icon Fix Script Loaded');
