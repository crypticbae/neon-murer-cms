/**
 * Media Picker Component für Neon Murer CMS
 * Ermöglicht visuelle Auswahl von Bildern aus der Medienbibliothek
 */

class MediaPicker {
    constructor() {
        this.isOpen = false;
        this.currentCallback = null;
        this.currentInputField = null;
        this.mediaItems = [];
        this.filteredItems = [];
        this.currentFilter = 'all';
        this.searchTerm = '';
        this.initialized = false;
        
        this.createModal();
        this.bindEvents();
        
        // Initialize media items asynchronously
        this.initialize();
    }
    
    // Async initialization
    async initialize() {
        await this.initializeMediaItems();
        this.initialized = true;

    }
    
    // Initialisiere verfügbare Medien (dynamisch von API geladen)
    async initializeMediaItems() {
        try {
    
            const response = await fetch('/api/media');
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to load media');
            }
            
            this.mediaItems = data.media || [];

            
            // Update filtered items and render if modal is open
            this.filteredItems = [...this.mediaItems];
            if (this.isOpen) {
                this.renderMedia();
            }
            
        } catch (error) {
            console.error('❌ Error loading media items:', error);
            
            // Fallback zu einer minimalen statischen Liste bei Fehlern
            this.mediaItems = [
                { id: 1, name: 'Fallback Bild 1', path: '../content/images/fahrzeugbeschriftung-1.jpg', category: 'fallback', type: 'image' },
                { id: 2, name: 'Fallback Bild 2', path: '../content/images/fensterbeschriftung-1.jpg', category: 'fallback', type: 'image' }
            ];
        }
        
        this.filteredItems = [...this.mediaItems];
    }
    
    // Refresh media items from API
    async refreshMediaItems() {
        console.log('🔄 Refreshing media items...');
        const refreshBtn = document.getElementById('mediaRefreshBtn');
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            refreshBtn.disabled = true;
        }
        
        await this.initializeMediaItems();
        
        if (refreshBtn) {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
            refreshBtn.disabled = false;
        }
    }
    
    // Erstelle die Modal-Struktur
    createModal() {
        const modalHTML = `
            <div id="mediaPickerModal" class="modal fade" tabindex="-1" aria-labelledby="mediaPickerModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="mediaPickerModalLabel">
                                <i class="fas fa-images me-2"></i>
                                Bild auswählen
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <!-- Filter und Suche -->
                            <div class="media-picker-filters mb-4">
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <div class="input-group">
                                            <span class="input-group-text">
                                                <i class="fas fa-search"></i>
                                            </span>
                                            <input type="text" class="form-control" id="mediaSearchInput" placeholder="Bilder suchen...">
                                        </div>
                                    </div>
                                    <div class="col-md-5">
                                        <select class="form-select" id="mediaCategoryFilter">
                                            <option value="all">Alle Kategorien</option>
                                            <option value="fahrzeugbeschriftung">Fahrzeugbeschriftung</option>
                                            <option value="fensterbeschriftung">Fensterbeschriftung</option>
                                            <option value="grossformatdruck">Grossformatdruck</option>
                                            <option value="blachen-fahnen">Blachen & Fahnen</option>
                                            <option value="signaletik">Signaletik</option>
                                            <option value="tafelbeschriftung">Tafelbeschriftung</option>
                                            <option value="pylonen">Pylonen</option>
                                            <option value="halbrelief">Halbrelief & Plattenschriften</option>
                                            <option value="leuchttransparente">Leuchttransparente</option>
                                            <option value="neon-led">Neon LED Technik</option>
                                            <option value="digital-signage">Digital Signage</option>
                                            <option value="fachkompetenzen">Fachkompetenzen</option>
                                            <option value="leistungen">Leistungen</option>
                                            <option value="team">Team & Personen</option>
                                            <option value="projekte">Projekte & Details</option>
                                            <option value="standorte">Standorte & Gebäude</option>
                                            <option value="logos">Logos</option>
                                        </select>
                                    </div>
                                    <div class="col-md-1">
                                        <button type="button" class="btn btn-outline-primary w-100" id="mediaRefreshBtn" title="Bilder neu laden">
                                            <i class="fas fa-sync-alt"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Bildgalerie -->
                            <div class="media-picker-gallery" id="mediaPickerGallery">
                                <!-- Bilder werden hier eingefügt -->
                            </div>
                            
                            <!-- Lade-Anzeige -->
                            <div class="text-center d-none" id="mediaPickerLoading">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Lädt...</span>
                                </div>
                                <div class="mt-2">Bilder werden geladen...</div>
                            </div>
                            
                            <!-- Keine Ergebnisse -->
                            <div class="text-center d-none" id="mediaPickerEmpty">
                                <i class="fas fa-images fa-3x text-muted mb-3"></i>
                                <h5 class="text-muted">Keine Bilder gefunden</h5>
                                <p class="text-muted">Versuchen Sie andere Suchbegriffe oder Filter.</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>
                                Abbrechen
                            </button>
                            <button type="button" class="btn btn-primary" id="mediaPickerSelectBtn" disabled>
                                <i class="fas fa-check me-2"></i>
                                Auswählen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Modal zum Body hinzufügen
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // CSS Styles hinzufügen
        this.addStyles();
    }
    
    // CSS Styles für den Media Picker
    addStyles() {
        const styles = `
            <style id="mediaPickerStyles">
                .media-picker-gallery {
                    max-height: 500px;
                    overflow-y: auto;
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    gap: 15px;
                    padding: 10px;
                }
                
                .media-picker-item {
                    position: relative;
                    border: 2px solid transparent;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    background: #f8f9fa;
                }
                
                .media-picker-item:hover {
                    border-color: #007bff;
                    box-shadow: 0 4px 12px rgba(0, 123, 255, 0.15);
                    transform: translateY(-2px);
                }
                
                .media-picker-item.selected {
                    border-color: #28a745;
                    box-shadow: 0 4px 12px rgba(40, 167, 69, 0.25);
                }
                
                .media-picker-item img {
                    width: 100%;
                    height: 120px;
                    object-fit: cover;
                    display: block;
                }
                
                .media-picker-item-info {
                    padding: 8px;
                    background: white;
                    border-top: 1px solid #dee2e6;
                }
                
                .media-picker-item-name {
                    font-size: 0.875rem;
                    font-weight: 500;
                    color: #495057;
                    margin: 0;
                    line-height: 1.2;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .media-picker-item-category {
                    font-size: 0.75rem;
                    color: #6c757d;
                    margin: 2px 0 0 0;
                }
                
                .media-picker-item-overlay {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: rgba(40, 167, 69, 0.9);
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    display: none;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                }
                
                .media-picker-item.selected .media-picker-item-overlay {
                    display: flex;
                }
                
                .media-picker-filters .input-group-text {
                    background: #f8f9fa;
                    border-color: #ced4da;
                }
                
                @media (max-width: 768px) {
                    .media-picker-gallery {
                        grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
                        gap: 10px;
                    }
                    
                    .media-picker-item img {
                        height: 100px;
                    }
                }
            </style>
        `;
        
        if (!document.getElementById('mediaPickerStyles')) {
            document.head.insertAdjacentHTML('beforeend', styles);
        }
    }
    
    // Event-Handler binden
    bindEvents() {
        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('mediaPickerModal');
            const searchInput = document.getElementById('mediaSearchInput');
            const categoryFilter = document.getElementById('mediaCategoryFilter');
            const selectBtn = document.getElementById('mediaPickerSelectBtn');
            const gallery = document.getElementById('mediaPickerGallery');
            
            if (searchInput) {
                searchInput.addEventListener('input', (e) => {
                    this.searchTerm = e.target.value.toLowerCase();
                    this.filterAndRenderMedia();
                });
            }
            
            if (categoryFilter) {
                categoryFilter.addEventListener('change', (e) => {
                    this.currentFilter = e.target.value;
                    this.filterAndRenderMedia();
                });
            }
            
            // Refresh Button Event
            const refreshBtn = document.getElementById('mediaRefreshBtn');
            if (refreshBtn) {
                refreshBtn.addEventListener('click', () => {
                    this.refreshMediaItems();
                });
            }
            
            if (selectBtn) {
                selectBtn.addEventListener('click', () => {
                    this.selectCurrentImage();
                });
            }
            
            if (gallery) {
                gallery.addEventListener('click', (e) => {
                    const item = e.target.closest('.media-picker-item');
                    if (item) {
                        this.selectMediaItem(item);
                    }
                });
            }
            
            if (modal) {
                modal.addEventListener('shown.bs.modal', () => {
                    this.onModalShow();
                });
                
                modal.addEventListener('hidden.bs.modal', () => {
                    this.onModalHide();
                });
            }
        });
    }
    
    // Öffne den Media Picker
    async open(callback, inputField = null) {
        this.currentCallback = callback;
        this.currentInputField = inputField;
        this.selectedItem = null;
        
        // Warte auf Initialisierung falls noch nicht abgeschlossen
        if (!this.initialized) {
            console.log('⏳ Waiting for MediaPicker initialization...');
            while (!this.initialized) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            console.log('✅ MediaPicker ready, opening modal...');
        }
        
        const modal = new bootstrap.Modal(document.getElementById('mediaPickerModal'));
        modal.show();
    }
    
    // Modal wird angezeigt
    onModalShow() {
        this.isOpen = true;
        console.log('📱 MediaPicker modal opened with', this.mediaItems.length, 'media items');
        this.renderMedia();
        
        // Fokus auf Suchfeld setzen
        setTimeout(() => {
            const searchInput = document.getElementById('mediaSearchInput');
            if (searchInput) searchInput.focus();
        }, 100);
    }
    
    // Modal wird geschlossen
    onModalHide() {
        this.isOpen = false;
        this.selectedItem = null;
        this.currentCallback = null;
        this.currentInputField = null;
        
        // Filter zurücksetzen
        const searchInput = document.getElementById('mediaSearchInput');
        const categoryFilter = document.getElementById('mediaCategoryFilter');
        
        if (searchInput) searchInput.value = '';
        if (categoryFilter) categoryFilter.value = 'all';
        
        this.searchTerm = '';
        this.currentFilter = 'all';
        this.filteredItems = [...this.mediaItems];
    }
    
    // Filter anwenden und Medien rendern
    filterAndRenderMedia() {
        this.filteredItems = this.mediaItems.filter(item => {
            const matchesSearch = !this.searchTerm || 
                item.name.toLowerCase().includes(this.searchTerm) ||
                item.category.toLowerCase().includes(this.searchTerm);
                
            const matchesCategory = this.currentFilter === 'all' || 
                item.category === this.currentFilter;
            
            return matchesSearch && matchesCategory;
        });
        
        this.renderMedia();
    }
    
    // Medien in der Galerie rendern
    renderMedia() {
        const gallery = document.getElementById('mediaPickerGallery');
        const loading = document.getElementById('mediaPickerLoading');
        const empty = document.getElementById('mediaPickerEmpty');
        
        if (!gallery) return;
        
        // Lade-Anzeige zeigen
        loading.classList.remove('d-none');
        gallery.innerHTML = '';
        empty.classList.add('d-none');
        
        setTimeout(() => {
            loading.classList.add('d-none');
            
            if (this.filteredItems.length === 0) {
                empty.classList.remove('d-none');
                return;
            }
            
            gallery.innerHTML = this.filteredItems.map(item => this.createMediaItemHTML(item)).join('');
        }, 200); // Simuliere kurze Ladezeit
    }
    
    // HTML für ein Medien-Element erstellen
    createMediaItemHTML(item) {
        const categoryNames = {
            'fahrzeugbeschriftung': 'Fahrzeugbeschriftung',
            'fensterbeschriftung': 'Fensterbeschriftung',
            'grossformatdruck': 'Grossformatdruck',
            'blachen-fahnen': 'Blachen & Fahnen',
            'signaletik': 'Signaletik',
            'tafelbeschriftung': 'Tafelbeschriftung',
            'pylonen': 'Pylonen',
            'halbrelief': 'Halbrelief',
            'leuchttransparente': 'Leuchttransparente',
            'neon-led': 'Neon LED',
            'digital-signage': 'Digital Signage',
            'fachkompetenzen': 'Fachkompetenzen',
            'leistungen': 'Leistungen',
            'team': 'Team',
            'projekte': 'Projekte',
            'standorte': 'Standorte',
            'logos': 'Logos'
        };
        
        return `
            <div class="media-picker-item" data-id="${item.id}" data-path="${item.path}" data-name="${item.name}">
                <img src="${item.path}" alt="${item.name}" loading="lazy" 
                     onerror="this.src='data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"150\\" height=\\"120\\" viewBox=\\"0 0 150 120\\"><rect width=\\"150\\" height=\\"120\\" fill=\\"%23f8f9fa\\"/><text x=\\"75\\" y=\\"60\\" text-anchor=\\"middle\\" font-family=\\"Arial\\" font-size=\\"10\\" fill=\\"%236c757d\\">Bild nicht gefunden</text></svg>'">
                <div class="media-picker-item-overlay">
                    <i class="fas fa-check"></i>
                </div>
                <div class="media-picker-item-info">
                    <p class="media-picker-item-name" title="${item.name}">${item.name}</p>
                    <p class="media-picker-item-category">${categoryNames[item.category] || item.category}</p>
                </div>
            </div>
        `;
    }
    
    // Medien-Element auswählen
    selectMediaItem(element) {
        // Vorherige Auswahl entfernen
        document.querySelectorAll('.media-picker-item.selected').forEach(item => {
            item.classList.remove('selected');
        });
        
        // Neues Element auswählen
        element.classList.add('selected');
        
        this.selectedItem = {
            id: element.dataset.id,
            path: element.dataset.path,
            name: element.dataset.name
        };
        
        // Auswählen-Button aktivieren
        const selectBtn = document.getElementById('mediaPickerSelectBtn');
        if (selectBtn) {
            selectBtn.disabled = false;
        }
    }
    
    // Aktuell ausgewähltes Bild bestätigen
    selectCurrentImage() {
        if (this.selectedItem && this.currentCallback) {
            this.currentCallback(this.selectedItem.path, this.selectedItem.name);
            
            // Input-Feld aktualisieren falls vorhanden
            if (this.currentInputField) {
                this.currentInputField.value = this.selectedItem.path;
                
                // Change-Event triggern für andere Listener
                const event = new Event('change', { bubbles: true });
                this.currentInputField.dispatchEvent(event);
            }
        }
        
        // Modal schließen
        const modal = bootstrap.Modal.getInstance(document.getElementById('mediaPickerModal'));
        if (modal) {
            modal.hide();
        }
    }
}

// Media Picker Instanz erstellen
const mediaPickerInstance = new MediaPicker();

// Globale Funktionen für einfache Verwendung
window.openMediaPicker = async function(callback, inputField = null) {
    await mediaPickerInstance.open(callback, inputField);
};

window.openMediaPickerForInput = async function(inputElement) {
    await mediaPickerInstance.open((path, name) => {
        inputElement.value = path;
        
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        inputElement.dispatchEvent(event);
        
        // Zeige visuelle Bestätigung
        if (window.showNotification) {
            window.showNotification(`Bild ausgewählt: ${name}`, 'success');
        }
    }, inputElement);
};

 