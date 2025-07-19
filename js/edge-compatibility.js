/**
 * 🌐 EDGE BROWSER COMPATIBILITY FIXES
 * Automatic scaling and font size adjustments for Microsoft Edge
 */

console.log('🌐 Edge Compatibility Fixes Loading...');

// Detect Edge browser
function isEdgeBrowser() {
    return /Edg/.test(navigator.userAgent) || /Edge/.test(navigator.userAgent);
}

// Apply Edge-specific fixes
function applyEdgeFixes() {
    if (!isEdgeBrowser()) return;
    
    console.log('🌐 Microsoft Edge detected, applying compatibility fixes...');
    
    // Get device pixel ratio for high DPI displays
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Apply scaling based on device pixel ratio
    if (devicePixelRatio > 1) {
        // High DPI display detected
        const scaleFactor = Math.min(devicePixelRatio * 0.8, 1.4);
        
        // Apply global font scaling
        document.documentElement.style.fontSize = `${16 * scaleFactor}px`;
        
        // Add Edge-specific CSS class
        document.body.classList.add('edge-browser', 'edge-high-dpi');
        
        console.log(`🌐 Applied Edge high-DPI scaling: ${scaleFactor}x`);
    } else {
        // Standard DPI display
        document.documentElement.style.fontSize = '18px';
        document.body.classList.add('edge-browser', 'edge-standard-dpi');
        
        console.log('🌐 Applied Edge standard DPI scaling');
    }
    
    // Force repaint to apply changes
    setTimeout(() => {
        document.body.style.display = 'none';
        document.body.offsetHeight; // Trigger reflow
        document.body.style.display = '';
    }, 100);
}

// Zoom detection and adjustment
function handleZoomChanges() {
    if (!isEdgeBrowser()) return;
    
    let lastDevicePixelRatio = window.devicePixelRatio;
    
    function checkZoom() {
        const currentRatio = window.devicePixelRatio;
        
        if (Math.abs(currentRatio - lastDevicePixelRatio) > 0.1) {
            console.log('🌐 Edge zoom level changed, readjusting...');
            applyEdgeFixes();
            lastDevicePixelRatio = currentRatio;
        }
    }
    
    // Check for zoom changes
    window.addEventListener('resize', checkZoom);
    setInterval(checkZoom, 1000);
}

// Initialize Edge fixes when DOM is ready
function initializeEdgeFixes() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            applyEdgeFixes();
            handleZoomChanges();
        });
    } else {
        applyEdgeFixes();
        handleZoomChanges();
    }
}

// Add CSS for Edge-specific classes
function injectEdgeStyles() {
    if (!isEdgeBrowser()) return;
    
    const edgeStyles = `
        <style id="edge-compatibility-styles">
            /* Edge Browser Specific Enhancements */
            .edge-browser {
                -ms-text-size-adjust: none !important;
                text-size-adjust: none !important;
                zoom: 1.1 !important;
            }
            
            .edge-high-dpi {
                transform: scale(1.1);
                transform-origin: top left;
            }
            
            .edge-browser .main-bar {
                min-height: 210px !important;
                font-size: 1.2em !important;
            }
            
            .edge-browser .portal-title {
                font-size: 2.6em !important;
                padding: 22px 45px !important;
            }
            
            .edge-browser .login-btn {
                font-size: 1.2em !important;
                padding: 14px 28px !important;
            }
            
            .edge-browser .resource-card,
            .edge-browser .stat-card {
                font-size: 1.15em !important;
                padding: 22px !important;
            }
            
            .edge-browser .hero-section h1 {
                font-size: 3.4em !important;
            }
            
            .edge-browser .hero-section p {
                font-size: 1.3em !important;
            }
            
            .edge-browser .auth-btn {
                font-size: 1.1em !important;
                padding: 16px !important;
            }
            
            .edge-browser .login-container {
                padding: 32px !important;
                max-width: 420px !important;
            }
            
            /* Fix for Edge's aggressive zoom compression */
            @media screen and (-ms-high-contrast: active), (-ms-high-contrast: none) {
                body {
                    zoom: 1.15 !important;
                }
            }
            
            /* Edge Legacy compatibility */
            @supports (-ms-ime-align: auto) {
                body {
                    font-size: 1.1em !important;
                }
            }
        </style>
    `;
    
    document.head.insertAdjacentHTML('beforeend', edgeStyles);
    console.log('🌐 Edge-specific styles injected');
}

// Apply viewport meta tag fix for Edge
function fixEdgeViewport() {
    if (!isEdgeBrowser()) return;
    
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
        // Update viewport for better Edge compatibility
        viewport.setAttribute('content', 
            'width=device-width, initial-scale=1.0, minimum-scale=0.8, maximum-scale=3.0, user-scalable=yes'
        );
        console.log('🌐 Viewport meta tag updated for Edge compatibility');
    }
}

// Initialize all Edge fixes
if (isEdgeBrowser()) {
    console.log('🌐 Microsoft Edge browser detected');
    injectEdgeStyles();
    fixEdgeViewport();
    initializeEdgeFixes();
} else {
    console.log('🌐 Non-Edge browser detected, skipping Edge-specific fixes');
}

console.log('🌐 Edge Compatibility Script Loaded');
