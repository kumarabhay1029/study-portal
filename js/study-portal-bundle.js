/**
 * 🚀 STUDY PORTAL - OPTIMIZED BUNDLE
 * Single bundled script combining:
 * - Google Forms Integration
 * - Navigation System
 * - Main Application Logic
 * 
 * Optimized for GitHub Pages deployment
 * Version: 2.0.0 - Google Forms Integration
 */

console.log('🚀 Study Portal Bundle Loading...');

/* ==========================================================================
   GLOBAL VARIABLES
   ========================================================================== */

// Global variable to track current active section in the Study Portal
let currentSection = 'home';

/* ==========================================================================
   GOOGLE FORMS INTEGRATION SYSTEM
   ========================================================================== */

class GoogleFormsManager {
    constructor() {
        // Google Form URLs - UPDATE THESE WITH YOUR ACTUAL FORM URLs
        this.formUrls = {
            notes: {
                free: 'https://docs.google.com/forms/d/e/YOUR_FREE_NOTES_FORM_ID/viewform?embedded=true',
                premium: 'https://docs.google.com/forms/d/e/YOUR_PREMIUM_NOTES_FORM_ID/viewform?embedded=true'
            },
            assignments: 'https://docs.google.com/forms/d/e/YOUR_ASSIGNMENTS_FORM_ID/viewform?embedded=true',
            projects: 'https://docs.google.com/forms/d/e/YOUR_PROJECTS_FORM_ID/viewform?embedded=true',
            research: 'https://docs.google.com/forms/d/e/YOUR_RESEARCH_FORM_ID/viewform?embedded=true'
        };
        
        this.init();
    }
    
    init() {
        console.log('📋 Google Forms Manager initialized');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add click handlers for form close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-form')) {
                const formContainer = e.target.closest('.form-container');
                if (formContainer) {
                    this.closeForm(formContainer.id);
                }
            }
        });
    }
    
    // Notes Form Functions
    openNotesForm() {
        this.openForm('notes-form-container', 'notes-form-iframe', this.formUrls.notes.free);
        this.showMessage('📝 Free notes submission form opened!', 'info');
    }
    
    openPremiumNotesForm() {
        this.openForm('notes-form-container', 'notes-form-iframe', this.formUrls.notes.premium);
        this.showMessage('⭐ Premium notes submission form opened!', 'info');
    }
    
    // Assignment Form Function
    openAssignmentForm() {
        this.openForm('assignments-form-container', 'assignments-form-iframe', this.formUrls.assignments);
        this.showMessage('📤 Assignment submission form opened!', 'info');
    }
    
    // Project Form Function
    openProjectForm() {
        this.openForm('projects-form-container', 'projects-form-iframe', this.formUrls.projects);
        this.showMessage('🚀 Project submission form opened!', 'info');
    }
    
    // Research Form Function
    openResearchForm() {
        this.openForm('research-form-container', 'research-form-iframe', this.formUrls.research);
        this.showMessage('📝 Research paper submission form opened!', 'info');
    }
    
    // Generic form opening function
    openForm(containerId, iframeId, formUrl) {
        const container = document.getElementById(containerId);
        const iframe = document.getElementById(iframeId);
        
        if (container && iframe) {
            // Set the form URL
            iframe.src = formUrl;
            
            // Show the form container
            container.style.display = 'block';
            
            // Smooth scroll to form
            container.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Add loading state
            iframe.onload = () => {
                this.showMessage('✅ Form loaded successfully!', 'success');
            };
        } else {
            this.showMessage('❌ Form could not be loaded. Please try again.', 'error');
        }
    }
    
    // Close form function
    closeForm(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.src = ''; // Clear iframe to stop loading
            }
            this.showMessage('📋 Form closed.', 'info');
        }
    }
    
    // Tab switching functions
    showNotesTab(tabName) {
        this.showContentTab('notes', tabName);
    }
    
    showContentTab(section, tabName) {
        // Hide all tabs for this section
        const allTabs = document.querySelectorAll(`#${section}-section .tab-content`);
        const allBtns = document.querySelectorAll(`#${section}-section .tab-btn`);
        
        allTabs.forEach(tab => tab.classList.remove('active'));
        allBtns.forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab
        const selectedTab = document.getElementById(`${section}-${tabName}-tab`);
        const selectedBtn = document.querySelector(`#${section}-section .tab-btn[onclick*="${tabName}"]`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedBtn) selectedBtn.classList.add('active');
    }
    
    // Content filtering (for browse tabs)
    filterContent(section, filterType, value) {
        const grid = document.getElementById(`${section}Grid`);
        const cards = grid.querySelectorAll('.content-card');
        
        cards.forEach(card => {
            const shouldShow = this.matchesFilter(card, filterType, value);
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }
    
    matchesFilter(card, filterType, value) {
        if (!value) return true; // Show all if no filter
        
        const tag = card.querySelector('.content-tag')?.textContent.toLowerCase();
        const title = card.querySelector('h4')?.textContent.toLowerCase();
        const description = card.querySelector('.content-description')?.textContent.toLowerCase();
        
        switch (filterType) {
            case 'subject':
                return tag?.includes(value.toLowerCase());
            case 'keyword':
                return title?.includes(value.toLowerCase()) || description?.includes(value.toLowerCase());
            default:
                return true;
        }
    }
}

/* ==========================================================================
   GLOBAL UTILITY FUNCTIONS
   ========================================================================== */

// Global message display function
function showMessage(message, type = 'info', duration = 3500) {
    // Create message element
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type}`;
    messageDiv.innerHTML = `
        <span class="message-text">${message}</span>
        <button class="message-close" onclick="this.parentElement.remove()">×</button>
    `;
    
    // Add to page
    document.body.appendChild(messageDiv);
    
    // Auto remove after specified duration
    setTimeout(() => {
        if (messageDiv.parentElement) {
            messageDiv.remove();
        }
    }, duration);
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

/**
 * Show a specific section and hide all others (SPA-like navigation)
 * @param {string} sectionName - Name of the section to show
 */
function showSection(sectionName) {
    console.log(`🔄 Switching to section: ${sectionName}`);
    
    // Hide all sections
    document.querySelectorAll('.section-container').forEach(section => {
        section.classList.remove('active');
    });

    // Show the selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
        currentSection = sectionName;
        
        // Force scroll to top immediately, then smooth scroll
        window.scrollTo(0, 0);
        
        // Small delay to ensure section is visible, then smooth scroll
        setTimeout(() => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }, 50);
        
        console.log(`✅ Successfully switched to ${sectionName} section`);
        
        // Special handling for notes section
        if (sectionName === 'notes') {
            console.log('📋 Notes section activated - checking content...');
            
            // Ensure notes section is properly positioned
            targetSection.style.marginTop = '0';
            targetSection.style.paddingTop = '20px';
            
            // Check if notes manager is loaded
            if (window.notesManager) {
                console.log('✅ Notes manager is available');
            } else {
                console.log('⚠️ Notes manager not yet loaded');
            }
        }
    } else {
        console.error(`❌ Section not found: ${sectionName}-section`);
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
    document.querySelectorAll('.nav-btn, .nav-link').forEach(item => {
        item.classList.remove('active');
    });

    // Add active class to current items
    document.querySelectorAll(`[data-section="${sectionName}"]`).forEach(item => {
        item.classList.add('active');
    });
}

/**
 * Toggle mobile menu visibility - works on both mobile and desktop as quick access
 */
function toggleMobileMenu() {
    console.log('🍔 Hamburger menu toggle clicked');
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-backdrop');
    const hamburgerBtn = document.querySelector('.mobile-menu-toggle');
    const isDesktop = window.innerWidth > 768;
    
    console.log('📱 Elements found:', {
        sidebar: !!sidebar,
        overlay: !!overlay,
        hamburgerBtn: !!hamburgerBtn,
        isDesktop: isDesktop
    });
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        
        // Animate hamburger button
        if (hamburgerBtn) {
            hamburgerBtn.classList.toggle('active');
            hamburgerBtn.setAttribute('aria-expanded', sidebar.classList.contains('active'));
        }
        
        // Handle body scroll prevention
        if (sidebar.classList.contains('active')) {
            document.body.style.overflow = 'hidden';
            if (isDesktop) {
                document.body.classList.add('sidebar-open');
                console.log('✅ Desktop quick access opened');
            } else {
                console.log('✅ Mobile menu opened');
            }
        } else {
            document.body.style.overflow = '';
            document.body.classList.remove('sidebar-open');
            if (isDesktop) {
                console.log('✅ Desktop quick access closed');
            } else {
                console.log('✅ Mobile menu closed');
            }
        }
    } else {
        console.error('❌ Menu elements not found');
    }
}

/**
 * Close mobile menu - works on both mobile and desktop
 */
function closeMobileMenu() {
    console.log('🍔 Closing menu');
    
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-backdrop');
    const hamburgerBtn = document.querySelector('.mobile-menu-toggle');
    const isDesktop = window.innerWidth > 768;
    
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        
        // Reset hamburger button animation
        if (hamburgerBtn) {
            hamburgerBtn.classList.remove('active');
            hamburgerBtn.setAttribute('aria-expanded', 'false');
        }
        
        document.body.style.overflow = '';
        document.body.classList.remove('sidebar-open');
        
        if (isDesktop) {
            console.log('✅ Desktop quick access closed');
        } else {
            console.log('✅ Mobile menu closed');
        }
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

// Google Forms functions
window.openNotesForm = openNotesForm;
window.openPremiumNotesForm = openPremiumNotesForm;
window.openAssignmentForm = openAssignmentForm;
window.openProjectForm = openProjectForm;
window.openResearchForm = openResearchForm;
window.closeForm = closeForm;
window.showNotesTab = showNotesTab;
window.showContentTab = showContentTab;

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

/* ==========================================================================
   GOOGLE FORMS GLOBAL FUNCTIONS
   ========================================================================== */

// Initialize Google Forms Manager
let googleFormsManager;

// Global functions for HTML onclick events
function openNotesForm() {
    googleFormsManager?.openNotesForm();
}

function openPremiumNotesForm() {
    googleFormsManager?.openPremiumNotesForm();
}

function openAssignmentForm() {
    googleFormsManager?.openAssignmentForm();
}

function openProjectForm() {
    googleFormsManager?.openProjectForm();
}

function openResearchForm() {
    googleFormsManager?.openResearchForm();
}

function closeForm(containerId) {
    googleFormsManager?.closeForm(containerId);
}

function showNotesTab(tabName) {
    googleFormsManager?.showNotesTab(tabName);
}

function showContentTab(section, tabName) {
    googleFormsManager?.showContentTab(section, tabName);
}

/* ==========================================================================
   SUBMISSION FORM INTEGRATION
   ========================================================================== */

// Open submission form in new window/tab
function openSubmissionForm(materialType) {
    try {
        // Construct URL with pre-filled material type
        const submissionUrl = 'submission-form.html' + (materialType ? `?type=${materialType}` : '');
        
        // Open in new window with proper dimensions
        const width = 700;
        const height = 800;
        const left = (screen.width / 2) - (width / 2);
        const top = (screen.height / 2) - (height / 2);
        
        const submissionWindow = window.open(
            submissionUrl,
            'submissionForm',
            `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes,status=yes`
        );
        
        // Focus the new window
        if (submissionWindow) {
            submissionWindow.focus();
            
            // Show confirmation message
            showMessage(`📤 Opening ${materialType || 'material'} submission form...`, 'info', 2000);
        } else {
            // Fallback if popup blocked
            window.location.href = submissionUrl;
        }
        
    } catch (error) {
        console.error('Error opening submission form:', error);
        
        // Fallback: try to open in same tab
        try {
            window.location.href = 'submission-form.html' + (materialType ? `?type=${materialType}` : '');
        } catch (fallbackError) {
            console.error('Fallback failed:', fallbackError);
            showMessage('❌ Could not open submission form. Please refresh and try again.', 'error');
        }
    }
}

// Alternative function for embedded iframe (if needed later)
function embedSubmissionForm(materialType, containerId) {
    try {
        const container = document.getElementById(containerId);
        if (!container) {
            console.error('Container not found:', containerId);
            return;
        }
        
        const iframeUrl = 'submission-form.html' + (materialType ? `?type=${materialType}` : '');
        
        container.innerHTML = `
            <div class="embedded-form-container">
                <div class="form-header">
                    <h3>📤 Submit ${materialType || 'Material'}</h3>
                    <button onclick="closeEmbeddedForm('${containerId}')" class="close-btn">❌</button>
                </div>
                <iframe src="${iframeUrl}" 
                        width="100%" 
                        height="600" 
                        frameborder="0" 
                        style="border-radius: 8px;">
                </iframe>
            </div>
        `;
        
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        console.error('Error embedding submission form:', error);
        showMessage('❌ Could not load submission form.', 'error');
    }
}

// Close embedded form
function closeEmbeddedForm(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.style.display = 'none';
        container.innerHTML = '';
    }
}

// Initialize Google Forms Manager when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    googleFormsManager = new GoogleFormsManager();
});

console.log('✅ Study Portal Bundle Loaded Successfully!');
console.log('🔧 Debug functions available: debugAuth(), testLogin(), testPasswordReset(), testRegistration(), testMobileMenu(), testAuthTabs(), detectErrors(), showPasswordResetHelp()');
if (isDebugMode) {
    console.log('🐛 Auto-running debug check...');
    setTimeout(() => {
        window.debugAuth();
        window.detectErrors();
    }, 2000);
}
