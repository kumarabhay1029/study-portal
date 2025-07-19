/**
 * 🔐 OPTIMIZED LOGIN BUTTON MANAGER
 * Lightweight login button management without performance issues
 */

console.log('🔐 Optimized Login Button Manager Loading...');

class OptimizedLoginButtonManager {
    constructor() {
        this.isProcessing = false;
        this.lastFixTime = 0;
        this.initButton();
        this.setupLightweightMonitoring();
    }
    
    initButton() {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            this.ensureCleanButton(loginBtn);
        }
    }
    
    ensureCleanButton(loginBtn, isLoggedIn = false, userEmail = '') {
        if (this.isProcessing) return; // Prevent recursive calls
        this.isProcessing = true;
        
        try {
            if (isLoggedIn) {
                loginBtn.innerHTML = `
                    <span class="btn-icon" data-icon="profile">👤</span>
                    <span class="btn-text">Profile</span>
                `;
                loginBtn.classList.add('logged-in');
                loginBtn.setAttribute('title', userEmail ? `Logged in as ${userEmail}` : 'Logged in');
            } else {
                loginBtn.innerHTML = `
                    <span class="btn-icon" data-icon="login">🗝️</span>
                    <span class="btn-text">Login</span>
                `;
                loginBtn.classList.remove('logged-in');
                loginBtn.setAttribute('title', 'Click to login or register');
            }
            console.log('✅ Clean button ensured:', isLoggedIn ? 'Profile' : 'Login');
        } finally {
            this.isProcessing = false;
        }
    }
    
    setupLightweightMonitoring() {
        // Only check every 5 seconds instead of every second
        setInterval(() => {
            this.checkAndFix();
        }, 5000);
        
        // Remove the aggressive MutationObserver that was causing performance issues
        // Only add a simple one-time check on page interactions
        document.addEventListener('click', () => {
            setTimeout(() => this.checkAndFix(), 100);
        }, { passive: true });
    }
    
    checkAndFix() {
        const now = Date.now();
        if (now - this.lastFixTime < 1000) return; // Throttle to prevent too frequent calls
        
        const loginBtn = document.querySelector('.login-btn');
        if (!loginBtn) return;
        
        const iconElement = loginBtn.querySelector('.btn-icon');
        if (!iconElement) {
            this.ensureCleanButton(loginBtn);
            this.lastFixTime = now;
            return;
        }
        
        const iconText = iconElement.textContent;
        if (iconText.includes('◊') || iconText.includes('�') || iconText === '' || iconText === '?') {
            console.log('🔧 Corrupted icon detected, fixing...');
            const isLoggedIn = loginBtn.classList.contains('logged-in');
            const userEmail = loginBtn.getAttribute('title') || '';
            this.ensureCleanButton(loginBtn, isLoggedIn, userEmail);
            this.lastFixTime = now;
        }
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.optimizedLoginButtonManager = new OptimizedLoginButtonManager();
    });
} else {
    window.optimizedLoginButtonManager = new OptimizedLoginButtonManager();
}

// Make available globally
window.OptimizedLoginButtonManager = OptimizedLoginButtonManager;

console.log('✅ Optimized Login Button Manager Loaded');
