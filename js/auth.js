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
    console.log('DOM Content Loaded - Initializing Firebase Auth...');
    
    // Wait for Firebase to be fully loaded
    function initializeAuth() {
        try {
            if (typeof firebase === 'undefined') {
                console.error('Firebase not loaded yet, retrying...');
                setTimeout(initializeAuth, 100);
                return;
            }
            
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
            
            // Set up enhanced form event listeners
            setupEnhancedEventListeners();
            
            // Load remembered login data
            loadRememberedData();
            
        } catch (error) {
            console.error('Firebase Auth initialization error:', error);
            alert('Firebase initialization failed: ' + error.message);
        }
    }
    
    // Start initialization
    initializeAuth();
});

/**
 * Set up enhanced event listeners for form validation and features
 */
function setupEnhancedEventListeners() {
    // Password strength indicator for registration
    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    // Real-time email validation
    const emailInputs = ['loginEmail', 'registerEmail', 'forgotEmail'];
    emailInputs.forEach(inputId => {
        const input = document.getElementById(inputId);
        if (input) {
            input.addEventListener('blur', function() {
                const validationId = inputId + 'Validation';
                if (this.value && !validateEmail(this.value)) {
                    showValidation(validationId, 'Please enter a valid email address', 'error');
                } else if (this.value && validateEmail(this.value)) {
                    showValidation(validationId, '✓ Valid email format', 'success');
                } else {
                    showValidation(validationId, '', '');
                }
            });
        }
    });
    
    // Password confirmation validation
    const confirmPassword = document.getElementById('confirmPassword');
    const registerPasswordInput = document.getElementById('registerPassword');
    if (confirmPassword && registerPasswordInput) {
        confirmPassword.addEventListener('input', function() {
            if (this.value && this.value !== registerPasswordInput.value) {
                showValidation('confirmPasswordValidation', 'Passwords do not match', 'error');
            } else if (this.value && this.value === registerPasswordInput.value) {
                showValidation('confirmPasswordValidation', '✓ Passwords match', 'success');
            } else {
                showValidation('confirmPasswordValidation', '', '');
            }
        });
    }
    
    // Auto-focus improvements
    const modal = document.getElementById('loginModal');
    if (modal) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.attributeName === 'class' && modal.classList.contains('active')) {
                    setTimeout(() => {
                        const activeTab = document.querySelector('.tab-content.active');
                        if (activeTab) {
                            const firstInput = activeTab.querySelector('input[type="email"], input[type="text"]');
                            if (firstInput) firstInput.focus();
                        }
                    }, 100);
                }
            });
        });
        observer.observe(modal, { attributes: true });
    }
}

/* ==========================================================================
   AUTHENTICATION MODAL MANAGEMENT
   ========================================================================== */

/**
 * Handle login button click
 */
function handleLogin() {
    console.log('handleLogin called, current user:', currentUser);
    
    if (currentUser) {
        // User is already logged in, show profile
        openProfileModal();
    } else {
        // User is not logged in, show login modal
        openLoginModal();
    }
}

// Edge browser compatibility - ensure function is globally available
window.handleLogin = handleLogin;
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.showAuthTab = showAuthTab;
window.loginUser = loginUser;
window.registerUser = registerUser;
window.resetPassword = resetPassword;
window.logout = logout;
window.togglePasswordVisibility = togglePasswordVisibility;
window.showTerms = showTerms;
window.showPrivacy = showPrivacy;

function openLoginModal() {
    console.log('Opening login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('active');
        showAuthTab('login');
    } else {
        console.error('Login modal not found!');
    }
}

function closeLoginModal() {
    console.log('Closing login modal...');
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('active');
        clearAuthForms();
    }
}

// Make functions globally available for Edge compatibility
window.openLoginModal = openLoginModal;
window.closeLoginModal = closeLoginModal;
window.showAuthTab = showAuthTab;
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;

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
    console.log('Showing auth tab:', tabName);
    
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab
    if (tabName === 'login') {
        const loginTab = document.getElementById('loginTab');
        const loginBtn = document.querySelectorAll('.tab-btn')[0];
        if (loginTab) loginTab.classList.add('active');
        if (loginBtn) loginBtn.classList.add('active');
    } else if (tabName === 'register') {
        const registerTab = document.getElementById('registerTab');
        const registerBtn = document.querySelectorAll('.tab-btn')[1];
        if (registerTab) registerTab.classList.add('active');
        if (registerBtn) registerBtn.classList.add('active');
    } else if (tabName === 'forgot') {
        const forgotTab = document.getElementById('forgotTab');
        if (forgotTab) forgotTab.classList.add('active');
    }
    
    clearMessages();
}

// Make function globally available for Edge compatibility
window.showAuthTab = showAuthTab;

/* ==========================================================================
   AUTHENTICATION FUNCTIONS
   ========================================================================== */

/**
 * Handle user login with enhanced features
 */
async function loginUser(event) {
    event.preventDefault();
    console.log('Login attempt started');
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginBtn = document.getElementById('loginBtn');
    
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Remember me:', rememberMe);
    
    // Clear previous validation messages
    clearValidationMessages(['loginEmail', 'loginPassword']);
    
    // Validate inputs
    if (!validateEmail(email)) {
        showValidation('loginEmailValidation', 'Please enter a valid email address', 'error');
        return;
    }
    
    if (password.length < 6) {
        showValidation('loginPasswordValidation', 'Password must be at least 6 characters', 'error');
        return;
    }
    
    if (!auth) {
        showMessage('loginMessage', 'Firebase auth not initialized. Please refresh the page.', 'error');
        return;
    }
    
    try {
        showLoading(loginBtn, 'Logging in...');
        console.log('Attempting login with Firebase...');
        
        // Set persistence based on remember me
        const persistence = rememberMe ? 
            firebase.auth.Auth.Persistence.LOCAL : 
            firebase.auth.Auth.Persistence.SESSION;
        
        await auth.setPersistence(persistence);
        
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        console.log('Login successful:', userCredential.user);
        
        // Store remember me preference
        if (rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('lastLoginEmail', email);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.removeItem('lastLoginEmail');
        }
        
        showMessage('loginMessage', '✅ Login successful! Welcome back!', 'success');
        
        setTimeout(() => {
            closeLoginModal();
        }, 1500);
        
    } catch (error) {
        console.error('Login error:', error);
        hideLoading(loginBtn, '🚀 Login to Portal');
        
        // Show specific error message
        const errorMessage = getErrorMessage(error.code);
        showMessage('loginMessage', errorMessage, 'error');
        
        // Show field-specific validation if needed
        if (error.code === 'auth/user-not-found') {
            showValidation('loginEmailValidation', 'No account found with this email', 'error');
        } else if (error.code === 'auth/wrong-password') {
            showValidation('loginPasswordValidation', 'Incorrect password', 'error');
        }
    }
}

/**
 * Handle user registration with enhanced validation
 */
async function registerUser(event) {
    event.preventDefault();
    
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const registerBtn = document.getElementById('registerBtn');
    
    // Clear previous validation messages
    clearValidationMessages(['registerName', 'registerEmail', 'registerPassword', 'confirmPassword']);
    
    let hasErrors = false;
    
    // Validate name
    if (name.length < 2) {
        showValidation('registerNameValidation', 'Name must be at least 2 characters long', 'error');
        hasErrors = true;
    }
    
    // Validate email
    if (!validateEmail(email)) {
        showValidation('registerEmailValidation', 'Please enter a valid email address', 'error');
        hasErrors = true;
    }
    
    // Validate password strength
    const passwordStrength = checkPasswordStrength(password);
    if (passwordStrength.score < 2) {
        showValidation('registerPasswordValidation', 'Please choose a stronger password', 'error');
        hasErrors = true;
    }
    
    // Validate password confirmation
    if (password !== confirmPassword) {
        showValidation('confirmPasswordValidation', 'Passwords do not match', 'error');
        showMessage('registerMessage', 'Passwords do not match!', 'error');
        hasErrors = true;
    }
    
    // Check terms agreement
    if (!agreeTerms) {
        showMessage('registerMessage', 'Please agree to the Terms of Service and Privacy Policy', 'error');
        hasErrors = true;
    }
    
    if (hasErrors) return;
    
    try {
        showLoading(registerBtn, 'Creating account...');
        
        // Create user account
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        
        // Update user profile with name
        await userCredential.user.updateProfile({
            displayName: name
        });
        
        // Send email verification
        await userCredential.user.sendEmailVerification({
            url: window.location.origin + '/index.html',
            handleCodeInApp: false
        });
        
        // Store user creation timestamp
        const userData = {
            displayName: name,
            email: email,
            createdAt: new Date().toISOString(),
            emailVerified: false
        };
        
        // Store in localStorage for now (later can be Firestore)
        localStorage.setItem('userProfile', JSON.stringify(userData));
        
        showMessage('registerMessage', '✅ Account created successfully! Please check your email to verify your account before logging in.', 'success');
        
        setTimeout(() => {
            showAuthTab('login');
            // Pre-fill email in login form
            document.getElementById('loginEmail').value = email;
        }, 3000);
        
    } catch (error) {
        console.error('Registration error:', error);
        hideLoading(registerBtn, '📝 Create Account');
        
        const errorMessage = getErrorMessage(error.code);
        showMessage('registerMessage', errorMessage, 'error');
        
        // Show field-specific validation
        if (error.code === 'auth/email-already-in-use') {
            showValidation('registerEmailValidation', 'This email is already registered', 'error');
        } else if (error.code === 'auth/weak-password') {
            showValidation('registerPasswordValidation', 'Password is too weak', 'error');
        }
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
   ENHANCED UTILITY FUNCTIONS
   ========================================================================== */

/**
 * Toggle password visibility
 */
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const toggle = input.parentElement.querySelector('.password-toggle');
    
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
        toggle.title = 'Hide Password';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
        toggle.title = 'Show Password';
    }
}

/**
 * Validate email format
 */
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Check password strength
 */
function checkPasswordStrength(password) {
    let score = 0;
    let feedback = [];
    
    // Length check
    if (password.length >= 8) score++;
    else feedback.push('Use at least 8 characters');
    
    // Uppercase check
    if (/[A-Z]/.test(password)) score++;
    else feedback.push('Add uppercase letters');
    
    // Lowercase check
    if (/[a-z]/.test(password)) score++;
    else feedback.push('Add lowercase letters');
    
    // Number check
    if (/\d/.test(password)) score++;
    else feedback.push('Add numbers');
    
    // Special character check
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;
    else feedback.push('Add special characters');
    
    const strength = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][Math.min(score, 4)];
    const strengthClass = ['weak', 'weak', 'fair', 'good', 'strong'][Math.min(score, 4)];
    
    return { score, strength, strengthClass, feedback };
}

/**
 * Update password strength indicator
 */
function updatePasswordStrength(password) {
    const strengthInfo = checkPasswordStrength(password);
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    
    if (strengthFill) {
        strengthFill.className = `strength-fill ${strengthInfo.strengthClass}`;
    }
    
    if (strengthText) {
        if (password.length === 0) {
            strengthText.textContent = 'Password strength will appear here';
        } else {
            strengthText.textContent = `${strengthInfo.strength} - ${strengthInfo.feedback.join(', ')}`;
        }
    }
}

/**
 * Show validation message
 */
function showValidation(elementId, message, type) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.className = `input-validation ${type}`;
    }
}

/**
 * Clear validation messages
 */
function clearValidationMessages(fieldIds) {
    fieldIds.forEach(fieldId => {
        const validationElement = document.getElementById(fieldId + 'Validation');
        if (validationElement) {
            validationElement.textContent = '';
            validationElement.className = 'input-validation';
        }
    });
}

/**
 * Show Terms of Service modal
 */
function showTerms() {
    alert('Terms of Service:\n\n1. Use this portal responsibly for educational purposes\n2. Respect other users and maintain academic integrity\n3. Do not share your login credentials\n4. Report any issues to administrators\n\nFull terms available on our website.');
}

/**
 * Show Privacy Policy modal  
 */
function showPrivacy() {
    alert('Privacy Policy:\n\n• We collect minimal data necessary for portal functionality\n• Your email is used only for authentication and notifications\n• We do not share your personal information with third parties\n• Data is stored securely using Firebase authentication\n\nFull privacy policy available on our website.');
}

/**
 * Load remembered login data
 */
function loadRememberedData() {
    const rememberMe = localStorage.getItem('rememberMe');
    const lastEmail = localStorage.getItem('lastLoginEmail');
    
    if (rememberMe === 'true' && lastEmail) {
        const emailInput = document.getElementById('loginEmail');
        const rememberCheckbox = document.getElementById('rememberMe');
        
        if (emailInput) emailInput.value = lastEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

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
    const forms = ['loginForm', 'registerForm', 'forgotForm'];
    forms.forEach(formId => {
        const form = document.getElementById(formId);
        if (form) form.reset();
    });
    
    // Clear validation messages
    clearValidationMessages(['loginEmail', 'loginPassword', 'registerName', 'registerEmail', 'registerPassword', 'confirmPassword', 'forgotEmail']);
    clearMessages();
    
    // Reset password strength indicator
    const strengthFill = document.getElementById('strengthFill');
    const strengthText = document.getElementById('strengthText');
    if (strengthFill) strengthFill.className = 'strength-fill';
    if (strengthText) strengthText.textContent = 'Password strength will appear here';
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
