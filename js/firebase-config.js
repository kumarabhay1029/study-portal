/**
 * Firebase Configuration for Study Portal
 * Contains Firebase project configuration and initialization
 */

// Your web app's Firebase configuration (free plan)
const firebaseConfig = {
    apiKey: "AIzaSyBc3DKeE-LQXI2GIaaMpVpjmQ_YmVHgWos",
    authDomain: "kkgithub-e28e9.firebaseapp.com",
    projectId: "kkgithub-e28e9",
    storageBucket: "kkgithub-e28e9.firebasestorage.app",
    messagingSenderId: "789092710893",
    appId: "1:789092710893:web:dac6bc1e8d8b3db13b1b46"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services exports for use in other modules
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Export for use in other files
window.firebaseServices = {
    auth,
    db,
    storage
};
