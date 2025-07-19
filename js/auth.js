/**
 * Firebase Authentication System for Study Portal
 * Handles user login, registration, logout, and session management
 */

// Global variables for authentication state
let currentUser = null;
let auth = null;

/* ==========================================================================
   FIREBASE AUTH INITIALIZATION
   ========================================================================== */

// Initialize Firebase Auth when DOM loads
document.addEventListener('DOMContentLoaded', function() {
    try {
        auth = firebase.auth();
        console.log('Firebase Auth initialized successfully');
        
        // Listen for authentication state changes
        auth.onAuthStateChanged(function(user) {
            console.log('Auth state changed:', user);
            if (user) {
                // User is signed in
                currentUser = user;
                updateUIForLoggedInUser(user);
            } else {
                // User is signed out
                currentUser = null;
                updateUIForLoggedOutUser();
            }
        });
        
    } catch (error) {
        console.error('Firebase Auth initialization error:', error);
        alert('Firebase initialization failed: ' + error.message);
    }
});

/* ==========================================================================
   AUTHENTICATION MODAL MANAGEMENT
   ========================================================================== */

/**
 * Handle login button click
 */
function handleLogin() {
    if (currentUser) {
        // User is already logged in, show profile
        openProfileModal();
    } else {
        // User is not logged in, show login modal
        openLoginModal();
    }
}

function openLoginModal() {
    document.getElementById('loginModal').classList.add('active');
    showAuthTab('login');
}

function closeLoginModal() {
    document.getElementById('loginModal').classList.remove('active');
    clearAuthForms();
}

function openProfileModal() {
    if (currentUser) {
        document.getElementById('profileName').textContent = currentUser.displayName || 'User';
        document.getElementById('profileEmail').textContent = currentUser.email;
        document.getElementById('profileStatus').textContent = currentUser.emailVerified ? 'Email verified ✅' : 'Email not verified ⚠️';
        
        // Show session information
        const sessionInfo = sessionStorage.getItem('currentSession');
        if (sessionInfo) {
            const session = JSON.parse(sessionInfo);
            const loginTime = new Date(session.loginTime);
            const sessionDuration = Math.floor((new Date() - loginTime) / (1000 * 60)); // minutes
            document.getElementById('profileSession').textContent = `Logged in ${sessionDuration} minutes ago`;
        } else {
            document.getElementById('profileSession').textContent = 'Session info unavailable';
        }
        
        document.getElementById('profileModal').classList.add('active');
    }
}

function closeProfileModal() {
    document.getElementById('profileModal').classList.remove('active');
}

/* ==========================================================================
   TAB SWITCHING
   ========================================================================== */

function showAuthTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tabName === 'login') {
        document.getElementById('loginTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
    } else if (tabName === 'register') {
        document.getElementById('registerTab').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
    } else if (tabName === 'forgot') {
        document.getElementById('forgotTab').classList.add('active');
    }
    
    clearMessages();
}

/* ==========================================================================
   AUTHENTICATION FUNCTIONS
   ========================================================================== */

/**
 * Handle user login
 */
async function loginUser(event) {
    event.preventDefault();
    console.log('Login attempt started');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    
    console.log('Email:', email);
    console.log('Password length:', password.length);
    
    if (!auth) {
        alert('Firebase auth not initialized. Please refresh the page.');
        return;
    }
    
    try {
        showLoading(loginBtn, 'Logging in...');
        console.log('Attempting login with Firebase...');
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Login successful:', userCredential.user);
        showMessage('loginMessage', 'Login successful! Welcome back!', 'success');
        
        setTimeout(() => {
            closeLoginModal();
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        hideLoading(loginBtn, '🚀 Login');
        showMessage('loginMessage', getErrorMessage(error.code), 'error');
    }
}

/**
 * Handle user registration
 */
async function registerUser(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const registerBtn = document.getElementById('registerBtn');
    
    // Validate passwords match
    if (password !== confirmPassword) {
        showMessage('registerMessage', 'Passwords do not match!', 'error');
        return;
    }
    
    try {
        showLoading(registerBtn, 'Creating account...');
        
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        // Send email verification
        await userCredential.user.sendEmailVerification();
        
        showMessage('registerMessage', 'Account created successfully! Please check your email to verify your account.', 'success');
        
        setTimeout(() => {
            closeLoginModal();
        }, 2000);
        
    } catch (error) {
        hideLoading(registerBtn, '📝 Create Account');
        showMessage('registerMessage', getErrorMessage(error.code), 'error');
    }
}

/**
 * Handle password reset
 */
async function resetPassword(event) {
    event.preventDefault();
    
    const email = document.getElementById('forgotEmail').value;
    const forgotBtn = document.getElementById('forgotBtn');
    
    try {
        showLoading(forgotBtn, 'Sending reset link...');
        await auth.sendPasswordResetEmail(email);
        showMessage('forgotMessage', 'Password reset email sent! Check your inbox.', 'success');
        
        setTimeout(() => {
            showAuthTab('login');
        }, 2000);
        
    } catch (error) {
        hideLoading(forgotBtn, '📧 Send Reset Link');
        showMessage('forgotMessage', getErrorMessage(error.code), 'error');
    }
}

/**
 * Handle user logout with confirmation
 */
async function logout() {
    // Show confirmation dialog
    const confirmLogout = confirm('Are you sure you want to logout?');
    if (!confirmLogout) {
        return; // User cancelled logout
    }
    
    try {
        // Show loading state
        const logoutBtn = document.querySelector('.user-dropdown-item[onclick="logout()"]');
        if (logoutBtn) {
            logoutBtn.innerHTML = '⏳ Logging out...';
            logoutBtn.style.pointerEvents = 'none';
        }
        
        await auth.signOut();
        closeProfileModal();
        showNotificationMessage('Logged out successfully! See you next time.', 'success');
        
        // Clear any stored session data
        clearSessionData();
        
    } catch (error) {
        console.error('Logout error:', error);
        showNotificationMessage('Error during logout. Please try again.', 'error');
        
        // Restore logout button if error occurs
        const logoutBtn = document.querySelector('.user-dropdown-item[onclick="logout()"]');
        if (logoutBtn) {
            logoutBtn.innerHTML = '🚪 Logout';
            logoutBtn.style.pointerEvents = 'auto';
        }
    }
}

/* ==========================================================================
   UI UPDATE FUNCTIONS
   ========================================================================== */

/**
 * Update UI when user is logged in
 */
function updateUIForLoggedInUser(user) {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `
            <div class="user-menu">
                <span class="user-icon">👤</span>
                ${user.displayName || 'User'}
                <div class="user-dropdown" id="userDropdown">
                    <div class="user-info">
                        <h4>${user.displayName || 'User'}</h4>
                        <p>${user.email}</p>
                        <small>Active session</small>
                    </div>
                    <a href="#" class="user-dropdown-item" onclick="openProfileModal()">👤 Profile</a>
                    <a href="#" class="user-dropdown-item" onclick="logout()">🚪 Logout</a>
                </div>
            </div>
        `;
        
        // Add click event to toggle dropdown
        loginBtn.onclick = function(e) {
            e.stopPropagation();
            const dropdown = document.getElementById('userDropdown');
            dropdown.classList.toggle('active');
        };
        
        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            const dropdown = document.getElementById('userDropdown');
            if (dropdown) {
                dropdown.classList.remove('active');
            }
        });
    }
    
    // Store session info and initialize session tracking
    storeSessionInfo(user);
    const resetTimeout = initializeSessionTracking();
    resetTimeout(); // Start the session timer
    
    // Show welcome message
    showNotificationMessage(`Welcome back, ${user.displayName || 'User'}!`, 'success');
}

/**
 * Update UI when user is logged out
 */
function updateUIForLoggedOutUser() {
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.innerHTML = `
            <span class="user-icon"></span>
            Login
        `;
        loginBtn.onclick = handleLogin;
    }
}

/* ==========================================================================
   SESSION MANAGEMENT AND SECURITY
   ========================================================================== */

/**
 * Clear session data on logout
 */
function clearSessionData() {
    // Clear any localStorage items related to user session
    localStorage.removeItem('lastLoginTime');
    localStorage.removeItem('userPreferences');
    
    // Clear any sessionStorage items
    sessionStorage.clear();
    
    // Reset any global variables
    currentSection = 'home';
    
    // Redirect to home section
    showSection('home');
}

/**
 * Track user session and implement auto-logout for security
 */
function initializeSessionTracking() {
    let sessionTimeout;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
    const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout
    
    function resetSessionTimeout() {
        if (sessionTimeout) clearTimeout(sessionTimeout);
        
        if (currentUser) {
            // Set warning timeout
            sessionTimeout = setTimeout(() => {
                if (currentUser) {
                    const extendSession = confirm(
                        'Your session will expire in 5 minutes due to inactivity. ' +
                        'Would you like to extend your session?'
                    );
                    
                    if (extendSession) {
                        resetSessionTimeout(); // Reset the timer
                        showNotificationMessage('Session extended successfully!', 'success');
                    } else {
                        // Auto-logout after 5 more minutes
                        setTimeout(() => {
                            if (currentUser) {
                                showNotificationMessage('Session expired due to inactivity. Please login again.', 'warning');
                                logout();
                            }
                        }, WARNING_TIME);
                    }
                }
            }, SESSION_TIMEOUT - WARNING_TIME);
        }
    }
    
    // Track user activity
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    activityEvents.forEach(event => {
        document.addEventListener(event, resetSessionTimeout, { passive: true });
    });
    
    // Initialize session tracking when user logs in
    return resetSessionTimeout;
}

/**
 * Store user session info
 */
function storeSessionInfo(user) {
    const sessionInfo = {
        loginTime: new Date().toISOString(),
        email: user.email,
        displayName: user.displayName
    };
    
    localStorage.setItem('lastLoginTime', sessionInfo.loginTime);
    sessionStorage.setItem('currentSession', JSON.stringify(sessionInfo));
}

/**
 * Enhanced notification message system
 */
function showNotificationMessage(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `session-notification ${type}`;
    notification.innerHTML = `
        <div class="session-notification-content">
            <span class="session-notification-icon">
                ${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}
            </span>
            <span class="session-notification-text">${message}</span>
            <button class="session-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #4caf50, #45a049)' : 
                   type === 'error' ? 'linear-gradient(135deg, #f44336, #d32f2f)' : 
                   type === 'warning' ? 'linear-gradient(135deg, #ff9800, #f57c00)' : 
                   'linear-gradient(135deg, #2196f3, #1976d2)'};
        color: white;
        padding: 0;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.2);
        z-index: 10000;
        min-width: 300px;
        max-width: 400px;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    notification.querySelector('.session-notification-content').style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 20px;
    `;
    
    notification.querySelector('.session-notification-close').style.cssText = `
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: auto;
        font-size: 14px;
        font-weight: bold;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto-remove after delay
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 300);
    }, type === 'error' ? 8000 : 5000);
}

/* ==========================================================================
   UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Show loading state on button
 */
function showLoading(button, text) {
    button.disabled = true;
    button.innerHTML = `<span class="loading"></span> ${text}`;
}

/**
 * Hide loading state on button
 */
function hideLoading(button, originalText) {
    button.disabled = false;
    button.innerHTML = originalText;
}

/**
 * Show message in specified container
 */
function showMessage(containerId, message, type) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `<div class="message ${type}">${message}</div>`;
        
        // Auto-hide success messages
        if (type === 'success') {
            setTimeout(() => {
                container.innerHTML = '';
            }, 5000);
        }
    }
}

/**
 * Clear all messages
 */
function clearMessages() {
    ['loginMessage', 'registerMessage', 'forgotMessage'].forEach(id => {
        const element = document.getElementById(id);
        if (element) element.innerHTML = '';
    });
}

/**
 * Clear all auth forms
 */
function clearAuthForms() {
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.getElementById('forgotForm').reset();
    clearMessages();
}

/**
 * Get user-friendly error message
 */
function getErrorMessage(errorCode) {
    const errorMessages = {
        'auth/user-not-found': 'No account found with this email address.',
        'auth/wrong-password': 'Incorrect password. Please try again.',
        'auth/email-already-in-use': 'An account with this email already exists.',
        'auth/weak-password': 'Password should be at least 6 characters long.',
        'auth/invalid-email': 'Please enter a valid email address.',
        'auth/user-disabled': 'This account has been disabled.',
        'auth/too-many-requests': 'Too many failed attempts. Please try again later.',
        'auth/network-request-failed': 'Network error. Please check your connection.',
        'auth/popup-closed-by-user': 'Authentication popup was closed.',
        'auth/cancelled-popup-request': 'Authentication was cancelled.',
    };
    
    return errorMessages[errorCode] || 'An error occurred. Please try again.';
}
