/**
 * 🚀 STUDY PORTAL - OPTIMIZED BUNDLE
 * Single bundled script combining:
 * - Firebase Configuration (Enhanced)
 * - Final Authentication System
 * - Main Application Logic
 * 
 * Optimized for GitHub Pages deployment
 * Version: 1.0.0 - Performance Optimized
 */

console.log('🚀 Study Portal Bundle Loading...');

// Debug mode - can be enabled by adding ?debug=true to URL
const isDebugMode = new URLSearchParams(window.location.search).get('debug') === 'true';
if (isDebugMode) {
    console.log('🐛 Debug mode enabled');
    window.studyPortalDebug = true;
}

/* ==========================================================================
   FIREBASE CONFIGURATION - SECURE VERSION
   ========================================================================== */

// Secure Firebase Configuration - API key loaded from separate file
function getFirebaseConfig() {
    // For GitHub Pages, load from the firebase-config.js file
    if (window.firebaseConfig) {
        console.log('✅ Firebase config loaded from firebase-config.js');
        return window.firebaseConfig;
    }
    
    // Check if config is available via environment variables (for local development)
    if (typeof process !== 'undefined' && process.env) {
        console.log('🔧 Loading Firebase config from environment variables');
        return {
            apiKey: process.env.FIREBASE_API_KEY,
            authDomain: process.env.FIREBASE_AUTH_DOMAIN,
            projectId: process.env.FIREBASE_PROJECT_ID,
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.FIREBASE_APP_ID
        };
    }
    
    // Fallback - should not happen in production
    console.error('❌ No Firebase configuration found!');
    return null;
}

// Get configuration securely
const firebaseConfig = getFirebaseConfig();

// Validate Firebase configuration
if (!firebaseConfig) {
    console.error('💥 Firebase configuration is missing! Please check firebase-config.js');
} else if (!firebaseConfig.apiKey || firebaseConfig.apiKey.includes('{{')) {
    console.error('💥 Firebase configuration contains placeholders! Please check firebase-config.js');
} else {
    console.log('✅ Firebase configuration validated successfully');
}

// Enhanced initialization with retry mechanism
let initializationAttempts = 0;
const maxAttempts = 3;

function initializeFirebase() {
    initializationAttempts++;
    
    // Check if we have valid configuration
    if (!firebaseConfig) {
        console.error('❌ Cannot initialize Firebase: No configuration available');
        window.firebaseReady = false;
        return;
    }
    
    try {
        // Check if Firebase is already initialized
        if (firebase.apps.length === 0) {
            console.log('🚀 Initializing Firebase with config...');
            firebase.initializeApp(firebaseConfig);
        } else {
            console.log('🔄 Firebase already initialized, using existing app');
        }
        
        console.log('✅ Firebase initialized successfully!');
        console.log('📍 Project ID:', firebaseConfig.projectId);
        console.log('🌐 Current domain:', window.location.hostname);
        console.log('🔗 Expected domain: kumarabhay1029.github.io');
        
        // Initialize Firebase Auth
        window.auth = firebase.auth();
        
        // Test authentication state
        window.auth.onAuthStateChanged(function(user) {
            console.log('🔐 Auth state changed:', user ? `User logged in: ${user.email}` : 'No user');
            
            // Dispatch custom event for auth state changes
            window.dispatchEvent(new CustomEvent('firebaseAuthReady', {
                detail: { user: user, auth: window.auth }
            }));
        });
        
        // Set persistence to LOCAL (survives browser restarts)
        window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log('🔐 Auth persistence set to LOCAL');
                window.firebaseReady = true;
            })
            .catch((error) => {
                console.warn('⚠️ Failed to set auth persistence:', error.message);
                window.firebaseReady = true; // Continue anyway
            });
            
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        console.error('🔍 Error details:', {
            name: error.name,
            message: error.message,
            code: error.code
        });
        
        if (initializationAttempts < maxAttempts) {
            console.log(`🔄 Retrying Firebase initialization... (${initializationAttempts}/${maxAttempts})`);
            setTimeout(initializeFirebase, 1000 * initializationAttempts);
        } else {
            console.error('💥 Firebase initialization failed after', maxAttempts, 'attempts');
            window.firebaseReady = false;
            
            // Show user-friendly error message
            if (window.finalAuth && window.finalAuth.showMessage) {
                window.finalAuth.showMessage('⚠️ Authentication system failed to initialize', 'error', 5000);
            }
        }
    }
}

// Firebase verification and diagnostics
function verifyFirebaseConnection() {
    console.log('🔍 Firebase Connection Diagnostic:');
    console.log('   • Firebase SDK:', typeof firebase !== 'undefined' ? '✅ Loaded' : '❌ Missing');
    console.log('   • Firebase Config:', firebaseConfig ? '✅ Available' : '❌ Missing');
    
    if (firebaseConfig) {
        console.log('   • API Key:', firebaseConfig.apiKey ? '✅ Present' : '❌ Missing');
        console.log('   • Project ID:', firebaseConfig.projectId || '❌ Missing');
        console.log('   • Auth Domain:', firebaseConfig.authDomain || '❌ Missing');
    }
    
    console.log('   • Firebase Apps:', firebase?.apps?.length || 0);
    console.log('   • Auth Service:', window.auth ? '✅ Initialized' : '❌ Not initialized');
    
    if (window.auth) {
        console.log('   • Current User:', window.auth.currentUser ? `✅ ${window.auth.currentUser.email}` : '❌ Not signed in');
    }
    
    console.log('   • Firebase Ready:', window.firebaseReady ? '✅ Ready' : '❌ Not ready');
    
    // Test Firebase functionality
    if (window.auth && window.firebaseReady) {
        console.log('🧪 Testing Firebase Auth functionality...');
        try {
            // This should not throw an error if properly initialized
            const currentUser = window.auth.currentUser;
            console.log('✅ Firebase Auth is working correctly');
        } catch (error) {
            console.error('❌ Firebase Auth test failed:', error);
        }
    }
}

// Initialize Firebase when available
function waitForFirebaseAndInitialize() {
    if (typeof firebase !== 'undefined') {
        initializeFirebase();
        setTimeout(verifyFirebaseConnection, 2000);
    } else {
        console.log('⏳ Waiting for Firebase SDK...');
        setTimeout(waitForFirebaseAndInitialize, 500);
    }
}

// Start Firebase initialization
waitForFirebaseAndInitialize();

/* ==========================================================================
   FINAL AUTHENTICATION SYSTEM
   ========================================================================== */

// Prevent multiple initializations
if (!window.finalAuthInitialized) {
    window.finalAuthInitialized = true;

    class FinalAuthSystem {
        constructor() {
            this.currentUser = null;
            this.authReady = false;
            this.initializeSystem();
            this.setupAnimationSystem();
        }

        initializeSystem() {
            console.log('🔐 Initializing Final Auth System...');
            
            // Setup UI first
            this.setupLoginButton();
            this.setupGlobalFunctions();
            
            // Then try to connect to Firebase
            this.connectToFirebase();
        }

        setupAnimationSystem() {
            // Create animation styles if not already present
            if (!document.getElementById('auth-animations')) {
                const animationStyles = document.createElement('style');
                animationStyles.id = 'auth-animations';
                animationStyles.textContent = `
                    /* Smooth Modal Animations */
                    .login-modal, .profile-modal {
                        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                        opacity: 0;
                        transform: translateY(-20px);
                    }
                    
                    .login-modal.active, .profile-modal.active {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    .modal-content {
                        transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                        transform: translateY(30px);
                        opacity: 0;
                    }
                    
                    .login-modal.active .modal-content,
                    .profile-modal.active .modal-content {
                        transform: translateY(0);
                        opacity: 1;
                    }
                    
                    /* Enhanced Message Box - Better Positioning */
                    .auth-message {
                        position: fixed;
                        top: 20px;
                        right: 20px;
                        transform: translateX(100%) scale(0.9);
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 16px 24px;
                        border-radius: 12px;
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                        z-index: 10000;
                        opacity: 0;
                        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                        pointer-events: none;
                        backdrop-filter: blur(15px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        font-weight: 500;
                        font-size: 14px;
                        max-width: 320px;
                        min-width: 250px;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }
                    
                    .auth-message.show {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                        pointer-events: auto;
                    }
                    
                    .auth-message.success {
                        background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
                        border-color: rgba(0, 255, 136, 0.3);
                    }
                    
                    .auth-message.error {
                        background: linear-gradient(135deg, #e84393 0%, #fd79a8 100%);
                        border-color: rgba(255, 82, 82, 0.3);
                    }
                    
                    .auth-message.info {
                        background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
                        border-color: rgba(52, 152, 219, 0.3);
                    }
                    
                    /* Mobile responsive */
                    @media (max-width: 768px) {
                        .auth-message {
                            top: 10px;
                            right: 10px;
                            left: 10px;
                            transform: translateY(-100%) scale(0.95);
                            max-width: none;
                        }
                        
                        .auth-message.show {
                            transform: translateY(0) scale(1);
                        }
                    }
                    
                    /* Button animations */
                    .login-btn {
                        transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                    }
                    
                    .login-btn:hover {
                        transform: translateY(-2px);
                    }
                    
                    .login-btn:active {
                        transform: translateY(0);
                    }
                `;
                document.head.appendChild(animationStyles);
                console.log('✨ Enhanced animation system initialized');
            }
        }

        showMessage(message, type = 'info', duration = 3500) {
            // Remove existing messages
            const existingMessages = document.querySelectorAll('.auth-message');
            existingMessages.forEach(msg => {
                msg.classList.remove('show');
                setTimeout(() => msg.remove(), 300);
            });

            // Create new message with icon
            const messageEl = document.createElement('div');
            messageEl.className = `auth-message ${type}`;
            
            // Add appropriate icon
            let icon = '';
            switch(type) {
                case 'success': icon = '✅'; break;
                case 'error': icon = '❌'; break;
                case 'info': icon = 'ℹ️'; break;
                default: icon = '💬'; break;
            }
            
            messageEl.innerHTML = `<span>${icon}</span><span>${message}</span>`;
            
            document.body.appendChild(messageEl);
            
            // Show animation
            setTimeout(() => {
                messageEl.classList.add('show');
            }, 50);
            
            // Hide animation
            setTimeout(() => {
                messageEl.classList.remove('show');
                setTimeout(() => {
                    if (messageEl.parentNode) {
                        messageEl.remove();
                    }
                }, 400);
            }, duration);
        }

        setupLoginButton() {
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                // Ensure clean button structure
                if (!loginBtn.querySelector('.btn-icon')) {
                    loginBtn.innerHTML = `
                        <span class="btn-icon">🗝️</span>
                        <span class="btn-text">Login</span>
                    `;
                }

                // Add click handler (only once)
                if (!loginBtn.hasAttribute('data-final-handler')) {
                    loginBtn.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleLogin();
                    });
                    loginBtn.setAttribute('data-final-handler', 'true');
                }

                console.log('✅ Login button setup complete');
            } else {
                console.log('ℹ️ Login button not found (this is normal for some pages)');
            }
        }

        connectToFirebase() {
            // Wait for Firebase to be ready
            const checkFirebase = () => {
                if (window.firebaseReady && window.auth) {
                    console.log('🔥 Firebase is ready, connecting auth...');
                    this.authReady = true;
                    
                    // Listen for auth state changes
                    window.auth.onAuthStateChanged((user) => {
                        this.currentUser = user;
                        this.updateButtonState(user);
                        
                        if (user) {
                            console.log('✅ User logged in:', user.email);
                        } else {
                            console.log('ℹ️ No user logged in');
                        }
                    });
                } else if (window.firebaseReady === false) {
                    console.error('❌ Firebase failed to initialize, auth system disabled');
                    this.authReady = false;
                    this.showMessage('⚠️ Authentication system is not available', 'error', 5000);
                } else {
                    console.log('⏳ Waiting for Firebase...');
                    setTimeout(checkFirebase, 1000);
                }
            };
            
            checkFirebase();
        }

        updateButtonState(user) {
            const loginBtn = document.querySelector('.login-btn');
            if (!loginBtn) return;

            const icon = loginBtn.querySelector('.btn-icon');
            const text = loginBtn.querySelector('.btn-text');

            if (user) {
                // Logged in state - show profile
                if (icon) icon.textContent = '👤';
                if (text) text.textContent = 'Profile';
                
                // Update click handler for profile
                loginBtn.onclick = (e) => {
                    e.preventDefault();
                    this.openProfileModal();
                };
            } else {
                // Logged out state - show login
                if (icon) icon.textContent = '🗝️';
                if (text) text.textContent = 'Login';
                
                // Update click handler for login
                loginBtn.onclick = (e) => {
                    e.preventDefault();
                    this.handleLogin();
                };
            }
        }

        handleLogin() {
            if (this.currentUser) {
                this.openProfileModal();
            } else {
                this.openLoginModal();
            }
        }

        openLoginModal() {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.style.display = 'flex';
                // Trigger reflow before adding active class for smooth animation
                modal.offsetHeight;
                modal.classList.add('active');
                console.log('🔓 Login modal opened with animation');
                this.showMessage('🌟 Welcome! Please sign in to continue', 'info', 2000);
            } else {
                console.log('ℹ️ Login modal not found');
                this.showMessage('⏳ Login system is loading...', 'info', 2000);
            }
        }

        openProfileModal() {
            const modal = document.getElementById('profileModal');
            if (modal) {
                modal.style.display = 'flex';
                // Trigger reflow before adding active class for smooth animation
                modal.offsetHeight;
                modal.classList.add('active');
                console.log('👤 Profile modal opened with animation');
                this.showMessage(`👤 Welcome back, ${this.currentUser.email}!`, 'success', 2000);
            } else {
                console.log('ℹ️ Profile modal not found');
                this.showMessage('⏳ Profile system is loading...', 'info', 2000);
            }
        }

        async loginUser(event) {
            if (event) event.preventDefault();
            
            if (!this.authReady || !window.auth) {
                this.showMessage('⏳ Authentication system is still loading. Please try again.', 'info');
                return;
            }

            // Try both possible email field IDs (for compatibility)
            const emailField = document.getElementById('email') || document.getElementById('loginEmail');
            const passwordField = document.getElementById('password') || document.getElementById('loginPassword');
            
            const email = emailField?.value?.trim();
            const password = passwordField?.value?.trim();

            console.log('🔍 Login attempt - Fields found:', {
                emailField: emailField ? emailField.id : 'not found',
                passwordField: passwordField ? passwordField.id : 'not found',
                email: email ? 'provided' : 'empty',
                password: password ? 'provided' : 'empty'
            });

            if (!email || !password) {
                this.showMessage('❌ Please enter both email and password', 'error');
                return;
            }

            try {
                console.log('🔐 Attempting login with email:', email);
                this.showMessage('🔐 Signing you in...', 'info', 2000);
                
                const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                console.log('✅ Login successful:', user.email);
                this.currentUser = user;
                this.updateButtonState(user);
                this.closeLoginModal();
                this.showMessage('🎉 Welcome back! Login successful', 'success');
                
                // Clear form fields after successful login
                if (emailField) emailField.value = '';
                if (passwordField) passwordField.value = '';
                
            } catch (error) {
                console.error('❌ Login error:', error);
                let errorMessage = 'Login failed';
                
                // Provide more user-friendly error messages
                if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email address';
                } else if (error.code === 'auth/user-disabled') {
                    errorMessage = 'This account has been disabled';
                } else if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email';
                } else if (error.code === 'auth/wrong-password') {
                    errorMessage = 'Incorrect password';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many failed attempts. Please try again later';
                } else {
                    errorMessage = error.message;
                }
                
                this.showMessage(`❌ ${errorMessage}`, 'error');
            }
        }

        async logout() {
            if (!this.authReady || !window.auth) {
                this.showMessage('⏳ Authentication system not ready', 'info');
                return;
            }

            try {
                await window.auth.signOut();
                console.log('✅ Logout successful');
                this.currentUser = null;
                this.updateButtonState(null);
                this.closeProfileModal();
                this.showMessage('🚪 Successfully signed out', 'success');
            } catch (error) {
                console.error('❌ Logout error:', error);
                this.showMessage(`❌ Logout failed: ${error.message}`, 'error');
            }
        }

        async registerWithEmailPassword(email, password) {
            if (!this.authReady || !window.auth) {
                this.showMessage('⏳ Authentication system not ready', 'info');
                return;
            }

            try {
                this.showMessage('📝 Creating your account...', 'info');
                
                // Create user with email and password
                const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                console.log('✅ Registration successful:', user.email);
                
                // Send email verification
                await user.sendEmailVerification();
                
                this.showMessage('🎉 Account created successfully! Please check your email to verify your account.', 'success');
                
                // Close the modal after a delay
                setTimeout(() => {
                    this.closeLoginModal();
                }, 3000);
                
            } catch (error) {
                console.error('❌ Registration error:', error);
                let errorMessage = 'Registration failed';
                
                if (error.code === 'auth/email-already-in-use') {
                    errorMessage = 'An account with this email already exists. Please try logging in instead.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                } else if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Please enter a valid email address.';
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Network error. Please check your connection and try again.';
                } else {
                    errorMessage = error.message;
                }
                
                this.showMessage(`❌ ${errorMessage}`, 'error');
            }
        }

        async sendPasswordReset(email) {
            if (!this.authReady || !window.auth) {
                this.showMessage('⏳ Authentication system not ready', 'info');
                return;
            }

            try {
                console.log('🔐 Sending password reset email to:', email);
                this.showMessage('📧 Sending reset email...', 'info', 2000);
                
                await window.auth.sendPasswordResetEmail(email);
                
                console.log('✅ Password reset email sent successfully');
                this.showMessage('📧 Password reset email sent! Check your inbox.', 'success', 6000);
                
                // Clear the email field
                const forgotEmailField = document.getElementById('forgotEmail');
                if (forgotEmailField) forgotEmailField.value = '';
                
                // Show additional instructions
                setTimeout(() => {
                    this.showMessage('ℹ️ Check your spam folder if you don\'t see the email', 'info', 5000);
                }, 7000);
                
            } catch (error) {
                console.error('❌ Password reset error:', error);
                let errorMessage = 'Failed to send reset email';
                
                // Provide user-friendly error messages
                if (error.code === 'auth/invalid-email') {
                    errorMessage = 'Invalid email address';
                } else if (error.code === 'auth/user-not-found') {
                    errorMessage = 'No account found with this email address';
                } else if (error.code === 'auth/too-many-requests') {
                    errorMessage = 'Too many reset attempts. Please try again later';
                } else if (error.code === 'auth/network-request-failed') {
                    errorMessage = 'Network error. Please check your internet connection';
                } else {
                    errorMessage = error.message;
                }
                
                this.showMessage(`❌ ${errorMessage}`, 'error');
            }
        }

        async handlePasswordResetCode(actionCode) {
            if (!this.authReady || !window.auth) {
                this.showMessage('⏳ Authentication system not ready', 'info');
                return;
            }

            try {
                // Verify the password reset code is valid
                const email = await window.auth.verifyPasswordResetCode(actionCode);
                console.log('✅ Password reset code verified for:', email);
                
                // Prompt user for new password
                const newPassword = prompt('Enter your new password (minimum 6 characters):');
                
                if (!newPassword) {
                    this.showMessage('❌ Password reset cancelled', 'info');
                    return;
                }
                
                if (newPassword.length < 6) {
                    this.showMessage('❌ Password must be at least 6 characters long', 'error');
                    return;
                }
                
                // Confirm the password reset
                await window.auth.confirmPasswordReset(actionCode, newPassword);
                
                console.log('✅ Password reset successful');
                this.showMessage('🎉 Password reset successful! You can now login with your new password.', 'success', 6000);
                
                // Optionally open login modal
                setTimeout(() => {
                    this.openLoginModal();
                }, 2000);
                
            } catch (error) {
                console.error('❌ Password reset code error:', error);
                let errorMessage = 'Password reset failed';
                
                if (error.code === 'auth/expired-action-code') {
                    errorMessage = 'Password reset link has expired. Please request a new one.';
                } else if (error.code === 'auth/invalid-action-code') {
                    errorMessage = 'Invalid or already used reset link. Please request a new one.';
                } else if (error.code === 'auth/weak-password') {
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                } else {
                    errorMessage = error.message;
                }
                
                this.showMessage(`❌ ${errorMessage}`, 'error');
            }
        }

        closeLoginModal() {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.classList.remove('active');
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 400);
            }
        }

        closeProfileModal() {
            const modal = document.getElementById('profileModal');
            if (modal) {
                modal.classList.remove('active');
                // Wait for animation to complete before hiding
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 400);
            }
        }

        setupGlobalFunctions() {
            // Attach all required global functions
            window.handleLogin = () => this.handleLogin();
            window.openLoginModal = () => this.openLoginModal();
            window.closeLoginModal = () => this.closeLoginModal();
            window.openProfileModal = () => this.openProfileModal();
            window.closeProfileModal = () => this.closeProfileModal();
            window.loginUser = (event) => this.loginUser(event);
            window.logout = () => this.logout();
            
            // Form functions
            window.showAuthTab = (tab) => {
                try {
                    // Prevent hash from being added to URL
                    if (window.history && window.history.replaceState) {
                        window.history.replaceState(null, null, window.location.pathname + window.location.search);
                    }
                    
                    console.log(`🔄 Attempting to switch to ${tab} tab`);
                    
                    // Check if we're on a page with tabs (like main site, not error-detection)
                    const tabButtons = document.querySelectorAll('.tab-btn');
                    if (tabButtons.length === 0) {
                        // Only warn if we're on the main page (has login modal)
                        const loginModal = document.querySelector('#loginModal');
                        if (loginModal) {
                            console.warn('⚠️ No tab buttons found in login modal');
                        } else {
                            console.log('ℹ️ No tab buttons found (not on main page)');
                        }
                        return;
                    }
                    
                    tabButtons.forEach(btn => {
                        btn.classList.remove('active');
                    });
                    
                    // Remove active class from all tab content
                    const tabContents = document.querySelectorAll('.tab-content');
                    if (tabContents.length === 0) {
                        console.warn('⚠️ No tab contents found');
                        return;
                    }
                    
                    tabContents.forEach(content => {
                        content.classList.remove('active');
                    });
                    
                    // Add active class to clicked tab button
                    const tabMap = { 'login': 0, 'register': 1, 'forgot': 2 };
                    const tabIndex = tabMap[tab];
                    
                    if (tabIndex !== undefined && tabButtons[tabIndex]) {
                        tabButtons[tabIndex].classList.add('active');
                        console.log(`✅ Tab button ${tabIndex} activated`);
                    } else {
                        console.warn(`⚠️ Tab button not found for ${tab} (index: ${tabIndex})`);
                    }
                    
                    // Add active class to corresponding content
                    const activeContent = document.getElementById(tab + 'Tab');
                    if (activeContent) {
                        activeContent.classList.add('active');
                        console.log(`✅ Tab content ${tab}Tab activated`);
                    } else {
                        console.warn(`⚠️ Tab content not found: ${tab}Tab`);
                    }
                    
                    console.log(`✅ Successfully switched to ${tab} tab`);
                } catch (error) {
                    console.error(`❌ Error switching to ${tab} tab:`, error);
                }
            };
            
            // Password strength checker
            window.checkPasswordStrength = (password) => {
                const strength = {
                    score: 0,
                    text: 'Very Weak',
                    class: 'weak',
                    percentage: 0
                };
                
                if (!password) {
                    strength.text = 'Password strength will appear here';
                    return strength;
                }
                
                let score = 0;
                const checks = {
                    length: password.length >= 8,
                    lowercase: /[a-z]/.test(password),
                    uppercase: /[A-Z]/.test(password),
                    numbers: /\d/.test(password),
                    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
                    noCommon: !['password', '123456', 'qwerty', 'abc123', 'password123'].includes(password.toLowerCase())
                };
                
                // Calculate score
                if (checks.length) score += 2;
                if (checks.lowercase) score += 1;
                if (checks.uppercase) score += 1;
                if (checks.numbers) score += 1;
                if (checks.special) score += 2;
                if (checks.noCommon) score += 1;
                if (password.length >= 12) score += 1;
                
                // Determine strength level
                if (score < 3) {
                    strength.score = 0;
                    strength.text = 'Very Weak';
                    strength.class = 'weak';
                    strength.percentage = 20;
                } else if (score < 5) {
                    strength.score = 1;
                    strength.text = 'Weak';
                    strength.class = 'weak';
                    strength.percentage = 40;
                } else if (score < 7) {
                    strength.score = 2;
                    strength.text = 'Fair';
                    strength.class = 'fair';
                    strength.percentage = 60;
                } else if (score < 8) {
                    strength.score = 3;
                    strength.text = 'Good';
                    strength.class = 'good';
                    strength.percentage = 80;
                } else {
                    strength.score = 4;
                    strength.text = 'Strong';
                    strength.class = 'strong';
                    strength.percentage = 100;
                }
                
                return strength;
            };
            
            // Update password strength display
            window.updatePasswordStrength = (password) => {
                const strength = window.checkPasswordStrength(password);
                const strengthText = document.getElementById('strengthText');
                const strengthFill = document.getElementById('strengthFill');
                
                if (strengthText) {
                    strengthText.textContent = strength.text;
                    strengthText.className = `strength-text ${strength.class}`;
                }
                
                if (strengthFill) {
                    strengthFill.className = `strength-fill ${strength.class}`;
                    strengthFill.style.width = `${strength.percentage}%`;
                }
            };
            
            window.registerUser = (event) => {
                if (event) event.preventDefault();
                
                // Get form fields
                const email = document.getElementById('registerEmail')?.value.trim();
                const password = document.getElementById('registerPassword')?.value;
                const confirmPassword = document.getElementById('confirmPassword')?.value;
                const agreeTerms = document.getElementById('agreeTerms')?.checked;
                
                // Validate fields
                if (!email || !password || !confirmPassword) {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('❌ Please fill in all required fields', 'error');
                    }
                    return;
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('❌ Please enter a valid email address', 'error');
                    }
                    return;
                }
                
                // Check password strength
                const strength = window.checkPasswordStrength(password);
                if (strength.score < 2) {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('❌ Password is too weak. Please choose a stronger password.', 'error');
                    }
                    return;
                }
                
                // Check password confirmation
                if (password !== confirmPassword) {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('❌ Passwords do not match', 'error');
                    }
                    return;
                }
                
                // Check terms agreement
                if (!agreeTerms) {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('❌ You must agree to the Terms of Service to create an account', 'error');
                    }
                    return;
                }
                
                // Proceed with registration
                if (window.auth && window.finalAuth) {
                    window.finalAuth.registerWithEmailPassword(email, password);
                } else {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('⏳ Authentication system not ready. Please try again.', 'info');
                    }
                }
            };
            
            window.resetPassword = (event) => {
                if (event) event.preventDefault();
                
                // Get email from forgot password form or login form
                const forgotEmailField = document.getElementById('forgotEmail');
                const loginEmailField = document.getElementById('loginEmail') || document.getElementById('email');
                
                let email = '';
                
                // Try to get email from forgot password form first
                if (forgotEmailField && forgotEmailField.value) {
                    email = forgotEmailField.value.trim();
                } else if (loginEmailField && loginEmailField.value) {
                    // If no email in forgot form, try to use email from login form
                    email = loginEmailField.value.trim();
                }
                
                if (!email) {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('❌ Please enter your email address', 'error');
                    }
                    return;
                }
                
                // Validate email format
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('❌ Please enter a valid email address', 'error');
                    }
                    return;
                }
                
                // Send password reset email
                if (window.auth && window.finalAuth) {
                    window.finalAuth.sendPasswordReset(email);
                } else {
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('⏳ Authentication system not ready. Please try again.', 'info');
                    }
                }
            };
            
            window.togglePasswordVisibility = (inputId) => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                }
            };
            
            // Additional password reset helper functions
            window.checkPasswordResetCode = (actionCode) => {
                // This would be called when user clicks the reset link from email
                if (window.auth && window.finalAuth) {
                    window.finalAuth.handlePasswordResetCode(actionCode);
                }
            };
            
            window.showForgotPasswordHelp = () => {
                if (window.finalAuth) {
                    window.finalAuth.showMessage('💡 Enter your email and we\'ll send you a reset link', 'info', 4000);
                }
            };
            
            // Copy email from login to forgot password form
            window.copyEmailToForgot = () => {
                const loginEmail = document.getElementById('loginEmail') || document.getElementById('email');
                const forgotEmail = document.getElementById('forgotEmail');
                
                if (loginEmail && forgotEmail && loginEmail.value) {
                    forgotEmail.value = loginEmail.value;
                    if (window.finalAuth) {
                        window.finalAuth.showMessage('📧 Email copied to reset form', 'info', 2000);
                    }
                }
            };
            
            // Setup password strength checking
            setTimeout(() => {
                try {
                    console.log('🔒 Setting up password strength checking...');
                    
                    // Check if we're on a page with registration form
                    const loginModal = document.querySelector('#loginModal');
                    const registerTab = document.querySelector('#registerTab');
                    
                    if (!loginModal || !registerTab) {
                        console.log('ℹ️ Skipping password strength setup (not on main page)');
                        return;
                    }
                    
                    const registerPasswordField = document.getElementById('registerPassword');
                    const confirmPasswordField = document.getElementById('confirmPassword');
                    
                    if (registerPasswordField) {
                        registerPasswordField.addEventListener('input', (e) => {
                            try {
                                if (window.updatePasswordStrength) {
                                    window.updatePasswordStrength(e.target.value);
                                } else {
                                    console.warn('⚠️ updatePasswordStrength function not available');
                                }
                            } catch (error) {
                                console.error('❌ Error updating password strength:', error);
                            }
                        });
                        console.log('✅ Password strength listener attached');
                    } else {
                        // Only warn if we're on the main page  
                        console.log('ℹ️ Register password field not found (not on main page)');
                    }
                    
                    if (confirmPasswordField) {
                        confirmPasswordField.addEventListener('input', (e) => {
                            try {
                                const password = document.getElementById('registerPassword')?.value || '';
                                const confirmPassword = e.target.value;
                                const validation = document.getElementById('confirmPasswordValidation');
                                
                                if (validation) {
                                    if (confirmPassword && password !== confirmPassword) {
                                        validation.textContent = 'Passwords do not match';
                                        validation.className = 'input-validation error';
                                    } else if (confirmPassword && password === confirmPassword) {
                                        validation.textContent = 'Passwords match';
                                        validation.className = 'input-validation success';
                                    } else {
                                        validation.textContent = '';
                                        validation.className = 'input-validation';
                                    }
                                } else {
                                    console.warn('⚠️ Confirm password validation element not found');
                                }
                            } catch (error) {
                                console.error('❌ Error in password confirmation:', error);
                            }
                        });
                        console.log('✅ Password confirmation listener attached');
                    } else {
                        // Only warn if we're on the main page
                        console.log('ℹ️ Confirm password field not found (not on main page)');
                    }
                    
                    // Initialize the login tab as active by default
                    if (window.showAuthTab) {
                        window.showAuthTab('login');
                        console.log('✅ Login tab initialized');
                    } else {
                        console.warn('⚠️ showAuthTab function not available for initialization');
                    }
                } catch (error) {
                    console.error('❌ Error setting up password strength checking:', error);
                }
            }, 100);
            
            console.log('✅ Global auth functions setup complete');
        }
    }

    // Initialize the final auth system
    let finalAuth;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            finalAuth = new FinalAuthSystem();
            window.finalAuth = finalAuth;
        });
    } else {
        finalAuth = new FinalAuthSystem();
        window.finalAuth = finalAuth;
    }
}

/* ==========================================================================
   MAIN APPLICATION LOGIC
   ========================================================================== */

// Global variable to track current active section in the Study Portal
let currentSection = 'home';

/**
 * Show a specific section and hide all others (SPA-like navigation)
 * @param {string} sectionName - Name of the section to show
 */
function showSection(sectionName) {
    // Prevent hash from being added to URL
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    
    // Hide all sections
    document.querySelectorAll('.section-container').forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
    }

    // Update navigation
    updateActiveNavigation(sectionName);
    closeMobileMenu();
}

/**
 * Update active state of navigation items
 * @param {string} sectionName - Name of the active section
 */
function updateActiveNavigation(sectionName) {
    // Remove active class from all nav items
    document.querySelectorAll('.nav-btn, .sidebar a, .sidebar .nav-link').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to current items
    document.querySelectorAll(`[data-section="${sectionName}"]`).forEach(item => {
        item.classList.add('active');
    });
}

/**
 * Toggle mobile menu visibility
 */
function toggleMobileMenu() {
    console.log('🍔 Hamburger menu toggle clicked');
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-backdrop');
    const hamburgerBtn = document.querySelector('.mobile-menu-toggle');
    
    console.log('📱 Elements found:', {
        sidebar: !!sidebar,
        overlay: !!overlay,
        hamburgerBtn: !!hamburgerBtn
    });
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Animate hamburger button
        if (hamburgerBtn) {
            hamburgerBtn.classList.toggle('active');
        }
        
        // Prevent body scroll when menu is open
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            console.log('✅ Mobile menu opened');
        } else {
            document.body.style.overflow = '';
            console.log('✅ Mobile menu closed');
        }
    } else {
        console.error('❌ Mobile menu elements not found');
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    console.log('🍔 Closing mobile menu');
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-backdrop');
    const hamburgerBtn = document.querySelector('.mobile-menu-toggle');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        
        // Reset hamburger button animation
        if (hamburgerBtn) {
            hamburgerBtn.classList.remove('active');
        }
        
        document.body.style.overflow = '';
        console.log('✅ Mobile menu closed');
    }
}

/**
 * Handle search functionality
 */
function handleSearch() {
    const searchInput = document.querySelector('.search-input');
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    
    if (searchTerm) {
        console.log('🔍 Searching for:', searchTerm);
        alert(`Search functionality will be implemented soon.\nSearching for: "${searchTerm}"`);
        searchInput.value = '';
    }
}

/**
 * Handle contact form submission
 */
function submitContactForm(event) {
    if (event) event.preventDefault();
    
    const name = document.getElementById('contactName')?.value;
    const email = document.getElementById('contactEmail')?.value;
    const subject = document.getElementById('contactSubject')?.value;
    const message = document.getElementById('contactMessage')?.value;
    
    if (!name || !email || !subject || !message) {
        alert('Please fill in all fields.');
        return;
    }
    
    // Here you would typically send the form data to a server
    console.log('📧 Contact form submitted:', { name, email, subject, message });
    alert('Thank you for your message! We will get back to you soon.');
    
    // Reset form
    document.getElementById('contactForm')?.reset();
}

/**
 * Show specific year in books section
 * @param {string} yearId - The year container ID to show
 */
function showYear(yearId) {
    console.log(`📚 Switching to year: ${yearId}`);
    
    // Hide all year containers
    document.querySelectorAll('.year-container').forEach(container => {
        container.classList.remove('active');
    });
    
    // Show selected year container
    const targetYear = document.getElementById(yearId);
    if (targetYear) {
        targetYear.classList.add('active');
    }
    
    // Update navigation buttons
    document.querySelectorAll('.year-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Activate current button
    const activeBtn = document.querySelector(`[data-year="${yearId}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

/**
 * Download books by category (placeholder function)
 * @param {string} category - The category to download
 */
function downloadAllBooks(category) {
    console.log(`📥 Downloading all ${category} books...`);
    showMessage(`Preparing download for all ${category} books. This feature will open individual download links.`, 'info');
    
    // Get all books of the specified category
    const categoryCards = document.querySelectorAll(`.book-card.${category}`);
    if (categoryCards.length === 0) {
        showMessage(`No ${category} books found in the current view.`, 'warning');
        return;
    }
    
    // Simulate batch download by opening links with delay
    let delay = 0;
    categoryCards.forEach(card => {
        const downloadLink = card.querySelector('.download-btn:not(.disabled)');
        if (downloadLink && downloadLink.href && downloadLink.href !== '#') {
            setTimeout(() => {
                window.open(downloadLink.href, '_blank');
            }, delay);
            delay += 1000; // 1 second delay between downloads
        }
    });
    
    showMessage(`Opening ${categoryCards.length} ${category} books in new tabs...`, 'success');
}

/**
 * Initialize books section functionality
 */
function initializeBooksSection() {
    console.log('📚 Initializing Books Section...');
    
    // Setup year navigation buttons
    document.querySelectorAll('.year-nav-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const yearId = btn.getAttribute('data-year');
            if (yearId) {
                showYear(yearId);
            }
        });
    });
    
    // Setup quick download buttons
    document.querySelectorAll('.quick-link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const category = btn.textContent.toLowerCase().includes('programming') ? 'programming' :
                           btn.textContent.toLowerCase().includes('lab') ? 'lab' :
                           btn.textContent.toLowerCase().includes('mathematics') ? 'mathematics' : '';
            if (category) {
                downloadAllBooks(category);
            }
        });
    });
    
    // Ensure first year is active by default
    setTimeout(() => {
        showYear('first-year');
    }, 100);
    
    console.log('✅ Books Section Initialized');
}

/**
 * Initialize application when DOM is ready
 */
function initializeApp() {
    console.log('📚 Study Portal App Initializing...');
    
    // Setup search functionality
    const searchInput = document.querySelector('.search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSearch();
            }
        });
    }
    
    // Setup mobile menu overlay click handler
    const overlay = document.querySelector('.mobile-backdrop');
    if (overlay) {
        overlay.addEventListener('click', closeMobileMenu);
    }
    
    // Setup navigation event listeners
    document.querySelectorAll('[data-section]').forEach(navItem => {
        navItem.addEventListener('click', (e) => {
            e.preventDefault();
            const section = navItem.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });
    
    // Setup contact form if present
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', submitContactForm);
    }
    
    // Initialize books section functionality
    initializeBooksSection();
    
    // Initial section setup
    const hash = window.location.hash.replace('#', '');
    const initialSection = hash || 'home';
    showSection(initialSection);
    
    console.log('✅ Study Portal App Initialized');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// Export global functions for HTML onclick handlers
window.showSection = showSection;
window.toggleMobileMenu = toggleMobileMenu;
window.closeMobileMenu = closeMobileMenu;
window.handleSearch = handleSearch;
window.submitContactForm = submitContactForm;
window.showYear = showYear;
window.downloadAllBooks = downloadAllBooks;

// Debug and troubleshooting functions
window.debugAuth = function() {
    console.log('🔍 === AUTHENTICATION SYSTEM DEBUG ===');
    console.log('Firebase Config:', firebaseConfig);
    console.log('Firebase Ready:', window.firebaseReady);
    console.log('Auth Ready:', window.finalAuth?.authReady);
    console.log('Current User:', window.finalAuth?.currentUser);
    console.log('Auth Object:', window.auth);
    console.log('Final Auth Object:', window.finalAuth);
    
    // Test all auth functions
    const authFunctions = ['handleLogin', 'openLoginModal', 'closeLoginModal', 'loginUser', 'logout'];
    authFunctions.forEach(func => {
        console.log(`${func}:`, typeof window[func] === 'function' ? '✅ Available' : '❌ Missing');
    });
    
    // Check for login button
    const loginBtn = document.querySelector('.login-btn');
    console.log('Login Button:', loginBtn ? '✅ Found' : '❌ Missing');
    
    if (loginBtn) {
        console.log('Login Button HTML:', loginBtn.outerHTML);
    }
    
    // Check for modals
    const loginModal = document.getElementById('loginModal');
    const profileModal = document.getElementById('profileModal');
    console.log('Login Modal:', loginModal ? '✅ Found' : '❌ Missing');
    console.log('Profile Modal:', profileModal ? '✅ Found' : '❌ Missing');
    
    console.log('===========================================');
};

window.testLogin = function() {
    console.log('🧪 Testing login system...');
    if (window.finalAuth) {
        window.finalAuth.showMessage('🧪 Test message - Login system is working!', 'info');
    } else {
        console.error('❌ finalAuth not available');
    }
};

// Password reset help and testing functions
window.testPasswordReset = function() {
    console.log('🧪 Testing password reset system...');
    if (window.finalAuth) {
        const testEmail = prompt('Enter email to test password reset:');
        if (testEmail) {
            window.finalAuth.sendPasswordReset(testEmail);
        }
    } else {
        console.error('❌ finalAuth not available');
    }
};

window.showPasswordResetHelp = function() {
    console.log('📖 === PASSWORD RESET HELP ===');
    console.log('');
    console.log('🔄 How Password Reset Works:');
    console.log('1. User clicks "Forgot Password?" link');
    console.log('2. User enters their email address');
    console.log('3. Firebase sends a reset email');
    console.log('4. User clicks the link in the email');
    console.log('5. User enters a new password');
    console.log('6. Password is updated successfully');
    console.log('');
    console.log('🎯 Available Functions:');
    console.log('• resetPassword(event) - Send reset email');
    console.log('• checkPasswordResetCode(code) - Handle reset link');
    console.log('• testPasswordReset() - Test the reset system');
    console.log('• copyEmailToForgot() - Copy email to forgot form');
    console.log('• showForgotPasswordHelp() - Show help message');
    console.log('');
    console.log('⚠️ Important Notes:');
    console.log('• Reset links expire after 1 hour');
    console.log('• Links can only be used once');
    console.log('• Check spam folder if email not received');
    console.log('• Password must be at least 6 characters');
    console.log('');
    console.log('🔧 For testing, use: testPasswordReset()');
    console.log('=====================================');
};

// Test registration system
window.testRegistration = function() {
    console.log('==========================================');
    console.log('🧪 TESTING REGISTRATION SYSTEM');
    console.log('==========================================');
    
    // Test password strength checker
    console.log('Testing password strength checker:');
    const testPasswords = ['123', 'password', 'Password1', 'MySecure123!', 'VeryStrongPassword123!@#'];
    testPasswords.forEach(pwd => {
        const strength = window.checkPasswordStrength(pwd);
        console.log(`Password: "${pwd}" -> ${strength.text} (${strength.percentage}%)`);
    });
    
    console.log('');
    console.log('📝 To test registration:');
    console.log('1. Click the "Create Account" button');
    console.log('2. Fill in email and password');
    console.log('3. Watch password strength indicator');
    console.log('4. Confirm password to see matching validation');
    console.log('5. Check terms agreement');
    console.log('6. Submit to create account');
    console.log('');
    console.log('✅ Password strength requirements:');
    console.log('• Minimum: Fair level (score 2+)');
    console.log('• 8+ characters recommended');
    console.log('• Mix of letters, numbers, symbols');
    console.log('• Avoid common passwords');
    console.log('');
    console.log('🔧 Debug functions:');
    console.log('• checkPasswordStrength("your-password")');
    console.log('• updatePasswordStrength("your-password")');
    console.log('==========================================');
};

// Test mobile menu system
window.testMobileMenu = function() {
    console.log('==========================================');
    console.log('🍔 TESTING MOBILE MENU SYSTEM');
    console.log('==========================================');
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-backdrop');
    const hamburgerBtn = document.querySelector('.mobile-menu-toggle');
    
    console.log('📱 Element status:');
    console.log('• Sidebar:', sidebar ? '✅ Found' : '❌ Not found');
    console.log('• Backdrop overlay:', overlay ? '✅ Found' : '❌ Not found');
    console.log('• Hamburger button:', hamburgerBtn ? '✅ Found' : '❌ Not found');
    
    if (sidebar) {
        console.log('• Sidebar classes:', Array.from(sidebar.classList));
    }
    if (overlay) {
        console.log('• Overlay classes:', Array.from(overlay.classList));
    }
    if (hamburgerBtn) {
        console.log('• Button classes:', Array.from(hamburgerBtn.classList));
    }
    
    console.log('');
    console.log('🧪 Manual tests:');
    console.log('1. Click hamburger button (top-left corner)');
    console.log('2. Menu should slide in from left');
    console.log('3. Click backdrop to close');
    console.log('4. Menu should slide out');
    console.log('');
    console.log('🔧 Debug functions:');
    console.log('• toggleMobileMenu() - Toggle menu');
    console.log('• closeMobileMenu() - Close menu');
    console.log('==========================================');
};

// Test authentication tabs
window.testAuthTabs = function() {
    console.log('==========================================');
    console.log('🔐 TESTING AUTHENTICATION TABS');
    console.log('==========================================');
    
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    console.log('🔍 Element status:');
    console.log('• Tab buttons found:', tabButtons.length);
    console.log('• Tab contents found:', tabContents.length);
    
    tabButtons.forEach((btn, index) => {
        console.log(`• Button ${index + 1}:`, btn.textContent, btn.classList.contains('active') ? '(active)' : '');
    });
    
    tabContents.forEach((content, index) => {
        console.log(`• Content ${index + 1}:`, content.id, content.classList.contains('active') ? '(active)' : '');
    });
    
    console.log('');
    console.log('🧪 Testing tab switching:');
    console.log('1. Testing Login tab...');
    window.showAuthTab('login');
    setTimeout(() => {
        console.log('2. Testing Register tab...');
        window.showAuthTab('register');
        setTimeout(() => {
            console.log('3. Testing Forgot tab...');
            window.showAuthTab('forgot');
            setTimeout(() => {
                console.log('4. Back to Login tab...');
                window.showAuthTab('login');
                console.log('✅ Tab switching test complete!');
            }, 1000);
        }, 1000);
    }, 1000);
    
    console.log('');
    console.log('🔧 Manual functions:');
    console.log('• showAuthTab("login") - Switch to login');
    console.log('• showAuthTab("register") - Switch to register');
    console.log('• showAuthTab("forgot") - Switch to forgot password');
    console.log('==========================================');
};

// Comprehensive error detection
window.detectErrors = function() {
    console.log('==========================================');
    console.log('🔍 COMPREHENSIVE ERROR DETECTION');
    console.log('==========================================');
    
    const errors = [];
    const warnings = [];
    
    // Detect current page type
    const isMainPage = document.querySelector('#loginModal') !== null;
    const isErrorPage = document.title.includes('Error Detection');
    
    console.log(`📍 Page type: ${isMainPage ? 'Main' : isErrorPage ? 'Error Detection' : 'Other'}`);
    
    // Check essential functions
    const essentialFunctions = [
        'showAuthTab', 'toggleMobileMenu', 'closeMobileMenu',
        'checkPasswordStrength', 'updatePasswordStrength',
        'resetPassword', 'registerUser', 'loginUser'
    ];
    
    essentialFunctions.forEach(func => {
        if (!window[func]) {
            errors.push(`Missing function: ${func}`);
        }
    });
    
    // Check essential elements (only for main page)
    if (isMainPage) {
        const essentialElements = [
            '.sidebar', '.mobile-backdrop', '.mobile-menu-toggle',
            '#loginModal', '.tab-btn', '.tab-content'
        ];
        
        essentialElements.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) {
                warnings.push(`No elements found for: ${selector}`);
            }
        });
        
        // Check form elements (only for main page)
        const formElements = [
            '#loginEmail', '#loginPassword', '#registerEmail', 
            '#registerPassword', '#confirmPassword', '#forgotEmail'
        ];
        
        formElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (!element) {
                warnings.push(`Form element not found: ${selector}`);
            }
        });
    } else {
        console.log('ℹ️ Skipping UI element checks (not on main page)');
    }
    
    // Check Firebase
    if (!window.firebaseReady) {
        warnings.push('Firebase not ready');
    }
    if (!window.auth) {
        warnings.push('Firebase Auth not available');
    }
    if (!window.finalAuth) {
        warnings.push('Final Auth system not initialized');
    }
    
    // Report results
    console.log(`🔴 Errors found: ${errors.length}`);
    errors.forEach(error => console.error(`  ❌ ${error}`));
    
    console.log(`🟡 Warnings found: ${warnings.length}`);
    warnings.forEach(warning => console.warn(`  ⚠️ ${warning}`));
    
    if (errors.length === 0 && warnings.length === 0) {
        console.log('✅ No errors or warnings detected!');
    }
    
    console.log('==========================================');
    
    return { errors, warnings };
};

// Add missing modal interaction functions
window.showTerms = function() {
    // Prevent hash from being added to URL
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    alert('Terms of Service will be displayed here. This feature will be implemented soon.');
};

window.showPrivacy = function() {
    // Prevent hash from being added to URL
    if (window.history && window.history.replaceState) {
        window.history.replaceState(null, null, window.location.pathname + window.location.search);
    }
    alert('Privacy Policy will be displayed here. This feature will be implemented soon.');
};

/**
 * MOBILE PROGRESSIVE INTERFACE CONTROLLER
 * Handles the mobile-first progressive revelation interface
 */
class MobileInterface {
    constructor() {
        this.currentUser = null;
        this.currentSection = null;
        this.isLoggedIn = false;
        this.hasShownWelcome = false; // Track if welcome message was shown
        this.lastWelcomeUser = null;  // Track which user got the welcome
        this.init();
    }
    
    init() {
        console.log('🚀 Initializing Mobile Interface...');
        
        // Setup auth state checking first
        this.checkAuthState();
        
        // Check if mobile immediately
        if (window.innerWidth <= 768) {
            this.setupMobileInterface();
        }
        
        // Listen for resize events
        window.addEventListener('resize', () => {
            if (window.innerWidth <= 768) {
                this.setupMobileInterface();
            } else {
                this.showDesktopInterface();
            }
        });
        
        // Force mobile if URL parameter is set
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('mobile') === 'true') {
            console.log('🔧 Forcing mobile view via URL parameter');
            this.setupMobileInterface();
        }
    }
    
    setupMobileInterface() {
        console.log('📱 Setting up mobile interface...');
        
        // Hide desktop elements
        this.hideDesktopElements();
        
        // Create mobile landing if not exists
        if (!document.querySelector('.mobile-landing')) {
            this.createMobileLanding();
        }
        
        // Create mobile app container if not exists
        if (!document.querySelector('.mobile-app')) {
            this.createMobileApp();
        }
        
        // Show appropriate state
        if (this.isLoggedIn) {
            this.showMobileApp();
        } else {
            this.showMobileLanding();
        }
    }
    
    hideDesktopElements() {
        const desktopElements = [
            '.main-bar',
            '.sidebar', 
            '.mobile-menu-toggle',
            '.content-area',
            '.notification-bar'
        ];
        
        desktopElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = 'none';
            }
        });
    }
    
    showDesktopInterface() {
        // Hide mobile elements
        const mobileLanding = document.querySelector('.mobile-landing');
        const mobileApp = document.querySelector('.mobile-app');
        
        if (mobileLanding) mobileLanding.style.display = 'none';
        if (mobileApp) mobileApp.style.display = 'none';
        
        // Show desktop elements
        const desktopElements = [
            '.main-bar',
            '.sidebar',
            '.mobile-menu-toggle', 
            '.content-area',
            '.notification-bar'
        ];
        
        desktopElements.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = '';
            }
        });
    }
    
    createMobileLanding() {
        const landing = document.createElement('div');
        landing.className = 'mobile-landing';
        landing.innerHTML = `
            <div class="landing-logo">📖</div>
            <h1 class="landing-title">Study Portal</h1>
            <p class="landing-subtitle">Your complete academic resource hub for BCA studies</p>
            <button class="mobile-login-btn" onclick="window.openMobileLoginSafe()">
                <span>🔐 Enter Portal</span>
            </button>
        `;
        
        document.body.appendChild(landing);
        
        // Add safe login function
        window.openMobileLoginSafe = () => {
            console.log('🔐 Mobile login button clicked');
            if (window.mobileInterface && window.mobileInterface.openMobileLogin) {
                window.mobileInterface.openMobileLogin();
            } else {
                console.log('⚠️ Mobile interface not ready, using fallback');
                // Fallback to direct modal opening
                const loginModal = document.getElementById('loginModal');
                if (loginModal) {
                    loginModal.style.display = 'flex';
                    setTimeout(() => {
                        loginModal.classList.add('active');
                    }, 10);
                    console.log('✅ Login modal opened directly');
                } else {
                    console.error('❌ Login modal not found');
                    alert('Login system is loading. Please try again in a moment.');
                }
            }
        };
    }
    
    createMobileApp() {
        const app = document.createElement('div');
        app.className = 'mobile-app';
        app.innerHTML = `
            <!-- Mobile Header -->
            <div class="mobile-header">
                <div class="user-avatar" id="mobileUserAvatar">👤</div>
                <div class="welcome-text" id="mobileWelcomeText">Welcome!</div>
                <div class="user-email" id="mobileUserEmail">user@example.com</div>
                <button class="mobile-user-btn" onclick="mobileInterface.toggleUserMenu()">
                    <span id="userMenuText">👋 Tap to explore</span>
                </button>
            </div>
            
            <!-- Expandable Menu Grid -->
            <div class="mobile-menu-grid" id="mobileMenuGrid" style="display: none;">
                <div class="mobile-menu-item books" onclick="mobileInterface.openSection('books')">
                    <span class="menu-icon">📚</span>
                    <div class="menu-label">Books</div>
                    <div class="menu-subtitle">Study materials & textbooks</div>
                </div>
                
                <div class="mobile-menu-item assignments" onclick="mobileInterface.openSection('assignments')">
                    <span class="menu-icon">📝</span>
                    <div class="menu-label">Assignments</div>
                    <div class="menu-subtitle">Tasks & submissions</div>
                </div>
                
                <div class="mobile-menu-item notes" onclick="mobileInterface.openSection('notes')">
                    <span class="menu-icon">📋</span>
                    <div class="menu-label">Notes</div>
                    <div class="menu-subtitle">Quick references</div>
                </div>
                
                <div class="mobile-menu-item research" onclick="mobileInterface.openSection('research')">
                    <span class="menu-icon">📄</span>
                    <div class="menu-label">Research</div>
                    <div class="menu-subtitle">Papers & publications</div>
                </div>
                
                <div class="mobile-menu-item projects" onclick="mobileInterface.openSection('projects')">
                    <span class="menu-icon">🚀</span>
                    <div class="menu-label">Projects</div>
                    <div class="menu-subtitle">Ideas & collaboration</div>
                </div>
                
                <div class="mobile-menu-item community" onclick="mobileInterface.openSection('community')">
                    <span class="menu-icon">🤝</span>
                    <div class="menu-label">Community</div>
                    <div class="menu-subtitle">Connect & share</div>
                </div>
            </div>
            
            <!-- Logout Button (initially hidden) -->
            <button class="mobile-logout-btn" id="mobileLogoutBtn" style="display: none;" onclick="mobileInterface.logout()">
                🚪 Sign Out
            </button>
            
            <!-- Section Content Areas -->
            <div class="mobile-section" id="mobile-books-section">
                <div class="section-header">
                    <button class="back-btn" onclick="mobileInterface.closeSection()">←</button>
                    <h2 class="section-title-mobile">📚 Study Books</h2>
                </div>
                <div class="section-content-mobile">
                    <div class="mobile-books-grid" id="mobileBooksGrid">
                        <!-- Books will be loaded here -->
                    </div>
                </div>
            </div>
            
            <div class="mobile-section" id="mobile-assignments-section">
                <div class="section-header">
                    <button class="back-btn" onclick="mobileInterface.closeSection()">←</button>
                    <h2 class="section-title-mobile">📝 Assignments</h2>
                </div>
                <div class="section-content-mobile">
                    <p>Track your assignments and submission deadlines.</p>
                    <ul>
                        <li>Assignment 1 - Due: January 30th</li>
                        <li>Assignment 2 - Due: February 15th</li>
                        <li>Assignment 3 - Due: March 10th</li>
                    </ul>
                </div>
            </div>
            
            <div class="mobile-section" id="mobile-notes-section">
                <div class="section-header">
                    <button class="back-btn" onclick="mobileInterface.closeSection()">←</button>
                    <h2 class="section-title-mobile">📋 Study Notes</h2>
                </div>
                <div class="section-content-mobile">
                    <p>Quick reference notes for all subjects.</p>
                    <ul>
                        <li>C Programming - Complete Guide</li>
                        <li>Data Structures - Theory & Practice</li>
                        <li>Database Management - Concepts</li>
                    </ul>
                </div>
            </div>
            
            <div class="mobile-section" id="mobile-research-section">
                <div class="section-header">
                    <button class="back-btn" onclick="mobileInterface.closeSection()">←</button>
                    <h2 class="section-title-mobile">📄 Research Papers</h2>
                </div>
                <div class="section-content-mobile">
                    <p>Academic papers organized by topics and semesters.</p>
                    <p>Browse through our collection of peer-reviewed research.</p>
                </div>
            </div>
            
            <div class="mobile-section" id="mobile-projects-section">
                <div class="section-header">
                    <button class="back-btn" onclick="mobileInterface.closeSection()">←</button>
                    <h2 class="section-title-mobile">🚀 Projects</h2>
                </div>
                <div class="section-content-mobile">
                    <p>Explore project ideas and collaborate with fellow students.</p>
                    <ul>
                        <li>Library Management System</li>
                        <li>E-commerce Website</li>
                        <li>Student Information System</li>
                    </ul>
                </div>
            </div>
            
            <div class="mobile-section" id="mobile-community-section">
                <div class="section-header">
                    <button class="back-btn" onclick="mobileInterface.closeSection()">←</button>
                    <h2 class="section-title-mobile">🤝 Community</h2>
                </div>
                <div class="section-content-mobile">
                    <p>Connect with fellow students and join study groups.</p>
                    <p>Share knowledge and help each other succeed.</p>
                </div>
            </div>
        `;
        
        document.body.appendChild(app);
    }
    
    showMobileLanding() {
        const landing = document.querySelector('.mobile-landing');
        const app = document.querySelector('.mobile-app');
        
        if (landing) {
            landing.classList.remove('hidden');
            landing.style.display = 'flex';
        }
        if (app) {
            app.classList.remove('active');
            app.style.display = 'none';
        }
    }
    
    showMobileApp() {
        const landing = document.querySelector('.mobile-landing');
        const app = document.querySelector('.mobile-app');
        
        if (landing) {
            landing.classList.add('hidden');
            landing.style.display = 'none';
        }
        if (app) {
            app.classList.add('active');
            app.style.display = 'block';
        }
        
        this.updateUserInfo();
    }
    
    openMobileLogin() {
        console.log('🔐 Opening mobile login...');
        
        // Open the existing login modal
        const loginModal = document.getElementById('loginModal');
        if (loginModal) {
            loginModal.classList.add('active');
        }
        
        // Listen for successful login
        this.listenForLogin();
    }
    
    listenForLogin() {
        // Override the existing login success handler
        const originalLoginUser = window.loginUser;
        
        if (!originalLoginUser) {
            console.warn('⚠️ Original loginUser function not found, creating wrapper');
            // If original function doesn't exist, create our own
            window.loginUser = async (event) => {
                return await this.handleDirectLogin(event);
            };
            return;
        }
        
        window.loginUser = async (event) => {
            try {
                const result = await originalLoginUser(event);
                
                // Check if login was successful
                if (window.auth && window.auth.currentUser) {
                    console.log('✅ Mobile interface detected successful login');
                    
                    // Close login modal
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) {
                        loginModal.classList.remove('active');
                        setTimeout(() => {
                            loginModal.style.display = 'none';
                        }, 400);
                    }
                    
                    // Update mobile interface
                    this.isLoggedIn = true;
                    this.currentUser = window.auth.currentUser;
                    this.showMobileDashboard();
                    
                    return { success: true, user: window.auth.currentUser };
                }
                
                return result;
            } catch (error) {
                console.error('❌ Mobile login handler error:', error);
                return { success: false, error: error.message };
            }
        };
    }
    
    async handleDirectLogin(event) {
        if (event) event.preventDefault();
        
        if (!window.auth) {
            console.error('❌ Firebase Auth not available');
            return { success: false, error: 'Authentication system not ready' };
        }

        // Get form fields
        const emailField = document.getElementById('email') || document.getElementById('loginEmail');
        const passwordField = document.getElementById('password') || document.getElementById('loginPassword');
        
        const email = emailField?.value?.trim();
        const password = passwordField?.value?.trim();

        if (!email || !password) {
            if (window.finalAuth) {
                window.finalAuth.showMessage('❌ Please enter both email and password', 'error');
            }
            return { success: false, error: 'Missing credentials' };
        }

        try {
            console.log('🔐 Mobile interface attempting direct login...');
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('✅ Direct login successful:', user.email);
            
            // Clear form fields
            if (emailField) emailField.value = '';
            if (passwordField) passwordField.value = '';
            
            return { success: true, user: user };
            
        } catch (error) {
            console.error('❌ Direct login error:', error);
            
            let errorMessage = 'Login failed';
            if (error.code === 'auth/invalid-email') {
                errorMessage = 'Invalid email address';
            } else if (error.code === 'auth/user-not-found') {
                errorMessage = 'No account found with this email';
            } else if (error.code === 'auth/wrong-password') {
                errorMessage = 'Incorrect password';
            }
            
            if (window.finalAuth) {
                window.finalAuth.showMessage(`❌ ${errorMessage}`, 'error');
            }
            
            return { success: false, error: errorMessage };
        }
    }
    
    showMobileDashboard() {
        const landing = document.querySelector('.mobile-landing');
        const app = document.querySelector('.mobile-app');
        
        if (landing) {
            landing.style.display = 'none';
        }
        if (app) {
            app.style.display = 'block';
            this.loadMobileDashboard();
        }
    }
    
    loadMobileDashboard() {
        const app = document.querySelector('.mobile-app');
        if (!app) return;
        
        const user = this.currentUser || { displayName: 'Student', email: 'user@email.com' };
        
        app.innerHTML = `
            <div class="mobile-dashboard-container">
                <!-- User Header -->
                <div class="mobile-user-header">
                    <div class="user-avatar-large">
                        ${user.photoURL ? 
                            `<img src="${user.photoURL}" alt="User" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">` : 
                            ''
                        }
                        <div class="avatar-fallback" ${user.photoURL ? 'style="display: none;"' : ''}>
                            ${(user.displayName || user.email).charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div class="user-info">
                        <h3>Welcome back!</h3>
                        <p class="user-name">${user.displayName || 'Student'}</p>
                        <span class="user-role">BCA Student Portal</span>
                    </div>
                    <button class="mobile-logout-header" onclick="mobileInterface.handleMobileLogout()">
                        🚪
                    </button>
                </div>
                
                <!-- Dashboard Stats -->
                <div class="mobile-dashboard-stats">
                    <div class="stat-card books-stat">
                        <span class="stat-icon">📚</span>
                        <span class="stat-number">38+</span>
                        <span class="stat-label">Study Books</span>
                    </div>
                    <div class="stat-card assignments-stat">
                        <span class="stat-icon">📝</span>
                        <span class="stat-number">12</span>
                        <span class="stat-label">Assignments</span>
                    </div>
                    <div class="stat-card projects-stat">
                        <span class="stat-icon">🚀</span>
                        <span class="stat-number">6</span>
                        <span class="stat-label">Projects</span>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="mobile-quick-actions">
                    <h4>📌 Quick Access</h4>
                    <div class="quick-action-buttons">
                        <button class="quick-btn books" onclick="mobileInterface.showMobileSection('books')">
                            📚 Study Books
                            <span class="quick-subtitle">All semester materials</span>
                        </button>
                        <button class="quick-btn assignments" onclick="mobileInterface.showMobileSection('assignments')">
                            📝 Assignments
                            <span class="quick-subtitle">Tasks & deadlines</span>
                        </button>
                        <button class="quick-btn notes" onclick="mobileInterface.showMobileSection('notes')">
                            📋 Study Notes
                            <span class="quick-subtitle">Quick references</span>
                        </button>
                    </div>
                </div>
                
                <!-- Explore All Button -->
                <button class="mobile-explore-btn" onclick="mobileInterface.showAllSections()">
                    <span class="explore-icon">🧭</span>
                    <div class="explore-content">
                        <div class="explore-title">Explore All Sections</div>
                        <div class="explore-subtitle">Tap to see all available options</div>
                    </div>
                    <span class="explore-arrow">→</span>
                </button>
                
                <!-- Recent Activity -->
                <div class="mobile-recent-activity">
                    <h4>🕒 Recent Activity</h4>
                    <div class="activity-list">
                        <div class="activity-item">
                            <span class="activity-icon">📖</span>
                            <div class="activity-content">
                                <span class="activity-text">Downloaded BCS-111 Computer Basics</span>
                                <span class="activity-time">2 hours ago</span>
                            </div>
                        </div>
                        <div class="activity-item">
                            <span class="activity-icon">📝</span>
                            <div class="activity-content">
                                <span class="activity-text">Viewed Assignment Guidelines</span>
                                <span class="activity-time">1 day ago</span>
                            </div>
                        </div>
                        <div class="activity-item">
                            <span class="activity-icon">🚀</span>
                            <div class="activity-content">
                                <span class="activity-text">Explored Project Ideas</span>
                                <span class="activity-time">3 days ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    showAllSections() {
        const app = document.querySelector('.mobile-app');
        if (!app) return;
        
        app.innerHTML = `
            <div class="mobile-sections-grid">
                <!-- Header -->
                <div class="sections-header">
                    <button class="mobile-back-btn" onclick="mobileInterface.backToDashboard()">
                        ← Dashboard
                    </button>
                    <h3>🗂️ All Sections</h3>
                    <div class="header-spacer"></div>
                </div>
                
                <!-- Sections Grid -->
                <div class="sections-grid">
                    <div class="section-card books" onclick="mobileInterface.showMobileSection('books')">
                        <div class="card-icon">📚</div>
                        <div class="card-content">
                            <h4>Study Books</h4>
                            <p>38+ BCA textbooks & study materials</p>
                            <span class="card-badge active">6 Semesters</span>
                        </div>
                        <div class="card-arrow">→</div>
                    </div>
                    
                    <div class="section-card assignments" onclick="mobileInterface.showMobileSection('assignments')">
                        <div class="card-icon">📝</div>
                        <div class="card-content">
                            <h4>Assignments</h4>
                            <p>Tasks, submissions & deadlines</p>
                            <span class="card-badge urgent">Due Soon</span>
                        </div>
                        <div class="card-arrow">→</div>
                    </div>
                    
                    <div class="section-card notes" onclick="mobileInterface.showMobileSection('notes')">
                        <div class="card-icon">📋</div>
                        <div class="card-content">
                            <h4>Study Notes</h4>
                            <p>Quick references & summaries</p>
                            <span class="card-badge updated">Updated</span>
                        </div>
                        <div class="card-arrow">→</div>
                    </div>
                    
                    <div class="section-card research" onclick="mobileInterface.showMobileSection('research')">
                        <div class="card-icon">📄</div>
                        <div class="card-content">
                            <h4>Research Papers</h4>
                            <p>Academic papers & publications</p>
                            <span class="card-badge new">Latest</span>
                        </div>
                        <div class="card-arrow">→</div>
                    </div>
                    
                    <div class="section-card projects" onclick="mobileInterface.showMobileSection('projects')">
                        <div class="card-icon">🚀</div>
                        <div class="card-content">
                            <h4>Projects</h4>
                            <p>Ideas, collaboration & resources</p>
                            <span class="card-badge special">BCSP</span>
                        </div>
                        <div class="card-arrow">→</div>
                    </div>
                    
                    <div class="section-card community" onclick="mobileInterface.showMobileSection('community')">
                        <div class="card-icon">🤝</div>
                        <div class="card-content">
                            <h4>Community</h4>
                            <p>Connect, share & discuss</p>
                            <span class="card-badge social">Social</span>
                        </div>
                        <div class="card-arrow">→</div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div class="sections-footer">
                    <p>📱 Tap any section to explore</p>
                </div>
            </div>
        `;
    }
    
    backToDashboard() {
        this.loadMobileDashboard();
    }
    
    handleMobileLogout() {
        if (confirm('Are you sure you want to logout?')) {
            // Call existing logout function
            if (typeof finalAuth !== 'undefined' && finalAuth.logout) {
                finalAuth.logout();
            } else if (typeof logout === 'function') {
                logout();
            }
            
            // Reset mobile interface
            this.isLoggedIn = false;
            this.currentUser = null;
            this.showMobileLanding();
        }
    }
    
    toggleUserMenu() {
        const menuGrid = document.getElementById('mobileMenuGrid');
        const userMenuText = document.getElementById('userMenuText');
        const logoutBtn = document.getElementById('mobileLogoutBtn');
        
        if (menuGrid.style.display === 'none') {
            // Show menu
            menuGrid.style.display = 'grid';
            menuGrid.classList.add('slide-up');
            userMenuText.textContent = '📋 Choose section';
            
            // Show logout button
            logoutBtn.style.display = 'block';
            logoutBtn.classList.add('fade-in');
        } else {
            // Hide menu
            menuGrid.style.display = 'none';
            userMenuText.textContent = '👋 Tap to explore';
            logoutBtn.style.display = 'none';
        }
    }
    
    openSection(sectionName) {
        console.log(`📱 Opening section: ${sectionName}`);
        
        // Hide menu grid
        const menuGrid = document.getElementById('mobileMenuGrid');
        if (menuGrid) {
            menuGrid.style.display = 'none';
        }
        
        // Show section
        const section = document.getElementById(`mobile-${sectionName}-section`);
        if (section) {
            section.classList.add('active');
            this.currentSection = sectionName;
            
            // Load section specific content
            this.loadSectionContent(sectionName);
        }
    }
    
    showMobileSection(sectionName) {
        console.log(`📱 Opening section: ${sectionName}`);
        
        const app = document.querySelector('.mobile-app');
        if (!app) return;
        
        this.currentSection = sectionName;
        
        // Create section view with navigation
        app.innerHTML = `
            <div class="mobile-section-view">
                <!-- Section Header -->
                <div class="mobile-section-header">
                    <button class="section-back-btn" onclick="mobileInterface.backToDashboard()">
                        ← Dashboard
                    </button>
                    <h3>${this.getSectionTitle(sectionName)}</h3>
                    <button class="section-menu-btn" onclick="mobileInterface.showAllSections()">
                        🗂️
                    </button>
                </div>
                
                <!-- Section Content -->
                <div class="mobile-section-content">
                    ${this.getSectionContent(sectionName)}
                </div>
            </div>
        `;
    }
    
    getSectionTitle(sectionName) {
        const titles = {
            'books': '📚 Study Books',
            'assignments': '📝 Assignments', 
            'notes': '📋 Study Notes',
            'research': '📄 Research Papers',
            'projects': '🚀 Projects',
            'community': '🤝 Community'
        };
        return titles[sectionName] || 'Section';
    }
    
    getSectionContent(sectionName) {
        switch(sectionName) {
            case 'books':
                return this.getBooksContent();
            case 'assignments':
                return this.getAssignmentsContent();
            case 'notes':
                return this.getNotesContent();
            case 'research':
                return this.getResearchContent();
            case 'projects':
                return this.getProjectsContent();
            case 'community':
                return this.getCommunityContent();
            default:
                return '<p>Content coming soon...</p>';
        }
    }
    
    getBooksContent() {
        const books = [
            { title: 'BEVAE-181', subtitle: 'Environmental Studies', url: 'https://egyankosh.ac.in/handle/123456789/61136', semester: '1st' },
            { title: 'BEGLA-136', subtitle: 'English at Workplace', url: 'https://egyankosh.ac.in/handle/123456789/56579', semester: '1st' },
            { title: 'BCS-111', subtitle: 'Computer Basics and PC Software', url: 'https://egyankosh.ac.in/handle/123456789/434', semester: '1st' },
            { title: 'BCSL-013', subtitle: 'Computer Basics Lab', url: 'https://egyankosh.ac.in/handle/123456789/442', semester: '1st' },
            { title: 'BCS-012', subtitle: 'Basic Mathematics', url: 'https://egyankosh.ac.in/handle/123456789/442', semester: '1st' },
            { title: 'FEG-02', subtitle: 'Foundation in English-2', url: 'https://egyankosh.ac.in/handle/123456789/422', semester: '1st' },
            { title: 'MCS-202', subtitle: 'Computer Organisation', url: 'https://egyankosh.ac.in/handle/123456789/73833', semester: '2nd' },
            { title: 'MCS-203', subtitle: 'Operating Systems', url: 'https://egyankosh.ac.in/handle/123456789/72496', semester: '2nd' },
            { title: 'MCSL-204', subtitle: 'Windows & Linux Lab', url: 'https://egyankosh.ac.in/handle/123456789/72667', semester: '2nd' },
            { title: 'MCSL-205', subtitle: 'C & Python Lab', url: 'https://egyankosh.ac.in/handle/123456789/72733', semester: '2nd' },
            { title: 'MCS-201', subtitle: 'Programming in C & Python', url: 'https://egyankosh.ac.in/handle/123456789/72701', semester: '2nd' }
        ];
        
        // Group books by semester
        const semesters = {};
        books.forEach(book => {
            if (!semesters[book.semester]) {
                semesters[book.semester] = [];
            }
            semesters[book.semester].push(book);
        });
        
        let content = '<div class="mobile-books-container">';
        
        // Add quick stats
        content += `
            <div class="books-stats">
                <div class="books-stat-item">
                    <span class="stat-number">${books.length}</span>
                    <span class="stat-label">Total Books</span>
                </div>
                <div class="books-stat-item">
                    <span class="stat-number">${Object.keys(semesters).length}</span>
                    <span class="stat-label">Semesters</span>
                </div>
                <div class="books-stat-item">
                    <span class="stat-number">PDF</span>
                    <span class="stat-label">Format</span>
                </div>
            </div>
        `;
        
        // Add semester sections
        Object.keys(semesters).sort().forEach(semester => {
            content += `
                <div class="semester-section">
                    <h4 class="semester-title">${semester} Semester</h4>
                    <div class="mobile-books-grid">
            `;
            
            semesters[semester].forEach(book => {
                content += `
                    <div class="mobile-book-card">
                        <div class="book-header">
                            <div class="book-title-mobile">${book.title}</div>
                            <div class="book-semester-badge">${semester}</div>
                        </div>
                        <div class="book-subtitle-mobile">${book.subtitle}</div>
                        <button class="mobile-download-btn" onclick="window.open('${book.url}', '_blank')">
                            📥 Download PDF
                        </button>
                    </div>
                `;
            });
            
            content += '</div></div>';
        });
        
        content += '</div>';
        return content;
    }
    
    getAssignmentsContent() {
        return `
            <div class="mobile-assignments-container">
                <div class="assignments-stats">
                    <div class="assignment-stat pending">
                        <span class="stat-number">3</span>
                        <span class="stat-label">Pending</span>
                    </div>
                    <div class="assignment-stat completed">
                        <span class="stat-number">8</span>
                        <span class="stat-label">Completed</span>
                    </div>
                    <div class="assignment-stat upcoming">
                        <span class="stat-number">2</span>
                        <span class="stat-label">Upcoming</span>
                    </div>
                </div>
                
                <div class="assignments-list">
                    <div class="assignment-item urgent">
                        <div class="assignment-header">
                            <h4>Data Structures Assignment</h4>
                            <span class="due-badge urgent">Due Today</span>
                        </div>
                        <p>Implement Binary Tree operations in C</p>
                        <div class="assignment-actions">
                            <button class="btn-submit">📤 Submit</button>
                            <button class="btn-details">📋 Details</button>
                        </div>
                    </div>
                    
                    <div class="assignment-item warning">
                        <div class="assignment-header">
                            <h4>Database Management Project</h4>
                            <span class="due-badge warning">Due in 2 days</span>
                        </div>
                        <p>Design ER diagram for library system</p>
                        <div class="assignment-actions">
                            <button class="btn-submit">📤 Submit</button>
                            <button class="btn-details">📋 Details</button>
                        </div>
                    </div>
                    
                    <div class="assignment-item normal">
                        <div class="assignment-header">
                            <h4>Web Technology Assignment</h4>
                            <span class="due-badge normal">Due in 1 week</span>
                        </div>
                        <p>Create responsive website using HTML/CSS</p>
                        <div class="assignment-actions">
                            <button class="btn-submit">📤 Submit</button>
                            <button class="btn-details">📋 Details</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getNotesContent() {
        return `
            <div class="mobile-notes-container">
                <div class="notes-categories">
                    <button class="note-category active" onclick="mobileInterface.filterNotes('all')">All Notes</button>
                    <button class="note-category" onclick="mobileInterface.filterNotes('programming')">Programming</button>
                    <button class="note-category" onclick="mobileInterface.filterNotes('theory')">Theory</button>
                </div>
                
                <div class="notes-grid">
                    <div class="note-card programming">
                        <div class="note-icon">💻</div>
                        <h4>C Programming Basics</h4>
                        <p>Variables, data types, control structures</p>
                        <div class="note-meta">
                            <span>📅 Last updated: 2 days ago</span>
                            <span>📖 5 min read</span>
                        </div>
                        <button class="note-btn">📖 Read Notes</button>
                    </div>
                    
                    <div class="note-card theory">
                        <div class="note-icon">📚</div>
                        <h4>Database Concepts</h4>
                        <p>RDBMS, normalization, SQL basics</p>
                        <div class="note-meta">
                            <span>📅 Last updated: 1 week ago</span>
                            <span>📖 8 min read</span>
                        </div>
                        <button class="note-btn">📖 Read Notes</button>
                    </div>
                    
                    <div class="note-card programming">
                        <div class="note-icon">🐍</div>
                        <h4>Python Fundamentals</h4>
                        <p>Syntax, functions, object-oriented programming</p>
                        <div class="note-meta">
                            <span>📅 Last updated: 3 days ago</span>
                            <span>📖 6 min read</span>
                        </div>
                        <button class="note-btn">📖 Read Notes</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getResearchContent() {
        return `
            <div class="mobile-research-container">
                <div class="research-stats">
                    <div class="research-stat">
                        <span class="stat-number">150+</span>
                        <span class="stat-label">Papers</span>
                    </div>
                    <div class="research-stat">
                        <span class="stat-number">25</span>
                        <span class="stat-label">Topics</span>
                    </div>
                    <div class="research-stat">
                        <span class="stat-number">New</span>
                        <span class="stat-label">This Week</span>
                    </div>
                </div>
                
                <div class="research-topics">
                    <div class="topic-card">
                        <div class="topic-icon">🤖</div>
                        <h4>Artificial Intelligence</h4>
                        <p>Machine learning, neural networks, AI applications</p>
                        <span class="paper-count">42 papers</span>
                        <button class="topic-btn">🔍 Explore</button>
                    </div>
                    
                    <div class="topic-card">
                        <div class="topic-icon">🔒</div>
                        <h4>Cybersecurity</h4>
                        <p>Network security, cryptography, ethical hacking</p>
                        <span class="paper-count">28 papers</span>
                        <button class="topic-btn">🔍 Explore</button>
                    </div>
                    
                    <div class="topic-card">
                        <div class="topic-icon">📊</div>
                        <h4>Data Science</h4>
                        <p>Big data, analytics, visualization techniques</p>
                        <span class="paper-count">35 papers</span>
                        <button class="topic-btn">🔍 Explore</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    getProjectsContent() {
        return `
            <div class="mobile-projects-container">
                <div class="project-categories">
                    <button class="project-category active">All Projects</button>
                    <button class="project-category">Web Dev</button>
                    <button class="project-category">Mobile</button>
                    <button class="project-category">AI/ML</button>
                </div>
                
                <div class="projects-grid">
                    <div class="project-card featured">
                        <div class="project-header">
                            <h4>Library Management System</h4>
                            <span class="project-badge featured">Featured</span>
                        </div>
                        <p>Complete web-based system for library operations</p>
                        <div class="project-tech">
                            <span class="tech-tag">PHP</span>
                            <span class="tech-tag">MySQL</span>
                            <span class="tech-tag">Bootstrap</span>
                        </div>
                        <div class="project-actions">
                            <button class="project-btn primary">🚀 Start Project</button>
                            <button class="project-btn secondary">👁️ Preview</button>
                        </div>
                    </div>
                    
                    <div class="project-card">
                        <div class="project-header">
                            <h4>E-commerce Website</h4>
                            <span class="project-badge popular">Popular</span>
                        </div>
                        <p>Online shopping platform with payment integration</p>
                        <div class="project-tech">
                            <span class="tech-tag">React</span>
                            <span class="tech-tag">Node.js</span>
                            <span class="tech-tag">MongoDB</span>
                        </div>
                        <div class="project-actions">
                            <button class="project-btn primary">🚀 Start Project</button>
                            <button class="project-btn secondary">👁️ Preview</button>
                        </div>
                    </div>
                    
                    <div class="project-card">
                        <div class="project-header">
                            <h4>Student Management App</h4>
                            <span class="project-badge new">New</span>
                        </div>
                        <p>Mobile app for student information management</p>
                        <div class="project-tech">
                            <span class="tech-tag">Flutter</span>
                            <span class="tech-tag">Firebase</span>
                            <span class="tech-tag">Dart</span>
                        </div>
                        <div class="project-actions">
                            <button class="project-btn primary">🚀 Start Project</button>
                            <button class="project-btn secondary">👁️ Preview</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getCommunityContent() {
        return `
            <div class="mobile-community-container">
                <div class="community-stats">
                    <div class="community-stat">
                        <span class="stat-number">1.2k</span>
                        <span class="stat-label">Students</span>
                    </div>
                    <div class="community-stat">
                        <span class="stat-number">48</span>
                        <span class="stat-label">Study Groups</span>
                    </div>
                    <div class="community-stat">
                        <span class="stat-number">320</span>
                        <span class="stat-label">Discussions</span>
                    </div>
                </div>
                
                <div class="community-sections">
                    <div class="community-card discussions">
                        <div class="community-icon">💬</div>
                        <h4>Discussions</h4>
                        <p>Join conversations about coursework and career</p>
                        <div class="community-meta">
                            <span>🔥 52 active topics</span>
                        </div>
                        <button class="community-btn">💬 Join Discussion</button>
                    </div>
                    
                    <div class="community-card study-groups">
                        <div class="community-icon">👥</div>
                        <h4>Study Groups</h4>
                        <p>Form or join study groups for collaborative learning</p>
                        <div class="community-meta">
                            <span>📚 12 groups forming</span>
                        </div>
                        <button class="community-btn">👥 Find Groups</button>
                    </div>
                    
                    <div class="community-card mentorship">
                        <div class="community-icon">🎓</div>
                        <h4>Mentorship</h4>
                        <p>Connect with seniors and industry professionals</p>
                        <div class="community-meta">
                            <span>⭐ 25 mentors available</span>
                        </div>
                        <button class="community-btn">🎓 Find Mentor</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    closeSection() {
        // Hide all sections
        const sections = document.querySelectorAll('.mobile-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });
        
        // Show menu again
        const menuGrid = document.getElementById('mobileMenuGrid');
        const userMenuText = document.getElementById('userMenuText');
        
        if (menuGrid) {
            menuGrid.style.display = 'grid';
            userMenuText.textContent = '📋 Choose section';
        }
        
        this.currentSection = null;
    }
    
    loadSectionContent(sectionName) {
        if (sectionName === 'books') {
            this.loadMobileBooks();
        }
        // Add other section loaders as needed
    }
    
    loadMobileBooks() {
        const booksGrid = document.getElementById('mobileBooksGrid');
        if (!booksGrid) return;
        
        // Sample books data from your actual data
        const books = [
            { title: 'BEVAE-181', subtitle: 'Environmental Studies', url: 'https://egyankosh.ac.in/handle/123456789/61136' },
            { title: 'BEGLA-136', subtitle: 'English at Workplace', url: 'https://egyankosh.ac.in/handle/123456789/56579' },
            { title: 'BCS-111', subtitle: 'Computer Basics and PC Software', url: 'https://egyankosh.ac.in/handle/123456789/434' },
            { title: 'BCSL-013', subtitle: 'Computer Basics and PC Software Lab', url: 'https://egyankosh.ac.in/handle/123456789/442' },
            { title: 'BCS-012', subtitle: 'Basic Mathematics', url: 'https://egyankosh.ac.in/handle/123456789/442' },
            { title: 'FEG-02', subtitle: 'Foundation in English-2', url: 'https://egyankosh.ac.in/handle/123456789/422' },
            { title: 'MCS-202', subtitle: 'Computer Organisation', url: 'https://egyankosh.ac.in/handle/123456789/73833' },
            { title: 'MCS-203', subtitle: 'Operating Systems', url: 'https://egyankosh.ac.in/handle/123456789/72496' },
            { title: 'MCSL-204', subtitle: 'Windows & Linux Lab', url: 'https://egyankosh.ac.in/handle/123456789/72667' },
            { title: 'MCSL-205', subtitle: 'C & Python Lab', url: 'https://egyankosh.ac.in/handle/123456789/72733' },
            { title: 'MCS-201', subtitle: 'Programming in C & Python', url: 'https://egyankosh.ac.in/handle/123456789/72701' }
        ];
        
        booksGrid.innerHTML = books.map(book => `
            <div class="mobile-book-card">
                <div class="book-title-mobile">${book.title}</div>
                <div class="book-subtitle-mobile">${book.subtitle}</div>
                <button class="mobile-download-btn" onclick="window.open('${book.url}', '_blank')">
                    📥 Download PDF
                </button>
            </div>
        `).join('');
    }
    
    updateUserInfo() {
        const welcomeText = document.getElementById('mobileWelcomeText');
        const userEmail = document.getElementById('mobileUserEmail');
        const userAvatar = document.getElementById('mobileUserAvatar');
        
        if (this.currentUser) {
            if (welcomeText) welcomeText.textContent = `Welcome, ${this.currentUser.displayName || 'Student'}!`;
            if (userEmail) userEmail.textContent = this.currentUser.email;
            if (userAvatar) userAvatar.textContent = this.currentUser.displayName?.charAt(0).toUpperCase() || '👤';
        }
    }
    
    checkAuthState() {
        // Check if user is logged in (integrate with your auth system)
        if (window.auth && window.auth.currentUser) {
            this.isLoggedIn = true;
            this.currentUser = window.auth.currentUser;
        }
        
        // Listen for auth state changes
        if (window.auth) {
            window.auth.onAuthStateChanged((user) => {
                console.log('🔄 Mobile interface detected auth state change:', user ? 'logged in' : 'logged out');
                
                if (user) {
                    const wasLoggedOut = !this.isLoggedIn;
                    const isNewUser = this.lastWelcomeUser !== user.uid;
                    
                    this.isLoggedIn = true;
                    this.currentUser = user;
                    
                    // If we're on mobile and user just logged in, show dashboard
                    if (window.innerWidth <= 768) {
                        this.showMobileDashboard();
                        
                        // Only show welcome for new logins (not page refreshes)
                        if (wasLoggedOut && isNewUser && !this.hasShownWelcome) {
                            setTimeout(() => {
                                this.showWelcomePopup(user);
                                this.hasShownWelcome = true;
                                this.lastWelcomeUser = user.uid;
                            }, 500); // Small delay to let dashboard load
                        }
                    }
                } else {
                    this.isLoggedIn = false;
                    this.currentUser = null;
                    
                    // Reset welcome tracking on logout
                    this.hasShownWelcome = false;
                    this.lastWelcomeUser = null;
                    
                    // If we're on mobile and user logged out, show landing
                    if (window.innerWidth <= 768) {
                        this.showMobileLanding();
                    }
                }
            });
        }
    }
    
    logout() {
        console.log('🚪 Mobile logout...');
        
        // Call existing logout function
        if (typeof logout === 'function') {
            logout();
        }
        
        // Reset mobile interface
        this.isLoggedIn = false;
        this.currentUser = null;
        this.currentSection = null;
        
        // Show landing screen
        this.showMobileLanding();
    }
    
    showWelcomePopup(user) {
        // Only show welcome popup on mobile and if not already shown
        if (window.innerWidth > 768 || this.hasShownWelcome) {
            return;
        }
        
        console.log('🎉 Showing welcome popup for:', user.email);
        
        // Create welcome popup
        const welcomePopup = document.createElement('div');
        welcomePopup.className = 'mobile-welcome-popup';
        welcomePopup.innerHTML = `
            <div class="welcome-content">
                <div class="welcome-header">
                    <h2>🎉 Welcome!</h2>
                    <p>Hello ${user.displayName || user.email}!</p>
                </div>
                <div class="welcome-message">
                    <p>You're now logged into the Study Portal!</p>
                    <p>Tap below to start exploring.</p>
                </div>
                <button class="welcome-continue-btn" onclick="this.parentElement.parentElement.remove()">
                    Continue to Portal →
                </button>
            </div>
        `;
        
        document.body.appendChild(welcomePopup);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (welcomePopup.parentElement) {
                welcomePopup.remove();
            }
        }, 5000);
    }
}

// Initialize mobile interface when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('📱 Initializing mobile interface on DOM ready...');
    window.mobileInterface = new MobileInterface();
});

// Also initialize if DOM is already ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!window.mobileInterface) {
            console.log('📱 Initializing mobile interface (DOM was loading)...');
            window.mobileInterface = new MobileInterface();
        }
    });
} else {
    console.log('📱 Initializing mobile interface (DOM already ready)...');
    window.mobileInterface = new MobileInterface();
}

console.log('✅ Study Portal Bundle Loaded Successfully!');
console.log('🔧 Debug functions available: debugAuth(), testLogin(), testPasswordReset(), testRegistration(), testMobileMenu(), testAuthTabs(), detectErrors(), showPasswordResetHelp()');

// Add mobile interface debug functions
window.debugMobileInterface = function() {
    console.log('==========================================');
    console.log('📱 MOBILE INTERFACE DEBUG');
    console.log('==========================================');
    
    console.log('🔍 Interface Status:');
    console.log('• Mobile Interface Object:', window.mobileInterface ? '✅ Available' : '❌ Missing');
    console.log('• Screen Width:', window.innerWidth);
    console.log('• Is Mobile Size:', window.innerWidth <= 768);
    console.log('• URL Mobile Param:', new URLSearchParams(window.location.search).get('mobile'));
    
    if (window.mobileInterface) {
        console.log('• Is Logged In:', window.mobileInterface.isLoggedIn);
        console.log('• Current User:', window.mobileInterface.currentUser?.email || 'None');
        console.log('• Current Section:', window.mobileInterface.currentSection || 'None');
    }
    
    console.log('');
    console.log('🔍 Mobile Elements:');
    const mobileLanding = document.querySelector('.mobile-landing');
    const mobileApp = document.querySelector('.mobile-app');
    
    console.log('• Mobile Landing:', mobileLanding ? '✅ Found' : '❌ Missing');
    console.log('• Mobile App:', mobileApp ? '✅ Found' : '❌ Missing');
    
    if (mobileLanding) {
        console.log('  - Display:', window.getComputedStyle(mobileLanding).display);
        console.log('  - Visibility:', window.getComputedStyle(mobileLanding).visibility);
    }
    
    if (mobileApp) {
        console.log('  - Display:', window.getComputedStyle(mobileApp).display);
        console.log('  - Visibility:', window.getComputedStyle(mobileApp).visibility);
    }
    
    console.log('');
    console.log('🔧 Test Functions:');
    console.log('• forceMobileView() - Force mobile interface');
    console.log('• testMobileLogin() - Test mobile login flow');
    console.log('• resetMobileInterface() - Reset interface');
    console.log('==========================================');
};

window.forceMobileView = function() {
    console.log('🔧 Forcing mobile view...');
    if (window.mobileInterface) {
        window.mobileInterface.setupMobileInterface();
        console.log('✅ Mobile interface forced');
    } else {
        console.error('❌ Mobile interface not available');
    }
};

window.testMobileLogin = function() {
    console.log('🧪 Testing mobile login flow...');
    if (window.mobileInterface) {
        window.mobileInterface.openMobileLogin();
        console.log('✅ Mobile login modal should be open');
    } else {
        console.error('❌ Mobile interface not available');
    }
};

window.resetMobileInterface = function() {
    console.log('🔄 Resetting mobile interface...');
    if (window.mobileInterface) {
        window.mobileInterface.isLoggedIn = false;
        window.mobileInterface.currentUser = null;
        window.mobileInterface.currentSection = null;
        window.mobileInterface.showMobileLanding();
        console.log('✅ Mobile interface reset to landing');
    } else {
        console.error('❌ Mobile interface not available');
    }
};

if (isDebugMode) {
    console.log('🐛 Auto-running debug check...');
    setTimeout(() => {
        window.debugAuth();
        window.detectErrors();
        window.debugMobileInterface();
    }, 2000);
}
