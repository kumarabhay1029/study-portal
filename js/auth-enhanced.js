/**
 * 🔐 ENHANCED AUTH SYSTEM for GitHub Pages
 * Bulletproof authentication with better error handling and user experience
 */

console.log('🔐 Enhanced Auth System Loading...');

// Wait for Firebase to be ready
function waitForFirebase(callback, maxWait = 10000) {
    const startTime = Date.now();
    
    const checkFirebase = () => {
        if (window.firebaseReady && window.auth) {
            console.log('✅ Firebase is ready, initializing auth system...');
            callback();
        } else if (Date.now() - startTime > maxWait) {
            console.warn('⚠️ Firebase timeout, initializing fallback auth system...');
            initializeFallbackAuth();
        } else {
            setTimeout(checkFirebase, 100);
        }
    };
    
    checkFirebase();
}

// Enhanced Auth System
class StudyPortalAuth {
    constructor() {
        this.currentUser = null;
        this.authReady = false;
        this.initializeAuth();
    }
    
    initializeAuth() {
        console.log('🔐 Initializing Study Portal Auth...');
        
        // Listen for Firebase ready event
        window.addEventListener('firebaseReady', () => {
            this.setupFirebaseAuth();
        });
        
        // If Firebase is already ready
        if (window.firebaseReady) {
            this.setupFirebaseAuth();
        }
        
        // Setup UI elements
        this.setupUI();
    }
    
    setupFirebaseAuth() {
        if (!window.auth) {
            console.error('❌ Firebase Auth not available');
            return;
        }
        
        console.log('✅ Setting up Firebase Auth...');
        
        // Listen for authentication state changes
        window.auth.onAuthStateChanged((user) => {
            console.log('🔐 Auth state changed:', user ? 'Logged in' : 'Logged out');
            this.currentUser = user;
            this.updateUI(user);
            
            if (user) {
                this.handleUserLogin(user);
            } else {
                this.handleUserLogout();
            }
        });
        
        this.authReady = true;
        console.log('✅ Firebase Auth setup complete');
    }
    
    setupUI() {
        console.log('🔧 Setting up UI elements...');
        
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.bindUIElements());
        } else {
            this.bindUIElements();
        }
    }
    
    bindUIElements() {
        // Setup login button with multiple fallbacks
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            // Remove existing handlers
            loginBtn.replaceWith(loginBtn.cloneNode(true));
            const newLoginBtn = document.querySelector('.login-btn');
            
            newLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔐 Login button clicked');
                this.handleLogin();
            });
            
            console.log('✅ Login button configured');
        }
        
        // Setup form submissions
        this.setupForms();
        
        // Load remembered data
        this.loadRememberedData();
    }
    
    setupForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.loginUser(e));
        }
        
        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.registerUser(e));
        }
        
        // Forgot password form
        const forgotForm = document.getElementById('forgotForm');
        if (forgotForm) {
            forgotForm.addEventListener('submit', (e) => this.resetPassword(e));
        }
    }
    
    // Main login handler
    handleLogin() {
        console.log('🔐 handleLogin called');
        
        if (this.currentUser) {
            this.openProfileModal();
        } else {
            this.openLoginModal();
        }
    }
    
    // Open login modal
    openLoginModal() {
        console.log('🔐 Opening login modal...');
        
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.add('active');
            this.showAuthTab('login');
            console.log('✅ Login modal opened');
        } else {
            console.error('❌ Login modal not found');
            this.showError('Login modal not found. Please refresh the page.');
        }
    }
    
    // Close login modal
    closeLoginModal() {
        console.log('🔐 Closing login modal...');
        
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.classList.remove('active');
            this.clearAuthForms();
        }
    }
    
    // Show auth tab
    showAuthTab(tabName) {
        console.log('🔐 Showing auth tab:', tabName);
        
        // Hide all tabs
        const tabs = ['login', 'register', 'forgot'];
        tabs.forEach(tab => {
            const tabElement = document.getElementById(tab + 'Tab');
            const contentElement = document.getElementById(tab + 'Content');
            if (tabElement) tabElement.classList.remove('active');
            if (contentElement) contentElement.classList.remove('active');
        });
        
        // Show selected tab
        const activeTab = document.getElementById(tabName + 'Tab');
        const activeContent = document.getElementById(tabName + 'Content');
        if (activeTab) activeTab.classList.add('active');
        if (activeContent) activeContent.classList.add('active');
        
        this.clearMessages();
    }
    
    // Login user
    async loginUser(event) {
        if (event) event.preventDefault();
        console.log('🔐 Login attempt started');
        
        const email = document.getElementById('loginEmail')?.value || '';
        const password = document.getElementById('loginPassword')?.value || '';
        const rememberMe = document.getElementById('rememberMe')?.checked || false;
        const loginBtn = document.getElementById('loginBtn');
        
        // Validation
        if (!email || !password) {
            this.showError('Please enter both email and password');
            return;
        }
        
        // Update button state
        if (loginBtn) {
            loginBtn.textContent = 'Signing in...';
            loginBtn.disabled = true;
        }
        
        try {
            // Check if Firebase Auth is available
            if (!window.auth || !this.authReady) {
                throw new Error('Firebase Auth not ready');
            }
            
            // Attempt login
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ Login successful:', user.email);
            
            // Handle remember me
            if (rememberMe) {
                localStorage.setItem('rememberLogin', 'true');
                localStorage.setItem('userEmail', email);
            }
            
            // Store session data
            const sessionData = {
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };
            sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
            
            this.closeLoginModal();
            this.showSuccess('Login successful! Welcome back.');
            
        } catch (error) {
            console.error('❌ Login error:', error);
            this.handleAuthError(error);
        } finally {
            // Reset button
            if (loginBtn) {
                loginBtn.textContent = 'Sign In';
                loginBtn.disabled = false;
            }
        }
    }
    
    // Register user
    async registerUser(event) {
        if (event) event.preventDefault();
        console.log('🔐 Registration attempt started');
        
        const email = document.getElementById('registerEmail')?.value || '';
        const password = document.getElementById('registerPassword')?.value || '';
        const confirmPassword = document.getElementById('confirmPassword')?.value || '';
        const registerBtn = document.getElementById('registerBtn');
        
        // Validation
        if (!email || !password || !confirmPassword) {
            this.showError('Please fill in all fields');
            return;
        }
        
        if (password !== confirmPassword) {
            this.showError('Passwords do not match');
            return;
        }
        
        if (password.length < 6) {
            this.showError('Password must be at least 6 characters long');
            return;
        }
        
        // Update button state
        if (registerBtn) {
            registerBtn.textContent = 'Creating Account...';
            registerBtn.disabled = true;
        }
        
        try {
            if (!window.auth || !this.authReady) {
                throw new Error('Firebase Auth not ready');
            }
            
            const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ Registration successful:', user.email);
            this.closeLoginModal();
            this.showSuccess('Account created successfully! Please check your email for verification.');
            
        } catch (error) {
            console.error('❌ Registration error:', error);
            this.handleAuthError(error);
        } finally {
            if (registerBtn) {
                registerBtn.textContent = 'Create Account';
                registerBtn.disabled = false;
            }
        }
    }
    
    // Reset password
    async resetPassword(event) {
        if (event) event.preventDefault();
        console.log('🔐 Password reset attempt started');
        
        const email = document.getElementById('forgotEmail')?.value || '';
        const resetBtn = document.getElementById('resetBtn');
        
        if (!email) {
            this.showError('Please enter your email address');
            return;
        }
        
        if (resetBtn) {
            resetBtn.textContent = 'Sending...';
            resetBtn.disabled = true;
        }
        
        try {
            if (!window.auth || !this.authReady) {
                throw new Error('Firebase Auth not ready');
            }
            
            await window.auth.sendPasswordResetEmail(email);
            this.showSuccess('Password reset email sent! Check your inbox.');
            this.showAuthTab('login');
            
        } catch (error) {
            console.error('❌ Password reset error:', error);
            this.handleAuthError(error);
        } finally {
            if (resetBtn) {
                resetBtn.textContent = 'Reset Password';
                resetBtn.disabled = false;
            }
        }
    }
    
    // Logout user
    async logout() {
        console.log('🔐 Logout attempt started');
        
        try {
            if (window.auth) {
                await window.auth.signOut();
                
                // Clear session data
                sessionStorage.removeItem('currentSession');
                localStorage.removeItem('rememberLogin');
                localStorage.removeItem('userEmail');
                
                // Close profile modal
                this.closeProfileModal();
                
                console.log('✅ Logout successful');
                this.showSuccess('You have been logged out successfully.');
            }
        } catch (error) {
            console.error('❌ Logout error:', error);
            this.showError('Logout failed: ' + error.message);
        }
    }
    
    // Handle authentication errors
    handleAuthError(error) {
        let message = 'Authentication failed';
        
        switch (error.code) {
            case 'auth/api-key-not-valid':
                message = `🔧 Configuration Error

Firebase is not properly configured for this domain.

This is a setup issue - please check the FIREBASE_FIX_GUIDE.md for solutions.

The interface works in demo mode, but authentication is disabled.`;
                break;
                
            case 'auth/user-not-found':
                message = 'No account found with this email address. Please create an account first.';
                break;
                
            case 'auth/wrong-password':
                message = 'Incorrect password. Please try again.';
                break;
                
            case 'auth/invalid-email':
                message = 'Please enter a valid email address.';
                break;
                
            case 'auth/email-already-in-use':
                message = 'An account with this email already exists. Please sign in instead.';
                break;
                
            case 'auth/weak-password':
                message = 'Password is too weak. Please choose a stronger password.';
                break;
                
            default:
                if (error.message.includes('Firebase Auth not ready')) {
                    message = `🔧 Authentication System Loading

Please wait a moment for the system to initialize, then try again.

If the issue persists, check FIREBASE_FIX_GUIDE.md for solutions.`;
                } else {
                    message = 'Authentication failed: ' + (error.message || 'Unknown error');
                }
        }
        
        this.showError(message);
    }
    
    // Handle user login
    handleUserLogin(user) {
        this.currentUser = user;
        console.log('✅ User logged in:', user.email);
    }
    
    // Handle user logout
    handleUserLogout() {
        this.currentUser = null;
        console.log('🔐 User logged out');
    }
    
    // Update UI based on auth state
    updateUI(user) {
        const loginBtn = document.querySelector('.login-btn');
        if (loginBtn) {
            loginBtn.textContent = user ? 'Profile' : 'Login';
        }
    }
    
    // Helper functions
    openProfileModal() {
        if (!this.currentUser) {
            console.log('⚠️ No current user, cannot open profile modal');
            return;
        }
        
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileStatus = document.getElementById('profileStatus');
            const profileSession = document.getElementById('profileSession');
            
            if (profileName) profileName.textContent = this.currentUser.displayName || 'User';
            if (profileEmail) profileEmail.textContent = this.currentUser.email;
            if (profileStatus) {
                profileStatus.textContent = this.currentUser.emailVerified ? 
                    'Email verified ✅' : 'Email not verified ⚠️';
            }
            
            // Show session info
            if (profileSession) {
                const sessionData = sessionStorage.getItem('currentSession');
                if (sessionData) {
                    try {
                        const session = JSON.parse(sessionData);
                        const loginTime = new Date(session.loginTime).toLocaleString();
                        profileSession.textContent = `Logged in: ${loginTime}`;
                    } catch (e) {
                        profileSession.textContent = 'Session active';
                    }
                } else {
                    profileSession.textContent = 'Session active';
                }
            }
            
            profileModal.classList.add('active');
            console.log('✅ Profile modal opened for:', this.currentUser.email);
        } else {
            console.error('❌ Profile modal element not found');
        }
    }
    
    closeProfileModal() {
        console.log('🔐 Closing profile modal...');
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            profileModal.classList.remove('active');
            console.log('✅ Profile modal closed');
        } else {
            console.error('❌ Profile modal element not found');
        }
    }
    
    clearAuthForms() {
        const inputs = [
            'loginEmail', 'loginPassword', 'registerEmail', 
            'registerPassword', 'confirmPassword', 'forgotEmail'
        ];
        
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe) rememberMe.checked = false;
        
        this.clearMessages();
    }
    
    clearMessages() {
        const messages = document.querySelectorAll('.validation-message, .auth-message');
        messages.forEach(msg => msg.remove());
    }
    
    loadRememberedData() {
        const rememberLogin = localStorage.getItem('rememberLogin');
        const userEmail = localStorage.getItem('userEmail');
        
        if (rememberLogin === 'true' && userEmail) {
            const emailInput = document.getElementById('loginEmail');
            const rememberCheckbox = document.getElementById('rememberMe');
            
            if (emailInput) emailInput.value = userEmail;
            if (rememberCheckbox) rememberCheckbox.checked = true;
        }
    }
    
    // Show error message
    showError(message) {
        console.error('🚨 Auth Error:', message);
        this.showMessage(message, 'error');
    }
    
    // Show success message
    showSuccess(message) {
        console.log('✅ Auth Success:', message);
        this.showMessage(message, 'success');
    }
    
    // Show message to user
    showMessage(message, type = 'info') {
        // Try to show in modal first
        let container = document.querySelector('.login-container');
        
        // Fallback to body
        if (!container) {
            container = document.body;
        }
        
        // Clear existing messages
        const existingMessages = container.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => msg.remove());
        
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `auth-message auth-${type}`;
        messageEl.style.cssText = `
            padding: 12px 16px;
            margin: 10px 0;
            border-radius: 8px;
            font-size: 14px;
            line-height: 1.4;
            border: 1px solid;
            ${type === 'error' ? 
                'background: #fee; color: #c33; border-color: #fcc;' :
                type === 'success' ?
                'background: #efe; color: #363; border-color: #cfc;' :
                'background: #eef; color: #336; border-color: #ccf;'
            }
        `;
        messageEl.innerHTML = message.replace(/\n/g, '<br>');
        
        // Insert at top of container
        if (container.firstChild) {
            container.insertBefore(messageEl, container.firstChild);
        } else {
            container.appendChild(messageEl);
        }
        
        // Auto remove after delay for success messages
        if (type === 'success') {
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.remove();
                }
            }, 5000);
        }
    }
    
    // Toggle password visibility
    togglePasswordVisibility(inputId) {
        const input = document.getElementById(inputId);
        const icon = input?.nextElementSibling?.querySelector('i') || 
                    input?.parentNode?.querySelector('.password-toggle');
        
        if (input) {
            if (input.type === 'password') {
                input.type = 'text';
                if (icon) icon.textContent = '🙈';
            } else {
                input.type = 'password';
                if (icon) icon.textContent = '👁️';
            }
        }
    }
}

// Fallback auth for when Firebase is not available
function initializeFallbackAuth() {
    console.log('🔧 Initializing fallback auth system...');
    
    const fallbackAuth = {
        handleLogin: () => {
            console.log('🔧 Fallback: Opening login modal...');
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.classList.add('active');
            } else {
                alert('Login system is loading. Please refresh the page and try again.');
            }
        },
        
        openLoginModal: () => {
            const modal = document.getElementById('loginModal');
            if (modal) modal.classList.add('active');
        },
        
        closeLoginModal: () => {
            const modal = document.getElementById('loginModal');
            if (modal) modal.classList.remove('active');
        },
        
        loginUser: () => {
            alert('Authentication service is currently unavailable. Please check your connection and try again.');
        }
    };
    
    // Attach fallback functions to window
    Object.assign(window, fallbackAuth);
    
    console.log('✅ Fallback auth system ready');
}

// Initialize the enhanced auth system
let authSystem;

// Initialize basic fallback functions immediately
window.logout = function() {
    console.log('🔐 Logout called (fallback)');
    if (window.authSystem && typeof window.authSystem.logout === 'function') {
        window.authSystem.logout();
    } else if (window.auth) {
        // Direct Firebase logout if auth system not ready
        window.auth.signOut().then(() => {
            console.log('✅ Direct logout successful');
            alert('You have been logged out successfully.');
            
            // Clear session data
            sessionStorage.removeItem('currentSession');
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('userEmail');
            
            // Close profile modal
            const profileModal = document.getElementById('profileModal');
            if (profileModal) {
                profileModal.classList.remove('active');
            }
        }).catch((error) => {
            console.error('❌ Logout error:', error);
            alert('Logout failed: ' + error.message);
        });
    } else {
        alert('Authentication system not ready. Please refresh the page and try again.');
    }
};

window.closeProfileModal = function() {
    console.log('🔐 Closing profile modal...');
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.remove('active');
        console.log('✅ Profile modal closed');
    }
};

// Wait for Firebase or initialize fallback
waitForFirebase(() => {
    authSystem = new StudyPortalAuth();
    
    // Store authSystem globally for fallback access
    window.authSystem = authSystem;
    
    // Attach functions to window for global access
    window.handleLogin = () => authSystem.handleLogin();
    window.openLoginModal = () => authSystem.openLoginModal();
    window.closeLoginModal = () => authSystem.closeLoginModal();
    window.showAuthTab = (tab) => authSystem.showAuthTab(tab);
    window.loginUser = (event) => authSystem.loginUser(event);
    window.registerUser = (event) => authSystem.registerUser(event);
    window.resetPassword = (event) => authSystem.resetPassword(event);
    window.logout = () => authSystem.logout();
    window.openProfileModal = () => authSystem.openProfileModal();
    window.closeProfileModal = () => authSystem.closeProfileModal();
    window.togglePasswordVisibility = (id) => authSystem.togglePasswordVisibility(id);
    
    console.log('✅ Enhanced Auth System Ready!');
});

console.log('🔐 Enhanced Auth Script Loaded');
