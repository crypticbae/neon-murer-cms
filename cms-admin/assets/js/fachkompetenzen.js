// ========== FACHKOMPETENZEN MANAGEMENT ==========

let fachKompetenzenData = null;
let currentCards = [];
let isEditingCard = false;

// Make variables globally accessible for debugging
window.fachKompetenzenData = fachKompetenzenData;
window.currentCards = currentCards;

// ========== INITIALIZATION ==========

function initFachKompetenzen() {

    
    // Check if user is authenticated
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    if (!token) {
        console.error('❌ No auth token found');
        showNotification('Bitte zuerst einloggen', 'error');
        return;
    }
    
    console.log('✅ Auth token found, loading data...');
    loadFachKompetenzenData();
    loadCards();
    setupEventListeners();
}

function setupEventListeners() {
    // Hero Section Save
    const heroSaveBtn = document.getElementById('saveFachKompetenzenHero');
    if (heroSaveBtn) {
        heroSaveBtn.addEventListener('click', saveFachKompetenzenHero);
    }

    // Section Settings Save  
    const sectionSaveBtn = document.getElementById('saveFachKompetenzenSection');
    if (sectionSaveBtn) {
        sectionSaveBtn.addEventListener('click', saveFachKompetenzenSection);
    }

    // Card Management
    const addCardBtn = document.getElementById('addFachKompetenzCard');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', openAddCardModal);
    }

    const saveCardBtn = document.getElementById('saveFachKompetenzCard');
    if (saveCardBtn) {
        saveCardBtn.addEventListener('click', saveCard);
    }

    const cancelCardBtn = document.getElementById('cancelFachKompetenzCard');
    if (cancelCardBtn) {
        cancelCardBtn.addEventListener('click', cancelCardEdit);
    }

    // Feature Tags Management
    const addFeatureBtn = document.getElementById('addCardFeature');
    if (addFeatureBtn) {
        addFeatureBtn.addEventListener('click', addCardFeature);
    }
}

// ========== DATA LOADING ==========

async function loadFachKompetenzenData() {
    try {
    
        const headers = getAuthHeaders();
        console.log('🔑 Auth headers:', headers);
        
        const response = await fetch('/api/fachkompetenzen', {
            headers: headers
        });

        console.log('📡 Response status:', response.status);
        
        if (response.ok) {
            fachKompetenzenData = await response.json();
            window.fachKompetenzenData = fachKompetenzenData; // Update global reference
            populateFachKompetenzenForm();
        } else {
            const errorText = await response.text();
            console.error('❌ Response error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Error loading fachkompetenzen data:', error);
        showNotification('Fehler beim Laden der Fachkompetenzen-Daten', 'error');
    }
}

async function loadCards() {
    try {
        console.log('📋 Loading cards...');
        const headers = getAuthHeaders();
        
        const response = await fetch('/api/fachkompetenzen/cards', {
            headers: headers
        });

        console.log('📡 Cards response status:', response.status);
        
        if (response.ok) {
            currentCards = await response.json();
            window.currentCards = currentCards; // Update global reference
            console.log('✅ Cards loaded:', currentCards.length, 'cards');
            console.log('🔄 Calling renderCardsTable...');
            renderCardsTable();
            console.log('✅ renderCardsTable completed');
        } else {
            const errorText = await response.text();
            console.error('❌ Cards response error:', response.status, errorText);
            throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
    } catch (error) {
        console.error('❌ Error loading cards:', error);
        showNotification('Fehler beim Laden der Karten', 'error');
    }
}

// ========== FORM POPULATION ==========

function populateFachKompetenzenForm() {
    if (!fachKompetenzenData) return;

    // Hero Section
    document.getElementById('fachkompetenzenHeroTitle').value = fachKompetenzenData.heroTitle || '';
    document.getElementById('fachkompetenzenHeroSubtitle').value = fachKompetenzenData.heroSubtitle || '';
    document.getElementById('fachkompetenzenHeroDescription').value = fachKompetenzenData.heroDescription || '';
    document.getElementById('fachkompetenzenHeroBackground').value = fachKompetenzenData.heroBackgroundImage || '';

    // Section Settings
    document.getElementById('fachkompetenzenSectionTitle').value = fachKompetenzenData.sectionTitle || '';
    document.getElementById('fachkompetenzenSectionSubtitle').value = fachKompetenzenData.sectionSubtitle || '';
}

// ========== CARDS TABLE RENDERING ==========

function renderCardsTable() {
    const tbody = document.getElementById('fachKompetenzCardsTable');
    if (!tbody) return;

    if (currentCards.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">Keine Karten vorhanden</td></tr>';
        return;
    }

    tbody.innerHTML = currentCards.map((card, index) => {
        const features = Array.isArray(card.features) ? card.features : [];
        const featuresText = features.slice(0, 2).join(', ') + (features.length > 2 ? '...' : '');
        
        return `
            <tr data-card-id="${card.id}">
                <td>
                    <div class="d-flex align-items-center">
                        <span class="btn btn-sm btn-outline-secondary me-2 drag-handle" title="Ziehen zum Sortieren" style="cursor: grab;">
                            <i class="fas fa-grip-vertical"></i>
                        </span>
                        <strong>${card.title}</strong>
                    </div>
                </td>
                <td>
                    <span class="text-truncate d-inline-block" style="max-width: 200px;" title="${card.description}">
                        ${card.description}
                    </span>
                </td>
                <td>
                    <i class="${card.iconClass}" title="${card.iconClass}"></i>
                </td>
                <td>
                    <small class="text-muted">${featuresText}</small>
                </td>
                <td>
                    <span class="badge ${card.isVisible ? 'bg-success' : 'bg-secondary'}">
                        ${card.isVisible ? 'Sichtbar' : 'Versteckt'}
                    </span>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
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

    // Initialize sortable functionality (after DOM update)
    setTimeout(() => {
        initCardsSorting();
    }, 100);
}

// ========== CARD MANAGEMENT ==========

function openAddCardModal() {
    isEditingCard = false;
    document.getElementById('fachKompetenzCardModalTitle').textContent = 'Neue Fachkompetenz-Karte hinzufügen';
    
    // Reset form
    document.getElementById('cardTitle').value = '';
    document.getElementById('cardDescription').value = '';
    document.getElementById('cardBackgroundImage').value = '';
    document.getElementById('cardIconClass').value = 'fa-solid fa-cog';
    document.getElementById('cardIsVisible').checked = true;
    
    // Reset icon preview
    const iconPreview = document.getElementById('iconPreviewIcon');
    if (iconPreview) {
        iconPreview.className = 'fa-solid fa-cog';
    }
    
    // Clear features
    document.getElementById('cardFeaturesList').innerHTML = '';
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('fachKompetenzCardModal'));
    modal.show();
}

function editCard(cardId) {
    const card = currentCards.find(c => c.id === cardId);
    if (!card) return;

    isEditingCard = cardId;
    document.getElementById('fachKompetenzCardModalTitle').textContent = 'Fachkompetenz-Karte bearbeiten';
    
    // Populate form
    document.getElementById('cardTitle').value = card.title;
    document.getElementById('cardDescription').value = card.description;
    document.getElementById('cardBackgroundImage').value = card.backgroundImage || '';
    document.getElementById('cardIconClass').value = card.iconClass;
    document.getElementById('cardIsVisible').checked = card.isVisible;
    
    // Update icon preview
    const iconPreview = document.getElementById('iconPreviewIcon');
    if (iconPreview && card.iconClass) {
        iconPreview.className = card.iconClass;
    }
    
    // Populate features
    const featuresList = document.getElementById('cardFeaturesList');
    featuresList.innerHTML = '';
    const features = Array.isArray(card.features) ? card.features : [];
    features.forEach(feature => addFeatureToList(feature));
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('fachKompetenzCardModal'));
    modal.show();
}

async function saveCard() {
    try {
        const title = document.getElementById('cardTitle').value;
        const description = document.getElementById('cardDescription').value;
        const backgroundImage = document.getElementById('cardBackgroundImage').value;
        const iconClass = document.getElementById('cardIconClass').value;
        const isVisible = document.getElementById('cardIsVisible').checked;
        
        // Collect features
        const featureInputs = document.querySelectorAll('#cardFeaturesList input');
        const features = Array.from(featureInputs).map(input => input.value).filter(f => f.trim());

        if (!title.trim() || !description.trim()) {
            showNotification('Titel und Beschreibung sind erforderlich', 'error');
            return;
        }

        const cardData = {
            title: title.trim(),
            description: description.trim(),
            backgroundImage: backgroundImage.trim() || null,
            iconClass: iconClass.trim(),
            features,
            isVisible,
            order: isEditingCard ? undefined : currentCards.length
        };

        const url = isEditingCard 
            ? `/api/fachkompetenzen/cards/${isEditingCard}`
            : '/api/fachkompetenzen/cards';
        
        const method = isEditingCard ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(cardData)
        });

        if (response.ok) {
            showNotification(
                isEditingCard ? 'Karte erfolgreich aktualisiert' : 'Neue Karte erfolgreich erstellt', 
                'success'
            );
            
            // Close modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('fachKompetenzCardModal'));
            modal.hide();
            
            // Reload data
            await loadCards();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error saving card:', error);
        showNotification('Fehler beim Speichern der Karte', 'error');
    }
}

async function deleteCard(cardId) {
    if (!confirm('Sind Sie sicher, dass Sie diese Karte löschen möchten?')) {
        return;
    }

    try {
        const response = await fetch(`/api/fachkompetenzen/cards/${cardId}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });

        if (response.ok) {
            showNotification('Karte erfolgreich gelöscht', 'success');
            await loadCards();
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error deleting card:', error);
        showNotification('Fehler beim Löschen der Karte', 'error');
    }
}

function cancelCardEdit() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('fachKompetenzCardModal'));
    modal.hide();
}

// ========== FEATURES MANAGEMENT ==========

function addCardFeature() {
    const input = document.getElementById('newCardFeature');
    const featureText = input.value.trim();
    
    if (featureText) {
        addFeatureToList(featureText);
        input.value = '';
    }
}

function addFeatureToList(featureText) {
    const featuresList = document.getElementById('cardFeaturesList');
    const featureDiv = document.createElement('div');
    featureDiv.className = 'input-group mb-2';
    featureDiv.innerHTML = `
        <input type="text" class="form-control" value="${featureText}" readonly>
        <button class="btn btn-outline-danger" type="button" onclick="this.parentElement.remove()">
            <i class="fas fa-trash"></i>
        </button>
    `;
    featuresList.appendChild(featureDiv);
}

// ========== HERO & SECTION SAVE ==========

async function saveFachKompetenzenHero() {
    try {
        const heroData = {
            heroTitle: document.getElementById('fachkompetenzenHeroTitle').value,
            heroSubtitle: document.getElementById('fachkompetenzenHeroSubtitle').value,
            heroDescription: document.getElementById('fachkompetenzenHeroDescription').value,
            heroBackgroundImage: document.getElementById('fachkompetenzenHeroBackground').value,
            sectionTitle: fachKompetenzenData?.sectionTitle || 'Unsere Kernkompetenzen',
            sectionSubtitle: fachKompetenzenData?.sectionSubtitle || ''
        };

        const response = await fetch('/api/fachkompetenzen', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(heroData)
        });

        if (response.ok) {
            fachKompetenzenData = await response.json();
            showNotification('Hero-Bereich erfolgreich gespeichert', 'success');
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error saving hero:', error);
        showNotification('Fehler beim Speichern des Hero-Bereichs', 'error');
    }
}

async function saveFachKompetenzenSection() {
    try {
        const sectionData = {
            heroTitle: fachKompetenzenData?.heroTitle || '',
            heroSubtitle: fachKompetenzenData?.heroSubtitle || '',
            heroDescription: fachKompetenzenData?.heroDescription || '',
            heroBackgroundImage: fachKompetenzenData?.heroBackgroundImage || '',
            sectionTitle: document.getElementById('fachkompetenzenSectionTitle').value,
            sectionSubtitle: document.getElementById('fachkompetenzenSectionSubtitle').value
        };

        const response = await fetch('/api/fachkompetenzen', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify(sectionData)
        });

        if (response.ok) {
            fachKompetenzenData = await response.json();
            showNotification('Section-Einstellungen erfolgreich gespeichert', 'success');
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error saving section:', error);
        showNotification('Fehler beim Speichern der Section-Einstellungen', 'error');
    }
}

// ========== SORTING ==========

function initCardsSorting() {
    const tbody = document.getElementById('fachKompetenzCardsTable');
    if (!tbody) return;

    // Simple drag and drop sorting implementation
    let draggedElement = null;

    tbody.addEventListener('dragstart', function(e) {
        const row = e.target.closest('tr');
        if (row && row.hasAttribute('data-card-id')) {
            draggedElement = row;
            e.dataTransfer.effectAllowed = 'move';
            row.style.opacity = '0.5';
            console.log('🔄 Drag started for:', row.getAttribute('data-card-id'));
        }
    });

    tbody.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    });

    tbody.addEventListener('drop', function(e) {
        e.preventDefault();
        const dropTarget = e.target.closest('tr');
        
        if (dropTarget && draggedElement && dropTarget !== draggedElement) {
            const allRows = Array.from(tbody.children);
            const draggedIndex = allRows.indexOf(draggedElement);
            const dropIndex = allRows.indexOf(dropTarget);
            
            if (draggedIndex < dropIndex) {
                dropTarget.parentNode.insertBefore(draggedElement, dropTarget.nextSibling);
            } else {
                dropTarget.parentNode.insertBefore(draggedElement, dropTarget);
            }
            
            // Update order in database (disabled - just visual for now)
            console.log('🎯 Visual reorder completed - API disabled until fixed');
            showNotification('Reihenfolge visuell geändert (wird später gespeichert)', 'info');
            // updateCardsOrder();
        }
        
        if (draggedElement) {
            draggedElement.style.opacity = '1';
        }
        draggedElement = null;
    });

    // Make rows draggable
    tbody.querySelectorAll('tr[data-card-id]').forEach(row => {
        row.draggable = true;
        
        // Add visual feedback for drag handles
        const dragHandle = row.querySelector('.drag-handle');
        if (dragHandle) {
            dragHandle.addEventListener('mousedown', function() {
                this.style.cursor = 'grabbing';
            });
            dragHandle.addEventListener('mouseup', function() {
                this.style.cursor = 'grab';
            });
        }
        
        console.log('🔄 Made row draggable:', row.getAttribute('data-card-id'));
    });
    
    console.log('✅ Sortable initialized for', tbody.querySelectorAll('tr[data-card-id]').length, 'cards');
}

async function updateCardsOrder() {
    try {
        const rows = document.querySelectorAll('#fachKompetenzCardsTable tr[data-card-id]');
        const cardIds = Array.from(rows).map(row => row.getAttribute('data-card-id'));
        
        console.log('🔄 Updating cards order:', cardIds);

        const response = await fetch('/api/fachkompetenzen/cards/reorder', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                ...getAuthHeaders()
            },
            body: JSON.stringify({ cardIds })
        });

        if (response.ok) {
            showNotification('Reihenfolge erfolgreich aktualisiert', 'success');
            await loadCards(); // Reload to get updated data
        } else {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
    } catch (error) {
        console.error('Error updating cards order:', error);
        showNotification('Fehler beim Aktualisieren der Reihenfolge', 'error');
    }
}

// ========== MEDIA PICKER INTEGRATION ==========

function openMediaPickerForFachKompetenzen(targetInputId) {
    if (typeof window.openMediaPicker === 'function') {
        window.openMediaPicker((imagePath, imageName) => {
            const targetInput = document.getElementById(targetInputId);
            if (targetInput) {
                targetInput.value = imagePath;
                showNotification(`Bild ausgewählt: ${imageName}`, 'success');
            }
        });
    } else {
        console.error('❌ MediaPicker not available');
        showNotification('Media Picker ist nicht verfügbar', 'error');
    }
}

// ========== UTILITIES ==========

function getAuthHeaders() {
    const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

function showNotification(message, type = 'info') {
    // Use admin.js showNotification if available, but avoid recursion
    if (typeof window.showNotification === 'function' && window.showNotification !== showNotification) {
        window.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
        // No more alerts - just log to console
    }
}

// ========== ICON SELECTOR ==========
// Icons werden aus icon-data.js geladen

function showIconSelector() {
    // Populate icon grid
    populateIconGrid();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('iconSelectorModal'));
    modal.show();
}

function populateIconGrid() {
    const iconGrid = document.getElementById('iconGrid');
    iconGrid.innerHTML = '';
    
    availableIcons.forEach(icon => {
        const iconDiv = document.createElement('div');
        iconDiv.className = 'col-2 mb-3';
        iconDiv.innerHTML = `
            <div class="text-center p-2 border rounded icon-option" 
                 onclick="selectIcon('${icon.class}')" 
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

function filterIcons() {
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
                 onclick="selectIcon('${icon.class}')" 
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

function selectIcon(iconClass) {
    // Set the selected icon in the input field
    document.getElementById('cardIconClass').value = iconClass;
    
    // Update icon preview
    const iconPreview = document.getElementById('iconPreviewIcon');
    if (iconPreview) {
        iconPreview.className = iconClass;
    }
    
    // Close modal
    const modal = bootstrap.Modal.getInstance(document.getElementById('iconSelectorModal'));
    modal.hide();
    
    // Show notification  
    const iconName = availableIcons.find(icon => icon.class === iconClass)?.name || iconClass;
    showNotification(`Icon "${iconName}" ausgewählt`, 'success');
}

// Make functions globally available
window.initFachKompetenzen = initFachKompetenzen;
window.openMediaPickerForFachKompetenzen = openMediaPickerForFachKompetenzen;
window.editCard = editCard;
window.deleteCard = deleteCard;
window.addCardFeature = addCardFeature;
window.renderCardsTable = renderCardsTable;
window.populateFachKompetenzenForm = populateFachKompetenzenForm;
window.showIconSelector = showIconSelector;
window.filterIcons = filterIcons;
window.selectIcon = selectIcon;

// DEBUG: Test if function is callable
