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
                
                console.log('🔥 Firebase initialized successfully');
                
                // Load approved notes
                await this.loadApprovedNotes();
                
                // Check if user is admin
                this.checkAdminStatus();
                
            } catch (firebaseError) {
                console.warn('⚠️ Firebase initialization failed, running in offline mode:', firebaseError);
                this.showMessage('Notes system running in offline mode. Upload functionality disabled.', 'warning');
                
                // Show placeholder content
                this.showOfflineContent();
            }
            
        } catch (error) {
            console.error('❌ Failed to initialize Notes Manager:', error);
            this.showMessage('Failed to initialize notes system', 'error');
            
            // Still set up basic event listeners
            this.setupEventListeners();
        }
    }

    setupEventListeners() {
        // File upload handling
        const fileInput = document.getElementById('noteFile');
        const fileUploadArea = document.getElementById('fileUploadArea');
        
        if (fileInput && fileUploadArea) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
            
            // Drag and drop functionality
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.style.borderColor = 'rgba(79, 195, 247, 0.8)';
            });
            
            fileUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                fileUploadArea.style.borderColor = 'rgba(79, 195, 247, 0.4)';
            });
            
            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                fileUploadArea.style.borderColor = 'rgba(79, 195, 247, 0.4)';
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    fileInput.files = files;
                    this.handleFileSelect({ target: { files } });
                }
            });
        }

        // Character count for description
        const descriptionField = document.getElementById('noteDescription');
        if (descriptionField) {
            descriptionField.addEventListener('input', () => {
                const charCount = document.getElementById('descCharCount');
                if (charCount) {
                    charCount.textContent = descriptionField.value.length;
                }
            });
        }

        // Form validation
        const form = document.getElementById('notesUploadForm');
        if (form) {
            const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
            inputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearFieldError(input));
            });
        }
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        const fileInfo = document.getElementById('fileInfo');
        const uploadPlaceholder = document.querySelector('.upload-placeholder');
        
        if (!file) {
            if (fileInfo) fileInfo.style.display = 'none';
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
            return;
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            this.showMessage('Please select a PDF file only', 'error');
            event.target.value = '';
            return;
        }

        // Validate file size (10MB = 10 * 1024 * 1024 bytes)
        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showMessage('File size must be less than 10MB', 'error');
            event.target.value = '';
            return;
        }

        // Show file info
        if (fileInfo && uploadPlaceholder) {
            const fileName = fileInfo.querySelector('.file-name');
            const fileSize = fileInfo.querySelector('.file-size');
            
            if (fileName) fileName.textContent = file.name;
            if (fileSize) fileSize.textContent = this.formatFileSize(file.size);
            
            uploadPlaceholder.style.display = 'none';
            fileInfo.style.display = 'flex';
        }

        this.showMessage('File selected successfully', 'success');
    }

    validateField(field) {
        const value = field.value.trim();
        let isValid = true;
        let message = '';

        // Clear previous errors
        this.clearFieldError(field);

        // Check required fields
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            message = 'This field is required';
        }

        // Specific validations
        switch (field.id) {
            case 'noteTitle':
                if (value && value.length < 5) {
                    isValid = false;
                    message = 'Title must be at least 5 characters';
                }
                break;
            case 'noteDescription':
                if (value && value.length < 20) {
                    isValid = false;
                    message = 'Description must be at least 20 characters';
                }
                break;
            case 'uploaderName':
                if (value && value.length < 2) {
                    isValid = false;
                    message = 'Name must be at least 2 characters';
                }
                break;
        }

        if (!isValid) {
            this.showFieldError(field, message);
        }

        return isValid;
    }

    showFieldError(field, message) {
        field.style.borderColor = '#f44336';
        field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';
        
        // Remove existing error message
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Add error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#f44336';
        errorDiv.style.fontSize = '0.85em';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '';
        field.style.boxShadow = '';
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    async uploadNote() {
        const uploadBtn = document.getElementById('uploadBtn');
        const form = document.getElementById('notesUploadForm');
        
        if (!form) {
            this.showMessage('Form not found', 'error');
            return;
        }

        // Disable upload button
        if (uploadBtn) {
            uploadBtn.disabled = true;
            uploadBtn.innerHTML = '<span class="btn-icon">⏳</span><span class="btn-text">Uploading...</span>';
        }

        try {
            // Validate form
            const formData = this.getFormData();
            if (!this.validateForm(formData)) {
                throw new Error('Please fill all required fields correctly');
            }

            // Upload file to Firebase Storage
            const fileUrl = await this.uploadFileToStorage(formData.file);
            
            // Save note metadata to Firestore
            await this.saveNoteMetadata({
                ...formData,
                fileUrl,
                status: 'pending',
                uploadDate: new Date(),
                downloadCount: 0
            });

            this.showMessage('Note submitted successfully! It will be reviewed within 24-48 hours.', 'success');
            this.clearForm();

        } catch (error) {
            console.error('❌ Upload failed:', error);
            this.showMessage(error.message || 'Upload failed. Please try again.', 'error');
        } finally {
            // Re-enable upload button
            if (uploadBtn) {
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = '<span class="btn-icon">📤</span><span class="btn-text">Submit for Review</span>';
            }
        }
    }

    getFormData() {
        return {
            title: document.getElementById('noteTitle')?.value.trim(),
            subject: document.getElementById('noteSubject')?.value,
            semester: document.getElementById('noteSemester')?.value,
            category: document.getElementById('noteCategory')?.value,
            description: document.getElementById('noteDescription')?.value.trim(),
            uploaderName: document.getElementById('uploaderName')?.value.trim() || 'Anonymous',
            file: document.getElementById('noteFile')?.files[0]
        };
    }

    validateForm(formData) {
        const required = ['title', 'subject', 'semester', 'category', 'description', 'file'];
        
        for (const field of required) {
            if (!formData[field]) {
                this.showMessage(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`, 'error');
                return false;
            }
        }

        if (formData.title.length < 5) {
            this.showMessage('Title must be at least 5 characters', 'error');
            return false;
        }

        if (formData.description.length < 20) {
            this.showMessage('Description must be at least 20 characters', 'error');
            return false;
        }

        if (formData.file.type !== 'application/pdf') {
            this.showMessage('Only PDF files are allowed', 'error');
            return false;
        }

        if (formData.file.size > 10 * 1024 * 1024) {
            this.showMessage('File size must be less than 10MB', 'error');
            return false;
        }

        return true;
    }

    async uploadFileToStorage(file) {
        const progressElement = document.getElementById('uploadProgress');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        if (progressElement) progressElement.style.display = 'block';

        return new Promise((resolve, reject) => {
            const fileName = `notes/${Date.now()}_${file.name}`;
            const storageRef = this.storage.ref(fileName);
            const uploadTask = storageRef.put(file);

            uploadTask.on('state_changed',
                (snapshot) => {
                    // Progress monitoring
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    if (progressFill) progressFill.style.width = progress + '%';
                    if (progressText) progressText.textContent = Math.round(progress) + '%';
                },
                (error) => {
                    console.error('❌ Upload error:', error);
                    if (progressElement) progressElement.style.display = 'none';
                    reject(error);
                },
                async () => {
                    // Upload completed
                    try {
                        const downloadURL = await uploadTask.snapshot.ref.getDownloadURL();
                        if (progressElement) progressElement.style.display = 'none';
                        resolve(downloadURL);
                    } catch (error) {
                        reject(error);
                    }
                }
            );
        });
    }

    async saveNoteMetadata(noteData) {
        try {
            await this.database.collection('notes').add({
                title: noteData.title,
                subject: noteData.subject,
                semester: parseInt(noteData.semester),
                category: noteData.category,
                description: noteData.description,
                uploaderName: noteData.uploaderName,
                fileUrl: noteData.fileUrl,
                fileName: noteData.file.name,
                fileSize: noteData.file.size,
                status: noteData.status,
                uploadDate: firebase.firestore.FieldValue.serverTimestamp(),
                approvedDate: null,
                downloadCount: 0,
                tags: this.extractTags(noteData.title + ' ' + noteData.description)
            });
            
            console.log('✅ Note metadata saved successfully');
        } catch (error) {
            console.error('❌ Failed to save note metadata:', error);
            throw error;
        }
    }

    extractTags(text) {
        // Simple tag extraction from title and description
        const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 2 && !commonWords.includes(word));
        
        return [...new Set(words)].slice(0, 10); // Unique words, max 10
    }

    async loadApprovedNotes() {
        const loadingElement = document.getElementById('loadingNotes');
        const notesGrid = document.getElementById('notesGrid');
        
        try {
            if (loadingElement) loadingElement.style.display = 'block';
            
            const notesSnapshot = await this.database
                .collection('notes')
                .where('status', '==', 'approved')
                .orderBy('approvedDate', 'desc')
                .limit(this.notesPerPage)
                .get();

            this.allNotes = notesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.filteredNotes = [...this.allNotes];
            this.renderNotes();
            
        } catch (error) {
            console.error('❌ Failed to load notes:', error);
            this.showMessage('Failed to load notes', 'error');
        } finally {
            if (loadingElement) loadingElement.style.display = 'none';
        }
    }

    renderNotes() {
        const notesGrid = document.getElementById('notesGrid');
        const loadMoreBtn = document.getElementById('loadMoreBtn');
        
        if (!notesGrid) return;

        // Clear existing notes (except loading)
        const existingNotes = notesGrid.querySelectorAll('.note-card');
        existingNotes.forEach(note => note.remove());

        if (this.filteredNotes.length === 0) {
            notesGrid.innerHTML += '<div class="no-notes"><p>No notes found matching your criteria.</p></div>';
            if (loadMoreBtn) loadMoreBtn.style.display = 'none';
            return;
        }

        // Render notes
        const notesToShow = this.filteredNotes.slice(0, (this.currentPage + 1) * this.notesPerPage);
        
        notesToShow.forEach(note => {
            const noteCard = this.createNoteCard(note);
            notesGrid.appendChild(noteCard);
        });

        // Show/hide load more button
        if (loadMoreBtn) {
            loadMoreBtn.style.display = notesToShow.length < this.filteredNotes.length ? 'block' : 'none';
        }
    }

    createNoteCard(note) {
        const card = document.createElement('div');
        card.className = 'note-card';
        card.onclick = () => this.previewNote(note);

        const uploadDate = note.approvedDate ? new Date(note.approvedDate.seconds * 1000) : new Date();
        
        card.innerHTML = `
            <div class="note-card-header">
                <h4 class="note-title">${this.escapeHtml(note.title)}</h4>
                <span class="note-subject">${note.subject}</span>
            </div>
            <div class="note-meta">
                <span>📅 Semester ${note.semester}</span>
                <span>🏷️ ${note.category.replace('-', ' ')}</span>
                <span>📥 ${note.downloadCount || 0} downloads</span>
            </div>
            <p class="note-description">${this.escapeHtml(note.description)}</p>
            <div class="note-footer">
                <span class="note-author">👤 ${this.escapeHtml(note.uploaderName)}</span>
                <div class="note-actions">
                    <button class="note-preview" onclick="event.stopPropagation(); notesManager.previewNote('${note.id}')">
                        👁️ Preview
                    </button>
                    <button class="note-download" onclick="event.stopPropagation(); notesManager.downloadNote('${note.id}')">
                        📥 Download
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    async downloadNote(noteId) {
        try {
            const note = this.allNotes.find(n => n.id === noteId);
            if (!note) {
                this.showMessage('Note not found', 'error');
                return;
            }

            // Increment download count
            await this.database.collection('notes').doc(noteId).update({
                downloadCount: firebase.firestore.FieldValue.increment(1)
            });

            // Create download link
            const link = document.createElement('a');
            link.href = note.fileUrl;
            link.download = note.fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            this.showMessage('Download started successfully', 'success');

            // Update local data
            note.downloadCount = (note.downloadCount || 0) + 1;
            this.renderNotes();

        } catch (error) {
            console.error('❌ Download failed:', error);
            this.showMessage('Download failed. Please try again.', 'error');
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
            const uploadPlaceholder = document.querySelector('.upload-placeholder');
            if (fileInfo) fileInfo.style.display = 'none';
            if (uploadPlaceholder) uploadPlaceholder.style.display = 'block';
            
            // Clear character count
            const charCount = document.getElementById('descCharCount');
            if (charCount) charCount.textContent = '0';
            
            // Clear any field errors
            const errors = form.querySelectorAll('.field-error');
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
