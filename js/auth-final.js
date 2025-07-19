/**
 * 🔐 FINAL AUTH SYSTEM - SINGLE SOLUTION
 * Complete authentication with login/profile button management
 * NO reload loops, NO conflicts, NO multiple scripts
 */

console.log('🔐 Final Auth System Loading...');

// Prevent multiple initializations
if (window.finalAuthInitialized) {
    console.log('⚠️ Final auth already initialized, skipping...');
} else {
    window.finalAuthInitialized = true;

    // Single, comprehensive auth system
    class FinalAuthSystem {
        constructor() {
            this.currentUser = null;
            this.authReady = false;
            this.initializeSystem();
        }

        initializeSystem() {
            console.log('🔐 Initializing Final Auth System...');
            
            // Setup UI first
            this.setupLoginButton();
            this.setupGlobalFunctions();
            
            // Then try to connect to Firebase
            this.connectToFirebase();
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
            }
        }

        connectToFirebase() {
            // Wait for Firebase to be ready
            const checkFirebase = () => {
                if (window.firebaseReady && window.auth) {
                    console.log('✅ Firebase connected');
                    this.setupFirebaseAuth();
                } else {
                    console.log('⏳ Waiting for Firebase...');
                    setTimeout(checkFirebase, 500);
                }
            };
            
            checkFirebase();
        }

        setupFirebaseAuth() {
            if (!window.auth) return;
            
            // Listen for auth state changes
            window.auth.onAuthStateChanged((user) => {
                console.log('🔐 Auth state changed:', user ? 'Logged in' : 'Logged out');
                this.currentUser = user;
                this.updateButtonState(user);
            });
            
            this.authReady = true;
            console.log('✅ Firebase Auth connected');
        }

        handleLogin() {
            console.log('🔐 Login clicked');
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
                modal.classList.add('active');
                console.log('✅ Login modal opened');
            } else {
                alert('Login system is loading. Please try again in a moment.');
            }
        }

        openProfileModal() {
            if (!this.currentUser) return;
            
            const modal = document.getElementById('profileModal');
            if (modal) {
                // Update profile info
                const profileEmail = document.getElementById('profileEmail');
                if (profileEmail) {
                    profileEmail.textContent = this.currentUser.email;
                }
                
                modal.style.display = 'flex';
                modal.classList.add('active');
                console.log('✅ Profile modal opened');
            }
        }

        updateButtonState(user) {
            const loginBtn = document.querySelector('.login-btn');
            if (!loginBtn) return;

            if (user) {
                // User logged in - show profile button
                loginBtn.innerHTML = `
                    <span class="btn-icon">👤</span>
                    <span class="btn-text">Profile</span>
                `;
                loginBtn.classList.add('logged-in');
                loginBtn.setAttribute('title', `Logged in as ${user.email}`);
                console.log('✅ Button updated to Profile');
            } else {
                // User logged out - show login button
                loginBtn.innerHTML = `
                    <span class="btn-icon">🗝️</span>
                    <span class="btn-text">Login</span>
                `;
                loginBtn.classList.remove('logged-in');
                loginBtn.setAttribute('title', 'Click to login or register');
                console.log('✅ Button updated to Login');
            }
        }

        async loginUser(event) {
            if (event) event.preventDefault();
            
            const email = document.getElementById('loginEmail')?.value;
            const password = document.getElementById('loginPassword')?.value;
            
            if (!email || !password) {
                alert('Please enter both email and password');
                return;
            }

            try {
                if (!window.auth || !this.authReady) {
                    throw new Error('Firebase Auth not ready');
                }

                const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
                console.log('✅ Login successful:', userCredential.user.email);
                
                this.closeLoginModal();
                alert('🎉 Login successful! Welcome back.');
                
            } catch (error) {
                console.error('❌ Login error:', error);
                alert('Login failed: ' + error.message);
            }
        }

        async logout() {
            console.log('🔐 Logout started');
            
            try {
                if (window.auth) {
                    await window.auth.signOut();
                }
                
                // Clear session data
                sessionStorage.clear();
                localStorage.removeItem('rememberLogin');
                localStorage.removeItem('userEmail');
                
                this.closeProfileModal();
                this.currentUser = null;
                this.updateButtonState(null);
                
                console.log('✅ Logout successful');
                alert('🚪 You have been signed out successfully.');
                
            } catch (error) {
                console.error('❌ Logout error:', error);
                // Force logout anyway
                this.currentUser = null;
                this.updateButtonState(null);
                this.closeProfileModal();
                alert('Logout completed.');
            }
        }

        closeLoginModal() {
            const modal = document.getElementById('loginModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
            }
        }

        closeProfileModal() {
            const modal = document.getElementById('profileModal');
            if (modal) {
                modal.style.display = 'none';
                modal.classList.remove('active');
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
                alert('Registration feature will be implemented soon.');
            };
            
            window.resetPassword = (event) => {
                if (event) event.preventDefault();
                alert('Password reset feature will be implemented soon.');
            };
            
            window.togglePasswordVisibility = (inputId) => {
                const input = document.getElementById(inputId);
                if (input) {
                    input.type = input.type === 'password' ? 'text' : 'password';
                }
            };
            
            console.log('✅ Global functions setup complete');
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

    console.log('✅ Final Auth System Loaded');
}
