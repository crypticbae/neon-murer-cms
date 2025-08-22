/*!
 * Dienstleistungen CMS Management
 * Verwaltung von Dienstleistungen-Seite und Services-Karussell
 * Version: 1.0.0
 */

// Global variables
let currentServices = [];
let editingServiceId = null;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {

});

// Listen for section changes
document.addEventListener('sectionChanged', function(event) {
    if (event.detail.sectionId === 'dienstleistungen-section') {
        console.log('📋 Dienstleistungen Sektion geladen');
        loadDienstleistungenData();
    }
});

// ========== DATA LOADING ==========

async function loadDienstleistungenData() {
    try {
        // Load page data
        await loadPageData();
        
        // Load services
        await loadServicesData();
        
        // Setup event listeners
        setupEventListeners();
        
        console.log('✅ Dienstleistungen-Daten geladen');
    } catch (error) {
        console.error('❌ Fehler beim Laden der Dienstleistungen-Daten:', error);
        showNotification('Fehler beim Laden der Daten', 'error');
    }
}

async function loadPageData() {
    try {
        const response = await fetch('/api/dienstleistungen');
        
        if (response.ok) {
            const result = await response.json();
            const page = result.data;
            
            // Fill form fields
            document.getElementById('dienstleistungenTitle').value = page.title || '';
            document.getElementById('dienstleistungenSubtitle').value = page.subtitle || '';
            document.getElementById('dienstleistungenDescription').value = page.description || '';
        } else {
            console.warn('No page data found, using defaults');
        }
    } catch (error) {
        console.error('Fehler beim Laden der Seiten-Daten:', error);
    }
}

async function loadServicesData() {
    try {
        const response = await fetch('/api/dienstleistungen/services');
        
        if (response.ok) {
            const result = await response.json();
            currentServices = result.data || [];
            renderServicesTable();
        } else {
            console.warn('No services found');
            currentServices = [];
            renderServicesTable();
        }
    } catch (error) {
        console.error('Fehler beim Laden der Services:', error);
        showNotification('Fehler beim Laden der Services', 'error');
        currentServices = [];
        renderServicesTable();
    }
}

// ========== EVENT LISTENERS ==========

function setupEventListeners() {
    // Page save button
    const savePageBtn = document.getElementById('saveDienstleistungenPage');
    if (savePageBtn) {
        savePageBtn.addEventListener('click', savePage);
    }
    
    // Service modal save button
    const saveServiceBtn = document.getElementById('saveService');
    if (saveServiceBtn) {
        saveServiceBtn.addEventListener('click', saveService);
    }
    
    // Service modal delete button
    const deleteServiceBtn = document.getElementById('deleteService');
    if (deleteServiceBtn) {
        deleteServiceBtn.addEventListener('click', deleteService);
    }
    
    // Icon class change listener
    const iconClassInput = document.getElementById('serviceIconClass');
    if (iconClassInput) {
        iconClassInput.addEventListener('change', updateIconPreview);
    }
}

// ========== PAGE MANAGEMENT ==========

async function savePage() {
    try {
        const title = document.getElementById('dienstleistungenTitle').value.trim();
        const subtitle = document.getElementById('dienstleistungenSubtitle').value.trim();
        const description = document.getElementById('dienstleistungenDescription').value.trim();
        
        if (!title || !subtitle || !description) {
            showNotification('Bitte füllen Sie alle Felder aus', 'warning');
            return;
        }
        
        const response = await fetch('/api/dienstleistungen', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title,
                subtitle,
                description
            })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Seiten-Inhalt erfolgreich gespeichert!', 'success');
        } else {
            throw new Error(result.error || 'Fehler beim Speichern');
        }
    } catch (error) {
        console.error('Fehler beim Speichern der Seite:', error);
        showNotification('Fehler beim Speichern: ' + error.message, 'error');
    }
}

// ========== SERVICES MANAGEMENT ==========

function renderServicesTable() {
    const container = document.getElementById('servicesContainer');
    
    if (!container) {
        console.warn('Services container not found');
        return;
    }
    
    if (currentServices.length === 0) {
        container.innerHTML = `
            <div class="text-center py-4">
                <div class="mb-3">
                    <i class="fas fa-tools fa-3x text-muted"></i>
                </div>
                <h5 class="text-muted">Keine Services vorhanden</h5>
                <p class="text-muted">Erstellen Sie Ihren ersten Service mit dem Button oben.</p>
            </div>
        `;
        return;
    }
    
    // Sort services by order
    const sortedServices = [...currentServices].sort((a, b) => a.order - b.order);
    
    const html = `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th width="50">Pos.</th>
                        <th width="60">Icon</th>
                        <th>Titel</th>
                        <th>Beschreibung</th>
                        <th width="100">Sichtbar</th>
                        <th width="120">Aktionen</th>
                    </tr>
                </thead>
                <tbody id="servicesTableBody">
                    ${sortedServices.map(service => `
                        <tr data-service-id="${service.id}">
                            <td>
                                <span class="badge bg-secondary">${service.order}</span>
                            </td>
                            <td>
                                <i class="${service.iconClass}" style="color: ${service.iconColor}; font-size: 1.5rem;"></i>
                            </td>
                            <td>
                                <strong>${escapeHtml(service.title)}</strong>
                                ${service.subtitle ? `<br><small class="text-muted">${escapeHtml(service.subtitle)}</small>` : ''}
                            </td>
                            <td>
                                <small>${escapeHtml(service.description.substring(0, 100))}${service.description.length > 100 ? '...' : ''}</small>
                            </td>
                            <td>
                                <span class="badge ${service.isVisible ? 'bg-success' : 'bg-secondary'}">
                                    ${service.isVisible ? 'Sichtbar' : 'Ausgeblendet'}
                                </span>
                            </td>
                            <td>
                                <div class="btn-group btn-group-sm">
                                    <button type="button" class="btn btn-outline-primary" 
                                            onclick="editService('${service.id}')" title="Bearbeiten">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" 
                                            onclick="moveService('${service.id}', 'up')" title="Nach oben">
                                        <i class="fas fa-arrow-up"></i>
                                    </button>
                                    <button type="button" class="btn btn-outline-secondary" 
                                            onclick="moveService('${service.id}', 'down')" title="Nach unten">
                                        <i class="fas fa-arrow-down"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = html;
}

function openServiceModal(serviceId = null) {
    editingServiceId = serviceId;
    
    const modal = new bootstrap.Modal(document.getElementById('serviceModal'));
    const title = document.getElementById('serviceModalTitle');
    const deleteBtn = document.getElementById('deleteService');
    
    // Reset form
    document.getElementById('serviceForm').reset();
    document.getElementById('serviceId').value = serviceId || '';
    document.getElementById('serviceIconColor').value = '#ffd401';
    document.getElementById('serviceCtaText').value = 'Service anfragen';
    document.getElementById('serviceIsVisible').checked = true;
    
    if (serviceId) {
        // Edit mode
        const service = currentServices.find(s => s.id === serviceId);
        if (service) {
            title.innerHTML = '<i class="fas fa-edit me-2"></i>Service bearbeiten';
            deleteBtn.style.display = 'inline-block';
            
            // Fill form
            document.getElementById('serviceTitle').value = service.title;
            document.getElementById('serviceSubtitle').value = service.subtitle || '';
            document.getElementById('serviceDescription').value = service.description;
            document.getElementById('serviceIconClass').value = service.iconClass;
            document.getElementById('serviceIconColor').value = service.iconColor;
            document.getElementById('serviceBackgroundImage').value = service.backgroundImage || '';
            document.getElementById('serviceFeatures').value = service.features.join('\n');
            document.getElementById('serviceCtaText').value = service.ctaText;
            document.getElementById('serviceOrder').value = service.order;
            document.getElementById('serviceIsVisible').checked = service.isVisible;
            
            updateIconPreview();
        }
    } else {
        // Create mode
        title.innerHTML = '<i class="fas fa-plus me-2"></i>Neuer Service';
        deleteBtn.style.display = 'none';
        
        // Set next order
        const maxOrder = currentServices.length > 0 ? Math.max(...currentServices.map(s => s.order)) : -1;
        document.getElementById('serviceOrder').value = maxOrder + 1;
    }
    
    modal.show();
}

// Make function global
window.openServiceModal = openServiceModal;

async function saveService() {
    try {
        const formData = {
            title: document.getElementById('serviceTitle').value.trim(),
            subtitle: document.getElementById('serviceSubtitle').value.trim(),
            description: document.getElementById('serviceDescription').value.trim(),
            iconClass: document.getElementById('serviceIconClass').value.trim(),
            iconColor: document.getElementById('serviceIconColor').value,
            backgroundImage: document.getElementById('serviceBackgroundImage').value.trim(),
            features: document.getElementById('serviceFeatures').value
                .split('\n')
                .map(f => f.trim())
                .filter(f => f.length > 0),
            ctaText: document.getElementById('serviceCtaText').value.trim(),
            order: parseInt(document.getElementById('serviceOrder').value),
            isVisible: document.getElementById('serviceIsVisible').checked
        };
        
        // Validation
        if (!formData.title || !formData.description || !formData.iconClass) {
            showNotification('Bitte füllen Sie alle Pflichtfelder aus', 'warning');
            return;
        }
        
        const url = editingServiceId 
            ? `/api/dienstleistungen/services/${editingServiceId}`
            : '/api/dienstleistungen/services';
        
        const method = editingServiceId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification(editingServiceId ? 'Service aktualisiert!' : 'Service erstellt!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('serviceModal'));
            modal.hide();
            
            // Reload data
            await loadServicesData();
        } else {
            throw new Error(result.error || 'Fehler beim Speichern');
        }
    } catch (error) {
        console.error('Fehler beim Speichern des Services:', error);
        showNotification('Fehler beim Speichern: ' + error.message, 'error');
    }
}

async function deleteService() {
    if (!editingServiceId) return;
    
    if (!confirm('Möchten Sie diesen Service wirklich löschen?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/dienstleistungen/services/${editingServiceId}`, {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Service gelöscht!', 'success');
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('serviceModal'));
            modal.hide();
            
            // Reload data
            await loadServicesData();
        } else {
            throw new Error(result.error || 'Fehler beim Löschen');
        }
    } catch (error) {
        console.error('Fehler beim Löschen des Services:', error);
        showNotification('Fehler beim Löschen: ' + error.message, 'error');
    }
}

function editService(serviceId) {
    openServiceModal(serviceId);
}

// Make functions global
window.editService = editService;

async function moveService(serviceId, direction) {
    try {
        const service = currentServices.find(s => s.id === serviceId);
        if (!service) return;
        
        const sorted = [...currentServices].sort((a, b) => a.order - b.order);
        const currentIndex = sorted.findIndex(s => s.id === serviceId);
        
        let newIndex;
        if (direction === 'up' && currentIndex > 0) {
            newIndex = currentIndex - 1;
        } else if (direction === 'down' && currentIndex < sorted.length - 1) {
            newIndex = currentIndex + 1;
        } else {
            return; // Can't move
        }
        
        // Move the service to the new position
        const [movedService] = sorted.splice(currentIndex, 1);
        sorted.splice(newIndex, 0, movedService);
        
        // Reassign all orders sequentially to avoid conflicts
        sorted.forEach((s, index) => {
            s.order = index;
        });
        
        // Update on server
        await reorderServices(sorted);
        
    } catch (error) {
        console.error('Fehler beim Verschieben des Services:', error);
        showNotification('Fehler beim Verschieben: ' + error.message, 'error');
    }
}

// Make function global
window.moveService = moveService;

async function reorderServices(services) {
    try {
        const reorderData = services.map(service => ({
            id: service.id,
            order: service.order
        }));
        
        const response = await fetch('/api/dienstleistungen/services/reorder', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ services: reorderData })
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('Reihenfolge aktualisiert!', 'success');
            await loadServicesData();
        } else {
            throw new Error(result.error || 'Fehler beim Sortieren');
        }
    } catch (error) {
        console.error('Fehler beim Sortieren:', error);
        showNotification('Fehler beim Sortieren: ' + error.message, 'error');
    }
}

// ========== MEDIA PICKER INTEGRATION ==========

function openMediaPickerForServices(targetInputId) {
    if (typeof openMediaPickerModal === 'function') {
        openMediaPickerModal(targetInputId);
    } else {
        console.warn('Media picker not available');
        showNotification('Media-Picker nicht verfügbar', 'warning');
    }
}

// Make function global
window.openMediaPickerForServices = openMediaPickerForServices;

// ========== ICON PREVIEW ==========

function updateIconPreview() {
    const iconClass = document.getElementById('serviceIconClass').value;
    const preview = document.getElementById('serviceIconPreview');
    
    if (preview) {
        preview.className = iconClass || 'fas fa-question';
    }
}

// ========== UTILITY FUNCTIONS ==========

// Simple notification fallback to avoid infinite loops
function showNotification(message, type = 'info') {
    console.log(`📋 DIENSTLEISTUNGEN ${type.toUpperCase()}: ${message}`);
    
    // Try to find and use admin's notification system safely
    if (typeof window.showNotification_original === 'function') {
        window.showNotification_original(message, type);
    } else {
        // Create a simple visual notification
        const toast = document.createElement('div');
        toast.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'} position-fixed`;
        toast.style.cssText = 'top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        toast.innerHTML = `<strong>${type.toUpperCase()}:</strong> ${message}`;
        document.body.appendChild(toast);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export functions for global use
window.openServiceModal = openServiceModal;
window.editService = editService;
window.moveService = moveService;
window.openMediaPickerForServices = openMediaPickerForServices;

