/**
 * 🧪 LOGIN SYSTEM TEST
 * Test script to verify login functionality
 */

console.log('🧪 Login System Test Script Loading...');

function testLoginSystem() {
    console.log('🧪 Starting Login System Tests...');
    
    // Test 1: Check if login button exists
    const loginBtn = document.querySelector('.login-btn');
    console.log('✅ Test 1 - Login button exists:', !!loginBtn);
    
    if (loginBtn) {
        // Test 2: Check if button has proper structure
        const iconElement = loginBtn.querySelector('.btn-icon');
        const textElement = loginBtn.querySelector('.btn-text');
        console.log('✅ Test 2 - Button structure:', !!iconElement && !!textElement);
        
        // Test 3: Check icon content
        if (iconElement) {
            const iconText = iconElement.textContent;
            const hasValidIcon = iconText === '🔑' || iconText === '👤';
            console.log('✅ Test 3 - Valid icon:', hasValidIcon, 'Current:', iconText);
        }
        
        // Test 4: Check if button has click handler
        const hasClickHandler = loginBtn.onclick || loginBtn.getAttribute('onclick');
        console.log('✅ Test 4 - Click handler exists:', !!hasClickHandler);
    }
    
    // Test 5: Check if login modal exists
    const loginModal = document.getElementById('loginModal');
    console.log('✅ Test 5 - Login modal exists:', !!loginModal);
    
    // Test 6: Check if auth system is loaded
    console.log('✅ Test 6 - Auth system loaded:', !!window.authSystem);
    console.log('✅ Test 6 - Firebase available:', !!window.auth);
    console.log('✅ Test 6 - HandleLogin function:', typeof window.handleLogin);
    
    // Test 7: Check helper scripts
    console.log('✅ Test 7 - Icon fix loaded:', !!window.fixAllIcons);
    console.log('✅ Test 7 - Button manager loaded:', !!window.loginButtonManager);
    
    console.log('🧪 Login System Tests Complete!');
}

// Run tests when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(testLoginSystem, 2000);
    });
} else {
    setTimeout(testLoginSystem, 2000);
}

// Make test function available globally
window.testLoginSystem = testLoginSystem;

console.log('✅ Login System Test Script Loaded');
