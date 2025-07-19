/**
 * 🔥 ENHANCED FIREBASE CONFIG for GitHub Pages
 * Optimized for reliable GitHub Pages deployment with better error handling
 */

console.log('🔥 Firebase Config Loading...');

// Enhanced Firebase Configuration with error recovery
const firebaseConfig = {
    apiKey: "AIzaSyAMOoKFc6PeWoCaEa0-iZ1o2xer3capkyQ",
    authDomain: "f1site-b35c6.firebaseapp.com",
    projectId: "f1site-b35c6",
    storageBucket: "f1site-b35c6.firebasestorage.app",
    messagingSenderId: "1077434047400",
    appId: "1:1077434047400:web:0e30d9b02540355a4b1b9d"
};

// Enhanced initialization with retry mechanism
let initializationAttempts = 0;
const maxAttempts = 3;

function initializeFirebase() {
    initializationAttempts++;
    
    try {
        // Check if Firebase is already initialized
        if (firebase.apps.length === 0) {
            firebase.initializeApp(firebaseConfig);
        }
        
        console.log('✅ Firebase initialized successfully!');
        console.log('📍 Project ID:', firebaseConfig.projectId);
        console.log('🌐 Current domain:', window.location.hostname);
        console.log('🔗 Expected domain: kumarabhay1029.github.io');
        
        // Initialize Firebase Auth
        window.auth = firebase.auth();
        
        // Test authentication state
        window.auth.onAuthStateChanged(function(user) {
            console.log('🔐 Auth state changed:', user ? 'User logged in' : 'No user');
            
            // Dispatch custom event for auth state changes
            window.dispatchEvent(new CustomEvent('firebaseAuthReady', {
                detail: { user: user, auth: window.auth }
            }));
        });
        
        // Set persistence to LOCAL (survives browser restarts)
        window.auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL)
            .then(() => {
                console.log('✅ Auth persistence set to LOCAL');
            })
            .catch((error) => {
                console.warn('⚠️ Auth persistence setting failed:', error.message);
            });
        
        // Export for global access
        window.firebaseServices = {
            app: firebase.app(),
            auth: window.auth,
            storage: firebase.storage()
        };
        
        // Signal that Firebase is ready
        window.firebaseReady = true;
        window.dispatchEvent(new Event('firebaseReady'));
        
        console.log('🎉 Firebase fully configured for GitHub Pages!');
        
        return true;
        
    } catch (error) {
        console.error(`❌ Firebase initialization error (attempt ${initializationAttempts}):`, error);
        
        // Enhanced error handling with specific solutions
        if (error.code === 'auth/api-key-not-valid' || error.message.includes('api-key-not-valid')) {
            console.error(`🔧 SOLUTION NEEDED: Firebase API Key Error
            
Your Firebase project domain authorization needs to be updated:

1. Go to: https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/settings
2. Scroll to "Authorized domains" 
3. Click "Add domain"
4. Add: kumarabhay1029.github.io
5. Click "Done" and wait 2-3 minutes

Current domain: ${window.location.hostname}
Expected domain: kumarabhay1029.github.io
`);
            
            // Show user-friendly error in UI
            setTimeout(() => {
                if (typeof showFirebaseError === 'function') {
                    showFirebaseError('domain');
                }
            }, 1000);
            
        } else if (error.code === 'auth/operation-not-allowed') {
            console.error(`🔧 SOLUTION: Authentication Method Not Enabled
            
Please enable Email/Password authentication:

1. Go to: https://console.firebase.google.com/project/${firebaseConfig.projectId}/authentication/providers
2. Click on "Email/Password"  
3. Enable "Email/Password" toggle
4. Click "Save"
`);
            
        } else {
            console.error('🔧 Generic Firebase error:', error.code, error.message);
        }
        
        // Retry mechanism for transient errors
        if (initializationAttempts < maxAttempts && 
            !error.code?.includes('api-key-not-valid')) {
            console.log(`🔄 Retrying Firebase initialization in 2 seconds... (${initializationAttempts}/${maxAttempts})`);
            setTimeout(initializeFirebase, 2000);
        } else {
            console.error('❌ Firebase initialization failed after maximum attempts');
            
            // Create fallback auth object for demo mode
            window.auth = {
                signInWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
                createUserWithEmailAndPassword: () => Promise.reject(new Error('Firebase not configured')),
                sendPasswordResetEmail: () => Promise.reject(new Error('Firebase not configured')),
                signOut: () => Promise.resolve(),
                onAuthStateChanged: () => {},
                setPersistence: () => Promise.resolve()
            };
            
            window.firebaseReady = false;
        }
        
        return false;
    }
}

// Enhanced error display function
window.showFirebaseError = function(errorType) {
    const errorMessages = {
        domain: `🔧 Firebase Domain Configuration Needed

Your Firebase project needs to allow this domain (${window.location.hostname}).

To fix this:
1. Go to Firebase Console → Authentication → Settings
2. Add "${window.location.hostname}" to Authorized domains
3. Wait 2-3 minutes for changes to take effect

The interface will work in demo mode until this is fixed.`,
        
        auth: `🔧 Authentication Method Not Enabled

Please enable Email/Password authentication in Firebase Console:
Authentication → Sign-in method → Email/Password → Enable`,
        
        network: `🔧 Network Connection Issue

Please check your internet connection and try again.`
    };
    
    const message = errorMessages[errorType] || 'Unknown Firebase configuration error';
    
    // Try to show in UI if available
    const statusEl = document.getElementById('firebase-status');
    if (statusEl) {
        statusEl.innerHTML = `<div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 10px 0;">${message.replace(/\n/g, '<br>')}</div>`;
    } else {
        console.warn(message);
    }
};

// Wait for Firebase SDK to load before initializing
if (typeof firebase !== 'undefined') {
    console.log('🔥 Firebase SDK detected, initializing...');
    initializeFirebase();
} else {
    console.log('⏳ Waiting for Firebase SDK to load...');
    
    // Wait for Firebase SDK with timeout
    let waitAttempts = 0;
    const maxWaitAttempts = 50; // 10 seconds total
    
    const waitForFirebase = setInterval(() => {
        waitAttempts++;
        
        if (typeof firebase !== 'undefined') {
            console.log('✅ Firebase SDK loaded, initializing...');
            clearInterval(waitForFirebase);
            initializeFirebase();
        } else if (waitAttempts >= maxWaitAttempts) {
            console.error('❌ Firebase SDK failed to load within timeout');
            clearInterval(waitForFirebase);
            
            // Show error to user
            setTimeout(() => {
                if (typeof showFirebaseError === 'function') {
                    showFirebaseError('network');
                }
            }, 1000);
        }
    }, 200);
}

console.log('🔥 Firebase Config Script Loaded');
