// Books Page JavaScript Functions
document.addEventListener('DOMContentLoaded', function() {
    console.log('📚 Books page loaded successfully');
    
    // Initialize page
    initializeBooksPage();
    
    // Add loading animation
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Initialize books page
function initializeBooksPage() {
    // Set up filter event listeners
    setupFilters();
    
    // Add click tracking for analytics
    trackBookDownloads();
    
    // Setup smooth scrolling
    setupSmoothScrolling();
    
    console.log('✅ Books page initialized');
}

// Setup filter functionality
function setupFilters() {
    const semesterFilter = document.getElementById('semesterFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (semesterFilter) {
        semesterFilter.addEventListener('change', filterBooks);
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterBooks);
    }
}

// Enhanced filter function
function filterBooks() {
    const semesterFilter = document.getElementById('semesterFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (!semesterFilter || !categoryFilter) return;
    
    const selectedSemester = semesterFilter.value;
    const selectedCategory = categoryFilter.value;
    
    console.log('Filtering:', { semester: selectedSemester, category: selectedCategory });
    
    // Filter semester sections
    const semesterSections = document.querySelectorAll('.semester-section');
    semesterSections.forEach(section => {
        const sectionSemester = section.dataset.semester;
        
        if (selectedSemester === 'all' || sectionSemester === selectedSemester) {
            section.style.display = 'block';
            
            // Filter books within visible sections
            const bookCards = section.querySelectorAll('.book-card');
            bookCards.forEach(card => {
                const cardCategory = card.dataset.category;
                
                if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        } else {
            section.style.display = 'none';
        }
    });
    
    // Update URL with current filters (for bookmarking)
    updateUrlWithFilters(selectedSemester, selectedCategory);
    
    // Show/hide no results message
    showNoResultsMessage();
}

// Update URL with current filter state
function updateUrlWithFilters(semester, category) {
    const url = new URL(window.location);
    
    if (semester && semester !== 'all') {
        url.searchParams.set('semester', semester);
    } else {
        url.searchParams.delete('semester');
    }
    
    if (category && category !== 'all') {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    
    // Update URL without reloading page
    window.history.replaceState({}, '', url);
}

// Load filters from URL on page load
function loadFiltersFromUrl() {
    const url = new URL(window.location);
    const semester = url.searchParams.get('semester');
    const category = url.searchParams.get('category');
    
    const semesterFilter = document.getElementById('semesterFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (semester && semesterFilter) {
        semesterFilter.value = semester;
    }
    
    if (category && categoryFilter) {
        categoryFilter.value = category;
    }
    
    // Apply filters
    filterBooks();
}

// Show no results message
function showNoResultsMessage() {
    const visibleCards = document.querySelectorAll('.book-card[style*="display: block"], .book-card:not([style*="display: none"])');
    const visibleSections = document.querySelectorAll('.semester-section[style*="display: block"], .semester-section:not([style*="display: none"])');
    
    let hasVisibleCards = false;
    visibleSections.forEach(section => {
        const cardsInSection = section.querySelectorAll('.book-card[style*="display: block"], .book-card:not([style*="display: none"])');
        if (cardsInSection.length > 0) {
            hasVisibleCards = true;
        }
    });
    
    // Remove existing no results message
    const existingMessage = document.querySelector('.no-results-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    if (!hasVisibleCards) {
        const message = document.createElement('div');
        message.className = 'no-results-message';
        message.innerHTML = `
            <div style="text-align: center; padding: 40px; background: rgba(255, 255, 255, 0.05); border-radius: 15px; margin: 20px 0;">
                <h3 style="color: #4fc3f7; margin-bottom: 15px;">📭 No books found</h3>
                <p style="color: rgba(255, 255, 255, 0.7); margin-bottom: 20px;">No books match your current filters. Try adjusting your selection.</p>
                <button onclick="resetFilters()" style="background: #4fc3f7; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">
                    🔄 Reset Filters
                </button>
            </div>
        `;
        
        const booksSection = document.querySelector('.books-section');
        if (booksSection) {
            booksSection.appendChild(message);
        }
    }
}

// Reset all filters
function resetFilters() {
    const semesterFilter = document.getElementById('semesterFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    
    if (semesterFilter) semesterFilter.value = 'all';
    if (categoryFilter) categoryFilter.value = 'all';
    
    filterBooks();
    
    console.log('🔄 Filters reset');
}

// Track book downloads for analytics
function trackBookDownloads() {
    const downloadButtons = document.querySelectorAll('.download-btn');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const bookCard = this.closest('.book-card');
            if (bookCard) {
                const bookTitle = bookCard.querySelector('.book-info h4, .book-info h5');
                const bookCode = bookTitle ? bookTitle.textContent : 'Unknown';
                
                console.log('📥 Book download tracked:', bookCode);
                
                // You can send this data to analytics service
                // Example: gtag('event', 'book_download', { book_code: bookCode });
            }
            
            // If it's a disabled button, prevent default
            if (this.classList.contains('disabled')) {
                e.preventDefault();
                showComingSoonMessage();
            }
        });
    });
}

// Show coming soon message
function showComingSoonMessage() {
    // Create a temporary toast notification
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.innerHTML = `
        <div style="
            position: fixed;
            top: 100px;
            right: 20px;
            background: rgba(255, 152, 0, 0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.3s ease;
        ">
            📚 This book will be available soon!
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    // Remove after 3 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
        if (style.parentNode) {
            style.parentNode.removeChild(style);
        }
    }, 3000);
}

// Setup smooth scrolling
function setupSmoothScrolling() {
    // Smooth scroll to sections when filters change
    const filters = document.querySelectorAll('.content-filters select');
    filters.forEach(filter => {
        filter.addEventListener('change', () => {
            // Small delay to let filter animation complete
            setTimeout(() => {
                const firstVisibleSection = document.querySelector('.semester-section[style*="display: block"], .semester-section:not([style*="display: none"])');
                if (firstVisibleSection) {
                    firstVisibleSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        });
    });
}

// Go back to main portal
function goBack() {
    // Add a smooth transition
    document.body.style.opacity = '0.5';
    document.body.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 300);
}

// Load filters from URL when page loads
window.addEventListener('load', function() {
    loadFiltersFromUrl();
});

// Search functionality (bonus feature)
function setupSearch() {
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = '🔍 Search books...';
    searchInput.style.cssText = `
        background: rgba(15, 32, 39, 0.8);
        color: #ffffff;
        border: 1px solid rgba(79, 195, 247, 0.3);
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 1em;
        min-width: 250px;
        margin-right: 15px;
    `;
    
    const filtersContainer = document.querySelector('.content-filters');
    if (filtersContainer) {
        filtersContainer.insertBefore(searchInput, filtersContainer.firstChild);
        
        searchInput.addEventListener('input', function() {
            searchBooks(this.value);
        });
    }
}

// Search books by title or code
function searchBooks(query) {
    const searchTerm = query.toLowerCase().trim();
    const bookCards = document.querySelectorAll('.book-card');
    
    bookCards.forEach(card => {
        const title = card.querySelector('.book-info h4, .book-info h5');
        const description = card.querySelector('.book-info p');
        
        const titleText = title ? title.textContent.toLowerCase() : '';
        const descText = description ? description.textContent.toLowerCase() : '';
        
        if (searchTerm === '' || titleText.includes(searchTerm) || descText.includes(searchTerm)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    showNoResultsMessage();
}

// Initialize search on page load
document.addEventListener('DOMContentLoaded', function() {
    // Uncomment to enable search
    // setupSearch();
});

// Export functions for global access
window.goBack = goBack;
window.filterBooks = filterBooks;
window.resetFilters = resetFilters;
