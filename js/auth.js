/**
 * Firebase Authentication System for Study Portal
 * Handles user login, registration, logout, and session management
 */

console.log('🔥 AUTH.JS LOADING STARTED');

// Global variables for authentication state
let currentUser = null;
let auth = null;

/* ==========================================================================
   CORE AUTHENTICATION FUNCTIONS
   ========================================================================== */

/**
 * Handle login button click
 */
function handleLogin() {
    console.log('🔐 handleLogin called, current user:', currentUser);
    
    try {
        if (currentUser) {
            // User is already logged in, show profile
            console.log('👤 User already logged in, opening profile modal');
            openProfileModal();
        } else {
            // User is not logged in, show login modal
            console.log('🔓 No user logged in, opening login modal');
            openLoginModal();
        }
    } catch (error) {
        console.error('❌ Error in handleLogin:', error);
        alert('Login error: ' + error.message);
    }
}

function openLoginModal() {
    console.log('🔐 Opening login modal...');
    const modal = document.getElementById('loginModal');
    console.log('🔐 Modal element:', modal);
    
    if (modal) {
        modal.classList.add('active');
        console.log('🔐 Modal classes after adding active:', modal.classList.toString());
        showAuthTab('login');
        console.log('✅ Login modal opened successfully');
    } else {
        console.error('❌ Login modal not found in DOM!');
        alert('Login modal not found. Please refresh the page and try again.');
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

function showAuthTab(tabName) {
    console.log('Showing auth tab:', tabName);
    
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
    
    clearMessages();
}

/**
 * Handle user login with enhanced features
 */
async function loginUser(event) {
    if (event) event.preventDefault();
    console.log('Login attempt started');
    
    const email = document.getElementById('loginEmail')?.value || '';
    const password = document.getElementById('loginPassword')?.value || '';
    const rememberMe = document.getElementById('rememberMe')?.checked || false;
    const loginBtn = document.getElementById('loginBtn');
    
    console.log('Email:', email);
    console.log('Password length:', password.length);
    console.log('Remember me:', rememberMe);
    
    // Basic validation
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    if (loginBtn) {
        loginBtn.textContent = 'Signing in...';
        loginBtn.disabled = true;
    }
    
    try {
        if (auth) {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Login successful:', user);
            
            // Store session info if remember me is checked
            if (rememberMe) {
                localStorage.setItem('rememberLogin', 'true');
                localStorage.setItem('userEmail', email);
            }
            
            // Store session information
            const sessionData = {
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };
            sessionStorage.setItem('currentSession', JSON.stringify(sessionData));
            
            closeLoginModal();
            alert('Login successful!');
        } else {
            throw new Error('Firebase Auth not initialized');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + (error.message || 'Unknown error'));
    } finally {
        if (loginBtn) {
            loginBtn.textContent = 'Sign In';
            loginBtn.disabled = false;
        }
    }
}

/**
 * Handle user registration
 */
async function registerUser(event) {
    if (event) event.preventDefault();
    console.log('Registration attempt started');
    
    const email = document.getElementById('registerEmail')?.value || '';
    const password = document.getElementById('registerPassword')?.value || '';
    const confirmPassword = document.getElementById('confirmPassword')?.value || '';
    const registerBtn = document.getElementById('registerBtn');
    
    // Basic validation
    if (!email || !password || !confirmPassword) {
        alert('Please fill in all fields');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        alert('Password must be at least 6 characters long');
        return;
    }
    
    if (registerBtn) {
        registerBtn.textContent = 'Creating Account...';
        registerBtn.disabled = true;
    }
    
    try {
        if (auth) {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            console.log('Registration successful:', user);
            closeLoginModal();
            alert('Account created successfully! Please check your email for verification.');
        } else {
            throw new Error('Firebase Auth not initialized');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + (error.message || 'Unknown error'));
    } finally {
        if (registerBtn) {
            registerBtn.textContent = 'Create Account';
            registerBtn.disabled = false;
        }
    }
}

/**
 * Handle password reset
 */
async function resetPassword(event) {
    if (event) event.preventDefault();
    console.log('Password reset attempt started');
    
    const email = document.getElementById('forgotEmail')?.value || '';
    const resetBtn = document.getElementById('resetBtn');
    
    if (!email) {
        alert('Please enter your email address');
        return;
    }
    
    if (resetBtn) {
        resetBtn.textContent = 'Sending...';
        resetBtn.disabled = true;
    }
    
    try {
        if (auth) {
            await auth.sendPasswordResetEmail(email);
            alert('Password reset email sent! Check your inbox.');
            showAuthTab('login');
        } else {
            throw new Error('Firebase Auth not initialized');
        }
    } catch (error) {
        console.error('Password reset error:', error);
        alert('Password reset failed: ' + (error.message || 'Unknown error'));
    } finally {
        if (resetBtn) {
            resetBtn.textContent = 'Reset Password';
            resetBtn.disabled = false;
        }
    }
}

/**
 * Handle user logout
 */
async function logout() {
    console.log('Logout attempt started');
    
    try {
        if (auth) {
            await auth.signOut();
            
            // Clear session data
            sessionStorage.removeItem('currentSession');
            localStorage.removeItem('rememberLogin');
            localStorage.removeItem('userEmail');
            
            console.log('Logout successful');
            alert('You have been logged out successfully.');
        } else {
            throw new Error('Firebase Auth not initialized');
        }
    } catch (error) {
        console.error('Logout error:', error);
        alert('Logout failed: ' + (error.message || 'Unknown error'));
    }
}

/* ==========================================================================
   HELPER FUNCTIONS
   ========================================================================== */

function openProfileModal() {
    if (currentUser) {
        const profileModal = document.getElementById('profileModal');
        if (profileModal) {
            document.getElementById('profileName').textContent = currentUser.displayName || 'User';
            document.getElementById('profileEmail').textContent = currentUser.email;
            document.getElementById('profileStatus').textContent = currentUser.emailVerified ? 'Email verified ✅' : 'Email not verified ⚠️';
            profileModal.classList.add('active');
        }
    }
}

function closeProfileModal() {
    const profileModal = document.getElementById('profileModal');
    if (profileModal) {
        profileModal.classList.remove('active');
    }
}

function clearAuthForms() {
    const inputs = ['loginEmail', 'loginPassword', 'registerEmail', 'registerPassword', 'confirmPassword', 'forgotEmail'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.value = '';
    });
    
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) rememberMe.checked = false;
}

function clearMessages() {
    // Clear any validation messages
    const messages = document.querySelectorAll('.validation-message');
    messages.forEach(msg => msg.textContent = '');
}

function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const icon = input?.nextElementSibling?.querySelector('i');
    
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.className = 'fas fa-eye-slash';
        } else {
            input.type = 'password';
            icon.className = 'fas fa-eye';
        }
    }
}

function showTerms() {
    alert('Terms of Service: This is a study portal. Please use responsibly.');
}

function showPrivacy() {
    alert('Privacy Policy: Your data is secure and used only for educational purposes.');
}

function updateUIForLoggedInUser(user) {
    currentUser = user;
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = 'Profile';
    }
}

function updateUIForLoggedOutUser() {
    currentUser = null;
    const loginBtn = document.querySelector('.login-btn');
    if (loginBtn) {
        loginBtn.textContent = 'Login';
    }
}

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
                setTimeout(initializeAuth, 200);
                return;
            }
            
            auth = firebase.auth();
            console.log('Firebase Auth initialized successfully');
            
            // Listen for authentication state changes
            auth.onAuthStateChanged(function(user) {
                console.log('Auth state changed:', user);
                if (user) {
                    updateUIForLoggedInUser(user);
                } else {
                    updateUIForLoggedOutUser();
                }
            });
            
            // Setup login button
            setupLoginButton();
            
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
 * Setup login button functionality
 */
function setupLoginButton() {
    console.log('🔐 Setting up login button...');
    const loginBtn = document.querySelector('.login-btn');
    console.log('🔐 Login button element:', loginBtn);
    
    if (loginBtn) {
        console.log('✅ Login button found, setting up handler');
        
        // Remove any existing onclick handler
        loginBtn.removeAttribute('onclick');
        
        // Remove any existing event listeners by cloning the element
        const newLoginBtn = loginBtn.cloneNode(true);
        loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
        
        // Add new event listener to the cloned element
        newLoginBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🔐 Login button clicked via event listener');
            try {
                handleLogin();
            } catch (error) {
                console.error('❌ Error in login button click handler:', error);
                alert('Login button error: ' + error.message);
            }
        });
        
        console.log('✅ Login button handler set up successfully');
    } else {
        console.error('❌ Login button not found in DOM');
    }
}

function loadRememberedData() {
    const rememberLogin = localStorage.getItem('rememberLogin');
    const userEmail = localStorage.getItem('userEmail');
    
    if (rememberLogin === 'true' && userEmail) {
        const emailInput = document.getElementById('loginEmail');
        const rememberCheckbox = document.getElementById('rememberMe');
        
        if (emailInput) emailInput.value = userEmail;
        if (rememberCheckbox) rememberCheckbox.checked = true;
    }
}

/* ==========================================================================
   GLOBAL FUNCTION EXPORTS
   ========================================================================== */

// Make all functions globally available
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
window.openProfileModal = openProfileModal;
window.closeProfileModal = closeProfileModal;

console.log('✅ All auth functions exported to global scope');
console.log('🔐 Available functions:', {
    handleLogin: typeof window.handleLogin,
    openLoginModal: typeof window.openLoginModal,
    closeLoginModal: typeof window.closeLoginModal,
    loginUser: typeof window.loginUser
});

console.log('🔥 AUTH.JS LOADING COMPLETED SUCCESSFULLY');
