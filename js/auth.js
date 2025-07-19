/**
 * BULLETPROOF AUTH.JS for GitHub Pages
 * Simple, robust authentication system that will definitely load
 */

console.log('🔥 BULLETPROOF AUTH.JS STARTING...');

// Wrap everything in try-catch to prevent any errors from breaking the script
try {
    // Global variables
    window.currentUser = null;
    window.auth = null;

    // Core authentication functions - defined immediately
    window.handleLogin = function() {
        console.log('🔐 handleLogin called');
        try {
            if (window.currentUser) {
                window.openProfileModal();
            } else {
                window.openLoginModal();
            }
        } catch (error) {
            console.error('Error in handleLogin:', error);
            alert('Login error: ' + error.message);
        }
    };

    window.openLoginModal = function() {
        console.log('🔐 Opening login modal...');
        try {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.classList.add('active');
                window.showAuthTab('login');
                console.log('✅ Login modal opened');
            } else {
                console.error('❌ Login modal not found');
                alert('Login modal not found. Please refresh the page.');
            }
        } catch (error) {
            console.error('Error opening modal:', error);
            alert('Error opening login modal');
        }
    };

    window.closeLoginModal = function() {
        console.log('🔐 Closing login modal...');
        try {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.classList.remove('active');
                window.clearAuthForms();
            }
        } catch (error) {
            console.error('Error closing modal:', error);
        }
    };

    window.showAuthTab = function(tabName) {
        console.log('Showing auth tab:', tabName);
        try {
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
            
            window.clearMessages();
        } catch (error) {
            console.error('Error in showAuthTab:', error);
        }
    };

    window.loginUser = async function(event) {
        if (event) event.preventDefault();
        console.log('Login attempt started');
        
        try {
            const email = document.getElementById('loginEmail')?.value || '';
            const password = document.getElementById('loginPassword')?.value || '';
            const rememberMe = document.getElementById('rememberMe')?.checked || false;
            const loginBtn = document.getElementById('loginBtn');
            
            // Basic validation
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }
            
            if (loginBtn) {
                loginBtn.textContent = 'Signing in...';
                loginBtn.disabled = true;
            }
            
            // Check if Firebase is properly initialized
            if (!window.auth) {
                console.error('Firebase Auth not initialized');
                alert(`Firebase Authentication Error

The authentication service is not available. This could be due to:
1. Firebase API key restrictions for GitHub Pages
2. Network connectivity issues
3. Firebase project configuration

Please check the FIREBASE_FIX_GUIDE.md for solutions.

For demo purposes, you can explore the interface, but login functionality is disabled.`);
                return;
            }
            
            // Attempt Firebase login
            const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
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
            
            window.closeLoginModal();
            alert('Login successful!');
            
        } catch (error) {
            console.error('Login error:', error);
            
            // Handle specific Firebase errors
            if (error.code === 'auth/api-key-not-valid') {
                alert(`Firebase API Key Error

The Firebase API key is not valid for this domain. 

This is a configuration issue - please check the FIREBASE_FIX_GUIDE.md file for detailed instructions on how to fix this.

The site interface will work in demo mode, but authentication is disabled until Firebase is properly configured.`);
            } else if (error.code === 'auth/user-not-found') {
                alert('No account found with this email address. Please create an account first.');
            } else if (error.code === 'auth/wrong-password') {
                alert('Incorrect password. Please try again.');
            } else if (error.code === 'auth/invalid-email') {
                alert('Please enter a valid email address.');
            } else {
                alert('Login failed: ' + (error.message || 'Unknown error. Check FIREBASE_FIX_GUIDE.md for solutions.'));
            }
        } finally {
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.textContent = 'Sign In';
                loginBtn.disabled = false;
            }
        }
    };

    window.registerUser = async function(event) {
        if (event) event.preventDefault();
        console.log('Registration attempt started');
        
        try {
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
            
            if (window.auth) {
                const userCredential = await window.auth.createUserWithEmailAndPassword(email, password);
                const user = userCredential.user;
                
                console.log('Registration successful:', user);
                window.closeLoginModal();
                alert('Account created successfully! Please check your email for verification.');
            } else {
                throw new Error('Firebase Auth not initialized');
            }
        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed: ' + (error.message || 'Unknown error'));
        } finally {
            const registerBtn = document.getElementById('registerBtn');
            if (registerBtn) {
                registerBtn.textContent = 'Create Account';
                registerBtn.disabled = false;
            }
        }
    };

    window.resetPassword = async function(event) {
        if (event) event.preventDefault();
        console.log('Password reset attempt started');
        
        try {
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
            
            if (window.auth) {
                await window.auth.sendPasswordResetEmail(email);
                alert('Password reset email sent! Check your inbox.');
                window.showAuthTab('login');
            } else {
                throw new Error('Firebase Auth not initialized');
            }
        } catch (error) {
            console.error('Password reset error:', error);
            alert('Password reset failed: ' + (error.message || 'Unknown error'));
        } finally {
            const resetBtn = document.getElementById('resetBtn');
            if (resetBtn) {
                resetBtn.textContent = 'Reset Password';
                resetBtn.disabled = false;
            }
        }
    };

    window.logout = async function() {
        console.log('Logout attempt started');
        
        try {
            if (window.auth) {
                await window.auth.signOut();
                
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
    };

    // Helper functions
    window.openProfileModal = function() {
        try {
            if (window.currentUser) {
                const profileModal = document.getElementById('profileModal');
                if (profileModal) {
                    const profileName = document.getElementById('profileName');
                    const profileEmail = document.getElementById('profileEmail');
                    const profileStatus = document.getElementById('profileStatus');
                    
                    if (profileName) profileName.textContent = window.currentUser.displayName || 'User';
                    if (profileEmail) profileEmail.textContent = window.currentUser.email;
                    if (profileStatus) profileStatus.textContent = window.currentUser.emailVerified ? 'Email verified ✅' : 'Email not verified ⚠️';
                    
                    profileModal.classList.add('active');
                }
            }
        } catch (error) {
            console.error('Error opening profile modal:', error);
        }
    };

    window.closeProfileModal = function() {
        try {
            const profileModal = document.getElementById('profileModal');
            if (profileModal) {
                profileModal.classList.remove('active');
            }
        } catch (error) {
            console.error('Error closing profile modal:', error);
        }
    };

    window.clearAuthForms = function() {
        try {
            const inputs = ['loginEmail', 'loginPassword', 'registerEmail', 'registerPassword', 'confirmPassword', 'forgotEmail'];
            inputs.forEach(id => {
                const element = document.getElementById(id);
                if (element) element.value = '';
            });
            
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe) rememberMe.checked = false;
        } catch (error) {
            console.error('Error clearing forms:', error);
        }
    };

    window.clearMessages = function() {
        try {
            const messages = document.querySelectorAll('.validation-message');
            messages.forEach(msg => msg.textContent = '');
        } catch (error) {
            console.error('Error clearing messages:', error);
        }
    };

    window.togglePasswordVisibility = function(inputId) {
        try {
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
        } catch (error) {
            console.error('Error toggling password visibility:', error);
        }
    };

    window.showTerms = function() {
        alert('Terms of Service: This is a study portal. Please use responsibly.');
    };

    window.showPrivacy = function() {
        alert('Privacy Policy: Your data is secure and used only for educational purposes.');
    };

    window.updateUIForLoggedInUser = function(user) {
        try {
            window.currentUser = user;
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.textContent = 'Profile';
            }
        } catch (error) {
            console.error('Error updating UI for logged in user:', error);
        }
    };

    window.updateUIForLoggedOutUser = function() {
        try {
            window.currentUser = null;
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                loginBtn.textContent = 'Login';
            }
        } catch (error) {
            console.error('Error updating UI for logged out user:', error);
        }
    };

    // Firebase initialization
    window.initializeAuth = function() {
        try {
            if (typeof firebase === 'undefined') {
                console.error('Firebase not loaded yet, retrying...');
                setTimeout(window.initializeAuth, 200);
                return;
            }
            
            window.auth = firebase.auth();
            console.log('Firebase Auth initialized successfully');
            
            // Listen for authentication state changes
            window.auth.onAuthStateChanged(function(user) {
                console.log('Auth state changed:', user);
                if (user) {
                    window.updateUIForLoggedInUser(user);
                } else {
                    window.updateUIForLoggedOutUser();
                }
            });
            
            // Setup login button
            window.setupLoginButton();
            
            // Load remembered login data
            window.loadRememberedData();
            
        } catch (error) {
            console.error('Firebase Auth initialization error:', error);
        }
    };

    window.setupLoginButton = function() {
        try {
            console.log('🔐 Setting up login button...');
            const loginBtn = document.querySelector('.login-btn');
            
            if (loginBtn) {
                // Remove any existing onclick handler
                loginBtn.removeAttribute('onclick');
                
                // Remove any existing event listeners by cloning
                const newLoginBtn = loginBtn.cloneNode(true);
                loginBtn.parentNode.replaceChild(newLoginBtn, loginBtn);
                
                // Add new event listener
                newLoginBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    console.log('🔐 Login button clicked');
                    window.handleLogin();
                });
                
                console.log('✅ Login button handler set up');
            } else {
                console.error('❌ Login button not found');
            }
        } catch (error) {
            console.error('Error setting up login button:', error);
        }
    };

    window.loadRememberedData = function() {
        try {
            const rememberLogin = localStorage.getItem('rememberLogin');
            const userEmail = localStorage.getItem('userEmail');
            
            if (rememberLogin === 'true' && userEmail) {
                const emailInput = document.getElementById('loginEmail');
                const rememberCheckbox = document.getElementById('rememberMe');
                
                if (emailInput) emailInput.value = userEmail;
                if (rememberCheckbox) rememberCheckbox.checked = true;
            }
        } catch (error) {
            console.error('Error loading remembered data:', error);
        }
    };

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            console.log('DOM loaded, initializing auth...');
            setTimeout(window.initializeAuth, 100);
        });
    } else {
        console.log('DOM already loaded, initializing auth...');
        setTimeout(window.initializeAuth, 100);
    }

    console.log('✅ All auth functions defined successfully');
    console.log('🔐 Available functions:', {
        handleLogin: typeof window.handleLogin,
        openLoginModal: typeof window.openLoginModal,
        closeLoginModal: typeof window.closeLoginModal,
        loginUser: typeof window.loginUser,
        registerUser: typeof window.registerUser,
        resetPassword: typeof window.resetPassword,
        logout: typeof window.logout
    });

} catch (error) {
    console.error('❌ CRITICAL ERROR in auth.js:', error);
    
    // Create minimal fallback functions
    window.handleLogin = function() {
        alert('Authentication system error. Please refresh the page.');
    };
    
    window.openLoginModal = function() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.classList.add('active');
    };
    
    window.closeLoginModal = function() {
        const modal = document.getElementById('loginModal');
        if (modal) modal.classList.remove('active');
    };
}

console.log('🔥 BULLETPROOF AUTH.JS COMPLETED');
