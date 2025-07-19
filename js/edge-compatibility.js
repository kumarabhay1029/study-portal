/**
 * 🌐 CROSS-BROWSER COMPATIBILITY SYSTEM
 * Ensures consistent rendering and behavior across Chrome, Edge, and other browsers
 */

console.log('🌐 Cross-Browser Compatibility System Loading...');

// Detect Edge browser
function isEdgeBrowser() {
    return /Edg/.test(navigator.userAgent) || /Edge/.test(navigator.userAgent);
}

// Detect Chrome browser
function isChromeBrowser() {
    return /Chrome/.test(navigator.userAgent) && !/Edg/.test(navigator.userAgent);
}

// Apply universal compatibility fixes
function applyUniversalFixes() {
    console.log('🌐 Applying universal compatibility fixes...');
    
    // Ensure consistent base font size across all browsers
    const baseSize = 16; // Standard 16px base
    document.documentElement.style.fontSize = `${baseSize}px`;
    
    // Add browser-specific classes for targeted CSS if needed
    if (isEdgeBrowser()) {
        document.body.classList.add('edge-browser');
        console.log('🌐 Edge browser detected - applying consistency fixes');
    } else if (isChromeBrowser()) {
        document.body.classList.add('chrome-browser');
        console.log('🌐 Chrome browser detected - ensuring consistency');
    } else {
        document.body.classList.add('other-browser');
        console.log('🌐 Other browser detected - applying universal fixes');
    }
    
    // Ensure consistent viewport behavior
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport && isEdgeBrowser()) {
        // Standardize viewport for Edge to match Chrome behavior
        viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0, user-scalable=yes'
        );
        console.log('🌐 Viewport standardized for Edge');
    }
}

// Monitor for zoom/scale changes and maintain consistency
function handleBrowserChanges() {
    let lastDevicePixelRatio = window.devicePixelRatio;
    
    function checkForChanges() {
        const currentRatio = window.devicePixelRatio;
        
        if (Math.abs(currentRatio - lastDevicePixelRatio) > 0.1) {
            console.log('🌐 Browser zoom/scale changed, maintaining consistency...');
            applyUniversalFixes();
            lastDevicePixelRatio = currentRatio;
        }
    }
    
    // Monitor for changes
    window.addEventListener('resize', checkForChanges);
    setInterval(checkForChanges, 1000);
}

// Initialize compatibility system when DOM is ready
function initializeCompatibilitySystem() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyUniversalFixes();
            handleBrowserChanges();
        });
    } else {
        applyUniversalFixes();
        handleBrowserChanges();
    }
}

// Add universal CSS for consistent browser behavior
function injectUniversalStyles() {
    const universalStyles = `
        <style id="universal-compatibility-styles">
            /* Universal Browser Consistency */
            * {
                -webkit-text-size-adjust: 100%;
                -ms-text-size-adjust: 100%;
                text-size-adjust: 100%;
            }
            
            /* Ensure consistent rendering across browsers */
            .edge-browser,
            .chrome-browser,
            .other-browser {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                line-height: 1.6;
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
            }
            
            /* Minor Edge-specific adjustments for consistency (not scaling) */
            .edge-browser .main-bar {
                min-height: 200px; /* Consistent with Chrome */
            }
            
            .edge-browser .portal-title {
                font-size: 2.5em; /* Match Chrome exactly */
            }
            
            .edge-browser .login-btn {
                font-size: 1em; /* Standard button size */
                padding: 12px 24px; /* Consistent padding */
            }
            
            .edge-browser .resource-card,
            .edge-browser .stat-card {
                font-size: 1em; /* Standard card text */
                padding: 20px; /* Consistent padding */
            }
            
            .edge-browser .hero-section h1 {
                font-size: 3em; /* Match Chrome */
            }
            
            .edge-browser .hero-section p {
                font-size: 1.2em; /* Consistent subtitle */
            }
            
            .edge-browser .auth-btn {
                font-size: 1em; /* Standard button size */
                padding: 14px; /* Consistent padding */
            }
            
            .edge-browser .login-container {
                padding: 30px; /* Standard container padding */
                max-width: 400px; /* Consistent width */
            }
            
            /* Chrome-specific fine-tuning if needed */
            .chrome-browser {
                /* Already renders correctly, minimal adjustments */
            }
            
            /* Other browsers fallback */
            .other-browser {
                font-size: 16px; /* Ensure base font consistency */
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', universalStyles);
    console.log('🌐 Universal browser consistency styles injected');
}

// Initialize the universal compatibility system
console.log('🌐 Initializing Cross-Browser Compatibility System...');
injectUniversalStyles();
initializeCompatibilitySystem();

console.log('🌐 Cross-Browser Compatibility System Loaded - Ensuring consistent experience across all browsers');
