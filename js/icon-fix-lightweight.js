/**
 * 🎨 LIGHTWEIGHT ICON FIX
 * Simple icon fix without performance overhead
 */

console.log('🎨 Lightweight Icon Fix Loading...');

// Simple one-time fix function
function fixLoginIcon() {
    const loginBtn = document.querySelector('.login-btn');
    if (!loginBtn) return;
    
    const iconElement = loginBtn.querySelector('.btn-icon');
    if (iconElement) {
        const iconText = iconElement.textContent;
        if (iconText.includes('◊') || iconText.includes('�') || iconText === '' || iconText === '?') {
            iconElement.textContent = '🗝️';
            iconElement.setAttribute('data-icon', 'login');
            console.log('✅ Fixed login icon');
        }
    }
}

// Override auth system updateUI to use clean icons
function enhanceAuthSystem() {
    if (window.authSystem && typeof window.authSystem.updateUI === 'function') {
        const originalUpdateUI = window.authSystem.updateUI.bind(window.authSystem);
        
        window.authSystem.updateUI = function(user) {
            const loginBtn = document.querySelector('.login-btn');
            if (loginBtn) {
                if (user) {
                    loginBtn.innerHTML = `
                        <span class="btn-icon" data-icon="profile">👤</span>
                        <span class="btn-text">Profile</span>
                    `;
                    loginBtn.classList.add('logged-in');
                    loginBtn.setAttribute('title', `Logged in as ${user.email}`);
                } else {
                    loginBtn.innerHTML = `
                        <span class="btn-icon" data-icon="login">🗝️</span>
                        <span class="btn-text">Login</span>
                    `;
                    loginBtn.classList.remove('logged-in');
                    loginBtn.setAttribute('title', 'Click to login or register');
                }
            }
        };
        console.log('✅ Auth system enhanced with lightweight icons');
    }
}

// Initialize
setTimeout(() => {
    fixLoginIcon();
    enhanceAuthSystem();
}, 100);

// Fix on page interactions (but not aggressively)
let lastFix = 0;
document.addEventListener('click', () => {
    const now = Date.now();
    if (now - lastFix > 2000) { // Only every 2 seconds max
        setTimeout(fixLoginIcon, 50);
        lastFix = now;
    }
}, { passive: true });

console.log('✅ Lightweight Icon Fix Loaded');
