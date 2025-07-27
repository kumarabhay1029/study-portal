/**
 * STUDY PORTAL - NOTES MANAGEMENT SYSTEM
 * Professional student notes upload, review, and sharing system
 * Features: Firebase Storage, Manual Admin Review, 10MB Limit
 */

class NotesManager {
    constructor() {
        this.storage = null;
        this.database = null;
        this.currentUser = null;
        this.notesPerPage = 12;
        this.currentPage = 0;
        this.allNotes = [];
        this.filteredNotes = [];
        
        // Add debounce timer for filtering
        this.filterTimeout = null;
        
        this.init();
    }

    async init() {
        try {
            console.log('🔥 Initializing Notes Manager...');
            // Set up event listeners first (independent of Firebase)
            this.setupEventListeners();
            // Try to initialize Firebase
            try {
                if (firebase.apps.length === 0) {
                    firebase.initializeApp(window.firebaseConfig);
                }
                this.storage = firebase.storage();
                this.database = firebase.firestore();
                // Load approved notes
                await this.loadApprovedNotes();
            } catch (firebaseError) {
                console.warn('⚠️ Firebase initialization failed, running in offline mode:', firebaseError);
                this.showMessage('Notes system running in offline mode. Upload functionality disabled.', 'warning');
                this.showOfflineContent();
            }
        } catch (error) {
            console.error('❌ Failed to initialize Notes Manager:', error);
            this.showMessage('Failed to initialize notes system', 'error');
        }
    }

    async downloadNote(noteId) {
        try {
            const note = this.allNotes.find(n => n.id === noteId);
            if (!note) {
                this.showMessage('Note not found', 'error');
                return;
            }

            // Start download immediately for better UX
            const link = document.createElement('a');
            link.href = note.fileUrl;
            link.download = note.fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Update UI immediately (optimistic update)
            note.downloadCount = (note.downloadCount || 0) + 1;
            this.updateDownloadCountInUI(noteId, note.downloadCount);

            // Update database asynchronously without waiting
            this.updateDownloadCountAsync(noteId);

            this.showMessage('Download started successfully', 'success');

        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showMessage('Download failed. Please try again.', 'error');
        }
    }

    // Async database update without blocking UI
    async updateDownloadCountAsync(noteId) {
        try {
            await this.database.collection('notes').doc(noteId).update({
                downloadCount: firebase.firestore.FieldValue.increment(1)
            });
        } catch (error) {
            console.warn('⚠️ Failed to update download count:', error);
        }
    }

    // Update UI without full re-render
    updateDownloadCountInUI(noteId, newCount) {
        const noteCard = document.querySelector(`[data-note-id="${noteId}"]`);
        if (noteCard) {
            const downloadCountElement = noteCard.querySelector('.note-meta span:last-child');
            if (downloadCountElement) {
                downloadCountElement.textContent = `📥 ${newCount} downloads`;
            }
        }
    }

    previewNote(noteId) {
        const note = this.allNotes.find(n => n.id === noteId);
        if (!note) {
            this.showMessage('Note not found', 'error');
            return;
        }

        // Open PDF in new tab for preview
        window.open(note.fileUrl, '_blank');
    }

    filterNotes() {
        // Clear existing timeout
        if (this.filterTimeout) {
            clearTimeout(this.filterTimeout);
        }
        
        // Debounce filtering to prevent excessive re-rendering
        this.filterTimeout = setTimeout(() => {
            const subjectFilter = document.getElementById('filterSubject')?.value;
            const semesterFilter = document.getElementById('filterSemester')?.value;
            const categoryFilter = document.getElementById('filterCategory')?.value;

            this.filteredNotes = this.allNotes.filter(note => {
                const matchSubject = !subjectFilter || note.subject === subjectFilter;
                const matchSemester = !semesterFilter || note.semester.toString() === semesterFilter;
                const matchCategory = !categoryFilter || note.category === categoryFilter;

                return matchSubject && matchSemester && matchCategory;
            });

            this.currentPage = 0;
            this.renderNotes();
        }, 150); // 150ms debounce
    }

    loadMoreNotes() {
        this.currentPage++;
        this.renderNotes();
    }

    clearForm() {
        const form = document.getElementById('notesUploadForm');
        if (form) {
            form.reset();
            
            // Clear file info
            const fileInfo = document.getElementById('fileInfo');
            // moved inside method body if needed
            if (fileInfo) fileInfo.style.display = 'none';
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
            
            // Clear character count
            // moved inside method body if needed
            if (charCount) charCount.textContent = '0';
            
            // Clear any field errors
            // moved inside method body if needed
            errors.forEach(error => error.remove());
        }
    }

    checkAdminStatus() {
        // Simple admin check - in production, use proper authentication
        const isAdmin = localStorage.getItem('isAdmin') === 'true' || 
                       window.location.hash.includes('admin=true');
        
        if (isAdmin) {
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) {
                adminPanel.style.display = 'block';
                this.loadPendingNotes();
            }
        }
    }

    async loadPendingNotes() {
        try {
            const pendingSnapshot = await this.database
                .collection('notes')
                .where('status', '==', 'pending')
                .orderBy('uploadDate', 'desc')
                .get();

            const pendingNotes = pendingSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.renderPendingNotes(pendingNotes);

        } catch (error) {
            console.error('❌ Failed to load pending notes:', error);
        }
    }

    renderPendingNotes(notes) {
        const pendingContainer = document.getElementById('pendingNotes');
        if (!pendingContainer) return;

        pendingContainer.innerHTML = '';

        if (notes.length === 0) {
            pendingContainer.innerHTML = '<p>No notes pending review.</p>';
            return;
        }

        notes.forEach(note => {
            const noteCard = document.createElement('div');
            noteCard.className = 'pending-note-card';
            noteCard.innerHTML = `
                <h4>${this.escapeHtml(note.title)}</h4>
                <p><strong>Subject:</strong> ${note.subject}</p>
                <p><strong>Semester:</strong> ${note.semester}</p>
                <p><strong>Category:</strong> ${note.category}</p>
                <p><strong>Description:</strong> ${this.escapeHtml(note.description)}</p>
                <p><strong>Uploaded by:</strong> ${this.escapeHtml(note.uploaderName)}</p>
                <p><strong>File size:</strong> ${this.formatFileSize(note.fileSize)}</p>
                <div class="admin-actions">
                    <button class="approve-btn" onclick="notesManager.approveNote('${note.id}')">
                        ✅ Approve
                    </button>
                    <button class="reject-btn" onclick="notesManager.rejectNote('${note.id}')">
                        ❌ Reject
                    </button>
                    <button class="note-preview" onclick="window.open('${note.fileUrl}', '_blank')">
                        👁️ Preview
                    </button>
                </div>
            `;
            pendingContainer.appendChild(noteCard);
        });
    }

    async approveNote(noteId) {
        try {
            await this.database.collection('notes').doc(noteId).update({
                status: 'approved',
                approvedDate: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showMessage('Note approved successfully', 'success');
            this.loadPendingNotes();
            this.loadApprovedNotes();

        } catch (error) {
            console.error('❌ Failed to approve note:', error);
            this.showMessage('Failed to approve note', 'error');
        }
    }

    async rejectNote(noteId) {
        const reason = prompt('Enter rejection reason (optional):');
        
        try {
            await this.database.collection('notes').doc(noteId).update({
                status: 'rejected',
                rejectionReason: reason || 'No reason provided',
                rejectedDate: firebase.firestore.FieldValue.serverTimestamp()
            });

            this.showMessage('Note rejected', 'warning');
            this.loadPendingNotes();

        } catch (error) {
            console.error('❌ Failed to reject note:', error);
            this.showMessage('Failed to reject note', 'error');
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showMessage(message, type = 'info') {
        const messagesContainer = document.getElementById('statusMessages');
        if (!messagesContainer) {
            console.log(`${type.toUpperCase()}: ${message}`);
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `status-message ${type}`;
        messageDiv.innerHTML = `
            <p>${this.escapeHtml(message)}</p>
            <button onclick="this.parentElement.remove()" style="float: right; background: none; border: none; color: #fff; cursor: pointer;">×</button>
        `;

        messagesContainer.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    showOfflineContent() {
        // Show placeholder content when Firebase is not available
        const notesGrid = document.getElementById('notesGrid');
        const loadingElement = document.getElementById('loadingNotes');
        
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        if (notesGrid) {
            notesGrid.innerHTML = `
                <div class="offline-message" style="text-align: center; padding: 40px; background: rgba(255, 193, 7, 0.1); border: 1px solid rgba(255, 193, 7, 0.3); border-radius: 15px; margin: 20px 0;">
                    <div style="font-size: 3em; margin-bottom: 20px;">🔌</div>
                    <h3 style="color: #ffc107; margin-bottom: 15px;">Offline Mode</h3>
                    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 20px;">
                        The notes system is currently running in offline mode. Firebase services are not available.
                    </p>
                    <div style="background: rgba(255, 255, 255, 0.05); padding: 20px; border-radius: 10px; margin: 20px 0;">
                        <h4 style="color: #4fc3f7; margin-bottom: 15px;">📚 Sample Notes Categories</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div style="background: rgba(76, 175, 80, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(76, 175, 80, 0.2);">
                                <strong style="color: #4caf50;">Complete Notes</strong><br>
                                <small style="color: rgba(255, 255, 255, 0.7);">Full course materials</small>
                            </div>
                            <div style="background: rgba(33, 150, 243, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(33, 150, 243, 0.2);">
                                <strong style="color: #2196f3;">Chapter Summary</strong><br>
                                <small style="color: rgba(255, 255, 255, 0.7);">Key points & concepts</small>
                            </div>
                            <div style="background: rgba(156, 39, 176, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(156, 39, 176, 0.2);">
                                <strong style="color: #9c27b0;">Exam Preparation</strong><br>
                                <small style="color: rgba(255, 255, 255, 0.7);">Study guides & tips</small>
                            </div>
                            <div style="background: rgba(255, 152, 0, 0.1); padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 152, 0, 0.2);">
                                <strong style="color: #ff9800;">Quick Reference</strong><br>
                                <small style="color: rgba(255, 255, 255, 0.7);">Formulas & shortcuts</small>
                            </div>
                        </div>
                    </div>
                    <p style="color: rgba(255, 255, 255, 0.6); font-size: 0.9em;">
                        <strong>To enable full functionality:</strong><br>
                        • Check your internet connection<br>
                        • Refresh the page<br>
                        • Contact administrator if issue persists
                    </p>
                </div>
            `;
        }
        
        console.log('📋 Offline content displayed for notes section');
    }
}

// Global functions for HTML onclick handlers
function uploadNote() {
    if (window.notesManager) {
        window.notesManager.uploadNote();
    }
}

function clearForm() {
    if (window.notesManager) {
        window.notesManager.clearForm();
    }
}

function removeFile() {
    const fileInput = document.getElementById('noteFile');
    const fileInfo = document.getElementById('fileInfo');
    const uploadPlaceholder = document.querySelector('.upload-placeholder');
    
    if (fileInput) fileInput.value = '';
    if (fileInfo) fileInfo.style.display = 'none';
    if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
}

function filterNotes() {
    if (window.notesManager) {
        window.notesManager.filterNotes();
    }
}

function loadMoreNotes() {
    if (window.notesManager) {
        window.notesManager.loadMoreNotes();
    }
}

// Initialize notes manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.notesManager = new NotesManager();
});
