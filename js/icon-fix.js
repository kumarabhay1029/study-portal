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
            <span class="btn-icon" data-icon="profile">👤</span>
            <span class="btn-text">Profile</span>
        `;
        loginBtn.classList.add('logged-in');
        loginBtn.setAttribute('title', userEmail ? `Logged in as ${userEmail}` : 'Logged in');
        console.log('✅ Icon Fix: Button updated to Profile with user icon');
    } else {
        // Login button
        loginBtn.innerHTML = `
            <span class="btn-icon" data-icon="login">�</span>
            <span class="btn-text">Login</span>
        `;
        loginBtn.classList.remove('logged-in');
        loginBtn.setAttribute('title', 'Click to login or register');
        console.log('✅ Icon Fix: Button updated to Login with key icon');
    }
}

// Function to initialize button with proper icon
function initializeLoginButton() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `
            <span class="btn-icon" data-icon="login">�</span>
            <span class="btn-text">Login</span>
        `;
        console.log('✅ Icon Fix: Login button initialized with key icon');
    }
}

// Function to fix all corrupted icons in the page
function fixAllIcons() {
    console.log('🔧 Fixing all corrupted icons...');
    
    // Fix all corrupted btn-icon elements
    const iconElements = document.querySelectorAll('.btn-icon');
    iconElements.forEach(element => {
        const text = element.textContent;
        if (text.includes('�') || text.charCodeAt(0) === 65533) {
            const dataIcon = element.getAttribute('data-icon');
            if (dataIcon === 'profile') {
                element.textContent = '👤';
                console.log('✅ Fixed profile icon');
            } else {
                element.textContent = '🔑';
                console.log('✅ Fixed login icon');
            }
        }
    });
}

// Override the global updateUI function if it exists
if (typeof window !== 'undefined') {
    // Function to enhance auth system with icon fixes
    function enhanceAuthSystemWithIcons() {
        // Always try to fix icons
        fixAllIcons();
        
        if (window.authSystem && typeof window.authSystem.updateUI === 'function') {
            const originalUpdateUI = window.authSystem.updateUI.bind(window.authSystem);
            
            // Override with icon-aware version
            window.authSystem.updateUI = function(user) {
                // Call original function first
                try {
                    originalUpdateUI(user);
                } catch (e) {
                    console.warn('Original updateUI failed:', e);
                }
                
                // Then fix icons
                setTimeout(() => {
                    updateLoginButtonIcon(!!user, user?.email);
                    fixAllIcons();
                }, 100);
            };
            
            console.log('✅ Auth system enhanced with icon fixes');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initializeLoginButton();
            enhanceAuthSystemWithIcons();
            fixAllIcons();
        });
    } else {
        initializeLoginButton();
        enhanceAuthSystemWithIcons();
        fixAllIcons();
    }
    
    // Try to enhance and fix multiple times as system loads
    setTimeout(() => {
        enhanceAuthSystemWithIcons();
        fixAllIcons();
    }, 500);
    
    setTimeout(() => {
        enhanceAuthSystemWithIcons();
        fixAllIcons();
    }, 2000);
    
    // Watch for DOM changes and fix icons
    if (typeof MutationObserver !== 'undefined') {
        const observer = new MutationObserver(() => {
            fixAllIcons();
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Make functions available globally
    window.updateLoginButtonIcon = updateLoginButtonIcon;
    window.initializeLoginButton = initializeLoginButton;
    window.fixAllIcons = fixAllIcons;
}

console.log('✅ Icon Fix Script Loaded');
