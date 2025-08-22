// ========== COMPANY HISTORY MANAGEMENT ==========

let companyHistoryData = null;
let currentChapters = [];
let isEditingChapter = false;

// ========== INITIALIZATION ==========

function initCompanyHistory() {
    console.log('🏢 Initializing Company History section...');
    loadCompanyHistory();
}

// ========== DATA LOADING ==========

async function loadCompanyHistory() {
    try {
        console.log('📚 Loading company history data...');
        showLoading('chaptersContainer');
        
        const response = await fetch('/api/company-history', {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        companyHistoryData = await response.json();
        populateHistoryForm();
        loadChapters();
        
    } catch (error) {
        console.error('Error loading company history:', error);
        showNotification('Fehler beim Laden der Firmengeschichte', 'error');
        hideLoading('chaptersContainer');
    }
}

function populateHistoryForm() {
    if (!companyHistoryData) return;
    
    document.getElementById('historyHeroTitle').value = companyHistoryData.title || '';
    document.getElementById('historyHeroSubtitle').value = companyHistoryData.subtitle || '';
    document.getElementById('historyHeroBackground').value = companyHistoryData.heroBackgroundImage || '';
    document.getElementById('historyFinaleTitle').value = companyHistoryData.finaleTitle || '';
    document.getElementById('historyFinaleText').value = companyHistoryData.finaleText || '';
}

async function loadChapters() {
    try {
        console.log('📖 Loading chapters from API...');
        const response = await fetch('/api/company-history/chapters', {
            headers: getAuthHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        currentChapters = data.chapters || [];
        renderChapters();
        
    } catch (error) {
        console.error('Error loading chapters:', error);
        showNotification('Fehler beim Laden der Kapitel', 'error');
    } finally {
        hideLoading('chaptersContainer');
    }
}

// ========== CHAPTER RENDERING ==========

function renderChapters() {
    const container = document.getElementById('chaptersContainer');
    
    if (currentChapters.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4 text-muted">
                <i class="fas fa-book-open fa-3x mb-3"></i>
                <p>Noch keine Kapitel vorhanden.</p>
                <button class="btn btn-primary" onclick="addNewChapter()">
                    <i class="fas fa-plus"></i> Erstes Kapitel erstellen
                </button>
            </div>
        `;
        return;
    }
    
    let html = '<div class="chapters-list" id="chaptersList">';
    
    currentChapters.forEach((chapter, index) => {
        html += renderChapterCard(chapter, index);
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Initialize sortable
    if (typeof Sortable !== 'undefined') {
        new Sortable(document.getElementById('chaptersList'), {
            animation: 150,
            handle: '.chapter-drag-handle',
            onEnd: function(evt) {
                reorderChapters(evt.oldIndex, evt.newIndex);
            }
        });
    }
}

function renderChapterCard(chapter, index) {
    const layoutIcon = chapter.layoutDirection === 'LEFT' ? 'fa-align-left' : 'fa-align-right';
    const layoutText = chapter.layoutDirection === 'LEFT' ? 'Links' : 'Rechts';
    
    return `
        <div class="card mb-3 chapter-card" data-chapter-id="${chapter.id}">
            <div class="card-header d-flex justify-content-between align-items-center">
                <div class="d-flex align-items-center">
                    <i class="fas fa-grip-vertical chapter-drag-handle me-2 text-muted" style="cursor: move;"></i>
                    <span class="badge bg-primary me-2">${index + 1}</span>
                    <h6 class="mb-0">${chapter.year} - ${chapter.title}</h6>
                </div>
                <div class="d-flex align-items-center gap-2">
                    <span class="badge bg-secondary">
                        <i class="fas ${layoutIcon}"></i> ${layoutText}
                    </span>
                    <button class="btn btn-sm btn-outline-primary" onclick="editChapter('${chapter.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteChapter('${chapter.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <p class="text-muted mb-1"><strong>Text:</strong></p>
                        <p class="mb-2">${chapter.text.substring(0, 150)}${chapter.text.length > 150 ? '...' : ''}</p>
                    </div>
                    <div class="col-md-6">
                        <div class="row">
                            <div class="col-6">
                                <p class="text-muted mb-1"><strong>Hintergrundbild:</strong></p>
                                ${chapter.backgroundImage ? 
                                    `<img src="${chapter.backgroundImage}" class="img-thumbnail" style="max-height: 60px;">` : 
                                    '<span class="text-muted">Nicht gesetzt</span>'
                                }
                            </div>
                            <div class="col-6">
                                <p class="text-muted mb-1"><strong>Vordergrundbild:</strong></p>
                                ${chapter.foregroundImage ? 
                                    `<img src="${chapter.foregroundImage}" class="img-thumbnail" style="max-height: 60px;">` : 
                                    '<span class="text-muted">Nicht gesetzt</span>'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ========== CHAPTER MANAGEMENT ==========

function addNewChapter() {
    const modal = createChapterModal();
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
    
    // Auto-set layout direction
    const layoutSelect = modal.querySelector('#chapterLayoutDirection');
    layoutSelect.value = currentChapters.length % 2 === 0 ? 'LEFT' : 'RIGHT';
}

function editChapter(chapterId) {
    const chapter = currentChapters.find(c => c.id === chapterId);
    if (!chapter) return;
    
    const modal = createChapterModal(chapter);
    document.body.appendChild(modal);
    
    const bootstrapModal = new bootstrap.Modal(modal);
    bootstrapModal.show();
}

function createChapterModal(chapter = null) {
    const isEdit = chapter !== null;
    const modalId = 'chapterModal_' + Date.now();
    
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = modalId;
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-book-open me-2"></i>
                        ${isEdit ? 'Kapitel bearbeiten' : 'Neues Kapitel'}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="chapterForm">
                        <div class="row g-3">
                            <div class="col-md-4">
                                <label class="form-label">Jahr/Zeitraum *</label>
                                <input type="text" class="form-control" id="chapterYear" 
                                       value="${chapter?.year || ''}" 
                                       placeholder="z.B. 1948 oder 1990er" required>
                            </div>
                            <div class="col-md-8">
                                <label class="form-label">Titel *</label>
                                <input type="text" class="form-control" id="chapterTitle" 
                                       value="${chapter?.title || ''}" 
                                       placeholder="z.B. Die Vision von Josef Murer" required>
                            </div>
                            <div class="col-12">
                                <label class="form-label">Text *</label>
                                <textarea class="form-control" id="chapterText" rows="4" 
                                          placeholder="Beschreibungstext für das Kapitel..." required>${chapter?.text || ''}</textarea>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Hintergrundbild</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="chapterBackgroundImage" 
                                           value="${chapter?.backgroundImage || ''}" 
                                           placeholder="URL des Hintergrundbildes">
                                    <button class="btn btn-outline-secondary" type="button" 
                                            onclick="openMediaPickerForCompanyHistory('chapterBackgroundImage')">
                                        <i class="fas fa-image"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Vordergrundbild</label>
                                <div class="input-group">
                                    <input type="text" class="form-control" id="chapterForegroundImage" 
                                           value="${chapter?.foregroundImage || ''}" 
                                           placeholder="URL des Vordergrundbildes">
                                    <button class="btn btn-outline-secondary" type="button" 
                                            onclick="openMediaPickerForCompanyHistory('chapterForegroundImage')">
                                        <i class="fas fa-image"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Bild Alt-Text</label>
                                <input type="text" class="form-control" id="chapterImageAlt" 
                                       value="${chapter?.imageAlt || ''}" 
                                       placeholder="Alt-Text für Vordergrundbild">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Layout-Richtung</label>
                                <select class="form-select" id="chapterLayoutDirection">
                                    <option value="LEFT" ${chapter?.layoutDirection === 'LEFT' ? 'selected' : ''}>Links</option>
                                    <option value="RIGHT" ${chapter?.layoutDirection === 'RIGHT' ? 'selected' : ''}>Rechts</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Abbrechen</button>
                    <button type="button" class="btn btn-primary" onclick="saveChapter('${chapter?.id || ''}', '${modalId}')">
                        <i class="fas fa-save"></i> ${isEdit ? 'Änderungen speichern' : 'Kapitel erstellen'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return modal;
}

async function saveChapter(chapterId, modalId) {
    const form = document.getElementById('chapterForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const chapterData = {
        year: document.getElementById('chapterYear').value,
        title: document.getElementById('chapterTitle').value,
        text: document.getElementById('chapterText').value,
        backgroundImage: document.getElementById('chapterBackgroundImage').value || null,
        foregroundImage: document.getElementById('chapterForegroundImage').value || null,
        imageAlt: document.getElementById('chapterImageAlt').value || null,
        layoutDirection: document.getElementById('chapterLayoutDirection').value
    };
    
    try {
        const url = chapterId ? `/api/company-history/chapters/${chapterId}` : '/api/company-history/chapters';
        const method = chapterId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify(chapterData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification(chapterId ? 'Kapitel erfolgreich aktualisiert' : 'Kapitel erfolgreich erstellt', 'success');
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
        modal.hide();
        document.getElementById(modalId).remove();
        
        // Reload chapters
        await loadChapters();
        
    } catch (error) {
        console.error('Error saving chapter:', error);
        showNotification('Fehler beim Speichern des Kapitels', 'error');
    }
}

async function deleteChapter(chapterId) {
    if (!confirm('Möchten Sie dieses Kapitel wirklich löschen?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/company-history/chapters/${chapterId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification('Kapitel erfolgreich gelöscht', 'success');
        await loadChapters();
        
    } catch (error) {
        console.error('Error deleting chapter:', error);
        showNotification('Fehler beim Löschen des Kapitels', 'error');
    }
}

async function reorderChapters(oldIndex, newIndex) {
    if (oldIndex === newIndex) return;
    
    // Reorder array
    const movedChapter = currentChapters.splice(oldIndex, 1)[0];
    currentChapters.splice(newIndex, 0, movedChapter);
    
    // Update order numbers and alternating layout
    const reorderedChapters = currentChapters.map((chapter, index) => ({
        id: chapter.id,
        order: index
    }));
    
    try {
        const response = await fetch('/api/company-history/chapters/reorder', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ chapters: reorderedChapters })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification('Kapitel-Reihenfolge erfolgreich aktualisiert', 'success');
        await loadChapters();
        
    } catch (error) {
        console.error('Error reordering chapters:', error);
        showNotification('Fehler beim Neuordnen der Kapitel', 'error');
        // Reload to restore original order
        await loadChapters();
    }
}

// ========== SAVE FUNCTIONS ==========

async function saveCompanyHistory() {
    const historyData = {
        title: document.getElementById('historyHeroTitle').value,
        subtitle: document.getElementById('historyHeroSubtitle').value,
        heroBackgroundImage: document.getElementById('historyHeroBackground').value || null,
        finaleTitle: document.getElementById('historyFinaleTitle').value,
        finaleText: document.getElementById('historyFinaleText').value
    };
    
    try {
        const response = await fetch('/api/company-history', {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(historyData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        showNotification('Firmengeschichte erfolgreich gespeichert', 'success');
        
    } catch (error) {
        console.error('Error saving company history:', error);
        showNotification('Fehler beim Speichern der Firmengeschichte', 'error');
    }
}

function refreshCompanyHistory() {
    loadCompanyHistory();
    showNotification('Firmengeschichte aktualisiert', 'info');
}

// ========== UTILITY FUNCTIONS ==========

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    element.innerHTML = `
        <div class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Laden...</span>
            </div>
        </div>
    `;
}

function hideLoading(elementId) {
    // Loading is hidden when content is populated
}

// ========== MEDIA PICKER INTEGRATION ==========

function openMediaPickerForCompanyHistory(targetInputId) {
    if (typeof window.openMediaPicker === 'function') {
        window.openMediaPicker((imagePath, imageName) => {
            // Set the selected image URL to the target input
            const targetInput = document.getElementById(targetInputId);
            if (targetInput) {
                targetInput.value = imagePath;
                console.log(`✅ Media selected for ${targetInputId}: ${imageName}`);
                showNotification(`Bild ausgewählt: ${imageName}`, 'success');
            }
        });
    } else {
        console.error('❌ MediaPicker not available');
        showNotification('Media Picker ist nicht verfügbar', 'error');
    }
}

// Make functions globally available for admin.js
window.initCompanyHistory = initCompanyHistory;
window.openMediaPickerForCompanyHistory = openMediaPickerForCompanyHistory;