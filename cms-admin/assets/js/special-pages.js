/**
 * Special Pages Management (Stellenangebote & News)
 * Neon Murer CMS Admin Panel
 */

// Store current special pages data
window.specialPagesData = {
    jobs: [],
    news: [],
    currentEditingId: null,
    currentType: null
};

// Initialize Special Pages Module
document.addEventListener('DOMContentLoaded', function() {

    
    // Don't override showSection, let admin.js handle it
    // The admin.js already has the hook for special-pages-section
    
    // Initialize character counters
    setupCharacterCounters();
    
    // Initialize image preview
    setupImagePreview();
});

// Load Special Pages Data
async function loadSpecialPages() {
    try {
        console.log('Loading special pages...');
        
        // Load jobs and news from their dedicated APIs
        const [jobsResponse, newsResponse] = await Promise.all([
            fetch('/api/jobs'),
            fetch('/api/news')
        ]);
        
        if (!jobsResponse.ok || !newsResponse.ok) {
            throw new Error(`HTTP error! Jobs: ${jobsResponse.status}, News: ${newsResponse.status}`);
        }
        
        const jobsData = await jobsResponse.json();
        const newsData = await newsResponse.json();
        
        console.log('Jobs API Response:', jobsData);
        console.log('News API Response:', newsData);
        
        // Store the data
        window.specialPagesData.jobs = jobsData.jobs || [];
        window.specialPagesData.news = newsData.news || [];
        
        console.log('Loaded Jobs:', window.specialPagesData.jobs.length);
        console.log('Loaded News:', window.specialPagesData.news.length);
        
        // Render the grids
        renderJobsGrid();
        renderNewsGrid();
        
        // Update counts
        updateTabCounts();
        
    } catch (error) {
        console.error('Error loading special pages:', error);
        showNotification('Fehler beim Laden der speziellen Seiten', 'error');
    }
}

// Render Jobs Grid
function renderJobsGrid() {
    const grid = document.getElementById('jobsGrid');
    const emptyState = document.getElementById('specialPagesEmpty');
    
    if (!grid) return;
    
    if (window.specialPagesData.jobs.length === 0) {
        grid.innerHTML = '';
        if (emptyState) emptyState.classList.remove('d-none');
        return;
    }
    
    if (emptyState) emptyState.classList.add('d-none');
    
    grid.innerHTML = window.specialPagesData.jobs.map(job => createJobCard(job)).join('');
}

// Render News Grid
function renderNewsGrid() {
    const grid = document.getElementById('newsGrid');
    
    if (!grid) return;
    
    if (window.specialPagesData.news.length === 0) {
        grid.innerHTML = '<div class="text-center py-4 text-muted">Keine News vorhanden</div>';
        return;
    }
    
    grid.innerHTML = window.specialPagesData.news.map(news => createNewsCard(news)).join('');
}

// Create Job Card HTML
function createJobCard(job) {
    const departmentMap = {
        'produktion': 'Produktion',
        'grafik': 'Grafik & Design',
        'montage': 'Montage & Aussendienst',
        'administration': 'Administration',
        'verkauf': 'Verkauf & Beratung'
    };
    
    const jobTypeMap = {
        'vollzeit': 'Vollzeit',
        'teilzeit': 'Teilzeit',
        'lehrstelle': 'Lehrstelle',
        'praktikum': 'Praktikum',
        'temporaer': 'Temporär'
    };
    
    const locationMap = {
        'neuhaus': 'Neuhaus',
        'uznach': 'Uznach',
        'beide': 'Beide Standorte'
    };
    
    const position = job.position || 'Unbekannte Position';
    const department = departmentMap[job.department] || job.department || '';
    const jobType = jobTypeMap[job.jobType] || job.jobType || '';
    const location = locationMap[job.location] || job.location || '';
    
    return `
        <div class="special-page-card job-card" onclick="editSpecialPage('${job.id}', 'stellenangebote')">
            <div class="special-page-header">
                <div class="special-page-meta">
                    <span class="special-page-type-badge job">
                        <i class="fas fa-briefcase"></i>
                        Stellenangebot
                    </span>
                    <span class="text-muted">•</span>
                    <span>${formatDate(job.updatedAt || job.createdAt)}</span>
                    ${job.validUntil ? `<span class="text-warning">• Läuft ab: ${formatDate(job.validUntil)}</span>` : ''}
                </div>
                <h5 class="special-page-title">${escapeHtml(job.title)}</h5>
                <div class="job-details">
                    ${position ? `<div class="job-detail-item">
                        <i class="fas fa-user-tie"></i>
                        ${escapeHtml(position)}
                    </div>` : ''}
                    ${department ? `<div class="job-detail-item">
                        <i class="fas fa-building"></i>
                        ${escapeHtml(department)}
                    </div>` : ''}
                    ${jobType ? `<div class="job-detail-item">
                        <i class="fas fa-clock"></i>
                        ${escapeHtml(jobType)}
                    </div>` : ''}
                    ${location ? `<div class="job-detail-item">
                        <i class="fas fa-map-marker-alt"></i>
                        ${escapeHtml(location)}
                    </div>` : ''}
                </div>
            </div>
            <div class="special-page-body">
                <p class="special-page-excerpt">${escapeHtml(job.excerpt || job.description || 'Keine Beschreibung verfügbar')}</p>
                ${job.requirements && job.requirements.length > 0 ? `
                <div class="job-requirements-preview">
                    <small class="text-muted">${job.requirements.length} Anforderung${job.requirements.length > 1 ? 'en' : ''}</small>
                </div>` : ''}
            </div>
            <div class="special-page-footer">
                <span class="special-page-status ${job.status ? job.status.toLowerCase() : 'draft'}">${getStatusText(job.status)}</span>
                <div class="special-page-actions" onclick="event.stopPropagation()">
                    <button class="special-page-action-btn edit" onclick="editSpecialPage('${job.id}', 'stellenangebote')">
                        <i class="fas fa-edit"></i>
                        Bearbeiten
                    </button>
                    <button class="special-page-action-btn delete" onclick="deleteSpecialPage('${job.id}', 'stellenangebote')">
                        <i class="fas fa-trash"></i>
                        Löschen
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Create News Card HTML
function createNewsCard(news) {
    const categoryMap = {
        'unternehmen': 'Unternehmen',
        'projekte': 'Projekte',
        'technologie': 'Technologie',
        'team': 'Team',
        'events': 'Events'
    };
    
    const category = categoryMap[news.category] || news.category || 'Unternehmen';
    const newsDate = news.newsDate || news.createdAt;
    
    return `
        <div class="special-page-card news-card" onclick="editSpecialPage('${news.id}', 'news')">
            <div class="special-page-header">
                <div class="special-page-meta">
                    <span class="special-page-type-badge news">
                        <i class="fas fa-newspaper"></i>
                        News
                        ${news.isBreaking ? '<span class="badge bg-danger ms-1">EILMELDUNG</span>' : ''}
                        ${news.isFeatured ? '<span class="badge bg-warning ms-1">FEATURED</span>' : ''}
                    </span>
                    <span class="text-muted">•</span>
                    <span>${formatDate(newsDate)}</span>
                </div>
                <h5 class="special-page-title">${escapeHtml(news.title)}</h5>
                <div class="news-date">
                    <i class="fas fa-calendar-alt"></i>
                    <span>${formatDate(newsDate)}</span>
                    <span class="news-category">
                        <i class="fas fa-tag"></i>
                        ${escapeHtml(category)}
                    </span>
                </div>
            </div>
            <div class="special-page-body">
                <p class="special-page-excerpt">${escapeHtml(news.excerpt || 'Keine Beschreibung verfügbar')}</p>
                ${news.slug ? `<div class="news-slug-preview">
                    <small class="text-muted">Slug: ${escapeHtml(news.slug)}</small>
                </div>` : ''}
            </div>
            <div class="special-page-footer">
                <span class="special-page-status ${news.status ? news.status.toLowerCase() : 'draft'}">${getStatusText(news.status)}</span>
                <div class="special-page-actions" onclick="event.stopPropagation()">
                    <button class="special-page-action-btn edit" onclick="editSpecialPage('${news.id}', 'news')">
                        <i class="fas fa-edit"></i>
                        Bearbeiten
                    </button>
                    <button class="special-page-action-btn delete" onclick="deleteSpecialPage('${news.id}', 'news')">
                        <i class="fas fa-trash"></i>
                        Löschen
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Open Special Page Modal
window.openSpecialPageModal = function(type, id = null) {
    const modal = new bootstrap.Modal(document.getElementById('specialPageModal'));
    const modalTitle = document.getElementById('specialPageModalLabel');
    const typeField = document.getElementById('specialPageType');
    
    // Reset form
    document.getElementById('specialPageForm').reset();
    clearFormValidation();
    
    // Set type
    typeField.value = type;
    window.specialPagesData.currentType = type;
    window.specialPagesData.currentEditingId = id;
    
    // Update modal title and show/hide type-specific fields
    if (type === 'stellenangebote') {
        modalTitle.innerHTML = '<i class="fas fa-briefcase me-2"></i>' + (id ? 'Stellenangebot bearbeiten' : 'Neues Stellenangebot');
        document.getElementById('jobSpecificFields').classList.remove('d-none');
        document.getElementById('newsSpecificFields').classList.add('d-none');
        document.getElementById('jobRequirementsCard').classList.remove('d-none');
        document.getElementById('jobValidUntilContainer').classList.remove('d-none');
    } else {
        modalTitle.innerHTML = '<i class="fas fa-newspaper me-2"></i>' + (id ? 'News bearbeiten' : 'Neue News');
        document.getElementById('jobSpecificFields').classList.add('d-none');
        document.getElementById('newsSpecificFields').classList.remove('d-none');
        document.getElementById('jobRequirementsCard').classList.add('d-none');
        document.getElementById('jobValidUntilContainer').classList.add('d-none');
    }
    
    // Load existing data if editing
    if (id) {
        loadSpecialPageData(id, type);
    } else {
        // Set defaults for new entries
        setDefaultValues(type);
    }
    
    modal.show();
};

// Load Special Page Data for editing
async function loadSpecialPageData(id, type) {
    try {
        const apiEndpoint = type === 'stellenangebote' ? `/api/jobs/${id}` : `/api/news/${id}`;
        const response = await fetch(apiEndpoint);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        populateForm(data, type);
        
    } catch (error) {
        console.error('Error loading special page data:', error);
        showNotification('Fehler beim Laden der Seite', 'error');
    }
}

// Populate form with data
function populateForm(data, type) {
    console.log('Populating form with data:', data, 'Type:', type);
    
    // Basic fields
    document.getElementById('specialPageTitle').value = data.title || '';
    document.getElementById('specialPageExcerpt').value = data.excerpt || data.description || '';
    document.getElementById('specialPageContent').innerHTML = data.content || '';
    document.getElementById('specialPageStatus').value = data.status || 'DRAFT';
    document.getElementById('specialPageAuthor').value = data.author || 'Administrator';
    document.getElementById('specialPageShowOnWebsite').checked = data.showOnWebsite !== undefined ? data.showOnWebsite : true;
    
    // Featured image
    const featuredImage = data.featuredImage || '';
    document.getElementById('specialPageFeaturedImage').value = featuredImage;
    updateImagePreview(featuredImage);
    
    // SEO fields
    document.getElementById('specialPageMetaTitle').value = data.metaTitle || '';
    document.getElementById('specialPageMetaDescription').value = data.metaDescription || '';
    document.getElementById('specialPageKeywords').value = data.keywords || '';
    
    // Type-specific fields
    if (type === 'stellenangebote') {
        document.getElementById('jobPosition').value = data.position || '';
        document.getElementById('jobDepartment').value = data.department || '';
        document.getElementById('jobType').value = data.jobType || 'vollzeit';
        document.getElementById('jobLocation').value = data.location || 'neuhaus';
        
        // Format date for input field
        const validUntil = data.validUntil ? new Date(data.validUntil).toISOString().split('T')[0] : '';
        document.getElementById('jobValidUntil').value = validUntil;
        
        // Load requirements
        if (data.requirements && data.requirements.length > 0) {
            const requirementTexts = data.requirements.map(req => req.text || req);
            loadRequirements(requirementTexts);
        } else {
            loadRequirements([]);
        }
    } else {
        document.getElementById('newsCategory').value = data.category || 'unternehmen';
        
        // Format date for input field
        const newsDate = data.newsDate ? new Date(data.newsDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        document.getElementById('newsDate').value = newsDate;
        
        // News-specific checkboxes
        document.getElementById('newsIsFeatured').checked = data.isFeatured || false;
        document.getElementById('newsIsBreaking').checked = data.isBreaking || false;
    }
    
    // Update character counters
    updateCharacterCounters();
}

// Set default values for new entries
function setDefaultValues(type) {
    // Set current date
    const today = new Date().toISOString().split('T')[0];
    
    if (type === 'news') {
        document.getElementById('newsDate').value = today;
    } else {
        // Set job valid until 3 months from now
        const futureDate = new Date();
        futureDate.setMonth(futureDate.getMonth() + 3);
        document.getElementById('jobValidUntil').value = futureDate.toISOString().split('T')[0];
    }
    
    document.getElementById('specialPageShowOnWebsite').checked = true;
}

// Save Special Page
window.saveSpecialPage = async function() {
    const form = document.getElementById('specialPageForm');
    
    if (!validateForm()) {
        return;
    }
    
    const formData = collectFormData();
    const isEdit = window.specialPagesData.currentEditingId !== null;
    const type = window.specialPagesData.currentType;
    
    try {
        // Determine API endpoint
        const baseUrl = type === 'stellenangebote' ? '/api/jobs' : '/api/news';
        const url = isEdit 
            ? `${baseUrl}/${window.specialPagesData.currentEditingId}`
            : baseUrl;
        
        const method = isEdit ? 'PUT' : 'POST';
        
        console.log('Saving to:', url, 'Method:', method, 'Data:', formData);
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error response:', errorData);
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const savedData = await response.json();
        console.log('Saved successfully:', savedData);
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('specialPageModal'));
        modal.hide();
        
        // Reload data
        await loadSpecialPages();
        
        showNotification(
            isEdit ? `${type === 'stellenangebote' ? 'Stellenangebot' : 'News'} erfolgreich aktualisiert` : `${type === 'stellenangebote' ? 'Stellenangebot' : 'News'} erfolgreich erstellt`, 
            'success'
        );
        
    } catch (error) {
        console.error('Error saving special page:', error);
        showNotification('Fehler beim Speichern', 'error');
    }
};

// Collect form data
function collectFormData() {
    const type = window.specialPagesData.currentType;
    const baseData = {
        title: document.getElementById('specialPageTitle').value,
        excerpt: document.getElementById('specialPageExcerpt').value,
        content: document.getElementById('specialPageContent').innerHTML,
        status: document.getElementById('specialPageStatus').value,
        showOnWebsite: document.getElementById('specialPageShowOnWebsite').checked,
        author: document.getElementById('specialPageAuthor').value,
        featuredImage: document.getElementById('specialPageFeaturedImage').value,
        metaTitle: document.getElementById('specialPageMetaTitle').value,
        metaDescription: document.getElementById('specialPageMetaDescription').value,
        keywords: document.getElementById('specialPageKeywords').value
    };
    
    // Type-specific fields
    if (type === 'stellenangebote') {
        return {
            ...baseData,
            position: document.getElementById('jobPosition').value,
            department: document.getElementById('jobDepartment').value,
            jobType: document.getElementById('jobType').value,
            location: document.getElementById('jobLocation').value,
            validUntil: document.getElementById('jobValidUntil').value || null,
            requirements: collectRequirements()
        };
    } else {
        return {
            ...baseData,
            category: document.getElementById('newsCategory').value,
            newsDate: document.getElementById('newsDate').value,
            isFeatured: document.getElementById('newsIsFeatured').checked,
            isBreaking: document.getElementById('newsIsBreaking').checked
        };
    }
}

// Validate form
function validateForm() {
    const title = document.getElementById('specialPageTitle').value.trim();
    const content = document.getElementById('specialPageContent').innerHTML.trim();
    
    if (!title) {
        showNotification('Bitte geben Sie einen Titel ein', 'error');
        document.getElementById('specialPageTitle').focus();
        return false;
    }
    
    if (!content || content === '<br>') {
        showNotification('Bitte geben Sie Inhalt ein', 'error');
        document.getElementById('specialPageContent').focus();
        return false;
    }
    
    return true;
}

// Requirements management
window.addRequirement = function() {
    const container = document.getElementById('jobRequirements');
    const newRequirement = document.createElement('div');
    newRequirement.className = 'requirement-item mb-2';
    newRequirement.innerHTML = `
        <div class="input-group">
            <span class="input-group-text">
                <i class="fas fa-check-circle text-primary"></i>
            </span>
            <input type="text" class="form-control" placeholder="Anforderung eingeben">
            <button class="btn btn-outline-danger" type="button" onclick="removeRequirement(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    container.appendChild(newRequirement);
};

window.removeRequirement = function(button) {
    const requirementItem = button.closest('.requirement-item');
    if (requirementItem) {
        requirementItem.remove();
    }
};

function loadRequirements(requirements) {
    const container = document.getElementById('jobRequirements');
    container.innerHTML = '';
    
    if (Array.isArray(requirements)) {
        requirements.forEach(requirement => {
            const requirementItem = document.createElement('div');
            requirementItem.className = 'requirement-item mb-2';
            requirementItem.innerHTML = `
                <div class="input-group">
                    <span class="input-group-text">
                        <i class="fas fa-check-circle text-primary"></i>
                    </span>
                    <input type="text" class="form-control" value="${escapeHtml(requirement)}" placeholder="Anforderung eingeben">
                    <button class="btn btn-outline-danger" type="button" onclick="removeRequirement(this)">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            container.appendChild(requirementItem);
        });
    }
    
    // Add one empty requirement if none exist
    if (container.children.length === 0) {
        window.addRequirement();
    }
}

function collectRequirements() {
    const inputs = document.querySelectorAll('#jobRequirements input[type="text"]');
    return Array.from(inputs)
        .map(input => input.value.trim())
        .filter(value => value.length > 0);
}

// Text formatting for content editor
window.formatSpecialPageText = function(command) {
    document.execCommand(command, false, null);
    document.getElementById('specialPageContent').focus();
};

window.insertSpecialPageLink = function() {
    const url = prompt('Link-URL eingeben:');
    if (url) {
        const text = window.getSelection().toString() || 'Link-Text';
        document.execCommand('insertHTML', false, `<a href="${url}" target="_blank">${text}</a>`);
    }
};

// Preview functionality
window.previewSpecialPage = function() {
    const formData = collectFormData();
    const previewWindow = window.open('', '_blank');
    
    const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>${formData.title} - Preview</title>
            <style>
                body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
                .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 20px; }
                .meta { color: #666; font-size: 14px; margin-bottom: 10px; }
                .content { line-height: 1.6; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>${formData.title}</h1>
                <div class="meta">
                    ${formData.metadata.type === 'stellenangebote' ? 'Stellenangebot' : 'News'} | 
                    Status: ${formData.status} | 
                    Autor: ${formData.author}
                </div>
                ${formData.description ? `<p><strong>${formData.description}</strong></p>` : ''}
            </div>
            <div class="content">
                ${formData.content}
            </div>
        </body>
        </html>
    `;
    
    previewWindow.document.write(html);
    previewWindow.document.close();
};

// Delete Special Page
window.deleteSpecialPage = async function(id, type) {
    const itemName = type === 'stellenangebote' ? 'Stellenangebot' : 'News';
    
    if (!confirm(`Sind Sie sicher, dass Sie dieses ${itemName} löschen möchten?`)) {
        return;
    }
    
    try {
        const baseUrl = type === 'stellenangebote' ? '/api/jobs' : '/api/news';
        const response = await fetch(`${baseUrl}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await loadSpecialPages();
        showNotification(`${itemName} erfolgreich gelöscht`, 'success');
        
    } catch (error) {
        console.error('Error deleting special page:', error);
        showNotification(`Fehler beim Löschen des ${itemName}s`, 'error');
    }
};

// Edit Special Page
window.editSpecialPage = function(id, type) {
    window.openSpecialPageModal(type, id);
};

// Refresh Special Pages
window.refreshSpecialPages = function() {
    loadSpecialPages();
    showNotification('Daten aktualisiert', 'info');
};

// Filter functions
window.applyJobsFilter = function() {
    const searchTerm = document.getElementById('jobsSearch').value.toLowerCase();
    const statusFilter = document.getElementById('jobsStatusFilter').value;
    
    const filteredJobs = window.specialPagesData.jobs.filter(job => {
        const matchesSearch = !searchTerm || 
            job.title.toLowerCase().includes(searchTerm) ||
            (job.metadata?.position || '').toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || job.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderFilteredJobs(filteredJobs);
};

window.applyNewsFilter = function() {
    const searchTerm = document.getElementById('newsSearch').value.toLowerCase();
    const statusFilter = document.getElementById('newsStatusFilter').value;
    
    const filteredNews = window.specialPagesData.news.filter(news => {
        const matchesSearch = !searchTerm || 
            news.title.toLowerCase().includes(searchTerm) ||
            (news.metadata?.category || '').toLowerCase().includes(searchTerm);
        
        const matchesStatus = !statusFilter || news.status === statusFilter;
        
        return matchesSearch && matchesStatus;
    });
    
    renderFilteredNews(filteredNews);
};

function renderFilteredJobs(jobs) {
    const grid = document.getElementById('jobsGrid');
    grid.innerHTML = jobs.map(job => createJobCard(job)).join('');
}

function renderFilteredNews(news) {
    const grid = document.getElementById('newsGrid');
    grid.innerHTML = news.map(item => createNewsCard(item)).join('');
}

// Update tab counts
function updateTabCounts() {
    const jobsCount = document.getElementById('jobsCount');
    const newsCount = document.getElementById('newsCount');
    
    if (jobsCount) jobsCount.textContent = window.specialPagesData.jobs.length;
    if (newsCount) newsCount.textContent = window.specialPagesData.news.length;
}

// Character counters
function setupCharacterCounters() {
    const metaTitle = document.getElementById('specialPageMetaTitle');
    const metaDescription = document.getElementById('specialPageMetaDescription');
    
    if (metaTitle) {
        metaTitle.addEventListener('input', () => updateCharacterCounters());
    }
    
    if (metaDescription) {
        metaDescription.addEventListener('input', () => updateCharacterCounters());
    }
}

function updateCharacterCounters() {
    const metaTitle = document.getElementById('specialPageMetaTitle');
    const metaDescription = document.getElementById('specialPageMetaDescription');
    const titleCount = document.getElementById('specialPageMetaTitleCount');
    const descCount = document.getElementById('specialPageMetaDescCount');
    
    if (metaTitle && titleCount) {
        titleCount.textContent = metaTitle.value.length;
    }
    
    if (metaDescription && descCount) {
        descCount.textContent = metaDescription.value.length;
    }
}

// Image preview
function setupImagePreview() {
    const imageInput = document.getElementById('specialPageFeaturedImage');
    if (imageInput) {
        imageInput.addEventListener('input', (e) => {
            updateImagePreview(e.target.value);
        });
    }
}

function updateImagePreview(imageUrl) {
    const previewImg = document.getElementById('specialPagePreviewImg');
    
    if (previewImg) {
        if (imageUrl && imageUrl.trim()) {
            previewImg.src = imageUrl;
            previewImg.classList.remove('d-none');
            
            previewImg.onerror = function() {
                this.classList.add('d-none');
            };
        } else {
            previewImg.classList.add('d-none');
        }
    }
}

// Utility functions
function formatDate(dateString) {
    if (!dateString) return 'Unbekannt';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('de-DE', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function escapeHtml(text) {
    if (!text) return '';
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function getStatusText(status) {
    const statusMap = {
        'PUBLISHED': 'Veröffentlicht',
        'DRAFT': 'Entwurf',
        'ARCHIVED': 'Archiviert',
        'published': 'Veröffentlicht',
        'draft': 'Entwurf',
        'archived': 'Archiviert'
    };
    return statusMap[status] || 'Unbekannt';
}

function clearFormValidation() {
    // Clear any validation classes or messages
    const form = document.getElementById('specialPageForm');
    const invalidElements = form.querySelectorAll('.is-invalid');
    invalidElements.forEach(el => el.classList.remove('is-invalid'));
}

function showNotification(message, type = 'info') {
    // Use admin.js showNotification if available, but avoid recursion
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // Simple auto-disappearing notification fallback
        const alertClass = type === 'error' ? 'danger' : type;
        const alertHtml = `
            <div class="alert alert-${alertClass} fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; max-width: 400px;">
                ${message}
            </div>
        `;
    document.body.insertAdjacentHTML('beforeend', alertHtml);
    
        // Auto-remove after 1.5 seconds
        setTimeout(() => {
            const alert = document.querySelector('.alert:last-child');
            if (alert) {
                try {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                } catch (e) {
                    alert.remove();
                }
            }
        }, 1500);
    }
}

// Export for global access
window.SpecialPages = {
    loadSpecialPages,
    openSpecialPageModal,
    saveSpecialPage,
    deleteSpecialPage,
    editSpecialPage,
    refreshSpecialPages,
    applyJobsFilter,
    applyNewsFilter,
    addRequirement,
    removeRequirement,
    formatSpecialPageText,
    insertSpecialPageLink,
    previewSpecialPage
};

// Also make loadSpecialPages available globally for admin.js
window.loadSpecialPages = loadSpecialPages;

 