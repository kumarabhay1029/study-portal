/**
 * Firebase Configuration for Study Portal
 * New project: f1site-b35c6 (Fresh setup for GitHub Pages)
 */

// Your web app's Firebase configuration (New Project)
const firebaseConfig = {
    apiKey: "AIzaSyAMOoKFc6PeWoCaEa0-iZ1o2xer3capkyQ",
    authDomain: "f1site-b35c6.firebaseapp.com",
    projectId: "f1site-b35c6",
    storageBucket: "f1site-b35c6.firebasestorage.app",
    messagingSenderId: "1077434047400",
    appId: "1:1077434047400:web:0e30d9b02540355a4b1b9d"
};

// Initialize Firebase with error handling
try {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully with new project!');
    console.log('🔧 Config details:', {
        projectId: firebaseConfig.projectId,
        authDomain: firebaseConfig.authDomain,
        currentDomain: window.location.hostname
    });
    
    // Test Firebase connection
    firebase.auth().onAuthStateChanged(function(user) {
        console.log('🔐 Firebase Auth connection working, user state:', user ? 'logged in' : 'logged out');
    });
    
    // Export services for use in other modules
    window.firebaseServices = {
        app: firebase.app(),
        auth: firebase.auth(),
        storage: firebase.storage()
    };
    
    console.log('🎉 New Firebase project ready for GitHub Pages!');
    
} catch (error) {
    console.error('❌ Firebase initialization error:', error);
    console.error('🔧 Error details:', {
        code: error.code,
        message: error.message,
        currentDomain: window.location.hostname
    });
    
    // Show user-friendly error
    if (error.code === 'auth/api-key-not-valid') {
        alert(`Firebase Configuration Error: 
        
The Firebase API key is not valid for this domain (${window.location.hostname}).

Please check your Firebase Console settings.`);
    } else {
        console.log('🔧 If you see any errors, check that Authentication is enabled in Firebase Console');
    }
}

// Firebase services exports for use in other modules
const auth = firebase.auth();
const storage = firebase.storage();

// Test Firebase connection
auth.onAuthStateChanged((user) => {
    console.log('Firebase Auth ready, current user:', user);
});

// Export for use in other files
window.firebaseServices = {
    auth,
    storage
};

// Make auth globally available
window.auth = auth;
