/**
 * 🔒 STABLE AUTH SYSTEM - RELOAD LOOP FIX
 * Single clean script to prevent infinite reloads
 */

console.log('🔒 Stable Auth System Loading...');

// Prevent multiple initializations
if (window.stableAuthInitialized) {
    console.log('⚠️ Auth system already initialized, skipping...');
} else {
    window.stableAuthInitialized = true;

    // Simple, stable login button management
    class StableAuth {
        constructor() {
            this.currentUser = null;
            this.initialized = false;
            this.setupStableAuth();
        }
        
        setupStableAuth() {
            if (this.initialized) return;
            this.initialized = true;
            
            console.log('🔒 Setting up stable auth...');
            
            // Simple button setup without aggressive monitoring
            this.setupLoginButton();
            
            // Listen for Firebase auth changes (if available)
            if (window.auth) {
                window.auth.onAuthStateChanged((user) => {
                    this.currentUser = user;
                    this.updateButtonState(user);
                });
            }
            
            // Simple fallback functions
            this.setupFallbacks();
        }
        
        setupLoginButton() {
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                // Ensure clean button HTML
                if (!loginBtn.querySelector('.btn-icon')) {
                    loginBtn.innerHTML = `
                        <span class="btn-icon">🗝️</span>
                        <span class="btn-text">Login</span>
                    `;
                }
                
                // Add click handler (only once)
                if (!loginBtn.hasAttribute('data-handler-added')) {
                    loginBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleLogin();
                    });
                    loginBtn.setAttribute('data-handler-added', 'true');
                }
                
                console.log('✅ Stable login button setup complete');
            }
        }
        
        handleLogin() {
            console.log('🔒 Login clicked');
            if (this.currentUser) {
                this.openProfile();
            } else {
                this.openLoginModal();
            }
        }
        
        openLoginModal() {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
                console.log('✅ Login modal opened');
            }
        }
        
        openProfile() {
            const modal = document.getElementById('profileModal');
            if (modal) {
                modal.style.display = 'flex';
                modal.classList.add('active');
                console.log('✅ Profile modal opened');
            }
        }
        
        updateButtonState(user) {
            const loginBtn = document.querySelector('.login-btn');
            if (!loginBtn) return;
            
            if (user) {
                loginBtn.innerHTML = `
                    <span class="btn-icon">👤</span>
                    <span class="btn-text">Profile</span>
                `;
                loginBtn.classList.add('logged-in');
            } else {
                loginBtn.innerHTML = `
                    <span class="btn-icon">🗝️</span>
                    <span class="btn-text">Login</span>
                `;
                loginBtn.classList.remove('logged-in');
            }
        }
        
        setupFallbacks() {
            // Simple global functions without conflicts
            if (!window.handleLogin) {
                window.handleLogin = () => this.handleLogin();
            }
            if (!window.closeLoginModal) {
                window.closeLoginModal = () => {
                    const modal = document.getElementById('loginModal');
                    if (modal) {
                        modal.style.display = 'none';
                        modal.classList.remove('active');
                    }
                };
            }
            if (!window.closeProfileModal) {
                window.closeProfileModal = () => {
                    const modal = document.getElementById('profileModal');
                    if (modal) {
                        modal.style.display = 'none';
                        modal.classList.remove('active');
                    }
                };
            }
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.stableAuth = new StableAuth();
        });
    } else {
        window.stableAuth = new StableAuth();
    }

    console.log('✅ Stable Auth System Loaded');
}
