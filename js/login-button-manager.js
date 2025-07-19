/**
 * 🔐 LOGIN BUTTON MANAGER
 * Comprehensive login button management with corruption prevention
 */

console.log('🔐 Login Button Manager Loading...');

class LoginButtonManager {
    constructor() {
        this.initButton();
        this.setupOverrides();
        this.startMonitoring();
    }
    
    initButton() {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            this.ensureCleanButton(loginBtn);
        }
    }
    
    ensureCleanButton(loginBtn, isLoggedIn = false, userEmail = '') {
        if (isLoggedIn) {
            loginBtn.innerHTML = `
                <span class="btn-icon" data-icon="profile">👤</span>
                <span class="btn-text">Profile</span>
            `;
            loginBtn.classList.add('logged-in');
            loginBtn.setAttribute('title', userEmail ? `Logged in as ${userEmail}` : 'Logged in');
        } else {
            loginBtn.innerHTML = `
                <span class="btn-icon" data-icon="login">�️</span>
                <span class="btn-text">Login</span>
            `;
            loginBtn.classList.remove('logged-in');
            loginBtn.setAttribute('title', 'Click to login or register');
        }
        console.log('✅ Clean button ensured:', isLoggedIn ? 'Profile' : 'Login');
    }
    
    setupOverrides() {
        // Override the auth system's updateUI function
        const originalUpdateUI = window.authSystem?.updateUI;
        
        if (window.authSystem) {
            window.authSystem.updateUI = (user) => {
                const loginBtn = document.querySelector('.login-btn');
                if (loginBtn) {
                    this.ensureCleanButton(loginBtn, !!user, user?.email);
                }
            };
        }
        
        // Override global updateUI if it exists
        if (typeof window.updateUI === 'function') {
            const originalGlobalUpdateUI = window.updateUI;
            window.updateUI = (user) => {
                const loginBtn = document.querySelector('.login-btn');
                if (loginBtn) {
                    this.ensureCleanButton(loginBtn, !!user, user?.email);
                }
            };
        }
    }
    
    startMonitoring() {
        // Check and fix button every second
        setInterval(() => {
            this.checkAndFix();
        }, 1000);
        
        // Also monitor DOM changes
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(() => {
                this.checkAndFix();
            });
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
    }
    
    checkAndFix() {
        const loginBtn = document.querySelector('.login-btn');
        if (!loginBtn) return;
        
        const iconElement = loginBtn.querySelector('.btn-icon');
        if (!iconElement) {
            console.log('🔧 No icon element found, recreating button...');
            this.ensureCleanButton(loginBtn);
            return;
        }
        
        const iconText = iconElement.textContent;
        if (iconText.includes('�') || iconText.includes('◊') || iconText.charCodeAt(0) === 65533 || iconText === '' || iconText === '?') {
            console.log('🔧 Corrupted icon detected, fixing...');
            const isLoggedIn = loginBtn.classList.contains('logged-in');
            const userEmail = loginBtn.getAttribute('title') || '';
            this.ensureCleanButton(loginBtn, isLoggedIn, userEmail);
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.loginButtonManager = new LoginButtonManager();
    });
} else {
    window.loginButtonManager = new LoginButtonManager();
}

// Make available globally
window.LoginButtonManager = LoginButtonManager;

console.log('✅ Login Button Manager Loaded');
