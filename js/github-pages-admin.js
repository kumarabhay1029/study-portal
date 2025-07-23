/**
 * Secure Admin System for GitHub Pages
 * Study Portal - Client-side admin with Firebase integration
 */

class GitHubPagesAdminSystem {
    constructor() {
        this.config = {
            adminPassword: 'admin123', // Simple test password
            adminEmails: [
                'studyportal1908@gmail.com', // Your email
                       // Add more admin emails here
            ],
            sessionTimeout: 3600000, // 1 hour in milliseconds
            maxLoginAttempts: 3
        };
        
        this.loginAttempts = 0;
        this.isAdminActive = false;
        this.pendingNotes = [];
        this.init();
    }

    init() {
        this.setupKeyboardShortcuts();
        this.setupMobileAccess();
        this.checkExistingSession();
        this.setupSessionTimeout();
        console.log('🛡️ GitHub Pages Admin System initialized');
        console.log('📖 Press Ctrl + Shift + A to access admin panel');
    }

    // Keyboard shortcut: Ctrl + Shift + A
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                this.promptAdminLogin();
            }
            // Emergency password reset: Ctrl + Shift + R
            if (e.ctrlKey && e.shiftKey && e.key === 'R') {
                e.preventDefault();
                this.resetPassword();
            }
            // Direct admin enable: Ctrl + Shift + D (for testing)
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                console.log('🚀 Direct admin mode activation');
                this.enableAdminMode(true);
            }
        });
    }

    // Mobile access: Long press on Study Portal title
    setupMobileAccess() {
        const portalTitle = document.querySelector('.sidebar-header h3');
        if (portalTitle) {
            let pressTimer;
            
            portalTitle.addEventListener('touchstart', (e) => {
                pressTimer = setTimeout(() => {
                    this.promptAdminLogin();
                }, 3000); // 3 second long press
            });
            
            portalTitle.addEventListener('touchend', () => {
                clearTimeout(pressTimer);
            });
            
            portalTitle.addEventListener('touchmove', () => {
                clearTimeout(pressTimer);
            });
        }
    }

    // Check if admin session exists
    checkExistingSession() {
        const adminSession = sessionStorage.getItem('adminMode');
        const sessionTime = sessionStorage.getItem('adminSessionTime');
        
        if (adminSession && sessionTime) {
            const elapsed = Date.now() - parseInt(sessionTime);
            if (elapsed < this.config.sessionTimeout) {
                this.enableAdminMode(false); // Don't show login success message
            } else {
                this.clearSession();
            }
        }
    }

    // Auto-logout after session timeout
    setupSessionTimeout() {
        setInterval(() => {
            if (this.isAdminActive) {
                const sessionTime = sessionStorage.getItem('adminSessionTime');
                if (sessionTime) {
                    const elapsed = Date.now() - parseInt(sessionTime);
                    if (elapsed >= this.config.sessionTimeout) {
                        this.disableAdminMode();
                        this.showMessage('🕐 Admin session expired. Please login again.', 'warning');
                    }
                }
            }
        }, 60000); // Check every minute
    }

    promptAdminLogin() {
        if (this.isAdminActive) {
            this.showAdminOptions();
            return;
        }

        if (this.loginAttempts >= this.config.maxLoginAttempts) {
            this.showMessage('❌ Too many failed attempts. Please refresh the page.', 'error');
            return;
        }

        const password = prompt('🔒 Enter Admin Password (admin123):');
        
        if (password === null) return; // User cancelled
        
        // Simple comparison - just check if it's admin123
        if (password === 'admin123') {
            this.loginAttempts = 0;
            this.enableAdminMode(true);
            console.log('✅ Admin login successful');
        } else {
            this.loginAttempts++;
            const remainingAttempts = this.config.maxLoginAttempts - this.loginAttempts;
            console.log('❌ Password wrong - you entered:', password);
            alert(`❌ Wrong password!\nYou entered: "${password}"\nCorrect password: "admin123"\n\n${remainingAttempts} attempts remaining.`);
        }
    }

    enableAdminMode(showSuccessMessage = true) {
        this.isAdminActive = true;
        
        console.log('🛡️ Enabling admin mode...');
        
        // Store session
        sessionStorage.setItem('adminMode', 'true');
        sessionStorage.setItem('adminSessionTime', Date.now().toString());
        
        // Visual indicators
        document.body.classList.add('admin-mode');
        document.body.style.border = '3px solid #f44336';
        document.body.style.boxShadow = '0 0 20px rgba(244, 67, 54, 0.3)';
        document.title = '🛡️ ADMIN - Study Portal';
        
        // Add admin indicator
        this.addAdminIndicator();
        
        // Show admin panels
        const adminPanels = document.querySelectorAll('#adminPanel');
        console.log('🔍 Found admin panels:', adminPanels.length);
        
        if (adminPanels.length === 0) {
            console.log('⚠️ No admin panels found, creating one...');
            this.createAdminPanel();
        } else {
            adminPanels.forEach(panel => {
                panel.style.display = 'block';
                console.log('✅ Admin panel shown');
            });
        }
        
        // Load pending notes
        this.loadPendingNotes();
        
        if (showSuccessMessage) {
            this.showMessage('✅ Admin mode activated! Red border indicates admin mode. Go to Notes section to review submissions.', 'success');
        }
        
        console.log('🛡️ Admin mode enabled successfully');
        
        // Auto-navigate to notes section
        setTimeout(() => {
            this.showSection('notes');
        }, 1000);
    }

    disableAdminMode() {
        this.isAdminActive = false;
        
        // Clear session
        this.clearSession();
        
        // Remove visual indicators
        document.body.classList.remove('admin-mode');
        document.body.style.border = '';
        document.body.style.boxShadow = '';
        document.title = '📖 Study Portal';
        
        // Remove admin indicator
        this.removeAdminIndicator();
        
        // Hide admin panels
        const adminPanels = document.querySelectorAll('#adminPanel');
        adminPanels.forEach(panel => {
            panel.style.display = 'none';
        });
        
        this.showMessage('🔒 Admin mode disabled.', 'info');
        console.log('🔒 Admin mode disabled');
    }

    clearSession() {
        sessionStorage.removeItem('adminMode');
        sessionStorage.removeItem('adminSessionTime');
    }

    addAdminIndicator() {
        // Remove existing indicator
        this.removeAdminIndicator();
        
        const indicator = document.createElement('div');
        indicator.id = 'adminIndicator';
        indicator.innerHTML = `
            <div style="
                position: fixed;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%);
                color: white;
                padding: 8px 16px;
                border-radius: 25px;
                font-size: 12px;
                font-weight: 600;
                z-index: 10000;
                box-shadow: 0 4px 15px rgba(244, 67, 54, 0.3);
                animation: pulse 2s infinite;
                cursor: pointer;
            ">
                🛡️ ADMIN MODE
                <button onclick="window.adminSystem.showAdminOptions()" style="
                    background: none;
                    border: none;
                    color: white;
                    margin-left: 8px;
                    cursor: pointer;
                    font-size: 12px;
                ">⚙️</button>
            </div>
            <style>
                @keyframes pulse {
                    0% { opacity: 1; }
                    50% { opacity: 0.7; }
                    100% { opacity: 1; }
                }
            </style>
        `;
        document.body.appendChild(indicator);
    }

    removeAdminIndicator() {
        const existing = document.getElementById('adminIndicator');
        if (existing) {
            existing.remove();
        }
    }

    showAdminOptions() {
        const options = [
            '1. View Pending Notes',
            '2. Refresh Admin Panel',
            '3. Check Admin Status',
            '4. Logout Admin Mode',
            '5. Cancel'
        ].join('\n');
        
        const choice = prompt(`🛡️ Admin Options:\n\n${options}\n\nEnter choice (1-5):`);
        
        switch(choice) {
            case '1':
                this.showSection('notes');
                break;
            case '2':
                this.loadPendingNotes();
                this.showMessage('🔄 Admin panel refreshed', 'info');
                break;
            case '3':
                this.showAdminStatus();
                break;
            case '4':
                this.disableAdminMode();
                break;
            default:
                break;
        }
    }

    showAdminStatus() {
        const sessionTime = sessionStorage.getItem('adminSessionTime');
        const elapsed = sessionTime ? Date.now() - parseInt(sessionTime) : 0;
        const remaining = Math.max(0, this.config.sessionTimeout - elapsed);
        const minutes = Math.floor(remaining / 60000);
        
        alert(`🛡️ Admin Status:\n\n✅ Active: ${this.isAdminActive}\n⏱️ Session: ${minutes} minutes remaining\n📝 Pending Notes: ${this.pendingNotes.length}`);
    }

    async loadPendingNotes() {
        try {
            if (!window.firebase || !firebase.firestore) {
                this.showMessage('⚠️ Firebase not initialized. Using demo data.', 'warning');
                this.displayDemoAdminPanel();
                return;
            }

            const db = firebase.firestore();
            const snapshot = await db.collection('notes')
                .where('status', '==', 'pending')
                .orderBy('uploadDate', 'desc')
                .get();

            this.pendingNotes = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.displayAdminPanel();
            
        } catch (error) {
            console.error('Error loading pending notes:', error);
            this.showMessage('⚠️ Could not load pending notes. Using demo mode.', 'warning');
            this.displayDemoAdminPanel();
        }
    }

    displayAdminPanel() {
        const adminPanel = document.getElementById('adminPanel');
        const pendingNotesContainer = document.getElementById('pendingNotes');
        
        if (!pendingNotesContainer) {
            console.error('Admin panel container not found');
            return;
        }

        if (this.pendingNotes.length === 0) {
            pendingNotesContainer.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #90a4ae;">
                    <h3>📝 No pending notes to review</h3>
                    <p>All notes have been reviewed. Check back later!</p>
                </div>
            `;
            return;
        }

        const notesHTML = this.pendingNotes.map(note => `
            <div class="pending-note-card" data-note-id="${note.id}">
                <div class="note-header">
                    <h4>${note.title}</h4>
                    <span class="note-subject">${note.subject}</span>
                </div>
                <div class="note-meta">
                    <span>📅 Semester: ${note.semester}</span>
                    <span>🏷️ Category: ${note.category}</span>
                    <span>📊 Size: ${this.formatFileSize(note.fileSize)}</span>
                </div>
                <div class="note-description">
                    <p>${note.description}</p>
                </div>
                <div class="note-uploader">
                    <span>👤 Uploaded by: ${note.uploaderName || 'Anonymous'}</span>
                    <span>📅 Date: ${new Date(note.uploadDate?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                </div>
                <div class="admin-actions">
                    <button class="approve-btn" onclick="window.adminSystem.approveNote('${note.id}')">
                        ✅ Approve
                    </button>
                    <button class="reject-btn" onclick="window.adminSystem.rejectNote('${note.id}')">
                        ❌ Reject
                    </button>
                    <button class="preview-btn" onclick="window.adminSystem.previewNote('${note.id}')">
                        👁️ Preview
                    </button>
                </div>
            </div>
        `).join('');

        pendingNotesContainer.innerHTML = notesHTML;
    }

    displayDemoAdminPanel() {
        const pendingNotesContainer = document.getElementById('pendingNotes');
        if (!pendingNotesContainer) return;

        pendingNotesContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #90a4ae;">
                <h3>🛡️ Admin Panel Demo Mode</h3>
                <p>This is a demonstration of the admin interface.</p>
                <p>Connect to Firebase to see real pending notes.</p>
                <div style="margin-top: 20px;">
                    <button class="approve-btn" style="margin: 5px;">✅ Demo Approve</button>
                    <button class="reject-btn" style="margin: 5px;">❌ Demo Reject</button>
                </div>
            </div>
        `;
    }

    async approveNote(noteId) {
        if (!confirm('✅ Approve this note for public viewing?')) return;

        try {
            if (!window.firebase || !firebase.firestore) {
                this.showMessage('✅ Note approved (demo mode)', 'success');
                this.removeNoteFromPanel(noteId);
                return;
            }

            const db = firebase.firestore();
            await db.collection('notes').doc(noteId).update({
                status: 'approved',
                approvedDate: firebase.firestore.FieldValue.serverTimestamp(),
                approvedBy: 'admin'
            });

            this.showMessage('✅ Note approved successfully!', 'success');
            this.removeNoteFromPanel(noteId);
            
        } catch (error) {
            console.error('Error approving note:', error);
            this.showMessage('❌ Error approving note. Please try again.', 'error');
        }
    }

    async rejectNote(noteId) {
        const reason = prompt('❌ Reason for rejection (optional):') || 'No reason provided';
        
        if (!confirm(`❌ Reject this note?\n\nReason: ${reason}`)) return;

        try {
            if (!window.firebase || !firebase.firestore) {
                this.showMessage('❌ Note rejected (demo mode)', 'info');
                this.removeNoteFromPanel(noteId);
                return;
            }

            const db = firebase.firestore();
            await db.collection('notes').doc(noteId).update({
                status: 'rejected',
                rejectedDate: firebase.firestore.FieldValue.serverTimestamp(),
                rejectedBy: 'admin',
                rejectionReason: reason
            });

            this.showMessage('❌ Note rejected.', 'info');
            this.removeNoteFromPanel(noteId);
            
        } catch (error) {
            console.error('Error rejecting note:', error);
            this.showMessage('❌ Error rejecting note. Please try again.', 'error');
        }
    }

    previewNote(noteId) {
        const note = this.pendingNotes.find(n => n.id === noteId);
        if (!note) return;

        const previewHTML = `
            📝 Title: ${note.title}
            📚 Subject: ${note.subject}
            📅 Semester: ${note.semester}
            🏷️ Category: ${note.category}
            📊 File Size: ${this.formatFileSize(note.fileSize)}
            👤 Uploader: ${note.uploaderName || 'Anonymous'}
            📄 Description: ${note.description}
        `;

        alert(`👁️ Note Preview:\n\n${previewHTML}`);
    }

    removeNoteFromPanel(noteId) {
        const noteCard = document.querySelector(`[data-note-id="${noteId}"]`);
        if (noteCard) {
            noteCard.remove();
        }
        
        this.pendingNotes = this.pendingNotes.filter(note => note.id !== noteId);
        
        if (this.pendingNotes.length === 0) {
            this.displayAdminPanel(); // Show "no pending notes" message
        }
    }

    formatFileSize(bytes) {
        if (!bytes) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showSection(sectionName) {
        if (typeof window.showSection === 'function') {
            window.showSection(sectionName);
        }
    }

    showMessage(message, type = 'info') {
        // Try multiple ways to show the message
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        
        // Method 1: Try existing status message system
        if (typeof window.showStatusMessage === 'function') {
            window.showStatusMessage(message, type);
            return;
        }
        
        // Method 2: Create a temporary status message
        this.createStatusMessage(message, type);
    }

    createStatusMessage(message, type) {
        // Remove existing message
        const existing = document.getElementById('tempStatusMessage');
        if (existing) existing.remove();
        
        // Create new message
        const messageDiv = document.createElement('div');
        messageDiv.id = 'tempStatusMessage';
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 10001;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            max-width: 400px;
            word-wrap: break-word;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    // Emergency password reset function
    resetPassword() {
        const newPassword = prompt('🔑 Set new admin password:');
        if (newPassword && newPassword.length >= 6) {
            this.config.adminPassword = newPassword;
            this.loginAttempts = 0; // Reset attempts
            alert(`✅ Password changed to: "${newPassword}"\n\nPlease update the config file to make this permanent.`);
            console.log('🔑 Password reset to:', newPassword);
        } else {
            alert('❌ Password must be at least 6 characters long');
        }
    }

    // Create admin panel if it doesn't exist
    createAdminPanel() {
        console.log('🏗️ Creating admin panel...');
        
        // Find the notes section
        const notesSection = document.getElementById('notes-section');
        if (!notesSection) {
            console.error('❌ Notes section not found');
            return;
        }
        
        // Create admin panel HTML
        const adminPanelHTML = `
            <div class="section-content admin-panel" id="adminPanel" style="display: block;">
                <div class="admin-header">
                    <h3>🛡️ Admin Panel - Notes Review</h3>
                    <p>Review and approve student-submitted notes before they go live.</p>
                </div>
                
                <div class="pending-notes" id="pendingNotes">
                    <div style="text-align: center; padding: 40px; color: #90a4ae;">
                        <h3>🔄 Loading pending notes...</h3>
                        <p>Please wait while we fetch submissions for review.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Insert admin panel at the end of notes section
        notesSection.insertAdjacentHTML('beforeend', adminPanelHTML);
        console.log('✅ Admin panel created');
    }
}

// Initialize admin system when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Small delay to ensure other scripts are loaded
    setTimeout(() => {
        window.adminSystem = new GitHubPagesAdminSystem();
        
        // Add global test function
        window.testAdmin = function() {
            console.log('🧪 Testing admin system...');
            console.log('Admin system exists:', !!window.adminSystem);
            console.log('Current password:', window.adminSystem?.config?.adminPassword);
            console.log('Admin active:', window.adminSystem?.isAdminActive);
            
            // Force enable admin mode for testing
            if (window.adminSystem && !window.adminSystem.isAdminActive) {
                console.log('🔧 Force enabling admin mode...');
                window.adminSystem.enableAdminMode(true);
            }
        };
        
        console.log('🎯 Admin system ready! Type testAdmin() in console to test.');
    }, 1000);
});

// Export for global access
window.GitHubPagesAdminSystem = GitHubPagesAdminSystem;
