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

    // Single, comprehensive auth system with smooth animations
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
                    
                    /* Smooth Message Box */
                    .auth-message {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0.8);
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 20px 30px;
                        border-radius: 15px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
                        z-index: 10000;
                        opacity: 0;
                        transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                        pointer-events: none;
                        backdrop-filter: blur(10px);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        font-weight: 600;
                        text-align: center;
                        min-width: 250px;
                    }
                    
                    .auth-message.show {
                        opacity: 1;
                        transform: translate(-50%, -50%) scale(1);
                        pointer-events: auto;
                    }
                    
                    .auth-message.success {
                        background: linear-gradient(135deg, #00b894 0%, #00a085 100%);
                    }
                    
                    .auth-message.error {
                        background: linear-gradient(135deg, #e84393 0%, #fd79a8 100%);
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
                console.log('✨ Animation system initialized');
            }
        }

        showMessage(message, type = 'info', duration = 3000) {
            // Remove existing messages
            const existingMessages = document.querySelectorAll('.auth-message');
            existingMessages.forEach(msg => msg.remove());

            // Create new message
            const messageEl = document.createElement('div');
            messageEl.className = `auth-message ${type}`;
            messageEl.textContent = message;
            
            document.body.appendChild(messageEl);
            
            // Show animation
            setTimeout(() => {
                messageEl.classList.add('show');
            }, 100);
            
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
                
                // Smooth animation
                requestAnimationFrame(() => {
                    modal.classList.add('active');
                });
                
                this.showMessage('🌟 Welcome! Please sign in to continue', 'info', 2000);
                console.log('✅ Login modal opened with animation');
            } else {
                this.showMessage('⏳ Login system is loading...', 'info', 2000);
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
                
                // Smooth animation
                requestAnimationFrame(() => {
                    modal.classList.add('active');
                });
                
                this.showMessage(`👤 Welcome back, ${this.currentUser.email}!`, 'success', 2000);
                console.log('✅ Profile modal opened with animation');
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
                this.showMessage('❌ Please enter both email and password', 'error');
                return;
            }

            try {
                if (!window.auth || !this.authReady) {
                    throw new Error('Firebase Auth not ready');
                }

                this.showMessage('🔐 Signing you in...', 'info', 2000);
                
                const userCredential = await window.auth.signInWithEmailAndPassword(email, password);
                console.log('✅ Login successful:', userCredential.user.email);
                
                this.closeLoginModal();
                this.showMessage('🎉 Welcome back! Login successful', 'success');
                
            } catch (error) {
                console.error('❌ Login error:', error);
                this.showMessage(`❌ Login failed: ${error.message}`, 'error');
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
                this.showMessage('🚪 Successfully signed out', 'success');
                
            } catch (error) {
                console.error('❌ Logout error:', error);
                // Force logout anyway
                this.currentUser = null;
                this.updateButtonState(null);
                this.closeProfileModal();
                this.showMessage('✅ Logout completed', 'success');
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
                window.finalAuth.showMessage('📝 Registration feature coming soon!', 'info');
            };
            
            window.resetPassword = (event) => {
                if (event) event.preventDefault();
                window.finalAuth.showMessage('🔐 Password reset feature coming soon!', 'info');
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
