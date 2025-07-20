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

            const email = document.getElementById('email')?.value;
            const password = document.getElementById('password')?.value;

            if (!email || !password) {
                this.showMessage('❌ Please enter both email and password', 'error');
                return;
            }

            try {
                console.log('🔐 Attempting login...');
                this.showMessage('🔐 Signing you in...', 'info', 2000);
                
                const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                console.log('✅ Login successful:', user.email);
                this.currentUser = user;
                this.updateButtonState(user);
                this.closeLoginModal();
                this.showMessage('🎉 Welcome back! Login successful', 'success');
                
            } catch (error) {
                console.error('❌ Login error:', error);
                this.showMessage(`❌ Login failed: ${error.message}`, 'error');
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
                const tabs = ['login', 'register', 'forgot'];
                tabs.forEach(t => {
                    const tabEl = document.getElementById(t + 'Tab');
                    const contentEl = document.getElementById(t + 'Content');
                    if (tabEl) tabEl.classList.remove('active');
                    if (contentEl) contentEl.classList.remove('active');
                });
                
                const activeTab = document.getElementById(tab + 'Tab');
                const activeContent = document.getElementById(tab + 'Content');
                if (activeTab) activeTab.classList.add('active');
                if (activeContent) activeContent.classList.add('active');
            };
            
            window.registerUser = (event) => {
                if (event) event.preventDefault();
                if (window.finalAuth) {
                    window.finalAuth.showMessage('📝 Registration feature coming soon!', 'info');
                }
            };
            
            window.resetPassword = (event) => {
                if (event) event.preventDefault();
                if (window.finalAuth) {
                    window.finalAuth.showMessage('🔐 Password reset feature coming soon!', 'info');
                }
            };
            
            window.togglePasswordVisibility = (inputId) => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                }
            };
            
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
    document.querySelectorAll('.nav-btn, .sidebar a').forEach(item => {
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
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.toggle('mobile-active');
        overlay.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        if (sidebar.classList.contains('mobile-active')) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }
}

/**
 * Close mobile menu
 */
function closeMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.mobile-overlay');
    
    if (sidebar && overlay) {
        sidebar.classList.remove('mobile-active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
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
    const overlay = document.querySelector('.mobile-overlay');
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

console.log('✅ Study Portal Bundle Loaded Successfully!');
console.log('🔧 Debug functions available: debugAuth(), testLogin()');
if (isDebugMode) {
    console.log('🐛 Auto-running debug check...');
    setTimeout(() => window.debugAuth(), 2000);
}
