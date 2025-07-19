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
            // Initialize button with login icon and text
            if (!loginBtn.querySelector('.btn-icon')) {
                loginBtn.innerHTML = `
                    <span class="btn-icon">�</span>
                    <span class="btn-text">Login</span>
                `;
                console.log('✅ Initialized button with lock icon');
            }
            
            // Remove existing handlers
            loginBtn.replaceWith(loginBtn.cloneNode(true));
            const newLoginBtn = document.querySelector('.login-btn');
            
            newLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🔐 Login button clicked');
                this.handleLogin();
            });
            
            console.log('✅ Login button configured with icon');
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
            // Remove any previous closing animation
            modal.classList.remove('closing');
            
            // Show modal with animation
            modal.style.display = 'flex';
            
            // Trigger animation after display is set
            requestAnimationFrame(() => {
                modal.classList.add('active');
            });
            
            this.showAuthTab('login');
            console.log('✅ Login modal opened with animation');
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
            // Add closing animation
            modal.classList.add('closing');
            modal.classList.remove('active');
            
            // Hide modal after animation completes
            setTimeout(() => {
                modal.style.display = 'none';
                modal.classList.remove('closing');
                this.clearAuthForms();
            }, 300);
            
            console.log('✅ Login modal closed with animation');
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
        
        // Update button state with animation
        if (loginBtn) {
            loginBtn.classList.add('loading');
            loginBtn.disabled = true;
            
            // Add pulse effect to button
            loginBtn.style.animation = 'pulse 1s ease-in-out infinite';
        }
        
        try {
            // Check if Firebase Auth is available
            if (!window.auth || !this.authReady) {
                throw new Error('Firebase Auth not ready');
            }
            
            // Add slight delay for better UX
            await new Promise(resolve => setTimeout(resolve, 500));
            
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
            
            // Close modal with animation
            this.closeLoginModal();
            
            // Show success with animation
            this.showSuccess('🎉 Login successful! Welcome back.');
            
        } catch (error) {
            console.error('❌ Login error:', error);
            this.handleAuthError(error);
        } finally {
            // Reset button state with animation
            if (loginBtn) {
                loginBtn.style.animation = '';
                
                setTimeout(() => {
                    loginBtn.classList.remove('loading');
                    loginBtn.disabled = false;
                }, 300);
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
        console.log('🔐 Logout attempt started (main method)');
        
        // Get logout button and show loading state with animation
        const logoutBtn = document.getElementById('profileLogoutBtn');
        if (logoutBtn) {
            logoutBtn.classList.add('loading');
            logoutBtn.disabled = true;
            
            // Add pulse animation during logout
            logoutBtn.style.animation = 'pulse 1s ease-in-out infinite';
        }
        
        try {
            // Add slight delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            
            // Close profile modal with animation first
            this.closeProfileModal();
            
            if (window.auth && typeof window.auth.signOut === 'function') {
                console.log('🔐 Signing out from Firebase...');
                await window.auth.signOut();
                console.log('✅ Firebase signOut successful');
            }
            
            // Clear session data
            console.log('🔧 Clearing session data...');
            sessionStorage.removeItem('currentSession');
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('userEmail');
            
            // Reset internal state
            this.currentUser = null;
            
            // Update UI with animation
            this.updateUI(null);
            
            console.log('✅ Logout successful');
            this.showSuccess('🚪 You have been signed out successfully. Come back soon! 👋');
            
        } catch (error) {
            console.error('❌ Logout error:', error);
            
            // Force logout even if Firebase fails
            console.log('🔧 Forcing manual logout...');
            sessionStorage.removeItem('currentSession');
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('userEmail');
            this.currentUser = null;
            this.updateUI(null);
            this.closeProfileModal();
            
            this.showError('Logout completed, but there was an issue: ' + error.message);
        } finally {
            // Reset button state with animation
            if (logoutBtn) {
                logoutBtn.style.animation = '';
                
                // Smooth transition back to normal state
                setTimeout(() => {
                    logoutBtn.classList.remove('loading');
                    logoutBtn.disabled = false;
                }, 300);
            }
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
            if (user) {
                // User is logged in - show profile button with icon
                loginBtn.innerHTML = `
                    <span class="btn-icon">👤</span>
                    <span class="btn-text">Profile</span>
                `;
                loginBtn.classList.add('logged-in');
                loginBtn.setAttribute('title', `Logged in as ${user.email}`);
                console.log('✅ Button updated to Profile with user icon');
            } else {
                // User is not logged in - show login button with icon
                loginBtn.innerHTML = `
                    <span class="btn-icon">�</span>
                    <span class="btn-text">Login</span>
                `;
                loginBtn.classList.remove('logged-in');
                loginBtn.setAttribute('title', 'Click to login or register');
                console.log('✅ Button updated to Login with lock icon');
            }
        }
    }
    
    // Helper functions
    openProfileModal() {
        if (!this.currentUser) {
            console.log('⚠️ No current user, cannot open profile modal');
            return;
        }
        
        console.log('🔐 Opening profile modal for:', this.currentUser.email);
        
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            const profileName = document.getElementById('profileName');
            const profileEmail = document.getElementById('profileEmail');
            const profileStatus = document.getElementById('profileStatus');
            const profileSession = document.getElementById('profileSession');
            
            // Update profile information
            if (profileName) {
                profileName.textContent = this.currentUser.displayName || 'Abhay';
            }
            if (profileEmail) {
                profileEmail.textContent = this.currentUser.email;
            }
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
                        const loginTime = new Date(session.loginTime);
                        profileSession.textContent = `Logged in: ${loginTime.toLocaleString()}`;
                    } catch (e) {
                        console.warn('Session data parse error:', e);
                        profileSession.textContent = 'Session active';
                    }
                } else {
                    // Create session data if missing
                    const newSessionData = {
                        loginTime: new Date().toISOString(),
                        rememberMe: false
                    };
                    sessionStorage.setItem('currentSession', JSON.stringify(newSessionData));
                    profileSession.textContent = `Logged in: ${new Date().toLocaleString()}`;
                }
            }
            
            // Show modal with animation
            profileModal.style.display = 'flex';
            
            // Trigger animation after display is set
            requestAnimationFrame(() => {
                profileModal.classList.add('active');
            });
            
            console.log('✅ Profile modal opened successfully with animation');
        } else {
            console.error('❌ Profile modal element not found');
        }
    }
    
    closeProfileModal() {
        console.log('🔐 Closing profile modal...');
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            // Add closing animation
            profileModal.classList.add('closing');
            profileModal.classList.remove('active');
            
            // Hide modal after animation completes
            setTimeout(() => {
                profileModal.style.display = 'none';
                profileModal.classList.remove('closing');
            }, 300);
            
            console.log('✅ Profile modal closed with animation');
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
        
        // Clear existing messages with animation
        const existingMessages = container.querySelectorAll('.auth-message');
        existingMessages.forEach(msg => {
            msg.classList.add('removing');
            setTimeout(() => msg.remove(), 300);
        });
        
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
            opacity: 0;
            transform: translateX(20px);
            transition: all 0.4s ease;
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
        
        // Trigger animation after element is added
        requestAnimationFrame(() => {
            messageEl.style.opacity = '1';
            messageEl.style.transform = 'translateX(0)';
        });
        
        // Auto remove after delay for success messages
        if (type === 'success') {
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.style.opacity = '0';
                    messageEl.style.transform = 'translateX(20px)';
                    setTimeout(() => messageEl.remove(), 300);
                }
            }, 4000);
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
    console.log('🔐 Logout called (immediate fallback)');
    
    // Get logout button and show loading state with animation
    const logoutBtn = document.getElementById('profileLogoutBtn');
    if (logoutBtn) {
        logoutBtn.classList.add('loading');
        logoutBtn.disabled = true;
        logoutBtn.style.animation = 'pulse 1s ease-in-out infinite';
    }
    
    // Try multiple approaches to ensure logout works
    if (window.authSystem && typeof window.authSystem.logout === 'function') {
        console.log('🔐 Using authSystem logout');
        window.authSystem.logout();
    } else if (window.auth && typeof window.auth.signOut === 'function') {
        console.log('🔐 Using direct Firebase logout');
        
        // Add delay for better UX
        setTimeout(() => {
            // Direct Firebase logout if auth system not ready
            window.auth.signOut().then(() => {
                console.log('✅ Direct logout successful');
                
                // Clear session data
                sessionStorage.removeItem('currentSession');
                localStorage.removeItem('rememberLogin');
                localStorage.removeItem('userEmail');
                
                // Close profile modal with animation
                const profileModal = document.getElementById('profileModal');
                if (profileModal) {
                    profileModal.classList.add('closing');
                    profileModal.classList.remove('active');
                    setTimeout(() => {
                        profileModal.style.display = 'none';
                        profileModal.classList.remove('closing');
                    }, 300);
                }
                
                // Update UI
                const loginBtn = document.querySelector('.login-btn');
                if (loginBtn) {
                    loginBtn.innerHTML = `
                        <span class="btn-icon">�</span>
                        <span class="btn-text">Login</span>
                    `;
                    loginBtn.classList.remove('logged-in');
                    loginBtn.setAttribute('title', 'Click to login or register');
                }
                
                // Show success message with better UX
                if (window.authSystem && typeof window.authSystem.showSuccess === 'function') {
                    window.authSystem.showSuccess('🚪 You have been signed out successfully. Come back soon! 👋');
                } else {
                    alert('🚪 You have been signed out successfully. Come back soon! 👋');
                }
                
            }).catch((error) => {
                console.error('❌ Logout error:', error);
                
                // Force logout even on error
                sessionStorage.removeItem('currentSession');
                localStorage.removeItem('rememberLogin');
                localStorage.removeItem('userEmail');
                
                const profileModal = document.getElementById('profileModal');
                if (profileModal) {
                    profileModal.style.display = 'none';
                }
                
                const loginBtn = document.querySelector('.login-btn');
                if (loginBtn) {
                    loginBtn.innerHTML = `
                        <span class="btn-icon">�</span>
                        <span class="btn-text">Login</span>
                    `;
                    loginBtn.classList.remove('logged-in');
                    loginBtn.setAttribute('title', 'Click to login or register');
                }
                
                alert('Logout completed, but there was an issue: ' + error.message);
            }).finally(() => {
                // Reset button state with animation
                if (logoutBtn) {
                    logoutBtn.style.animation = '';
                    setTimeout(() => {
                        logoutBtn.classList.remove('loading');
                        logoutBtn.disabled = false;
                    }, 300);
                }
            });
        }, 500);
    } else {
        console.log('🔐 Using manual logout');
        
        // Add delay for manual logout too
        setTimeout(() => {
            // Manual logout as last resort
            
            // Clear session data
            sessionStorage.removeItem('currentSession');
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('userEmail');
            
            // Close profile modal with animation
            const profileModal = document.getElementById('profileModal');
            if (profileModal) {
                profileModal.classList.add('closing');
                profileModal.classList.remove('active');
                setTimeout(() => {
                    profileModal.style.display = 'none';
                    profileModal.classList.remove('closing');
                }, 300);
            }
            
            // Update UI
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.innerHTML = `
                    <span class="btn-icon">�</span>
                    <span class="btn-text">Login</span>
                `;
                loginBtn.classList.remove('logged-in');
                loginBtn.setAttribute('title', 'Click to login or register');
            }
            
            // Reset currentUser
            if (window.authSystem) {
                window.authSystem.currentUser = null;
            }
            
            // Reset button state with animation
            if (logoutBtn) {
                logoutBtn.style.animation = '';
                setTimeout(() => {
                    logoutBtn.classList.remove('loading');
                    logoutBtn.disabled = false;
                }, 300);
            }
            
            alert('🚪 You have been signed out successfully. Come back soon! 👋');
        }, 500);
    }
};

window.closeProfileModal = function() {
    console.log('🔐 Closing profile modal (immediate)...');
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        // Add closing animation
        profileModal.classList.add('closing');
        profileModal.classList.remove('active');
        
        // Hide modal after animation completes
        setTimeout(() => {
            profileModal.style.display = 'none';
            profileModal.classList.remove('closing');
        }, 300);
        
        console.log('✅ Profile modal closed with animation');
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

// Debug function to test logout manually
window.testLogout = function() {
    console.log('🧪 Testing enhanced logout function...');
    console.log('Auth system available:', !!window.authSystem);
    console.log('Firebase auth available:', !!window.auth);
    console.log('Current user:', window.authSystem?.currentUser?.email || 'None');
    
    const logoutBtn = document.getElementById('profileLogoutBtn');
    if (logoutBtn) {
        console.log('Logout button found:', logoutBtn);
        console.log('Button classes:', logoutBtn.className);
    } else {
        console.log('⚠️ Logout button not found in DOM');
    }
    
    if (typeof window.logout === 'function') {
        console.log('🔐 Calling enhanced logout function...');
        window.logout();
    } else {
        console.error('❌ Logout function not available');
    }
};

// Additional immediate logout function for emergency use
window.forceLogout = function() {
    console.log('🚨 Force logout initiated');
    
    // Clear all session data
    sessionStorage.clear();
    localStorage.removeItem('rememberLogin');
    localStorage.removeItem('userEmail');
    
    // Close modal
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.remove('active');
    }
    
    // Update button
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `
            <span class="btn-icon">�</span>
            <span class="btn-text">Login</span>
        `;
        loginBtn.classList.remove('logged-in');
        loginBtn.setAttribute('title', 'Click to login or register');
    }
    
    // Try Firebase logout if available
    if (window.auth && typeof window.auth.signOut === 'function') {
        window.auth.signOut().catch(e => console.log('Firebase signout error:', e));
    }
    
    alert('Force logout completed!');
    console.log('✅ Force logout completed');
};

console.log('🔐 Enhanced Auth Script Loaded');
