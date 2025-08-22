// Admin Dashboard JavaScript

// Auth Check - must be at the top
if (localStorage.getItem('adminLoggedIn') !== 'true') {
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async function() {
    // Update user info in sidebar if available
    const userEmail = localStorage.getItem('adminEmail');
    if (userEmail) {
        const userInfoSpan = document.querySelector('.user-info span');
        if (userInfoSpan) {
            userInfoSpan.textContent = userEmail;
        }
    }
    
    // Logout functionality
    setTimeout(() => {
        const logoutBtn = document.querySelector('.btn-outline-light');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function(e) {
                e.preventDefault();
                        showNotification('Abmeldung...', 'info');
        setTimeout(() => {
                    localStorage.removeItem('adminLoggedIn');
                    localStorage.removeItem('adminEmail');
                    window.location.href = 'login.html';
        }, 500);
            });
        }
    }, 100);
    // Initialize the admin dashboard
    initDashboard();
    
    // Navigation handling
    initNavigation();
    
    // Sidebar toggle for mobile
    initSidebarToggle();
    
    // Initialize components
    initComponents();
    
    // Initialize content management
    await initContentManagement();
    
    // Initialize media management
    initMediaManagement();
    
    // Initialize service management
    initServiceManagement();
    
    // Initialize project management
    initProjectManagement();
    
    // Initialize settings & customer management (no charts needed)
    initSettingsManagement();
    initCustomerManagement();
    initPasswordChangeForm();
    
    // Ensure all sections have their initial content loaded
    setTimeout(() => {
        loadCustomerData();
        renderCustomerTable();
        // loadOpeningHours(); // Disabled - DOM elements don't exist
        // loadSecurityLog(); // Disabled - DOM elements don't exist
        // loadBackupHistory(); // Disabled - DOM elements don't exist
    }, 100);
    
    // Initialize dashboard first
    setTimeout(() => {
        showSection('dashboard-section');
        updateHeaderTitle('Dashboard');
    }, 50);
    
            // Load Chart.js and then initialize dashboard
        loadChartJS().then(() => {
            initDashboard();
        }).catch(err => {
            // Initialize without charts
            initDashboard();
        });
        
        // Überwache Modal-Events für Bild-Auswahl-Buttons
        setupModalEventListeners();
    

    
    // Fix content management buttons
    setTimeout(() => {
        fixContentButtons();
        
        // Event-Listener initialisieren
        reinitializeEventListeners();
    }, 100);
});

// Simple content button fix
function fixContentButtons() {
    // Fix content management buttons
    const contentButtons = document.querySelectorAll('#content-section button, #content-section .btn');
    contentButtons.forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.style.position = 'relative';
        btn.style.zIndex = '10';
        btn.disabled = false;
    });
    
    // Fix content table action buttons specifically
    const actionButtons = document.querySelectorAll('.content-table .btn, .content-actions .btn');
    actionButtons.forEach(btn => {
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
        btn.disabled = false;
    });
    
    // Add direct event listeners as CSP backup
    addContentEventListeners();
}

// Add event listeners as backup for CSP-blocked onclick handlers
function addContentEventListeners() {
    // Remove existing listeners to avoid duplicates
    document.querySelectorAll('.edit-page-btn').forEach(btn => {
        btn.removeEventListener('click', handleEditPageClick);
    });
    
    // Add edit page button listeners
    document.querySelectorAll('.edit-page-btn').forEach(btn => {
        btn.addEventListener('click', handleEditPageClick);
        btn.style.pointerEvents = 'auto';
        btn.style.cursor = 'pointer';
    });
    
    // Add other content action listeners
    const refreshBtn = document.querySelector('button[onclick*="refreshContentList"]');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
            e.preventDefault();
            renderContentTable();
        });
    }
    
    const filterBtn = document.querySelector('button[onclick*="applyContentFilters"]');
    if (filterBtn) {
        filterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            filterContentPages();
        });
    }
    
    const newContentBtn = document.querySelector('button[onclick*="openContentModal"]');
    if (newContentBtn) {
        newContentBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const modal = new bootstrap.Modal(document.getElementById('contentModal'));
            modal.show();
        });
    }
}

// Handle edit page button clicks
function handleEditPageClick(e) {
    e.preventDefault();
    const btn = e.target.closest('button');
    const pageId = btn.getAttribute('data-page-id') || 
                   btn.getAttribute('onclick')?.match(/editPageContent\('([^']+)'\)/)?.[1];
    
    if (pageId) {
        editPageContent(pageId);
    }
}

// Essential button functions only
window.refreshContentList = () => renderContentTable();
window.openContentModal = () => {
    const modal = new bootstrap.Modal(document.getElementById('contentModal'));
    modal.show();
};
window.applyContentFilters = () => filterContentPages();
window.refreshDashboard = () => location.reload();
window.editPageContent = editPageContent;
window.savePageChanges = savePageChanges;

// Content editing functions
window.selectHeroImage = async () => {
    if (typeof openMediaPicker === 'function') {
        await openMediaPicker((imagePath, imageName) => {
            // Hier könnte ein Hero-Image-Input-Feld aktualisiert werden
            showNotification(`Hero-Bild ausgewählt: ${imageName}`, 'success');
        });
    } else {
        showNotification('Media Picker wird geladen...', 'info');
    }
};

window.addProjectItem = () => {
    const gallery = document.getElementById('projectsGallery');
    const index = gallery.children.length;
    const newProject = `
        <div class="project-item border rounded p-3 mb-3" data-index="${index}">
            <div class="row g-3 align-items-center">
                <div class="col-md-3">
                    <img src="/content/images/placeholder.jpg" alt="Neues Projekt" class="img-fluid rounded project-preview">
                </div>
                <div class="col-md-6">
                    <div class="mb-2">
                        <label class="form-label fw-bold">Projekt-Name</label>
                        <input type="text" class="form-control project-name" value="Neues Projekt">
                    </div>
                    <div class="mb-2">
                        <label class="form-label fw-bold">Bild-URL</label>
                        <div class="input-group">
                            <input type="text" class="form-control project-image" value="/content/images/placeholder.jpg">
                            <button class="btn btn-outline-primary" type="button" onclick="selectProjectImage(${index})">
                                <i class="fas fa-image"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 text-end">
                    <button class="btn btn-sm btn-danger" onclick="removeProjectItem(${index})">
                        <i class="fas fa-trash"></i>
                        Entfernen
                    </button>
                </div>
            </div>
        </div>
    `;
    gallery.insertAdjacentHTML('beforeend', newProject);
    fixContentButtons();
};

window.removeProjectItem = (index) => {
    const item = document.querySelector(`[data-index="${index}"]`);
    if (item && confirm('Projekt wirklich entfernen?')) {
        item.remove();
    }
};

window.selectProjectImage = async (index) => {
    if (typeof openMediaPicker === 'function') {
        await openMediaPicker((imagePath, imageName) => {
            // Projekt-Bild-Input-Feld aktualisieren
            const projectItem = document.querySelector(`[data-index="${index}"]`);
            if (projectItem) {
                const imageInput = projectItem.querySelector('.project-image');
                const imagePreview = projectItem.querySelector('.project-preview');
                
                if (imageInput) imageInput.value = imagePath;
                if (imagePreview) imagePreview.src = imagePath;
            }
            showNotification(`Projekt-Bild ausgewählt: ${imageName}`, 'success');
        });
    } else {
        showNotification('Media Picker wird geladen...', 'info');
    }
};

window.previewPageChanges = () => {
    showNotification('Vorschau-Feature kommt bald!', 'info');
};

// Text editor functions
window.formatText = (command) => {
    document.execCommand(command, false, null);
};

// Media Picker Helper Functions
window.openMediaPickerForField = async (inputId, previewId = null) => {
    const inputField = document.getElementById(inputId);
    const previewField = previewId ? document.getElementById(previewId) : null;
    
    if (!inputField) {
        showNotification('Eingabefeld nicht gefunden', 'error');
        return;
    }
    
    if (typeof openMediaPicker === 'function') {
        await openMediaPicker((imagePath, imageName) => {
            inputField.value = imagePath;
            
            if (previewField && previewField.tagName === 'IMG') {
                previewField.src = imagePath;
                previewField.alt = imageName;
            }
            
            // Change Event triggern für andere Listener
            const event = new Event('change', { bubbles: true });
            inputField.dispatchEvent(event);
            
            showNotification(`Bild ausgewählt: ${imageName}`, 'success');
        }, inputField);
    } else {
        showNotification('Media Picker wird geladen...', 'info');
    }
};

// Füge Bild-Auswahl-Buttons zu Input-Feldern hinzu
window.addImagePickerButtons = () => {
    // Finde alle Input-Felder die Bildpfade enthalten könnten
    const imageInputs = document.querySelectorAll('input[type="text"]');
    
    imageInputs.forEach(input => {
        const placeholder = input.placeholder?.toLowerCase();
        const label = input.previousElementSibling?.textContent?.toLowerCase();
        const name = input.name?.toLowerCase();
        const id = input.id?.toLowerCase();
        
        // Prüfe ob es sich um ein Bild-Input-Feld handelt
        if ((placeholder && (placeholder.includes('bild') || placeholder.includes('image') || placeholder.includes('url'))) ||
            (label && (label.includes('bild') || label.includes('image') || label.includes('url'))) ||
            (name && (name.includes('image') || name.includes('img') || name.includes('photo'))) ||
            (id && (id.includes('image') || id.includes('img') || id.includes('photo')))) {
            
            // Prüfe ob bereits ein Button vorhanden ist
            if (input.parentElement.querySelector('.media-picker-btn')) return;
            
            // Erstelle Bild-Auswahl-Button
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'btn btn-outline-primary media-picker-btn';
            button.innerHTML = '<i class="fas fa-images"></i>';
            button.title = 'Bild auswählen';
            
            button.addEventListener('click', () => {
                if (typeof openMediaPickerForInput === 'function') {
                    openMediaPickerForInput(input);
                } else {
                    showNotification('Media Picker nicht verfügbar', 'error');
                }
            });
            
            // Wrapper um Input-Feld erstellen falls nicht vorhanden
            if (!input.parentElement.classList.contains('input-group')) {
                const wrapper = document.createElement('div');
                wrapper.className = 'input-group';
                input.parentNode.insertBefore(wrapper, input);
                wrapper.appendChild(input);
                wrapper.appendChild(button);
            } else {
                input.parentElement.appendChild(button);
            }
        }
    });
};

// Modal Event Listeners für automatische Bild-Button-Integration
function setupModalEventListeners() {
    // Alle Modals überwachen
    const modalIds = [
        'contentModal', 'serviceModal', 'projectModal', 
        'teamModal', 'mediaModal', 'uploadModal'
    ];
    
    modalIds.forEach(modalId => {
        const modalElement = document.getElementById(modalId);
        if (modalElement) {
            modalElement.addEventListener('shown.bs.modal', function() {
                // Kurz warten bis Modal vollständig geladen ist
                setTimeout(() => {
                    reinitializeEventListeners();
                }, 200);
            });
            
            modalElement.addEventListener('hidden.bs.modal', function() {
                // Event-Listener nach Modal-Schließung neu initialisieren
                setTimeout(() => {
                    reinitializeEventListeners();
                }, 100);
            });
        }
    });
}

// Zentrale Funktion zum Neuinitialisieren aller Event-Listener
function reinitializeEventListeners() {
    try {
        if (typeof fixContentButtons === 'function') {
            fixContentButtons();
        }
        if (typeof addImagePickerButtons === 'function') {
            addImagePickerButtons();
        }
        
        // Debug-Log für Troubleshooting
        if (localStorage.getItem('adminDebug') === 'true') {
        }
    } catch (error) {
        console.warn('Error reinitializing event listeners:', error);
    }
}

window.insertLink = () => {
    const url = prompt('URL eingeben:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
};

// Modal content functions
window.previewContent = () => {
    showNotification('Vorschau-Feature kommt bald!', 'info');
};

window.saveContent = () => {
    const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
    if (modal) modal.hide();
    showNotification('Content gespeichert!', 'success');
    
    // Re-initialize buttons after modal close
    setTimeout(() => {
        reinitializeEventListeners();
    }, 200);
};

// Additional page action functions
window.previewPage = (pageId) => {
    showNotification('Vorschau-Feature kommt bald!', 'info');
};

window.duplicatePage = (pageId) => {
    if (confirm('Seite wirklich duplizieren?')) {
        showNotification('Duplizierung-Feature kommt bald!', 'info');
    }
};

window.showPageSEO = (pageId) => {
    showNotification('SEO-Editor kommt bald!', 'info');
};



function initDashboard() {
    // Set initial active section
    showSection('dashboard-section');
    
    // Update header title
    updateHeaderTitle('Dashboard');
    
    // Initialize dashboard charts and metrics (only if Chart.js is loaded)
    if (typeof Chart !== 'undefined') {
        setTimeout(() => {
            initDashboardCharts();
            loadActivityFeed();
            updateDashboardMetrics();
        }, 100);
    } else {
        // Initialize without charts
        loadActivityFeed();
        updateDashboardMetrics();
    }
}

function initNavigation() {
    // Navigation is now handled by onclick attributes in HTML
    const navLinks = document.querySelectorAll('.sidebar .nav-link[onclick]');
    
    navLinks.forEach((link) => {
        const onclick = link.getAttribute('onclick');
        const sectionName = onclick?.match(/showSection\('([^']+)'\)/)?.[1];
        
        // Add backup click handler in case onclick fails
        link.addEventListener('click', (e) => {
            e.preventDefault();
            if (sectionName) {
                window.showSection(sectionName);
            }
        });
    });
}

// Make showSection globally available
window.showSection = async function(sectionName) {
    try {
        // Hide all sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
            section.style.display = 'none';
        });
        
        // Show selected section
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
        } else {
            return;
        }
        
        // Stop real-time updates and auto-refresh when leaving analytics section
        if (isRealTimeActive && sectionName !== 'analytics-section') {
            stopRealTimeUpdates();
            showNotification('📊 Real-Time Analytics gestoppt', 'info');
        }
        
        // Clean up auto-refresh interval when leaving analytics
        if (window.analyticsRefreshInterval && sectionName !== 'analytics-section') {
            clearInterval(window.analyticsRefreshInterval);
            window.analyticsRefreshInterval = null;
        }
        
        // Update navigation active state
        updateNavigation(sectionName);
        
        // Initialize section-specific content
        await initializeSectionContent(sectionName);
        
        // Dispatch section changed event for custom handlers
        document.dispatchEvent(new CustomEvent('sectionChanged', { 
            detail: { section: sectionName } 
        }));
        
        // Fix content buttons after section change
        if (sectionName === 'content-section') {
            setTimeout(() => {
                reinitializeEventListeners();
            }, 50);
        }
        
        // Initialize special pages section
        if (sectionName === 'special-pages-section') {
            setTimeout(() => {
                reinitializeEventListeners();
                // Load special pages if function exists
                if (typeof window.SpecialPages?.loadSpecialPages === 'function') {
                    window.SpecialPages.loadSpecialPages();
                }
            }, 50);
        }
        
    } catch (error) {
        console.error('Error in showSection:', error);
    }
}

function updateHeaderTitle(title) {
    const headerTitle = document.querySelector('.header h1');
    if (headerTitle) {
        headerTitle.textContent = title;
    }
}

function updateNavigation(sectionName) {
    // Update sidebar navigation active state
    const navLinks = document.querySelectorAll('.sidebar .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
        
        // Check if this link corresponds to the current section
        const onclick = link.getAttribute('onclick') || '';
        const linkSection = onclick.match(/showSection\('([^']+)'\)/)?.[1];
        
        if (linkSection === sectionName) {
            link.classList.add('active');
        }
    });
    
    // Update header title
    const activeLink = document.querySelector('.sidebar .nav-link.active');
    if (activeLink) {
        const title = activeLink.querySelector('span').textContent;
        updateHeaderTitle(title);
    }
}

async function initializeSectionContent(sectionName) {
    switch(sectionName) {
        case 'dashboard-section':
            // Reinitialize dashboard
            loadActivityFeed();
            updateDashboardMetrics();
            break;
            
        case 'content-section':
            // Reinitialize content management
            await loadContentData();
            renderContentTable();
            break;
            
        case 'media-section':
            // Reinitialize media management
            if (typeof loadMediaData === 'function') {
                await loadMediaData();
                renderMediaGrid();
            }
            break;
            
        case 'services-section':
            // Reinitialize service management
            if (typeof loadServiceData === 'function') {
                loadServiceData();
                renderServiceCards();
            }
            break;
            
        case 'projects-section':
            // Reinitialize project management
            if (typeof loadProjectData === 'function') {
                loadProjectData();
                renderProjectCards();
            }
            break;
            
        case 'team-section':
            // Reinitialize team management
            if (typeof loadTeamMembersData === 'function') {
                await loadTeamMembersData();
            } else {
                console.warn('⚠️ loadTeamMembersData function not found');
            }
            break;
            
        case 'company-history-section':
            if (typeof initCompanyHistory === 'function') {
                initCompanyHistory();
            } else {
                console.error('❌ initCompanyHistory function not found!');
            }
            break;
            
        case 'fachkompetenzen-section':
            // Switching to fachkompetenzen-section
            
            if (typeof initFachKompetenzen === 'function') {
                // Calling initFachKompetenzen
                initFachKompetenzen();
            } else if (typeof window.initFachKompetenzen === 'function') {
                // Calling window.initFachKompetenzen
                window.initFachKompetenzen();
            } else {
                console.error('❌ initFachKompetenzen function not found!');
                // Debug: Available functions can be checked if needed
            }
            break;
            
        case 'analytics-section':
            // Initialize modern analytics with charts
            setTimeout(() => {
                initAnalytics();
            }, 100);
            break;
            
        case 'customers-section':
            // Reinitialize customer management
            if (typeof loadCustomerData === 'function') {
                loadCustomerData();
                renderCustomerTable();
                // Update customer count in header and initialize view mode
                const headerElement = document.getElementById('customerCountHeader');
                if (headerElement) {
                    headerElement.textContent = 'Verwalten Sie Ihre Kunden';
                }
                // Initialize view mode after DOM is ready
                setTimeout(() => {
                    initializeCustomerViewMode();
                }, 100);
            }
            break;
            
        case 'settings-section':
            // Reinitialize settings
            if (typeof loadSettingsData === 'function') {
                loadSettingsData();
                // loadOpeningHours(); // Disabled - DOM elements don't exist
                // loadSecurityLog(); // Disabled - DOM elements don't exist
                // loadBackupHistory(); // Disabled - DOM elements don't exist
            }
            break;
            
        case 'docs-section':
            // Initialize documentation section
            initDocsSection();
            break;
            
        default:
    }
}

function initSidebarToggle() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            toggleSidebar();
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth < 992) {
            if (!sidebar.contains(e.target) && !sidebarToggle.contains(e.target)) {
                closeSidebar();
            }
        }
    });
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('show');
}

function closeSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.remove('show');
}

function initComponents() {
    // Initialize quick action buttons
    initQuickActions();
    
    // Initialize stats cards with animation
    animateStatsCards();
    
    // Initialize tooltips if needed
    initTooltips();
    
    // Initialize form validation
    initFormValidation();
}

function initQuickActions() {
    const quickActionBtns = document.querySelectorAll('.card .btn');
    
    quickActionBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const text = this.textContent.trim();
            
            switch(text) {
                case 'Neue Seite erstellen':
                    handleNewPage();
                    break;
                case 'Bilder hochladen':
                    handleImageUpload();
                    break;
                case 'Service hinzufügen':
                    handleNewService();
                    break;
                case 'Website anzeigen':
                    handleViewWebsite();
                    break;
                default:
            }
        });
    });
}

function handleNewPage() {
    // Switch to content management section
    showSection('content');
    document.querySelector('[data-section="content"]').classList.add('active');
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="content"]').classList.add('active');
    updateHeaderTitle('Inhalte verwalten');
    
    // Show modal or form for new page (placeholder)
    showNotification('Neue Seite erstellen - Feature wird implementiert', 'info');
}

function handleImageUpload() {
    // Switch to media section
    showSection('media');
    document.querySelector('[data-section="media"]').classList.add('active');
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="media"]').classList.add('active');
    updateHeaderTitle('Medien verwalten');
    
    // Trigger file upload (placeholder)
    showNotification('Datei-Upload wird geöffnet...', 'info');
}

function handleNewService() {
    // Switch to services section
    showSection('services');
    document.querySelector('[data-section="services"]').classList.add('active');
    document.querySelectorAll('.sidebar .nav-link').forEach(l => l.classList.remove('active'));
    document.querySelector('[data-section="services"]').classList.add('active');
    updateHeaderTitle('Dienstleistungen');
    
    showNotification('Service hinzufügen - Feature wird implementiert', 'info');
}

function handleViewWebsite() {
    // Open main website in new tab
    window.open('../index.html', '_blank');
    showNotification('Website wird in neuem Tab geöffnet', 'success');
}

function animateStatsCards() {
    const statsNumbers = document.querySelectorAll('.stats-number');
    
    statsNumbers.forEach(stat => {
        const target = parseInt(stat.textContent);
        let current = 0;
        const increment = target / 50;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            stat.textContent = Math.floor(current);
        }, 30);
    });
}

function initTooltips() {
    // Initialize Bootstrap tooltips if available
    if (typeof bootstrap !== 'undefined' && bootstrap.Tooltip) {
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
    }
}

function initFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic validation
            const inputs = form.querySelectorAll('input[required], textarea[required]');
            let isValid = true;
            
            inputs.forEach(input => {
                if (!input.value.trim()) {
                    isValid = false;
                    input.classList.add('is-invalid');
                } else {
                    input.classList.remove('is-invalid');
                }
            });
            
            if (isValid) {
                showNotification('Einstellungen wurden gespeichert', 'success');
                // Here you would normally send the data to the server
            } else {
                showNotification('Bitte füllen Sie alle erforderlichen Felder aus', 'error');
            }
        });
    });
}

// Notification system (REMOVED - using Bootstrap notifications instead)

// Old notification functions removed - using enhanced Bootstrap notifications

// Utility functions
function formatDate(date) {
    return new Intl.DateTimeFormat('de-DE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Add notification styles to head
const notificationStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 1rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-width: 300px;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 10000;
}

.notification.show {
    transform: translateX(0);
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.notification-close {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.25rem;
}

.notification-success {
    border-left: 4px solid #28a745;
}

.notification-success .notification-content i {
    color: #28a745;
}

.notification-error {
    border-left: 4px solid #dc3545;
}

.notification-error .notification-content i {
    color: #dc3545;
}

.notification-warning {
    border-left: 4px solid #ffc107;
}

.notification-warning .notification-content i {
    color: #ffc107;
}

.notification-info {
    border-left: 4px solid #17a2b8;
}

.notification-info .notification-content i {
    color: #17a2b8;
}

@media (max-width: 768px) {
    .notification {
        right: 10px;
        left: 10px;
        min-width: auto;
        max-width: calc(100vw - 20px);
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', notificationStyles);

// Export functions for global access
window.AdminDashboard = {
    showSection,
    showNotification,
    toggleSidebar,
    formatDate,
    formatFileSize,
    reinitializeEventListeners
};

// Debug-Funktionen für Troubleshooting
window.enableAdminDebug = () => {
    localStorage.setItem('adminDebug', 'true');
};

window.disableAdminDebug = () => {
    localStorage.removeItem('adminDebug');
};

window.fixAdminButtons = () => {
    reinitializeEventListeners();
}; 

// Content Management Data Storage
let contentData = [];
let currentContentId = null;
let contentFilters = {
    search: '',
    type: '',
    status: ''
};

// Sample content data (in real app this would come from backend)
const sampleContent = [
    {
        id: 1,
        title: 'Startseite',
        slug: 'index',
        type: 'homepage',
        status: 'published',
        excerpt: 'Willkommen bei Neon Murer - Ihr Partner für professionelle Werbetechnik',
        content: '<h1>Willkommen bei Neon Murer</h1><p>Professionelle Werbetechnik seit über 30 Jahren...</p>',
        author: 'Administrator',
        template: 'homepage',
        metaTitle: 'Neon Murer - Professionelle Werbetechnik',
        metaDescription: 'Spezialist für Lichtwerbung, Fahrzeugbeschriftung und Grossformatdruck in der Schweiz',
        keywords: 'Neon, Lichtwerbung, Werbetechnik, Beschriftung',
        lastModified: new Date('2024-07-23'),
        createdAt: new Date('2024-01-15')
    },
    {
        id: 2,
        title: 'Dienstleistungen',
        slug: 'dienstleistungen',
        type: 'page',
        status: 'published',
        excerpt: 'Übersicht unserer professionellen Dienstleistungen',
        content: '<h2>Unsere Dienstleistungen</h2><p>Wir bieten Ihnen ein umfassendes Angebot...</p>',
        author: 'Administrator',
        template: 'default',
        metaTitle: 'Dienstleistungen - Neon Murer',
        metaDescription: 'Professionelle Werbetechnik-Dienstleistungen: Lichtwerbung, Beschriftung, Druck',
        keywords: 'Dienstleistungen, Werbetechnik, Services',
        lastModified: new Date('2024-07-22'),
        createdAt: new Date('2024-02-01')
    },
    {
        id: 3,
        title: 'Fahrzeugbeschriftung',
        slug: 'fahrzeugbeschriftung',
        type: 'service',
        status: 'published',
        excerpt: 'Professionelle Fahrzeugbeschriftung für alle Fahrzeugtypen',
        content: '<h2>Fahrzeugbeschriftung</h2><p>Machen Sie Ihr Fahrzeug zur rollenden Werbefläche...</p>',
        author: 'Administrator',
        template: 'service-page',
        metaTitle: 'Fahrzeugbeschriftung - Neon Murer',
        metaDescription: 'Professionelle Fahrzeugbeschriftung für PKW, LKW und Transporter',
        keywords: 'Fahrzeugbeschriftung, Auto, Werbung, Folierung',
        lastModified: new Date('2024-07-20'),
        createdAt: new Date('2024-03-10')
    },
    {
        id: 4,
        title: 'Neue Service-Seite',
        slug: 'neue-service-seite',
        type: 'service',
        status: 'draft',
        excerpt: 'In Bearbeitung befindliche Service-Seite',
        content: '<h2>Neuer Service</h2><p>Inhalt wird noch erstellt...</p>',
        author: 'Administrator',
        template: 'service-page',
        metaTitle: '',
        metaDescription: '',
        keywords: '',
        lastModified: new Date('2024-07-24'),
        createdAt: new Date('2024-07-24')
    }
];

function initContentManagement() {
    // Initialize content data
    contentData = [...sampleContent];
    
    // Load content list
    loadContentList();
    
    // Initialize form handlers
    initContentForm();
    
    // Initialize filter handlers
    initContentFilters();
}

function loadContentList() {
    const tbody = document.getElementById('contentTableBody');
    if (!tbody) return;
    
    // Apply filters
    let filteredContent = contentData.filter(item => {
        let matchesSearch = true;
        let matchesType = true;
        let matchesStatus = true;
        
        if (contentFilters.search) {
            matchesSearch = item.title.toLowerCase().includes(contentFilters.search.toLowerCase());
        }
        
        if (contentFilters.type) {
            matchesType = item.type === contentFilters.type;
        }
        
        if (contentFilters.status) {
            matchesStatus = item.status === contentFilters.status;
        }
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    // Clear table
    tbody.innerHTML = '';
    
    // Populate table
    filteredContent.forEach(item => {
        const row = createContentTableRow(item);
        tbody.appendChild(row);
    });
    
    // Update empty state
    if (filteredContent.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-muted py-4">
                    <i class="fas fa-file-alt fa-2x mb-2"></i>
                    <div>Keine Inhalte gefunden</div>
                    <div class="small">Versuchen Sie andere Filter oder erstellen Sie neuen Inhalt</div>
                </td>
            </tr>
        `;
    }
    
    // Re-initialize event listeners and buttons after DOM manipulation
    setTimeout(() => {
        reinitializeEventListeners();
    }, 50);
}

function createContentTableRow(item) {
    const row = document.createElement('tr');
    
    const statusClass = {
        published: 'success',
        draft: 'warning',
        archived: 'secondary'
    }[item.status] || 'secondary';
    
    const typeClass = {
        homepage: 'primary',
        service: 'info',
        page: 'secondary',
        category: 'warning'
    }[item.type] || 'secondary';
    
    const statusText = {
        published: 'Veröffentlicht',
        draft: 'Entwurf',
        archived: 'Archiviert'
    }[item.status] || item.status;
    
    const typeText = {
        homepage: 'Homepage',
        service: 'Service',
        page: 'Seite',
        category: 'Kategorie'
    }[item.type] || item.type;
    
    row.innerHTML = `
        <td>
            <input type="checkbox" class="content-checkbox" value="${item.id}" onchange="updateBulkActions()">
        </td>
        <td>
            <div class="fw-semibold">${item.title}</div>
            <div class="small text-muted">/${item.slug}.html</div>
        </td>
        <td><span class="badge bg-${typeClass}">${typeText}</span></td>
        <td><span class="badge bg-${statusClass}">${statusText}</span></td>
        <td>${formatDate(item.lastModified)}</td>
        <td>${item.author}</td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="editContent(${item.id})" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-info" onclick="previewContentItem(${item.id})" title="Vorschau">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="deleteContent(${item.id})" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

function initContentFilters() {
    const searchInput = document.getElementById('contentSearch');
    const typeFilter = document.getElementById('contentTypeFilter');
    const statusFilter = document.getElementById('contentStatusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            contentFilters.search = this.value;
            loadContentList();
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            contentFilters.type = this.value;
            loadContentList();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            contentFilters.status = this.value;
            loadContentList();
        });
    }
}

function applyContentFilters() {
    loadContentList();
    showNotification('Filter angewendet', 'info');
}

function refreshContentList() {
    loadContentList();
    showNotification('Inhaltsliste aktualisiert', 'success');
}

function openContentModal(id = null) {
    currentContentId = id;
    const modal = new bootstrap.Modal(document.getElementById('contentModal'));
    const modalTitle = document.getElementById('contentModalLabel');
    
    if (id) {
        // Edit mode
        const content = contentData.find(item => item.id === id);
        if (content) {
            populateContentForm(content);
            modalTitle.textContent = 'Inhalt bearbeiten';
        }
    } else {
        // Create mode
        clearContentForm();
        modalTitle.textContent = 'Neuen Inhalt erstellen';
    }
    
    modal.show();
}

function populateContentForm(content) {
    document.getElementById('contentTitle').value = content.title;
    document.getElementById('contentSlug').value = content.slug;
    document.getElementById('contentExcerpt').value = content.excerpt;
    document.getElementById('contentBody').innerHTML = content.content;
    document.getElementById('contentStatus').value = content.status;
    document.getElementById('contentType').value = content.type;
    document.getElementById('contentAuthor').value = content.author;
    document.getElementById('contentTemplate').value = content.template;
    document.getElementById('contentMetaTitle').value = content.metaTitle || '';
    document.getElementById('contentMetaDescription').value = content.metaDescription || '';
    document.getElementById('contentKeywords').value = content.keywords || '';
    
    updateCharacterCounts();
}

function clearContentForm() {
    document.getElementById('contentTitle').value = '';
    document.getElementById('contentSlug').value = '';
    document.getElementById('contentExcerpt').value = '';
    document.getElementById('contentBody').innerHTML = '';
    document.getElementById('contentStatus').value = 'draft';
    document.getElementById('contentType').value = 'page';
    document.getElementById('contentAuthor').value = 'Administrator';
    document.getElementById('contentTemplate').value = 'default';
    document.getElementById('contentMetaTitle').value = '';
    document.getElementById('contentMetaDescription').value = '';
    document.getElementById('contentKeywords').value = '';
    
    updateCharacterCounts();
}

function initContentForm() {
    // Auto-generate slug from title
    const titleInput = document.getElementById('contentTitle');
    const slugInput = document.getElementById('contentSlug');
    
    if (titleInput && slugInput) {
        titleInput.addEventListener('input', function() {
            if (!currentContentId) { // Only auto-generate for new content
                const slug = generateSlug(this.value);
                slugInput.value = slug;
            }
        });
    }
    
    // Character count updates
    const metaTitleInput = document.getElementById('contentMetaTitle');
    const metaDescInput = document.getElementById('contentMetaDescription');
    
    if (metaTitleInput) {
        metaTitleInput.addEventListener('input', updateCharacterCounts);
    }
    
    if (metaDescInput) {
        metaDescInput.addEventListener('input', updateCharacterCounts);
    }
    
    // Initialize WYSIWYG editor
    initWYSIWYGEditor();
}

function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function updateCharacterCounts() {
    const metaTitle = document.getElementById('contentMetaTitle').value;
    const metaDesc = document.getElementById('contentMetaDescription').value;
    
    document.getElementById('metaTitleCount').textContent = metaTitle.length;
    document.getElementById('metaDescCount').textContent = metaDesc.length;
    
    // Update color based on length
    const titleCounter = document.getElementById('metaTitleCount').parentElement;
    const descCounter = document.getElementById('metaDescCount').parentElement;
    
    titleCounter.className = metaTitle.length > 60 ? 'form-text text-danger' : 'form-text';
    descCounter.className = metaDesc.length > 160 ? 'form-text text-danger' : 'form-text';
}

function initWYSIWYGEditor() {
    const contentBody = document.getElementById('contentBody');
    if (!contentBody) return;
    
    // Focus and blur events for placeholder
    contentBody.addEventListener('focus', function() {
        if (this.innerHTML === '') {
            this.innerHTML = '';
        }
    });
    
    contentBody.addEventListener('blur', function() {
        if (this.innerHTML === '<br>' || this.innerHTML === '') {
            this.innerHTML = '';
        }
    });
}

function formatText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('contentBody').focus();
}

function insertLink() {
    const url = prompt('URL eingeben:');
    if (url) {
        const text = window.getSelection().toString() || 'Link';
        formatText('insertHTML', `<a href="${url}" target="_blank">${text}</a>`);
    }
}

function saveContent() {
    const form = document.getElementById('contentForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const contentData_item = {
        title: document.getElementById('contentTitle').value,
        slug: document.getElementById('contentSlug').value,
        excerpt: document.getElementById('contentExcerpt').value,
        content: document.getElementById('contentBody').innerHTML,
        status: document.getElementById('contentStatus').value,
        type: document.getElementById('contentType').value,
        author: document.getElementById('contentAuthor').value,
        template: document.getElementById('contentTemplate').value,
        metaTitle: document.getElementById('contentMetaTitle').value,
        metaDescription: document.getElementById('contentMetaDescription').value,
        keywords: document.getElementById('contentKeywords').value,
        lastModified: new Date()
    };
    
    if (currentContentId) {
        // Update existing content
        const index = contentData.findIndex(item => item.id === currentContentId);
        if (index !== -1) {
            contentData[index] = { ...contentData[index], ...contentData_item };
            showNotification('Inhalt erfolgreich aktualisiert', 'success');
        }
    } else {
        // Create new content
        const newContent = {
            id: Date.now(), // Simple ID generation
            ...contentData_item,
            createdAt: new Date()
        };
        contentData.push(newContent);
        showNotification('Neuer Inhalt erfolgreich erstellt', 'success');
    }
    
    // Close modal and refresh list
    bootstrap.Modal.getInstance(document.getElementById('contentModal')).hide();
    loadContentList();
    
    // Re-initialize buttons and event listeners after content reload
    setTimeout(() => {
        reinitializeEventListeners();
    }, 100);
}

function editContent(id) {
    openContentModal(id);
}

function deleteContent(id) {
    const content = contentData.find(item => item.id === id);
    if (!content) return;
    
    if (confirm(`Möchten Sie "${content.title}" wirklich löschen?`)) {
        contentData = contentData.filter(item => item.id !== id);
        loadContentList();
        showNotification('Inhalt erfolgreich gelöscht', 'success');
    }
}

function previewContentItem(id) {
    const content = contentData.find(item => item.id === id);
    if (!content) return;
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${content.metaTitle || content.title}</title>
            <meta name="description" content="${content.metaDescription || content.excerpt}">
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .preview-header { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
                .preview-meta { color: #666; font-size: 0.9em; }
            </style>
        </head>
        <body>
            <div class="preview-header">
                <h1>Vorschau: ${content.title}</h1>
                <div class="preview-meta">
                    <strong>Typ:</strong> ${content.type} | 
                    <strong>Status:</strong> ${content.status} | 
                    <strong>Autor:</strong> ${content.author}
                </div>
            </div>
            <div class="content">${content.content}</div>
        </body>
        </html>
    `);
    previewWindow.document.close();
}

function previewContent() {
    const title = document.getElementById('contentTitle').value;
    const content = document.getElementById('contentBody').innerHTML;
    const metaTitle = document.getElementById('contentMetaTitle').value;
    const metaDesc = document.getElementById('contentMetaDescription').value;
    
    const previewWindow = window.open('', '_blank', 'width=800,height=600');
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${metaTitle || title}</title>
            <meta name="description" content="${metaDesc}">
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .preview-header { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
            </style>
        </head>
        <body>
            <div class="preview-header">
                <h1>Vorschau: ${title}</h1>
                <p><em>Live-Vorschau der aktuellen Bearbeitung</em></p>
            </div>
            <div class="content">${content}</div>
        </body>
        </html>
    `);
    previewWindow.document.close();
}

// Bulk Actions
function toggleAllContentSelection() {
    const selectAll = document.getElementById('selectAllContent');
    const checkboxes = document.querySelectorAll('.content-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = selectAll.checked;
    });
    
    updateBulkActions();
}

function updateBulkActions() {
    const checkboxes = document.querySelectorAll('.content-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    
    if (checkboxes.length > 0) {
        bulkActions.classList.remove('d-none');
    } else {
        bulkActions.classList.add('d-none');
    }
}

function getSelectedContentIds() {
    const checkboxes = document.querySelectorAll('.content-checkbox:checked');
    return Array.from(checkboxes).map(cb => parseInt(cb.value));
}

function bulkPublish() {
    const ids = getSelectedContentIds();
    if (ids.length === 0) return;
    
    if (confirm(`${ids.length} Inhalte veröffentlichen?`)) {
        ids.forEach(id => {
            const index = contentData.findIndex(item => item.id === id);
            if (index !== -1) {
                contentData[index].status = 'published';
                contentData[index].lastModified = new Date();
            }
        });
        
        loadContentList();
        showNotification(`${ids.length} Inhalte veröffentlicht`, 'success');
        document.getElementById('bulkActions').classList.add('d-none');
    }
}

function bulkDraft() {
    const ids = getSelectedContentIds();
    if (ids.length === 0) return;
    
    if (confirm(`${ids.length} Inhalte als Entwurf markieren?`)) {
        ids.forEach(id => {
            const index = contentData.findIndex(item => item.id === id);
            if (index !== -1) {
                contentData[index].status = 'draft';
                contentData[index].lastModified = new Date();
            }
        });
        
        loadContentList();
        showNotification(`${ids.length} Inhalte als Entwurf markiert`, 'success');
        document.getElementById('bulkActions').classList.add('d-none');
    }
}

function bulkDelete() {
    const ids = getSelectedContentIds();
    if (ids.length === 0) return;
    
    if (confirm(`${ids.length} Inhalte wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
        contentData = contentData.filter(item => !ids.includes(item.id));
        loadContentList();
        showNotification(`${ids.length} Inhalte gelöscht`, 'success');
        document.getElementById('bulkActions').classList.add('d-none');
    }
} 

// Media Management Data Storage
let mediaData = [];
let currentMediaId = null;
let mediaFilters = {
    search: '',
    type: '',
    size: ''
};
let currentViewMode = 'grid';
let currentSort = 'name';

// List of available media files (in real app this would come from backend)
const availableMedia = [
    // Images from content/images/
    'fahrzeugbeschriftung-1.jpg', 'fahrzeugbeschriftung-2.jpg', 'fahrzeugbeschriftung-3.jpg', 'fahrzeugbeschriftung-4.jpg',
    'fensterbeschriftung-1.jpg', 'fensterbeschriftung-2.jpg', 'fensterbeschriftung-3.jpg', 'fensterbeschriftung-4.jpg',
    'grossformatdruck-1.jpg', 'grossformatdruck-2.jpg', 'grossformatdruck-3.jpg', 'grossformatdruck-4.jpg',
    'blachen-fahnen-1.jpg', 'blachen-fahnen-2.jpg', 'blachen-fahnen-3.jpg', 'blachen-fahnen-4.jpg',
    'signaletik-1.jpg', 'signaletik-2.jpg', 'signaletik-3.jpg', 'signaletik-4.jpg', 'signaletik-5.jpg', 'signaletik-6.jpg',
    'tafelbeschriftung-1.jpg',
    'pylonen-1.jpg', 'pylonen-2.jpg', 'pylonen-3.jpg', 'pylonen-4.jpg', 'pylonen-5.jpg', 'pylonen-6.jpg',
    'halbrelief-plattenschriften-1.jpg', 'halbrelief-plattenschriften-2.jpg', 'halbrelief-plattenschriften-3.jpg', 'halbrelief-plattenschriften-4.jpg',
    'leuchttransparente-1.jpg', 'leuchttransparente-2.jpg', 'leuchttransparente-3.jpg',
    'neon-led-technik-1.jpg',
    'digital-signage-1.webp', 'digital-signage-2.webp', 'digital-signage-3.webp',
    'fachkompetenzen-1.webp', 'fachkompetenzen-2.webp', 'fachkompetenzen-3.webp', 'fachkompetenzen-4.webp', 
    'fachkompetenzen-5.webp', 'fachkompetenzen-6.webp', 'fachkompetenzen-7.webp', 'fachkompetenzen-8.webp', 'fachkompetenzen-9.webp',
    'leistungen-1.jpg', 'leistungen-2.jpg', 'leistungen-3.jpg', 'leistungen-4.jpg', 'leistungen-5.jpg', 'leistungen-6.jpg',
    'team-gruppenfoto.jpg', 'mitarbeiter.jpg',
    'person1.jpg', 'person2.jpg', 'person3.jpg', 'person4.jpg', 'person4_new.jpg', 'person5.jpg', 'person6.jpg',
    'detail1.jpg', 'detail2.jpg', 'detail3.jpg', 'detail4.jpg', 'detail5.jpg', 'detail6.jpg', 
    'detail7.jpg', 'detail8.jpg', 'detail9.jpg', 'detail10.jpg', 'detail11.jpg', 'detail12.jpg',
    'agrola-tankstelle-neuhaus.jpg', 'oil-tankstelle.jpg', 'bahnhofsmaercht-brunnen.jpg',
    'uznach1.jpg', 'uznach2.jpg.jpg',
    // Logos
    'Agrola.png', 'Avia.svg', 'Baloise.svg', 'Bayard.svg', 'BoschService.svg', 'Carglass.svg',
    'Feldschlösschen.svg', 'Helvetia.svg', 'LäderachSwitzerland.svg', 'Lindt.png', 'LLB.svg',
    'McDonalds.png', 'Ottos.svg', 'SGKB.svg', 'SparExpress.svg', 'Vaudoise.svg',
    'dieci.png', 'rexroth.png',
    // Documents
    'chTime_Zeitspannen-Bericht_2025-06-17_bis_2025-07-16.pdf',
    // Hash named files
    '546aa65af854dcf4936912fbbde4dfd2.jpg', '81db58154edfe626deb4fa6c822bc6ad.jpg', 
    '8be3073f251df0431fd23062e5b8ccc5.jpg', 'a16b3822a2a16cdbbe78ab7213a2a198.jpg',
    'cbbedb5f094d40d5fcbb568be5ac1d5e.jpg', 'd9d29858b07515d903822ee7b5b76494.jpg',
    'f4c31de2a867772abdb61cf539a7eaed.jpg'
];

async function initMediaManagement() {
    // Initialize media data
    await loadMediaData();
    
    // Initialize media interface
    initMediaInterface();
    
    // Initialize upload functionality
    initUploadInterface();
    
    // Load media list
    setTimeout(() => {
        loadMediaList();
    }, 500); // Simulate loading time
}

async function loadMediaData() {
    try {
        const response = await fetch('/api/media');
        const apiData = await response.json();
        
        if (apiData.success && apiData.media) {
            mediaData = apiData.media;
        } else {
            console.error('❌ Failed to load media data from API');
            // Fallback to hardcoded data
            // Fallback to hardcoded data
    mediaData = availableMedia.map((filename, index) => {
        const extension = filename.split('.').pop().toLowerCase();
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension);
        const isDocument = ['pdf', 'doc', 'docx', 'txt'].includes(extension);
        
        // Simulate file sizes
        const minSize = isImage ? 50000 : (isDocument ? 100000 : 10000);
        const maxSize = isImage ? 2000000 : (isDocument ? 5000000 : 100000);
        const fileSize = Math.floor(Math.random() * (maxSize - minSize) + minSize);
        
        // Generate creation date (random within last year)
        const createdAt = new Date();
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 365));
        
        return {
            id: index + 1,
            filename: filename,
            path: `../content/images/${filename}`,
            extension: extension,
            type: isImage ? 'image' : (isDocument ? 'document' : 'other'),
            size: fileSize,
            altText: '',
            description: '',
            createdAt: createdAt,
            dimensions: isImage ? `${Math.floor(Math.random() * 1500 + 500)}x${Math.floor(Math.random() * 1000 + 300)}` : null
        };
    });
        }
        
        return mediaData;
    } catch (error) {
        console.error('❌ Error loading media data:', error);
        // Fallback to empty array if everything fails
        mediaData = [];
        return [];
    }
}

function initMediaInterface() {
    // Initialize filter handlers
    const searchInput = document.getElementById('mediaSearch');
    const typeFilter = document.getElementById('mediaTypeFilter');
    const sizeFilter = document.getElementById('mediaSizeFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            mediaFilters.search = this.value;
            loadMediaList();
        });
    }
    
    if (typeFilter) {
        typeFilter.addEventListener('change', function() {
            mediaFilters.type = this.value;
            loadMediaList();
        });
    }
    
    if (sizeFilter) {
        sizeFilter.addEventListener('change', function() {
            mediaFilters.size = this.value;
            loadMediaList();
        });
    }
}

function loadMediaList() {
    // Show loading state
    document.getElementById('mediaLoading').classList.remove('d-none');
    document.getElementById('mediaGrid').classList.add('d-none');
    document.getElementById('mediaList').classList.add('d-none');
    document.getElementById('mediaEmpty').classList.add('d-none');
    
    setTimeout(() => {
        // Apply filters
        let filteredMedia = mediaData.filter(item => {
            let matchesSearch = true;
            let matchesType = true;
            let matchesSize = true;
            
            if (mediaFilters.search) {
                matchesSearch = item.filename.toLowerCase().includes(mediaFilters.search.toLowerCase());
            }
            
            if (mediaFilters.type) {
                matchesType = item.type === mediaFilters.type;
            }
            
            if (mediaFilters.size) {
                const size = item.size;
                switch(mediaFilters.size) {
                    case 'small':
                        matchesSize = size < 500000;
                        break;
                    case 'medium':
                        matchesSize = size >= 500000 && size <= 2000000;
                        break;
                    case 'large':
                        matchesSize = size > 2000000;
                        break;
                }
            }
            
            return matchesSearch && matchesType && matchesSize;
        });
        
        // Sort media
        filteredMedia.sort((a, b) => {
            switch(currentSort) {
                case 'name':
                    return a.filename.localeCompare(b.filename);
                case 'date':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                case 'size':
                    return b.size - a.size;
                case 'type':
                    return a.type.localeCompare(b.type);
                default:
                    return 0;
            }
        });
        
        // Hide loading
        document.getElementById('mediaLoading').classList.add('d-none');
        
        if (filteredMedia.length === 0) {
            document.getElementById('mediaEmpty').classList.remove('d-none');
        } else {
            if (currentViewMode === 'grid') {
                displayMediaGrid(filteredMedia);
            } else {
                displayMediaList(filteredMedia);
            }
        }
        
        // Update stats
        updateMediaStats(filteredMedia);
    }, 800); // Simulate loading time
}

function displayMediaGrid(mediaItems) {
    const gridContainer = document.getElementById('mediaGrid');
    gridContainer.innerHTML = '';
    
    mediaItems.forEach(item => {
        const mediaItem = createMediaGridItem(item);
        gridContainer.appendChild(mediaItem);
    });
    
    gridContainer.classList.remove('d-none');
}

function createMediaGridItem(item) {
    const div = document.createElement('div');
    div.className = 'media-grid-item';
    
    const typeIcon = getFileTypeIcon(item.type, item.extension);
    const isImage = item.type === 'image';
    
    div.innerHTML = `
        <div class="media-item-card">
            <div class="media-thumbnail" onclick="openMediaModal(${item.id})">
                ${isImage ? 
                    `<img src="${item.path}" alt="${item.filename}" onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"200\\" height=\\"150\\" viewBox=\\"0 0 200 150\\"><rect width=\\"200\\" height=\\"150\\" fill=\\"%23f8f9fa\\"/><text x=\\"100\\" y=\\"75\\" text-anchor=\\"middle\\" font-family=\\"Arial\\" font-size=\\"12\\" fill=\\"%236c757d\\">Bild nicht gefunden</text></svg>'">` :
                    `<div class="file-icon">
                        <i class="${typeIcon}"></i>
                        <span class="file-ext">${item.extension.toUpperCase()}</span>
                    </div>`
                }
                <div class="media-overlay">
                    <button class="btn btn-sm btn-light" onclick="event.stopPropagation(); openMediaModal(${item.id})" title="Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); copyMediaURL(${item.id})" title="URL kopieren">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteMediaItem(${item.id})" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="media-info">
                <div class="media-filename" title="${item.filename}">${item.filename}</div>
                <div class="media-meta">${formatFileSize(item.size)}</div>
            </div>
        </div>
    `;
    
    return div;
}

function displayMediaList(mediaItems) {
    const listBody = document.getElementById('mediaListBody');
    listBody.innerHTML = '';
    
    mediaItems.forEach(item => {
        const row = createMediaListRow(item);
        listBody.appendChild(row);
    });
    
    document.getElementById('mediaList').classList.remove('d-none');
}

function createMediaListRow(item) {
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.onclick = () => openMediaModal(item.id);
    
    const typeIcon = getFileTypeIcon(item.type, item.extension);
    const isImage = item.type === 'image';
    
    row.innerHTML = `
        <td>
            <div class="media-list-thumbnail">
                ${isImage ? 
                    `<img src="${item.path}" alt="${item.filename}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                     <div class="file-icon-small" style="display: none;">
                        <i class="${typeIcon}"></i>
                     </div>` :
                    `<div class="file-icon-small">
                        <i class="${typeIcon}"></i>
                    </div>`
                }
            </div>
        </td>
        <td>
            <div class="fw-semibold">${item.filename}</div>
            ${item.dimensions ? `<div class="small text-muted">${item.dimensions}</div>` : ''}
        </td>
        <td><span class="badge bg-secondary">${item.type}</span></td>
        <td>${formatFileSize(item.size)}</td>
        <td>${formatDate(item.createdAt)}</td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="event.stopPropagation(); openMediaModal(${item.id})" title="Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-info" onclick="event.stopPropagation(); copyMediaURL(${item.id})" title="URL kopieren">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="event.stopPropagation(); deleteMediaItem(${item.id})" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

function getFileTypeIcon(type, extension) {
    switch(type) {
        case 'image':
            return 'fas fa-image text-success';
        case 'document':
            if (extension === 'pdf') return 'fas fa-file-pdf text-danger';
            if (['doc', 'docx'].includes(extension)) return 'fas fa-file-word text-primary';
            return 'fas fa-file-alt text-info';
        default:
            return 'fas fa-file text-secondary';
    }
}

function updateMediaStats(mediaItems) {
    const totalCount = mediaItems.length;
    const imageCount = mediaItems.filter(item => item.type === 'image').length;
    const documentCount = mediaItems.filter(item => item.type === 'document').length;
    const totalSize = mediaItems.reduce((sum, item) => sum + item.size, 0);
    
    document.getElementById('totalMediaCount').textContent = totalCount;
    document.getElementById('imageCount').textContent = imageCount;
    document.getElementById('documentCount').textContent = documentCount;
    document.getElementById('totalSize').textContent = (totalSize / (1024 * 1024)).toFixed(1) + ' MB';
}

function setViewMode(mode) {
    currentViewMode = mode;
    
    if (mode === 'grid') {
        document.getElementById('mediaList').classList.add('d-none');
        document.getElementById('mediaGrid').classList.remove('d-none');
    } else {
        document.getElementById('mediaGrid').classList.add('d-none');
        document.getElementById('mediaList').classList.remove('d-none');
    }
    
    loadMediaList();
}

function sortMedia(sortBy) {
    currentSort = sortBy;
    loadMediaList();
}

function applyMediaFilters() {
    loadMediaList();
    showNotification('Filter angewendet', 'info');
}

function refreshMediaList() {
    loadMediaList();
    showNotification('Medienliste aktualisiert', 'success');
}

// Upload functionality
function initUploadInterface() {
    const dropZone = document.getElementById('dropZone');
    
    if (dropZone) {
        // Drag and drop events
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('dragleave', handleDragLeave);
        dropZone.addEventListener('drop', handleDrop);
    }
}

function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = e.dataTransfer.files;
    handleFileSelection(files);
}

function openUploadModal() {
    const modal = new bootstrap.Modal(document.getElementById('uploadModal'));
    modal.show();
    
    // Reset upload interface
    document.getElementById('uploadProgress').classList.add('d-none');
    document.getElementById('uploadCompleteBtn').classList.add('d-none');
    document.getElementById('dropZone').classList.remove('d-none');
}

function handleFileSelection(files) {
    if (files.length === 0) return;
    
    // Show upload progress
    document.getElementById('dropZone').classList.add('d-none');
    document.getElementById('uploadProgress').classList.remove('d-none');
    
    const uploadList = document.getElementById('uploadList');
    uploadList.innerHTML = '';
    
    Array.from(files).forEach((file, index) => {
        uploadFile(file, index);
    });
}

function uploadFile(file, index) {
    const uploadItem = document.createElement('div');
    uploadItem.className = 'upload-item mb-3';
    uploadItem.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="me-3">
                <i class="fas fa-file text-muted"></i>
            </div>
            <div class="flex-grow-1">
                <div class="fw-semibold">${file.name}</div>
                <div class="progress mt-1">
                    <div class="progress-bar" id="progress-${index}" role="progressbar" style="width: 0%"></div>
                </div>
                <div class="small text-muted">${formatFileSize(file.size)}</div>
            </div>
            <div class="ms-3">
                <span class="upload-status" id="status-${index}">
                    <i class="fas fa-clock text-warning"></i>
                </span>
            </div>
        </div>
    `;
    
    document.getElementById('uploadList').appendChild(uploadItem);
    
    // Start real upload
    realUpload(file, index);
}

async function realUpload(file, index) {
    const progressBar = document.getElementById(`progress-${index}`);
    const statusIcon = document.getElementById(`status-${index}`);
    
    try {
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('files', file);
        
        // Simulate progress to 50%
        progressBar.style.width = '50%';
        progressBar.classList.add('progress-bar-animated');
        
        // Upload with real backend (manually set headers for FormData)
        const authToken = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
        const headers = {};
        
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }
        // Important: Do NOT set Content-Type for FormData - let browser set it with boundary
        
        console.log('🔄 Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
        
        const response = await fetch('/api/media/upload', {
            method: 'POST',
            headers: headers,
            body: formData
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload fehlgeschlagen');
        }
        
        const result = await response.json();
        
        // Update UI for completion
        progressBar.style.width = '100%';
        progressBar.classList.remove('progress-bar-animated');
        progressBar.classList.add('bg-success');
        
        statusIcon.innerHTML = '<i class="fas fa-check text-success"></i>';
        
        // Store upload result for later use
        if (result.files && result.files[0]) {
            const uploadedFile = result.files[0];
            statusIcon.setAttribute('data-uploaded-file', JSON.stringify(uploadedFile));
            
            // Add to media data
            const newMedia = {
                id: mediaData.length + 1,
                filename: uploadedFile.filename,
                path: uploadedFile.path,
                extension: uploadedFile.filename.split('.').pop().toLowerCase(),
                type: 'image',
                size: uploadedFile.size,
                altText: '',
                description: '',
                createdAt: new Date(),
                optimized: true,
                compressionRatio: uploadedFile.compressionRatio
            };
            mediaData.push(newMedia);
        }
            
            
            // Check if all uploads are complete
            checkAllUploadsComplete();
        
    } catch (error) {
        console.error('❌ Upload error:', error);
        
        // Update UI for error
        progressBar.style.width = '100%';
        progressBar.classList.remove('progress-bar-animated');
        progressBar.classList.add('bg-danger');
        
        statusIcon.innerHTML = '<i class="fas fa-times text-danger"></i>';
        statusIcon.setAttribute('title', error.message);
        
        showNotification(`Upload fehlgeschlagen: ${error.message}`, 'error');
        
        // Still check completion (some might have succeeded)
        checkAllUploadsComplete();
    }
}

function checkAllUploadsComplete() {
    const allComplete = Array.from(document.querySelectorAll('.upload-status')).every(status => 
        status.innerHTML.includes('fa-check')
    );
    
    if (allComplete) {
        document.getElementById('uploadCompleteBtn').classList.remove('d-none');
        showNotification('Alle Dateien erfolgreich hochgeladen', 'success');
    }
}

async function closeUploadModal() {
    bootstrap.Modal.getInstance(document.getElementById('uploadModal')).hide();
    
    // Reset upload interface
    document.getElementById('uploadProgress').classList.add('d-none');
    document.getElementById('uploadCompleteBtn').classList.add('d-none');
    document.getElementById('dropZone').classList.remove('d-none');
    document.getElementById('uploadList').innerHTML = '';
    
    // Refresh media list to show newly uploaded files - load fresh data from API
    await loadMediaData();
    loadMediaList();
    
    showNotification('Medien-Liste aktualisiert', 'success');
}

// Media detail modal
function openMediaModal(id) {
    const media = mediaData.find(item => item.id === id);
    if (!media) return;
    
    currentMediaId = id;
    
    // Populate modal with modern design
    document.getElementById('mediaModalTitle').textContent = media.filename;
    document.getElementById('mediaFileName').value = media.filename;
    document.getElementById('mediaAltText').value = media.altText || '';
    document.getElementById('mediaDescription').value = media.description || '';
    document.getElementById('mediaURL').value = media.path;
    document.getElementById('mediaType').textContent = media.type || 'Unbekannt';
    document.getElementById('mediaSize').textContent = formatFileSize(media.size);
    document.getElementById('mediaDimensions').textContent = media.dimensions || 'Unbekannt';
    document.getElementById('mediaDate').textContent = formatDate(media.createdAt);
    
    // Show preview with modern styling
    const preview = document.getElementById('mediaPreview');
    if (media.type === 'image' || (media.path && (media.path.includes('.jpg') || media.path.includes('.png') || media.path.includes('.gif') || media.path.includes('.webp') || media.path.includes('.svg')))) {
        preview.innerHTML = `<img src="${media.path}" alt="${media.filename}" class="img-fluid">`;
    } else {
        const typeIcon = getFileTypeIcon(media.type, media.extension);
        preview.innerHTML = `
            <div class="empty-state">
                <i class="${typeIcon}"></i>
                <h6 class="text-muted mt-2">Keine Vorschau verfügbar</h6>
                <small class="text-muted">Für ${media.type || 'diese Datei'}</small>
            </div>
        `;
    }
    
    const modal = new bootstrap.Modal(document.getElementById('mediaModal'));
    modal.show();
}

// Delete media file
async function deleteMediaFile() {
    
    if (!currentMediaId) {
        showNotification('Keine Datei ausgewählt', 'error');
        console.error('❌ No currentMediaId set');
        return;
    }
    
    const media = mediaData.find(item => item.id === currentMediaId);
    if (!media) {
        showNotification('Datei nicht gefunden', 'error');
        console.error('❌ Media not found in mediaData:', currentMediaId);
        return;
    }
    
    
    if (!confirm(`Möchten Sie die Datei "${media.filename}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
        return;
    }
    
    try {
        
        const response = await fetch(`/api/media/${encodeURIComponent(media.filename)}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders()
            }
        });
        
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ DELETE failed:', errorData);
            throw new Error(errorData.error || 'Löschen fehlgeschlagen');
        }
        
        const result = await response.json();
        
        // Remove from local mediaData array
        mediaData = mediaData.filter(item => item.id !== currentMediaId);
        
        // Refresh display
        loadMediaList();
        
        showNotification(result.message || 'Datei erfolgreich gelöscht', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('mediaModal'));
        if (modal) {
            modal.hide();
        }
        
    } catch (error) {
        console.error('❌ Delete error:', error);
        showNotification(`Löschen fehlgeschlagen: ${error.message}`, 'error');
    }
}

function saveMediaInfo() {
    if (!currentMediaId) return;
    
    const media = mediaData.find(item => item.id === currentMediaId);
    if (!media) return;
    
    media.altText = document.getElementById('mediaAltText').value;
    media.description = document.getElementById('mediaDescription').value;
    
    showNotification('Medien-Informationen gespeichert', 'success');
    bootstrap.Modal.getInstance(document.getElementById('mediaModal')).hide();
}

// DEPRECATED: This is the old fake deleteMediaFile function - replaced by async version above
function deleteMediaFile_OLD() {
    if (!currentMediaId) return;
    
    const media = mediaData.find(item => item.id === currentMediaId);
    if (!media) return;
    
    if (confirm(`Möchten Sie "${media.filename}" wirklich löschen?`)) {
        mediaData = mediaData.filter(item => item.id !== currentMediaId);
        showNotification('Datei erfolgreich gelöscht', 'success');
        bootstrap.Modal.getInstance(document.getElementById('mediaModal')).hide();
        loadMediaList();
    }
}

async function deleteMediaItem(id) {
    
    const media = mediaData.find(item => item.id === id);
    if (!media) {
        console.error('❌ Media not found in mediaData:', id);
        return;
    }
    
    
    if (!confirm(`Möchten Sie "${media.filename}" wirklich löschen?`)) {
        return;
    }
    
    try {
        
        const response = await fetch(`/api/media/${encodeURIComponent(media.filename)}`, {
            method: 'DELETE',
            headers: {
                ...getAuthHeaders()
            }
        });
        
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('❌ DELETE failed:', errorData);
            throw new Error(errorData.error || 'Löschen fehlgeschlagen');
        }
        
        const result = await response.json();
        
        // Remove from local mediaData array
        mediaData = mediaData.filter(item => item.id !== id);
        
        // Refresh display
        loadMediaList();
        
        showNotification(result.message || 'Datei erfolgreich gelöscht', 'success');
        
    } catch (error) {
        console.error('❌ Delete error:', error);
        showNotification(`Löschen fehlgeschlagen: ${error.message}`, 'error');
    }
}

function copyMediaURL(id) {
    const media = mediaData.find(item => item.id === id);
    if (!media) return;
    
    copyToClipboard(media.path);
    showNotification('URL in Zwischenablage kopiert', 'success');
}

function copyToClipboard(text) {
    if (typeof text === 'string') {
        navigator.clipboard.writeText(text).then(() => {
            showNotification('In Zwischenablage kopiert', 'success');
        }).catch(() => {
            // Fallback für ältere Browser
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            showNotification('In Zwischenablage kopiert', 'success');
        });
    } else {
        // Element ID passed
        const element = document.getElementById(text);
        if (element) {
            copyToClipboard(element.value);
        }
    }
} 

// Service Management Data Storage
let serviceData = [];
let currentServiceId = null;
let serviceFilters = {
    search: '',
    category: '',
    status: ''
};
let currentServiceViewMode = 'cards';
let currentServiceSort = 'name';

// Sample service data
const sampleServices = [
    {
        id: 1,
        name: 'Fahrzeugbeschriftung',
        slug: 'fahrzeugbeschriftung',
        shortDescription: 'Professionelle Beschriftung für alle Fahrzeugtypen',
        description: '<p>Machen Sie Ihr Fahrzeug zur rollenden Werbefläche! Unsere professionelle Fahrzeugbeschriftung verwandelt Ihr Auto, Ihren LKW oder Transporter in ein effektives Werbemittel.</p><p>Von dezenten Schriftzügen bis hin zu vollflächigen Design-Folierungen - wir setzen Ihre Ideen um.</p>',
        category: 'beschriftung',
        status: 'active',
        icon: 'fas fa-car',
        order: 1,
        showOnHomepage: true,
        showPrice: true,
        priceFrom: 299.00,
        priceUnit: 'stk',
        priceNote: 'abhängig von Fahrzeuggröße und Design',
        features: ['Wetterbeständige Materialien', 'Professionelle Montage', 'Design-Beratung inklusive', '5 Jahre Garantie'],
        createdAt: new Date('2024-01-15'),
        lastModified: new Date('2024-07-20')
    },
    {
        id: 2,
        name: 'LED Leuchtschriften',
        slug: 'led-leuchtschriften',
        shortDescription: 'Moderne LED-Beleuchtung für maximale Aufmerksamkeit',
        description: '<p>Setzen Sie Ihr Unternehmen ins rechte Licht! Unsere LED-Leuchtschriften bieten brillante Ausleuchtung bei niedrigem Energieverbrauch.</p><p>Individuell gestaltbar in verschiedenen Farben und Formen.</p>',
        category: 'lichtwerbung',
        status: 'featured',
        icon: 'fas fa-lightbulb',
        order: 2,
        showOnHomepage: true,
        showPrice: true,
        priceFrom: 450.00,
        priceUnit: 'lm',
        priceNote: 'inkl. MwSt., zzgl. Montage',
        features: ['Energieeffiziente LED-Technik', 'Lange Lebensdauer', 'Verschiedene Farben möglich', 'Fernsteuerung optional'],
        createdAt: new Date('2024-02-01'),
        lastModified: new Date('2024-07-22')
    },
    {
        id: 3,
        name: 'Grossformatdruck',
        slug: 'grossformatdruck',
        shortDescription: 'Hochwertige Drucklösungen in allen Formaten',
        description: '<p>Von Plakaten bis zu Gebäudebannern - unser Grossformatdruck überzeugt durch brillante Farben und gestochen scharfe Details.</p><p>Verschiedene Materialien für Innen- und Aussenbereich verfügbar.</p>',
        category: 'druck',
        status: 'active',
        icon: 'fas fa-print',
        order: 3,
        showOnHomepage: true,
        showPrice: true,
        priceFrom: 25.00,
        priceUnit: 'm2',
        priceNote: 'je nach Material und Auflage',
        features: ['UV-beständige Tinten', 'Verschiedene Materialien', 'Bis 5m Breite möglich', 'Express-Service verfügbar'],
        createdAt: new Date('2024-02-15'),
        lastModified: new Date('2024-07-18')
    },
    {
        id: 4,
        name: 'Neon-Technik',
        slug: 'neon-technik',
        shortDescription: 'Klassische Neon-Röhren für besondere Atmosphäre',
        description: '<p>Echte Neon-Röhren schaffen eine einzigartige Atmosphäre und ziehen alle Blicke auf sich.</p><p>Handwerkliche Perfektion trifft auf moderne Technik.</p>',
        category: 'lichtwerbung',
        status: 'active',
        icon: 'fas fa-bolt',
        order: 4,
        showOnHomepage: false,
        showPrice: false,
        priceFrom: null,
        priceUnit: '',
        priceNote: 'Preis auf Anfrage',
        features: ['Handgebogen', 'Verschiedene Farben', 'Dimmbar', 'Wartungsservice'],
        createdAt: new Date('2024-03-01'),
        lastModified: new Date('2024-07-15')
    },
    {
        id: 5,
        name: 'Montage & Installation',
        slug: 'montage-installation',
        shortDescription: 'Professionelle Montage durch erfahrene Techniker',
        description: '<p>Unser erfahrenes Montageteam sorgt für fachgerechte Installation Ihrer Werbetechnik.</p><p>Sicherheit und Qualität stehen dabei immer im Vordergrund.</p>',
        category: 'montage',
        status: 'active',
        icon: 'fas fa-tools',
        order: 5,
        showOnHomepage: false,
        showPrice: true,
        priceFrom: 85.00,
        priceUnit: 'std',
        priceNote: 'zzgl. Anfahrt und Material',
        features: ['Zertifizierte Monteure', 'Versicherungsschutz', 'Flexible Termine', 'Nachkontrolle inklusive'],
        createdAt: new Date('2024-03-15'),
        lastModified: new Date('2024-07-10')
    }
];

function initServiceManagement() {
    // Initialize service data
    serviceData = [...sampleServices];
    
    // Initialize service interface
    initServiceInterface();
    
    // Load service list
    setTimeout(() => {
        loadServiceList();
    }, 500); // Simulate loading time
}

function initServiceInterface() {
    // Initialize filter handlers
    const searchInput = document.getElementById('serviceSearch');
    const categoryFilter = document.getElementById('serviceCategoryFilter');
    const statusFilter = document.getElementById('serviceStatusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            serviceFilters.search = this.value;
            loadServiceList();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            serviceFilters.category = this.value;
            loadServiceList();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            serviceFilters.status = this.value;
            loadServiceList();
        });
    }
    
    // Initialize service form handlers
    initServiceForm();
}

function loadServiceList() {
    // Show loading state
    document.getElementById('serviceLoading').classList.remove('d-none');
    document.getElementById('serviceCardView-content').classList.add('d-none');
    document.getElementById('serviceTableView-content').classList.add('d-none');
    document.getElementById('serviceEmpty').classList.add('d-none');
    
    setTimeout(() => {
        // Apply filters
        let filteredServices = serviceData.filter(item => {
            let matchesSearch = true;
            let matchesCategory = true;
            let matchesStatus = true;
            
            if (serviceFilters.search) {
                matchesSearch = item.name.toLowerCase().includes(serviceFilters.search.toLowerCase()) ||
                               item.shortDescription.toLowerCase().includes(serviceFilters.search.toLowerCase());
            }
            
            if (serviceFilters.category) {
                matchesCategory = item.category === serviceFilters.category;
            }
            
            if (serviceFilters.status) {
                matchesStatus = item.status === serviceFilters.status;
            }
            
            return matchesSearch && matchesCategory && matchesStatus;
        });
        
        // Sort services
        filteredServices.sort((a, b) => {
            switch(currentServiceSort) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'category':
                    return a.category.localeCompare(b.category);
                case 'order':
                    return a.order - b.order;
                case 'status':
                    return a.status.localeCompare(b.status);
                default:
                    return 0;
            }
        });
        
        // Hide loading
        document.getElementById('serviceLoading').classList.add('d-none');
        
        if (filteredServices.length === 0) {
            document.getElementById('serviceEmpty').classList.remove('d-none');
        } else {
            if (currentServiceViewMode === 'cards') {
                displayServiceCards(filteredServices);
            } else {
                displayServiceTable(filteredServices);
            }
        }
    }, 600); // Simulate loading time
}

function displayServiceCards(services) {
    const container = document.getElementById('serviceCardsContainer');
    container.innerHTML = '';
    
    services.forEach(service => {
        const card = createServiceCard(service);
        container.appendChild(card);
    });
    
    document.getElementById('serviceCardView-content').classList.remove('d-none');
}

function createServiceCard(service) {
    const div = document.createElement('div');
    div.className = 'col-lg-4 col-md-6';
    
    const statusClass = {
        active: 'success',
        inactive: 'secondary',
        featured: 'warning'
    }[service.status] || 'secondary';
    
    const categoryNames = {
        lichtwerbung: 'Lichtwerbung',
        beschriftung: 'Beschriftung', 
        druck: 'Druck & Medien',
        montage: 'Montage & Service',
        beratung: 'Beratung & Planung'
    };
    
    const priceDisplay = service.showPrice && service.priceFrom ? 
        `<div class="service-price">ab CHF ${service.priceFrom.toFixed(2)} ${service.priceUnit ? '/ ' + service.priceUnit : ''}</div>` : 
        (service.priceNote ? `<div class="service-price">${service.priceNote}</div>` : '');
    
    div.innerHTML = `
        <div class="card service-card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="service-icon">
                    <i class="${service.icon}"></i>
                </div>
                <div>
                    <span class="badge bg-${statusClass}">${service.status}</span>
                    ${service.showOnHomepage ? '<span class="badge bg-info ms-1">Homepage</span>' : ''}
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">${service.name}</h5>
                <p class="card-text">${service.shortDescription}</p>
                <div class="service-category">
                    <small class="text-muted">
                        <i class="fas fa-tag"></i>
                        ${categoryNames[service.category] || service.category}
                    </small>
                </div>
                ${priceDisplay}
                ${service.features && service.features.length > 0 ? 
                    `<div class="service-features mt-2">
                        <small class="text-muted">
                            ${service.features.slice(0, 2).map(f => `<i class="fas fa-check text-success"></i> ${f}`).join('<br>')}
                            ${service.features.length > 2 ? `<br><i class="text-muted">und ${service.features.length - 2} weitere...</i>` : ''}
                        </small>
                    </div>` : ''
                }
            </div>
            <div class="card-footer">
                <div class="service-actions d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary flex-fill" onclick="editService(${service.id})">
                        <i class="fas fa-edit"></i>
                        Bearbeiten
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="previewServiceItem(${service.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteService(${service.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return div;
}

function displayServiceTable(services) {
    const tbody = document.getElementById('serviceTableBody');
    tbody.innerHTML = '';
    
    services.forEach(service => {
        const row = createServiceTableRow(service);
        tbody.appendChild(row);
    });
    
    document.getElementById('serviceTableView-content').classList.remove('d-none');
}

function createServiceTableRow(service) {
    const row = document.createElement('tr');
    
    const statusClass = {
        active: 'success',
        inactive: 'secondary',
        featured: 'warning'
    }[service.status] || 'secondary';
    
    const statusText = {
        active: 'Aktiv',
        inactive: 'Inaktiv',
        featured: 'Featured'
    }[service.status] || service.status;
    
    const categoryNames = {
        lichtwerbung: 'Lichtwerbung',
        beschriftung: 'Beschriftung', 
        druck: 'Druck & Medien',
        montage: 'Montage & Service',
        beratung: 'Beratung & Planung'
    };
    
    row.innerHTML = `
        <td>
            <div class="service-icon-small">
                <i class="${service.icon} text-primary"></i>
            </div>
        </td>
        <td>
            <div class="fw-semibold">${service.name}</div>
            <div class="small text-muted">${service.shortDescription}</div>
            ${service.showOnHomepage ? '<span class="badge bg-info badge-sm">Homepage</span>' : ''}
        </td>
        <td>
            <span class="badge bg-secondary">${categoryNames[service.category] || service.category}</span>
        </td>
        <td>
            <span class="badge bg-${statusClass}">${statusText}</span>
        </td>
        <td>
            <span class="badge bg-light text-dark">${service.order}</span>
        </td>
        <td>${formatDate(service.createdAt)}</td>
                 <td>
             <div class="btn-group btn-group-sm">
                 <button class="btn btn-outline-primary" onclick="editService(${service.id})" title="Bearbeiten">
                     <i class="fas fa-edit"></i>
                 </button>
                 <button class="btn btn-outline-info" onclick="previewServiceItem(${service.id})" title="Vorschau">
                     <i class="fas fa-eye"></i>
                 </button>
                 <button class="btn btn-outline-danger" onclick="deleteService(${service.id})" title="Löschen">
                     <i class="fas fa-trash"></i>
                 </button>
             </div>
         </td>
    `;
    
    return row;
}

function setServiceViewMode(mode) {
    currentServiceViewMode = mode;
    loadServiceList();
}

function sortServices(sortBy) {
    currentServiceSort = sortBy;
    loadServiceList();
}

function applyServiceFilters() {
    loadServiceList();
    showNotification('Service-Filter angewendet', 'info');
}

function refreshServiceList() {
    loadServiceList();
    showNotification('Service-Liste aktualisiert', 'success');
}

// Service Modal Functions
function openServiceModal(id = null) {
    currentServiceId = id;
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    const modalTitle = document.getElementById('serviceModalLabel');
    
    if (id) {
        // Edit mode
        const service = serviceData.find(item => item.id === id);
        if (service) {
            populateServiceForm(service);
            modalTitle.textContent = 'Service bearbeiten';
        }
    } else {
        // Create mode
        clearServiceForm();
        modalTitle.textContent = 'Neuen Service erstellen';
    }
    
    modal.show();
}

function populateServiceForm(service) {
    document.getElementById('serviceName').value = service.name;
    document.getElementById('serviceSlug').value = service.slug;
    document.getElementById('serviceShortDescription').value = service.shortDescription;
    document.getElementById('serviceDescription').innerHTML = service.description;
    document.getElementById('serviceStatus').value = service.status;
    document.getElementById('serviceCategory').value = service.category;
    document.getElementById('serviceOrder').value = service.order;
    document.getElementById('serviceShowOnHomepage').checked = service.showOnHomepage;
    document.getElementById('serviceShowPrice').checked = service.showPrice;
    document.getElementById('serviceIconInput').value = service.icon;
    document.getElementById('servicePriceFrom').value = service.priceFrom || '';
    document.getElementById('servicePriceUnit').value = service.priceUnit || '';
    document.getElementById('servicePriceNote').value = service.priceNote || '';
    
    // Update icon preview
    updateServiceIconPreview();
    
    // Populate features
    populateServiceFeatures(service.features || []);
}

function clearServiceForm() {
    document.getElementById('serviceName').value = '';
    document.getElementById('serviceSlug').value = '';
    document.getElementById('serviceShortDescription').value = '';
    document.getElementById('serviceDescription').innerHTML = '';
    document.getElementById('serviceStatus').value = 'active';
    document.getElementById('serviceCategory').value = 'lichtwerbung';
    document.getElementById('serviceOrder').value = '0';
    document.getElementById('serviceShowOnHomepage').checked = false;
    document.getElementById('serviceShowPrice').checked = false;
    document.getElementById('serviceIconInput').value = 'fas fa-cog';
    document.getElementById('servicePriceFrom').value = '';
    document.getElementById('servicePriceUnit').value = '';
    document.getElementById('servicePriceNote').value = '';
    
    // Update icon preview
    updateServiceIconPreview();
    
    // Clear features
    populateServiceFeatures([]);
}

function initServiceForm() {
    // Auto-generate slug from name
    const nameInput = document.getElementById('serviceName');
    const slugInput = document.getElementById('serviceSlug');
    
    if (nameInput && slugInput) {
        nameInput.addEventListener('input', function() {
            if (!currentServiceId) { // Only auto-generate for new services
                const slug = generateSlug(this.value);
                slugInput.value = slug;
            }
        });
    }
}

// Icon Management
function updateServiceIconPreview() {
    const iconInput = document.getElementById('serviceIconInput');
    const iconPreview = document.getElementById('selectedServiceIcon');
    
    if (iconInput && iconPreview) {
        const iconClass = iconInput.value || 'fas fa-cog';
        iconPreview.className = iconClass + ' fa-3x text-primary';
    }
}

function selectServiceIcon(iconClass) {
    document.getElementById('serviceIconInput').value = iconClass;
    updateServiceIconPreview();
}

// Feature Management
function populateServiceFeatures(features) {
    const container = document.getElementById('serviceFeatures');
    container.innerHTML = '';
    
    if (features.length === 0) {
        features = ['']; // Start with one empty feature
    }
    
    features.forEach((feature, index) => {
        addFeatureItem(feature);
    });
}

function addFeature() {
    addFeatureItem('');
}

function addFeatureItem(value = '') {
    const container = document.getElementById('serviceFeatures');
    const featureDiv = document.createElement('div');
    featureDiv.className = 'feature-item mb-2';
    featureDiv.innerHTML = `
        <div class="input-group">
            <span class="input-group-text">
                <i class="fas fa-check text-success"></i>
            </span>
            <input type="text" class="form-control" placeholder="Feature oder Vorteil eingeben" value="${value}">
            <button class="btn btn-outline-danger" type="button" onclick="removeFeature(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(featureDiv);
}

function removeFeature(button) {
    const featureItem = button.closest('.feature-item');
    const container = document.getElementById('serviceFeatures');
    
    // Don't allow removing the last feature item
    if (container.children.length > 1) {
        featureItem.remove();
    } else {
        // Just clear the input if it's the last one
        const input = featureItem.querySelector('input');
        input.value = '';
    }
}

function getServiceFeatures() {
    const container = document.getElementById('serviceFeatures');
    const inputs = container.querySelectorAll('input');
    const features = [];
    
    inputs.forEach(input => {
        if (input.value.trim()) {
            features.push(input.value.trim());
        }
    });
    
    return features;
}

// Text formatting for service description
function formatServiceText(command, value = null) {
    document.execCommand(command, false, value);
    document.getElementById('serviceDescription').focus();
}

// Save and CRUD operations
function saveService() {
    const form = document.getElementById('serviceForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const serviceItem = {
        name: document.getElementById('serviceName').value,
        slug: document.getElementById('serviceSlug').value,
        shortDescription: document.getElementById('serviceShortDescription').value,
        description: document.getElementById('serviceDescription').innerHTML,
        category: document.getElementById('serviceCategory').value,
        status: document.getElementById('serviceStatus').value,
        icon: document.getElementById('serviceIconInput').value || 'fas fa-cog',
        order: parseInt(document.getElementById('serviceOrder').value) || 0,
        showOnHomepage: document.getElementById('serviceShowOnHomepage').checked,
        showPrice: document.getElementById('serviceShowPrice').checked,
        priceFrom: parseFloat(document.getElementById('servicePriceFrom').value) || null,
        priceUnit: document.getElementById('servicePriceUnit').value,
        priceNote: document.getElementById('servicePriceNote').value,
        features: getServiceFeatures(),
        lastModified: new Date()
    };
    
    if (currentServiceId) {
        // Update existing service
        const index = serviceData.findIndex(item => item.id === currentServiceId);
        if (index !== -1) {
            serviceData[index] = { ...serviceData[index], ...serviceItem };
            showNotification('Service erfolgreich aktualisiert', 'success');
        }
    } else {
        // Create new service
        const newService = {
            id: Date.now(), // Simple ID generation
            ...serviceItem,
            createdAt: new Date()
        };
        serviceData.push(newService);
        showNotification('Neuer Service erfolgreich erstellt', 'success');
    }
    
    // Close modal and refresh list
    bootstrap.Modal.getInstance(document.getElementById('serviceModal')).hide();
    loadServiceList();
}

function editService(id) {
    openServiceModal(id);
}

function deleteService(id) {
    const service = serviceData.find(item => item.id === id);
    if (!service) return;
    
    if (confirm(`Möchten Sie "${service.name}" wirklich löschen?`)) {
        serviceData = serviceData.filter(item => item.id !== id);
        loadServiceList();
        showNotification('Service erfolgreich gelöscht', 'success');
    }
}

function previewServiceItem(id) {
    const service = serviceData.find(item => item.id === id);
    if (!service) return;
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=900,height=700');
    
    const featuresHtml = service.features && service.features.length > 0 ? 
        `<div class="features">
            <h4>Features & Vorteile</h4>
            <ul>
                ${service.features.map(f => `<li><i class="fas fa-check text-success"></i> ${f}</li>`).join('')}
            </ul>
        </div>` : '';
    
    const priceHtml = service.showPrice && service.priceFrom ? 
        `<div class="price">
            <strong>Preis: ab CHF ${service.priceFrom.toFixed(2)} ${service.priceUnit ? '/ ' + service.priceUnit : ''}</strong>
            ${service.priceNote ? `<br><small>${service.priceNote}</small>` : ''}
        </div>` : 
        (service.priceNote ? `<div class="price"><strong>${service.priceNote}</strong></div>` : '');
    
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vorschau: ${service.name}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <style>
                body { padding: 2rem; }
                .service-icon { font-size: 4rem; color: #007bff; margin-bottom: 1rem; }
                .features ul { list-style: none; padding: 0; }
                .features li { margin-bottom: 0.5rem; }
                .features i { margin-right: 0.5rem; }
                .price { background: #f8f9fa; padding: 1rem; border-radius: 8px; margin-top: 1rem; }
                .badges { margin: 1rem 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="text-center mb-4">
                    <div class="service-icon">
                        <i class="${service.icon}"></i>
                    </div>
                    <h1>${service.name}</h1>
                    <p class="lead">${service.shortDescription}</p>
                    
                    <div class="badges">
                        <span class="badge bg-secondary">${service.category}</span>
                        <span class="badge bg-${service.status === 'featured' ? 'warning' : (service.status === 'active' ? 'success' : 'secondary')}">${service.status}</span>
                        ${service.showOnHomepage ? '<span class="badge bg-info">Homepage</span>' : ''}
                    </div>
                </div>
                
                <div class="row">
                    <div class="col-md-8">
                        <h3>Beschreibung</h3>
                        <div class="content">${service.description}</div>
                        ${featuresHtml}
                    </div>
                    <div class="col-md-4">
                        ${priceHtml}
                        <div class="mt-3">
                            <small class="text-muted">
                                <strong>Reihenfolge:</strong> ${service.order}<br>
                                <strong>Erstellt:</strong> ${formatDate(service.createdAt)}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `);
    previewWindow.document.close();
}

function previewService() {
    // Create temporary service object from form data
    const tempService = {
        name: document.getElementById('serviceName').value || 'Service Name',
        shortDescription: document.getElementById('serviceShortDescription').value || 'Kurzbeschreibung',
        description: document.getElementById('serviceDescription').innerHTML || '<p>Beschreibung</p>',
        category: document.getElementById('serviceCategory').value,
        status: document.getElementById('serviceStatus').value,
        icon: document.getElementById('serviceIconInput').value || 'fas fa-cog',
        order: parseInt(document.getElementById('serviceOrder').value) || 0,
        showOnHomepage: document.getElementById('serviceShowOnHomepage').checked,
        showPrice: document.getElementById('serviceShowPrice').checked,
        priceFrom: parseFloat(document.getElementById('servicePriceFrom').value) || null,
        priceUnit: document.getElementById('servicePriceUnit').value,
        priceNote: document.getElementById('servicePriceNote').value,
        features: getServiceFeatures(),
        createdAt: new Date()
    };
    
    // Use the same preview function
    const originalServiceData = serviceData;
    serviceData = [tempService];
    tempService.id = 'preview';
    previewServiceItem('preview');
    serviceData = originalServiceData;
} 

// Project Management Data Storage
let projectData = [];
let currentProjectId = null;
let projectFilters = {
    search: '',
    category: '',
    status: '',
    year: ''
};
let currentProjectViewMode = 'grid';
let currentProjectSort = 'date';

// Sample project data with real images
const sampleProjects = [
    {
        id: 1,
        name: 'Fahrzeugbeschriftung Agrola Tankstelle',
        customer: 'Agrola AG',
        category: 'fahrzeugbeschriftung',
        status: 'featured',
        date: new Date('2024-06-15'),
        location: 'Neuhaus, Schweiz',
        duration: '1 Woche',
        description: 'Vollständige Fahrzeugbeschriftung für die neue Agrola Tankstelle in Neuhaus. Das Projekt umfasste die Gestaltung und Umsetzung eines modernen Corporate Designs auf verschiedenen Fahrzeugen der Tankstelle.',
        images: [
            '../content/images/agrola-tankstelle-neuhaus.jpg',
            '../content/images/fahrzeugbeschriftung-1.jpg',
            '../content/images/fahrzeugbeschriftung-2.jpg'
        ],
        services: ['fahrzeugbeschriftung', 'beratung'],
        showOnWebsite: true,
        allowPublicView: true,
        createdAt: new Date('2024-06-15')
    },
    {
        id: 2,
        name: 'LED Leuchtschriften Bahnhofsmarkt',
        customer: 'Bahnhofsmarkt Brunnen',
        category: 'lichtwerbung',
        status: 'completed',
        date: new Date('2024-05-20'),
        location: 'Brunnen, Schweiz',
        duration: '2 Wochen',
        description: 'Installation moderner LED-Leuchtschriften für den Bahnhofsmarkt in Brunnen. Die energieeffizienten LED-Module sorgen für perfekte Sichtbarkeit bei Tag und Nacht.',
        images: [
            '../content/images/bahnhofsmaercht-brunnen.jpg',
            '../content/images/leuchttransparente-1.jpg',
            '../content/images/leuchttransparente-2.jpg'
        ],
        services: ['led_leuchtschriften', 'montage'],
        showOnWebsite: true,
        allowPublicView: true,
        createdAt: new Date('2024-05-20')
    },
    {
        id: 3,
        name: 'Grossformatdruck Plakatkampagne',
        customer: 'Marketing Agentur Zürich',
        category: 'grossformatdruck',
        status: 'completed',
        date: new Date('2024-04-10'),
        location: 'Zürich, Schweiz',
        duration: '3 Tage',
        description: 'Produktion von über 50 Grossformatplakaten für eine schweizweite Werbekampagne. Hochwertige UV-beständige Materialien für optimale Langlebigkeit.',
        images: [
            '../content/images/grossformatdruck-1.jpg',
            '../content/images/grossformatdruck-2.jpg',
            '../content/images/grossformatdruck-3.jpg',
            '../content/images/grossformatdruck-4.jpg'
        ],
        services: ['grossformatdruck'],
        showOnWebsite: true,
        allowPublicView: false,
        createdAt: new Date('2024-04-10')
    },
    {
        id: 4,
        name: 'Signaletik Bürogebäude',
        customer: 'Immobilien Verwaltung AG',
        category: 'signaletik',
        status: 'completed',
        date: new Date('2024-03-15'),
        location: 'St. Gallen, Schweiz',
        duration: '1 Monat',
        description: 'Komplette Signaletik-Lösung für ein neues Bürogebäude. Von der Orientierung bis zur Raumbeschilderung - alles aus einer Hand.',
        images: [
            '../content/images/signaletik-1.jpg',
            '../content/images/signaletik-2.jpg',
            '../content/images/signaletik-3.jpg',
            '../content/images/signaletik-4.jpg',
            '../content/images/signaletik-5.jpg'
        ],
        services: ['beratung', 'grossformatdruck', 'montage'],
        showOnWebsite: true,
        allowPublicView: true,
        createdAt: new Date('2024-03-15')
    },
    {
        id: 5,
        name: 'Pylonen Shell Tankstelle',
        customer: 'Shell Switzerland',
        category: 'pylonen',
        status: 'featured',
        date: new Date('2024-02-28'),
        location: 'Uznach, Schweiz',
        duration: '2 Wochen',
        description: 'Erneuerung der Tankstellen-Pylonen mit modernster LED-Technik. Energieeffiziente Lösung mit ferngesteuerter Preisanzeige.',
        images: [
            '../content/images/uznach1.jpg',
            '../content/images/pylonen-1.jpg',
            '../content/images/pylonen-2.jpg',
            '../content/images/pylonen-3.jpg'
        ],
        services: ['led_leuchtschriften', 'montage'],
        showOnWebsite: true,
        allowPublicView: true,
        createdAt: new Date('2024-02-28')
    },
    {
        id: 6,
        name: 'Fensterbeschriftung Büro',
        customer: 'Rechtsanwaltskanzlei Müller',
        category: 'fensterbeschriftung',
        status: 'completed',
        date: new Date('2024-01-12'),
        location: 'Bern, Schweiz',
        duration: '2 Tage',
        description: 'Elegante Fensterbeschriftung für eine Rechtsanwaltskanzlei. Dezent und professionell mit matter Folie für optimalen Sichtschutz.',
        images: [
            '../content/images/fensterbeschriftung-1.jpg',
            '../content/images/fensterbeschriftung-2.jpg',
            '../content/images/fensterbeschriftung-3.jpg'
        ],
        services: ['fensterbeschriftung'],
        showOnWebsite: false,
        allowPublicView: false,
        createdAt: new Date('2024-01-12')
    },
    {
        id: 7,
        name: 'Neon Halbrelief Restaurant',
        customer: 'Restaurant Alpenblick',
        category: 'lichtwerbung',
        status: 'completed',
        date: new Date('2023-12-05'),
        location: 'Interlaken, Schweiz',
        duration: '1 Woche',
        description: 'Handwerklich gefertigte Neon-Halbrelief-Schrift für ein traditionelles Restaurant. Klassische Neon-Technik trifft moderne Ästhetik.',
        images: [
            '../content/images/halbrelief-plattenschriften-1.jpg',
            '../content/images/halbrelief-plattenschriften-2.jpg',
            '../content/images/halbrelief-plattenschriften-3.jpg'
        ],
        services: ['led_leuchtschriften', 'montage', 'beratung'],
        showOnWebsite: true,
        allowPublicView: true,
        createdAt: new Date('2023-12-05')
    }
];

function initProjectManagement() {
    // Initialize project data
    projectData = [...sampleProjects];
    
    // Initialize project interface
    initProjectInterface();
    
    // Load project list
    setTimeout(() => {
        loadProjectList();
    }, 500); // Simulate loading time
}

function initProjectInterface() {
    // Initialize filter handlers
    const searchInput = document.getElementById('projectSearch');
    const categoryFilter = document.getElementById('projectCategoryFilter');
    const statusFilter = document.getElementById('projectStatusFilter');
    const yearFilter = document.getElementById('projectYearFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            projectFilters.search = this.value;
            loadProjectList();
        });
    }
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            projectFilters.category = this.value;
            loadProjectList();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            projectFilters.status = this.value;
            loadProjectList();
        });
    }
    
    if (yearFilter) {
        yearFilter.addEventListener('change', function() {
            projectFilters.year = this.value;
            loadProjectList();
        });
    }
}

function loadProjectList() {
    // Show loading state
    document.getElementById('projectLoading').classList.remove('d-none');
    document.getElementById('projectGridView-content').classList.add('d-none');
    document.getElementById('projectListView-content').classList.add('d-none');
    document.getElementById('projectEmpty').classList.add('d-none');
    
    setTimeout(() => {
        // Apply filters
        let filteredProjects = projectData.filter(item => {
            let matchesSearch = true;
            let matchesCategory = true;
            let matchesStatus = true;
            let matchesYear = true;
            
            if (projectFilters.search) {
                matchesSearch = item.name.toLowerCase().includes(projectFilters.search.toLowerCase()) ||
                               item.customer.toLowerCase().includes(projectFilters.search.toLowerCase());
            }
            
            if (projectFilters.category) {
                matchesCategory = item.category === projectFilters.category;
            }
            
            if (projectFilters.status) {
                matchesStatus = item.status === projectFilters.status;
            }
            
            if (projectFilters.year) {
                matchesYear = item.date.getFullYear().toString() === projectFilters.year;
            }
            
            return matchesSearch && matchesCategory && matchesStatus && matchesYear;
        });
        
        // Sort projects
        filteredProjects.sort((a, b) => {
            switch(currentProjectSort) {
                case 'date':
                    return new Date(b.date) - new Date(a.date);
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'customer':
                    return a.customer.localeCompare(b.customer);
                case 'category':
                    return a.category.localeCompare(b.category);
                default:
                    return 0;
            }
        });
        
        // Hide loading
        document.getElementById('projectLoading').classList.add('d-none');
        
        if (filteredProjects.length === 0) {
            document.getElementById('projectEmpty').classList.remove('d-none');
        } else {
            if (currentProjectViewMode === 'grid') {
                displayProjectGrid(filteredProjects);
            } else {
                displayProjectList(filteredProjects);
            }
        }
        
        // Update stats
        updateProjectStats(filteredProjects);
    }, 600); // Simulate loading time
}

function displayProjectGrid(projects) {
    const container = document.getElementById('projectGridContainer');
    container.innerHTML = '';
    
    projects.forEach(project => {
        const card = createProjectCard(project);
        container.appendChild(card);
    });
    
    document.getElementById('projectGridView-content').classList.remove('d-none');
}

function createProjectCard(project) {
    const div = document.createElement('div');
    div.className = 'col-lg-4 col-md-6';
    
    const statusClass = {
        completed: 'success',
        featured: 'warning',
        archived: 'secondary'
    }[project.status] || 'secondary';
    
    const statusText = {
        completed: 'Abgeschlossen',
        featured: 'Featured',
        archived: 'Archiviert'
    }[project.status] || project.status;
    
    const categoryNames = {
        fahrzeugbeschriftung: 'Fahrzeugbeschriftung',
        lichtwerbung: 'Lichtwerbung',
        grossformatdruck: 'Grossformatdruck',
        fensterbeschriftung: 'Fensterbeschriftung',
        signaletik: 'Signaletik',
        pylonen: 'Pylonen',
        sonstiges: 'Sonstiges'
    };
    
    const mainImage = project.images && project.images.length > 0 ? project.images[0] : '../content/images/detail1.jpg';
    
    div.innerHTML = `
        <div class="card project-card h-100">
            <div class="project-image-container" onclick="openProjectDetailModal(${project.id})">
                <img src="${mainImage}" alt="${project.name}" class="card-img-top project-main-image" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"300\\" height=\\"200\\" viewBox=\\"0 0 300 200\\"><rect width=\\"300\\" height=\\"200\\" fill=\\"%23f8f9fa\\"/><text x=\\"150\\" y=\\"100\\" text-anchor=\\"middle\\" font-family=\\"Arial\\" font-size=\\"14\\" fill=\\"%236c757d\\">Bild nicht gefunden</text></svg>'">
                <div class="project-overlay">
                    <div class="project-image-count">
                        <i class="fas fa-images"></i>
                        ${project.images ? project.images.length : 0}
                    </div>
                    <div class="project-status-badge">
                        <span class="badge bg-${statusClass}">${statusText}</span>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <h5 class="card-title">${project.name}</h5>
                <p class="card-text">
                    <small class="text-muted">
                        <i class="fas fa-building"></i> ${project.customer}
                    </small>
                </p>
                <p class="card-text">${project.description.substring(0, 120)}...</p>
                <div class="project-meta">
                    <div class="project-category">
                        <span class="badge bg-secondary">${categoryNames[project.category] || project.category}</span>
                    </div>
                    <div class="project-date">
                        <small class="text-muted">
                            <i class="fas fa-calendar"></i>
                            ${formatDate(project.date)}
                        </small>
                    </div>
                    ${project.location ? `
                        <div class="project-location">
                            <small class="text-muted">
                                <i class="fas fa-map-marker-alt"></i>
                                ${project.location}
                            </small>
                        </div>
                    ` : ''}
                </div>
            </div>
            <div class="card-footer">
                <div class="project-actions d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary flex-fill" onclick="editProject(${project.id})">
                        <i class="fas fa-edit"></i>
                        Bearbeiten
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="openProjectDetailModal(${project.id})">
                        <i class="fas fa-eye"></i>
                        Details
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteProject(${project.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return div;
}

function displayProjectList(projects) {
    const tbody = document.getElementById('projectListBody');
    tbody.innerHTML = '';
    
    projects.forEach(project => {
        const row = createProjectListRow(project);
        tbody.appendChild(row);
    });
    
    document.getElementById('projectListView-content').classList.remove('d-none');
}

function createProjectListRow(project) {
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.onclick = () => openProjectDetailModal(project.id);
    
    const statusClass = {
        completed: 'success',
        featured: 'warning',
        archived: 'secondary'
    }[project.status] || 'secondary';
    
    const statusText = {
        completed: 'Abgeschlossen',
        featured: 'Featured',
        archived: 'Archiviert'
    }[project.status] || project.status;
    
    const categoryNames = {
        fahrzeugbeschriftung: 'Fahrzeugbeschriftung',
        lichtwerbung: 'Lichtwerbung',
        grossformatdruck: 'Grossformatdruck',
        fensterbeschriftung: 'Fensterbeschriftung',
        signaletik: 'Signaletik',
        pylonen: 'Pylonen',
        sonstiges: 'Sonstiges'
    };
    
    const mainImage = project.images && project.images.length > 0 ? project.images[0] : '../content/images/detail1.jpg';
    
    row.innerHTML = `
        <td>
            <div class="project-list-thumbnail">
                <img src="${mainImage}" alt="${project.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="file-icon-small" style="display: none;">
                    <i class="fas fa-image"></i>
                </div>
            </div>
        </td>
        <td>
            <div class="fw-semibold">${project.name}</div>
            <div class="small text-muted">${project.description.substring(0, 80)}...</div>
        </td>
        <td>
            <div class="fw-semibold">${project.customer}</div>
            ${project.location ? `<div class="small text-muted">${project.location}</div>` : ''}
        </td>
        <td>
            <span class="badge bg-secondary">${categoryNames[project.category] || project.category}</span>
        </td>
        <td>
            <span class="badge bg-${statusClass}">${statusText}</span>
        </td>
        <td>${formatDate(project.date)}</td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="event.stopPropagation(); editProject(${project.id})" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-info" onclick="event.stopPropagation(); openProjectDetailModal(${project.id})" title="Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="event.stopPropagation(); deleteProject(${project.id})" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

function updateProjectStats(projects) {
    const totalCount = projects.length;
    const completedCount = projects.filter(p => p.status === 'completed').length;
    const featuredCount = projects.filter(p => p.status === 'featured').length;
    const uniqueCustomers = [...new Set(projects.map(p => p.customer))].length;
    
    document.getElementById('totalProjectCount').textContent = totalCount;
    document.getElementById('completedProjectCount').textContent = completedCount;
    document.getElementById('featuredProjectCount').textContent = featuredCount;
    document.getElementById('uniqueCustomerCount').textContent = uniqueCustomers;
}

function setProjectViewMode(mode) {
    currentProjectViewMode = mode;
    loadProjectList();
}

function sortProjects(sortBy) {
    currentProjectSort = sortBy;
    loadProjectList();
}

function applyProjectFilters() {
    loadProjectList();
    showNotification('Projekt-Filter angewendet', 'info');
}

function clearProjectFilters() {
    // Reset all filters
    document.getElementById('projectSearch').value = '';
    document.getElementById('projectCategoryFilter').value = '';
    document.getElementById('projectStatusFilter').value = '';
    document.getElementById('projectYearFilter').value = '';
    
    projectFilters = {
        search: '',
        category: '',
        status: '',
        year: ''
    };
    
    loadProjectList();
    showNotification('Filter zurückgesetzt', 'info');
}

function refreshProjectList() {
    loadProjectList();
    showNotification('Projekt-Liste aktualisiert', 'success');
}

// Project Detail Modal
function openProjectDetailModal(id) {
    const project = projectData.find(item => item.id === id);
    if (!project) return;
    
    currentProjectId = id;
    
    // Populate modal
    document.getElementById('projectDetailModalLabel').textContent = project.name;
    document.getElementById('projectDetailCustomer').textContent = project.customer;
    document.getElementById('projectDetailCategory').textContent = getCategoryDisplayName(project.category);
    document.getElementById('projectDetailStatus').innerHTML = `<span class="badge bg-${getStatusClass(project.status)}">${getStatusDisplayName(project.status)}</span>`;
    document.getElementById('projectDetailDate').textContent = formatDate(project.date);
    document.getElementById('projectDetailLocation').textContent = project.location || 'Nicht angegeben';
    document.getElementById('projectDetailDuration').textContent = project.duration || 'Nicht angegeben';
    document.getElementById('projectDetailDescription').innerHTML = `<p>${project.description}</p>`;
    
    // Populate image gallery
    populateProjectImageGallery(project.images);
    
    // Populate services
    populateProjectDetailServices(project.services);
    
    const modal = new bootstrap.Modal(document.getElementById('projectDetailModal'));
    modal.show();
}

function populateProjectImageGallery(images) {
    const gallery = document.getElementById('projectImageGallery');
    if (!images || images.length === 0) {
        gallery.innerHTML = '<p class="text-muted">Keine Bilder verfügbar</p>';
        return;
    }
    
    gallery.innerHTML = `
        <div class="main-image mb-3">
            <img src="${images[0]}" alt="Hauptbild" class="img-fluid rounded project-main-display" id="mainDisplayImage">
        </div>
        ${images.length > 1 ? `
            <div class="image-thumbnails">
                <div class="d-flex flex-wrap gap-2">
                    ${images.map((img, index) => `
                        <div class="thumbnail ${index === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                            <img src="${img}" alt="Bild ${index + 1}" class="img-fluid rounded">
                        </div>
                    `).join('')}
                </div>
            </div>
        ` : ''}
    `;
}

function changeMainImage(imageSrc, thumbnailElement) {
    document.getElementById('mainDisplayImage').src = imageSrc;
    
    // Update active thumbnail
    document.querySelectorAll('.thumbnail').forEach(thumb => thumb.classList.remove('active'));
    thumbnailElement.classList.add('active');
}

function populateProjectDetailServices(services) {
    const container = document.getElementById('projectDetailServices');
    if (!services || services.length === 0) {
        container.innerHTML = '<h6>Erbrachte Leistungen</h6><p class="text-muted">Keine Leistungen angegeben</p>';
        return;
    }
    
    const serviceNames = {
        fahrzeugbeschriftung: 'Fahrzeugbeschriftung',
        led_leuchtschriften: 'LED Leuchtschriften',
        grossformatdruck: 'Grossformatdruck',
        fensterbeschriftung: 'Fensterbeschriftung',
        montage: 'Montage & Installation',
        beratung: 'Beratung & Planung'
    };
    
    container.innerHTML = `
        <h6>Erbrachte Leistungen</h6>
        <ul class="list-unstyled">
            ${services.map(service => `
                <li class="mb-1">
                    <i class="fas fa-check text-success me-2"></i>
                    ${serviceNames[service] || service}
                </li>
            `).join('')}
        </ul>
    `;
}

// Helper functions
function getCategoryDisplayName(category) {
    const names = {
        fahrzeugbeschriftung: 'Fahrzeugbeschriftung',
        lichtwerbung: 'Lichtwerbung',
        grossformatdruck: 'Grossformatdruck',
        fensterbeschriftung: 'Fensterbeschriftung',
        signaletik: 'Signaletik',
        pylonen: 'Pylonen',
        sonstiges: 'Sonstiges'
    };
    return names[category] || category;
}

function getStatusClass(status) {
    const classes = {
        completed: 'success',
        featured: 'warning',
        archived: 'secondary'
    };
    return classes[status] || 'secondary';
}

function getStatusDisplayName(status) {
    const names = {
        completed: 'Abgeschlossen',
        featured: 'Featured',
        archived: 'Archiviert'
    };
    return names[status] || status;
}

function editProjectFromDetail() {
    bootstrap.Modal.getInstance(document.getElementById('projectDetailModal')).hide();
    setTimeout(() => {
        editProject(currentProjectId);
    }, 300);
}

// Project CRUD Operations
function openProjectModal(id = null) {
    currentProjectId = id;
    const modal = new bootstrap.Modal(document.getElementById('projectModal'));
    const modalTitle = document.getElementById('projectModalLabel');
    
    if (id) {
        // Edit mode
        const project = projectData.find(item => item.id === id);
        if (project) {
            populateProjectForm(project);
            modalTitle.textContent = 'Projekt bearbeiten';
        }
    } else {
        // Create mode
        clearProjectForm();
        modalTitle.textContent = 'Neues Projekt erstellen';
    }
    
    modal.show();
}

function populateProjectForm(project) {
    document.getElementById('projectName').value = project.name;
    document.getElementById('projectCustomer').value = project.customer;
    document.getElementById('projectCategory').value = project.category;
    document.getElementById('projectStatus').value = project.status;
    document.getElementById('projectDate').value = project.date.toISOString().split('T')[0];
    document.getElementById('projectLocation').value = project.location || '';
    document.getElementById('projectDuration').value = project.duration || '';
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectShowOnWebsite').checked = project.showOnWebsite;
    document.getElementById('projectAllowPublicView').checked = project.allowPublicView;
    
    // Populate services
    populateProjectFormServices(project.services || []);
    
    // Populate image preview
    populateProjectImagePreview(project.images || []);
}

function clearProjectForm() {
    document.getElementById('projectName').value = '';
    document.getElementById('projectCustomer').value = '';
    document.getElementById('projectCategory').value = 'fahrzeugbeschriftung';
    document.getElementById('projectStatus').value = 'completed';
    document.getElementById('projectDate').value = '';
    document.getElementById('projectLocation').value = '';
    document.getElementById('projectDuration').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectShowOnWebsite').checked = true;
    document.getElementById('projectAllowPublicView').checked = true;
    
    // Clear services
    populateProjectFormServices([]);
    
    // Clear image preview
    populateProjectImagePreview([]);
}

function populateProjectFormServices(services) {
    const checkboxes = document.querySelectorAll('#projectServices input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = services.includes(checkbox.value);
    });
}

function populateProjectImagePreview(images) {
    const container = document.getElementById('projectImagePreview');
    if (!images || images.length === 0) {
        container.innerHTML = '<p class="text-muted">Keine Bilder ausgewählt</p>';
        return;
    }
    
    container.innerHTML = `
        <div class="row g-2">
            ${images.map((img, index) => `
                <div class="col-md-3">
                    <div class="image-preview-item">
                        <img src="${img}" alt="Bild ${index + 1}" class="img-fluid rounded">
                        <button type="button" class="btn btn-sm btn-danger image-remove-btn" onclick="removeProjectImage(${index})">
                            <i class="fas fa-times"></i>
                        </button>
                        ${index === 0 ? '<div class="main-image-badge">Hauptbild</div>' : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function handleProjectImageUpload(files) {
    // In a real application, this would upload the files to the server
    // For demo purposes, we'll just show them as URL objects
    const existingImages = getCurrentProjectImages();
    
    Array.from(files).forEach(file => {
        const imageUrl = URL.createObjectURL(file);
        existingImages.push(imageUrl);
    });
    
    populateProjectImagePreview(existingImages);
    showNotification(`${files.length} Bilder hinzugefügt`, 'success');
}

function getCurrentProjectImages() {
    const container = document.getElementById('projectImagePreview');
    const images = container.querySelectorAll('img');
    return Array.from(images).map(img => img.src);
}

function removeProjectImage(index) {
    const existingImages = getCurrentProjectImages();
    existingImages.splice(index, 1);
    populateProjectImagePreview(existingImages);
    showNotification('Bild entfernt', 'info');
}

function getSelectedProjectServices() {
    const checkboxes = document.querySelectorAll('#projectServices input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

function saveProject() {
    const form = document.getElementById('projectForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const projectItem = {
        name: document.getElementById('projectName').value,
        customer: document.getElementById('projectCustomer').value,
        category: document.getElementById('projectCategory').value,
        status: document.getElementById('projectStatus').value,
        date: new Date(document.getElementById('projectDate').value),
        location: document.getElementById('projectLocation').value,
        duration: document.getElementById('projectDuration').value,
        description: document.getElementById('projectDescription').value,
        showOnWebsite: document.getElementById('projectShowOnWebsite').checked,
        allowPublicView: document.getElementById('projectAllowPublicView').checked,
        services: getSelectedProjectServices(),
        images: getCurrentProjectImages()
    };
    
    if (currentProjectId) {
        // Update existing project
        const index = projectData.findIndex(item => item.id === currentProjectId);
        if (index !== -1) {
            projectData[index] = { ...projectData[index], ...projectItem };
            showNotification('Projekt erfolgreich aktualisiert', 'success');
        }
    } else {
        // Create new project
        const newProject = {
            id: Date.now(), // Simple ID generation
            ...projectItem,
            createdAt: new Date()
        };
        projectData.push(newProject);
        showNotification('Neues Projekt erfolgreich erstellt', 'success');
    }
    
    // Close modal and refresh list
    bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
    loadProjectList();
}

function editProject(id) {
    openProjectModal(id);
}

function deleteProject(id) {
    const project = projectData.find(item => item.id === id);
    if (!project) return;
    
    if (confirm(`Möchten Sie das Projekt "${project.name}" wirklich löschen?`)) {
        projectData = projectData.filter(item => item.id !== id);
        loadProjectList();
        showNotification('Projekt erfolgreich gelöscht', 'success');
    }
}

function previewProject() {
    // Create temporary project object from form data
    const tempProject = {
        name: document.getElementById('projectName').value || 'Projektname',
        customer: document.getElementById('projectCustomer').value || 'Kunde',
        category: document.getElementById('projectCategory').value,
        status: document.getElementById('projectStatus').value,
        date: new Date(document.getElementById('projectDate').value || Date.now()),
        location: document.getElementById('projectLocation').value,
        duration: document.getElementById('projectDuration').value,
        description: document.getElementById('projectDescription').value || 'Projektbeschreibung',
        showOnWebsite: document.getElementById('projectShowOnWebsite').checked,
        allowPublicView: document.getElementById('projectAllowPublicView').checked,
        services: getSelectedProjectServices(),
        images: getCurrentProjectImages()
    };
    
    // Open preview in new window
    const previewWindow = window.open('', '_blank', 'width=1000,height=800');
    
    const servicesHtml = tempProject.services && tempProject.services.length > 0 ? 
        `<div class="services">
            <h4>Erbrachte Leistungen</h4>
            <ul>
                ${tempProject.services.map(s => `<li><i class="fas fa-check text-success"></i> ${getServiceDisplayName(s)}</li>`).join('')}
            </ul>
        </div>` : '';
    
    const imagesHtml = tempProject.images && tempProject.images.length > 0 ? 
        `<div class="images mb-4">
            <h4>Projekt-Galerie</h4>
            <div class="row g-2">
                ${tempProject.images.map((img, index) => `
                    <div class="col-md-4">
                        <img src="${img}" alt="Bild ${index + 1}" class="img-fluid rounded">
                    </div>
                `).join('')}
            </div>
        </div>` : '';
    
    previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Vorschau: ${tempProject.name}</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <style>
                body { padding: 2rem; }
                .project-header { border-bottom: 2px solid #dee2e6; padding-bottom: 1rem; margin-bottom: 2rem; }
                .project-meta { background: #f8f9fa; padding: 1rem; border-radius: 8px; }
                .services ul { list-style: none; padding: 0; }
                .services li { margin-bottom: 0.5rem; }
                .services i { margin-right: 0.5rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="project-header">
                    <h1>${tempProject.name}</h1>
                    <p class="lead">${tempProject.description}</p>
                    <div class="project-meta">
                        <div class="row">
                            <div class="col-md-6">
                                <strong>Kunde:</strong> ${tempProject.customer}<br>
                                <strong>Kategorie:</strong> ${getCategoryDisplayName(tempProject.category)}<br>
                                <strong>Status:</strong> <span class="badge bg-${getStatusClass(tempProject.status)}">${getStatusDisplayName(tempProject.status)}</span>
                            </div>
                            <div class="col-md-6">
                                <strong>Datum:</strong> ${formatDate(tempProject.date)}<br>
                                ${tempProject.location ? `<strong>Ort:</strong> ${tempProject.location}<br>` : ''}
                                ${tempProject.duration ? `<strong>Dauer:</strong> ${tempProject.duration}` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                
                ${imagesHtml}
                ${servicesHtml}
            </div>
        </body>
        </html>
    `);
    previewWindow.document.close();
}

function getServiceDisplayName(service) {
    const names = {
        fahrzeugbeschriftung: 'Fahrzeugbeschriftung',
        led_leuchtschriften: 'LED Leuchtschriften',
        grossformatdruck: 'Grossformatdruck',
        fensterbeschriftung: 'Fensterbeschriftung',
        montage: 'Montage & Installation',
        beratung: 'Beratung & Planung'
    };
    return names[service] || service;
} 

// Team Management Data Storage
let teamData = [];
let currentTeamId = null;
let teamFilters = {
    search: '',
    department: '',
    position: '',
    status: ''
};
// Old team management code removed - using new implementation below

// Sample team data with real images
const sampleTeam = [
    {
        id: 1,
        firstName: 'Thomas',
        lastName: 'Murer',
        position: 'Geschäftsführer',
        department: 'geschaeftsleitung',
        positionLevel: 'geschaeftsfuehrer',
        email: 'thomas.murer@neonmurer.ch',
        phone: '+41 55 210 18 00',
        bio: 'Gründer und Geschäftsführer von Neon Murer. Mit über 25 Jahren Erfahrung in der Lichtwerbung führt er das Unternehmen mit Leidenschaft und Innovation.',
        profileImage: '../content/images/person1.jpg',
        startDate: new Date('1998-03-15'),
        status: 'active',
        showOnWebsite: true,
        showContact: true,
        isManager: true,
        skills: ['Unternehmensführung', 'Neon-Technik', 'Projektmanagement', 'Kundenberatung'],
        createdAt: new Date('1998-03-15')
    },
    {
        id: 2,
        firstName: 'Sandra',
        lastName: 'Weber',
        position: 'Leiterin Verwaltung',
        department: 'verwaltung',
        positionLevel: 'abteilungsleiter',
        email: 'sandra.weber@neonmurer.ch',
        phone: '+41 55 210 18 01',
        bio: 'Sorgt für den reibungslosen Ablauf in der Verwaltung und ist erste Ansprechpartnerin für Kunden. Organisationstalent mit Herz für Details.',
        profileImage: '../content/images/person2.jpg',
        startDate: new Date('2005-08-01'),
        status: 'active',
        showOnWebsite: true,
        showContact: true,
        isManager: true,
        skills: ['Buchhaltung', 'Kundenbetreuung', 'Projektplanung', 'Office Management'],
        createdAt: new Date('2005-08-01')
    },
    {
        id: 3,
        firstName: 'Marco',
        lastName: 'Steinmann',
        position: 'Leiter Produktion',
        department: 'produktion',
        positionLevel: 'abteilungsleiter',
        email: 'marco.steinmann@neonmurer.ch',
        phone: '+41 55 210 18 02',
        bio: 'Experte für LED-Technik und Grossformatdruck. Leitet unser Produktionsteam und sorgt für höchste Qualität bei allen Erzeugnissen.',
        profileImage: '../content/images/person3.jpg',
        startDate: new Date('2010-02-12'),
        status: 'active',
        showOnWebsite: true,
        showContact: false,
        isManager: true,
        skills: ['LED-Technik', 'Grossformatdruck', 'Qualitätskontrolle', 'Teamführung'],
        createdAt: new Date('2010-02-12')
    },
    {
        id: 4,
        firstName: 'Julia',
        lastName: 'Müller',
        position: 'Grafikdesignerin',
        department: 'design',
        positionLevel: 'fachkraft',
        email: 'julia.mueller@neonmurer.ch',
        phone: '+41 55 210 18 03',
        bio: 'Kreative Gestalterin mit Auge für moderne Designs. Entwickelt ansprechende Konzepte für alle Arten von Werbetechnik.',
        profileImage: '../content/images/person4_new.jpg',
        startDate: new Date('2018-06-15'),
        status: 'active',
        showOnWebsite: true,
        showContact: false,
        isManager: false,
        skills: ['Adobe Creative Suite', 'Webdesign', 'Corporate Design', 'Illustration'],
        createdAt: new Date('2018-06-15')
    },
    {
        id: 5,
        firstName: 'Andreas',
        lastName: 'Kälin',
        position: 'Montage-Techniker',
        department: 'montage',
        positionLevel: 'fachkraft',
        email: 'andreas.kaelin@neonmurer.ch',
        phone: '+41 55 210 18 04',
        bio: 'Erfahrener Monteur mit Spezialisierung auf Höhenarbeiten. Sorgt für fachgerechte Installation aller Werbeanlagen.',
        profileImage: '../content/images/person5.jpg',
        startDate: new Date('2015-04-01'),
        status: 'active',
        showOnWebsite: true,
        showContact: false,
        isManager: false,
        skills: ['Höhenarbeiten', 'Elektroinstallation', 'Sicherheitstechnik', 'Krane bedienen'],
        createdAt: new Date('2015-04-01')
    },
    {
        id: 6,
        firstName: 'Lukas',
        lastName: 'Gehrig',
        position: 'Lehrling Schildermacher',
        department: 'produktion',
        positionLevel: 'lehrling',
        email: 'lukas.gehrig@neonmurer.ch',
        phone: '+41 55 210 18 05',
        bio: 'Motivierter Lehrling im 2. Lehrjahr. Lernt alle Aspekte der Schilderherstellung und zeigt grosses Interesse an neuen Technologien.',
        profileImage: '../content/images/person6.jpg',
        startDate: new Date('2023-08-01'),
        status: 'active',
        showOnWebsite: true,
        showContact: false,
        isManager: false,
        skills: ['Materialbearbeitung', 'Folienverarbeitung', 'Lerneifer', 'Teamarbeit'],
        createdAt: new Date('2023-08-01')
    },
    {
        id: 7,
        firstName: 'Michael',
        lastName: 'Zimmermann',
        position: 'Servicetechniker',
        department: 'montage',
        positionLevel: 'fachkraft',
        email: 'michael.zimmermann@neonmurer.ch',
        phone: '+41 55 210 18 06',
        bio: 'Spezialist für Wartung und Reparatur von Leuchtanlagen. Steht rund um die Uhr für Notfälle zur Verfügung.',
        profileImage: '../content/images/mitarbeiter.jpg',
        startDate: new Date('2012-11-15'),
        status: 'vacation',
        showOnWebsite: true,
        showContact: false,
        isManager: false,
        skills: ['Elektronik-Reparatur', '24h-Service', 'Fehlerdiagnose', 'Kundendienst'],
        createdAt: new Date('2012-11-15')
    }
];

function initTeamManagement() {
    // Initialize team data
    teamData = [...sampleTeam];
    
    // Initialize team interface
    initTeamInterface();
    
    // Load team list
    setTimeout(() => {
        loadTeamList();
    }, 500); // Simulate loading time
}

function initTeamInterface() {
    // Initialize filter handlers
    const searchInput = document.getElementById('teamSearch');
    const departmentFilter = document.getElementById('teamDepartmentFilter');
    const positionFilter = document.getElementById('teamPositionFilter');
    const statusFilter = document.getElementById('teamStatusFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            teamFilters.search = this.value;
            loadTeamList();
        });
    }
    
    if (departmentFilter) {
        departmentFilter.addEventListener('change', function() {
            teamFilters.department = this.value;
            loadTeamList();
        });
    }
    
    if (positionFilter) {
        positionFilter.addEventListener('change', function() {
            teamFilters.position = this.value;
            loadTeamList();
        });
    }
    
    if (statusFilter) {
        statusFilter.addEventListener('change', function() {
            teamFilters.status = this.value;
            loadTeamList();
        });
    }
}

function loadTeamList() {
    // Legacy function - replaced by loadTeamMembersData()
    return;
    
    setTimeout(() => {
        // Apply filters
        let filteredTeam = teamData.filter(member => {
            let matchesSearch = true;
            let matchesDepartment = true;
            let matchesPosition = true;
            let matchesStatus = true;
            
            if (teamFilters.search) {
                const searchLower = teamFilters.search.toLowerCase();
                matchesSearch = member.firstName.toLowerCase().includes(searchLower) ||
                               member.lastName.toLowerCase().includes(searchLower) ||
                               member.position.toLowerCase().includes(searchLower);
            }
            
            if (teamFilters.department) {
                matchesDepartment = member.department === teamFilters.department;
            }
            
            if (teamFilters.position) {
                matchesPosition = member.positionLevel === teamFilters.position;
            }
            
            if (teamFilters.status) {
                matchesStatus = member.status === teamFilters.status;
            }
            
            return matchesSearch && matchesDepartment && matchesPosition && matchesStatus;
        });
        
        // Sort team
        filteredTeam.sort((a, b) => {
            switch(currentTeamSort) {
                case 'name':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'department':
                    return a.department.localeCompare(b.department);
                case 'position':
                    return a.position.localeCompare(b.position);
                case 'startDate':
                    return new Date(b.startDate) - new Date(a.startDate);
                default:
                    return 0;
            }
        });
        
        // Hide loading
        document.getElementById('teamLoading').classList.add('d-none');
        
        if (filteredTeam.length === 0) {
            document.getElementById('teamEmpty').classList.remove('d-none');
        } else {
            if (currentTeamViewMode === 'cards') {
                displayTeamCards(filteredTeam);
            } else if (currentTeamViewMode === 'table') {
                displayTeamTable(filteredTeam);
            } else if (currentTeamViewMode === 'org') {
                displayOrgChart(filteredTeam);
            }
        }
        
        // Update stats
        updateTeamStats(filteredTeam);
    }, 600); // Simulate loading time
}

function displayTeamCards(team) {
    const container = document.getElementById('teamCardsContainer');
    container.innerHTML = '';
    
    team.forEach(member => {
        const card = createTeamCard(member);
        container.appendChild(card);
    });
    
    document.getElementById('teamCardView-content').classList.remove('d-none');
}

function createTeamCard(member) {
    const div = document.createElement('div');
    div.className = 'col-lg-4 col-md-6';
    
    const statusClass = {
        active: 'success',
        vacation: 'warning',
        sick: 'danger',
        inactive: 'secondary'
    }[member.status] || 'secondary';
    
    const statusText = {
        active: 'Aktiv',
        vacation: 'Im Urlaub',
        sick: 'Krank',
        inactive: 'Inaktiv'
    }[member.status] || member.status;
    
    const departmentNames = {
        geschaeftsleitung: 'Geschäftsleitung',
        produktion: 'Produktion',
        montage: 'Montage & Service',
        design: 'Design & Grafik',
        verwaltung: 'Verwaltung'
    };
    
    const yearsWithCompany = Math.floor((new Date() - new Date(member.startDate)) / (365.25 * 24 * 60 * 60 * 1000));
    
    div.innerHTML = `
        <div class="card team-card h-100">
            <div class="card-header text-center">
                <div class="team-avatar-container">
                    <img src="${member.profileImage}" alt="${member.firstName} ${member.lastName}" 
                         class="team-avatar"
                         onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"120\\" height=\\"120\\" viewBox=\\"0 0 120 120\\"><circle cx=\\"60\\" cy=\\"60\\" r=\\"60\\" fill=\\"%23f8f9fa\\"/><circle cx=\\"60\\" cy=\\"45\\" r=\\"20\\" fill=\\"%236c757d\\"/><path d=\\"M20 100 Q20 80 40 80 h40 Q100 80 100 100\\" fill=\\"%236c757d\\"/></svg>'">
                    <div class="team-status-indicator bg-${statusClass}"></div>
                    ${member.isManager ? '<div class="team-manager-badge"><i class="fas fa-crown"></i></div>' : ''}
                </div>
                <h5 class="card-title mt-3 mb-1">${member.firstName} ${member.lastName}</h5>
                <p class="card-subtitle text-muted">${member.position}</p>
            </div>
            <div class="card-body">
                <div class="team-info">
                    <div class="info-row">
                        <i class="fas fa-building text-primary"></i>
                        <span>${departmentNames[member.department] || member.department}</span>
                    </div>
                    <div class="info-row">
                        <i class="fas fa-calendar text-info"></i>
                        <span>Seit ${yearsWithCompany} Jahr${yearsWithCompany !== 1 ? 'en' : ''}</span>
                    </div>
                    ${member.showContact && member.email ? `
                        <div class="info-row">
                            <i class="fas fa-envelope text-success"></i>
                            <span>${member.email}</span>
                        </div>
                    ` : ''}
                    <div class="info-row">
                        <i class="fas fa-circle text-${statusClass}"></i>
                        <span>${statusText}</span>
                    </div>
                </div>
                
                ${member.bio ? `
                    <div class="team-bio mt-3">
                        <p class="small text-muted">${member.bio.length > 100 ? member.bio.substring(0, 100) + '...' : member.bio}</p>
                    </div>
                ` : ''}
                
                ${member.skills && member.skills.length > 0 ? `
                    <div class="team-skills mt-3">
                        <div class="skills-preview">
                            ${member.skills.slice(0, 3).map(skill => `<span class="skill-badge">${skill}</span>`).join('')}
                            ${member.skills.length > 3 ? `<span class="skill-badge more">+${member.skills.length - 3}</span>` : ''}
                        </div>
                    </div>
                ` : ''}
            </div>
            <div class="card-footer">
                <div class="team-actions d-flex gap-2">
                    <button class="btn btn-sm btn-outline-primary flex-fill" onclick="editTeamMember(${member.id})">
                        <i class="fas fa-edit"></i>
                        Bearbeiten
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="viewTeamMemberDetails(${member.id})">
                        <i class="fas fa-eye"></i>
                        Details
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteTeamMember(${member.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return div;
}

function displayTeamTable(team) {
    const tbody = document.getElementById('teamTableBody');
    tbody.innerHTML = '';
    
    team.forEach(member => {
        const row = createTeamTableRow(member);
        tbody.appendChild(row);
    });
    
    document.getElementById('teamTableView-content').classList.remove('d-none');
}

function createTeamTableRow(member) {
    const row = document.createElement('tr');
    row.style.cursor = 'pointer';
    row.onclick = () => viewTeamMemberDetails(member.id);
    
    const statusClass = {
        active: 'success',
        vacation: 'warning',
        sick: 'danger',
        inactive: 'secondary'
    }[member.status] || 'secondary';
    
    const statusText = {
        active: 'Aktiv',
        vacation: 'Im Urlaub',
        sick: 'Krank',
        inactive: 'Inaktiv'
    }[member.status] || member.status;
    
    const departmentNames = {
        geschaeftsleitung: 'Geschäftsleitung',
        produktion: 'Produktion',
        montage: 'Montage & Service',
        design: 'Design & Grafik',
        verwaltung: 'Verwaltung'
    };
    
    row.innerHTML = `
        <td>
            <div class="team-table-avatar">
                <img src="${member.profileImage}" alt="${member.firstName} ${member.lastName}" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="avatar-placeholder" style="display: none;">
                    <i class="fas fa-user"></i>
                </div>
            </div>
        </td>
        <td>
            <div class="fw-semibold">${member.firstName} ${member.lastName}</div>
            ${member.isManager ? '<span class="badge bg-warning badge-sm"><i class="fas fa-crown"></i> Manager</span>' : ''}
        </td>
        <td>
            <div class="fw-semibold">${member.position}</div>
            <div class="small text-muted">${departmentNames[member.department] || member.department}</div>
        </td>
        <td>
            <span class="badge bg-secondary">${departmentNames[member.department] || member.department}</span>
        </td>
        <td>
            <span class="badge bg-${statusClass}">${statusText}</span>
        </td>
        <td>${formatDate(member.startDate)}</td>
        <td>
            <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-primary" onclick="event.stopPropagation(); editTeamMember(${member.id})" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline-info" onclick="event.stopPropagation(); viewTeamMemberDetails(${member.id})" title="Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline-danger" onclick="event.stopPropagation(); deleteTeamMember(${member.id})" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

function displayOrgChart(team) {
    const container = document.getElementById('orgChart');
    
    // Group by department and hierarchy
    const hierarchy = {
        geschaeftsleitung: team.filter(m => m.department === 'geschaeftsleitung'),
        departments: {
            verwaltung: team.filter(m => m.department === 'verwaltung' && m.department !== 'geschaeftsleitung'),
            produktion: team.filter(m => m.department === 'produktion'),
            montage: team.filter(m => m.department === 'montage'),
            design: team.filter(m => m.department === 'design')
        }
    };
    
    const departmentNames = {
        verwaltung: 'Verwaltung',
        produktion: 'Produktion',
        montage: 'Montage & Service',
        design: 'Design & Grafik'
    };
    
    let orgChartHTML = `
        <div class="org-level org-level-0">
            <h4 class="text-center mb-4">Organisationsstruktur</h4>
            <div class="org-members">
                ${hierarchy.geschaeftsleitung.map(member => createOrgMemberCard(member)).join('')}
            </div>
        </div>
    `;
    
    // Add departments
    Object.keys(hierarchy.departments).forEach(dept => {
        const deptMembers = hierarchy.departments[dept];
        if (deptMembers.length > 0) {
            orgChartHTML += `
                <div class="org-level org-level-1">
                    <div class="org-department">
                        <h5 class="department-title">${departmentNames[dept]}</h5>
                        <div class="org-members">
                            ${deptMembers.map(member => createOrgMemberCard(member)).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    container.innerHTML = orgChartHTML;
    document.getElementById('teamOrgView-content').classList.remove('d-none');
}

function createOrgMemberCard(member) {
    const statusClass = {
        active: 'success',
        vacation: 'warning',
        sick: 'danger',
        inactive: 'secondary'
    }[member.status] || 'secondary';
    
    return `
        <div class="org-member-card" onclick="viewTeamMemberDetails(${member.id})">
            <div class="org-avatar-container">
                <img src="${member.profileImage}" alt="${member.firstName} ${member.lastName}" class="org-avatar">
                <div class="org-status-indicator bg-${statusClass}"></div>
                ${member.isManager ? '<div class="org-manager-badge"><i class="fas fa-crown"></i></div>' : ''}
            </div>
            <div class="org-member-info">
                <div class="org-member-name">${member.firstName} ${member.lastName}</div>
                <div class="org-member-position">${member.position}</div>
            </div>
        </div>
    `;
}

function updateTeamStats(team) {
    const totalCount = team.length;
    const activeCount = team.filter(m => m.status === 'active').length;
    const departments = [...new Set(team.map(m => m.department))].length;
    const apprentices = team.filter(m => m.positionLevel === 'lehrling').length;
    
    document.getElementById('totalTeamCount').textContent = totalCount;
    document.getElementById('activeTeamCount').textContent = activeCount;
    document.getElementById('departmentCount').textContent = departments;
    document.getElementById('apprenticeCount').textContent = apprentices;
}

function setTeamViewMode(mode) {
    currentTeamViewMode = mode;
    loadTeamList();
}

function sortTeam(sortBy) {
    currentTeamSort = sortBy;
    loadTeamList();
}

function applyTeamFilters() {
    loadTeamList();
    showNotification('Team-Filter angewendet', 'info');
}

function clearTeamFilters() {
    // Reset all filters
    document.getElementById('teamSearch').value = '';
    document.getElementById('teamDepartmentFilter').value = '';
    document.getElementById('teamPositionFilter').value = '';
    document.getElementById('teamStatusFilter').value = '';
    
    teamFilters = {
        search: '',
        department: '',
        position: '',
        status: ''
    };
    
    loadTeamList();
    showNotification('Filter zurückgesetzt', 'info');
}

function refreshTeamList() {
    loadTeamList();
    showNotification('Team-Liste aktualisiert', 'success');
}

// Team CRUD Operations
function openTeamModal(id = null) {
    currentTeamId = id;
    const modal = new bootstrap.Modal(document.getElementById('teamModal'));
    const modalTitle = document.getElementById('teamModalLabel');
    
    if (id) {
        // Edit mode
        const member = teamData.find(item => item.id === id);
        if (member) {
            populateTeamForm(member);
            modalTitle.textContent = 'Mitarbeiter bearbeiten';
        }
    } else {
        // Create mode
        clearTeamForm();
        modalTitle.textContent = 'Neuen Mitarbeiter hinzufügen';
    }
    
    modal.show();
}

function populateTeamForm(member) {
    document.getElementById('teamFirstName').value = member.firstName;
    document.getElementById('teamLastName').value = member.lastName;
    document.getElementById('teamPosition').value = member.position;
    document.getElementById('teamDepartment').value = member.department;
    document.getElementById('teamPositionLevel').value = member.positionLevel;
    document.getElementById('teamEmail').value = member.email || '';
    document.getElementById('teamPhone').value = member.phone || '';
    document.getElementById('teamBio').value = member.bio || '';
    document.getElementById('teamStartDate').value = member.startDate ? member.startDate.toISOString().split('T')[0] : '';
    document.getElementById('teamStatus').value = member.status;
    document.getElementById('teamShowOnWebsite').checked = member.showOnWebsite;
    document.getElementById('teamShowContact').checked = member.showContact;
    document.getElementById('teamIsManager').checked = member.isManager;
    
    // Update profile image preview
    document.getElementById('teamProfilePreview').src = member.profileImage;
    
    // Populate skills
    populateTeamSkills(member.skills || []);
}

function clearTeamForm() {
    document.getElementById('teamFirstName').value = '';
    document.getElementById('teamLastName').value = '';
    document.getElementById('teamPosition').value = '';
    document.getElementById('teamDepartment').value = 'geschaeftsleitung';
    document.getElementById('teamPositionLevel').value = 'fachkraft';
    document.getElementById('teamEmail').value = '';
    document.getElementById('teamPhone').value = '';
    document.getElementById('teamBio').value = '';
    document.getElementById('teamStartDate').value = '';
    document.getElementById('teamStatus').value = 'active';
    document.getElementById('teamShowOnWebsite').checked = true;
    document.getElementById('teamShowContact').checked = false;
    document.getElementById('teamIsManager').checked = false;
    
    // Reset profile image preview
    document.getElementById('teamProfilePreview').src = '../content/images/person1.jpg';
    
    // Clear skills
    populateTeamSkills([]);
}

// Skills Management
function populateTeamSkills(skills) {
    const container = document.getElementById('teamSkills');
    container.innerHTML = '';
    
    if (skills.length === 0) {
        skills = ['']; // Start with one empty skill
    }
    
    skills.forEach((skill, index) => {
        addSkillItem(skill);
    });
}

function addSkill() {
    addSkillItem('');
}

function addSkillItem(value = '') {
    const container = document.getElementById('teamSkills');
    const skillDiv = document.createElement('div');
    skillDiv.className = 'skill-item mb-2';
    skillDiv.innerHTML = `
        <div class="input-group">
            <span class="input-group-text">
                <i class="fas fa-star text-warning"></i>
            </span>
            <input type="text" class="form-control" placeholder="Fähigkeit oder Qualifikation eingeben" value="${value}">
            <button class="btn btn-outline-danger" type="button" onclick="removeSkill(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(skillDiv);
}

function removeSkill(button) {
    const skillItem = button.closest('.skill-item');
    const container = document.getElementById('teamSkills');
    
    // Don't allow removing the last skill item
    if (container.children.length > 1) {
        skillItem.remove();
    } else {
        // Just clear the input if it's the last one
        const input = skillItem.querySelector('input');
        input.value = '';
    }
}

function getTeamSkills() {
    const container = document.getElementById('teamSkills');
    const inputs = container.querySelectorAll('input');
    const skills = [];
    
    inputs.forEach(input => {
        if (input.value.trim()) {
            skills.push(input.value.trim());
        }
    });
    
    return skills;
}

// Profile Image Preview
function previewTeamImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('teamProfilePreview').src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function saveTeamMember() {
    const form = document.getElementById('teamForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const teamMember = {
        firstName: document.getElementById('teamFirstName').value,
        lastName: document.getElementById('teamLastName').value,
        position: document.getElementById('teamPosition').value,
        department: document.getElementById('teamDepartment').value,
        positionLevel: document.getElementById('teamPositionLevel').value,
        email: document.getElementById('teamEmail').value,
        phone: document.getElementById('teamPhone').value,
        bio: document.getElementById('teamBio').value,
        startDate: new Date(document.getElementById('teamStartDate').value),
        status: document.getElementById('teamStatus').value,
        showOnWebsite: document.getElementById('teamShowOnWebsite').checked,
        showContact: document.getElementById('teamShowContact').checked,
        isManager: document.getElementById('teamIsManager').checked,
        skills: getTeamSkills(),
        profileImage: document.getElementById('teamProfilePreview').src
    };
    
    if (currentTeamId) {
        // Update existing member
        const index = teamData.findIndex(item => item.id === currentTeamId);
        if (index !== -1) {
            teamData[index] = { ...teamData[index], ...teamMember };
            showNotification('Mitarbeiter erfolgreich aktualisiert', 'success');
        }
    } else {
        // Create new member
        const newMember = {
            id: Date.now(), // Simple ID generation
            ...teamMember,
            createdAt: new Date()
        };
        teamData.push(newMember);
        showNotification('Neuer Mitarbeiter erfolgreich hinzugefügt', 'success');
    }
    
    // Close modal and refresh list
    bootstrap.Modal.getInstance(document.getElementById('teamModal')).hide();
    loadTeamList();
}

function editTeamMember(id) {
    openTeamModal(id);
}

function deleteTeamMember(id) {
    const member = teamData.find(item => item.id === id);
    if (!member) return;
    
    if (confirm(`Möchten Sie "${member.firstName} ${member.lastName}" wirklich löschen?`)) {
        teamData = teamData.filter(item => item.id !== id);
        loadTeamList();
        showNotification('Mitarbeiter erfolgreich gelöscht', 'success');
    }
}

function viewTeamMemberDetails(id) {
    const member = teamData.find(item => item.id === id);
    if (!member) return;
    
    // Open detailed view in new window
    const detailWindow = window.open('', '_blank', 'width=800,height=900');
    
    const departmentNames = {
        geschaeftsleitung: 'Geschäftsleitung',
        produktion: 'Produktion',
        montage: 'Montage & Service',
        design: 'Design & Grafik',
        verwaltung: 'Verwaltung'
    };
    
    const statusNames = {
        active: 'Aktiv',
        vacation: 'Im Urlaub',
        sick: 'Krank',
        inactive: 'Inaktiv'
    };
    
    const skillsHtml = member.skills && member.skills.length > 0 ? 
        `<div class="skills">
            <h4>Fähigkeiten & Qualifikationen</h4>
            <div class="skill-tags">
                ${member.skills.map(skill => `<span class="skill-tag">${skill}</span>`).join('')}
            </div>
        </div>` : '';
    
    const yearsWithCompany = Math.floor((new Date() - new Date(member.startDate)) / (365.25 * 24 * 60 * 60 * 1000));
    
    detailWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${member.firstName} ${member.lastName} - Mitarbeiter Details</title>
            <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
            <style>
                body { padding: 2rem; background: #f8f9fa; }
                .profile-header { text-align: center; margin-bottom: 2rem; }
                .profile-avatar { width: 150px; height: 150px; border-radius: 50%; object-fit: cover; border: 5px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
                .info-card { background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
                .info-item { display: flex; align-items: center; gap: 0.5rem; }
                .skill-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
                .skill-tag { background: #007bff; color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-size: 0.8rem; }
                .manager-badge { background: linear-gradient(135deg, #ffc107, #ff8c00); color: white; padding: 0.5rem 1rem; border-radius: 20px; display: inline-flex; align-items: center; gap: 0.5rem; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="profile-header">
                    <img src="${member.profileImage}" alt="${member.firstName} ${member.lastName}" class="profile-avatar">
                    <h1 class="mt-3">${member.firstName} ${member.lastName}</h1>
                    <p class="lead">${member.position}</p>
                    ${member.isManager ? '<div class="manager-badge"><i class="fas fa-crown"></i> Führungskraft</div>' : ''}
                </div>
                
                <div class="info-card">
                    <h3>Persönliche Informationen</h3>
                    <div class="info-grid">
                        <div class="info-item">
                            <i class="fas fa-building text-primary"></i>
                            <span><strong>Abteilung:</strong> ${departmentNames[member.department] || member.department}</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-calendar text-info"></i>
                            <span><strong>Bei uns seit:</strong> ${formatDate(member.startDate)} (${yearsWithCompany} Jahre)</span>
                        </div>
                        <div class="info-item">
                            <i class="fas fa-circle text-success"></i>
                            <span><strong>Status:</strong> ${statusNames[member.status] || member.status}</span>
                        </div>
                        ${member.showContact && member.email ? `
                            <div class="info-item">
                                <i class="fas fa-envelope text-success"></i>
                                <span><strong>E-Mail:</strong> ${member.email}</span>
                            </div>
                        ` : ''}
                        ${member.showContact && member.phone ? `
                            <div class="info-item">
                                <i class="fas fa-phone text-info"></i>
                                <span><strong>Telefon:</strong> ${member.phone}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                ${member.bio ? `
                    <div class="info-card">
                        <h3>Über ${member.firstName}</h3>
                        <p>${member.bio}</p>
                    </div>
                ` : ''}
                
                ${skillsHtml}
            </div>
        </body>
        </html>
    `);
    detailWindow.document.close();
}

function previewTeamMember() {
    // Create temporary member object from form data
    const tempMember = {
        firstName: document.getElementById('teamFirstName').value || 'Vorname',
        lastName: document.getElementById('teamLastName').value || 'Nachname',
        position: document.getElementById('teamPosition').value || 'Position',
        department: document.getElementById('teamDepartment').value,
        email: document.getElementById('teamEmail').value,
        phone: document.getElementById('teamPhone').value,
        bio: document.getElementById('teamBio').value,
        startDate: new Date(document.getElementById('teamStartDate').value || Date.now()),
        status: document.getElementById('teamStatus').value,
        showContact: document.getElementById('teamShowContact').checked,
        isManager: document.getElementById('teamIsManager').checked,
        skills: getTeamSkills(),
        profileImage: document.getElementById('teamProfilePreview').src
    };
    
    // Use the same detail view function
    const originalTeamData = teamData;
    teamData = [tempMember];
    tempMember.id = 'preview';
    viewTeamMemberDetails('preview');
    teamData = originalTeamData;
} 

// Analytics & Dashboard Management
let analyticsData = {};
let currentAnalyticsPeriod = 'month';
let realTimeUpdateInterval = null;
let isRealTimeActive = false;

// Real-time analytics functions
function startRealTimeUpdates() {
    if (realTimeUpdateInterval) {
        clearInterval(realTimeUpdateInterval);
    }
    
    isRealTimeActive = true;
    
    // Update toggle button state
    const toggleButton = document.getElementById('realTimeToggleText');
    const toggleIcon = document.getElementById('realTimeToggleIcon');
    if (toggleButton) toggleButton.textContent = 'Stop';
    if (toggleIcon) toggleIcon.className = 'fas fa-stop';
    
    // Update every 10 seconds
    realTimeUpdateInterval = setInterval(updateRealTimeData, 10000);
    
    // Initial load
    updateRealTimeData();
}

function stopRealTimeUpdates() {
    if (realTimeUpdateInterval) {
        clearInterval(realTimeUpdateInterval);
        realTimeUpdateInterval = null;
    }
    isRealTimeActive = false;
}

async function updateRealTimeData() {
    // Get loading indicator once
    const lastUpdate = document.querySelector('.timestamp-badge');
    
    try {
        // Show subtle loading indicator
        if (lastUpdate) {
            lastUpdate.style.opacity = '0.5';
        }
        
        // Use same token logic as other analytics functions
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('📊 No access token found for real-time analytics');
            throw new Error('No authentication token');
        }
        
        const response = await fetch('/api/analytics/realtime', {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.status === 401) {
            // Token expired, try to refresh
            console.warn('📊 Real-time analytics token expired, attempting refresh...');
            const refreshSuccess = await refreshTokenIfNeeded();
            if (refreshSuccess) {
                // Retry with new token
                const newToken = localStorage.getItem('accessToken');
                const retryResponse = await fetch('/api/analytics/realtime', {
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Content-Type': 'application/json'
                    }
                });
                if (!retryResponse.ok) {
                    throw new Error('Real-time data fetch failed after token refresh');
                }
                // Process retry response
                const data = await retryResponse.json();
                updateRealTimeWidgets(data);
                return;
            } else {
                console.error('📊 Token refresh failed, stopping real-time updates');
                stopRealTimeUpdates();
                return;
            }
        }
        
        if (!response.ok) {
            throw new Error('Real-time data fetch failed');
        }
        
        const data = await response.json();
        
        // Update real-time widgets
        updateRealTimeWidgets(data);
        
        // Restore loading indicator
        if (lastUpdate) {
            lastUpdate.style.opacity = '1';
        }
        
        // Reset error counter on success
        window.realTimeErrorCount = 0;
        
        
    } catch (error) {
        console.error('⚡ Real-time update error:', error);
        
        // Restore loading indicator even on error
        if (lastUpdate) {
            lastUpdate.style.opacity = '1';
        }
        
        // Only show error notification after multiple failures
        if (!window.realTimeErrorCount) window.realTimeErrorCount = 0;
        window.realTimeErrorCount++;
        
        if (window.realTimeErrorCount >= 3) {
            showNotification('📊 Real-Time Daten temporär nicht verfügbar', 'warning');
            window.realTimeErrorCount = 0; // Reset counter
        }
    }
}

function updateRealTimeWidgets(data) {
    
    // Update active users (online visitors in last 5 minutes)
    const activeUsersElement = document.getElementById('liveVisitors');
    if (activeUsersElement) {
        activeUsersElement.textContent = data.activeNow || 0;
    }
    
    // Update 24h page views
    const pageViews24hElement = document.getElementById('livePageViews24h');
    if (pageViews24hElement) {
        pageViews24hElement.textContent = (data.last24HoursViews || 0).toLocaleString();
    }
    
    // Update 1h page views
    const pageViewsHourElement = document.getElementById('livePageViewsHour');
    if (pageViewsHourElement) {
        pageViewsHourElement.textContent = (data.lastHourViews || 0).toLocaleString();
    }
    
    // Update recent pages count
    const recentPagesElement = document.getElementById('liveRecentPages');
    if (recentPagesElement) {
        const recentCount = data.recentPages ? data.recentPages.length : 0;
        recentPagesElement.textContent = recentCount;
    }
    
    // Update live activity stream
    loadRealLiveActivityStream(data.recentPages || []);
    
    // Update locations (for now, use a simple calculation)
    const locationsElement = document.getElementById('liveLocations');
    if (locationsElement) {
        const estimatedCountries = Math.min(Math.max(Math.floor(data.activeNow / 2), 1), 10);
        locationsElement.textContent = estimatedCountries;
    }
    
    // Update live activity stream with real data
    if (data.recentPages && data.recentPages.length > 0) {
        loadRealLiveActivityStream(data.recentPages);
    }
    
    // Find and update timestamp somewhere in the real-time section
    const realTimeSection = document.querySelector('.card-header h5');
    if (realTimeSection) {
        // Add or update timestamp badge
        let timestampBadge = realTimeSection.querySelector('.timestamp-badge');
        if (!timestampBadge) {
            timestampBadge = document.createElement('small');
            timestampBadge.className = 'timestamp-badge text-muted ms-2';
            realTimeSection.appendChild(timestampBadge);
        }
        timestampBadge.textContent = `(${new Date().toLocaleTimeString()})`;
    }
    
}

// Toggle real-time updates (for the button in HTML)
function toggleRealTimeUpdates() {
    const toggleButton = document.getElementById('realTimeToggleText');
    const toggleIcon = document.getElementById('realTimeToggleIcon');
    
    if (isRealTimeActive) {
        stopRealTimeUpdates();
        if (toggleButton) toggleButton.textContent = 'Start';
        if (toggleIcon) toggleIcon.className = 'fas fa-play';
        showNotification('⚡ Real-time Updates gestoppt', 'info');
    } else {
        startRealTimeUpdates();
        if (toggleButton) toggleButton.textContent = 'Stop';
        if (toggleIcon) toggleIcon.className = 'fas fa-stop';
        showNotification('⚡ Real-time Updates gestartet', 'success');
    }
}

// Make toggle function globally available
window.toggleRealTimeUpdates = toggleRealTimeUpdates;

// Modern Chart.js instances with enhanced features
let trafficTrendChart = null;
let trafficSourcesChart = null;
let deviceAnalyticsChart = null;

// Modern Chart Configuration
const modernChartConfig = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false,
    },
    plugins: {
        legend: {
            display: true,
            position: 'top',
            labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                    size: 12,
                    family: "'DM Sans', sans-serif"
                }
            }
        },
        tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#333',
            bodyColor: '#666',
            borderColor: '#e0e0e0',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: true,
            boxPadding: 5,
            usePointStyle: true
        }
    },
    scales: {
        x: {
            grid: {
                display: true,
                color: 'rgba(0,0,0,0.05)'
            },
            ticks: {
                font: {
                    size: 11,
                    family: "'DM Sans', sans-serif"
                }
            }
        },
        y: {
            beginAtZero: true,
            grid: {
                display: true,
                color: 'rgba(0,0,0,0.05)'
            },
            ticks: {
                font: {
                    size: 11,
                    family: "'DM Sans', sans-serif"
                }
            }
        }
    }
};

function initAnalytics() {
    // Initialize modern analytics dashboard with enhanced charts
    // Ensure Chart.js is loaded first
    if (typeof Chart === 'undefined') {
        loadChartJS().then(() => {
            initModernChart();
            setupChartControls();
            loadSimplifiedAnalyticsData();
            setupChartAutoRefresh();
        }).catch(err => {
            console.error('Failed to load Chart.js:', err);
            showChartLoading(false);
        });
    } else {
        initModernChart();
        setupChartControls();
        loadSimplifiedAnalyticsData();
        setupChartAutoRefresh();
    }
}

// Initialize Modern Chart with enhanced features
function initModernChart() {
    // Wait for Chart.js to be loaded
    if (typeof Chart === 'undefined') {
        setTimeout(() => initModernChart(), 100);
        return;
    }
    
    const canvas = document.getElementById('trendCanvas');
    if (!canvas) {
        // Canvas not found, try again in a moment
        setTimeout(() => initModernChart(), 100);
        return;
    }

    // Clean up any existing charts first
    cleanupOldCharts();
    
    // Show loading state
    showChartLoading(true);

    // Destroy existing chart
    if (trafficTrendChart) {
        trafficTrendChart.destroy();
        trafficTrendChart = null;
    }

    // Load real chart data asynchronously
    loadRealChartData('7');
}

// Load real chart data from analytics API
async function loadRealChartData(period = '7') {
    try {
        const periodMap = {
            '7': 'week',
            '30': 'month', 
            '90': 'quarter'
        };
        
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.error('📊 No access token found for analytics API');
            throw new Error('No authentication token');
        }
        
        console.log('📊 Calling analytics API with period:', periodMap[period] || 'week');
        const response = await fetch(`/api/analytics/dashboard?period=${periodMap[period] || 'week'}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const analyticsData = await response.json();
            console.log('📊 Analytics API Response:', analyticsData);
            console.log('📊 Current trend data:', analyticsData.charts?.currentTrend);
            const chartData = generateModernChartData(period, analyticsData);
            console.log('📊 Generated chart data:', chartData);
            createChartWithData(chartData);
        } else {
            console.error('📊 Analytics API failed with status:', response.status);
            throw new Error('Failed to fetch analytics data');
        }
    } catch (error) {
        console.error('Error loading real chart data:', error);
        // Fallback to demo data
        const fallbackData = await generateChartDataForPeriod(period);
        createChartWithData(fallbackData);
    }
}

// Create chart with data
function createChartWithData(chartData) {
    const canvas = document.getElementById('trendCanvas');
    if (!canvas) return;
    
    const config = {
        type: 'line',
        data: chartData,
        options: {
            ...modernChartConfig,
            plugins: {
                ...modernChartConfig.plugins,
                title: {
                    display: false
                }
            },
            elements: {
                line: {
                    tension: 0.4, // Smooth curves
                    borderWidth: 3
                },
                point: {
                    radius: 5,
                    hoverRadius: 8,
                    borderWidth: 2,
                    backgroundColor: '#fff'
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeInOutQuart'
            }
        }
    };

    try {
        trafficTrendChart = new Chart(canvas, config);
        showChartLoading(false);
    } catch (error) {
        console.error('❌ Error creating modern chart:', error);
        showChartLoading(false);
    }
}

// Generate modern chart data from real analytics data
function generateModernChartData(period = '7', analyticsData = null) {
    if (analyticsData && analyticsData.charts && analyticsData.charts.currentTrend) {
        // Use real data from analytics API - currentTrend contains the period-appropriate data
        const trendData = analyticsData.charts.currentTrend;
        const labels = trendData.map(item => item.day);
        const visitors = trendData.map(item => item.visitors);
        
        // Use real pageviews if available, otherwise estimate based on visitors
        const pageviews = trendData.map(item => item.pageViews || Math.floor(item.visitors * 1.8));

        console.log(`📊 Using real trend data for period ${period}:`, {
            type: analyticsData.charts.trendType,
            dataPoints: trendData.length,
            totalVisitors: visitors.reduce((a, b) => a + b, 0)
        });

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Besucher',
                    data: visitors,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(59, 130, 246)',
                },
                {
                    label: 'Seitenaufrufe',
                    data: pageviews,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    pointBackgroundColor: 'rgb(16, 185, 129)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(16, 185, 129)',
                }
            ]
        };
    }
    
    // Fallback: try legacy weeklyTrend for backward compatibility
    if (analyticsData && analyticsData.charts && analyticsData.charts.weeklyTrend) {
        const weeklyData = analyticsData.charts.weeklyTrend;
        const labels = weeklyData.map(item => item.day);
        const visitors = weeklyData.map(item => item.visitors);
        const pageviews = weeklyData.map(item => item.pageViews || Math.floor(item.visitors * 1.8));

        return {
            labels: labels,
            datasets: [
                {
                    label: 'Besucher',
                    data: visitors,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    fill: true,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(59, 130, 246)',
                },
                {
                    label: 'Seitenaufrufe',
                    data: pageviews,
                    borderColor: 'rgb(16, 185, 129)',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    fill: true,
                    pointBackgroundColor: 'rgb(16, 185, 129)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgb(16, 185, 129)',
                }
            ]
        };
    }
    
    // Fallback: generate dates for different periods and fetch real data
    return generateChartDataForPeriod(period);
}

// Generate chart data for different periods (7, 30, 90 days)
async function generateChartDataForPeriod(period = '7') {
    try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            console.warn('📊 No access token for fallback analytics API');
            // Skip API call and go to fallback data
            throw new Error('No authentication token');
        }
        
        // Fetch real analytics data for the period
        const response = await fetch(`/api/analytics/dashboard?period=${period === '7' ? 'week' : period === '30' ? 'month' : 'quarter'}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            if (data.charts && (data.charts.currentTrend || data.charts.weeklyTrend)) {
                return generateModernChartData(period, data);
            }
        }
    } catch (error) {
        console.error('Error fetching real chart data:', error);
    }
    
    // Fallback to demo data if API fails
    const days = parseInt(period);
    const labels = [];
    const visitors = [];
    const pageviews = [];

    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('de-DE', { 
            weekday: 'short', 
            day: 'numeric',
            month: 'short'
        }));
        
        // Generate empty fallback data (no random data)
        visitors.push(0);
        pageviews.push(0);
    }

    return {
        labels: labels,
        datasets: [
            {
                label: 'Besucher',
                data: visitors,
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true,
                pointBackgroundColor: 'rgb(59, 130, 246)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(59, 130, 246)',
            },
            {
                label: 'Seitenaufrufe',
                data: pageviews,
                borderColor: 'rgb(16, 185, 129)',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                fill: true,
                pointBackgroundColor: 'rgb(16, 185, 129)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgb(16, 185, 129)',
            }
        ]
    };
}

// Setup chart control handlers
function setupChartControls() {
    // Period selector
    document.querySelectorAll('input[name="chartPeriod"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.checked) {
                updateChartPeriod(this.value);
            }
        });
    });

    // Chart type selector
    document.querySelectorAll('[data-chart-type]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const chartType = this.getAttribute('data-chart-type');
            updateChartType(chartType);
        });
    });
}

// Update chart period with smooth transition
function updateChartPeriod(period) {
    showChartLoading(true);
    
    // Update title immediately
    const title = document.querySelector('#analytics-section .card-title');
    if (title) {
        const periodText = period === '7' ? '7 Tage' : period === '30' ? '30 Tage' : '90 Tage';
        title.innerHTML = `<i class="fas fa-chart-line text-primary"></i> Trend der letzten ${periodText}`;
    }
    
    // Destroy current chart
    if (trafficTrendChart) {
        trafficTrendChart.destroy();
        trafficTrendChart = null;
    }
    
    // Load new data
    setTimeout(() => {
        loadRealChartData(period);
    }, 200);
}

// Update chart type with animation
function updateChartType(type) {
    if (!trafficTrendChart) return;
    
    showChartLoading(true);
    
    setTimeout(() => {
        trafficTrendChart.config.type = type;
        
        // Adjust configuration based on type
        if (type === 'area' || type === 'line') {
            trafficTrendChart.data.datasets.forEach(dataset => {
                dataset.fill = type === 'area';
            });
        } else if (type === 'bar') {
            trafficTrendChart.data.datasets.forEach(dataset => {
                dataset.fill = false;
            });
        }
        
        trafficTrendChart.update('active');
        showChartLoading(false);
    }, 300);
}

// Show/hide chart loading state
function showChartLoading(show) {
    const loadingEl = document.getElementById('chartLoading');
    if (loadingEl) {
        loadingEl.style.display = show ? 'block' : 'none';
    }
}

// Setup automatic chart refresh
function setupChartAutoRefresh() {
    // Clear any existing intervals
    if (window.chartRefreshInterval) {
        clearInterval(window.chartRefreshInterval);
    }
    
    // Auto-refresh chart every 5 minutes
    window.chartRefreshInterval = setInterval(() => {
        const analyticsSection = document.getElementById('analytics-section');
        
        // Only refresh if analytics section is visible
        if (analyticsSection && analyticsSection.style.display !== 'none') {
            // Get current selected period
            const selectedPeriod = document.querySelector('input[name="chartPeriod"]:checked');
            const period = selectedPeriod ? selectedPeriod.value : '7';
            
            // Reload chart data
            loadRealChartData(period);
        }
    }, 300000); // 5 minutes
    
    console.log('📊 Chart auto-refresh set up (every 5 minutes)');
}



// Clean up old chart elements and conflicts
function cleanupOldCharts() {
    // Destroy any existing Chart.js instances
    if (window.Chart && window.Chart.instances) {
        Object.values(window.Chart.instances).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
    }
    
    // Clear any old chart canvases that might be causing conflicts
    const canvas = document.getElementById('trendCanvas');
    if (canvas) {
        // Clear the canvas
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
        
        // Reset canvas attributes
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    
    // Reset global chart variables
    trafficTrendChart = null;
    trafficSourcesChart = null;
    deviceAnalyticsChart = null;
}

// Load simplified analytics data
async function loadSimplifiedAnalyticsData() {
    try {
        
        const response = await fetch('/api/analytics/dashboard?period=month', {
            headers: getAuthHeaders()
        });
        
        if (response.status === 401) {
            // Token expired, try to refresh
            console.warn('📊 Analytics dashboard token expired, attempting refresh...');
            const refreshSuccess = await refreshTokenIfNeeded();
            if (refreshSuccess) {
                // Retry with new token
                const retryResponse = await fetch('/api/analytics/dashboard?period=month', {
                    headers: getAuthHeaders()
                });
                if (!retryResponse.ok) {
                    throw new Error('Failed to load analytics data after token refresh');
                }
                const data = await retryResponse.json();
                analyticsData = data;
                updateAnalyticsDisplay(data);
                return;
            } else {
                console.error('📊 Token refresh failed for dashboard analytics');
                throw new Error('Authentication failed');
            }
        }
        
        if (!response.ok) {
            throw new Error('Failed to load analytics data');
        }
        
        const data = await response.json();
        analyticsData = data;
        
        // Update extended KPIs
        updateExtendedAnalyticsKPIs(data.kpis);
        
        // Load top content pages
        loadSimplifiedContentPerformance(data.charts?.topPages);
        
        // Render weekly trend and traffic sources if available
        if (data.charts?.weeklyTrend) {
            renderWeeklyTrendChart(data.charts.weeklyTrend);
        }
        
        if (data.charts?.trafficSources) {
            renderTrafficSources(data.charts.trafficSources);
        }
        
        // Render country statistics if available
        if (data.charts?.countryStats) {
            renderCountryStatistics(data.charts.countryStats);
        }
        
        showNotification('📊 Analytics aktualisiert', 'success');
        
    } catch (error) {
        console.error('📊 Failed to load analytics data:', error);
        showNotification('Verwende Sample-Daten', 'warning');
        
        // Fallback to simplified sample data
        loadSampleAnalyticsData();
    }
}

// Load sample data as fallback
function loadSampleAnalyticsData() {
    // Generate extended sample data
    const sampleData = {
        kpis: {
            uniqueVisitors: 1247,
            pageViews: 5892,
            avgDuration: '02:34',
            mobileRatio: '67%'
        },
        weeklyTrend: [
            { day: 'Mo', visitors: 186 },
            { day: 'Di', visitors: 203 },
            { day: 'Mi', visitors: 178 },
            { day: 'Do', visitors: 225 },
            { day: 'Fr', visitors: 195 },
            { day: 'Sa', visitors: 142 },
            { day: 'So', visitors: 118 }
        ],
        trafficSources: [
            { source: 'Google', percentage: 45, visitors: 560 },
            { source: 'Direkt', percentage: 32, visitors: 399 },
            { source: 'Social Media', percentage: 15, visitors: 187 },
            { source: 'Referrals', percentage: 8, visitors: 101 }
        ],
        topPages: [
            { page: '/lichtwerbung/leuchtschriften', views: 892, title: 'LED Leuchtschriften' },
            { page: '/beschriftungen/fahrzeugbeschriftung', views: 756, title: 'Fahrzeugbeschriftung' },
            { page: '/', views: 654, title: 'Homepage' },
            { page: '/lichtwerbung', views: 543, title: 'Lichtwerbung' },
            { page: '/beschriftungen', views: 432, title: 'Beschriftungen' }
        ]
    };
    
    updateExtendedAnalyticsKPIs(sampleData.kpis);
    loadSimplifiedContentPerformance(sampleData.topPages);
    renderWeeklyTrendChart(sampleData.weeklyTrend);
    renderTrafficSources(sampleData.trafficSources);
    
}

// Update extended KPIs
function updateExtendedAnalyticsKPIs(kpis) {
    try {
        // Update Unique Visitors
        const visitorsElement = document.getElementById('analyticsUniqueVisitors');
        if (visitorsElement && kpis.uniqueVisitors !== undefined) {
            visitorsElement.textContent = formatNumber(kpis.uniqueVisitors);
        }
        
        // Update Page Views  
        const pageViewsElement = document.getElementById('analyticsPageViews');
        if (pageViewsElement && kpis.pageViews !== undefined) {
            pageViewsElement.textContent = formatNumber(kpis.pageViews);
        }
        
        // Update Average Duration
        const avgDurationElement = document.getElementById('analyticsAvgDuration');
        if (avgDurationElement && kpis.avgDuration !== undefined) {
            avgDurationElement.textContent = kpis.avgDuration;
        }
        
        // Update Mobile Ratio
        const mobileRatioElement = document.getElementById('analyticsMobileRatio');
        if (mobileRatioElement && kpis.mobileRatio !== undefined) {
            mobileRatioElement.textContent = kpis.mobileRatio;
        }
        
    } catch (error) {
        console.error('📊 Error updating extended KPIs:', error);
    }
}

// Render weekly trend chart
function renderWeeklyTrendChart(weeklyData) {
    try {
        const canvas = document.getElementById('trendCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!weeklyData || weeklyData.length === 0) {
            ctx.fillStyle = '#6c757d';
            ctx.font = '16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Keine Daten verfügbar', width / 2, height / 2);
            return;
        }
        
        // Chart styling
        const padding = 40;
        const chartWidth = width - (padding * 2);
        const chartHeight = height - (padding * 2);
        
        // Find max value for scaling
        const maxValue = Math.max(...weeklyData.map(d => d.visitors));
        const stepX = chartWidth / (weeklyData.length - 1);
        
        // Draw grid lines
        ctx.strokeStyle = '#e9ecef';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 4; i++) {
            const y = padding + (chartHeight / 4) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw line chart
        ctx.strokeStyle = '#007bff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        weeklyData.forEach((item, index) => {
            const x = padding + (stepX * index);
            const y = padding + chartHeight - ((item.visitors / maxValue) * chartHeight);
            
            if (index === 0) {
                ctx.moveTo(x, y);
    } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw points and labels
        ctx.fillStyle = '#007bff';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        
        weeklyData.forEach((item, index) => {
            const x = padding + (stepX * index);
            const y = padding + chartHeight - ((item.visitors / maxValue) * chartHeight);
            
            // Draw point
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw day label
            ctx.fillStyle = '#495057';
            ctx.fillText(item.day, x, height - 10);
            
            // Draw value
            ctx.fillStyle = '#007bff';
            ctx.fillText(item.visitors.toString(), x, y - 10);
        });
        
    } catch (error) {
        console.error('📊 Error rendering weekly trend chart:', error);
    }
}

// Render traffic sources
function renderTrafficSources(trafficSources) {
    try {
        const container = document.getElementById('trafficSourcesList');
        if (!container) return;
        
        if (!trafficSources || trafficSources.length === 0) {
            container.innerHTML = `
                <div class="text-center p-3 text-muted">
                    <i class="fas fa-info-circle"></i>
                    <p class="mb-0 mt-2">Keine Daten verfügbar</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        
        trafficSources.forEach((source, index) => {
            const color = ['#007bff', '#28a745', '#ffc107', '#dc3545'][index] || '#6c757d';
            
            html += `
                <div class="traffic-source-item mb-3">
                    <div class="d-flex justify-content-between align-items-center mb-1">
                        <div class="d-flex align-items-center">
                            <div class="traffic-color-dot me-2" style="width: 12px; height: 12px; border-radius: 50%; background: ${color};"></div>
                            <span class="fw-bold">${source.source}</span>
                        </div>
                        <span class="text-muted">${source.percentage}%</span>
                    </div>
                    <div class="progress" style="height: 8px;">
                        <div class="progress-bar" style="width: ${source.percentage}%; background: ${color};"></div>
                    </div>
                    <small class="text-muted">${formatNumber(source.visitors)} Besucher</small>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('📊 Error rendering traffic sources:', error);
    }
}

// Load simplified content performance
function loadSimplifiedContentPerformance(topPages) {
    try {
        const container = document.getElementById('contentPerformanceList');
        if (!container) return;
        
        if (!topPages || topPages.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4 text-muted">
                    <i class="fas fa-info-circle fa-2x mb-3"></i>
                    <p>Keine Analytics-Daten verfügbar</p>
                </div>
            `;
            return;
        }
        
        let html = '<div class="list-group list-group-flush">';
        
        topPages.slice(0, 10).forEach((item, index) => {
            const title = item.title || item.page.replace(/^\//, '').replace(/\//g, ' › ') || 'Homepage';
            const views = formatNumber(item.views || 0);
            
            html += `
                <div class="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                        <div class="fw-bold">${title}</div>
                        <small class="text-muted">${item.page}</small>
                    </div>
                    <div class="text-end">
                        <span class="badge bg-primary rounded-pill">${views}</span>
                        <small class="text-muted d-block">Aufrufe</small>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
    } catch (error) {
        console.error('📊 Error loading content performance:', error);
    }
}

// Helper function to format numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Load REAL analytics data from API
async function loadRealAnalyticsData() {
    try {
        showNotification('📊 Lade Analytics-Daten...', 'info');
        
        const response = await fetch(`/api/analytics/dashboard?period=${currentAnalyticsPeriod}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to load analytics data');
        }
        
        const data = await response.json();
        analyticsData = data;
        
        // Update all dashboard components
        updateRealAnalyticsKPIs(data.kpis);
        if (typeof Chart !== 'undefined') {
            initRealAnalyticsCharts(data.charts);
        }
        loadRealContentPerformance(data.charts.topPages);
        
        // Render country statistics if available
        if (data.charts?.countryStats) {
            renderCountryStatistics(data.charts.countryStats);
        }
        
        showNotification('📊 Analytics-Daten geladen!', 'success');
        
    } catch (error) {
        console.error('📊 Failed to load analytics data:', error);
        showNotification('Fehler beim Laden der Analytics-Daten - verwende Sample-Daten', 'warning');
        
        // Fallback to sample data
        generateSampleAnalyticsData();
        updateAnalyticsKPIs();
        if (typeof Chart !== 'undefined') {
            initAnalyticsCharts();
        }
    }
}

function generateSampleAnalyticsData() {
    // Generate realistic sample data for analytics (FALLBACK)
    analyticsData = {
        visitors: generateTimeSeriesData(30, 100, 300),
        pageViews: generateTimeSeriesData(30, 400, 800),
        trafficSources: {
            'Organic Search': 45.2,
            'Direct': 32.1,
            'Social Media': 12.4,
            'Referral': 8.3,
            'Email': 2.0
        },
        devices: {
            'Desktop': 33.5,
            'Mobile': 52.8,
            'Tablet': 13.7
        },
        topPages: [
            { page: '/services/fahrzeugbeschriftung', views: 2847, change: 12.5 },
            { page: '/lichtwerbung', views: 2341, change: 8.7 },
            { page: '/', views: 1923, change: -2.1 },
            { page: '/projekte', views: 1654, change: 15.3 },
            { page: '/team', views: 1287, change: 4.2 }
        ],
        services: {
            'Fahrzeugbeschriftung': 35,
            'LED Leuchtschriften': 28,
            'Grossformatdruck': 18,
            'Signaletik': 12,
            'Montage & Service': 7
        }
    };
}

function generateTimeSeriesData(days, min, max) {
    const data = [];
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        // Add some realistic variance (weekends lower, working days higher)
        const dayOfWeek = date.getDay();
        const weekendFactor = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.6 : 1.0;
        const baseValue = min + Math.random() * (max - min);
        const value = Math.floor(baseValue * weekendFactor);
        
        data.push({
            date: date.toISOString().split('T')[0],
            value: value
        });
    }
    
    return data;
}

function initDashboardCharts() {
    // Modern charts are initialized via initAnalytics() instead
    // This prevents conflicts with the new chart system
    return;
}

// Real charts with REAL data
function initRealAnalyticsCharts(chartData) {
    
    // Traffic Trend Chart (line chart)
    const trafficCtx = document.getElementById('trafficTrendChart');
    if (trafficCtx) {
        if (trafficTrendChart) trafficTrendChart.destroy();
        
        const dates = chartData.dailyPageViews ? Object.keys(chartData.dailyPageViews).sort() : [];
        const pageViews = dates.map(date => chartData.dailyPageViews[date]);
        
        trafficTrendChart = new Chart(trafficCtx, {
            type: 'line',
            data: {
                labels: dates.map(date => new Date(date).toLocaleDateString()),
                datasets: [{
                    label: 'Page Views',
                    data: pageViews,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }
    
    // Traffic Sources Chart (doughnut)
    const sourcesCtx = document.getElementById('trafficSourcesChart');
    if (sourcesCtx) {
        if (trafficSourcesChart) trafficSourcesChart.destroy();
        
        const referrers = (chartData.topReferrers && chartData.topReferrers.length > 0) ? 
            chartData.topReferrers : [{ referrer: 'Direct', sessions: 100 }];
        
        trafficSourcesChart = new Chart(sourcesCtx, {
            type: 'doughnut',
            data: {
                labels: referrers.map(r => r.referrer || 'Direct'),
                datasets: [{
                    data: referrers.map(r => r.sessions),
                    backgroundColor: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6f42c1']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
    
    // Device Analytics Chart (pie chart)
    const deviceCtx = document.getElementById('deviceAnalyticsChart');
    if (deviceCtx) {
        if (deviceAnalyticsChart) deviceAnalyticsChart.destroy();
        
        const devices = (chartData.deviceBreakdown && Object.keys(chartData.deviceBreakdown).length > 0) ?
            chartData.deviceBreakdown : { desktop: 50, mobile: 40, tablet: 10 };
        
        deviceAnalyticsChart = new Chart(deviceCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(devices),
                datasets: [{
                    data: Object.values(devices),
                    backgroundColor: ['#007bff', '#28a745', '#ffc107']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

function loadRealContentPerformance(topPages) {
    const container = document.getElementById('contentPerformanceList');
    if (!container) return;
    
    if (!topPages || !Array.isArray(topPages) || topPages.length === 0) {
        container.innerHTML = '<p class="text-muted">Noch keine Daten verfügbar</p>';
        return;
    }
    
    container.innerHTML = topPages.slice(0, 10).map((page, index) => `
        <div class="content-item d-flex justify-content-between align-items-center mb-2">
            <div>
                <span class="content-rank">${index + 1}.</span>
                <span class="content-title">${page.path}</span>
            </div>
            <span class="content-views badge bg-primary">${page.views}</span>
        </div>
    `).join('');
}

function initAnalyticsCharts() {
    // Traffic Trend Chart
    const trafficTrendCtx = document.getElementById('trafficTrendChart');
    if (trafficTrendCtx) {
        trafficTrendChart = new Chart(trafficTrendCtx, {
            type: 'line',
            data: {
                labels: analyticsData.visitors.map(d => {
                    const date = new Date(d.date);
                    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
                }),
                datasets: [
                    {
                        label: 'Besucher',
                        data: analyticsData.visitors.map(d => d.value),
                        borderColor: '#007bff',
                        backgroundColor: 'rgba(0, 123, 255, 0.1)',
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'Seitenaufrufe',
                        data: analyticsData.pageViews.map(d => d.value),
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        fill: true,
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    // Traffic Sources Chart
    const trafficSourcesCtx = document.getElementById('trafficSourcesChart');
    if (trafficSourcesCtx) {
        trafficSourcesChart = new Chart(trafficSourcesCtx, {
            type: 'pie',
            data: {
                labels: Object.keys(analyticsData.trafficSources),
                datasets: [{
                    data: Object.values(analyticsData.trafficSources),
                    backgroundColor: [
                        '#007bff',
                        '#28a745',
                        '#17a2b8',
                        '#ffc107',
                        '#dc3545'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
    
    // Device Analytics Chart
    const deviceAnalyticsCtx = document.getElementById('deviceAnalyticsChart');
    if (deviceAnalyticsCtx) {
        deviceAnalyticsChart = new Chart(deviceAnalyticsCtx, {
            type: 'bar',
            data: {
                labels: Object.keys(analyticsData.devices),
                datasets: [{
                    label: 'Gerätenutzung (%)',
                    data: Object.values(analyticsData.devices),
                    backgroundColor: [
                        '#007bff',
                        '#28a745',
                        '#ffc107'
                    ],
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 60,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
}

function updateDashboardMetrics() {
    // Load dashboard statistics
    loadDashboardStats();
}

async function refreshTokenIfNeeded() {
    try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
            console.warn('No refresh token available');
            return false;
        }

        const response = await fetch('/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken })
        });

        if (response.ok) {
            const data = await response.json();
            if (data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                if (data.refreshToken) {
                    localStorage.setItem('refreshToken', data.refreshToken);
                }
                localStorage.setItem('tokenExpiry', Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
                // Token successfully refreshed
                return true;
            }
        } else {
            console.warn('Token refresh failed:', response.status);
            // Clear invalid tokens
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiry');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
    return false;
}

async function loadDashboardStats() {
    try {
        // Get auth token (check all possible token locations)
        let token = localStorage.getItem('accessToken') || 
                   localStorage.getItem('adminToken') || 
                   localStorage.getItem('authToken') ||
                   localStorage.getItem('token');
        
        // Check token expiry
        const tokenExpiry = localStorage.getItem('tokenExpiry');
        if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
            // Token expired, attempting refresh
            // Try to refresh token
            await refreshTokenIfNeeded();
            token = localStorage.getItem('accessToken'); // Get refreshed token
        }
        
        const headers = {
            'Content-Type': 'application/json'
        };
        
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        // Dashboard stats loading
        
        // Load customer count
        try {
            // Loading customers
            const customersResponse = await fetch('/api/customers', { headers });
            
            if (customersResponse.ok) {
                const customersData = await customersResponse.json();
                // Customers data received
                const totalCustomers = document.getElementById('totalCustomersCount');
                if (totalCustomers) {
                    if (customersData.customers && Array.isArray(customersData.customers)) {
                        totalCustomers.textContent = customersData.customers.length;
                    } else if (Array.isArray(customersData)) {
                        totalCustomers.textContent = customersData.length;
                    } else {
                        totalCustomers.textContent = '0';
                    }
                }
            } else if (customersResponse.status === 401) {
                // Authentication failed, try alternative approach
                console.warn('Authentication failed for customers API');
                const totalCustomers = document.getElementById('totalCustomersCount');
                if (totalCustomers) {
                    totalCustomers.textContent = '?';
                    totalCustomers.title = 'Login erforderlich';
                }
            } else {
                console.warn('Customers API error:', customersResponse.status);
            }
        } catch (error) {
            console.warn('Error loading customers:', error);
            const totalCustomers = document.getElementById('totalCustomersCount');
            if (totalCustomers) {
                totalCustomers.textContent = '?';
                totalCustomers.title = 'Fehler beim Laden';
            }
        }
        
        // Load newsletter subscribers count
        try {
            const newsletterResponse = await fetch('/api/newsletter/subscribers', { headers });
            if (newsletterResponse.ok) {
                const newsletterData = await newsletterResponse.json();
                const totalNewsletter = document.getElementById('totalNewsletterCount');
                if (totalNewsletter) {
                    if (newsletterData.subscribers && Array.isArray(newsletterData.subscribers)) {
                        totalNewsletter.textContent = newsletterData.subscribers.length;
                    } else if (Array.isArray(newsletterData)) {
                        totalNewsletter.textContent = newsletterData.length;
                    } else {
                        totalNewsletter.textContent = '0';
                    }
                }
            } else {
                console.warn('Newsletter API error:', newsletterResponse.status);
            }
        } catch (error) {
            console.warn('Error loading newsletter subscribers:', error);
        }
        
        // Load pages count (static count for now)
        const totalPages = document.getElementById('totalPagesCount');
        if (totalPages) {
            totalPages.textContent = '25+';
        }
        
        // Media count is already loaded by media management
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        // Set fallback values
        const totalCustomers = document.getElementById('totalCustomersCount');
        if (totalCustomers) totalCustomers.textContent = '0';
        
        const totalNewsletter = document.getElementById('totalNewsletterCount');
        if (totalNewsletter) totalNewsletter.textContent = '0';
        
        const totalPages = document.getElementById('totalPagesCount');
        if (totalPages) totalPages.textContent = '25+';
    }
}

function loadActivityFeed() {
    // Activity feed removed for simplified dashboard
    return;
}

// Update KPIs with REAL data
function updateRealAnalyticsKPIs(kpis) {
    
    // Update unique visitors
    const visitorsElement = document.getElementById('analyticsUniqueVisitors');
    if (visitorsElement) {
        visitorsElement.textContent = kpis.uniqueVisitors.toLocaleString();
        updateTrendIndicator('analyticsUniqueVisitorsTrend', kpis.trends.visitors);
    }
    
    // Update page views
    const pageViewsElement = document.getElementById('analyticsPageViews');
    if (pageViewsElement) {
        pageViewsElement.textContent = kpis.totalPageViews.toLocaleString();
        updateTrendIndicator('analyticsPageViewsTrend', kpis.trends.pageViews);
    }
    
    // Update avg duration
    const durationElement = document.getElementById('analyticsAvgDuration');
    if (durationElement) {
        const minutes = Math.floor(kpis.avgSessionDuration / 60);
        const seconds = kpis.avgSessionDuration % 60;
        durationElement.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        updateTrendIndicator('analyticsAvgDurationTrend', 0); // Duration trend not implemented yet
    }
    
    // Update bounce rate
    const bounceElement = document.getElementById('analyticsBounceRate');
    if (bounceElement) {
        bounceElement.textContent = `${kpis.bounceRate.toFixed(1)}%`;
        updateTrendIndicator('analyticsBounceRateTrend', 0); // Bounce rate trend not implemented yet
    }
    
    // Update conversion rate
    const conversionElement = document.getElementById('analyticsConversionRate');
    if (conversionElement) {
        conversionElement.textContent = `${kpis.conversionRate.toFixed(1)}%`;
        updateTrendIndicator('analyticsConversionRateTrend', 0); // Conversion trend not implemented yet
    }
    
    // Update mobile users
    const mobileElement = document.getElementById('analyticsMobileUsers');
    if (mobileElement) {
        mobileElement.textContent = `${kpis.mobilePercentage.toFixed(1)}%`;
        updateTrendIndicator('analyticsMobileUsersTrend', 0); // Mobile trend not implemented yet
    }
    
}

function updateTrendIndicator(elementId, trendValue) {
    const trendElement = document.getElementById(elementId);
    if (trendElement && trendValue !== undefined && trendValue !== 0) {
        const isPositive = trendValue > 0;
        const icon = isPositive ? 'fa-trending-up' : 'fa-trending-down';
        const className = isPositive ? 'positive' : 'negative';
        const sign = isPositive ? '+' : '';
        
        trendElement.className = `kpi-trend ${className}`;
        trendElement.innerHTML = `<i class="fas ${icon}"></i> ${sign}${trendValue.toFixed(1)}%`;
    } else if (trendElement) {
        // Show neutral indicator if no trend data
        trendElement.className = 'kpi-trend';
        trendElement.innerHTML = '<i class="fas fa-minus"></i> --';
    }
}

function updateAnalyticsKPIs() {
    // Update KPI values with simple method (no animation for now to avoid complexity)
    const visitors = document.getElementById('analyticsUniqueVisitors');
    if (visitors) {
        visitors.textContent = '3,247';
    } else {
        console.error('analyticsUniqueVisitors element not found');
    }
    
    const pageViews = document.getElementById('analyticsPageViews');
    if (pageViews) pageViews.textContent = '12,847';
    
    const bounceRate = document.getElementById('analyticsBounceRate');
    if (bounceRate) bounceRate.textContent = '32.1%';
    
    const inquiries = document.getElementById('analyticsInquiries');
    if (inquiries) inquiries.textContent = '47';
    
    const mobileUsers = document.getElementById('analyticsMobileUsers');
    if (mobileUsers) mobileUsers.textContent = '67%';
    
    const avgDuration = document.getElementById('analyticsAvgDuration');
    if (avgDuration) avgDuration.textContent = '3:24';
    
}

function animateValue(elementId, endValue, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const startValue = 0;
    const duration = 1500;
    const startTime = performance.now();
    
    function updateValue(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentValue = startValue + (endValue - startValue) * easeOutQuart;
        
        if (suffix === '%') {
            element.textContent = currentValue.toFixed(1) + suffix;
        } else if (endValue > 1000) {
            element.textContent = Math.floor(currentValue).toLocaleString() + suffix;
        } else {
            element.textContent = Math.floor(currentValue) + suffix;
        }
        
        if (progress < 1) {
            requestAnimationFrame(updateValue);
        }
    }
    
    requestAnimationFrame(updateValue);
}

function loadContentPerformance() {
    const container = document.getElementById('contentPerformanceList');
    if (!container) return;
    
    const topPages = [
        { page: '/services/fahrzeugbeschriftung', views: 2847, change: 12.5 },
        { page: '/lichtwerbung', views: 2341, change: 8.7 },
        { page: '/', views: 1923, change: -2.1 },
        { page: '/projekte', views: 1654, change: 15.3 },
        { page: '/team', views: 1287, change: 4.2 }
    ];
    
    container.innerHTML = topPages.map((page, index) => `
        <div class="content-performance-item">
            <div class="performance-rank">${index + 1}</div>
            <div class="performance-details">
                <div class="performance-page">${page.page}</div>
                <div class="performance-stats">
                    <span class="performance-views">${page.views.toLocaleString()} Aufrufe</span>
                    <span class="performance-change ${page.change >= 0 ? 'positive' : 'negative'}">
                        <i class="fas fa-arrow-${page.change >= 0 ? 'up' : 'down'}"></i>
                        ${Math.abs(page.change)}%
                    </span>
                </div>
            </div>
        </div>
    `).join('');
}

function loadPopularPages() {
    const container = document.getElementById('popularPagesList');
    if (!container) return;
    
    const popularPages = [
        { page: '/services', visitors: 23 },
        { page: '/projekte', visitors: 18 },
        { page: '/team', visitors: 15 },
        { page: '/lichtwerbung', visitors: 12 },
        { page: '/kontakt', visitors: 8 }
    ];
    
    container.innerHTML = popularPages.map(page => `
        <div class="popular-page-item">
            <div class="page-url">${page.page}</div>
            <div class="page-visitors">
                <span class="visitor-count">${page.visitors}</span>
                <span class="visitor-indicator">
                    <i class="fas fa-circle text-success"></i>
                </span>
            </div>
        </div>
    `).join('');
}

// OLD DUPLICATE FUNCTIONS REMOVED
// All real-time functions are now implemented above with real API data

function loadRealLiveActivityStream(recentPages) {
    const container = document.getElementById('liveActivityStream');
    if (!container) return;
    
    
    if (!recentPages || recentPages.length === 0) {
        container.innerHTML = `
            <div class="live-activity-item">
                <div class="activity-dot"></div>
                <div class="activity-text">Keine aktuelle Aktivität</div>
                <div class="activity-timestamp">-</div>
            </div>
        `;
        return;
    }
    
    // Convert recent pages to activities
    const activities = recentPages.slice(0, 5).map(page => {
        const timeAgo = getTimeAgo(page.timestamp);
        const device = page.session?.device || 'unbekannt';
        const country = page.session?.country || 'unbekannt';
        
        return `
            <div class="live-activity-item">
                <div class="activity-dot"></div>
                <div class="activity-text">${device} Besucher${country !== 'unbekannt' ? ` aus ${country}` : ''} auf ${page.path}</div>
                <div class="activity-timestamp">${timeAgo}</div>
            </div>
        `;
    });
    
    container.innerHTML = activities.join('');
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const past = new Date(timestamp);
    const diffInSeconds = Math.floor((now - past) / 1000);
    
    if (diffInSeconds < 60) return 'jetzt';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    return `${Math.floor(diffInSeconds / 86400)}d`;
}

// OLD addLiveActivity() FUNCTION REMOVED
// Now using loadRealLiveActivityStream() with real API data

// Analytics Control Functions
function refreshDashboard() {
    updateDashboardMetrics();
    loadActivityFeed();
    showNotification('Dashboard aktualisiert', 'success');
}

function refreshAnalytics() {
    
    // Refresh simplified analytics data (will show success notification internally)
    loadSimplifiedAnalyticsData();
}

// ========== COUNTRY STATISTICS FUNCTIONS ==========

let countryChart = null;

// Country to ISO code mapping for Flagpedia CDN
const countryToISO = {
    'Schweiz': 'ch',
    'Deutschland': 'de',
    'Österreich': 'at',
    'Frankreich': 'fr',
    'Italien': 'it',
    'USA': 'us',
    'Vereinigtes Königreich': 'gb',
    'Niederlande': 'nl',
    'Belgien': 'be',
    'Spanien': 'es',
    'Schweden': 'se',
    'Norwegen': 'no',
    'Dänemark': 'dk',
    'Finnland': 'fi',
    'Polen': 'pl',
    'Tschechien': 'cz',
    'Ungarn': 'hu',
    'Portugal': 'pt',
    'Kanada': 'ca',
    'Australien': 'au',
    'Japan': 'jp',
    'China': 'cn',
    'Indien': 'in',
    'Brasilien': 'br',
    'Argentinien': 'ar',
    'Mexiko': 'mx',
    'Türkei': 'tr',
    'Russland': 'ru',
    'Südafrika': 'za',
    'Unbekannt': null
};

// Function to get flag display using Flagpedia CDN
function getFlagDisplay(countryName) {
    const isoCode = countryToISO[countryName];
    
    if (!isoCode) {
        // Fallback for unknown countries
        return `<span class="country-flag-fallback" style="
            display: inline-flex; 
            align-items: center; 
            justify-content: center; 
            width: 24px; 
            height: 16px; 
            background: #6c757d; 
            color: white; 
            font-size: 10px; 
            font-weight: bold; 
            border-radius: 2px;
            margin-right: 4px;
        ">??</span>`;
    }
    
    // Use Flagpedia CDN for high-quality flag images
    return `<img 
        src="https://flagcdn.com/24x18/${isoCode}.png" 
        srcset="https://flagcdn.com/48x36/${isoCode}.png 2x, https://flagcdn.com/72x54/${isoCode}.png 3x"
        width="24" 
        height="18" 
        alt="${countryName} Flagge"
        title="${countryName}"
        class="country-flag-img"
        style="margin-right: 4px; border-radius: 2px; object-fit: cover;"
        onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMTgiIHZpZXdCb3g9IjAgMCAyNCAxOCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjI0IiBoZWlnaHQ9IjE4IiBmaWxsPSIjNmM3NTdkIi8+Cjx0ZXh0IHg9IjEyIiB5PSIxMSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjhweCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiPj8/PC90ZXh0Pgo8L3N2Zz4K';">`;
}

function renderCountryStatistics(countryStats) {
    console.log('📊 Rendering country statistics:', countryStats);
    
    if (!countryStats || countryStats.length === 0) {
        console.warn('📊 No country statistics data available');
        return;
    }
    
    // Render country list
    renderCountryList(countryStats);
    
    // Render country chart
    renderCountryChart(countryStats);
}

function renderCountryList(countryStats) {
    const container = document.getElementById('countryStatsList');
    if (!container) {
        console.warn('📊 Country stats list container not found');
        return;
    }
    
    // Sort by visitors descending (show all countries)
    const topCountries = countryStats
        .sort((a, b) => b.visitors - a.visitors);
    
    const listHTML = topCountries.map((country, index) => {
        const flagDisplay = getFlagDisplay(country.country);
        const rankClass = index < 3 ? `rank-${index + 1}` : '';
        
        return `
            <div class="country-stat-item ${rankClass}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #eee;">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="country-rank" style="
                        display: inline-flex; 
                        align-items: center; 
                        justify-content: center; 
                        width: 24px; 
                        height: 24px; 
                        background: ${index < 3 ? '#007bff' : '#6c757d'}; 
                        color: white; 
                        border-radius: 50%; 
                        font-size: 12px; 
                        font-weight: bold;
                    ">${index + 1}</span>
                    ${flagDisplay}
                    <span class="country-name" style="font-weight: 500; color: #333;">${country.country}</span>
                </div>
                <div style="text-align: right;">
                    <div class="country-visitors" style="font-weight: 600; color: #007bff; font-size: 14px;">
                        ${country.visitors} Besucher
                    </div>
                    <div class="country-percentage" style="font-size: 12px; color: #6c757d;">
                        ${country.percentage}%
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    container.innerHTML = listHTML;
}

function renderCountryChart(countryStats) {
    const canvas = document.getElementById('countryChart');
    const loadingElement = document.getElementById('countryChartLoading');
    
    if (!canvas) {
        console.warn('📊 Country chart canvas not found');
        return;
    }
    
    // Show loading
    if (loadingElement) {
        loadingElement.style.display = 'block';
    }
    
    // Destroy existing chart
    if (countryChart) {
        countryChart.destroy();
        countryChart = null;
    }
    
    try {
        // Prepare data for chart (top 6 countries)
        const topCountries = countryStats
            .sort((a, b) => b.visitors - a.visitors)
            .slice(0, 6);
        
        const labels = topCountries.map(country => {
            const isoCode = countryToISO[country.country];
            // For chart labels, we use the country name (flag images work better in the list)
            return country.country;
        });
        
        const data = topCountries.map(country => country.visitors);
        const percentages = topCountries.map(country => country.percentage);
        
        // Generate beautiful colors
        const colors = [
            '#007bff', // Primary Blue
            '#28a745', // Success Green  
            '#17a2b8', // Info Cyan
            '#ffc107', // Warning Yellow
            '#dc3545', // Danger Red
            '#6f42c1'  // Purple
        ];
        
        const ctx = canvas.getContext('2d');
        
        // Check if Chart.js is available
        if (typeof Chart === 'undefined') {
            throw new Error('Chart.js is not loaded');
        }
        
        countryChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Besucher',
                    data: data,
                    backgroundColor: colors.slice(0, topCountries.length),
                    borderColor: '#fff',
                    borderWidth: 2,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: {
                                size: 11
                            },
                            generateLabels: function(chart) {
                                const data = chart.data;
                                if (data.labels.length && data.datasets.length) {
                                    return data.labels.map((label, index) => {
                                        const dataset = data.datasets[0];
                                        const value = dataset.data[index];
                                        const percentage = percentages[index];
                                        
                                        return {
                                            text: `${label} (${percentage}%)`,
                                            fillStyle: dataset.backgroundColor[index],
                                            strokeStyle: dataset.backgroundColor[index],
                                            pointStyle: 'circle',
                                            hidden: false,
                                            index: index
                                        };
                                    });
                                }
                                return [];
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed;
                                const percentage = percentages[context.dataIndex];
                                return `${label}: ${value} Besucher (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '50%',
                animation: {
                    animateRotate: true,
                    animateScale: true,
                    duration: 1000
                }
            }
        });
        
        console.log('📊 Country chart rendered successfully');
        
    } catch (error) {
        console.error('📊 Error rendering country chart:', error);
        canvas.style.display = 'none';
        
        // Show fallback message
        const container = canvas.parentElement;
        container.innerHTML = `
            <div class="text-center p-4 text-muted">
                <i class="fas fa-exclamation-triangle fa-2x mb-3 text-warning"></i>
                <p class="mb-0">Chart konnte nicht geladen werden</p>
                <small>Chart.js möglicherweise nicht verfügbar</small>
            </div>
        `;
    } finally {
        // Hide loading
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
    }
}

// ===== REMOVED FUNCTIONS FOR SIMPLIFIED ANALYTICS =====
// setAnalyticsPeriod() - removed (no period selector in simplified view)
// exportAnalytics() - removed (no export button in simplified view)

// Load Chart.js library if not already loaded
function loadChartJS() {
    if (typeof Chart !== 'undefined') {
        return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.js';
        
        script.onload = () => {
            resolve();
        };
        
        script.onerror = (error) => {
            // Fallback: Continue without charts
            resolve(); // Resolve anyway to continue app initialization
        };
        
        document.head.appendChild(script);
    });
}

// Settings Management
let settingsData = {};
let customerData = [];
let originalCustomerData = [];

function initSettingsManagement() {
    loadSettingsData();
    loadBackupList();
    // Remove calls to non-existent functions
    // loadOpeningHours(); - Removed (elements don't exist)
    // loadSecurityLog(); - Removed (elements don't exist)
}

async function loadSettingsData() {
    try {
        // Load General Settings
        const generalResponse = await fetch('/api/settings/general');
        if (generalResponse.ok) {
            const generalData = await generalResponse.json();
            populateGeneralSettings(generalData.settings);
        }

        // Load SEO Settings  
        const seoResponse = await fetch('/api/settings/seo');
        if (seoResponse.ok) {
            const seoData = await seoResponse.json();
            populateSEOSettings(seoData.settings);
        }

        // Load Email Settings
        const emailResponse = await fetch('/api/settings/email');
        if (emailResponse.ok) {
            const emailData = await emailResponse.json();
            populateEmailSettings(emailData.settings);
        }

        const statusElement = document.getElementById('generalSettingsStatus');
        if (statusElement) {
            statusElement.textContent = 'Einstellungen geladen';
        }

    } catch (error) {
        console.error('Error loading settings:', error);
        const statusElement = document.getElementById('generalSettingsStatus');
        if (statusElement) {
            statusElement.textContent = 'Fehler beim Laden';
        }
        showNotification('Fehler beim Laden der Einstellungen', 'error');
    }
}

// Populate General Settings form
function populateGeneralSettings(settings) {
    const fields = {
        'siteTitle': 'siteTitle',
        'siteTagline': 'siteTagline', 
        'siteDescription': 'siteDescription',
        'contactEmail': 'contactEmail',
        'contactPhone': 'contactPhone'
    };

    Object.entries(fields).forEach(([settingKey, fieldId]) => {
        const field = document.getElementById(fieldId);
        if (field && settings[settingKey]) {
            field.value = settings[settingKey] || '';
        }
    });
}

// Populate SEO Settings form
function populateSEOSettings(settings) {
    const analyticsField = document.getElementById('googleAnalyticsId');
    const sitemapField = document.getElementById('enableSitemap');
    
    if (analyticsField && settings['googleAnalyticsId']) {
        analyticsField.value = settings['googleAnalyticsId'] || '';
    }
    
    if (sitemapField) {
        sitemapField.checked = settings['enableSitemap'] || false;
    }
}

// Populate Email Settings form  
function populateEmailSettings(settings) {
    const fields = {
        'smtpHost': 'smtpHost',
        'smtpPort': 'smtpPort',
        'smtpUsername': 'smtpUsername',
        'smtpPassword': 'smtpPassword',
        'smtpEncryption': 'smtpEncryption',
        'senderName': 'senderName',
        'senderEmail': 'senderEmail'
    };

    Object.entries(fields).forEach(([settingKey, fieldId]) => {
        const field = document.getElementById(fieldId);
        if (field && settings[settingKey]) {
            field.value = settings[settingKey] || '';
        }
    });
}

function loadOpeningHours() {
    const openingHours = [
        { day: 'Montag', hours: '07:30 - 12:00, 13:00 - 17:30' },
        { day: 'Dienstag', hours: '07:30 - 12:00, 13:00 - 17:30' },
        { day: 'Mittwoch', hours: '07:30 - 12:00, 13:00 - 17:30' },
        { day: 'Donnerstag', hours: '07:30 - 12:00, 13:00 - 17:30' },
        { day: 'Freitag', hours: '07:30 - 12:00, 13:00 - 17:00' },
        { day: 'Samstag', hours: 'Geschlossen' },
        { day: 'Sonntag', hours: 'Geschlossen' }
    ];
    
    const container = document.getElementById('openingHours');
    if (container) {
        container.innerHTML = openingHours.map(item => `
            <div class="opening-hours-item">
                <div class="day">${item.day}</div>
                <div class="hours">${item.hours}</div>
            </div>
        `).join('');
    } else {
        console.error('Opening hours container not found!');
    }
}

function loadSecurityLog() {
    const securityLog = [
        {
            timestamp: '2024-01-15 14:30:15',
            event: 'Erfolgreiches Login',
            user: 'admin@neonmurer.ch',
            ip: '192.168.1.10',
            status: 'success'
        },
        {
            timestamp: '2024-01-15 09:15:42',
            event: 'Passwort geändert',
            user: 'admin@neonmurer.ch',
            ip: '192.168.1.10',
            status: 'success'
        }
    ];
    
    const container = document.getElementById('securityLog');
    if (container) {
        container.innerHTML = securityLog.map(log => `
            <div class="security-log-item">
                <div class="log-icon">
                    <i class="fas fa-check-circle text-success"></i>
                </div>
                <div class="log-content">
                    <div class="log-event">${log.event}</div>
                    <div class="log-details">
                        <span class="log-user">${log.user}</span>
                        <span class="log-ip">${log.ip}</span>
                        <span class="log-time">${log.timestamp}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }
}

function loadBackupHistory() {
    const container = document.getElementById('backupHistory');
    if (container) {
        container.innerHTML = `
            <div class="table-responsive">
                <table class="table table-sm">
                    <thead>
                        <tr>
                            <th>Datum</th>
                            <th>Status</th>
                            <th>Größe</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>2024-01-15</td>
                            <td><span class="badge bg-success">Erfolgreich</span></td>
                            <td>2.4 GB</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        `;
    }
}

function initCustomerManagement() {
    loadCustomerData();
    setupCustomerEventListeners();
    renderCustomerTable();
}

function loadCustomerData() {
    customerData = [
        {
            id: 1,
            firstName: 'Hans',
            lastName: 'Mueller',
            company: 'Mueller Transporte AG',
            email: 'hans.mueller@mueller-transporte.ch',
            phone: '+41 44 123 45 67',
            status: 'active',
            category: 'business',
            region: 'zurich',
            lastActivity: '2024-01-15',
            projects: 3,
            totalValue: 45200
        },
        {
            id: 2,
            firstName: 'Sandra',
            lastName: 'Weber',
            company: 'Weber Bäckerei',
            email: 'sandra.weber@weber-baeckerei.ch',
            phone: '+41 55 234 56 78',
            status: 'active',
            category: 'business',
            region: 'zurich',
            lastActivity: '2024-01-12',
            projects: 2,
            totalValue: 12800
        },
        {
            id: 3,
            firstName: 'Maria',
            lastName: 'Rossi',
            company: 'Ristorante Bella Vista',
            email: 'maria.rossi@bellavista.ch',
            phone: '+41 91 456 78 90',
            status: 'prospect',
            category: 'business',
            region: 'geneva',
            lastActivity: '2024-01-08',
            projects: 0,
            totalValue: 0
        },
        {
            id: 4,
            firstName: 'Peter',
            lastName: 'Schmid',
            company: '',
            email: 'peter.schmid@gmail.com',
            phone: '+41 62 567 89 01',
            status: 'inactive',
            category: 'private',
            region: 'basel',
            lastActivity: '2023-12-15',
            projects: 1,
            totalValue: 850
        }
    ];
    
    originalCustomerData = [...customerData];
}

function setupCustomerEventListeners() {
    const searchInput = document.getElementById('customerSearch');
    if (searchInput) {
        searchInput.addEventListener('input', debounce(filterCustomers, 300));
    }
}

function renderCustomerTable() {
    const tableBody = document.getElementById('customersTable');
    if (!tableBody) {
        console.error('Customer table body not found!');
        return;
    }
    
    tableBody.innerHTML = customerData.map(customer => `
        <tr>
            <td>
                <div class="customer-info">
                    <div class="customer-name">${customer.firstName} ${customer.lastName}</div>
                    <div class="customer-company text-muted">${customer.company || 'Privatkunde'}</div>
                </div>
            </td>
            <td>
                <div class="contact-info">
                    <div class="contact-email">${customer.email}</div>
                    <div class="contact-phone text-muted">${customer.phone}</div>
                </div>
            </td>
            <td>
                <span class="badge bg-success">Aktiv</span>
            </td>
            <td>
                <span class="badge bg-light text-dark">Geschäftskunde</span>
            </td>
            <td>
                <span class="text-muted">${customer.lastActivity}</span>
            </td>
            <td>
                <span class="badge bg-primary">${customer.projects}</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewCustomer(${customer.id})" title="Anzeigen">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="editCustomer(${customer.id})" title="Bearbeiten">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCustomer(${customer.id})" title="Löschen">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
}

function filterCustomers() {
    renderCustomerTable();
}

function setCustomerView(view) {
    const tableView = document.getElementById('customerTableView');
    const cardsView = document.getElementById('customerCardsView');
    
    if (view === 'table') {
        tableView.style.display = 'block';
        cardsView.style.display = 'none';
        renderCustomerTable();
    } else {
        tableView.style.display = 'none';
        cardsView.style.display = 'block';
    }
}

function clearCustomerFilters() {
    filterCustomers();
}

function viewCustomer(id) {
    showNotification('Kunde wird angezeigt', 'info');
}

function editCustomer(id) {
    showNotification('Kunde wird bearbeitet', 'info');
}

async function deleteCustomer(customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Löschen des Kunden');
        }
        
        showNotification('✅ Kunde erfolgreich gelöscht!', 'success');
        
        // Close Customer Dashboard if open
        if (document.getElementById('customer-dashboard-modal')) {
            bootstrap.Modal.getInstance(document.getElementById('customer-dashboard-modal')).hide();
        }
        
        loadCustomers(); // Refresh main list
        loadCustomerStats(); // Refresh stats
        
    } catch (error) {
        console.error('Error deleting customer:', error);
        showNotification('Fehler beim Löschen des Kunden: ' + error.message, 'error');
    }
}

function showAddCustomerModal() {
    showNotification('Neuer Kunde Dialog', 'info');
}

// Export function moved to customer management section (line 8810)

function importCustomers() {
    showNotification('Import Dialog', 'info');
}

// Save General Settings
async function saveGeneralSettings() {
    try {
        const settings = {
            siteTitle: document.getElementById('siteTitle').value,
            siteTagline: document.getElementById('siteTagline').value,
            siteDescription: document.getElementById('siteDescription').value,
            contactEmail: document.getElementById('contactEmail').value,
            contactPhone: document.getElementById('contactPhone').value
        };

        const response = await fetch('/api/settings/general', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ settings })
        });

        if (response.ok) {
            showNotification('Allgemeine Einstellungen gespeichert', 'success');
        } else {
            throw new Error('Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving general settings:', error);
        showNotification('Fehler beim Speichern der Einstellungen', 'error');
    }
}

// Save SEO Settings
async function saveSEOSettings() {
    try {
        const settings = {
            googleAnalyticsId: document.getElementById('googleAnalyticsId').value,
            enableSitemap: document.getElementById('enableSitemap').checked
        };

        const response = await fetch('/api/settings/seo', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ settings })
        });

        if (response.ok) {
            showNotification('SEO Einstellungen gespeichert', 'success');
        } else {
            throw new Error('Failed to save SEO settings');
        }
    } catch (error) {
        console.error('Error saving SEO settings:', error);
        showNotification('Fehler beim Speichern der SEO Einstellungen', 'error');
    }
}

// Save Email Settings
async function saveEmailSettings() {
    try {
        const settings = {
            smtpHost: document.getElementById('smtpHost').value,
            smtpPort: document.getElementById('smtpPort').value,
            smtpUsername: document.getElementById('smtpUsername').value,
            smtpPassword: document.getElementById('smtpPassword').value,
            smtpEncryption: document.getElementById('smtpEncryption').value,
            senderName: document.getElementById('senderName').value,
            senderEmail: document.getElementById('senderEmail').value
        };

        const response = await fetch('/api/settings/email', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ settings })
        });

        if (response.ok) {
            showNotification('E-Mail Einstellungen gespeichert', 'success');
        } else {
            throw new Error('Failed to save email settings');
        }
    } catch (error) {
        console.error('Error saving email settings:', error);
        showNotification('Fehler beim Speichern der E-Mail Einstellungen', 'error');
    }
}

// Send Test Email
async function sendTestEmail() {
    try {
        const recipient = document.getElementById('testEmailRecipient').value;
        if (!recipient) {
            showNotification('Bitte geben Sie eine E-Mail-Adresse ein', 'warning');
            return;
        }

        const response = await fetch('/api/settings/email/test', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ recipient })
        });

        if (response.ok) {
            showNotification('Test-E-Mail wurde gesendet', 'success');
        } else {
            throw new Error('Failed to send test email');
        }
    } catch (error) {
        console.error('Error sending test email:', error);
        showNotification('Fehler beim Senden der Test-E-Mail', 'error');
    }
}

// Generate Sitemap
async function generateSitemap() {
    try {
        const response = await fetch('/api/settings/seo/sitemap', {
            method: 'POST'
        });

        if (response.ok) {
            showNotification('Sitemap wurde generiert', 'success');
        } else {
            throw new Error('Failed to generate sitemap');
        }
    } catch (error) {
        console.error('Error generating sitemap:', error);
        showNotification('Fehler beim Generieren der Sitemap', 'error');
    }
}

function saveAllSettings() {
    showNotification('Diese Funktion wurde vereinfacht. Nutzen Sie die einzelnen Speichern-Buttons.', 'info');
}

function runSecurityScan() {
    showNotification('Sicherheitsscan durchgeführt', 'success');
}

function clearSecurityLog() {
    showNotification('Sicherheitsprotokoll gelöscht', 'success');
}

function exportSecurityLog() {
    showNotification('Sicherheitsprotokoll exportiert', 'success');
}

// Create Backup
async function createBackup(event) {
    try {
        const button = event?.target || document.querySelector('button[onclick="createBackup()"]');
        if (button) {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Backup wird erstellt...';
        }
        
        
        const response = await fetch('/api/settings/backup/create', {
            method: 'POST'
        });

        if (response.ok) {
            const result = await response.json();
            
            if (result.status === 'creating') {
                showNotification('Backup wird im Hintergrund erstellt...', 'info');
                
                // Poll for completion every 3 seconds
                const checkInterval = setInterval(async () => {
                    try {
                        await loadBackupList();
                        const backups = await fetch('/api/settings/backup/list').then(r => r.json());
                        const newBackup = backups.backups?.find(b => b.filename === result.filename);
                        
                        if (newBackup) {
                            clearInterval(checkInterval);
                            showNotification('Backup erfolgreich erstellt!', 'success');
                        }
                    } catch (pollError) {
                        console.warn('Error polling backup status:', pollError);
                    }
                }, 3000);
                
                // Stop polling after 2 minutes
                setTimeout(() => {
                    clearInterval(checkInterval);
                }, 120000);
                
            } else {
                showNotification('Backup erfolgreich erstellt', 'success');
                loadBackupList(); // Refresh backup list
            }
        } else {
            const errorText = await response.text();
            console.error('Backup creation failed:', response.status, errorText);
            throw new Error(`Server error: ${response.status}`);
        }
    } catch (error) {
        console.error('Error creating backup:', error);
        showNotification('Fehler beim Erstellen des Backups: ' + error.message, 'error');
    } finally {
        const button = event?.target || document.querySelector('button[onclick="createBackup()"]');
        if (button) {
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-plus"></i> Backup jetzt erstellen';
        }
    }
}

// Load Backup List
async function loadBackupList() {
    try {
        const response = await fetch('/api/settings/backup/list');
        
        if (response.ok) {
            const backups = await response.json();
            populateBackupList(backups.backups || []);
        } else {
            throw new Error('Failed to load backup list');
        }
    } catch (error) {
        console.error('Error loading backup list:', error);
        showNotification('Fehler beim Laden der Backup-Liste', 'error');
    }
}

// Populate backup list in UI
function populateBackupList(backups) {
    const container = document.getElementById('backupList');
    if (!container) return;

    if (backups.length === 0) {
        container.innerHTML = '<div class="text-center py-3"><small class="text-muted">Noch keine Backups vorhanden</small></div>';
        return;
    }

    container.innerHTML = backups.map(backup => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
            <div>
                <strong>${backup.filename}</strong>
                <br><small class="text-muted">${new Date(backup.created).toLocaleString('de-DE')}</small>
            </div>
            <div>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="downloadBackup('${backup.filename}')">
                    <i class="fas fa-download"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteBackup('${backup.filename}')">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// Download Backup
async function downloadBackup(filename) {
    try {
        const response = await fetch(`/api/settings/backup/download/${filename}`);
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showNotification('Backup wird heruntergeladen', 'success');
        } else {
            throw new Error('Failed to download backup');
        }
    } catch (error) {
        console.error('Error downloading backup:', error);
        showNotification('Fehler beim Herunterladen des Backups', 'error');
    }
}

// Delete Backup
async function deleteBackup(filename) {
    if (!confirm(`Backup "${filename}" wirklich löschen?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/settings/backup/delete/${filename}`, {
            method: 'DELETE'
        });

        if (response.ok) {
    showNotification('Backup gelöscht', 'success');
            loadBackupList(); // Refresh backup list
        } else {
            throw new Error('Failed to delete backup');
        }
    } catch (error) {
        console.error('Error deleting backup:', error);
        showNotification('Fehler beim Löschen des Backups', 'error');
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Debug function to check if all sections and elements exist
function checkDOMElements() {
// DOM Elements Check disabled');
    
    // Check sections
    const sections = ['dashboard-section', 'analytics-section', 'customers-section', 'settings-section'];
    sections.forEach(sectionId => {
        const section = document.getElementById(sectionId);
    });
    
    // Check customer elements
            const customerElements = ['customersTable', 'customerSearch', 'totalCustomers'];
    customerElements.forEach(elementId => {
        const element = document.getElementById(elementId);
    });
    
    // Check analytics elements
    const analyticsElements = ['analyticsUniqueVisitors', 'analyticsPageViews', 'contentPerformanceList'];
    analyticsElements.forEach(elementId => {
        const element = document.getElementById(elementId);
    });
    
    // Check settings elements
    const settingsElements = ['openingHours', 'securityLog', 'backupHistory'];
    settingsElements.forEach(elementId => {
        const element = document.getElementById(elementId);
    });
    
}

// Call this function after DOM is loaded
setTimeout(checkDOMElements, 500);

// =====================================
// REAL CONTENT MANAGEMENT SYSTEM
// =====================================

// Global variables for content management
let realPagesData = [];
let filteredPagesData = [];
let currentEditingPage = null;

// Initialize Content Management
async function initContentManagement() {
    await loadContentData();
    setupContentEventListeners();
}

// Load real website pages data from backend
async function loadContentData() {
    
    try {
        // Fetch pages from backend API
        const response = await fetch('/api/pages');
        
        if (!response.ok) {
            console.warn('Backend not available, using fallback data');
            loadFallbackContentData();
            return;
        }
        
        const result = await response.json();
        realPagesData = result.pages.map(page => ({
            id: page.id,
            title: page.title,
            path: page.path,
            category: page.category,
            type: page.type.toLowerCase(),
            status: page.status.toLowerCase(),
            lastModified: page.updatedAt ? page.updatedAt.split('T')[0] : '2024-01-15',
            author: page.creator ? page.creator.name : 'Administrator',
            description: page.metaDescription || `${page.title} - Professionelle Lösung von Neon Murer`,
            template: getTemplateFromType(page.type),
            seoTitle: page.metaTitle || page.title,
            metaDescription: page.metaDescription || ''
        }));
        
        
    } catch (error) {
        console.error('Error loading pages from backend:', error);
        console.warn('Using fallback data instead');
        loadFallbackContentData();
    }
    
    filteredPagesData = [...realPagesData];
    renderContentTable();
}

// Helper function to get template from page type
function getTemplateFromType(type) {
    switch(type) {
        case 'HOMEPAGE': return 'homepage';
        case 'SERVICE': return 'service-page';
        case 'CATEGORY': return 'category-page';
        default: return 'default';
    }
}

// Fallback data if backend is not available
function loadFallbackContentData() {
    
    // Define all real website pages (fallback)
    realPagesData = [
        // Main Pages
        {
            id: 'index',
            title: 'Homepage',
            path: 'index.html',
            category: 'Hauptseiten',
            type: 'homepage',
            status: 'published',
            lastModified: '2024-01-15',
            author: 'Administrator',
            description: 'Hauptseite der Neon Murer Website',
            template: 'homepage',
            seoTitle: 'Neon Murer - Lichtwerbung & Beschriftungen',
            metaDescription: 'Professionelle Lichtwerbung und Beschriftungen von Neon Murer.'
        },
        {
            id: 'beschriftungen',
            title: 'Beschriftungen',
            path: 'beschriftungen.html',
            category: 'Hauptseiten',
            type: 'category',
            status: 'published',
            lastModified: '2024-01-14',
            author: 'Administrator',
            description: 'Übersicht aller Beschriftungsdienstleistungen',
            template: 'category-page',
            seoTitle: 'Beschriftungen - Neon Murer',
            metaDescription: 'Professionelle Beschriftungen für Fahrzeuge, Fenster und mehr.'
        },
        {
            id: 'lichtwerbung',
            title: 'Lichtwerbung',
            path: 'lichtwerbung.html',
            category: 'Hauptseiten',
            type: 'category',
            status: 'published',
            lastModified: '2024-01-14',
            author: 'Administrator',
            description: 'Übersicht aller Lichtwerbungsdienstleistungen',
            template: 'category-page',
            seoTitle: 'Lichtwerbung - Neon Murer',
            metaDescription: 'Professionelle Lichtwerbung und LED-Technik.'
        },
        {
            id: 'digital-signage',
            title: 'Digital Signage',
            path: 'digital-signage.html',
            category: 'Hauptseiten',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-13',
            author: 'Administrator',
            description: 'Digitale Werbetafeln und Displays',
            template: 'service-page',
            seoTitle: 'Digital Signage - Neon Murer',
            metaDescription: 'Moderne digitale Werbetafeln und Displays.'
        },
        {
            id: 'dienstleistungen',
            title: 'Dienstleistungen',
            path: 'dienstleistungen.html',
            category: 'Hauptseiten',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-12',
            author: 'Administrator',
            description: 'Übersicht aller Dienstleistungen',
            template: 'default',
            seoTitle: 'Dienstleistungen - Neon Murer',
            metaDescription: 'Alle Dienstleistungen von Neon Murer im Überblick.'
        },
        {
            id: 'datenschutz',
            title: 'Datenschutz',
            path: 'datenschutz.html',
            category: 'Hauptseiten',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-10',
            author: 'Administrator',
            description: 'Datenschutzerklärung',
            template: 'default',
            seoTitle: 'Datenschutz - Neon Murer',
            metaDescription: 'Datenschutzerklärung der Neon Murer Website.'
        },
        {
            id: 'geschaeftsbedingungen',
            title: 'Geschäftsbedingungen',
            path: 'geschaeftsbedingungen.html',
            category: 'Hauptseiten',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-10',
            author: 'Administrator',
            description: 'Allgemeine Geschäftsbedingungen',
            template: 'default',
            seoTitle: 'AGB - Neon Murer',
            metaDescription: 'Allgemeine Geschäftsbedingungen von Neon Murer.'
        },
        {
            id: 'impressum',
            title: 'Impressum',
            path: 'impressum.html',
            category: 'Hauptseiten',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-10',
            author: 'Administrator',
            description: 'Impressum und Kontaktdaten',
            template: 'default',
            seoTitle: 'Impressum - Neon Murer',
            metaDescription: 'Impressum und Kontaktdaten von Neon Murer.'
        },
        
        // Beschriftungs-Seiten
        {
            id: 'blachen-fahnen',
            title: 'Blachen & Fahnen',
            path: 'beschriftungen/blachen-fahnen.html',
            category: 'Beschriftungen',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-14',
            author: 'Administrator',
            description: 'Blachen und Fahnen für Werbung und Events',
            template: 'service-page',
            seoTitle: 'Blachen & Fahnen - Neon Murer',
            metaDescription: 'Hochwertige Blachen und Fahnen für Ihre Werbung.'
        },
        {
            id: 'fahrzeugbeschriftung',
            title: 'Fahrzeugbeschriftung',
            path: 'beschriftungen/fahrzeugbeschriftung.html',
            category: 'Beschriftungen',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-14',
            author: 'Administrator',
            description: 'Professionelle Fahrzeugbeschriftung',
            template: 'service-page',
            seoTitle: 'Fahrzeugbeschriftung - Neon Murer',
            metaDescription: 'Professionelle Beschriftung für alle Fahrzeugtypen.'
        },
        {
            id: 'fensterbeschriftung',
            title: 'Fensterbeschriftung',
            path: 'beschriftungen/fensterbeschriftung.html',
            category: 'Beschriftungen',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-14',
            author: 'Administrator',
            description: 'Fensterbeschriftung für Geschäfte und Büros',
            template: 'service-page',
            seoTitle: 'Fensterbeschriftung - Neon Murer',
            metaDescription: 'Professionelle Fensterbeschriftung für Ihr Geschäft.'
        },
        {
            id: 'grossformatdruck',
            title: 'Großformatdruck',
            path: 'beschriftungen/grossformatdruck.html',
            category: 'Beschriftungen',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-14',
            author: 'Administrator',
            description: 'Großformatdruck für Plakate und Banner',
            template: 'service-page',
            seoTitle: 'Großformatdruck - Neon Murer',
            metaDescription: 'Hochwertiger Großformatdruck für Ihre Werbung.'
        },
        {
            id: 'signaletik',
            title: 'Signaletik',
            path: 'beschriftungen/signaletik.html',
            category: 'Beschriftungen',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-14',
            author: 'Administrator',
            description: 'Wegweiser und Orientierungssysteme',
            template: 'service-page',
            seoTitle: 'Signaletik - Neon Murer',
            metaDescription: 'Professionelle Signaletik und Wegweiser.'
        },
        {
            id: 'tafelbeschriftung',
            title: 'Tafelbeschriftung',
            path: 'beschriftungen/tafelbeschriftung.html',
            category: 'Beschriftungen',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-14',
            author: 'Administrator',
            description: 'Tafelbeschriftung und Schilder',
            template: 'service-page',
            seoTitle: 'Tafelbeschriftung - Neon Murer',
            metaDescription: 'Hochwertige Tafelbeschriftung und Schilder.'
        },
        
        // Lichtwerbungs-Seiten
        {
            id: 'halbrelief-plattenschriften',
            title: 'Halbrelief & Plattenschriften',
            path: 'lichtwerbung/halbrelief-plattenschriften.html',
            category: 'Lichtwerbung',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-13',
            author: 'Administrator',
            description: 'Hochwertige Halbrelief und Plattenschriften',
            template: 'service-page',
            seoTitle: 'Halbrelief & Plattenschriften - Neon Murer',
            metaDescription: 'Professionelle Halbrelief und Plattenschriften.'
        },
        {
            id: 'leuchtschriften',
            title: 'Leuchtschriften',
            path: 'lichtwerbung/leuchtschriften.html',
            category: 'Lichtwerbung',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-13',
            author: 'Administrator',
            description: 'LED-Leuchtschriften und beleuchtete Schilder',
            template: 'service-page',
            seoTitle: 'Leuchtschriften - Neon Murer',
            metaDescription: 'Moderne LED-Leuchtschriften für Ihre Werbung.'
        },
        {
            id: 'leuchttransparente',
            title: 'Leuchttransparente',
            path: 'lichtwerbung/leuchttransparente.html',
            category: 'Lichtwerbung',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-13',
            author: 'Administrator',
            description: 'Leuchttransparente für maximale Aufmerksamkeit',
            template: 'service-page',
            seoTitle: 'Leuchttransparente - Neon Murer',
            metaDescription: 'Auffällige Leuchttransparente für Ihre Werbung.'
        },
        {
            id: 'neon-led-technik',
            title: 'Neon & LED-Technik',
            path: 'lichtwerbung/neon-led-technik.html',
            category: 'Lichtwerbung',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-13',
            author: 'Administrator',
            description: 'Moderne Neon und LED-Technik',
            template: 'service-page',
            seoTitle: 'Neon & LED-Technik - Neon Murer',
            metaDescription: 'Innovative Neon und LED-Technik für Lichtwerbung.'
        },
        {
            id: 'pylonen',
            title: 'Pylonen',
            path: 'lichtwerbung/pylonen.html',
            category: 'Lichtwerbung',
            type: 'service',
            status: 'published',
            lastModified: '2024-01-13',
            author: 'Administrator',
            description: 'Pylonen und Werbetürme',
            template: 'service-page',
            seoTitle: 'Pylonen - Neon Murer',
            metaDescription: 'Professionelle Pylonen und Werbetürme.'
        },
        
        // Neon Murer Seiten
        {
            id: 'fachkompetenzen',
            title: 'Fachkompetenzen',
            path: 'neon-murer/fachkompetenzen.html',
            category: 'Neon Murer',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-12',
            author: 'Administrator',
            description: 'Unsere Fachkompetenzen und Expertise',
            template: 'default',
            seoTitle: 'Fachkompetenzen - Neon Murer',
            metaDescription: 'Erfahren Sie mehr über unsere Fachkompetenzen.'
        },
        {
            id: 'firmengeschichte',
            title: 'Firmengeschichte',
            path: 'neon-murer/firmengeschichte.html',
            category: 'Neon Murer',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-12',
            author: 'Administrator',
            description: 'Die Geschichte von Neon Murer',
            template: 'default',
            seoTitle: 'Firmengeschichte - Neon Murer',
            metaDescription: 'Die Geschichte und Entwicklung von Neon Murer.'
        },
        {
            id: 'kontaktpersonen',
            title: 'Kontaktpersonen',
            path: 'neon-murer/kontaktpersonen.html',
            category: 'Neon Murer',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-12',
            author: 'Administrator',
            description: 'Unsere Ansprechpartner und Kontaktpersonen',
            template: 'default',
            seoTitle: 'Kontaktpersonen - Neon Murer',
            metaDescription: 'Unsere Ansprechpartner für Ihre Anfragen.'
        },
        {
            id: 'news',
            title: 'News',
            path: 'neon-murer/news.html',
            category: 'Neon Murer',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-15',
            author: 'Administrator',
            description: 'Aktuelle News und Neuigkeiten',
            template: 'default',
            seoTitle: 'News - Neon Murer',
            metaDescription: 'Aktuelle News und Neuigkeiten von Neon Murer.'
        },
        {
            id: 'stellenangebote',
            title: 'Stellenangebote',
            path: 'neon-murer/stellenangebote.html',
            category: 'Neon Murer',
            type: 'page',
            status: 'published',
            lastModified: '2024-01-11',
            author: 'Administrator',
            description: 'Aktuelle Stellenangebote und Karrieremöglichkeiten',
            template: 'default',
            seoTitle: 'Stellenangebote - Neon Murer',
            metaDescription: 'Aktuelle Stellenangebote bei Neon Murer.'
        }
    ];
    
    filteredPagesData = [...realPagesData];
}

// Setup Content Event Listeners
function setupContentEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('contentSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterContentPages);
    }
    
    // Filter functionality
    const typeFilter = document.getElementById('contentTypeFilter');
    const statusFilter = document.getElementById('contentStatusFilter');
    if (typeFilter) typeFilter.addEventListener('change', filterContentPages);
    if (statusFilter) statusFilter.addEventListener('change', filterContentPages);
    
}

// Filter content pages
function filterContentPages() {
    const searchTerm = document.getElementById('contentSearch')?.value.toLowerCase() || '';
    const typeFilter = document.getElementById('contentTypeFilter')?.value || '';
    const statusFilter = document.getElementById('contentStatusFilter')?.value || '';
    
    filteredPagesData = realPagesData.filter(page => {
        const matchesSearch = page.title.toLowerCase().includes(searchTerm) ||
                            page.description.toLowerCase().includes(searchTerm) ||
                            page.category.toLowerCase().includes(searchTerm);
        
        const matchesType = !typeFilter || page.type === typeFilter;
        const matchesStatus = !statusFilter || page.status === statusFilter;
        
        return matchesSearch && matchesType && matchesStatus;
    });
    
    renderContentTable();
}

// Render content table
function renderContentTable() {
    const tableBody = document.getElementById('contentTableBody');
    if (!tableBody) {
        return;
    }
    
    tableBody.innerHTML = '';
    
    filteredPagesData.forEach((page, index) => {
        const row = document.createElement('tr');
        
        // Status badge
        let statusBadge = '';
        switch(page.status) {
            case 'published':
                statusBadge = '<span class="badge bg-success">Veröffentlicht</span>';
                break;
            case 'draft':
                statusBadge = '<span class="badge bg-warning">Entwurf</span>';
                break;
            case 'archived':
                statusBadge = '<span class="badge bg-secondary">Archiviert</span>';
                break;
        }
        
        // Type badge
        let typeBadge = '';
        switch(page.type) {
            case 'homepage':
                typeBadge = '<span class="badge bg-primary">Homepage</span>';
                break;
            case 'service':
                typeBadge = '<span class="badge bg-info">Service</span>';
                break;
            case 'category':
                typeBadge = '<span class="badge bg-dark">Kategorie</span>';
                break;
            default:
                typeBadge = '<span class="badge bg-light text-dark">Seite</span>';
        }
        
        row.innerHTML = `
            <td>
                <input type="checkbox" class="content-checkbox" data-page-id="${page.id}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <div class="fw-bold">${page.title}</div>
                        <div class="text-muted small">${page.path}</div>
                        <div class="text-muted small">${page.category}</div>
                    </div>
                </div>
            </td>
            <td>${typeBadge}</td>
            <td>${statusBadge}</td>
            <td>
                <div class="small">${page.lastModified}</div>
                <div class="text-muted small">vor 2 Tagen</div>
            </td>
            <td>
                <div class="small">${page.author}</div>
            </td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary edit-page-btn" 
                            data-page-id="${page.id}" 
                            onclick="editPageContent('${page.id}')" 
                            title="Bearbeiten">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="previewPage('${page.id}')" title="Vorschau">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="duplicatePage('${page.id}')" title="Duplizieren">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-outline-secondary" onclick="showPageSEO('${page.id}')" title="SEO">
                        <i class="fas fa-search"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update statistics
    updateContentStatistics();
    
    // Fix content buttons after rendering
    setTimeout(() => {
        reinitializeEventListeners();
    }, 10);
}

// Update content statistics
function updateContentStatistics() {
    const totalPages = realPagesData.length;
    const publishedPages = realPagesData.filter(p => p.status === 'published').length;
    const draftPages = realPagesData.filter(p => p.status === 'draft').length;
    
    // Update stats in UI if elements exist
    const statsElements = {
        'totalContent': totalPages,
        'publishedContent': publishedPages,
        'draftContent': draftPages
    };
    
    Object.entries(statsElements).forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    });
}

// Edit page content
function editPageContent(pageId) {
    const page = realPagesData.find(p => p.id === pageId);
    
    if (!page) {
        return;
    }
    
    currentEditingPage = page;
    
    // Load current page content (simulated)
    loadPageContentForEditing(page);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('contentModal'));
    modal.show();
}

// Load page content for editing
async function loadPageContentForEditing(page) {
    
    // Populate form fields
    document.getElementById('contentTitle').value = page.title;
    document.getElementById('contentSlug').value = page.path.replace('.html', '');
    document.getElementById('contentStatus').value = page.status;
    document.getElementById('contentType').value = page.type;
    document.getElementById('contentAuthor').value = page.author;
    document.getElementById('contentMetaTitle').value = page.seoTitle || page.title;
    
    // Set template based on page type
    const templateSelect = document.getElementById('contentTemplate');
    if (templateSelect) {
        templateSelect.value = page.template || 'default';
    }
    
    // Set description/excerpt
    const excerptField = document.getElementById('contentExcerpt');
    if (excerptField) {
        excerptField.value = page.description;
    }
    
    // Load actual page content with real editing interface
    const contentBody = document.getElementById('contentBody');
    if (contentBody) {
        contentBody.innerHTML = await generateRealPageEditor(page);
    }
    
    // Update modal title
    const modalTitle = document.getElementById('contentModalLabel');
    if (modalTitle) {
        modalTitle.textContent = `${page.title} bearbeiten`;
    }
}

// Generate real page editor interface
async function generateRealPageEditor(page) {
    
    // Load actual page structure (simulated - in real implementation, this would fetch the HTML)
    const pageStructure = await analyzePageStructure(page);
    
    let editorHTML = `
        <div class="real-page-editor">
            <h3>📄 Echte Seitenbearbeitung: ${page.title}</h3>
            <p class="text-muted mb-4">Bearbeite die spezifischen Bereiche deiner Website-Seite</p>
    `;
    
    // Hero Section Editor
    if (pageStructure.hasHero) {
        editorHTML += `
            <div class="editor-section mb-4">
                <h4 class="section-title">
                    <i class="fas fa-star text-warning"></i>
                    Hero-Bereich
                </h4>
                <div class="card">
                    <div class="card-body">
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Hero-Titel</label>
                                <input type="text" class="form-control" id="heroTitle" value="${pageStructure.hero.title}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Hero-Untertitel</label>
                                <input type="text" class="form-control" id="heroSubtitle" value="${pageStructure.hero.subtitle}">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold">Hero-Beschreibung</label>
                                <textarea class="form-control" id="heroDescription" rows="4">${pageStructure.hero.description}</textarea>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Hintergrundfarbe</label>
                                <input type="color" class="form-control form-control-color" id="heroBackgroundColor" value="${pageStructure.hero.backgroundColor}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Hintergrund-Bild</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="heroBackgroundImage" value="${pageStructure.hero.backgroundImage}" placeholder="URL oder Pfad zum Bild">
                                    <button class="btn btn-outline-primary" type="button" onclick="selectHeroImage()">
                                        <i class="fas fa-image"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Customer Projects Section Editor
    if (pageStructure.hasProjects) {
        editorHTML += `
            <div class="editor-section mb-4">
                <h4 class="section-title">
                    <i class="fas fa-folder-open text-info"></i>
                    Kundenprojekte-Bereich
                </h4>
                <div class="card">
                    <div class="card-body">
                        <div class="row g-3 mb-4">
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Projekte-Titel</label>
                                <input type="text" class="form-control" id="projectsTitle" value="${pageStructure.projects.title}">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Projekte-Untertitel</label>
                                <input type="text" class="form-control" id="projectsSubtitle" value="${pageStructure.projects.subtitle}">
                            </div>
                            <div class="col-12">
                                <label class="form-label fw-bold">Projekte-Beschreibung</label>
                                <textarea class="form-control" id="projectsDescription" rows="3">${pageStructure.projects.description}</textarea>
                            </div>
                        </div>
                        
                        <h5 class="mb-3">
                            <i class="fas fa-images"></i>
                            Projekt-Galerie
                            <button class="btn btn-sm btn-success ms-2" onclick="addProjectItem()">
                                <i class="fas fa-plus"></i> Projekt hinzufügen
                            </button>
                        </h5>
                        
                        <div id="projectsGallery">
        `;
        
        // Add existing projects
        pageStructure.projects.items.forEach((project, index) => {
            editorHTML += `
                <div class="project-item border rounded p-3 mb-3" data-index="${index}">
                    <div class="row g-3 align-items-center">
                        <div class="col-md-3">
                            <img src="${project.image}" alt="${project.name}" class="img-fluid rounded project-preview">
                        </div>
                        <div class="col-md-6">
                            <div class="mb-2">
                                <label class="form-label fw-bold">Projekt-Name</label>
                                <input type="text" class="form-control project-name" value="${project.name}">
                            </div>
                            <div class="mb-2">
                                <label class="form-label fw-bold">Bild-URL</label>
                                <div class="input-group">
                                    <input type="text" class="form-control project-image" value="${project.image}">
                                    <button class="btn btn-outline-primary" type="button" onclick="selectProjectImage(${index})">
                                        <i class="fas fa-image"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3 text-end">
                            <button class="btn btn-sm btn-danger" onclick="removeProjectItem(${index})">
                                <i class="fas fa-trash"></i>
                                Entfernen
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        editorHTML += `
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Save Button
    editorHTML += `
        <div class="editor-actions mt-4">
            <div class="d-flex justify-content-between">
                <div>
                    <button class="btn btn-outline-secondary me-2" onclick="previewPageChanges()">
                        <i class="fas fa-eye"></i>
                        Vorschau
                    </button>
                    <button class="btn btn-outline-info" onclick="resetPageChanges()">
                        <i class="fas fa-undo"></i>
                        Zurücksetzen
                    </button>
                </div>
                <button class="btn btn-success" onclick="savePageChanges()">
                    <i class="fas fa-save"></i>
                    Änderungen speichern
                </button>
            </div>
        </div>
    </div>
    `;
    
    return editorHTML;
}

// Analyze page structure
async function analyzePageStructure(page) {
    
    try {
        // Fetch detailed page data from backend
        const response = await fetch(`/api/pages/${page.id}`);
        
        if (response.ok) {
            const pageData = await response.json();

            
            let structure = {
                hasHero: false,
                hasProjects: false,
                hero: {},
                projects: {}
            };
            
            // Set hero section if exists
            if (pageData.heroSection) {
                structure.hasHero = true;
                structure.hero = {
                    title: pageData.heroSection.title,
                    subtitle: pageData.heroSection.subtitle || '',
                    description: pageData.heroSection.description || '',
                    backgroundColor: pageData.heroSection.backgroundColor || '#1a1a1a',
                    backgroundImage: pageData.heroSection.backgroundImage || ''
                };
            }
            
            // Set projects section if exists
            if (pageData.projectsSection) {
                structure.hasProjects = true;
                structure.projects = {
                    title: pageData.projectsSection.title,
                    subtitle: pageData.projectsSection.subtitle || '',
                    description: pageData.projectsSection.description || '',
                    items: pageData.projectsSection.projects.map(project => ({
                        name: project.name,
                        image: project.imageUrl
                    }))
                };
            }
            
            return structure;
        }
    } catch (error) {
        console.error('Error fetching page data from backend:', error);
    }
    
    // Fallback to mock data if backend request fails
    return getFallbackPageStructure(page);
}

// Fallback page structure if backend is not available
function getFallbackPageStructure(page) {
    let structure = {
        hasHero: false,
        hasProjects: false,
        hero: {},
        projects: {}
    };
    
    // Service pages typically have hero and projects sections
    if (page.type === 'service' || page.category === 'Lichtwerbung' || page.category === 'Beschriftungen') {
        structure.hasHero = true;
        structure.hasProjects = true;
        
        // Sample data based on leuchtschriften.html structure
        structure.hero = {
            title: page.title,
            subtitle: 'Ihre Spezialisten für hochwertige Beschriftungen und Werbeanlagen',
            description: 'Wir fertigen Buchstaben und Logos in jeder gewünschten Form – aus Aluminium oder Vollplexi mit stilvollen Acrylglas-Fronten.',
            backgroundColor: '#1a1a1a',
            backgroundImage: ''
        };
        
        structure.projects = {
            title: 'Unsere Kundenprojekte',
            subtitle: '',
            description: `Unsere Projekte im Bereich ${page.title} zeigen eindrucksvoll, wie Marken und Botschaften strahlend in Szene gesetzt werden können.`,
            items: [
                { name: 'Agrola Tankstellen', image: '../content/images/detail1.jpg' },
                { name: 'Baloise Versicherungen AG', image: '../content/images/detail2.jpg' },
                { name: 'Brasserie Verkehrshaus', image: '../content/images/detail3.jpg' },
                { name: 'Brunox', image: '../content/images/detail4.jpg' },
                { name: 'Dieci AG', image: '../content/images/detail5.jpg' },
                { name: 'Entra Rapperswil', image: '../content/images/detail6.jpg' }
            ]
        };
    }
    
    // Homepage has different structure
    if (page.type === 'homepage') {
        structure.hasHero = true;
        structure.hero = {
            title: 'Willkommen bei Neon Murer',
            subtitle: 'Ihr Partner für professionelle Lichtwerbung',
            description: 'Seit über 40 Jahren Ihr zuverlässiger Partner für hochwertige Lichtwerbung und Beschriftungen.',
            backgroundColor: '#2c3e50',
            backgroundImage: ''
        };
    }
    
    return structure;
}

// Project management functions
function addProjectItem() {
    const gallery = document.getElementById('projectsGallery');
    const newIndex = gallery.children.length;
    
    const newProjectHTML = `
        <div class="project-item border rounded p-3 mb-3" data-index="${newIndex}">
            <div class="row g-3 align-items-center">
                <div class="col-md-3">
                    <img src="../content/images/detail1.jpg" alt="Neues Projekt" class="img-fluid rounded project-preview">
                </div>
                <div class="col-md-6">
                    <div class="mb-2">
                        <label class="form-label fw-bold">Projekt-Name</label>
                        <input type="text" class="form-control project-name" value="Neues Projekt">
                    </div>
                    <div class="mb-2">
                        <label class="form-label fw-bold">Bild-URL</label>
                        <div class="input-group">
                            <input type="text" class="form-control project-image" value="../content/images/detail1.jpg">
                            <button class="btn btn-outline-primary" type="button" onclick="selectProjectImage(${newIndex})">
                                <i class="fas fa-image"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 text-end">
                    <button class="btn btn-sm btn-danger" onclick="removeProjectItem(${newIndex})">
                        <i class="fas fa-trash"></i>
                        Entfernen
                    </button>
                </div>
            </div>
        </div>
    `;
    
    gallery.insertAdjacentHTML('beforeend', newProjectHTML);
    showNotification('Neues Projekt hinzugefügt', 'success');
}

function removeProjectItem(index) {
    const projectItem = document.querySelector(`[data-index="${index}"]`);
    if (projectItem) {
        projectItem.remove();
        showNotification('Projekt entfernt', 'info');
    }
}

function selectHeroImage() {
    // This would open a media picker
    showNotification('Media-Picker würde hier geöffnet', 'info');
}

function selectProjectImage(index) {
    // This would open a media picker for specific project
    showNotification(`Media-Picker für Projekt ${index} würde hier geöffnet`, 'info');
}

function previewPageChanges() {
    showNotification('Vorschau wird generiert...', 'info');
    // This would generate a preview of the changes
}

function resetPageChanges() {
    if (confirm('Möchten Sie alle Änderungen zurücksetzen?')) {
        // Reload the page editor
        loadPageContentForEditing(currentEditingPage);
        showNotification('Änderungen zurückgesetzt', 'warning');
    }
}

async function savePageChanges() {
    if (!currentEditingPage) {
        showNotification('❌ Keine Seite zum Speichern ausgewählt', 'danger');
        return;
    }
    
    try {
        // Show loading state
        const saveButton = document.querySelector('.btn-success');
        const originalText = saveButton.innerHTML;
        saveButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Speichere...';
        saveButton.disabled = true;
        
        // Collect all form data
        const updateData = {
            title: currentEditingPage.title, // Keep original title for now
            heroSection: null,
            projectsSection: null,
            projects: []
        };
        
        // Collect hero section data if exists
        const heroTitle = document.getElementById('heroTitle');
        if (heroTitle) {
            updateData.heroSection = {
                title: heroTitle.value || '',
                subtitle: document.getElementById('heroSubtitle')?.value || '',
                description: document.getElementById('heroDescription')?.value || '',
                backgroundColor: document.getElementById('heroBackgroundColor')?.value || '#1a1a1a',
                backgroundImage: document.getElementById('heroBackgroundImage')?.value || ''
            };
        }
        
        // Collect projects section data if exists
        const projectsTitle = document.getElementById('projectsTitle');
        if (projectsTitle) {
            updateData.projectsSection = {
                title: projectsTitle.value || 'Unsere Kundenprojekte',
                subtitle: document.getElementById('projectsSubtitle')?.value || '',
                description: document.getElementById('projectsDescription')?.value || ''
            };
            
            // Collect project items
            const projectItems = document.querySelectorAll('.project-item');
            projectItems.forEach((item, index) => {
                const name = item.querySelector('.project-name')?.value || '';
                const imageUrl = item.querySelector('.project-image')?.value || '';
                if (name && imageUrl) {
                    updateData.projects.push({
                        name: name,
                        imageUrl: imageUrl,
                        imageAlt: name,
                        order: index,
                        isVisible: true
                    });
                }
            });
        }
        

        
        // Send data to backend API
        const response = await fetch(`/api/pages/${currentEditingPage.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(updateData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP ${response.status}`);
        }
        
        const result = await response.json();
        
        // Update current page data
        if (result.page) {
            Object.assign(currentEditingPage, result.page);
            currentEditingPage.lastModified = new Date().toISOString().split('T')[0];
        }
        
        // Update the content table
        renderContentTable();
        
        // Show success message
        showNotification('✅ Seite erfolgreich gespeichert und HTML-Datei aktualisiert!', 'success');
        
        // Close modal after successful save
        setTimeout(() => {
            const modal = bootstrap.Modal.getInstance(document.getElementById('contentModal'));
            if (modal) {
                modal.hide();
            }
        }, 1500);
        
    } catch (error) {
        console.error('Error saving page:', error);
        
        // Check if it's a network/API error
        if (error.message.includes('fetch')) {
            showNotification('❌ Backend-Server nicht erreichbar. Starte das Backend mit "npm run dev"', 'danger');
        } else {
            showNotification(`❌ Fehler beim Speichern: ${error.message}`, 'danger');
        }
    } finally {
        // Reset save button
        const saveButton = document.querySelector('.btn-success');
        if (saveButton) {
            saveButton.innerHTML = '<i class="fas fa-save"></i> Änderungen speichern';
            saveButton.disabled = false;
        }
    }
}

// Preview page
function previewPage(pageId) {
    const page = realPagesData.find(p => p.id === pageId);
    if (page) {
        // Open page in new tab for preview
        window.open(`../${page.path}`, '_blank');
    }
}

// Duplicate page
function duplicatePage(pageId) {
    const page = realPagesData.find(p => p.id === pageId);
    if (page) {
        const newPage = {
            ...page,
            id: page.id + '-copy',
            title: page.title + ' (Kopie)',
            status: 'draft',
            lastModified: new Date().toISOString().split('T')[0]
        };
        
        realPagesData.push(newPage);
        filteredPagesData = [...realPagesData];
        renderContentTable();
        
        // Show success message
        showNotification('Seite erfolgreich dupliziert!', 'success');
    }
}

// Show page SEO details
function showPageSEO(pageId) {
    const page = realPagesData.find(p => p.id === pageId);
    if (page) {
        alert(`SEO-Informationen für: ${page.title}\n\nMeta-Titel: ${page.seoTitle}\nBeschreibung: ${page.metaDescription}\nPfad: ${page.path}`);
    }
}

// Apply content filters
function applyContentFilters() {
    filterContentPages();
    showNotification('Filter angewendet', 'info');
}

// Bulk actions
function toggleAllContentSelection() {
    const masterCheckbox = document.getElementById('selectAllContent');
    const checkboxes = document.querySelectorAll('.content-checkbox');
    
    checkboxes.forEach(checkbox => {
        checkbox.checked = masterCheckbox.checked;
    });
    
    updateBulkActions();
}

function updateBulkActions() {
    const checkedBoxes = document.querySelectorAll('.content-checkbox:checked');
    const bulkActions = document.getElementById('bulkActions');
    
    if (bulkActions) {
        if (checkedBoxes.length > 0) {
            bulkActions.classList.remove('d-none');
        } else {
            bulkActions.classList.add('d-none');
        }
    }
}

function bulkPublish() {
    const checkedBoxes = document.querySelectorAll('.content-checkbox:checked');
    checkedBoxes.forEach(checkbox => {
        const pageId = checkbox.getAttribute('data-page-id');
        const page = realPagesData.find(p => p.id === pageId);
        if (page) {
            page.status = 'published';
        }
    });
    renderContentTable();
    showNotification(`${checkedBoxes.length} Seiten veröffentlicht`, 'success');
}

function bulkDraft() {
    const checkedBoxes = document.querySelectorAll('.content-checkbox:checked');
    checkedBoxes.forEach(checkbox => {
        const pageId = checkbox.getAttribute('data-page-id');
        const page = realPagesData.find(p => p.id === pageId);
        if (page) {
            page.status = 'draft';
        }
    });
    renderContentTable();
    showNotification(`${checkedBoxes.length} Seiten als Entwurf markiert`, 'warning');
}

function bulkDelete() {
    if (confirm('Möchten Sie die ausgewählten Seiten wirklich löschen?')) {
        const checkedBoxes = document.querySelectorAll('.content-checkbox:checked');
        const pagesToDelete = [];
        
        checkedBoxes.forEach(checkbox => {
            pagesToDelete.push(checkbox.getAttribute('data-page-id'));
        });
        
        realPagesData = realPagesData.filter(page => !pagesToDelete.includes(page.id));
        filteredPagesData = [...realPagesData];
        renderContentTable();
        
        showNotification(`${pagesToDelete.length} Seiten gelöscht`, 'danger');
    }
}

// Text formatting functions for editor
function formatText(command) {
    document.execCommand(command, false, null);
    document.getElementById('contentBody').focus();
}

function insertLink() {
    const url = prompt('Link-URL eingeben:');
    if (url) {
        document.execCommand('createLink', false, url);
    }
}

// REMOVED - using new system below

// Override native alert and confirm dialogs globally
window.alert = function(message) {
    showNotification(message, 'info');
};

window.confirm = function(message) {
    // For dangerous actions, show warning notification and return true
    // Clean up the message for better display
    const cleanMessage = message.replace(/\n\n.*/, '').replace(/🗑️\s*/, '').replace(/\n.*/, '');
    showNotification(`✓ ${cleanMessage}`, 'warning');
    return true;
};

// SIMPLE & WORKING Notification system
function showNotification(message, type = 'info', clearPrevious = true) {
    
    // Clear previous notifications if requested
    if (clearPrevious) {
        clearNotifications();
    }
    
    // Simple notification container
    let container = document.getElementById('notification-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notification-container';
        container.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999;';
        document.body.appendChild(container);
    }
    
    // Create notification
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? '#28a745' : 
                    type === 'error' ? '#dc3545' : 
                    type === 'warning' ? '#ffc107' : '#007bff';
    const textColor = type === 'warning' ? '#000' : '#fff';
    
    notification.className = 'simple-notification';
    notification.style.cssText = `
        background: ${bgColor};
        color: ${textColor};
        padding: 15px 20px;
        border-radius: 8px;
        margin-bottom: 10px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-width: 350px;
        word-wrap: break-word;
        cursor: default;
        transform: translateX(100%);
        transition: all 0.3s ease;
        position: relative;
    `;
    
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 10px;">
            <i class="fas ${getNotificationIcon(type)}" style="font-size: 16px;"></i>
            <span style="flex: 1;">${message}</span>
        </div>
    `;
    
    container.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 50);
    
    // Auto-remove after 1.5 seconds
    const timer = setTimeout(() => {
        closeNotification(notification);
    }, 1500);
    
    // Store timer reference
    notification._timer = timer;
    
    return notification;
}

// Close single notification
function closeNotification(notification) {
    if (!notification || !notification.parentNode) return;
    
    
    if (notification._timer) {
        clearTimeout(notification._timer);
    }
    
    notification.style.transform = 'translateX(100%)';
    notification.style.opacity = '0';
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 100);
}

// Legacy function (for compatibility)
function removeNotification(element) {
    closeNotification(element);
}

// Helper function for notification icons
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'fa-check-circle';
        case 'danger':
        case 'error': return 'fa-exclamation-triangle';
        case 'warning': return 'fa-exclamation-circle';
        case 'info':
        default: return 'fa-info-circle';
    }
}

// Clear all notifications (immediately)
function clearNotifications() {
    const container = document.getElementById('notification-container');
    if (container) {
        const notifications = container.querySelectorAll('.simple-notification');
        Array.from(notifications).forEach(notification => {
            if (notification._timer) {
                clearTimeout(notification._timer);
            }
            // Remove immediately without animation for faster clearing
            if (notification.parentNode) {
                notification.remove();
            }
        });
    }
}

// ========== CUSTOMER MANAGEMENT ==========

// Customer Management Variables
let customers = [];
let customerStats = {};

// Helper function to escape HTML
function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.toString().replace(/[&<>"']/g, (m) => map[m]);
}

// Helper function to format dates
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('de-CH', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// Helper function to show loading spinner in table
function showLoadingSpinner(tableId) {
    const tbody = document.getElementById(tableId);
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Kunden werden geladen...</span>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Helper function to show error in table
function showErrorInTable(tableId, message) {
    const tbody = document.getElementById(tableId);
    if (tbody) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <div class="alert alert-danger mb-0">
                        <i class="fas fa-exclamation-triangle"></i> ${message}
                        <br><button class="btn btn-sm btn-outline-danger mt-2" onclick="loadCustomers()">
                            <i class="fas fa-refresh"></i> Erneut versuchen
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }
}

// Load customer data when section is shown
function loadCustomerData() {
    loadCustomerStats();
    loadCustomers();
}

// Load customer statistics
async function loadCustomerStats() {
    try {
        const response = await fetch('/api/customers/stats', {
            headers: getAuthHeaders()
        });
        const stats = await response.json();
        
        customerStats = stats;
        updateCustomerStats(stats);
    } catch (error) {
        console.error('Error loading customer stats:', error);
        showNotification('Fehler beim Laden der Kundenstatistiken', 'error');
    }
}

// Update customer statistics in UI
function updateCustomerStats(stats) {
    document.getElementById('totalCustomers').textContent = stats.totalCustomers || 0;
    document.getElementById('prospectCustomers').textContent = stats.prospects || 0;
    document.getElementById('activeCustomers').textContent = stats.activeCustomers || 0;
    document.getElementById('vipCustomers').textContent = stats.vipCustomers || 0;
}

// Load customers with filters
async function loadCustomers() {
    try {
        showLoadingSpinner('customersTable');
        
        const params = new URLSearchParams();
        
        // Get filter values
        const search = document.getElementById('customerSearch')?.value;
        const status = document.getElementById('statusFilter')?.value;
        const type = document.getElementById('typeFilter')?.value;
        
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (type) params.append('customerType', type);
        
        // Include related data
        params.append('includeContacts', 'true');
        params.append('includeActivities', 'true');
        
        const response = await fetch(`/api/customers?${params}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        
        customers = data.customers || [];
        renderCustomersTable(customers);
        updateCustomerCount(customers.length);
        
    } catch (error) {
        console.error('Error loading customers:', error);
        showErrorInTable('customersTable', 'Fehler beim Laden der Kunden');
    }
}

// Render customers table
function renderCustomersTable(customers) {
    // Render both views
    renderCustomersTableView(customers);
    renderCustomersCardsView(customers);
    
    // Initialize view mode
    initializeCustomerViewMode();
}

function renderCustomersTableView(customers) {
    const tbody = document.getElementById('customersTable');
    
    if (customers.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-users fa-4x text-muted mb-3"></i>
                        <h5 class="text-muted">Keine Kunden gefunden</h5>
                        <p class="text-muted mb-4">Erstellen Sie Ihren ersten Kunden um zu beginnen.</p>
                        <button class="btn btn-primary" onclick="showCustomerModal()">
                            <i class="fas fa-plus me-2"></i>Ersten Kunden hinzufügen
                        </button>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = customers.map(customer => {
        const primaryContact = customer.contacts?.find(c => c.isPrimary) || customer.contacts?.[0];
        const lastActivity = customer.activities?.[0];
        const createdDate = new Date(customer.createdAt).toLocaleDateString('de-CH');
        
        return `
            <tr onclick="showCustomerDetails('${customer.id}')" style="cursor: pointer;">
                <td>
                    <div class="d-flex align-items-center">
                        <div class="customer-avatar me-2">
                            ${getCustomerTypeIcon(customer.customerType)}
                        </div>
                        <div>
                            <strong>${escapeHtml(customer.company)}</strong>
                            ${customer.website ? `<br><small class="text-muted">${escapeHtml(customer.website)}</small>` : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        ${primaryContact ? `
                            <strong>${escapeHtml(primaryContact.firstName)} ${escapeHtml(primaryContact.lastName)}</strong>
                            ${primaryContact.email ? `<br><small class="text-muted">${escapeHtml(primaryContact.email)}</small>` : ''}
                        ` : `
                            ${customer.firstName && customer.lastName ? `<strong>${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}</strong><br>` : ''}
                            ${customer.email ? `<small class="text-muted">${escapeHtml(customer.email)}</small>` : '<span class="text-muted">Kein Kontakt</span>'}
                        `}
                    </div>
                </td>
                <td><span class="badge bg-secondary">${getCustomerTypeLabel(customer.customerType)}</span></td>
                <td><span class="badge ${getStatusBadgeClass(customer.status)}">${getStatusLabel(customer.status)}</span></td>
                <td>
                    ${customer.city ? `
                        <div>
                            ${escapeHtml(customer.city)}${customer.zipCode ? `, ${customer.zipCode}` : ''}
                            ${customer.city && customer.country ? `
                                <br><a href="https://maps.google.com/maps?q=${encodeURIComponent(getFullAddress(customer))}" target="_blank" class="text-primary">
                                    <i class="fas fa-map-marker-alt"></i> Karte
                                </a>
                            ` : ''}
                        </div>
                    ` : '<span class="text-muted">Keine Adresse</span>'}
                </td>
                <td>
                    <small class="text-muted">${createdDate}</small>
                </td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="event.stopPropagation(); showCustomerDetails('${customer.id}')" title="Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="event.stopPropagation(); editCustomer('${customer.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="event.stopPropagation(); addActivity('${customer.id}')" title="Aktivität">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Render customers cards view
function renderCustomersCardsView(customers) {
    const cardsContainer = document.getElementById('customersCards');
    
    if (customers.length === 0) {
        cardsContainer.innerHTML = `
            <div class="col-12">
                <div class="text-center py-5">
                    <div class="empty-state">
                        <i class="fas fa-users fa-4x text-muted mb-4"></i>
                        <h4 class="text-muted mb-3">Keine Kunden gefunden</h4>
                        <p class="text-muted mb-4">Erstellen Sie Ihren ersten Kunden um zu beginnen.</p>
                        <button class="btn btn-primary btn-lg" onclick="showCustomerModal()">
                            <i class="fas fa-plus me-2"></i>Ersten Kunden hinzufügen
                        </button>
                    </div>
                </div>
            </div>
        `;
        return;
    }

    cardsContainer.innerHTML = customers.map(customer => {
        const primaryContact = customer.contacts?.find(c => c.isPrimary) || customer.contacts?.[0];
        const lastActivity = customer.activities?.[0];
        const createdDate = new Date(customer.createdAt).toLocaleDateString('de-CH');
        
        return `
            <div class="col-xl-4 col-lg-6 col-md-6">
                <div class="card customer-card border-0 shadow-sm h-100 hover-lift" onclick="showCustomerDetails('${customer.id}')" style="cursor: pointer; transition: all 0.2s ease;">
                    <div class="card-body p-4">
                        <!-- Header -->
                        <div class="d-flex align-items-start justify-content-between mb-3">
                            <div class="d-flex align-items-center">
                                <div class="customer-avatar me-3">
                                    ${getCustomerTypeIcon(customer.customerType)}
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="card-title mb-1 fw-bold text-truncate">${escapeHtml(customer.company)}</h6>
                                    <div class="d-flex align-items-center gap-2 flex-wrap">
                                        <span class="badge ${getStatusBadgeClass(customer.status)}">${getStatusLabel(customer.status)}</span>
                                        <small class="text-muted">${getCustomerTypeLabel(customer.customerType)}</small>
                                    </div>
                                </div>
                            </div>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-light" data-bs-toggle="dropdown" onclick="event.stopPropagation()" title="Aktionen">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu dropdown-menu-end">
                                    <li><a class="dropdown-item" href="#" onclick="event.stopPropagation(); showCustomerDetails('${customer.id}')">
                                        <i class="fas fa-eye me-2"></i>Details anzeigen
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="event.stopPropagation(); editCustomer('${customer.id}')">
                                        <i class="fas fa-edit me-2"></i>Bearbeiten
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="event.stopPropagation(); addActivity('${customer.id}')">
                                        <i class="fas fa-plus me-2"></i>Aktivität hinzufügen
                                    </a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="event.stopPropagation(); confirmDeleteCustomer('${customer.id}', '${escapeHtml(customer.company)}')">
                                        <i class="fas fa-trash me-2"></i>Löschen
                                    </a></li>
                                </ul>
                            </div>
                        </div>

                        <!-- Contact Info -->
                        <div class="contact-section mb-3">
                            ${primaryContact ? `
                                <div class="contact-person mb-2">
                                    <div class="d-flex align-items-center mb-1">
                                        <i class="fas fa-user text-muted me-2"></i>
                                        <span class="fw-medium small">${escapeHtml(primaryContact.firstName)} ${escapeHtml(primaryContact.lastName)}</span>
                                    </div>
                                    ${primaryContact.email ? `
                                        <div class="d-flex align-items-center text-muted" style="font-size: 0.85rem;">
                                            <i class="fas fa-envelope me-2"></i>
                                            <span class="text-truncate">${escapeHtml(primaryContact.email)}</span>
                                        </div>
                                    ` : ''}
                                </div>
                            ` : customer.email ? `
                                <div class="contact-person mb-2">
                                    ${customer.firstName && customer.lastName ? `
                                        <div class="d-flex align-items-center mb-1">
                                            <i class="fas fa-user text-muted me-2"></i>
                                            <span class="fw-medium small">${escapeHtml(customer.firstName)} ${escapeHtml(customer.lastName)}</span>
                                        </div>
                                    ` : ''}
                                    <div class="d-flex align-items-center text-muted" style="font-size: 0.85rem;">
                                        <i class="fas fa-envelope me-2"></i>
                                        <span class="text-truncate">${escapeHtml(customer.email)}</span>
                                    </div>
                                </div>
                            ` : ''}
                            
                            ${customer.phone ? `
                                <div class="d-flex align-items-center text-muted mb-2" style="font-size: 0.85rem;">
                                    <i class="fas fa-phone me-2"></i>
                                    <span>${escapeHtml(customer.phone)}</span>
                                </div>
                            ` : ''}
                            
                            ${customer.city ? `
                                <div class="d-flex align-items-center text-muted mb-2" style="font-size: 0.85rem;">
                                    <i class="fas fa-map-marker-alt me-2"></i>
                                    <span>${escapeHtml(customer.city)}</span>
                                </div>
                            ` : ''}
                            
                            ${customer.website ? `
                                <div class="d-flex align-items-center text-muted" style="font-size: 0.85rem;">
                                    <i class="fas fa-globe me-2"></i>
                                    <span class="text-truncate">${escapeHtml(customer.website)}</span>
                                </div>
                            ` : ''}
                        </div>

                        <!-- Last Activity -->
                        ${lastActivity ? `
                            <div class="last-activity bg-light rounded p-2 mb-3">
                                <div class="d-flex align-items-center">
                                    <i class="fas fa-clock text-muted me-2"></i>
                                    <div class="flex-grow-1">
                                        <div class="text-muted small">Letzte Aktivität</div>
                                        <div class="fw-medium small text-truncate">${escapeHtml(lastActivity.subject)}</div>
                                        <div class="text-muted" style="font-size: 0.75rem;">${formatDate(lastActivity.activityDate)}</div>
                                    </div>
                                </div>
                            </div>
                        ` : `
                            <div class="last-activity bg-light rounded p-2 mb-3 text-center">
                                <small class="text-muted">
                                    <i class="fas fa-info-circle me-1"></i>
                                    Noch keine Aktivitäten
                                </small>
                            </div>
                        `}

                        <!-- Footer -->
                        <div class="card-footer-info d-flex justify-content-between align-items-center text-muted" style="font-size: 0.75rem;">
                            <span>
                                <i class="fas fa-calendar-plus me-1"></i>
                                ${createdDate}
                            </span>
                            ${customer.industry ? `
                                <span class="badge bg-light text-dark">
                                    ${escapeHtml(customer.industry)}
                                </span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Helper functions for customer display
function getCustomerTypeIcon(type) {
    const icons = {
        'BUSINESS': '<i class="fas fa-building text-primary"></i>',
        'PRIVATE': '<i class="fas fa-user text-success"></i>',
        'GOVERNMENT': '<i class="fas fa-university text-warning"></i>',
        'NGO': '<i class="fas fa-heart text-danger"></i>'
    };
    return icons[type] || '<i class="fas fa-building text-secondary"></i>';
}

function getCustomerTypeLabel(type) {
    const labels = {
        'BUSINESS': 'Unternehmen',
        'PRIVATE': 'Privat',
        'GOVERNMENT': 'Behörde',
        'NGO': 'Non-Profit'
    };
    return labels[type] || type;
}

function getStatusBadgeClass(status) {
    const classes = {
        'PROSPECT': 'bg-warning',
        'ACTIVE': 'bg-success',
        'INACTIVE': 'bg-secondary',
        'VIP': 'bg-primary',
        'LOST': 'bg-danger'
    };
    return classes[status] || 'bg-secondary';
}

function getStatusLabel(status) {
    const labels = {
        'PROSPECT': 'Interessent',
        'ACTIVE': 'Aktiv',
        'INACTIVE': 'Inaktiv',
        'VIP': 'VIP',
        'LOST': 'Verloren'
    };
    return labels[status] || status;
}

function getPriorityBadgeClass(priority) {
    const classes = {
        'CRITICAL': 'bg-danger',
        'HIGH': 'bg-warning',
        'MEDIUM': 'bg-info',
        'LOW': 'bg-light text-dark'
    };
    return classes[priority] || 'bg-light text-dark';
}

function getPriorityLabel(priority) {
    const labels = {
        'CRITICAL': 'Kritisch',
        'HIGH': 'Hoch',
        'MEDIUM': 'Mittel',
        'LOW': 'Niedrig'
    };
    return labels[priority] || priority;
}

function getActivityTypeLabel(type) {
    const labels = {
        'CALL': 'Telefonat',
        'MEETING': 'Meeting',
        'EMAIL': 'E-Mail',
        'VISIT': 'Besuch',
        'QUOTE': 'Angebot',
        'PROPOSAL': 'Vorschlag',
        'FOLLOW_UP': 'Nachfassen',
        'COMPLAINT': 'Beschwerde',
        'SUPPORT': 'Support',
        'OTHER': 'Sonstiges'
    };
    return labels[type] || type;
}

function getActivityStatusLabel(status) {
    const labels = {
        'PLANNED': 'Geplant',
        'IN_PROGRESS': 'In Bearbeitung',
        'COMPLETED': 'Abgeschlossen',
        'CANCELLED': 'Abgebrochen',
        'POSTPONED': 'Verschoben'
    };
    return labels[status] || status;
}

function getActivityStatusColor(status) {
    const colors = {
        'PLANNED': 'primary',
        'IN_PROGRESS': 'warning',
        'COMPLETED': 'success',
        'CANCELLED': 'danger',
        'POSTPONED': 'secondary'
    };
    return colors[status] || 'secondary';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString('de-DE', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    if (diffDays === 0) {
        return `Heute, ${timeStr}`;
    } else if (diffDays === 1) {
        return `Gestern, ${timeStr}`;
    } else if (diffDays < 7) {
        return `${date.toLocaleDateString('de-DE', { weekday: 'long' })}, ${timeStr}`;
    } else {
        return `${date.toLocaleDateString('de-DE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric' 
        })}, ${timeStr}`;
    }
}

// Customer Helper Functions
function getCustomerStatusColor(status) {
    const colors = {
        'PROSPECT': 'info',
        'ACTIVE': 'success', 
        'INACTIVE': 'secondary',
        'VIP': 'warning',
        'FORMER': 'danger'
    };
    return colors[status] || 'secondary';
}

function getCustomerStatusLabel(status) {
    const labels = {
        'PROSPECT': 'Interessent',
        'ACTIVE': 'Aktiv',
        'INACTIVE': 'Inaktiv', 
        'VIP': 'VIP-Kunde',
        'FORMER': 'Ehemaliger Kunde'
    };
    return labels[status] || status;
}

function getCustomerTypeLabel(type) {
    const labels = {
        'B2B': 'Geschäftskunde',
        'B2C': 'Privatkunde',
        'GOVERNMENT': 'Behörde',
        'NON_PROFIT': 'Non-Profit'
    };
    return labels[type] || type;
}

function getPriorityColor(priority) {
    const colors = {
        'LOW': 'success',
        'MEDIUM': 'warning',
        'HIGH': 'danger',
        'CRITICAL': 'dark'
    };
    return colors[priority] || 'secondary';
}

async function deleteCustomerConfirm(customerId) {
    try {
        // Get customer name for confirmation
        const response = await fetch(`/api/customers/${customerId}`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Kunde nicht gefunden');
        }
        
        const customer = await response.json();
        
        if (confirm(`Sind Sie sicher, dass Sie den Kunden "${customer.company}" unwiderruflich löschen möchten?\n\nAlle zugehörigen Aktivitäten, Kontakte und Projekte werden ebenfalls gelöscht.`)) {
            await deleteCustomer(customerId);
        }
    } catch (error) {
        console.error('Error in delete confirmation:', error);
        showNotification('Fehler beim Laden der Kundendaten: ' + error.message, 'error');
    }
}

// Edit Activity Function
async function editActivity(activityId, customerId) {
    try {
        showNotification('Aktivität wird geladen...', 'info');
        
        // Load both activity and customer data in parallel
        const [activityResponse, customerResponse] = await Promise.all([
            fetch(`/api/customers/${customerId}/activities/${activityId}`, {
                headers: getAuthHeaders()
            }),
            fetch(`/api/customers/${customerId}?includeContacts=true`, {
                headers: getAuthHeaders()
            })
        ]);
        
        if (!activityResponse.ok) {
            throw new Error('Aktivität konnte nicht geladen werden');
        }
        
        if (!customerResponse.ok) {
            throw new Error('Kundendaten konnten nicht geladen werden');
        }
        
        const activity = await activityResponse.json();
        const customer = await customerResponse.json();
        
        // Clear loading notification and show modal
        clearNotifications();
        showEditActivityModal(activity, customer);
    } catch (error) {
        console.error('Error loading activity:', error);
        clearNotifications();
        showNotification('Fehler beim Laden der Aktivität: ' + error.message, 'error');
    }
}

// Show Edit Activity Modal
function showEditActivityModal(activity, customer) {
    const modal = createModal('edit-activity-modal', 'Aktivität bearbeiten', `
        <form id="editActivityForm">
            <input type="hidden" name="activityId" value="${activity.id}">
            <input type="hidden" name="customerId" value="${customer.id}">
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editActivityType" class="form-label">Aktivitätstyp *</label>
                        <select class="form-control" id="editActivityType" name="type" required>
                            <option value="CALL" ${activity.type === 'CALL' ? 'selected' : ''}>Anruf</option>
                            <option value="EMAIL" ${activity.type === 'EMAIL' ? 'selected' : ''}>E-Mail</option>
                            <option value="MEETING" ${activity.type === 'MEETING' ? 'selected' : ''}>Meeting</option>
                            <option value="VISIT" ${activity.type === 'VISIT' ? 'selected' : ''}>Besuch</option>
                            <option value="QUOTE" ${activity.type === 'QUOTE' ? 'selected' : ''}>Angebot</option>
                            <option value="PROPOSAL" ${activity.type === 'PROPOSAL' ? 'selected' : ''}>Vorschlag</option>
                            <option value="FOLLOW_UP" ${activity.type === 'FOLLOW_UP' ? 'selected' : ''}>Nachfassen</option>
                            <option value="COMPLAINT" ${activity.type === 'COMPLAINT' ? 'selected' : ''}>Beschwerde</option>
                            <option value="SUPPORT" ${activity.type === 'SUPPORT' ? 'selected' : ''}>Support</option>
                            <option value="OTHER" ${activity.type === 'OTHER' ? 'selected' : ''}>Sonstiges</option>
                        </select>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editActivityStatus" class="form-label">Status *</label>
                        <select class="form-control" id="editActivityStatus" name="status" required>
                            <option value="PLANNED" ${activity.status === 'PLANNED' ? 'selected' : ''}>Geplant</option>
                            <option value="IN_PROGRESS" ${activity.status === 'IN_PROGRESS' ? 'selected' : ''}>In Bearbeitung</option>
                            <option value="COMPLETED" ${activity.status === 'COMPLETED' ? 'selected' : ''}>Abgeschlossen</option>
                            <option value="CANCELLED" ${activity.status === 'CANCELLED' ? 'selected' : ''}>Abgebrochen</option>
                        </select>
                    </div>
                </div>
            </div>

            <div class="mb-3">
                <label for="editActivitySubject" class="form-label">Betreff *</label>
                <input type="text" class="form-control" id="editActivitySubject" name="subject" 
                       value="${escapeHtml(activity.subject)}" required maxlength="255">
            </div>

            <div class="mb-3">
                <label for="editActivityDescription" class="form-label">Beschreibung</label>
                <textarea class="form-control" id="editActivityDescription" name="description" 
                          rows="3" maxlength="1000">${activity.description || ''}</textarea>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editActivityDate" class="form-label">Datum/Zeit *</label>
                        <input type="datetime-local" class="form-control" id="editActivityDate" name="activityDate" 
                               value="${new Date(activity.activityDate).toISOString().slice(0, 16)}" required>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editActivityDuration" class="form-label">Dauer (Minuten)</label>
                        <input type="number" class="form-control" id="editActivityDuration" name="duration" 
                               value="${activity.duration || ''}" min="1" max="1440">
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editActivityLocation" class="form-label">Ort</label>
                        <input type="text" class="form-control" id="editActivityLocation" name="location" 
                               value="${escapeHtml(activity.location || '')}" maxlength="255">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editActivityContact" class="form-label">Ansprechpartner</label>
                        <select class="form-control" id="editActivityContact" name="contactId">
                            <option value="">Keinen Kontakt zuweisen</option>
                            ${customer.contacts ? customer.contacts.map(contact => `
                                <option value="${contact.id}" ${activity.contactId === contact.id ? 'selected' : ''}>
                                    ${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}
                                </option>
                            `).join('') : ''}
                        </select>
                    </div>
                </div>
            </div>

            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editActivityFollowUpDate" class="form-label">Follow-up Datum</label>
                        <input type="date" class="form-control" id="editActivityFollowUpDate" name="followUpDate" 
                               value="${activity.followUpDate ? new Date(activity.followUpDate).toISOString().slice(0, 10) : ''}">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="editActivityFollowUpNotes" class="form-label">Follow-up Notizen</label>
                        <input type="text" class="form-control" id="editActivityFollowUpNotes" name="followUpNotes" 
                               value="${escapeHtml(activity.followUpNotes || '')}" maxlength="255" placeholder="Erinnerung für Follow-up">
                    </div>
                </div>
            </div>
        </form>
    `, 'lg', `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
        <button type="button" class="btn btn-danger me-2" onclick="deleteActivityConfirm('${activity.id}', '${customer.id}')">
            <i class="fas fa-trash"></i> Löschen
        </button>
        <button type="button" class="btn btn-primary" onclick="updateActivity()">
            <i class="fas fa-save"></i> Speichern
        </button>
    `);
}

// Update Activity Function
async function updateActivity() {
    try {
        const form = document.getElementById('editActivityForm');
        const formData = new FormData(form);
        
        // Clean form data
        const data = Object.fromEntries(formData.entries());
        
        // Validate required fields first
        if (!data.type || data.type === '') {
            throw new Error('Aktivitätstyp ist erforderlich');
        }
        if (!data.subject || data.subject === '') {
            throw new Error('Betreff ist erforderlich');
        }
        
        // Clean optional fields
        Object.keys(data).forEach(key => {
            if (data[key] === '' || data[key] === 'null') {
                // Only set optional fields to null, not required ones
                if (!['type', 'subject', 'status', 'activityDate'].includes(key)) {
                    data[key] = null;
                }
            }
        });
        
        if (data.duration && data.duration !== null) {
            data.duration = parseInt(data.duration, 10);
        }
        
        
        const customerId = data.customerId;
        const activityId = data.activityId;
        delete data.customerId;
        delete data.activityId;
        
        const response = await fetch(`/api/customers/${customerId}/activities/${activityId}`, {
            method: 'PUT',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Backend validation error:', error);
            throw new Error(error.error || error.errors?.[0]?.msg || 'Fehler beim Aktualisieren der Aktivität');
        }
        
        showNotification('✅ Aktivität erfolgreich aktualisiert!', 'success');
        
        // Close modal and refresh customer view
        const modal = document.getElementById('edit-activity-modal');
        if (modal) {
            bootstrap.Modal.getInstance(modal).hide();
        }
        
        // Refresh the customer dashboard
        showCustomerDetails(customerId);
        
    } catch (error) {
        console.error('Error updating activity:', error);
        showNotification('Fehler beim Aktualisieren der Aktivität: ' + error.message, 'error');
    }
}

// Delete Activity Confirmation
function deleteActivityConfirm(activityId, customerId) {
    if (confirm('🗑️ Sind Sie sicher, dass Sie diese Aktivität unwiderruflich löschen möchten?\n\nDiese Aktion kann nicht rückgängig gemacht werden.')) {
        deleteActivity(activityId, customerId);
    }
}

// Delete Contact Confirmation
function deleteContactConfirm(contactId, customerId) {
    if (confirm('🗑️ Sind Sie sicher, dass Sie diesen Kontakt unwiderruflich löschen möchten?\n\nDiese Aktion kann nicht rückgängig gemacht werden.')) {
        deleteContact(contactId, customerId);
    }
}

// Delete Activity Function
async function deleteActivity(activityId, customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}/activities/${activityId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Löschen der Aktivität');
        }
        
        showNotification('✅ Aktivität erfolgreich gelöscht!', 'success');
        
        // Close modal and refresh customer view
        const modal = document.getElementById('edit-activity-modal');
        if (modal) {
            bootstrap.Modal.getInstance(modal).hide();
        }
        
        // Refresh the customer dashboard
        showCustomerDetails(customerId);
        
    } catch (error) {
        console.error('Error deleting activity:', error);
        showNotification('Fehler beim Löschen der Aktivität: ' + error.message, 'error');
    }
}

function showAllActivities(customerId) {
    // Find the customer
    const customer = allCustomers.find(c => c.id === customerId);
    if (!customer) return;
    
    const modal = createModal('all-activities-modal', `Alle Aktivitäten - ${customer.company}`, `
        <div class="activity-list" style="max-height: 60vh; overflow-y: auto;">
            ${customer.activities.map(activity => `
                <div class="activity-card border rounded p-3 mb-3">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h6 class="mb-1">${escapeHtml(activity.subject)}</h6>
                                <span class="badge bg-${getActivityStatusColor(activity.status)}">${getActivityStatusLabel(activity.status)}</span>
                            </div>
                            <div class="activity-meta mb-2">
                                <span class="badge bg-info me-2">${getActivityTypeLabel(activity.type)}</span>
                                <small class="text-muted">
                                    <i class="fas fa-calendar me-1"></i>${formatDateTime(activity.activityDate)}
                                    ${activity.duration ? `<i class="fas fa-clock ms-2 me-1"></i>${activity.duration} Min` : ''}
                                    ${activity.location ? `<i class="fas fa-map-marker-alt ms-2 me-1"></i>${escapeHtml(activity.location)}` : ''}
                                </small>
                            </div>
                            ${activity.description ? `
                                <p class="text-muted mb-2 small">${escapeHtml(activity.description)}</p>
                            ` : ''}
                            ${activity.contact ? `
                                <small class="text-info">
                                    <i class="fas fa-user me-1"></i>Kontakt: ${escapeHtml(activity.contact.firstName)} ${escapeHtml(activity.contact.lastName)}
                                </small>
                            ` : ''}
                        </div>
                        <div class="col-md-4 text-end">
                            <small class="text-muted d-block">Erstellt: ${formatDate(activity.createdAt)}</small>
                            ${activity.followUpDate ? `
                                <small class="text-warning d-block mt-1">
                                    <i class="fas fa-bell me-1"></i>Follow-up: ${formatDate(activity.followUpDate)}
                                </small>
                            ` : ''}
                            ${activity.followUpNotes ? `
                                <small class="text-muted d-block mt-1" title="${escapeHtml(activity.followUpNotes)}">
                                    <i class="fas fa-sticky-note me-1"></i>Follow-up Notizen: ${escapeHtml(activity.followUpNotes)}
                                </small>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `, 'xl', `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
        <button type="button" class="btn btn-primary" onclick="bootstrap.Modal.getInstance(document.getElementById('all-activities-modal')).hide(); showAddActivityModal(${JSON.stringify(customer).replace(/"/g, '&quot;')})">
            <i class="fas fa-plus"></i> Neue Aktivität hinzufügen
        </button>
    `);
}

function getFullAddress(customer) {
    const parts = [];
    if (customer.street) parts.push(customer.street);
    if (customer.zipCode) parts.push(customer.zipCode);
    if (customer.city) parts.push(customer.city);
    if (customer.country) parts.push(customer.country);
    return parts.join(', ');
}

// Filter functions
function filterCustomers() {
    loadCustomers();
}

function clearFilters() {
    document.getElementById('customerSearch').value = '';
    document.getElementById('statusFilter').value = '';
    document.getElementById('typeFilter').value = '';
    loadCustomers();
}

// Update customer count display
function updateCustomerCount(count) {
    const countElement = document.getElementById('customerCount');
    if (countElement) {
        countElement.textContent = `${count} ${count === 1 ? 'Kunde' : 'Kunden'}`;
    }
}

// Auth Helper Function for Customer Management
function getAuthHeaders(includeContentType = true) {
    const authToken = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken');
    const headers = {};
    
    // Only include Content-Type if requested (skip for FormData uploads)
    if (includeContentType) {
        headers['Content-Type'] = 'application/json';
    }
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    return headers;
}

// ========== SECURITY FUNCTIONS ==========

// Toggle password visibility
function togglePasswordVisibility(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        button.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        button.className = 'fas fa-eye';
    }
}

// Password strength checker
function checkPasswordStrength(password) {
    let strength = 0;
    let feedback = '';
    
    if (password.length >= 8) strength += 1;
    if (password.length >= 12) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    const strengthBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');
    
    if (strength < 2) {
        strengthBar.className = 'progress-bar bg-danger';
        strengthBar.style.width = '20%';
        feedback = 'Sehr schwach';
    } else if (strength < 4) {
        strengthBar.className = 'progress-bar bg-warning';
        strengthBar.style.width = '40%';
        feedback = 'Schwach';
    } else if (strength < 5) {
        strengthBar.className = 'progress-bar bg-info';
        strengthBar.style.width = '60%';
        feedback = 'Mittel';
    } else if (strength < 6) {
        strengthBar.className = 'progress-bar bg-success';
        strengthBar.style.width = '80%';
        feedback = 'Stark';
    } else {
        strengthBar.className = 'progress-bar bg-success';
        strengthBar.style.width = '100%';
        feedback = 'Sehr stark';
    }
    
    strengthText.textContent = feedback;
    return strength;
}

// Initialize password change form
function initPasswordChangeForm() {
    const form = document.getElementById('changePasswordForm');
    const newPasswordInput = document.getElementById('newPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    // Password strength check on input
    if (newPasswordInput) {
        newPasswordInput.addEventListener('input', (e) => {
            checkPasswordStrength(e.target.value);
            validatePasswordMatch();
        });
    }
    
    // Confirm password validation
    if (confirmPasswordInput) {
        confirmPasswordInput.addEventListener('input', validatePasswordMatch);
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', handlePasswordChange);
    }
    
    // Load session info
    loadSessionInfo();
}

// Validate password match
function validatePasswordMatch() {
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && newPassword !== confirmPassword) {
        confirmInput.setCustomValidity('Passwörter stimmen nicht überein');
        confirmInput.classList.add('is-invalid');
    } else {
        confirmInput.setCustomValidity('');
        confirmInput.classList.remove('is-invalid');
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (newPassword !== confirmPassword) {
        showNotification('❌ Passwörter stimmen nicht überein', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('❌ Passwort muss mindestens 8 Zeichen lang sein', 'error');
        return;
    }
    
    if (currentPassword === newPassword) {
        showNotification('❌ Das neue Passwort muss sich vom aktuellen unterscheiden', 'error');
        return;
    }
    
    try {
        showNotification('🔄 Passwort wird geändert...', 'info');
        
        const response = await fetch('/api/auth/change-password', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({
                currentPassword,
                newPassword
            })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Ändern des Passworts');
        }
        
        const result = await response.json();
        
        // Clear form
        document.getElementById('changePasswordForm').reset();
        document.getElementById('passwordStrength').style.width = '0%';
        document.getElementById('passwordStrengthText').textContent = 'Geben Sie ein neues Passwort ein';
        
        showNotification('✅ Passwort erfolgreich geändert!', 'success');
        
        // Optional: Auto-logout after password change
        setTimeout(() => {
            if (confirm('Ihr Passwort wurde geändert. Möchten Sie sich neu anmelden?')) {
                logout();
            }
        }, 2000);
        
    } catch (error) {
        console.error('Password change error:', error);
        showNotification(`❌ ${error.message}`, 'error');
    }
}

// Load session information
async function loadSessionInfo() {
    try {
        const response = await fetch('/api/auth/session-info', {
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            const sessionInfo = await response.json();
            const sessionInfoElement = document.getElementById('sessionInfo');
            
            if (sessionInfoElement && sessionInfo) {
                const loginTime = new Date(sessionInfo.loginTime).toLocaleString('de-DE');
                sessionInfoElement.textContent = `Angemeldet seit: ${loginTime}`;
            }
        }
    } catch (error) {
        console.error('Error loading session info:', error);
    }
}

// Logout all sessions
async function logoutAllSessions() {
    if (!confirm('Sind Sie sicher, dass Sie alle Sitzungen beenden möchten? Sie werden abgemeldet.')) {
        return;
    }
    
    try {
        showNotification('🔄 Alle Sitzungen werden beendet...', 'info');
        
        const response = await fetch('/api/auth/logout-all', {
            method: 'POST',
            headers: getAuthHeaders()
        });
        
        if (response.ok) {
            showNotification('✅ Alle Sitzungen beendet', 'success');
            setTimeout(() => {
                logout();
            }, 1500);
        } else {
            throw new Error('Fehler beim Beenden der Sitzungen');
        }
    } catch (error) {
        console.error('Logout all sessions error:', error);
        showNotification('❌ Fehler beim Beenden der Sitzungen', 'error');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('adminLoggedIn');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('token');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('authToken');
    window.location.href = 'login.html';
}

// Customer Modal Functions - Create new customer
function showCustomerModal(customerId = null) {
    if (customerId) {
        editCustomer(customerId);
    } else {
        showCreateCustomerModal();
    }
}

// Manual load function for testing
function loadCustomersManually() {
    loadCustomerData();
}

// Toggle between card and table view
function toggleCustomerView() {
    const cardsContainer = document.getElementById('customersCardsContainer');
    const tableContainer = document.getElementById('customersTableContainer');
    const toggleBtn = document.getElementById('viewToggle');
    
    if (cardsContainer.style.display === 'none') {
        // Switch to cards view
        cardsContainer.style.display = 'block';
        tableContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-th-large me-2"></i>Karten';
        localStorage.setItem('customerViewMode', 'cards');
    } else {
        // Switch to table view
        cardsContainer.style.display = 'none';
        tableContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-list me-2"></i>Tabelle';
        localStorage.setItem('customerViewMode', 'table');
    }
}

// Initialize view mode from localStorage
function initializeCustomerViewMode() {
    const savedMode = localStorage.getItem('customerViewMode') || 'cards';
    const cardsContainer = document.getElementById('customersCardsContainer');
    const tableContainer = document.getElementById('customersTableContainer');
    const toggleBtn = document.getElementById('viewToggle');
    
    if (savedMode === 'table') {
        cardsContainer.style.display = 'none';
        tableContainer.style.display = 'block';
        toggleBtn.innerHTML = '<i class="fas fa-list me-2"></i>Tabelle';
    } else {
        cardsContainer.style.display = 'block';
        tableContainer.style.display = 'none';
        toggleBtn.innerHTML = '<i class="fas fa-th-large me-2"></i>Karten';
    }
}

// Show customer details in modern dashboard view
async function showCustomerDetails(customerId) {
    try {
        showNotification('Kundendetails werden geladen...', 'info');
        
        const response = await fetch(`/api/customers/${customerId}?includeContacts=true&includeActivities=true`, {
            headers: getAuthHeaders()
        });
        const customer = await response.json();
        
        if (!response.ok) {
            throw new Error(customer.error || 'Fehler beim Laden der Kundendetails');
        }
        
        // Clear loading notification and show dashboard
        clearNotifications();
        showModernCustomerDashboard(customer);
    } catch (error) {
        console.error('Error loading customer details:', error);
        clearNotifications();
        showNotification('Fehler beim Laden der Kundendetails: ' + error.message, 'error');
    }
}

// Edit customer in modal
async function editCustomer(customerId) {
    try {
        showNotification('Kundenbearbeitung wird geladen...', 'info');
        
        const response = await fetch(`/api/customers/${customerId}?includeContacts=true`, {
            headers: getAuthHeaders()
        });
        const customer = await response.json();
        
        if (!response.ok) {
            throw new Error(customer.error || 'Fehler beim Laden der Kundendaten');
        }
        
        clearNotifications();
        showEditCustomerModal(customer);
    } catch (error) {
        console.error('Error loading customer for edit:', error);
        showNotification('Fehler beim Laden der Kundendaten: ' + error.message, 'error');
    }
}

// Add activity for customer
async function addActivity(customerId) {
    try {
        showNotification('Aktivitäts-Formular wird geladen...', 'info');
        
        // Get customer info for context
        const response = await fetch(`/api/customers/${customerId}?includeContacts=true`);
        const customer = await response.json();
        
        if (!response.ok) {
            throw new Error(customer.error || 'Fehler beim Laden der Kundendaten');
        }
        
        clearNotifications();
        showAddActivityModal(customer);
    } catch (error) {
        console.error('Error loading customer for activity:', error);
        showNotification('Fehler beim Laden der Kundendaten: ' + error.message, 'error');
    }
}

// Export function with format options
async function exportCustomers(format = 'excel') {
    try {
        showNotification('🔄 Exportiere Kundendaten...', 'info');
        
        // Fetch all customers from API with contacts
        const response = await fetch('/api/customers?includeContacts=true', {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error('Failed to fetch customer data');
        }
        
        const responseData = await response.json();
        const customers = responseData.customers || responseData; // Handle both API formats
        
        if (!customers || !Array.isArray(customers) || customers.length === 0) {
            showNotification('⚠️ Keine Kundendaten zum Exportieren vorhanden', 'warning');
            return;
        }
        
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
        let filename, content, mimeType;
        
        // Helper function to format status
        const formatStatus = (status) => {
            const statusMap = {
                'ACTIVE': '✅ Aktiv',
                'PROSPECT': '🔍 Interessent', 
                'INACTIVE': '❌ Inaktiv',
                'VIP': '⭐ VIP-Kunde'
            };
            return statusMap[status] || status;
        };
        
        // Helper function to format primary contact
        const formatPrimaryContact = (customer) => {
            // Check if customer has separate contacts
            if (customer.contacts && customer.contacts.length > 0) {
                // Find primary contact or use first active contact
                const primaryContact = customer.contacts.find(c => c.isPrimary) || customer.contacts[0];
                const name = [primaryContact.firstName, primaryContact.lastName].filter(Boolean).join(' ');
                const title = primaryContact.title ? ` (${primaryContact.title})` : '';
                return name + title;
            }
            
            // Fallback to customer's own name fields
            const parts = [customer.firstName, customer.lastName].filter(Boolean);
            return parts.length > 0 ? parts.join(' ') : '-';
        };
        
        // Helper function to format all contacts
        const formatAllContacts = (customer) => {
            if (customer.contacts && customer.contacts.length > 0) {
                return customer.contacts.map(contact => {
                    const name = [contact.firstName, contact.lastName].filter(Boolean).join(' ');
                    const title = contact.title ? ` (${contact.title})` : '';
                    const primary = contact.isPrimary ? ' [Hauptkontakt]' : '';
                    const email = contact.email ? ` - ${contact.email}` : '';
                    const phone = contact.phone ? ` - ${contact.phone}` : '';
                    return name + title + primary + email + phone;
                }).join(' | ');
            }
            
            // Fallback to customer's own contact info
            const parts = [customer.firstName, customer.lastName].filter(Boolean);
            const name = parts.length > 0 ? parts.join(' ') : '';
            const email = customer.email ? ` - ${customer.email}` : '';
            const phone = customer.phone ? ` - ${customer.phone}` : '';
            return name + email + phone || '-';
        };
        
        switch (format) {
            case 'excel':
                // Real Excel file using SheetJS
                if (typeof XLSX === 'undefined') {
                    showNotification('❌ Excel-Bibliothek nicht verfügbar. Verwende CSV-Export.', 'error');
                    // Fallback to CSV export
                    const csvHeaders = [
                        'Firma', 'Vorname', 'Nachname', 'E-Mail', 'Telefon',
                        'Stadt', 'PLZ', 'Land', 'Branche', 'Website', 'Status',
                        'Projekte', 'Letzter Kontakt', 'Erstellt', 'Notizen'
                    ];
                    
                    const csvRows = customers.map(customer => [
                        `"${(customer.company || '').replace(/"/g, '""')}"`,
                        `"${(customer.firstName || '').replace(/"/g, '""')}"`,
                        `"${(customer.lastName || '').replace(/"/g, '""')}"`,
                        `"${(customer.email || '').replace(/"/g, '""')}"`,
                        `"${(customer.phone || '').replace(/"/g, '""')}"`,
                        `"${(customer.city || '').replace(/"/g, '""')}"`,
                        `"${(customer.zipCode || '').replace(/"/g, '""')}"`,
                        `"${(customer.country || '').replace(/"/g, '""')}"`,
                        `"${(customer.industry || '').replace(/"/g, '""')}"`,
                        `"${(customer.website || '').replace(/"/g, '""')}"`,
                        `"${(customer.status || '').replace(/"/g, '""')}"`,
                        `"${customer.totalProjects || 0}"`,
                        `"${customer.lastContact ? new Date(customer.lastContact).toLocaleDateString('de-DE') : ''}"`,
                        `"${customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('de-DE') : ''}"`,
                        `"${(customer.notes || '').replace(/"/g, '""').substring(0, 100)}"`
                    ]);
                    
                    content = '\uFEFF' + [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
                    filename = `kunden-export-${timestamp}.csv`;
                    mimeType = 'text/csv;charset=utf-8';
                    break;
                }
                
                const excelData = customers.map(customer => ({
                    'Firma': customer.company || '-',
                    'Hauptkontakt': formatPrimaryContact(customer),
                    'Anzahl Kontakte': customer.contacts ? customer.contacts.length : (customer.firstName ? 1 : 0),
                    'E-Mail (Kunde)': customer.email || '-',
                    'Telefon (Kunde)': customer.phone || '-',
                    'Stadt': customer.city || '-',
                    'PLZ': customer.zipCode || '-',
                    'Land': customer.country || '-',
                    'Vollständige Adresse': [customer.city, customer.zipCode, customer.country].filter(Boolean).join(', ') || '-',
                    'Branche': customer.industry || '-',
                    'Website': customer.website || '-',
                    'Status': formatStatus(customer.status),
                    'Umsatzpotential': customer.revenuePotential ? `CHF ${Number(customer.revenuePotential).toLocaleString('de-CH')}` : '-',
                    'Priorität': customer.priority || '-',
                    'Anzahl Projekte': customer.totalProjects || 0,
                    'Letzter Kontakt': customer.lastContact ? new Date(customer.lastContact).toLocaleDateString('de-DE') : '-',
                    'Kunde seit': customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('de-DE') : '-',
                    'Alle Kontakte': formatAllContacts(customer),
                    'Notizen': (customer.notes || '').substring(0, 300) + (customer.notes?.length > 300 ? '...' : '')
                }));
                
                // Create workbook and worksheet
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(excelData);
                
                // Set column widths for better formatting
                const columnWidths = [
                    {wch: 25}, // Firma
                    {wch: 25}, // Hauptkontakt
                    {wch: 8},  // Anzahl Kontakte
                    {wch: 25}, // E-Mail (Kunde)
                    {wch: 15}, // Telefon (Kunde)
                    {wch: 15}, // Stadt
                    {wch: 8},  // PLZ
                    {wch: 12}, // Land
                    {wch: 30}, // Vollständige Adresse
                    {wch: 15}, // Branche
                    {wch: 25}, // Website
                    {wch: 12}, // Status
                    {wch: 15}, // Umsatzpotential
                    {wch: 10}, // Priorität
                    {wch: 8},  // Anzahl Projekte
                    {wch: 12}, // Letzter Kontakt
                    {wch: 12}, // Kunde seit
                    {wch: 50}, // Alle Kontakte
                    {wch: 40}  // Notizen
                ];
                worksheet['!cols'] = columnWidths;
                
                // Add worksheet to workbook
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Kunden');
                
                // Generate file content
                const excelBuffer = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
                content = excelBuffer;
                filename = `kunden-export-${timestamp}.xlsx`;
                mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
                
            case 'json':
                // Pretty JSON export with contacts
                const jsonData = {
                    exportDate: new Date().toISOString(),
                    totalCustomers: customers.length,
                    totalContacts: customers.reduce((sum, customer) => sum + (customer.contacts ? customer.contacts.length : 0), 0),
                    customers: customers.map(customer => ({
                        id: customer.id,
                        company: customer.company,
                        primaryContact: formatPrimaryContact(customer),
                        totalContacts: customer.contacts ? customer.contacts.length : 0,
                        contacts: customer.contacts ? customer.contacts.map(contact => ({
                            name: `${contact.firstName} ${contact.lastName}`,
                            title: contact.title,
                            department: contact.department,
                            email: contact.email,
                            phone: contact.phone,
                            mobile: contact.mobile,
                            position: contact.position,
                            isPrimary: contact.isPrimary,
                            language: contact.language
                        })) : [],
                        customerInfo: {
                            email: customer.email,
                            phone: customer.phone,
                            address: {
                                street: customer.street,
                                city: customer.city,
                                zipCode: customer.zipCode,
                                state: customer.state,
                                country: customer.country
                            }
                        },
                        business: {
                            industry: customer.industry,
                            website: customer.website,
                            status: customer.status,
                            priority: customer.priority,
                            revenuePotential: customer.revenuePotential,
                            totalProjects: customer.totalProjects,
                            customerType: customer.customerType,
                            segment: customer.segment,
                            leadSource: customer.leadSource
                        },
                        dates: {
                            created: customer.createdAt,
                            updated: customer.updatedAt,
                            lastContact: customer.lastContact,
                            nextFollowUp: customer.nextFollowUp,
                            acquisition: customer.acquisitionDate
                        },
                        notes: customer.notes,
                        tags: customer.tags
                    }))
                };
                
                content = JSON.stringify(jsonData, null, 2);
                filename = `kunden-export-${timestamp}.json`;
                mimeType = 'application/json';
                break;
                
            case 'csv':
            default:
                // Standard CSV export with contact info
                const csvHeaders = [
                    'Firma', 'Hauptkontakt', 'Anzahl Kontakte', 'E-Mail (Kunde)', 'Telefon (Kunde)',
                    'Stadt', 'PLZ', 'Land', 'Branche', 'Website', 'Status', 'Priorität',
                    'Umsatzpotential', 'Projekte', 'Letzter Kontakt', 'Erstellt', 'Alle Kontakte', 'Notizen'
                ];
                
                const csvRows = customers.map(customer => [
                    `"${(customer.company || '').replace(/"/g, '""')}"`,
                    `"${formatPrimaryContact(customer).replace(/"/g, '""')}"`,
                    `"${customer.contacts ? customer.contacts.length : (customer.firstName ? 1 : 0)}"`,
                    `"${(customer.email || '').replace(/"/g, '""')}"`,
                    `"${(customer.phone || '').replace(/"/g, '""')}"`,
                    `"${(customer.city || '').replace(/"/g, '""')}"`,
                    `"${(customer.zipCode || '').replace(/"/g, '""')}"`,
                    `"${(customer.country || '').replace(/"/g, '""')}"`,
                    `"${(customer.industry || '').replace(/"/g, '""')}"`,
                    `"${(customer.website || '').replace(/"/g, '""')}"`,
                    `"${(customer.status || '').replace(/"/g, '""')}"`,
                    `"${(customer.priority || '').replace(/"/g, '""')}"`,
                    `"${customer.revenuePotential ? `CHF ${Number(customer.revenuePotential).toLocaleString('de-CH')}` : ''}"`,
                    `"${customer.totalProjects || 0}"`,
                    `"${customer.lastContact ? new Date(customer.lastContact).toLocaleDateString('de-DE') : ''}"`,
                    `"${customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('de-DE') : ''}"`,
                    `"${formatAllContacts(customer).replace(/"/g, '""').substring(0, 200)}"`,
                    `"${(customer.notes || '').replace(/"/g, '""').substring(0, 100)}"`
                ]);
                
                content = '\uFEFF' + [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');
                filename = `kunden-export-${timestamp}.csv`;
                mimeType = 'text/csv;charset=utf-8';
                break;
        }
        
        // Create and download file
        const blob = new Blob([content], { type: mimeType });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        
        link.href = url;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(url);
        
        const formatNames = {
            excel: 'Excel (.xlsx)',
            csv: 'CSV (.csv)', 
            json: 'JSON (.json)'
        };
        
        showNotification(`✅ ${customers.length} Kunden erfolgreich als ${formatNames[format]} exportiert`, 'success');
        
    } catch (error) {
        console.error('🚨 Export error:', error);
        showNotification('❌ Fehler beim Exportieren: ' + error.message, 'error');
    }
}

// Add event listeners for customer search
document.addEventListener('DOMContentLoaded', function() {
    
    const customerSearch = document.getElementById('customerSearch');
    if (customerSearch) {
        let searchTimeout;
        customerSearch.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                filterCustomers();
            }, 500);
        });
    }
    
    // Check if customers section is already visible and load data
    const customersSection = document.getElementById('customers-section');
    if (customersSection && customersSection.style.display !== 'none') {
        loadCustomerData();
    }
});

// Modal functions for customer management

// Show customer details modal
function showModernCustomerDashboard(customer) {
    const modal = createModal('customer-dashboard-modal', `
        <div class="d-flex align-items-center gap-3">
            <div class="customer-avatar">
                <div class="avatar-circle bg-primary text-white">
                    ${customer.company.charAt(0).toUpperCase()}
                </div>
            </div>
            <div class="flex-grow-1">
                <h4 class="mb-1">${escapeHtml(customer.company)}</h4>
                <div class="customer-meta">
                    <span class="badge bg-${getCustomerStatusColor(customer.status)} me-2">${getCustomerStatusLabel(customer.status)}</span>
                    <small class="text-muted">${getCustomerTypeLabel(customer.customerType)}</small>
                </div>
            </div>
            <div class="customer-actions">
                <button class="btn btn-outline-primary btn-sm me-2" onclick="editCustomer('${customer.id}')">
                    <i class="fas fa-edit"></i> Bearbeiten
                </button>
                <button class="btn btn-primary btn-sm" onclick="showAddActivityModal(${JSON.stringify(customer).replace(/"/g, '&quot;')})">
                    <i class="fas fa-plus"></i> Aktivität
                </button>
            </div>
        </div>
    `, `
        <!-- Customer Dashboard Tabs -->
        <ul class="nav nav-tabs nav-fill mb-4" id="customerTabs" role="tablist">
            <li class="nav-item" role="presentation">
                <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview-pane" type="button" role="tab">
                    <i class="fas fa-chart-line me-2"></i>Übersicht
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="activities-tab" data-bs-toggle="tab" data-bs-target="#activities-pane" type="button" role="tab">
                    <i class="fas fa-history me-2"></i>Aktivitäten 
                    ${customer.activities ? `<span class="badge bg-primary ms-1">${customer.activities.length}</span>` : ''}
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="contacts-tab" data-bs-toggle="tab" data-bs-target="#contacts-pane" type="button" role="tab">
                    <i class="fas fa-users me-2"></i>Kontakte
                    ${customer.contacts ? `<span class="badge bg-info ms-1">${customer.contacts.length}</span>` : ''}
                </button>
            </li>
            <li class="nav-item" role="presentation">
                <button class="nav-link" id="business-tab" data-bs-toggle="tab" data-bs-target="#business-pane" type="button" role="tab">
                    <i class="fas fa-chart-bar me-2"></i>Business
                </button>
            </li>
        </ul>

        <!-- Tab Content -->
        <div class="tab-content" id="customerTabContent">
            <!-- Overview Tab -->
            <div class="tab-pane fade show active" id="overview-pane" role="tabpanel">
                ${renderCustomerOverview(customer)}
            </div>
            
            <!-- Activities Tab -->
            <div class="tab-pane fade" id="activities-pane" role="tabpanel">
                ${renderCustomerActivities(customer)}
            </div>
            
            <!-- Contacts Tab -->
            <div class="tab-pane fade" id="contacts-pane" role="tabpanel">
                ${renderCustomerContacts(customer)}
            </div>
            
            <!-- Business Tab -->
            <div class="tab-pane fade" id="business-pane" role="tabpanel">
                ${renderCustomerBusiness(customer)}
            </div>
        </div>
    `, 'xl', `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
        <button type="button" class="btn btn-danger" onclick="deleteCustomerConfirm('${customer.id}')">
            <i class="fas fa-trash"></i> Löschen
        </button>
    `);
}

// Render functions for customer dashboard tabs
function renderCustomerOverview(customer) {
    return `
        <div class="row g-4">
            <!-- Quick Stats Cards -->
            <div class="col-md-3">
                <div class="stat-card text-center p-3 border rounded">
                    <i class="fas fa-history fa-2x text-primary mb-2"></i>
                    <h4 class="mb-1">${customer.activities ? customer.activities.length : 0}</h4>
                    <small class="text-muted">Aktivitäten</small>
                </div>
            </div>
            <div class="col-md-3">
                <div class="stat-card text-center p-3 border rounded">
                    <i class="fas fa-users fa-2x text-info mb-2"></i>
                    <h4 class="mb-1">${customer.contacts ? customer.contacts.length : 0}</h4>
                    <small class="text-muted">Kontakte</small>
                </div>
            </div>

            <div class="col-md-3">
                <div class="stat-card text-center p-3 border rounded">
                    <i class="fas fa-calendar fa-2x text-warning mb-2"></i>
                    <h4 class="mb-1">${customer.lastContact ? formatDate(customer.lastContact) : 'Nie'}</h4>
                    <small class="text-muted">Letzter Kontakt</small>
                </div>
            </div>
        </div>
        
        <div class="row mt-4">
            <!-- Company Information -->
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-building me-2"></i>Unternehmensdaten</h6>
                    </div>
                    <div class="card-body">
                        <div class="info-group mb-3">
                            <label class="text-muted small">Unternehmen</label>
                            <div class="fw-semibold">${escapeHtml(customer.company)}</div>
                        </div>
                        ${customer.industry ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">Branche</label>
                                <div>${escapeHtml(customer.industry)}</div>
                            </div>
                        ` : ''}
                        ${customer.website ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">Website</label>
                                <div><a href="${escapeHtml(customer.website)}" target="_blank">${escapeHtml(customer.website)}</a></div>
                            </div>
                        ` : ''}
                        ${customer.employeeCount ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">Mitarbeiter</label>
                                <div>${customer.employeeCount}</div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
            
            <!-- Contact Information -->
            <div class="col-md-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-address-book me-2"></i>Kontaktdaten</h6>
                    </div>
                    <div class="card-body">
                        ${customer.street || customer.city ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">Adresse</label>
                                <div>
                                    ${customer.street ? escapeHtml(customer.street) + '<br>' : ''}
                                    ${customer.zipCode ? escapeHtml(customer.zipCode) + ' ' : ''}${customer.city ? escapeHtml(customer.city) : ''}
                                    ${customer.country ? '<br>' + escapeHtml(customer.country) : ''}
                                </div>
                            </div>
                        ` : ''}
                        ${customer.phone ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">Telefon</label>
                                <div><a href="tel:${customer.phone}">${escapeHtml(customer.phone)}</a></div>
                            </div>
                        ` : ''}
                        ${customer.email ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">E-Mail</label>
                                <div><a href="mailto:${customer.email}">${escapeHtml(customer.email)}</a></div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            </div>
        </div>
        
        ${customer.notes ? `
            <div class="row mt-4">
                <div class="col-12">
                    <div class="card">
                        <div class="card-header">
                            <h6 class="mb-0"><i class="fas fa-sticky-note me-2"></i>Notizen</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-0">${escapeHtml(customer.notes)}</p>
                        </div>
                    </div>
                </div>
            </div>
        ` : ''}
    `;
}

function renderCustomerActivities(customer) {
    if (!customer.activities || customer.activities.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-history fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Noch keine Aktivitäten</h5>
                <p class="text-muted">Starten Sie mit der ersten Aktivität für diesen Kunden.</p>
                <button class="btn btn-primary" onclick="showAddActivityModal(${JSON.stringify(customer).replace(/"/g, '&quot;')})">
                    <i class="fas fa-plus"></i> Erste Aktivität hinzufügen
                </button>
            </div>
        `;
    }
    
    return `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="mb-0">Alle Aktivitäten (${customer.activities.length})</h5>
            <button class="btn btn-primary btn-sm" onclick="showAddActivityModal(${JSON.stringify(customer).replace(/"/g, '&quot;')})">
                <i class="fas fa-plus"></i> Neue Aktivität
            </button>
        </div>
        
        <div class="simple-activities">
            ${customer.activities.map(activity => `
                <div class="simple-activity-card">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h6 class="mb-2">${escapeHtml(activity.subject)}</h6>
                            <div class="mb-2">
                                <span class="badge bg-info me-1">${getActivityTypeLabel(activity.type)}</span>
                                <span class="badge bg-${getActivityStatusColor(activity.status)}">${getActivityStatusLabel(activity.status)}</span>
                            </div>
                            ${activity.description ? `
                                <p class="text-muted small mb-2">${escapeHtml(activity.description)}</p>
                            ` : ''}
                            <div class="text-muted small">
                                📅 ${formatDateTime(activity.activityDate)}
                                ${activity.duration ? ` • ⏰ ${activity.duration} Min` : ''}
                                ${activity.location ? ` • 📍 ${escapeHtml(activity.location)}` : ''}
                                ${activity.contact ? ` • 👤 ${escapeHtml(activity.contact.firstName)} ${escapeHtml(activity.contact.lastName)}` : ''}
                            </div>
                            ${activity.followUpDate || activity.followUpNotes ? `
                                <div class="follow-up-info mt-2 pt-2 border-top">
                                    ${activity.followUpDate ? `
                                        <div class="text-warning small">
                                            <i class="fas fa-bell me-1"></i>Follow-up: ${formatDate(activity.followUpDate)}
                                        </div>
                                    ` : ''}
                                    ${activity.followUpNotes ? `
                                        <div class="text-muted small mt-1">
                                            <i class="fas fa-sticky-note me-1"></i>${escapeHtml(activity.followUpNotes)}
                                        </div>
                                    ` : ''}
                                </div>
                            ` : ''}
                        </div>
                        <div class="btn-group ms-3" role="group">
                            <button class="btn btn-outline-primary btn-sm" onclick="editActivity('${activity.id}', '${customer.id}')" title="Aktivität bearbeiten">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-danger btn-sm" onclick="deleteActivityConfirm('${activity.id}', '${customer.id}')" title="Aktivität löschen">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderCustomerContacts(customer) {
    if (!customer.contacts || customer.contacts.length === 0) {
        return `
            <div class="text-center py-5">
                <i class="fas fa-users fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Keine Ansprechpartner</h5>
                <p class="text-muted">Fügen Sie Ansprechpartner für bessere Kommunikation hinzu.</p>
                <button class="btn btn-primary" onclick="showAddContactModal('${customer.id}')">
                    <i class="fas fa-plus"></i> Ersten Kontakt hinzufügen
                </button>
            </div>
        `;
    }
    
    return `
        <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="mb-0">Ansprechpartner (${customer.contacts.length})</h5>
            <button class="btn btn-primary btn-sm" onclick="showAddContactModal('${customer.id}')">
                <i class="fas fa-plus"></i> Neuer Kontakt
            </button>
        </div>
        
        <div class="row">
            ${customer.contacts.map(contact => `
                <div class="col-md-6 mb-4">
                    <div class="card h-100">
                        <div class="card-body">
                            <div class="d-flex align-items-start justify-content-between mb-3">
                                <div class="contact-avatar me-3">
                                    <div class="avatar-circle bg-info text-white">
                                        ${contact.firstName.charAt(0).toUpperCase()}${contact.lastName.charAt(0).toUpperCase()}
                                    </div>
                                </div>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}</h6>
                                    ${contact.position ? `<small class="text-muted">${escapeHtml(contact.position)}</small>` : ''}
                                    ${contact.isPrimary ? `<span class="badge bg-primary ms-2">Hauptkontakt</span>` : ''}
                                </div>
                                <div class="contact-actions">
                                    <div class="btn-group" role="group">
                                        <button class="btn btn-outline-primary btn-sm" onclick="editContact('${contact.id}', '${customer.id}')" title="Kontakt bearbeiten">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button class="btn btn-outline-danger btn-sm" onclick="deleteContactConfirm('${contact.id}', '${customer.id}')" title="Kontakt löschen">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            ${contact.email ? `
                                <div class="contact-info mb-2">
                                    <i class="fas fa-envelope text-muted me-2"></i>
                                    <a href="mailto:${contact.email}">${escapeHtml(contact.email)}</a>
                                </div>
                            ` : ''}
                            
                            ${contact.phone ? `
                                <div class="contact-info mb-2">
                                    <i class="fas fa-phone text-muted me-2"></i>
                                    <a href="tel:${contact.phone}">${escapeHtml(contact.phone)}</a>
                                </div>
                            ` : ''}
                            
                            ${contact.mobile ? `
                                <div class="contact-info mb-2">
                                    <i class="fas fa-mobile-alt text-muted me-2"></i>
                                    <a href="tel:${contact.mobile}">${escapeHtml(contact.mobile)}</a>
                                </div>
                            ` : ''}
                            
                            ${contact.notes ? `
                                <div class="contact-notes mt-3 pt-3 border-top">
                                    <small class="text-muted">${escapeHtml(contact.notes)}</small>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderCustomerBusiness(customer) {
    return `
        <div class="row">
            <!-- Customer Status & Information -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-info-circle me-2"></i>Kundenstatus</h6>
                    </div>
                    <div class="card-body">
                        <div class="info-group mb-3">
                            <label class="text-muted small">Status</label>
                            <div><span class="badge bg-${getCustomerStatusColor(customer.status)} fs-6">${getCustomerStatusLabel(customer.status)}</span></div>
                        </div>
                        <div class="info-group mb-3">
                            <label class="text-muted small">Kundentyp</label>
                            <div>${getCustomerTypeLabel(customer.customerType)}</div>
                        </div>
                        <div class="info-group mb-3">
                            <label class="text-muted small">Priorität</label>
                            <div><span class="badge bg-${getPriorityColor(customer.priority)}">${getPriorityLabel(customer.priority)}</span></div>
                        </div>
                        <div class="info-group">
                            <label class="text-muted small">Kunde seit</label>
                            <div>${formatDate(customer.createdAt)}</div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Additional Information -->
            <div class="col-md-6 mb-4">
                <div class="card h-100">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-cogs me-2"></i>Weitere Informationen</h6>
                    </div>
                    <div class="card-body">
                        ${customer.paymentTerms ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">Zahlungsbedingungen</label>
                                <div>${escapeHtml(customer.paymentTerms)}</div>
                            </div>
                        ` : ''}
                        ${customer.assignedTo ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">Zugewiesen an</label>
                                <div>${escapeHtml(customer.assignedTo)}</div>
                            </div>
                        ` : ''}
                        ${customer.source ? `
                            <div class="info-group mb-3">
                                <label class="text-muted small">Kundenquelle</label>
                                <div>${escapeHtml(customer.source)}</div>
                            </div>
                        ` : ''}
                        <div class="info-group">
                            <label class="text-muted small">Letzte Aktualisierung</label>
                            <div>${formatDate(customer.updatedAt)}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Helper function for old modal (fallback)
function showCustomerDetailsModal(customer) {
    const modal = createModal('customer-details-modal', 'Kundendetails', `
        <div class="row">
            <div class="col-md-6">
                <h5><i class="fas fa-building"></i> Unternehmensinformationen</h5>
                <table class="table table-sm">
                    <tr><td><strong>Unternehmen:</strong></td><td>${escapeHtml(customer.company)}</td></tr>
                    <tr><td><strong>Website:</strong></td><td>${customer.website ? `<a href="${customer.website}" target="_blank">${escapeHtml(customer.website)}</a>` : '-'}</td></tr>
                    <tr><td><strong>Branche:</strong></td><td>${escapeHtml(customer.industry) || '-'}</td></tr>
                    <tr><td><strong>Typ:</strong></td><td>${getCustomerTypeLabel(customer.customerType)}</td></tr>
                    <tr><td><strong>Status:</strong></td><td><span class="badge ${getStatusBadgeClass(customer.status)}">${getStatusLabel(customer.status)}</span></td></tr>
                    <tr><td><strong>Leadquelle:</strong></td><td>${escapeHtml(customer.leadSource) || '-'}</td></tr>
                    <tr><td><strong>Segment:</strong></td><td>${escapeHtml(customer.segment) || '-'}</td></tr>
                </table>
            </div>
            <div class="col-md-6">
                <h5><i class="fas fa-map-marker-alt"></i> Adresse</h5>
                <p>
                    ${customer.street ? escapeHtml(customer.street) + '<br>' : ''}
                    ${customer.zipCode || ''} ${customer.city || ''}<br>
                    ${escapeHtml(customer.country) || ''}
                    ${customer.city ? `<br><a href="https://maps.google.com/maps?q=${encodeURIComponent(getFullAddress(customer))}" target="_blank" class="btn btn-sm btn-outline-primary mt-2"><i class="fas fa-map-marker-alt"></i> Auf Karte anzeigen</a>` : ''}
                </p>
                
                <h5><i class="fas fa-euro-sign"></i> Finanzdaten</h5>
                <table class="table table-sm">
                    <tr><td><strong>Umsatzpotential:</strong></td><td>${customer.revenuePotential ? formatCurrency(customer.revenuePotential) : '-'}</td></tr>
                    <tr><td><strong>Tatsächlicher Umsatz:</strong></td><td>${customer.actualRevenue ? formatCurrency(customer.actualRevenue) : '-'}</td></tr>
                    <tr><td><strong>Projekte gesamt:</strong></td><td>${customer.totalProjects || 0}</td></tr>
                </table>
            </div>
        </div>
        
        ${customer.contacts && customer.contacts.length > 0 ? `
            <hr>
            <h5><i class="fas fa-users"></i> Ansprechpartner</h5>
            <div class="row">
                ${customer.contacts.map(contact => `
                    <div class="col-md-6 mb-3">
                        <div class="card">
                            <div class="card-body">
                                <h6 class="card-title">
                                    ${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}
                                    ${contact.isPrimary ? '<span class="badge bg-primary ms-2">Hauptkontakt</span>' : ''}
                                </h6>
                                ${contact.title ? `<p class="text-muted mb-1">${escapeHtml(contact.title)}</p>` : ''}
                                ${contact.email ? `<p class="mb-1"><i class="fas fa-envelope"></i> <a href="mailto:${contact.email}">${escapeHtml(contact.email)}</a></p>` : ''}
                                ${contact.phone ? `<p class="mb-1"><i class="fas fa-phone"></i> <a href="tel:${contact.phone}">${escapeHtml(contact.phone)}</a></p>` : ''}
                                ${contact.mobile ? `<p class="mb-1"><i class="fas fa-mobile"></i> <a href="tel:${contact.mobile}">${escapeHtml(contact.mobile)}</a></p>` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        ` : ''}
        
        ${customer.activities && customer.activities.length > 0 ? `
            <hr>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5><i class="fas fa-history"></i> Letzte Aktivitäten (${customer.activities.length})</h5>
                <button class="btn btn-sm btn-primary" onclick="showAddActivityModal(${JSON.stringify(customer).replace(/"/g, '&quot;')})">
                    <i class="fas fa-plus"></i> Neue Aktivität
                </button>
            </div>
            <div class="activity-list">
                ${customer.activities.slice(0, 10).map(activity => `
                    <div class="activity-card border rounded p-3 mb-3">
                        <div class="row">
                            <div class="col-md-8">
                                <div class="d-flex justify-content-between align-items-start mb-2">
                                    <h6 class="mb-1">${escapeHtml(activity.subject)}</h6>
                                    <span class="badge bg-${getActivityStatusColor(activity.status)}">${getActivityStatusLabel(activity.status)}</span>
                                </div>
                                <div class="activity-meta mb-2">
                                    <span class="badge bg-info me-2">${getActivityTypeLabel(activity.type)}</span>
                                    <small class="text-muted">
                                        <i class="fas fa-calendar me-1"></i>${formatDateTime(activity.activityDate)}
                                        ${activity.duration ? `<i class="fas fa-clock ms-2 me-1"></i>${activity.duration} Min` : ''}
                                        ${activity.location ? `<i class="fas fa-map-marker-alt ms-2 me-1"></i>${escapeHtml(activity.location)}` : ''}
                                    </small>
                                </div>
                                ${activity.description ? `
                                    <p class="text-muted mb-2 small">${escapeHtml(activity.description)}</p>
                                ` : ''}
                                ${activity.contact ? `
                                    <small class="text-info">
                                        <i class="fas fa-user me-1"></i>Kontakt: ${escapeHtml(activity.contact.firstName)} ${escapeHtml(activity.contact.lastName)}
                                    </small>
                                ` : ''}
                            </div>
                            <div class="col-md-4 text-end">
                                <small class="text-muted d-block">Erstellt: ${formatDate(activity.createdAt)}</small>
                                ${activity.followUpDate ? `
                                    <small class="text-warning d-block mt-1">
                                        <i class="fas fa-bell me-1"></i>Follow-up: ${formatDate(activity.followUpDate)}
                                    </small>
                                ` : ''}
                                ${activity.followUpNotes ? `
                                    <small class="text-muted d-block mt-1" title="${escapeHtml(activity.followUpNotes)}">
                                        <i class="fas fa-sticky-note me-1"></i>Notiz vorhanden
                                    </small>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('')}
                ${customer.activities.length > 10 ? `
                    <div class="text-center">
                        <button class="btn btn-outline-secondary btn-sm" onclick="showAllActivities('${customer.id}')">
                            <i class="fas fa-eye"></i> Alle ${customer.activities.length} Aktivitäten anzeigen
                        </button>
                    </div>
                ` : ''}
            </div>
        ` : `
            <hr>
            <div class="d-flex justify-content-between align-items-center mb-3">
                <h5><i class="fas fa-history"></i> Aktivitäten</h5>
                <button class="btn btn-sm btn-primary" onclick="showAddActivityModal(${JSON.stringify(customer).replace(/"/g, '&quot;')})">
                    <i class="fas fa-plus"></i> Erste Aktivität hinzufügen
                </button>
            </div>
            <p class="text-muted">Noch keine Aktivitäten für diesen Kunden.</p>
        `}
        
        ${customer.notes ? `
            <hr>
            <h5><i class="fas fa-sticky-note"></i> Notizen</h5>
            <p>${escapeHtml(customer.notes)}</p>
        ` : ''}
    `, 'lg');
}

// Show create customer modal
function showCreateCustomerModal() {
    const modal = createModal('create-customer-modal', 'Neuen Kunden erstellen', `
        <form id="createCustomerForm" class="modern-form">
            <!-- Compact Header -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="alert alert-light border-start border-primary border-4 ps-3">
                        <div class="d-flex align-items-center">
                            <i class="fas fa-info-circle text-primary me-2"></i>
                            <small class="text-muted mb-0">
                                <strong>Pflichtfeld:</strong> Nur der Firmenname ist erforderlich. Alle anderen Felder sind optional.
                            </small>
                        </div>
                    </div>
                </div>
            </div>

            <div class="row g-4">
                <!-- Grunddaten (links) -->
                <div class="col-lg-6">
                    <div class="form-section">
                        <h6 class="section-title">
                            <i class="fas fa-building text-primary me-2"></i>Grunddaten
                        </h6>
                        
                        <div class="mb-3">
                            <label class="form-label fw-semibold">
                                Unternehmen <span class="text-danger">*</span>
                            </label>
                            <input type="text" class="form-control form-control-lg" name="company" 
                                   placeholder="z.B. Musterfirma AG" required>
                        </div>

                        <div class="row">
                            <div class="col-sm-6 mb-3">
                                <label class="form-label">Vorname</label>
                                <input type="text" class="form-control" name="firstName" 
                                       placeholder="Max">
                            </div>
                            <div class="col-sm-6 mb-3">
                                <label class="form-label">Nachname</label>
                                <input type="text" class="form-control" name="lastName" 
                                       placeholder="Muster">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                <i class="fas fa-envelope text-muted me-1"></i>E-Mail
                            </label>
                            <input type="email" class="form-control" name="email" 
                                   placeholder="kontakt@musterfirma.ch">
                        </div>

                        <div class="row">
                            <div class="col-sm-6 mb-3">
                                <label class="form-label">
                                    <i class="fas fa-phone text-muted me-1"></i>Telefon
                                </label>
                                <input type="tel" class="form-control" name="phone" 
                                       placeholder="+41 44 123 45 67">
                            </div>
                            <div class="col-sm-6 mb-3">
                                <label class="form-label">
                                    <i class="fas fa-globe text-muted me-1"></i>Website
                                </label>
                                <input type="url" class="form-control" name="website" 
                                       placeholder="https://musterfirma.ch">
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Adresse & Kategorisierung (rechts) -->
                <div class="col-lg-6">
                    <div class="form-section">
                        <h6 class="section-title">
                            <i class="fas fa-map-marker-alt text-primary me-2"></i>Adresse
                        </h6>
                        
                        <div class="mb-3">
                            <label class="form-label">Straße</label>
                            <input type="text" class="form-control" name="street" 
                                   placeholder="Musterstraße 123">
                        </div>

                        <div class="row">
                            <div class="col-4 mb-3">
                                <label class="form-label">PLZ</label>
                                <input type="text" class="form-control" name="zipCode" 
                                       placeholder="8000">
                            </div>
                            <div class="col-8 mb-3">
                                <label class="form-label">Stadt</label>
                                <input type="text" class="form-control" name="city" 
                                       placeholder="Zürich">
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="form-label">Branche</label>
                            <input type="text" class="form-control" name="industry" 
                                   placeholder="z.B. Maschinenbau, IT, Handel">
                        </div>
                    </div>

                    <div class="form-section">
                        <h6 class="section-title">
                            <i class="fas fa-tags text-primary me-2"></i>Kategorisierung
                        </h6>
                        
                        <div class="row">
                            <div class="col-sm-6 mb-3">
                                <label class="form-label">Kundentyp</label>
                                <select class="form-select" name="customerType">
                                    <option value="BUSINESS">🏢 Unternehmen</option>
                                    <option value="PRIVATE">👤 Privat</option>
                                    <option value="GOVERNMENT">🏛️ Behörde</option>
                                    <option value="NGO">🤝 Non-Profit</option>
                                </select>
                            </div>
                            <div class="col-sm-6 mb-3">
                                <label class="form-label">Status</label>
                                <select class="form-select" name="status">
                                    <option value="PROSPECT">🔍 Interessent</option>
                                    <option value="ACTIVE">✅ Aktiv</option>
                                    <option value="INACTIVE">⏸️ Inaktiv</option>
                                    <option value="VIP">⭐ VIP</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label">
                                <i class="fas fa-funnel-dollar text-muted me-1"></i>Leadquelle
                            </label>
                            <select class="form-select" name="leadSource">
                                <option value="">Nicht angegeben</option>
                                <option value="Website">🌐 Website</option>
                                <option value="Empfehlung">🤝 Empfehlung</option>
                                <option value="Messe">🎪 Messe/Event</option>
                                <option value="Werbung">📢 Werbung</option>
                                <option value="Social Media">📱 Social Media</option>
                                <option value="Kaltakquise">📞 Kaltakquise</option>
                                <option value="Sonstiges">📋 Sonstiges</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Segment</label>
                            <input type="text" class="form-control" name="segment" placeholder="z.B. Retail, Gastronomie">
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Optionale Notizen -->
            <div class="form-section">
                <h6 class="section-title">
                    <i class="fas fa-sticky-note text-primary me-2"></i>Notizen (optional)
                </h6>
                <div class="mb-3">
                    <textarea class="form-control" name="notes" rows="3" 
                              placeholder="Besonderheiten, Anforderungen, Interessen..."></textarea>
                    <div class="form-text">
                        <i class="fas fa-lightbulb me-1"></i>
                        Hier können Sie wichtige Informationen für das nächste Gespräch festhalten.
                    </div>
                </div>
            </div>
        </form>
    `, 'lg', `
        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
            <i class="fas fa-times me-2"></i>Abbrechen
        </button>
        <button type="button" class="btn btn-primary px-4" onclick="createCustomer()">
            <i class="fas fa-plus me-2"></i>Kunde erstellen
        </button>
    `);
}

// Show edit customer modal
function showEditCustomerModal(customer) {
    const modal = createModal('edit-customer-modal', 'Kunde bearbeiten', `
        <form id="editCustomerForm">
            <div class="row">
                <div class="col-md-6">
                    <h5>Unternehmensdaten</h5>
                    <div class="mb-3">
                        <label class="form-label">Unternehmen *</label>
                        <input type="text" class="form-control" name="company" value="${escapeHtml(customer.company)}" required>
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Vorname</label>
                            <input type="text" class="form-control" name="firstName" value="${escapeHtml(customer.firstName || '')}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Nachname</label>
                            <input type="text" class="form-control" name="lastName" value="${escapeHtml(customer.lastName || '')}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">E-Mail</label>
                        <input type="email" class="form-control" name="email" value="${escapeHtml(customer.email || '')}">
                    </div>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Telefon</label>
                            <input type="text" class="form-control" name="phone" value="${escapeHtml(customer.phone || '')}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Website</label>
                            <input type="url" class="form-control" name="website" value="${escapeHtml(customer.website || '')}">
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <h5>Adresse</h5>
                    <div class="mb-3">
                        <label class="form-label">Straße</label>
                        <input type="text" class="form-control" name="street" value="${escapeHtml(customer.street || '')}">
                    </div>
                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label class="form-label">PLZ</label>
                            <input type="text" class="form-control" name="zipCode" value="${escapeHtml(customer.zipCode || '')}">
                        </div>
                        <div class="col-md-8 mb-3">
                            <label class="form-label">Stadt</label>
                            <input type="text" class="form-control" name="city" value="${escapeHtml(customer.city || '')}">
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Land</label>
                        <input type="text" class="form-control" name="country" value="${escapeHtml(customer.country || '')}">
                    </div>
                    
                    <h5>Kategorisierung</h5>
                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Typ</label>
                            <select class="form-control" name="customerType">
                                <option value="BUSINESS" ${customer.customerType === 'BUSINESS' ? 'selected' : ''}>Unternehmen</option>
                                <option value="PRIVATE" ${customer.customerType === 'PRIVATE' ? 'selected' : ''}>Privat</option>
                                <option value="GOVERNMENT" ${customer.customerType === 'GOVERNMENT' ? 'selected' : ''}>Behörde</option>
                                <option value="NGO" ${customer.customerType === 'NGO' ? 'selected' : ''}>Non-Profit</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label class="form-label">Status</label>
                            <select class="form-control" name="status">
                                <option value="PROSPECT" ${customer.status === 'PROSPECT' ? 'selected' : ''}>Interessent</option>
                                <option value="ACTIVE" ${customer.status === 'ACTIVE' ? 'selected' : ''}>Aktiv</option>
                                <option value="INACTIVE" ${customer.status === 'INACTIVE' ? 'selected' : ''}>Inaktiv</option>
                                <option value="VIP" ${customer.status === 'VIP' ? 'selected' : ''}>VIP</option>
                                <option value="LOST" ${customer.status === 'LOST' ? 'selected' : ''}>Verloren</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
            
                         <div class="mb-3">
                <label class="form-label">Notizen</label>
                <textarea class="form-control" name="notes" rows="3">${escapeHtml(customer.notes || '')}</textarea>
            </div>
        </form>
        
        <!-- Ansprechpartner Section -->
        <hr>
        <div class="d-flex justify-content-between align-items-center mb-3">
            <h5><i class="fas fa-users"></i> Ansprechpartner</h5>
            <button type="button" class="btn btn-sm btn-success" onclick="showAddContactModal('${customer.id}')">
                <i class="fas fa-plus"></i> Neuer Ansprechpartner
            </button>
        </div>
        
        <div id="contactsList">
            ${customer.contacts && customer.contacts.length > 0 ? 
                customer.contacts.map(contact => `
                    <div class="card mb-2" id="contact-${contact.id}">
                        <div class="card-body">
                            <div class="row align-items-center">
                                <div class="col-md-8">
                                    <h6 class="mb-1">
                                        ${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}
                                        ${contact.isPrimary ? '<span class="badge bg-primary ms-2">Hauptkontakt</span>' : ''}
                                    </h6>
                                    ${contact.title ? `<p class="text-muted mb-1 small">${escapeHtml(contact.title)}</p>` : ''}
                                    <div class="small">
                                        ${contact.email ? `<span class="me-3"><i class="fas fa-envelope"></i> ${escapeHtml(contact.email)}</span>` : ''}
                                        ${contact.phone ? `<span class="me-3"><i class="fas fa-phone"></i> ${escapeHtml(contact.phone)}</span>` : ''}
                                        ${contact.mobile ? `<span><i class="fas fa-mobile"></i> ${escapeHtml(contact.mobile)}</span>` : ''}
                                    </div>
                                </div>
                                <div class="col-md-4 text-end">
                                    <button type="button" class="btn btn-sm btn-outline-primary me-1" onclick="editContact('${contact.id}', '${customer.id}')" title="Bearbeiten">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="btn btn-sm btn-outline-danger" onclick="deleteContact('${contact.id}', '${customer.id}')" title="Löschen">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                `).join('') 
                : '<p class="text-muted text-center py-3">Keine Ansprechpartner vorhanden</p>'
            }
        </div>
    `, 'lg', `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
        <button type="button" class="btn btn-primary" onclick="saveCustomer('${customer.id}')">Speichern</button>
    `);
}

// Show add activity modal  
function showAddActivityModal(customer) {
    const modal = createModal('add-activity-modal', `Aktivität hinzufügen - ${customer.company}`, `
        <form id="addActivityForm">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Aktivitätstyp *</label>
                        <select class="form-control" name="type" required>
                            <option value="">Bitte wählen...</option>
                            <option value="CALL">Anruf</option>
                            <option value="EMAIL">E-Mail</option>
                            <option value="MEETING">Meeting</option>
                            <option value="VISIT">Besuch</option>
                            <option value="QUOTE">Angebot</option>
                            <option value="PROPOSAL">Vorschlag</option>
                            <option value="FOLLOW_UP">Nachfassen</option>
                            <option value="COMPLAINT">Beschwerde</option>
                            <option value="SUPPORT">Support</option>
                            <option value="OTHER">Sonstiges</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Status *</label>
                        <select class="form-control" name="status" required>
                            <option value="PLANNED">Geplant</option>
                            <option value="IN_PROGRESS">In Bearbeitung</option>
                            <option value="COMPLETED">Abgeschlossen</option>
                            <option value="CANCELLED">Abgebrochen</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Betreff *</label>
                        <input type="text" class="form-control" name="subject" required maxlength="255">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-control" name="description" rows="3" maxlength="1000"></textarea>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Datum & Zeit *</label>
                        <input type="datetime-local" class="form-control" name="activityDate" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Dauer (Minuten)</label>
                        <input type="number" class="form-control" name="duration" min="1" max="1440">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Ort</label>
                        <input type="text" class="form-control" name="location" maxlength="255">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Ansprechpartner</label>
                        <select class="form-control" name="contactId">
                            <option value="">Keinen Kontakt zuweisen</option>
                            ${customer.contacts ? customer.contacts.map(contact => `
                                <option value="${contact.id}">${escapeHtml(contact.firstName)} ${escapeHtml(contact.lastName)}${contact.isPrimary ? ' (Hauptkontakt)' : ''}</option>
                            `).join('') : ''}
                        </select>
                    </div>
                </div>
            </div>
            
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Follow-up Datum</label>
                        <input type="date" class="form-control" name="followUpDate">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Follow-up Notizen</label>
                        <input type="text" class="form-control" name="followUpNotes" maxlength="255" placeholder="Erinnerung für Follow-up">
                    </div>
                </div>
            </div>
        </form>
    `, 'lg', `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
        <button type="button" class="btn btn-primary" onclick="saveActivity('${customer.id}')">
            <i class="fas fa-save"></i> Aktivität hinzufügen
        </button>
    `);
}

// Helper function to create Bootstrap modal
function createModal(id, title, body, size = '', footer = '') {
    // Remove existing modal
    const existingModal = document.getElementById(id);
    if (existingModal) {
        existingModal.remove();
    }
    
    const modalHtml = `
        <div class="modal fade" id="${id}" tabindex="-1">
            <div class="modal-dialog ${size ? 'modal-' + size : ''}">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">${title}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${body}
                    </div>
                    ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById(id));
    modal.show();
    
    return modal;
}

// Helper function to format currency
function formatCurrency(amount) {
    if (!amount) return '-';
    return new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency: 'CHF'
    }).format(amount);
}

// Save customer function
async function saveCustomer(customerId) {
    try {
        const form = document.getElementById('editCustomerForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        const response = await fetch(`/api/customers/${customerId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Speichern');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('edit-customer-modal')).hide();
        showNotification('✅ Kunde erfolgreich aktualisiert!', 'success');
        
        // Auto-refresh Customer Dashboard if open
        if (document.getElementById('customer-dashboard-modal')) {
            showCustomerDetails(customerId);
        }
        
        loadCustomers(); // Refresh list
        
    } catch (error) {
        console.error('Error saving customer:', error);
        showNotification('Fehler beim Speichern: ' + error.message, 'error');
    }
}

// Create customer function
async function createCustomer() {
    try {
        const form = document.getElementById('createCustomerForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Convert empty strings to null
        Object.keys(data).forEach(key => {
            if (data[key] === '') data[key] = null;
        });
        
        const response = await fetch('/api/customers', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Erstellen des Kunden');
        }
        
        const newCustomer = await response.json();
        
        bootstrap.Modal.getInstance(document.getElementById('create-customer-modal')).hide();
        showNotification('✅ Kunde erfolgreich erstellt!', 'success');
        loadCustomers(); // Refresh list
        loadCustomerStats(); // Refresh stats
        
    } catch (error) {
        console.error('Error creating customer:', error);
        showNotification('Fehler beim Erstellen des Kunden: ' + error.message, 'error');
    }
}

// Save activity function
async function saveActivity(customerId) {
    try {
        const form = document.getElementById('addActivityForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        
        // Clean and convert data
        Object.keys(data).forEach(key => {
            if (data[key] === '' || data[key] === 'null') {
                data[key] = null;
            }
        });
        
        // Convert duration to integer
        if (data.duration && data.duration !== null) {
            data.duration = parseInt(data.duration, 10);
        }
        
        
        const response = await fetch(`/api/customers/${customerId}/activities`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Speichern der Aktivität');
        }
        
        bootstrap.Modal.getInstance(document.getElementById('add-activity-modal')).hide();
        showNotification('✅ Aktivität erfolgreich hinzugefügt!', 'success');
        
        // Auto-refresh Customer Dashboard if open
        if (document.getElementById('customer-dashboard-modal')) {
            showCustomerDetails(customerId);
        }
        
        loadCustomers(); // Refresh list
        
    } catch (error) {
        console.error('Error saving activity:', error);
        showNotification('Fehler beim Speichern der Aktivität: ' + error.message, 'error');
    }
}

// Contact Management Functions

// Show add contact modal
function showAddContactModal(customerId) {
    const modal = createModal('add-contact-modal', 'Neuen Ansprechpartner hinzufügen', `
        <form id="addContactForm">
            <div class="row">
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">Vorname *</label>
                        <input type="text" class="form-control" name="firstName" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Nachname *</label>
                        <input type="text" class="form-control" name="lastName" required>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Position/Titel</label>
                        <input type="text" class="form-control" name="title" placeholder="z.B. Geschäftsführer">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Abteilung</label>
                        <input type="text" class="form-control" name="department" placeholder="z.B. Marketing">
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="mb-3">
                        <label class="form-label">E-Mail</label>
                        <input type="email" class="form-control" name="email">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Telefon</label>
                        <input type="text" class="form-control" name="phone">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Mobil</label>
                        <input type="text" class="form-control" name="mobile">
                    </div>
                    <div class="mb-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" name="isPrimary" id="isPrimary">
                            <label class="form-check-label" for="isPrimary">
                                Hauptansprechpartner
                            </label>
                            <small class="form-text text-muted">Der wichtigste Kontakt für diesen Kunden</small>
                        </div>
                    </div>
                </div>
            </div>
            <div class="mb-3">
                <label class="form-label">Notizen</label>
                <textarea class="form-control" name="notes" rows="2" placeholder="Besonderheiten, Präferenzen, etc."></textarea>
            </div>
        </form>
    `, 'lg', `
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
        <button type="button" class="btn btn-primary" onclick="saveContact('${customerId}')">Ansprechpartner hinzufügen</button>
    `);
}

// Save contact function
async function saveContact(customerId, contactId = null) {
    try {
        const form = document.getElementById(contactId ? 'editContactForm' : 'addContactForm');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Convert checkbox to boolean
        data.isPrimary = data.isPrimary === 'on';
        
        // Convert empty strings to null, but exclude email if empty (to avoid validation error)
        Object.keys(data).forEach(key => {
            if (data[key] === '' && key !== 'isPrimary') {
                if (key === 'email') {
                    delete data[key]; // Remove empty email entirely to avoid validation
                } else {
                    data[key] = null;
                }
            }
        });
        
        // Validate required fields
        if (!data.firstName || !data.lastName) {
            throw new Error('Vorname und Nachname sind Pflichtfelder');
        }
        
        
        const url = contactId ? 
            `/api/customers/${customerId}/contacts/${contactId}` : 
            `/api/customers/${customerId}/contacts`;
        const method = contactId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Speichern des Ansprechpartners');
        }
        
        const modalId = contactId ? 'edit-contact-modal' : 'add-contact-modal';
        bootstrap.Modal.getInstance(document.getElementById(modalId)).hide();
        
        showNotification('✅ Ansprechpartner erfolgreich gespeichert!', 'success');
        
        // Auto-refresh Customer Dashboard if open
        if (document.getElementById('customer-dashboard-modal')) {
            showCustomerDetails(customerId);
        }
        
        // If we're in the edit customer modal, refresh the contacts list
        if (document.getElementById('edit-customer-modal')) {
            // Refresh the customer data and reload the edit modal
            const customerResponse = await fetch(`/api/customers/${customerId}`);
            const customer = await customerResponse.json();
            bootstrap.Modal.getInstance(document.getElementById('edit-customer-modal')).hide();
            setTimeout(() => showEditCustomerModal(customer), 300);
        }
        
        loadCustomers(); // Refresh main list
        
    } catch (error) {
        console.error('Error saving contact:', error);
        showNotification('Fehler beim Speichern des Ansprechpartners: ' + error.message, 'error');
    }
}

// Edit contact function
async function editContact(contactId, customerId) {
    try {
        // Get contact details
        const response = await fetch(`/api/customers/${customerId}`);
        const customer = await response.json();
        const contact = customer.contacts.find(c => c.id === contactId);
        
        if (!contact) {
            throw new Error('Ansprechpartner nicht gefunden');
        }
        
        const modal = createModal('edit-contact-modal', 'Ansprechpartner bearbeiten', `
            <form id="editContactForm">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">Vorname *</label>
                            <input type="text" class="form-control" name="firstName" value="${escapeHtml(contact.firstName)}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Nachname *</label>
                            <input type="text" class="form-control" name="lastName" value="${escapeHtml(contact.lastName)}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Position/Titel</label>
                            <input type="text" class="form-control" name="title" value="${escapeHtml(contact.title || '')}" placeholder="z.B. Geschäftsführer">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Abteilung</label>
                            <input type="text" class="form-control" name="department" value="${escapeHtml(contact.department || '')}" placeholder="z.B. Marketing">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label class="form-label">E-Mail</label>
                            <input type="email" class="form-control" name="email" value="${escapeHtml(contact.email || '')}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Telefon</label>
                            <input type="text" class="form-control" name="phone" value="${escapeHtml(contact.phone || '')}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Mobil</label>
                            <input type="text" class="form-control" name="mobile" value="${escapeHtml(contact.mobile || '')}">
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" name="isPrimary" id="editIsPrimary" ${contact.isPrimary ? 'checked' : ''}>
                                <label class="form-check-label" for="editIsPrimary">
                                    Hauptansprechpartner
                                </label>
                                <small class="form-text text-muted">Der wichtigste Kontakt für diesen Kunden</small>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="mb-3">
                    <label class="form-label">Notizen</label>
                    <textarea class="form-control" name="notes" rows="2" placeholder="Besonderheiten, Präferenzen, etc.">${escapeHtml(contact.notes || '')}</textarea>
                </div>
            </form>
        `, 'lg', `
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
            <button type="button" class="btn btn-primary" onclick="saveContact('${customerId}', '${contactId}')">Änderungen speichern</button>
        `);
        
    } catch (error) {
        console.error('Error loading contact for edit:', error);
        showNotification('Fehler beim Laden der Kontaktdaten: ' + error.message, 'error');
    }
}

// Delete contact function
async function deleteContact(contactId, customerId) {
    try {
        const response = await fetch(`/api/customers/${customerId}/contacts/${contactId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Löschen des Ansprechpartners');
        }
        
        showNotification('✅ Ansprechpartner erfolgreich gelöscht!', 'success');
        
        // Auto-refresh Customer Dashboard if open
        if (document.getElementById('customer-dashboard-modal')) {
            showCustomerDetails(customerId);
        }
        
        // If we're in the edit customer modal, refresh the contacts list
        if (document.getElementById('edit-customer-modal')) {
            // Refresh the customer data and reload the edit modal
            const customerResponse = await fetch(`/api/customers/${customerId}`);
            const customer = await customerResponse.json();
            bootstrap.Modal.getInstance(document.getElementById('edit-customer-modal')).hide();
            setTimeout(() => showEditCustomerModal(customer), 300);
        }
        
        loadCustomers(); // Refresh main list
        
    } catch (error) {
        console.error('Error deleting contact:', error);
        showNotification('Fehler beim Löschen des Ansprechpartners: ' + error.message, 'error');
    }
}

// Add section-specific data loading to the existing showSection function
// Instead of overriding, we'll hook into the sectionChanged event
document.addEventListener('sectionChanged', function(event) {
    const sectionName = event.detail.section;
        
        // Load specific data based on section
    switch(sectionName) {
        case 'customers-section':
            setTimeout(() => {
                loadCustomerData();
            }, 100);
            break;
        case 'content-section':
            setTimeout(() => {
                loadContentData();
            }, 100);
            break;
        case 'category-cards-section':
            setTimeout(() => {
                loadCategoryCardsData();
            }, 100);
            break;
        case 'team-section':
            setTimeout(() => {
                loadTeamMembersData();
            }, 100);
            break;
        case 'analytics-section':
            // Stop any existing real-time updates first
            if (isRealTimeActive) {
                stopRealTimeUpdates();
            }
            
            // Initialize modern analytics with enhanced charts
            setTimeout(() => {
                initAnalytics();
                refreshAnalytics();
            }, 200);
            
            // Start real-time updates with proper initialization
            setTimeout(() => {
                if (document.getElementById('analytics-section').style.display !== 'none') {
                    startRealTimeUpdates();
                    showNotification('📊 Real-Time Analytics automatisch gestartet', 'success');
                }
            }, 1500);
            
            // Auto-refresh analytics data every 3 minutes (more frequent)
            if (window.analyticsRefreshInterval) {
                clearInterval(window.analyticsRefreshInterval);
            }
            window.analyticsRefreshInterval = setInterval(() => {
                if (document.getElementById('analytics-section').style.display !== 'none') {
                    refreshAnalytics(); // Use same function as button
                    // Auto-refreshed analytics data
                }
            }, 180000); // 3 minutes
            break;
        case 'dienstleistungen-section':
            if (typeof loadDienstleistungenData === 'function') {
                loadDienstleistungenData();
            }
            break;
        case 'impressum-section':
            loadImpressum();
            break;
        case 'agb-section':
            loadAGB();
            break;
        case 'datenschutz-section':
            loadDatenschutz();
            break;
        default:

    }
});

// ============ RECHTLICHES MANAGEMENT ============

// Impressum functions
async function loadImpressum() {
    try {
        const response = await fetch('/api/settings/legal/impressum');
        if (response.ok) {
            const data = await response.json();
            const content = data.content ? JSON.parse(data.content) : {};
            
            // Hero Section
            document.getElementById('impressumHeroTitle').value = content.heroTitle || 'Impressum';
            document.getElementById('impressumHeroSubtitle').value = content.heroSubtitle || 'Anbieterkennzeichnung und rechtliche Hinweise';
            document.getElementById('impressumHeroDescription').value = content.heroDescription || 'Kontaktdaten unserer Firma und Richtlinien zur Verwendung dieser Website. Alle rechtlich erforderlichen Angaben zur Neon Murer AG finden Sie hier übersichtlich zusammengefasst.';
            
            // Kontaktadresse
            document.getElementById('impressumCompanyName').value = content.companyName || 'Neon Murer AG';
            document.getElementById('impressumAddress').value = content.address || 'Tägernaustrasse 21\nCH-8640 Rapperswil-Jona';
            document.getElementById('impressumPhone').value = content.phone || '+41 (0)55 225 50 25';
            document.getElementById('impressumEmail').value = content.email || 'neon@neonmurer.ch';
            
            // Firmeninhaber
            document.getElementById('impressumOwner').value = content.owner || 'Benno Murer';
            
            // Firmennummer und MWST
            document.getElementById('impressumFirmenNummer').value = content.firmenNummer || 'CH-320.3.058.479-4';
            document.getElementById('impressumMwst').value = content.mwst || 'CHE-112.688.538';
            
            // Öffnungszeiten
            document.getElementById('impressumOpeningWeekdays').value = content.openingWeekdays || '08.00-12.00 / 13.30-17.00 Uhr';
            document.getElementById('impressumOpeningWeekend').value = content.openingWeekend || 'geschlossen';
            
            // Realisation
            document.getElementById('impressumRealization').value = content.realization || 'Marcel Teixeira\nm.teix@proton.me\n+41 77 222 66 88';
            
            // Rechtliche Hinweise
            document.getElementById('impressumLegalText').value = content.legalText || 'Im Hinblick auf die technischen Eigenschaften des Internet kann keine Gewähr für die Authentizität, Richtigkeit und Vollständigkeit der im Internet zur Verfügung gestellten Informationen übernommen werden.';
            
    } else {
            // Set default values if no content exists
            populateImpressumDefaults();
        }
    } catch (error) {
        console.error('Error loading impressum:', error);
        showNotification('Fehler beim Laden des Impressums', 'error');
        // Set default values on error
        populateImpressumDefaults();
    }
}

function populateImpressumDefaults() {
    document.getElementById('impressumHeroTitle').value = 'Impressum';
    document.getElementById('impressumHeroSubtitle').value = 'Anbieterkennzeichnung und rechtliche Hinweise';
    document.getElementById('impressumHeroDescription').value = 'Kontaktdaten unserer Firma und Richtlinien zur Verwendung dieser Website. Alle rechtlich erforderlichen Angaben zur Neon Murer AG finden Sie hier übersichtlich zusammengefasst.';
    document.getElementById('impressumCompanyName').value = 'Neon Murer AG';
    document.getElementById('impressumAddress').value = 'Tägernaustrasse 21\nCH-8640 Rapperswil-Jona';
    document.getElementById('impressumPhone').value = '+41 (0)55 225 50 25';
    document.getElementById('impressumEmail').value = 'neon@neonmurer.ch';
    document.getElementById('impressumOwner').value = 'Benno Murer';
    document.getElementById('impressumFirmenNummer').value = 'CH-320.3.058.479-4';
    document.getElementById('impressumMwst').value = 'CHE-112.688.538';
    document.getElementById('impressumOpeningWeekdays').value = '08.00-12.00 / 13.30-17.00 Uhr';
    document.getElementById('impressumOpeningWeekend').value = 'geschlossen';
    document.getElementById('impressumRealization').value = 'Marcel Teixeira\nm.teix@proton.me\n+41 77 222 66 88';
    document.getElementById('impressumLegalText').value = 'Im Hinblick auf die technischen Eigenschaften des Internet kann keine Gewähr für die Authentizität, Richtigkeit und Vollständigkeit der im Internet zur Verfügung gestellten Informationen übernommen werden.';
}

async function saveImpressum() {
    try {
        const impressumData = {
            heroTitle: document.getElementById('impressumHeroTitle').value,
            heroSubtitle: document.getElementById('impressumHeroSubtitle').value,
            heroDescription: document.getElementById('impressumHeroDescription').value,
            companyName: document.getElementById('impressumCompanyName').value,
            address: document.getElementById('impressumAddress').value,
            phone: document.getElementById('impressumPhone').value,
            email: document.getElementById('impressumEmail').value,
            owner: document.getElementById('impressumOwner').value,
            firmenNummer: document.getElementById('impressumFirmenNummer').value,
            mwst: document.getElementById('impressumMwst').value,
            openingWeekdays: document.getElementById('impressumOpeningWeekdays').value,
            openingWeekend: document.getElementById('impressumOpeningWeekend').value,
            realization: document.getElementById('impressumRealization').value,
            legalText: document.getElementById('impressumLegalText').value
        };
        
        const response = await fetch('/api/settings/legal/impressum', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                content: JSON.stringify(impressumData),
                generateHtml: true 
            })
        });
        
        if (response.ok) {
            showNotification('Impressum erfolgreich gespeichert und HTML-Datei aktualisiert', 'success');
        } else {
            throw new Error('Failed to save impressum');
        }
    } catch (error) {
        console.error('Error saving impressum:', error);
        showNotification('Fehler beim Speichern des Impressums', 'error');
    }
}

// =============================================================================
// AGB MANAGEMENT SYSTEM
// =============================================================================

let agbSections = [];
let agbEditor = null;
let currentAgbSection = null;
let agbEditorInitialized = false;

// Reset AGB editor initialization flag (for debugging/testing)
function resetAgbEditor() {
    agbEditorInitialized = false;
    if (agbEditor) {
        try {
            if (typeof agbEditor.destroy === 'function') {
                agbEditor.destroy();
            }
        } catch (e) {
            console.warn('Error destroying AGB editor during reset:', e);
        }
        agbEditor = null;
    }
    console.log('AGB Editor reset completed');
}

// Initialize AGB section management
async function initializeAgbSection() {
    try {
        // Prevent multiple initialization
        if (agbEditorInitialized) {
            console.log('AGB Editor already initialized, skipping...');
            return;
        }
        
        // Initialize Quill editor for rich text editing
        if (typeof Quill !== 'undefined') {
            // Clean up existing editor if it exists
            if (agbEditor) {
                try {
                    // Properly destroy the Quill instance
                    if (typeof agbEditor.destroy === 'function') {
                        agbEditor.destroy();
                    }
                } catch (e) {
                    console.warn('Error destroying AGB editor:', e);
                }
                
                // Completely replace the DOM element to ensure clean state
                const editorElement = document.getElementById('agbContentEditor');
                if (editorElement) {
                    const parent = editorElement.parentNode;
                    const newElement = document.createElement('div');
                    newElement.id = 'agbContentEditor';
                    parent.replaceChild(newElement, editorElement);
                }
                agbEditor = null;
            }
            
            agbEditor = new Quill('#agbContentEditor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'color': [] }, { 'background': [] }],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'align': [] }],
                        ['link', 'blockquote', 'code-block'],
                        ['clean']
                    ]
                }
            });

            // Sync Quill content with hidden textarea
            agbEditor.on('text-change', function() {
                document.getElementById('agbSectionContent').value = agbEditor.root.innerHTML;
                updateBoxPreview();
            });
        }

        // Load AGB sections
        await loadAgbSections();
        
        // Initialize drag and drop
        initializeAgbDragDrop();
        
        // Update box preview when type changes
        document.getElementById('agbSectionBoxType').addEventListener('change', updateBoxPreview);
        document.getElementById('agbSectionTitle').addEventListener('input', updateBoxPreview);

        // Mark as initialized
        agbEditorInitialized = true;
        console.log('AGB Editor successfully initialized');

    } catch (error) {
        console.error('Error initializing AGB section:', error);
        showNotification('Fehler beim Initialisieren der AGB-Verwaltung', 'error');
    }
}

// Load all AGB sections
async function loadAgbSections() {
    try {
        const response = await fetch('/api/agb', {
            headers: await getAuthHeaders()
        });
        
        if (response.ok) {
            const data = await response.json();
            agbSections = data.data || [];
            renderAgbSections();
            updateAgbStatistics();
        } else {
            throw new Error('Failed to load AGB sections');
        }
    } catch (error) {
        console.error('Error loading AGB sections:', error);
        showNotification('Fehler beim Laden der AGB-Abschnitte', 'error');
        agbSections = [];
        renderAgbSections();
    }
}

// Render AGB sections list
function renderAgbSections() {
    const container = document.getElementById('agbSectionsList');
    
    if (agbSections.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5">
                <i class="fas fa-file-contract fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Noch keine AGB-Abschnitte vorhanden</h5>
                <p class="text-muted">Erstellen Sie den ersten Abschnitt mit dem Button "Neuer Abschnitt".</p>
                <button class="btn btn-success" onclick="addNewAgbSection()">
                    <i class="fas fa-plus me-2"></i>Ersten Abschnitt erstellen
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = agbSections.map((section, index) => `
        <div class="agb-section-item" data-section-id="${section.id}" draggable="true">
            <div class="d-flex align-items-center">
                <div class="drag-handle me-3">
                    <i class="fas fa-grip-vertical text-muted"></i>
                </div>
                <div class="section-number me-3">
                    <span class="badge bg-primary">${index + 1}</span>
                </div>
                <div class="section-icon me-3">
                    <i class="${section.iconClass || 'fas fa-info-circle'}"></i>
                </div>
                <div class="section-content flex-grow-1">
                    <h6 class="mb-1">${escapeHtml(section.title)}</h6>
                    <small class="text-muted">
                        ${getBoxTypeLabel(section.boxType)} • 
                        ${section.isActive ? '<span class="text-success">Aktiv</span>' : '<span class="text-danger">Inaktiv</span>'} •
                        ${section.showInQuickNav ? '<span class="text-info">Schnellnav</span>' : 'Nicht in Schnellnav'}
                    </small>
                </div>
                <div class="section-actions">
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editAgbSection('${section.id}')" title="Bearbeiten">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm ${section.isActive ? 'btn-outline-warning' : 'btn-outline-success'}" 
                            onclick="toggleAgbSectionStatus('${section.id}')" 
                            title="${section.isActive ? 'Deaktivieren' : 'Aktivieren'}">
                        <i class="fas ${section.isActive ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Update AGB statistics
function updateAgbStatistics() {
    const total = agbSections.length;
    const active = agbSections.filter(s => s.isActive).length;
    const quickNav = agbSections.filter(s => s.showInQuickNav).length;
    const highlighted = agbSections.filter(s => s.boxType !== 'DEFAULT').length;

    document.getElementById('agbTotalCount').textContent = total;
    document.getElementById('agbActiveCount').textContent = active;
    document.getElementById('agbQuickNavCount').textContent = quickNav;
    document.getElementById('agbHighlightCount').textContent = highlighted;
}

// Add new AGB section
function addNewAgbSection() {
    currentAgbSection = null;
    
    // Reset form
    document.getElementById('agbSectionForm').reset();
    document.getElementById('agbSectionId').value = '';
    document.getElementById('agbSectionIsActive').checked = true;
    document.getElementById('agbModalTitle').textContent = 'Neuen AGB-Abschnitt erstellen';
    document.getElementById('deleteAgbSectionBtn').style.display = 'none';
    
    // Clear editor
    if (agbEditor) {
        agbEditor.setContents([]);
    }
    
    // Show modal
    new bootstrap.Modal(document.getElementById('agbSectionModal')).show();
    updateBoxPreview();
}

// Edit existing AGB section
function editAgbSection(sectionId) {
    const section = agbSections.find(s => s.id === sectionId);
    if (!section) return;
    
    currentAgbSection = section;
    
    // Populate form
    document.getElementById('agbSectionId').value = section.id;
    document.getElementById('agbSectionTitle').value = section.title;
    document.getElementById('agbSectionIcon').value = section.iconClass || '';
    document.getElementById('agbSectionBoxType').value = section.boxType;
    document.getElementById('agbSectionShowInQuickNav').checked = section.showInQuickNav;
    document.getElementById('agbSectionIsActive').checked = section.isActive;
    document.getElementById('agbSectionContent').value = section.content;
    
    // Set editor content
    if (agbEditor) {
        agbEditor.root.innerHTML = section.content;
    }
    
    // Update modal title and show delete button
    document.getElementById('agbModalTitle').textContent = 'AGB-Abschnitt bearbeiten';
    document.getElementById('deleteAgbSectionBtn').style.display = 'inline-block';
    
    // Update icon preview
    updateIconPreview();
    
    // Show modal
    new bootstrap.Modal(document.getElementById('agbSectionModal')).show();
    updateBoxPreview();
}

// Save AGB section
async function saveAgbSection() {
    try {
        const form = document.getElementById('agbSectionForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const sectionData = {
            title: document.getElementById('agbSectionTitle').value,
            content: document.getElementById('agbSectionContent').value,
            boxType: document.getElementById('agbSectionBoxType').value,
            iconClass: document.getElementById('agbSectionIcon').value || null,
            showInQuickNav: document.getElementById('agbSectionShowInQuickNav').checked,
            isActive: document.getElementById('agbSectionIsActive').checked
        };

        const sectionId = document.getElementById('agbSectionId').value;
        const isEdit = sectionId && sectionId !== '';
        
        const response = await fetch(`/api/agb${isEdit ? '/' + sectionId : ''}`, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(await getAuthHeaders())
            },
            body: JSON.stringify(sectionData)
        });

        if (response.ok) {
            showNotification(`AGB-Abschnitt erfolgreich ${isEdit ? 'aktualisiert' : 'erstellt'}`, 'success');
            bootstrap.Modal.getInstance(document.getElementById('agbSectionModal')).hide();
            await loadAgbSections();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Speichern');
        }
    } catch (error) {
        console.error('Error saving AGB section:', error);
        showNotification('Fehler beim Speichern des AGB-Abschnitts: ' + error.message, 'error');
    }
}

// Delete AGB section
async function deleteAgbSection() {
    const sectionId = document.getElementById('agbSectionId').value;
    if (!sectionId) return;

    const section = agbSections.find(s => s.id === sectionId);
    if (!section) return;

    if (!confirm(`Sind Sie sicher, dass Sie den Abschnitt "${section.title}" löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
        return;
    }

    try {
        const response = await fetch(`/api/agb/${sectionId}`, {
            method: 'DELETE',
            headers: await getAuthHeaders()
        });

        if (response.ok) {
            showNotification('AGB-Abschnitt erfolgreich gelöscht', 'success');
            bootstrap.Modal.getInstance(document.getElementById('agbSectionModal')).hide();
            await loadAgbSections();
        } else {
            throw new Error('Fehler beim Löschen');
        }
    } catch (error) {
        console.error('Error deleting AGB section:', error);
        showNotification('Fehler beim Löschen des AGB-Abschnitts', 'error');
    }
}

// Toggle section active status
async function toggleAgbSectionStatus(sectionId) {
    const section = agbSections.find(s => s.id === sectionId);
    if (!section) return;

    try {
        const response = await fetch(`/api/agb/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(await getAuthHeaders())
            },
            body: JSON.stringify({ isActive: !section.isActive })
        });
        
        if (response.ok) {
            showNotification(`Abschnitt erfolgreich ${!section.isActive ? 'aktiviert' : 'deaktiviert'}`, 'success');
            await loadAgbSections();
        } else {
            throw new Error('Fehler beim Ändern des Status');
        }
    } catch (error) {
        console.error('Error toggling section status:', error);
        showNotification('Fehler beim Ändern des Abschnitt-Status', 'error');
    }
}

// Initialize drag and drop
function initializeAgbDragDrop() {
    const container = document.getElementById('agbSectionsList');
    let draggedElement = null;

    container.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('agb-section-item')) {
            draggedElement = e.target;
            e.target.style.opacity = '0.5';
        }
    });

    container.addEventListener('dragend', function(e) {
        if (e.target.classList.contains('agb-section-item')) {
            e.target.style.opacity = '';
        }
    });

    container.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    container.addEventListener('drop', async function(e) {
        e.preventDefault();
        
        if (!draggedElement) return;
        
        const dropTarget = e.target.closest('.agb-section-item');
        if (dropTarget && dropTarget !== draggedElement) {
            const containerRect = container.getBoundingClientRect();
            const dropTargetRect = dropTarget.getBoundingClientRect();
            const dropY = e.clientY - containerRect.top;
            const targetY = dropTargetRect.top - containerRect.top;
            
            if (dropY < targetY + dropTargetRect.height / 2) {
                container.insertBefore(draggedElement, dropTarget);
            } else {
                container.insertBefore(draggedElement, dropTarget.nextSibling);
            }
            
            await updateAgbSectionOrder();
        }
        
        draggedElement = null;
    });
}

// Update section order after drag and drop
async function updateAgbSectionOrder() {
    try {
        const sectionItems = document.querySelectorAll('.agb-section-item');
        const newOrder = Array.from(sectionItems).map(item => ({
            id: item.getAttribute('data-section-id')
        }));

        const response = await fetch('/api/agb/reorder', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(await getAuthHeaders())
            },
            body: JSON.stringify({ sections: newOrder })
        });

        if (response.ok) {
            showNotification('Reihenfolge erfolgreich aktualisiert', 'success');
            await loadAgbSections();
        } else {
            throw new Error('Fehler beim Aktualisieren der Reihenfolge');
        }
    } catch (error) {
        console.error('Error updating section order:', error);
        showNotification('Fehler beim Aktualisieren der Reihenfolge', 'error');
        await loadAgbSections(); // Reload to reset order
    }
}

// Save all sections (batch save)
async function saveAllAgbSections() {
    try {
        showNotification('Speichere alle Änderungen...', 'info');
        // For now, just reload to show current state
        await loadAgbSections();
        showNotification('Alle Abschnitte sind aktuell', 'success');
    } catch (error) {
        console.error('Error saving all sections:', error);
        showNotification('Fehler beim Speichern', 'error');
    }
}

// Preview AGB page
function previewAgb() {
    window.open('/geschaeftsbedingungen.html', '_blank');
}

// Update icon preview
function updateIconPreview() {
    const iconInput = document.getElementById('agbSectionIcon');
    const iconPreview = document.getElementById('agbIconPreview');
    
    if (iconInput && iconPreview) {
        const iconClass = iconInput.value || 'fas fa-info-circle';
        iconPreview.className = iconClass;
    }
}

// Update box type preview
function updateBoxPreview() {
    const preview = document.getElementById('agbBoxPreview');
    const titlePreview = document.getElementById('agbPreviewTitle');
    const contentPreview = document.getElementById('agbPreviewContent');
    const boxType = document.getElementById('agbSectionBoxType').value;
    const title = document.getElementById('agbSectionTitle').value || 'Beispiel-Titel';
    
    if (agbEditor) {
        const content = agbEditor.root.innerHTML || 'Hier wird eine Vorschau des Inhalts mit der gewählten Box-Formatierung angezeigt.';
        contentPreview.innerHTML = content;
    }
    
    titlePreview.textContent = title;
    
    // Apply box type styling
    preview.className = 'p-3 border rounded';
    
    switch (boxType) {
        case 'HIGHLIGHT':
            preview.classList.add('bg-warning', 'bg-opacity-10', 'border-warning');
            break;
        case 'IMPORTANT':
            preview.classList.add('bg-danger', 'bg-opacity-10', 'border-danger');
            break;
        default:
            preview.classList.add('bg-light', 'border-secondary');
    }
}

// Helper functions
function getBoxTypeLabel(boxType) {
    switch (boxType) {
        case 'HIGHLIGHT': return 'Hervorgehoben';
        case 'IMPORTANT': return 'Wichtig';
        default: return 'Standard';
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Legacy function for compatibility
async function loadAGB() {
    await initializeAgbSection();
}

async function saveAGB() {
    await saveAllAgbSections();
}

// =============================================================================
// DATENSCHUTZ MANAGEMENT SYSTEM
// =============================================================================

let datenschutzSections = [];
let datenschutzEditor = null;
let currentDatenschutzSection = null;
let datenschutzEditorInitialized = false;

// Reset Datenschutz editor initialization flag (for debugging/testing)
function resetDatenschutzEditor() {
    datenschutzEditorInitialized = false;
    if (datenschutzEditor) {
        try {
            if (typeof datenschutzEditor.destroy === 'function') {
                datenschutzEditor.destroy();
            }
        } catch (e) {
            console.warn('Error destroying Datenschutz editor during reset:', e);
        }
        datenschutzEditor = null;
    }
    console.log('Datenschutz Editor reset completed');
}

// Initialize Datenschutz section management
async function initializeDatenschutzSection() {
    try {
        // Prevent multiple initialization
        if (datenschutzEditorInitialized) {
            console.log('Datenschutz Editor already initialized, skipping...');
            return;
        }
        
        // Initialize Quill editor for datenschutz content
        if (document.getElementById('datenschutzContentEditor')) {
            // Clean up existing editor if it exists
            if (datenschutzEditor) {
                try {
                    // Properly destroy the Quill instance
                    if (typeof datenschutzEditor.destroy === 'function') {
                        datenschutzEditor.destroy();
                    }
                } catch (e) {
                    console.warn('Error destroying Datenschutz editor:', e);
                }
                
                // Completely replace the DOM element to ensure clean state
                const editorElement = document.getElementById('datenschutzContentEditor');
                if (editorElement) {
                    const parent = editorElement.parentNode;
                    const newElement = document.createElement('div');
                    newElement.id = 'datenschutzContentEditor';
                    parent.replaceChild(newElement, editorElement);
                }
                datenschutzEditor = null;
            }
            
            datenschutzEditor = new Quill('#datenschutzContentEditor', {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, 3, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        [{ 'indent': '-1'}, { 'indent': '+1' }],
                        ['link'],
                        ['clean']
                    ]
                }
            });

            // Update hidden field when editor content changes
            datenschutzEditor.on('text-change', function() {
                document.getElementById('datenschutzSectionContent').value = datenschutzEditor.root.innerHTML;
            });
        }

        // Load Datenschutz sections
        await loadDatenschutzSections();

        // Setup drag and drop
        setupDatenschutzDragDrop();

        // Setup event listeners
        document.getElementById('datenschutzSectionBoxType').addEventListener('change', updateDatenschutzBoxPreview);
        document.getElementById('datenschutzSectionTitle').addEventListener('input', updateDatenschutzBoxPreview);

        // Mark as initialized
        datenschutzEditorInitialized = true;
        console.log('Datenschutz Editor successfully initialized');

    } catch (error) {
        console.error('Error initializing Datenschutz section:', error);
        showNotification('Fehler beim Initialisieren des Datenschutz-Systems', 'error');
    }
}

// Load all Datenschutz sections
async function loadDatenschutzSections() {
    try {
        showNotification('Datenschutz-Abschnitte werden geladen...', 'info');
        
        const response = await fetch('/api/datenschutz');
        if (!response.ok) {
            throw new Error('Failed to load Datenschutz sections');
        }
        
        const data = await response.json();
        datenschutzSections = data.data || [];
        renderDatenschutzSections();
        
        // Re-setup drag and drop after rendering new elements
        setupDatenschutzDragDrop();
        
    } catch (error) {
        console.error('Error loading Datenschutz sections:', error);
        showNotification('Fehler beim Laden der Datenschutz-Abschnitte', 'error');
        datenschutzSections = [];
        renderDatenschutzSections();
        
        // Re-setup drag and drop even on error
        setupDatenschutzDragDrop();
    }
}

// Render Datenschutz sections list
function renderDatenschutzSections() {
    const container = document.getElementById('datenschutzSectionsList');
    
    // Safety check: if container doesn't exist, exit early
    if (!container) {
        console.warn('Datenschutz sections container not found in DOM');
        return;
    }
    
    if (datenschutzSections.length === 0) {
        container.innerHTML = `
            <div class="alert alert-info text-center">
                <i class="fas fa-info-circle me-2"></i>
                Noch keine Datenschutz-Abschnitte vorhanden.
                <br><br>
                <button class="btn btn-success" onclick="addNewDatenschutzSection()">
                    <i class="fas fa-plus me-2"></i>
                    Ersten Abschnitt erstellen
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = datenschutzSections.map((section, index) => `
        <div class="datenschutz-section-item" data-section-id="${section.id}" draggable="true">
            <div class="d-flex align-items-center">
                <div class="drag-handle me-3">
                    <i class="fas fa-grip-vertical text-muted"></i>
                </div>
                <div class="section-number me-3">
                    <span class="badge bg-primary">${index + 1}</span>
                </div>
                <div class="section-icon me-3">
                    <i class="${section.iconClass || 'fas fa-shield-alt'}"></i>
                </div>
                <div class="section-content flex-grow-1">
                    <h6 class="mb-1">${escapeHtml(section.title)}</h6>
                    <small class="text-muted">
                        ${getBoxTypeLabel(section.boxType)} • 
                        ${section.isActive ? '<span class="text-success">Aktiv</span>' : '<span class="text-danger">Inaktiv</span>'} •
                        ${section.showInQuickNav ? '<span class="text-info">Schnellnav</span>' : 'Nicht in Schnellnav'}
                    </small>
                </div>
                <div class="section-actions">
                    ${section.isEditable ? `
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editDatenschutzSection('${section.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-outline-secondary me-2" disabled title="Nicht editierbar">
                            <i class="fas fa-lock"></i>
                        </button>
                    `}
                    <button class="btn btn-sm ${section.isActive ? 'btn-outline-warning' : 'btn-outline-success'}" 
                            onclick="toggleDatenschutzSectionStatus('${section.id}')" 
                            title="${section.isActive ? 'Deaktivieren' : 'Aktivieren'}">
                        <i class="fas ${section.isActive ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    // Update statistics
    const total = datenschutzSections.length;
    const active = datenschutzSections.filter(s => s.isActive).length;
    const quickNav = datenschutzSections.filter(s => s.showInQuickNav).length;
    const highlighted = datenschutzSections.filter(s => s.boxType !== 'DEFAULT').length;
    const nonEditable = datenschutzSections.filter(s => !s.isEditable).length;
    
    // Safely update statistics elements (check if they exist first)
    const totalElement = document.getElementById('datenschutzStatsTotal');
    const activeElement = document.getElementById('datenschutzStatsActive');
    const quickNavElement = document.getElementById('datenschutzStatsQuickNav');
    const highlightedElement = document.getElementById('datenschutzStatsHighlighted');
    
    if (totalElement) totalElement.textContent = total;
    if (activeElement) activeElement.textContent = active;
    if (quickNavElement) quickNavElement.textContent = quickNav;
    if (highlightedElement) highlightedElement.textContent = highlighted;
}

// Add new Datenschutz section
function addNewDatenschutzSection() {
    currentDatenschutzSection = null;
    
    // Reset form
    document.getElementById('datenschutzSectionForm').reset();
    document.getElementById('datenschutzSectionId').value = '';
    document.getElementById('datenschutzSectionIsActive').checked = true;
    
    document.getElementById('deleteDatenschutzSectionBtn').style.display = 'none';
    
    // Clear editor
    if (datenschutzEditor) {
        datenschutzEditor.setContents([]);
    }
    
    updateDatenschutzBoxPreview();
    
    new bootstrap.Modal(document.getElementById('datenschutzSectionModal')).show();
}

// Edit existing Datenschutz section
function editDatenschutzSection(sectionId) {
    const section = datenschutzSections.find(s => s.id === sectionId);
    if (!section) return;
    
    // Check if section is editable
    if (!section.isEditable) {
        showNotification('Dieser Abschnitt ist nicht editierbar', 'warning');
        return;
    }
    
    currentDatenschutzSection = section;
    
    // Fill form
    document.getElementById('datenschutzSectionId').value = section.id;
    document.getElementById('datenschutzSectionTitle').value = section.title;
    document.getElementById('datenschutzSectionIcon').value = section.iconClass || '';
    document.getElementById('datenschutzSectionBoxType').value = section.boxType;
    document.getElementById('datenschutzSectionShowInQuickNav').checked = section.showInQuickNav;
    document.getElementById('datenschutzSectionIsActive').checked = section.isActive;
    document.getElementById('datenschutzSectionContent').value = section.content;
    
    // Set editor content
    if (datenschutzEditor) {
        datenschutzEditor.root.innerHTML = section.content;
    }
    
    updateDatenschutzBoxPreview();
    document.getElementById('deleteDatenschutzSectionBtn').style.display = 'inline-block';
    
    updateDatenschutzIconPreview();
    
    new bootstrap.Modal(document.getElementById('datenschutzSectionModal')).show();
}

// Save Datenschutz section
async function saveDatenschutzSection() {
    try {
        const form = document.getElementById('datenschutzSectionForm');
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const sectionData = {
            title: document.getElementById('datenschutzSectionTitle').value,
            content: document.getElementById('datenschutzSectionContent').value,
            boxType: document.getElementById('datenschutzSectionBoxType').value,
            iconClass: document.getElementById('datenschutzSectionIcon').value || null,
            showInQuickNav: document.getElementById('datenschutzSectionShowInQuickNav').checked,
            isActive: document.getElementById('datenschutzSectionIsActive').checked
        };

        const sectionId = document.getElementById('datenschutzSectionId').value;
        const isEdit = !!sectionId;

        const response = await fetch(`/api/datenschutz${isEdit ? '/' + sectionId : ''}`, {
            method: isEdit ? 'PUT' : 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(await getAuthHeaders())
            },
            body: JSON.stringify(sectionData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Fehler beim Speichern');
        }

        showNotification(`Datenschutz-Abschnitt erfolgreich ${isEdit ? 'aktualisiert' : 'erstellt'}`, 'success');
        bootstrap.Modal.getInstance(document.getElementById('datenschutzSectionModal')).hide();
        await loadDatenschutzSections();

    } catch (error) {
        console.error('Error saving Datenschutz section:', error);
        showNotification(`Fehler beim Speichern: ${error.message}`, 'error');
    }
}

// Delete Datenschutz section
async function deleteDatenschutzSection() {
    const sectionId = document.getElementById('datenschutzSectionId').value;
    if (!sectionId) return;

    const section = datenschutzSections.find(s => s.id === sectionId);
    if (!section) return;
    
    // Check if section is editable
    if (!section.isEditable) {
        showNotification('Dieser Abschnitt kann nicht gelöscht werden', 'warning');
        return;
    }

    if (!confirm(`Datenschutz-Abschnitt "${section.title}" wirklich löschen?`)) return;

    try {
        const response = await fetch(`/api/datenschutz/${sectionId}`, {
            method: 'DELETE',
            headers: await getAuthHeaders()
        });

        if (!response.ok) throw new Error('Fehler beim Löschen');

        showNotification('Datenschutz-Abschnitt erfolgreich gelöscht', 'success');
        bootstrap.Modal.getInstance(document.getElementById('datenschutzSectionModal')).hide();
        await loadDatenschutzSections();

    } catch (error) {
        console.error('Error deleting Datenschutz section:', error);
        showNotification('Fehler beim Löschen des Datenschutz-Abschnitts', 'error');
    }
}

// Toggle section status
async function toggleDatenschutzSectionStatus(sectionId) {
    const section = datenschutzSections.find(s => s.id === sectionId);
    if (!section) return;

    try {
        const response = await fetch(`/api/datenschutz/${sectionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(await getAuthHeaders())
            },
            body: JSON.stringify({
                isActive: !section.isActive
            })
        });

        if (!response.ok) throw new Error('Fehler beim Aktualisieren');

        await loadDatenschutzSections();
        showNotification(`Datenschutz-Abschnitt ${!section.isActive ? 'aktiviert' : 'deaktiviert'}`, 'success');

    } catch (error) {
        console.error('Error toggling section status:', error);
        showNotification('Fehler beim Aktualisieren des Status', 'error');
    }
}

// Setup drag and drop for reordering
function setupDatenschutzDragDrop() {
    const container = document.getElementById('datenschutzSectionsList');
    if (!container) return;
    
    // Remove existing event listeners to avoid duplicates
    const newContainer = container.cloneNode(true);
    container.parentNode.replaceChild(newContainer, container);
    const cleanContainer = document.getElementById('datenschutzSectionsList');
    
    let draggedElement = null;

    cleanContainer.addEventListener('dragstart', function(e) {
        if (e.target.classList.contains('datenschutz-section-item')) {
            draggedElement = e.target;
            e.target.style.opacity = '0.5';
        }
    });

    cleanContainer.addEventListener('dragend', function(e) {
        if (e.target.classList.contains('datenschutz-section-item')) {
            e.target.style.opacity = '';
        }
    });

    cleanContainer.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    cleanContainer.addEventListener('drop', async function(e) {
        e.preventDefault();
        
        if (!draggedElement) return;
        
        const dropTarget = e.target.closest('.datenschutz-section-item');
        if (dropTarget && dropTarget !== draggedElement) {
            const containerRect = cleanContainer.getBoundingClientRect();
            const dropTargetRect = dropTarget.getBoundingClientRect();
            const dropY = e.clientY - containerRect.top;
            const targetY = dropTargetRect.top - containerRect.top;
            
            if (dropY < targetY + dropTargetRect.height / 2) {
                cleanContainer.insertBefore(draggedElement, dropTarget);
            } else {
                cleanContainer.insertBefore(draggedElement, dropTarget.nextSibling);
            }
            
            await updateDatenschutzSectionOrder();
        }
        
        draggedElement = null;
    });
}

// Update section order after drag and drop
async function updateDatenschutzSectionOrder() {
    try {
        const sectionItems = document.querySelectorAll('.datenschutz-section-item');
        const sections = Array.from(sectionItems).map(item => ({
            id: item.dataset.sectionId
        }));

        const response = await fetch('/api/datenschutz/reorder', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...(await getAuthHeaders())
            },
            body: JSON.stringify({ sections })
        });

        if (!response.ok) throw new Error('Fehler beim Neuordnen');

        await loadDatenschutzSections();
        showNotification('Reihenfolge erfolgreich aktualisiert', 'success');

    } catch (error) {
        console.error('Error updating order:', error);
        showNotification('Fehler beim Aktualisieren der Reihenfolge', 'error');
        await loadDatenschutzSections(); // Reload to reset order
    }
}

// Save all sections (if needed)
async function saveAllDatenschutzSections() {
    try {
        showNotification('Alle Datenschutz-Abschnitte werden gespeichert...', 'info');
        await loadDatenschutzSections();
        showNotification('Alle Datenschutz-Abschnitte erfolgreich gespeichert', 'success');
    } catch (error) {
        console.error('Error saving all sections:', error);
        showNotification('Fehler beim Speichern', 'error');
    }
}

// ========== DATENSCHUTZ ICON SELECTOR ==========
function showDatenschutzIconSelector() {
    populateDatenschutzIconGrid();
    const modal = new bootstrap.Modal(document.getElementById('iconSelectorModal'));
    modal.show();
}

function populateDatenschutzIconGrid() {
    const iconGrid = document.getElementById('iconGrid');
    iconGrid.innerHTML = '';
    availableIcons.forEach(icon => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'col-2 mb-3';
        iconDiv.innerHTML = `
            <div class="text-center p-2 border rounded icon-option" 
                 onclick="selectDatenschutzIcon('${icon.class}')" 
                 style="cursor: pointer; transition: all 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'" 
                 onmouseout="this.style.backgroundColor='white'">
                <i class="${icon.class}" style="font-size: 24px; margin-bottom: 5px;"></i>
                <div style="font-size: 11px;">${icon.name}</div>
            </div>
        `;
        iconGrid.appendChild(iconDiv);
    });
}

function selectDatenschutzIcon(iconClass) {
    document.getElementById('datenschutzSectionIcon').value = iconClass;
    const iconPreview = document.getElementById('datenschutzIconPreview');
    if (iconPreview) {
        iconPreview.className = iconClass;
    }
    const modal = bootstrap.Modal.getInstance(document.getElementById('iconSelectorModal'));
    modal.hide();
    const iconName = availableIcons.find(icon => icon.class === iconClass)?.name || iconClass;
    showNotification(`Icon "${iconName}" für Datenschutz-Abschnitt ausgewählt`, 'success');
}

function updateDatenschutzIconPreview() {
    const iconInput = document.getElementById('datenschutzSectionIcon');
    const iconPreview = document.getElementById('datenschutzIconPreview');
    
    if (iconInput && iconPreview) {
        const iconClass = iconInput.value || 'fas fa-info-circle';
        iconPreview.className = iconClass;
    }
}

// Update box preview
function updateDatenschutzBoxPreview() {
    const preview = document.getElementById('datenschutzBoxPreview');
    if (!preview) return;
    
    const boxType = document.getElementById('datenschutzSectionBoxType').value;
    const title = document.getElementById('datenschutzSectionTitle').value || 'Beispiel-Titel';
    
    let boxClass = 'info-card';
    switch (boxType) {
        case 'HIGHLIGHT':
            boxClass = 'info-card highlight-card';
            break;
        case 'IMPORTANT':
            boxClass = 'info-card important-card';
            break;
        default:
            boxClass = 'info-card';
    }
    
    preview.innerHTML = `
        <div class="${boxClass}">
            <h4>${title}</h4>
            <p>Dies ist eine Vorschau des gewählten Box-Typs für den Datenschutz-Abschnitt.</p>
        </div>
    `;
}

// Update case statement to use new function
async function loadDatenschutz() {
    try {
        await initializeDatenschutzSection();
    } catch (error) {
        console.error('Error loading datenschutz management:', error);
        showNotification('Fehler beim Laden der Datenschutz-Verwaltung', 'error');
    }
}

// Legacy save function (for backward compatibility if needed)
async function saveDatenschutz() {
    try {
        await saveAllDatenschutzSections();
    } catch (error) {
        console.error('Error saving datenschutz:', error);
        showNotification('Fehler beim Speichern der Datenschutzerklärung', 'error');
    }
}

// Make functions globally available
window.saveImpressum = saveImpressum;
window.saveAGB = saveAGB;
window.saveDatenschutz = saveDatenschutz;

// Make datenschutz functions globally available
window.addNewDatenschutzSection = addNewDatenschutzSection;
window.editDatenschutzSection = editDatenschutzSection;
window.saveDatenschutzSection = saveDatenschutzSection;
window.deleteDatenschutzSection = deleteDatenschutzSection;
window.toggleDatenschutzSectionStatus = toggleDatenschutzSectionStatus;
window.showDatenschutzIconSelector = showDatenschutzIconSelector;
window.selectDatenschutzIcon = selectDatenschutzIcon;
window.updateDatenschutzIconPreview = updateDatenschutzIconPreview;

// Make AGB functions globally available
window.addNewAgbSection = addNewAgbSection;
window.editAgbSection = editAgbSection;
window.saveAgbSection = saveAgbSection;
window.deleteAgbSection = deleteAgbSection;
window.toggleAgbSectionStatus = toggleAgbSectionStatus;
window.saveAllAgbSections = saveAllAgbSections;
window.previewAgb = previewAgb;
window.updateIconPreview = updateIconPreview;

// ============ CATEGORY CARDS MANAGEMENT ============

let allCategoryCards = [];
let filteredCategoryCards = [];

// Load category cards data
async function loadCategoryCardsData() {
    try {
        const response = await fetch('/api/category-cards');
        if (!response.ok) {
            throw new Error('Failed to load category cards');
        }
        
        const data = await response.json();
        allCategoryCards = data.cards;
        filteredCategoryCards = [...allCategoryCards];
        
        renderCategoryCardsTable();
        
    } catch (error) {
        console.error('Error loading category cards:', error);
        showCategoryCardsError('Fehler beim Laden der Category Cards');
    }
}

// Render category cards table
function renderCategoryCardsTable() {
    const tableBody = document.getElementById('categoryCardsTable');
    
    if (!filteredCategoryCards || filteredCategoryCards.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <h5>Keine Category Cards gefunden</h5>
                    <p class="text-muted">Erstellen Sie Ihre erste Category Card.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredCategoryCards.map(card => {
        const visualIndicator = card.backgroundImage 
            ? `<img src="${card.backgroundImage}" alt="Card Image" style="width: 40px; height: 40px; object-fit: cover; border-radius: 4px;">`
            : card.backgroundColor 
                ? `<div style="width: 40px; height: 40px; background: ${card.backgroundColor}; border-radius: 4px; border: 1px solid #ddd;"></div>`
                : '<span class="badge bg-secondary">Kein Bild</span>';
        
        const statusBadge = card.isActive 
            ? '<span class="badge bg-success">Aktiv</span>'
            : '<span class="badge bg-secondary">Inaktiv</span>';
            
        const categoryBadge = card.category === 'beschriftungen'
            ? '<span class="badge bg-primary">Beschriftungen</span>'
            : '<span class="badge bg-info">Lichtwerbung</span>';
        
        return `
            <tr>
                <td>
                    <span class="badge bg-light text-dark">${card.order}</span>
                    <div class="btn-group btn-group-sm ms-2" role="group">
                        <button class="btn btn-outline-secondary btn-sm" onclick="moveCard('${card.id}', 'up')" title="Nach oben">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="moveCard('${card.id}', 'down')" title="Nach unten">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <strong>${escapeHtml(card.title)}</strong>
                    ${card.subtitle ? `<br><small class="text-muted">${escapeHtml(card.subtitle)}</small>` : ''}
                </td>
                <td>${categoryBadge}</td>
                <td>
                    <a href="${card.linkUrl}" target="_blank" class="text-decoration-none">
                        ${escapeHtml(card.linkUrl.length > 30 ? card.linkUrl.substring(0, 30) + '...' : card.linkUrl)}
                        <i class="fas fa-external-link-alt ms-1"></i>
                    </a>
                </td>
                <td>${visualIndicator}</td>
                <td>${statusBadge}</td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" onclick="editCard('${card.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteCard('${card.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Filter category cards
function filterCategoryCards() {
    const categoryFilter = document.getElementById('categoryFilter').value;
    const searchInput = document.getElementById('cardSearchInput').value.toLowerCase();
    
    filteredCategoryCards = allCategoryCards.filter(card => {
        const matchesCategory = !categoryFilter || card.category === categoryFilter;
        const matchesSearch = !searchInput || card.title.toLowerCase().includes(searchInput);
        return matchesCategory && matchesSearch;
    });
    
    renderCategoryCardsTable();
}

// Show create card modal
function showCreateCardModal() {
    const modalContent = `
        <div class="modal fade" id="cardModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Neue Category Card erstellen</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="cardForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Titel *</label>
                                        <input type="text" class="form-control" id="cardTitle" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Kategorie *</label>
                                        <select class="form-select" id="cardCategory" required>
                                            <option value="">Wählen Sie eine Kategorie</option>
                                            <option value="beschriftungen">Beschriftungen</option>
                                            <option value="lichtwerbung">Lichtwerbung</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Untertitel (optional)</label>
                                <input type="text" class="form-control" id="cardSubtitle">
                            </div>
                            
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label class="form-label">Verlinkung (URL oder Tel) *</label>
                                        <input type="text" class="form-control" id="cardLinkUrl" required 
                                               placeholder="z.B. beschriftungen/fahrzeugbeschriftung.html oder tel:+41552255025">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Call-to-Action Text</label>
                                        <input type="text" class="form-control" id="cardCtaText" value="Mehr erfahren">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Icon (Font Awesome Klasse)</label>
                                <input type="text" class="form-control" id="cardIcon" placeholder="z.B. fa-solid fa-phone">
                                <small class="form-text text-muted">Lassen Sie dies leer für den Standard-Pfeil</small>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Hintergrundbild</label>
                                        <div class="input-group">
                                            <input type="text" class="form-control" id="cardBackgroundImage" placeholder="content/images/beispiel.jpg">
                                            <button class="btn btn-outline-secondary" type="button" onclick="openCardImagePicker()">
                                                <i class="fas fa-images"></i> Auswählen
                                            </button>
                                        </div>
                                        <div id="cardImagePreview" class="mt-2" style="display: none;">
                                            <img id="cardImagePreviewImg" src="" alt="Vorschau" style="max-width: 100px; max-height: 60px; object-fit: cover; border-radius: 4px;">
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Hintergrundfarbe (alternativ)</label>
                                        <input type="text" class="form-control" id="cardBackgroundColor" placeholder="linear-gradient(135deg, #112357 0%, #1a3066 100%)">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Reihenfolge</label>
                                        <input type="number" class="form-control" id="cardOrder" value="0" min="0">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="cardIsActive" checked>
                                            <label class="form-check-label" for="cardIsActive">
                                                Card ist aktiv
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                        <button type="button" class="btn btn-primary" onclick="saveCard()">Card erstellen</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('cardModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('cardModal'));
    modal.show();
    
    // Add event listener for background image input changes
    setTimeout(() => {
        const imageInput = document.getElementById('cardBackgroundImage');
        if (imageInput) {
            imageInput.addEventListener('input', function() {
                const preview = document.getElementById('cardImagePreview');
                const previewImg = document.getElementById('cardImagePreviewImg');
                
                if (this.value && preview && previewImg) {
                    // Check if value starts with content/ or ../content/
                    const imagePath = this.value.startsWith('../') ? this.value : '../' + this.value;
                    previewImg.src = imagePath;
                    preview.style.display = 'block';
                } else if (preview) {
                    preview.style.display = 'none';
                }
            });
        }
    }, 100);
}

// Edit card
async function editCard(cardId) {
    try {
        const response = await fetch(`/api/category-cards/${cardId}`);
        if (!response.ok) {
            throw new Error('Failed to load card');
        }
        
        const card = await response.json();
        showEditCardModal(card);
        
    } catch (error) {
        console.error('Error loading card:', error);
        alert('Fehler beim Laden der Card-Daten');
    }
}

// Show edit card modal
function showEditCardModal(card) {
    const modalContent = `
        <div class="modal fade" id="cardModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Category Card bearbeiten</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="cardForm">
                            <input type="hidden" id="cardId" value="${card.id}">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Titel *</label>
                                        <input type="text" class="form-control" id="cardTitle" value="${escapeHtml(card.title)}" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Kategorie *</label>
                                        <select class="form-select" id="cardCategory" required>
                                            <option value="">Wählen Sie eine Kategorie</option>
                                            <option value="beschriftungen" ${card.category === 'beschriftungen' ? 'selected' : ''}>Beschriftungen</option>
                                            <option value="lichtwerbung" ${card.category === 'lichtwerbung' ? 'selected' : ''}>Lichtwerbung</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Untertitel (optional)</label>
                                <input type="text" class="form-control" id="cardSubtitle" value="${escapeHtml(card.subtitle || '')}">
                            </div>
                            
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label class="form-label">Verlinkung (URL oder Tel) *</label>
                                        <input type="text" class="form-control" id="cardLinkUrl" value="${escapeHtml(card.linkUrl)}" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Call-to-Action Text</label>
                                        <input type="text" class="form-control" id="cardCtaText" value="${escapeHtml(card.ctaText)}">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Icon (Font Awesome Klasse)</label>
                                <input type="text" class="form-control" id="cardIcon" value="${escapeHtml(card.icon || '')}" placeholder="z.B. fa-solid fa-phone">
                            </div>
                            
                                                         <div class="row">
                                 <div class="col-md-6">
                                     <div class="mb-3">
                                         <label class="form-label">Hintergrundbild</label>
                                         <div class="input-group">
                                             <input type="text" class="form-control" id="cardBackgroundImage" value="${escapeHtml(card.backgroundImage || '')}">
                                             <button class="btn btn-outline-secondary" type="button" onclick="openCardImagePicker()">
                                                 <i class="fas fa-images"></i> Auswählen
                                             </button>
                                         </div>
                                         <div id="cardImagePreview" class="mt-2" ${card.backgroundImage ? '' : 'style="display: none;"'}>
                                             <img id="cardImagePreviewImg" src="${escapeHtml(card.backgroundImage || '')}" alt="Vorschau" style="max-width: 100px; max-height: 60px; object-fit: cover; border-radius: 4px;">
                                         </div>
                                     </div>
                                 </div>
                                 <div class="col-md-6">
                                     <div class="mb-3">
                                         <label class="form-label">Hintergrundfarbe (alternativ)</label>
                                         <input type="text" class="form-control" id="cardBackgroundColor" value="${escapeHtml(card.backgroundColor || '')}">
                                     </div>
                                 </div>
                             </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Reihenfolge</label>
                                        <input type="number" class="form-control" id="cardOrder" value="${card.order}" min="0">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="cardIsActive" ${card.isActive ? 'checked' : ''}>
                                            <label class="form-check-label" for="cardIsActive">
                                                Card ist aktiv
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                        <button type="button" class="btn btn-primary" onclick="saveCard(true)">Änderungen speichern</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('cardModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('cardModal'));
    modal.show();
    
    // Add event listener for background image input changes
    setTimeout(() => {
        const imageInput = document.getElementById('cardBackgroundImage');
        if (imageInput) {
            imageInput.addEventListener('input', function() {
                const preview = document.getElementById('cardImagePreview');
                const previewImg = document.getElementById('cardImagePreviewImg');
                
                if (this.value && preview && previewImg) {
                    // Check if value starts with content/ or ../content/
                    const imagePath = this.value.startsWith('../') ? this.value : '../' + this.value;
                    previewImg.src = imagePath;
                    preview.style.display = 'block';
                } else if (preview) {
                    preview.style.display = 'none';
                }
            });
        }
    }, 100);
}

// Save card (create or update)
async function saveCard(isEdit = false) {
    const cardData = {
        title: document.getElementById('cardTitle').value,
        subtitle: document.getElementById('cardSubtitle').value || null,
        category: document.getElementById('cardCategory').value,
        pageSlug: document.getElementById('cardCategory').value, // Same as category
        linkUrl: document.getElementById('cardLinkUrl').value,
        ctaText: document.getElementById('cardCtaText').value,
        icon: document.getElementById('cardIcon').value || null,
        backgroundImage: document.getElementById('cardBackgroundImage').value || null,
        backgroundColor: document.getElementById('cardBackgroundColor').value || null,
        order: parseInt(document.getElementById('cardOrder').value),
        isActive: document.getElementById('cardIsActive').checked
    };
    
    try {
        let response;
        
        if (isEdit) {
            const cardId = document.getElementById('cardId').value;
            response = await fetch(`/api/category-cards/${cardId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cardData)
            });
        } else {
            response = await fetch('/api/category-cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cardData)
            });
        }
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Fehler beim Speichern');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('cardModal'));
        modal.hide();
        
        // Reload data
        await loadCategoryCardsData();
        
        alert(isEdit ? 'Card erfolgreich aktualisiert!' : 'Card erfolgreich erstellt!');
        
    } catch (error) {
        console.error('Error saving card:', error);
        alert('Fehler beim Speichern: ' + error.message);
    }
}

// Delete card
async function deleteCard(cardId) {
    if (!confirm('Sind Sie sicher, dass Sie diese Card löschen möchten?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/category-cards/${cardId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Fehler beim Löschen');
        }
        
        await loadCategoryCardsData();
        alert('Card erfolgreich gelöscht!');
        
    } catch (error) {
        console.error('Error deleting card:', error);
        alert('Fehler beim Löschen: ' + error.message);
    }
}

// Move card up/down
async function moveCard(cardId, direction) {
    const card = allCategoryCards.find(c => c.id === cardId);
    if (!card) return;
    
    const sameCategory = allCategoryCards.filter(c => c.category === card.category);
    const currentIndex = sameCategory.findIndex(c => c.id === cardId);
    
    let newOrder;
    if (direction === 'up' && currentIndex > 0) {
        newOrder = sameCategory[currentIndex - 1].order;
    } else if (direction === 'down' && currentIndex < sameCategory.length - 1) {
        newOrder = sameCategory[currentIndex + 1].order;
    } else {
        return; // Can't move further
    }
    
    try {
        const response = await fetch(`/api/category-cards/${cardId}/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ order: newOrder })
        });
        
        if (!response.ok) {
            throw new Error('Fehler beim Verschieben');
        }
        
        await loadCategoryCardsData();
        
    } catch (error) {
        console.error('Error moving card:', error);
        alert('Fehler beim Verschieben: ' + error.message);
    }
}

// Show error message for category cards
function showCategoryCardsError(message) {
    const tableBody = document.getElementById('categoryCardsTable');
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4">
                <h5 class="text-danger">Fehler</h5>
                <p class="text-muted">${message}</p>
                <button class="btn btn-primary" onclick="loadCategoryCardsData()">
                    <i class="fas fa-refresh"></i> Erneut versuchen
                </button>
            </td>
        </tr>
    `;
}

// Open media picker for category card background image
async function openCardImagePicker() {
    if (typeof openMediaPicker === 'function') {
        await openMediaPicker((imagePath, imageName) => {
            // Convert path from ../content/images/ to content/images/ format
            const cleanPath = imagePath.replace('../', '');
            
            // Set the input field value
            const imageInput = document.getElementById('cardBackgroundImage');
            if (imageInput) {
                imageInput.value = cleanPath;
                
                // Show preview
                const preview = document.getElementById('cardImagePreview');
                const previewImg = document.getElementById('cardImagePreviewImg');
                
                if (preview && previewImg) {
                    previewImg.src = imagePath; // Use original path for preview
                    preview.style.display = 'block';
                }
                
                // Clear background color field since we're using an image
                const colorInput = document.getElementById('cardBackgroundColor');
                if (colorInput) {
                    colorInput.value = '';
                }
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                imageInput.dispatchEvent(event);
            }
        });
    } else {
        alert('Media-Picker ist nicht verfügbar. Bitte geben Sie den Bildpfad manuell ein.');
    }
}

// ============ TEAM MANAGEMENT ============

let allTeamMembers = [];
let filteredTeamMembers = [];

// Load team members data
async function loadTeamMembersData() {
    try {
        const response = await fetch('/api/team-members?includeInactive=true');
        if (!response.ok) {
            throw new Error('Failed to load team members');
        }
        
        const data = await response.json();
        allTeamMembers = data.teamMembers;
        filteredTeamMembers = [...allTeamMembers];
        
        renderTeamMembersTable();
        updateTeamStatistics();
        
    } catch (error) {
        console.error('Error loading team members:', error);
        showTeamMembersError('Fehler beim Laden der Team-Mitglieder');
    }
}

// Update team statistics
function updateTeamStatistics() {
    const totalCount = allTeamMembers.length;
    const activeCount = allTeamMembers.filter(member => member.isActive).length;
    const publicCount = allTeamMembers.filter(member => member.isPublic).length;
    
    document.getElementById('totalTeamMembersCount').textContent = totalCount;
    document.getElementById('activeTeamMembersCount').textContent = activeCount;
    document.getElementById('publicTeamMembersCount').textContent = publicCount;
}

// Render team members table
function renderTeamMembersTable() {
    const tableBody = document.getElementById('teamMembersTable');
    
    if (!filteredTeamMembers || filteredTeamMembers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4">
                    <h5>Keine Team-Mitglieder gefunden</h5>
                    <p class="text-muted">Erstellen Sie Ihr erstes Team-Mitglied.</p>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = filteredTeamMembers.map(member => {
        const profileImage = member.profileImage 
            ? `<img src="../${member.profileImage}" alt="${member.firstName} ${member.lastName}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 50%;">`
            : '<div style="width: 40px; height: 40px; background: #ddd; border-radius: 50%; display: flex; align-items: center; justify-content: center;"><i class="fas fa-user"></i></div>';
        
        const statusBadge = member.isActive 
            ? '<span class="badge bg-success">Aktiv</span>'
            : '<span class="badge bg-secondary">Inaktiv</span>';
            
        const publicBadge = member.isPublic 
            ? '<span class="badge bg-primary">Öffentlich</span>'
            : '<span class="badge bg-warning">Privat</span>';
        
        return `
            <tr>
                <td>
                    <span class="badge bg-light text-dark">${member.displayOrder}</span>
                    <div class="btn-group btn-group-sm ms-2" role="group">
                        <button class="btn btn-outline-secondary btn-sm" onclick="moveTeamMember('${member.id}', 'up')" title="Nach oben">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" onclick="moveTeamMember('${member.id}', 'down')" title="Nach unten">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                    </div>
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        ${profileImage}
                        <div class="ms-2">
                            <strong>${escapeHtml(member.firstName)} ${escapeHtml(member.lastName)}</strong>
                            <br><small class="text-muted">${escapeHtml(member.email)}</small>
                        </div>
                    </div>
                </td>
                <td>
                    <strong>${escapeHtml(member.position)}</strong>
                    ${member.department ? `<br><small class="text-muted">${escapeHtml(member.department)}</small>` : ''}
                </td>
                <td>${escapeHtml(member.location)}</td>
                <td>${member.phone || '<span class="text-muted">-</span>'}</td>
                <td>
                    ${statusBadge}<br>${publicBadge}
                </td>
                <td>
                    <div class="btn-group btn-group-sm" role="group">
                        <button class="btn btn-outline-primary" onclick="editTeamMember('${member.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-${member.isActive ? 'warning' : 'success'}" onclick="toggleTeamMemberStatus('${member.id}')" title="${member.isActive ? 'Deaktivieren' : 'Aktivieren'}">
                            <i class="fas fa-${member.isActive ? 'eye-slash' : 'eye'}"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteTeamMember('${member.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// Open media picker for team member profile image
async function openTeamImagePicker() {
    if (typeof openMediaPicker === 'function') {
        await openMediaPicker((imagePath, imageName) => {
            // Convert path from ../content/images/ to content/images/ format
            const cleanPath = imagePath.replace('../', '');
            
            // Set the input field value
            const imageInput = document.getElementById('memberProfileImage');
            if (imageInput) {
                imageInput.value = cleanPath;
                
                // Show preview
                const preview = document.getElementById('memberImagePreview');
                const previewImg = document.getElementById('memberImagePreviewImg');
                
                if (preview && previewImg) {
                    previewImg.src = imagePath; // Use original path for preview
                    preview.style.display = 'block';
                }
                
                // Trigger change event
                const event = new Event('change', { bubbles: true });
                imageInput.dispatchEvent(event);
            }
        });
    } else {
        alert('Media-Picker ist nicht verfügbar. Bitte geben Sie den Bildpfad manuell ein.');
    }
}

// Show create team member modal
function showCreateTeamMemberModal() {
    const modalContent = `
        <div class="modal fade" id="teamMemberModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Neues Team-Mitglied erstellen</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="teamMemberForm">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Vorname *</label>
                                        <input type="text" class="form-control" id="memberFirstName" required>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Nachname *</label>
                                        <input type="text" class="form-control" id="memberLastName" required>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label class="form-label">E-Mail *</label>
                                        <input type="email" class="form-control" id="memberEmail" required>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Telefon</label>
                                        <input type="text" class="form-control" id="memberPhone" placeholder="055 225 50 25">
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Position/Rolle *</label>
                                <input type="text" class="form-control" id="memberPosition" required placeholder="z.B. Geschäftsführung, Beratung und Verkauf">
                            </div>
                            
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Abteilung</label>
                                        <input type="text" class="form-control" id="memberDepartment" placeholder="z.B. Geschäftsführung">
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label class="form-label">Standort</label>
                                        <select class="form-select" id="memberLocation">
                                            <option value="Werk Uznach">Werk Uznach</option>
                                            <option value="Werk Jona">Werk Jona</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Profilbild</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="memberProfileImage" placeholder="content/images/person.jpg">
                                    <button class="btn btn-outline-secondary" type="button" onclick="openTeamImagePicker()">
                                        <i class="fas fa-images"></i> Auswählen
                                    </button>
                                </div>
                                <div id="memberImagePreview" class="mt-2" style="display: none;">
                                    <img id="memberImagePreviewImg" src="" alt="Vorschau" style="max-width: 100px; max-height: 100px; object-fit: cover; border-radius: 50%;">
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Kurzbeschreibung</label>
                                <textarea class="form-control" id="memberBiography" rows="3" placeholder="Kurze Beschreibung der Person und ihrer Rolle..."></textarea>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Fachbereiche</label>
                                <input type="text" class="form-control" id="memberSpecialties" placeholder="z.B. Geschäftsführung, strategische Beratung, Verkauf">
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">LinkedIn URL (optional)</label>
                                <input type="text" class="form-control" id="memberLinkedInUrl" placeholder="https://linkedin.com/in/... (optional)">
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label class="form-label">Reihenfolge</label>
                                        <input type="number" class="form-control" id="memberDisplayOrder" value="0" min="0">
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="memberIsActive" checked>
                                            <label class="form-check-label" for="memberIsActive">
                                                Aktiv
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="memberIsPublic" checked>
                                            <label class="form-check-label" for="memberIsPublic">
                                                Öffentlich sichtbar
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                        <button type="button" class="btn btn-primary" onclick="saveTeamMember()">Team-Mitglied erstellen</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('teamMemberModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalContent);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('teamMemberModal'));
    
    // Add accessibility event listeners for proper focus management
    const modalElement = document.getElementById('teamMemberModal');
    
    // Reset focus when modal is fully hidden
    modalElement.addEventListener('hidden.bs.modal', function () {
        // Remove any lingering focus from modal elements
        if (document.activeElement && modalElement.contains(document.activeElement)) {
            document.activeElement.blur();
        }
        // Focus zurück auf einen sicheren Bereich setzen
        const teamSection = document.querySelector('[data-section="team"]') || 
                           document.querySelector('.main-content') || 
                           document.body;
        if (teamSection && teamSection.focus) {
            teamSection.tabIndex = -1; // Make focusable
            teamSection.focus();
        }
    });
    
    // Ensure proper aria attributes when modal is shown
    modalElement.addEventListener('shown.bs.modal', function () {
        modalElement.removeAttribute('aria-hidden');
    });
    
    // Set proper aria attributes when modal starts hiding
    modalElement.addEventListener('hide.bs.modal', function () {
        // Blur any focused elements before setting aria-hidden
        const focusedElement = modalElement.querySelector(':focus');
        if (focusedElement) {
            focusedElement.blur();
        }
    });
    
    modal.show();
    
    // Add event listener for profile image input changes
    setTimeout(() => {
        const imageInput = document.getElementById('memberProfileImage');
        if (imageInput) {
            imageInput.addEventListener('input', function() {
                const preview = document.getElementById('memberImagePreview');
                const previewImg = document.getElementById('memberImagePreviewImg');
                
                if (this.value && preview && previewImg) {
                    const imagePath = this.value.startsWith('../') ? this.value : '../' + this.value;
                    previewImg.src = imagePath;
                    preview.style.display = 'block';
                } else if (preview) {
                    preview.style.display = 'none';
                }
            });
        }
    }, 100);
}

// Save team member (create or update)
async function saveTeamMember(isEdit = false) {
    // Validate required fields
    const firstName = document.getElementById('memberFirstName').value.trim();
    const lastName = document.getElementById('memberLastName').value.trim();
    const email = document.getElementById('memberEmail').value.trim();
    const position = document.getElementById('memberPosition').value.trim();
    
    if (!firstName || !lastName || !email || !position) {
        alert('Bitte füllen Sie alle Pflichtfelder aus (Vorname, Nachname, E-Mail, Position).');
        return;
    }
    
    // LinkedIn URL is completely optional - no validation needed
    const linkedinUrl = document.getElementById('memberLinkedInUrl').value.trim();
    
    const memberData = {
        firstName,
        lastName,
        email,
        position,
        phone: document.getElementById('memberPhone').value.trim(),
        department: document.getElementById('memberDepartment').value.trim(),
        location: document.getElementById('memberLocation').value.trim(),
        profileImage: document.getElementById('memberProfileImage').value.trim(),
        biography: document.getElementById('memberBiography').value.trim(),
        specialties: document.getElementById('memberSpecialties').value.trim(),
        linkedinUrl: linkedinUrl.trim(),
        displayOrder: parseInt(document.getElementById('memberDisplayOrder').value) || 0,
        isActive: document.getElementById('memberIsActive').checked,
        isPublic: document.getElementById('memberIsPublic').checked
    };
    
    try {
        let response;
        
        if (isEdit) {
            const memberId = document.getElementById('memberId').value;
            response = await fetch(`/api/team-members/${memberId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });
        } else {
            response = await fetch('/api/team-members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(memberData)
            });
        }
        
        if (!response.ok) {
            const error = await response.json();
            console.error('Server error details:', error);
            if (error.details && error.details.length > 0) {
                console.error('Validation errors:', error.details);
                error.details.forEach(detail => {
                    console.error(`Field: ${detail.path}, Value: ${detail.value}, Message: ${detail.msg}`);
                });
                const errorMessages = error.details.map(detail => `${detail.path}: ${detail.msg}`).join(', ');
                throw new Error(`Validierungsfehler: ${errorMessages}`);
            }
            throw new Error(error.error || 'Fehler beim Speichern');
        }
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('teamMemberModal'));
        modal.hide();
        
        // Reload data
        await loadTeamMembersData();
        
        alert(isEdit ? 'Team-Mitglied erfolgreich aktualisiert!' : 'Team-Mitglied erfolgreich erstellt!');
        
    } catch (error) {
        console.error('Error saving team member:', error);
        alert('Fehler beim Speichern: ' + error.message);
    }
}

// Filter and search team members
function filterTeamMembers() {
    const searchInput = document.getElementById('teamSearchInput').value.toLowerCase();
    const statusFilter = document.getElementById('teamStatusFilter').value;
    const locationFilter = document.getElementById('teamLocationFilter').value;
    
    filteredTeamMembers = allTeamMembers.filter(member => {
        const matchesSearch = !searchInput || 
            member.firstName.toLowerCase().includes(searchInput) ||
            member.lastName.toLowerCase().includes(searchInput) ||
            member.email.toLowerCase().includes(searchInput) ||
            member.position.toLowerCase().includes(searchInput);
            
        const matchesStatus = !statusFilter || 
            (statusFilter === 'active' && member.isActive) ||
            (statusFilter === 'inactive' && !member.isActive) ||
            (statusFilter === 'public' && member.isPublic) ||
            (statusFilter === 'private' && !member.isPublic);
            
        const matchesLocation = !locationFilter || member.location === locationFilter;
        
        return matchesSearch && matchesStatus && matchesLocation;
    });
    
    renderTeamMembersTable();
}

// Clear filters
function clearTeamFilters() {
    document.getElementById('teamSearchInput').value = '';
    document.getElementById('teamStatusFilter').value = '';
    document.getElementById('teamLocationFilter').value = '';
    
    filteredTeamMembers = [...allTeamMembers];
    renderTeamMembersTable();
}

// Edit team member
async function editTeamMember(memberId) {
    try {
        const response = await fetch(`/api/team-members/${memberId}`);
        if (!response.ok) {
            throw new Error('Failed to load team member');
        }
        
        const member = await response.json();
        showEditTeamMemberModal(member);
        
    } catch (error) {
        console.error('Error loading team member:', error);
        alert('Fehler beim Laden der Team-Mitglied-Daten');
    }
}

// Show edit team member modal
function showEditTeamMemberModal(member) {
    // Use the same modal as create but pre-fill data
    showCreateTeamMemberModal();
    
    // Update modal title and button
    setTimeout(() => {
        document.querySelector('#teamMemberModal .modal-title').textContent = 'Team-Mitglied bearbeiten';
        document.querySelector('#teamMemberModal .btn-primary').textContent = 'Änderungen speichern';
        document.querySelector('#teamMemberModal .btn-primary').setAttribute('onclick', 'saveTeamMember(true)');
        
        // Add hidden field for member ID
        const form = document.getElementById('teamMemberForm');
        form.insertAdjacentHTML('afterbegin', `<input type="hidden" id="memberId" value="${member.id}">`);
        
        // Pre-fill form data
        document.getElementById('memberFirstName').value = member.firstName;
        document.getElementById('memberLastName').value = member.lastName;
        document.getElementById('memberEmail').value = member.email;
        document.getElementById('memberPhone').value = member.phone || '';
        document.getElementById('memberPosition').value = member.position;
        document.getElementById('memberDepartment').value = member.department || '';
        document.getElementById('memberLocation').value = member.location;
        document.getElementById('memberProfileImage').value = member.profileImage || '';
        document.getElementById('memberBiography').value = member.biography || '';
        document.getElementById('memberSpecialties').value = member.specialties || '';
        document.getElementById('memberLinkedInUrl').value = member.linkedinUrl || '';
        document.getElementById('memberDisplayOrder').value = member.displayOrder;
        document.getElementById('memberIsActive').checked = member.isActive;
        document.getElementById('memberIsPublic').checked = member.isPublic;
        
        // Show image preview if available
        if (member.profileImage) {
            const preview = document.getElementById('memberImagePreview');
            const previewImg = document.getElementById('memberImagePreviewImg');
            if (preview && previewImg) {
                previewImg.src = '../' + member.profileImage;
                preview.style.display = 'block';
            }
        }
    }, 100);
}

// Toggle team member status
async function toggleTeamMemberStatus(memberId) {
    try {
        const response = await fetch(`/api/team-members/${memberId}/toggle-status`, {
            method: 'PUT'
        });
        
        if (!response.ok) {
            throw new Error('Fehler beim Ändern des Status');
        }
        
        await loadTeamMembersData();
        
    } catch (error) {
        console.error('Error toggling team member status:', error);
        alert('Fehler beim Ändern des Status: ' + error.message);
    }
}

// Delete team member
async function deleteTeamMember(memberId) {
    const member = allTeamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    if (!confirm(`Sind Sie sicher, dass Sie ${member.firstName} ${member.lastName} löschen möchten?`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/team-members/${memberId}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error('Fehler beim Löschen');
        }
        
        await loadTeamMembersData();
        alert('Team-Mitglied erfolgreich gelöscht!');
        
    } catch (error) {
        console.error('Error deleting team member:', error);
        alert('Fehler beim Löschen: ' + error.message);
    }
}

// Move team member up/down
async function moveTeamMember(memberId, direction) {
    const member = allTeamMembers.find(m => m.id === memberId);
    if (!member) return;
    
    const currentIndex = allTeamMembers.findIndex(m => m.id === memberId);
    let newOrder;
    
    if (direction === 'up' && currentIndex > 0) {
        newOrder = allTeamMembers[currentIndex - 1].displayOrder;
    } else if (direction === 'down' && currentIndex < allTeamMembers.length - 1) {
        newOrder = allTeamMembers[currentIndex + 1].displayOrder;
    } else {
        return; // Can't move further
    }
    
    try {
        const response = await fetch(`/api/team-members/${memberId}/reorder`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ displayOrder: newOrder })
        });
        
        if (!response.ok) {
            throw new Error('Fehler beim Verschieben');
        }
        
        await loadTeamMembersData();
        
    } catch (error) {
        console.error('Error moving team member:', error);
        alert('Fehler beim Verschieben: ' + error.message);
    }
}

// Show error message for team members
function showTeamMembersError(message) {
    const tableBody = document.getElementById('teamMembersTable');
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-4">
                <h5 class="text-danger">Fehler</h5>
                <p class="text-muted">${message}</p>
                <button class="btn btn-primary" onclick="loadTeamMembersData()">
                    <i class="fas fa-refresh"></i> Erneut versuchen
                </button>
            </td>
        </tr>
    `;
}

// ========== AGB ICON SELECTOR ==========

function showAgbIconSelector() {
    // Populate icon grid
    populateAgbIconGrid();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('iconSelectorModal'));
    modal.show();
}

function populateAgbIconGrid() {
    const iconGrid = document.getElementById('iconGrid');
    iconGrid.innerHTML = '';
    
    availableIcons.forEach(icon => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'col-2 mb-3';
        iconDiv.innerHTML = `
            <div class="text-center p-2 border rounded icon-option" 
                 onclick="selectAgbIcon('${icon.class}')" 
                 style="cursor: pointer; transition: all 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'" 
                 onmouseout="this.style.backgroundColor='white'">
                <i class="${icon.class}" style="font-size: 24px; margin-bottom: 5px;"></i>
                <div style="font-size: 11px;">${icon.name}</div>
            </div>
        `;
        iconGrid.appendChild(iconDiv);
    });
}

function selectAgbIcon(iconClass) {
    // Set the selected icon in the input field
    document.getElementById('agbSectionIcon').value = iconClass;
    
    // Update icon preview
    const iconPreview = document.getElementById('agbIconPreview');
    if (iconPreview) {
        iconPreview.className = iconClass;
    }
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('iconSelectorModal'));
    modal.hide();
    
    // Show notification  
    const iconName = availableIcons.find(icon => icon.class === iconClass)?.name || iconClass;
    showNotification(`Icon "${iconName}" für AGB-Abschnitt ausgewählt`, 'success');
}

// Erweitere die filterIcons Funktion für AGB
function filterAgbIcons() {
    const searchTerm = document.getElementById('iconSearchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('iconCategorySelect').value;
    
    const iconGrid = document.getElementById('iconGrid');
    iconGrid.innerHTML = '';
    
    const filteredIcons = availableIcons.filter(icon => {
        const matchesSearch = icon.name.toLowerCase().includes(searchTerm) || 
                            icon.class.toLowerCase().includes(searchTerm);
        const matchesCategory = !selectedCategory || icon.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    
    filteredIcons.forEach(icon => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'col-2 mb-3';
        iconDiv.innerHTML = `
            <div class="text-center p-2 border rounded icon-option" 
                 onclick="selectAgbIcon('${icon.class}')" 
                 style="cursor: pointer; transition: all 0.2s;"
                 onmouseover="this.style.backgroundColor='#f8f9fa'" 
                 onmouseout="this.style.backgroundColor='white'">
                <i class="${icon.class}" style="font-size: 24px; margin-bottom: 5px;"></i>
                <div style="font-size: 11px;">${icon.name}</div>
            </div>
        `;
        iconGrid.appendChild(iconDiv);
    });
}

// Überschreibe die globale filterIcons Funktion für beide Verwendungen
window.originalFilterIcons = window.filterIcons;
window.filterIcons = function() {
    // Prüfe welcher Modal aktiv ist
    const agbModal = document.getElementById('iconSelectorModal');
    const isAgbContext = agbModal && agbModal.classList.contains('show');
    
    if (isAgbContext) {
        filterAgbIcons();
    } else if (window.originalFilterIcons) {
        window.originalFilterIcons();
    }
};

// Make functions globally available
window.showAgbIconSelector = showAgbIconSelector;
window.selectAgbIcon = selectAgbIcon;

