/**
 * GOOGLE APPS SCRIPT API INTEGRATION
 * Direct integration with Google Apps Script for Study Portal
 */

class GoogleScriptAPI {
    constructor() {
        // Your Google Apps Script URL
        this.scriptUrl = 'https://script.google.com/macros/s/AKfycbzgBpyTiHdU3blodWcJfVBgMgQDWjoelY5Jjb1LXKCEM-ubgmUpXBea8eZm_9JoyYkv/exec';
        
        // Form configurations
        this.formConfigs = {
            notes: {
                free: { type: 'notes', tier: 'free', maxSize: 10 * 1024 * 1024 }, // 10MB
                premium: { type: 'notes', tier: 'premium', maxSize: 50 * 1024 * 1024 } // 50MB
            },
            assignments: { type: 'assignments', tier: 'standard', maxSize: 25 * 1024 * 1024 }, // 25MB
            projects: { type: 'projects', tier: 'standard', maxSize: 100 * 1024 * 1024 }, // 100MB
            research: { type: 'research', tier: 'premium', maxSize: 50 * 1024 * 1024 } // 50MB
        };
        
        this.init();
    }
    
    init() {
        console.log('🚀 Google Script API initialized');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Form submission handlers
        document.addEventListener('submit', (e) => {
            if (e.target.classList.contains('script-form')) {
                e.preventDefault();
                this.handleFormSubmission(e.target);
            }
        });
        
        // File upload handlers
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.classList.contains('file-input')) {
                this.handleFileSelection(e.target);
            }
        });
        
        // Close button handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-form')) {
                const formContainer = e.target.closest('.form-container');
                if (formContainer) {
                    this.closeForm(formContainer.id);
                }
            }
        });
    }
    
    // Main form submission handler
    async handleFormSubmission(form) {
        const formData = new FormData(form);
        const submissionType = form.dataset.type;
        const config = this.getFormConfig(submissionType);
        
        try {
            this.showMessage('📤 Submitting your content...', 'info');
            this.setFormLoading(form, true);
            
            // Validate form data
            const validation = this.validateFormData(formData, config);
            if (!validation.valid) {
                throw new Error(validation.message);
            }
            
            // Prepare submission data
            const submissionData = await this.prepareSubmissionData(formData, config);
            
            // Submit to Google Apps Script
            const response = await this.submitToGoogleScript(submissionData);
            
            if (response.success) {
                this.showMessage('✅ Content submitted successfully! We\'ll review it soon.', 'success');
                this.resetForm(form);
                this.closeForm(form.closest('.form-container').id);
            } else {
                throw new Error(response.message || 'Submission failed');
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            this.showMessage(`❌ Error: ${error.message}`, 'error');
        } finally {
            this.setFormLoading(form, false);
        }
    }
    
    // Get form configuration
    getFormConfig(type) {
        const parts = type.split('-');
        const mainType = parts[0];
        const tier = parts[1] || 'standard';
        
        if (mainType === 'notes') {
            return this.formConfigs.notes[tier] || this.formConfigs.notes.free;
        }
        
        return this.formConfigs[mainType] || this.formConfigs.assignments;
    }
    
    // Validate form data
    validateFormData(formData, config) {
        const title = formData.get('title');
        const description = formData.get('description');
        const subject = formData.get('subject');
        const name = formData.get('name');
        const email = formData.get('email');
        const files = formData.getAll('files');
        
        // Required field validation
        if (!title || title.trim().length < 3) {
            return { valid: false, message: 'Title must be at least 3 characters long' };
        }
        
        if (!description || description.trim().length < 10) {
            return { valid: false, message: 'Description must be at least 10 characters long' };
        }
        
        if (!subject) {
            return { valid: false, message: 'Please select a subject' };
        }
        
        if (!name || name.trim().length < 2) {
            return { valid: false, message: 'Please enter your full name' };
        }
        
        if (!email || !this.isValidEmail(email)) {
            return { valid: false, message: 'Please enter a valid email address' };
        }
        
        // File validation
        if (files.length === 0) {
            return { valid: false, message: 'Please select at least one file to upload' };
        }
        
        for (let file of files) {
            if (file.size > config.maxSize) {
                const maxSizeMB = Math.round(config.maxSize / (1024 * 1024));
                return { valid: false, message: `File "${file.name}" is too large. Maximum size is ${maxSizeMB}MB` };
            }
        }
        
        return { valid: true };
    }
    
    // Email validation
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // Prepare submission data
    async prepareSubmissionData(formData, config) {
        const files = formData.getAll('files');
        const fileData = [];
        
        // Convert files to base64
        for (let file of files) {
            const base64 = await this.fileToBase64(file);
            fileData.push({
                name: file.name,
                type: file.type,
                size: file.size,
                data: base64
            });
        }
        
        return {
            type: config.type,
            tier: config.tier,
            title: formData.get('title'),
            description: formData.get('description'),
            subject: formData.get('subject'),
            name: formData.get('name'),
            email: formData.get('email'),
            files: fileData,
            timestamp: new Date().toISOString(),
            paymentReference: formData.get('paymentReference') || null
        };
    }
    
    // Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
        });
    }
    
    // Submit to Google Apps Script
    async submitToGoogleScript(data) {
        const response = await fetch(this.scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
    
    // Handle file selection
    handleFileSelection(input) {
        const files = Array.from(input.files);
        const preview = input.parentElement.querySelector('.file-preview');
        
        if (preview) {
            preview.innerHTML = '';
            
            files.forEach((file, index) => {
                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                    <button type="button" class="remove-file" onclick="removeFile(${index})">×</button>
                `;
                preview.appendChild(fileItem);
            });
        }
    }
    
    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Form management functions
    openForm(type) {
        const container = document.getElementById(`${type}-form-container`);
        if (container) {
            container.style.display = 'block';
            container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            this.showMessage(`📝 ${type.charAt(0).toUpperCase() + type.slice(1)} submission form opened!`, 'info');
        }
    }
    
    closeForm(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
            this.showMessage('📋 Form closed.', 'info');
        }
    }
    
    // Form state management
    setFormLoading(form, loading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        const inputs = form.querySelectorAll('input, textarea, select, button');
        
        if (loading) {
            submitBtn.innerHTML = '<span class="loading-spinner"></span> Submitting...';
            inputs.forEach(input => input.disabled = true);
        } else {
            submitBtn.innerHTML = submitBtn.dataset.originalText || 'Submit';
            inputs.forEach(input => input.disabled = false);
        }
    }
    
    resetForm(form) {
        form.reset();
        const preview = form.querySelector('.file-preview');
        if (preview) {
            preview.innerHTML = '';
        }
    }
    
    // Tab switching
    showContentTab(section, tabName) {
        const allTabs = document.querySelectorAll(`#${section}-section .tab-content`);
        const allBtns = document.querySelectorAll(`#${section}-section .tab-btn`);
        
        allTabs.forEach(tab => tab.classList.remove('active'));
        allBtns.forEach(btn => btn.classList.remove('active'));
        
        const selectedTab = document.getElementById(`${section}-${tabName}-tab`);
        const selectedBtn = document.querySelector(`#${section}-section .tab-btn[onclick*="${tabName}"]`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedBtn) selectedBtn.classList.add('active');
    }
    
    // Message system
    showMessage(message, type = 'info') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <span class="message-text">${message}</span>
            <button class="message-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }
}

// Initialize API
let googleScriptAPI;

// Global functions for HTML onclick events
function openNotesForm() {
    googleScriptAPI?.openForm('notes-free');
}

function openPremiumNotesForm() {
    googleScriptAPI?.openForm('notes-premium');
}

function openAssignmentForm() {
    googleScriptAPI?.openForm('assignments');
}

function openProjectForm() {
    googleScriptAPI?.openForm('projects');
}

function openResearchForm() {
    googleScriptAPI?.openForm('research');
}

function closeForm(containerId) {
    googleScriptAPI?.closeForm(containerId);
}

function showContentTab(section, tabName) {
    googleScriptAPI?.showContentTab(section, tabName);
}

function removeFile(index) {
    // Implementation for removing selected files
    console.log('Remove file at index:', index);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    googleScriptAPI = new GoogleScriptAPI();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleScriptAPI;
}
