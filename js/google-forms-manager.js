/**
 * GOOGLE FORMS INTEGRATION SYSTEM
 * Handles form embedding and content management for Study Portal
 */

class GoogleFormsManager {
    constructor() {
        // Integration mode: 'forms' for Google Forms, 'script' for Google Apps Script
        this.integrationMode = 'script'; // Change to 'forms' if you prefer Google Forms
        
        // Google Apps Script URL
        this.scriptUrl = 'https://script.google.com/macros/s/AKfycbzgBpyTiHdU3blodWcJfVBgMgQDWjoelY5Jjb1LXKCEM-ubgmUpXBea8eZm_9JoyYkv/exec';
        
        // Google Form URLs (fallback option)
        this.formUrls = {
            notes: {
                free: 'https://docs.google.com/forms/d/e/YOUR_FREE_NOTES_FORM_ID/viewform?embedded=true',
                premium: 'https://docs.google.com/forms/d/e/YOUR_PREMIUM_NOTES_FORM_ID/viewform?embedded=true'
            },
            assignments: 'https://docs.google.com/forms/d/e/YOUR_ASSIGNMENTS_FORM_ID/viewform?embedded=true',
            projects: 'https://docs.google.com/forms/d/e/YOUR_PROJECTS_FORM_ID/viewform?embedded=true',
            research: 'https://docs.google.com/forms/d/e/YOUR_RESEARCH_FORM_ID/viewform?embedded=true'
        };
        
        this.init();
    }
    
    init() {
        console.log('📋 Google Forms Manager initialized');
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Add click handlers for form close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-form')) {
                const formContainer = e.target.closest('.form-container');
                if (formContainer) {
                    this.closeForm(formContainer.id);
                }
            }
        });
    }
    
    // Notes Form Functions
    openNotesForm() {
        if (this.integrationMode === 'script') {
            window.open('notes-upload.html', '_blank');
        } else {
            this.openForm('notes-form-container', 'notes-form-iframe', this.formUrls.notes.free);
        }
        this.showMessage('📝 Notes upload form opened!', 'info');
    }
    
    openPremiumNotesForm() {
        if (this.integrationMode === 'script') {
            window.open('notes-upload.html', '_blank');
        } else {
            this.openForm('notes-form-container', 'notes-form-iframe', this.formUrls.notes.premium);
        }
        this.showMessage('⭐ Notes upload form opened!', 'info');
    }
    
    // Assignment Form Function
    openAssignmentForm() {
        if (this.integrationMode === 'script') {
            window.open('google-script-integration.html#assignments', '_blank');
        } else {
            this.openForm('assignments-form-container', 'assignments-form-iframe', this.formUrls.assignments);
        }
        this.showMessage('📤 Assignment submission opened!', 'info');
    }
    
    // Project Form Function
    openProjectForm() {
        if (this.integrationMode === 'script') {
            window.open('google-script-integration.html#projects', '_blank');
        } else {
            this.openForm('projects-form-container', 'projects-form-iframe', this.formUrls.projects);
        }
        this.showMessage('🚀 Project submission opened!', 'info');
    }
    
    // Research Form Function
    openResearchForm() {
        if (this.integrationMode === 'script') {
            window.open('google-script-integration.html#research', '_blank');
        } else {
            this.openForm('research-form-container', 'research-form-iframe', this.formUrls.research);
        }
        this.showMessage('📝 Research paper submission opened!', 'info');
    }
    
    // Generic form opening function
    openForm(containerId, iframeId, formUrl) {
        const container = document.getElementById(containerId);
        const iframe = document.getElementById(iframeId);
        
        if (container && iframe) {
            // Set the form URL
            iframe.src = formUrl;
            
            // Show the form container
            container.style.display = 'block';
            
            // Smooth scroll to form
            container.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
            
            // Add loading state
            iframe.onload = () => {
                this.showMessage('✅ Form loaded successfully!', 'success');
            };
        } else {
            this.showMessage('❌ Form could not be loaded. Please try again.', 'error');
        }
    }
    
    // Close form function
    closeForm(containerId) {
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = 'none';
            const iframe = container.querySelector('iframe');
            if (iframe) {
                iframe.src = ''; // Clear iframe to stop loading
            }
            this.showMessage('📋 Form closed.', 'info');
        }
    }
    
    // Tab switching functions
    showNotesTab(tabName) {
        this.showContentTab('notes', tabName);
    }
    
    showContentTab(section, tabName) {
        // Hide all tabs for this section
        const allTabs = document.querySelectorAll(`#${section}-section .tab-content`);
        const allBtns = document.querySelectorAll(`#${section}-section .tab-btn`);
        
        allTabs.forEach(tab => tab.classList.remove('active'));
        allBtns.forEach(btn => btn.classList.remove('active'));
        
        // Show selected tab
        const selectedTab = document.getElementById(`${section}-${tabName}-tab`);
        const selectedBtn = document.querySelector(`#${section}-section .tab-btn[onclick*="${tabName}"]`);
        
        if (selectedTab) selectedTab.classList.add('active');
        if (selectedBtn) selectedBtn.classList.add('active');
    }
    
    // Message display function
    showMessage(message, type = 'info') {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.innerHTML = `
            <span class="message-text">${message}</span>
            <button class="message-close" onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add to page
        document.body.appendChild(messageDiv);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentElement) {
                messageDiv.remove();
            }
        }, 5000);
    }
    
    // Content filtering (for browse tabs)
    filterContent(section, filterType, value) {
        const grid = document.getElementById(`${section}Grid`);
        const cards = grid.querySelectorAll('.content-card');
        
        cards.forEach(card => {
            const shouldShow = this.matchesFilter(card, filterType, value);
            card.style.display = shouldShow ? 'block' : 'none';
        });
    }
    
    matchesFilter(card, filterType, value) {
        if (!value) return true; // Show all if no filter
        
        const tag = card.querySelector('.content-tag')?.textContent.toLowerCase();
        const title = card.querySelector('h4')?.textContent.toLowerCase();
        const description = card.querySelector('.content-description')?.textContent.toLowerCase();
        
        switch (filterType) {
            case 'subject':
                return tag?.includes(value.toLowerCase());
            case 'keyword':
                return title?.includes(value.toLowerCase()) || description?.includes(value.toLowerCase());
            default:
                return true;
        }
    }
}

// Initialize Google Forms Manager
let googleFormsManager;

// Global functions for HTML onclick events
function openNotesForm() {
    googleFormsManager.openNotesForm();
}

function openPremiumNotesForm() {
    googleFormsManager.openPremiumNotesForm();
}

function openAssignmentForm() {
    googleFormsManager.openAssignmentForm();
}

function openProjectForm() {
    googleFormsManager.openProjectForm();
}

function openResearchForm() {
    googleFormsManager.openResearchForm();
}

function closeForm(containerId) {
    googleFormsManager.closeForm(containerId);
}

function showNotesTab(tabName) {
    googleFormsManager.showNotesTab(tabName);
}

function showContentTab(section, tabName) {
    googleFormsManager.showContentTab(section, tabName);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    googleFormsManager = new GoogleFormsManager();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GoogleFormsManager;
}
