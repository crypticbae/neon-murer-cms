/*!
 * Newsletter Designer - Drag & Drop Editor für Neon Murer CMS
 * Benutzerfreundlicher WYSIWYG Newsletter Builder
 */

class NewsletterDesigner {
    constructor() {
        this.currentTemplate = null;
        this.blocks = [];
        this.draggedBlock = null;
        this.selectedBlock = null;
        this.previewMode = 'desktop';
        
        this.init();
    }

    async init() {
        console.log('📧 Newsletter Designer initializing...');
        
        // Load available blocks
        await this.loadBlocks();
        
        // Setup drag and drop
        this.setupDragAndDrop();
        
        // Load existing templates
        await this.loadTemplates();
        
        console.log('✅ Newsletter Designer ready');
    }

    async loadBlocks() {
        try {
            const response = await fetch('/api/newsletter/blocks');
            this.blocks = await response.json();
            this.renderBlockLibrary();
        } catch (error) {
            console.error('Error loading newsletter blocks:', error);
            console.error('Fehler beim Laden der Content-Blöcke');
        }
    }

    renderBlockLibrary() {
        const container = document.getElementById('newsletter-blocks');
        if (!container) return;

        const categories = {
            header: 'Header',
            content: 'Inhalte',
            cta: 'Call-to-Action',
            social: 'Social Media',
            divider: 'Layout',
            footer: 'Footer'
        };

        let html = '';
        
        Object.entries(categories).forEach(([categoryId, categoryName]) => {
            const categoryBlocks = this.blocks.filter(block => block.category === categoryId);
            
            if (categoryBlocks.length > 0) {
                html += `
                    <div class="block-category">
                        <h6>${categoryName}</h6>
                        <div class="block-list">
                `;
                
                categoryBlocks.forEach(block => {
                    html += `
                        <div class="block-item" 
                             data-block-id="${block.id}" 
                             draggable="true"
                             title="Ziehen Sie diesen Block in den Editor">
                            <div class="block-preview">
                                <img src="${block.preview}" alt="${block.name}" class="img-fluid">
                            </div>
                            <div class="block-name">${block.name}</div>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        });

        container.innerHTML = html;
        
        // Add improved drag behavior
        this.setupImprovedDragBehavior();
    }
    
    setupImprovedDragBehavior() {
        document.querySelectorAll('.block-item').forEach(item => {
            item.addEventListener('dragstart', (e) => {
                item.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'copy';
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });
        });
    }

    setupDragAndDrop() {
        console.log('🔄 Setting up improved drag and drop...');
        
        // Remove any existing listeners first
        this.cleanupDragListeners();
        
        // Store references for cleanup
        this.dragStartHandler = this.handleDragStart.bind(this);
        this.dragEndHandler = this.handleDragEnd.bind(this);
        this.dragOverHandler = this.handleDragOver.bind(this);
        this.dragLeaveHandler = this.handleDragLeave.bind(this);
        this.dropHandler = this.handleDrop.bind(this);
        
        // Setup global drag listeners
        document.addEventListener('dragstart', this.dragStartHandler);
        document.addEventListener('dragend', this.dragEndHandler);
        
        // Setup canvas listeners
        const canvas = document.getElementById('newsletter-canvas');
        if (canvas) {
            canvas.addEventListener('dragover', this.dragOverHandler);
            canvas.addEventListener('dragleave', this.dragLeaveHandler);
            canvas.addEventListener('drop', this.dropHandler);
            
            // Add visual feedback class
            canvas.classList.add('drop-zone');
            console.log('✅ Canvas drop zone configured');
        } else {
            console.error('❌ Newsletter canvas not found');
        }
    }
    
    cleanupDragListeners() {
        if (this.dragStartHandler) {
            document.removeEventListener('dragstart', this.dragStartHandler);
            document.removeEventListener('dragend', this.dragEndHandler);
        }
        
        const canvas = document.getElementById('newsletter-canvas');
        if (canvas && this.dragOverHandler) {
            canvas.removeEventListener('dragover', this.dragOverHandler);
            canvas.removeEventListener('dragleave', this.dragLeaveHandler);
            canvas.removeEventListener('drop', this.dropHandler);
        }
    }
    
    handleDragStart(e) {
        const blockItem = e.target.closest('.block-item');
        if (!blockItem) return;
        
        const blockId = blockItem.dataset.blockId;
        this.draggedBlock = this.blocks.find(b => b.id === blockId);
        
        if (this.draggedBlock) {
            console.log('🖱️ Dragging:', this.draggedBlock.name);
            
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.setData('text/plain', blockId);
            e.dataTransfer.setData('application/json', JSON.stringify(this.draggedBlock));
            
            blockItem.classList.add('dragging');
            
            // Visual feedback
            setTimeout(() => {
                const canvas = document.getElementById('newsletter-canvas');
                if (canvas) canvas.classList.add('drop-ready');
            }, 10);
        }
    }
    
    handleDragEnd(e) {
        const blockItem = e.target.closest('.block-item');
        if (blockItem) {
            blockItem.classList.remove('dragging');
        }
        
        // Cleanup visual states
        const canvas = document.getElementById('newsletter-canvas');
        if (canvas) {
            canvas.classList.remove('drag-over', 'drop-ready');
        }
        
        // Clean up drag state after a delay
        setTimeout(() => {
            if (this.draggedBlock) {
                console.log('🧹 Cleanup: Clearing dragged block');
                this.draggedBlock = null;
            }
        }, 100);
    }
    
    handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (this.draggedBlock) {
            e.dataTransfer.dropEffect = 'copy';
            const canvas = e.currentTarget;
            canvas.classList.add('drag-over');
        }
    }
    
    handleDragLeave(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const canvas = e.currentTarget;
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX;
        const y = e.clientY;
        
        // Only remove if mouse is actually outside canvas
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            canvas.classList.remove('drag-over');
        }
    }
    
    handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const canvas = e.currentTarget;
        canvas.classList.remove('drag-over', 'drop-ready');
        
        console.log('💧 Drop detected');
        
        let blockData = this.draggedBlock;
        
        // Fallback: try to get from dataTransfer
        if (!blockData) {
            try {
                const jsonData = e.dataTransfer.getData('application/json');
                if (jsonData) {
                    blockData = JSON.parse(jsonData);
                    console.log('📦 Recovered block from dataTransfer:', blockData);
                }
            } catch (error) {
                console.warn('Failed to parse dragged data:', error);
            }
        }
        
        if (blockData) {
            console.log('✅ Adding block to canvas:', blockData.name);
            this.addBlockToCanvas(blockData);
            this.draggedBlock = null;
        } else {
            console.error('❌ No block data available for drop');
        }
    }

    addBlockToCanvas(blockData) {
        const canvas = document.getElementById('newsletter-canvas');
        if (!canvas) return;

        // Remove placeholder if exists
        const placeholder = canvas.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.remove();
        }

        // Create block element
        const blockElement = this.createBlockElement(blockData);
        canvas.appendChild(blockElement);

        // Auto-select the new block
        this.selectBlock(blockElement);

                        console.log(`✅ ${blockData.name} hinzugefügt`);
    }

    createBlockElement(blockData) {
        const blockId = 'block_' + Date.now();
        const block = document.createElement('div');
        block.className = 'newsletter-block';
        block.dataset.blockId = blockId;
        block.dataset.blockType = blockData.template.type;

        let content = '';
        
        switch (blockData.template.type) {
            case 'header':
                content = `
                    <div class="nm-header-preview">
                        <img src="${blockData.template.content.logo}" alt="Logo" class="block-logo">
                        <p class="block-tagline">${blockData.template.content.tagline}</p>
                    </div>
                `;
                break;
                
            case 'header-minimal':
                content = `
                    <div class="nm-header-minimal-preview">
                        <h3 class="block-title">${blockData.template.content.title}</h3>
                        <p class="block-date">${blockData.template.content.date}</p>
                    </div>
                `;
                break;
                
            case 'hero':
                content = `
                    <div class="nm-hero-preview">
                        <h2 class="block-title">${blockData.template.content.title}</h2>
                        <p class="block-subtitle">${blockData.template.content.subtitle}</p>
                        <img src="${blockData.template.content.image}" alt="${blockData.template.content.imageAlt}" class="block-image">
                    </div>
                `;
                break;
                
            case 'hero-text':
                content = `
                    <div class="nm-hero-text-preview">
                        <h2 class="block-title">${blockData.template.content.title}</h2>
                        <p class="block-subtitle">${blockData.template.content.subtitle}</p>
                        <p class="block-description">${blockData.template.content.description}</p>
                    </div>
                `;
                break;
                
            case 'project':
                content = `
                    <div class="nm-project-preview">
                        <img src="${blockData.template.content.image}" alt="${blockData.template.content.imageAlt}" class="block-image">
                        <h3 class="block-title">${blockData.template.content.title}</h3>
                        <p class="block-description">${blockData.template.content.description}</p>
                    </div>
                `;
                break;
                
            case 'text-block':
                content = `
                    <div class="nm-text-preview">
                        <h3 class="block-title">${blockData.template.content.title}</h3>
                        <p class="block-content">${blockData.template.content.content}</p>
                        <a href="#" class="block-link">${blockData.template.content.linkText}</a>
                    </div>
                `;
                break;
                
            case 'image-text':
                content = `
                    <div class="nm-image-text-preview">
                        <img src="${blockData.template.content.image}" alt="${blockData.template.content.imageAlt}" class="block-image">
                        <div class="block-content">
                            <h3 class="block-title">${blockData.template.content.title}</h3>
                            <p class="block-text">${blockData.template.content.text}</p>
                        </div>
                    </div>
                `;
                break;
                
            case 'testimonial':
                content = `
                    <div class="nm-testimonial-preview">
                        <p class="block-quote">"${blockData.template.content.quote}"</p>
                        <p class="block-author">${blockData.template.content.author}</p>
                        <p class="block-company">${blockData.template.content.company}</p>
                    </div>
                `;
                break;
                
            case 'service-list':
                content = `
                    <div class="nm-service-list-preview">
                        <h3 class="block-title">${blockData.template.content.title}</h3>
                        <ul class="block-services">
                            ${blockData.template.content.services.map(service => `<li>${service}</li>`).join('')}
                        </ul>
                    </div>
                `;
                break;
                
            case 'news':
                content = `
                    <div class="nm-news-preview">
                        <img src="${blockData.template.content.image}" alt="News" class="block-image">
                        <h3 class="block-title">${blockData.template.content.title}</h3>
                        <p class="block-excerpt">${blockData.template.content.excerpt}</p>
                        <a href="#" class="block-link">${blockData.template.content.linkText}</a>
                    </div>
                `;
                break;
                
            case 'cta':
                content = `
                    <div class="nm-cta-preview">
                        <h2 class="block-title">${blockData.template.content.title}</h2>
                        <p class="block-text">${blockData.template.content.text}</p>
                        <button class="block-button">${blockData.template.content.buttonText}</button>
                    </div>
                `;
                break;
                
            case 'cta-contact':
                content = `
                    <div class="nm-cta-contact-preview">
                        <h3 class="block-title">${blockData.template.content.title}</h3>
                        <p class="block-phone">${blockData.template.content.phone}</p>
                        <p class="block-email">${blockData.template.content.email}</p>
                        <button class="block-button">${blockData.template.content.buttonText}</button>
                    </div>
                `;
                break;
                
            case 'cta-offer':
                content = `
                    <div class="nm-cta-offer-preview">
                        <h2 class="block-title">${blockData.template.content.title}</h2>
                        <p class="block-subtitle">${blockData.template.content.subtitle}</p>
                        <p class="block-description">${blockData.template.content.description}</p>
                        <button class="block-button">${blockData.template.content.buttonText}</button>
                    </div>
                `;
                break;
                
            case 'social':
                content = `
                    <div class="nm-social-preview">
                        <h3 class="block-title">${blockData.template.content.title}</h3>
                        <div class="block-platforms">
                            ${blockData.template.content.platforms.map(platform => `<span class="platform">${platform.name}</span>`).join(' ')}
                        </div>
                    </div>
                `;
                break;
                
            case 'divider':
                content = `
                    <div class="nm-divider-preview">
                        <hr class="block-line" style="border-color: ${blockData.template.content.color}">
                    </div>
                `;
                break;
                
            case 'spacer':
                content = `
                    <div class="nm-spacer-preview" style="height: ${blockData.template.content.height}">
                        <p class="block-label">Leerraum (${blockData.template.content.height})</p>
                    </div>
                `;
                break;
                
            case 'footer':
                content = `
                    <div class="nm-footer-preview">
                        <img src="${blockData.template.content.logo}" alt="Logo" class="block-logo">
                        <p class="block-text">${blockData.template.content.companyText}</p>
                        <p class="block-contact">${blockData.template.content.contact.address}</p>
                    </div>
                `;
                break;
                
            case 'footer-minimal':
                content = `
                    <div class="nm-footer-minimal-preview">
                        <p class="block-company">${blockData.template.content.companyName}</p>
                        <p class="block-copyright">${blockData.template.content.copyright}</p>
                    </div>
                `;
                break;
        }

        block.innerHTML = `
            <div class="block-content" onclick="newsletterDesigner.selectBlock(this.parentElement)">
                ${content}
            </div>
            <div class="block-controls">
                <button class="btn btn-sm btn-outline-primary me-1" onclick="newsletterDesigner.editBlock('${blockId}')" title="Bearbeiten">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="newsletterDesigner.moveBlockUp('${blockId}')" title="Nach oben">
                    <i class="fas fa-arrow-up"></i>
                </button>
                <button class="btn btn-sm btn-outline-secondary me-1" onclick="newsletterDesigner.moveBlockDown('${blockId}')" title="Nach unten">
                    <i class="fas fa-arrow-down"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="newsletterDesigner.deleteBlock('${blockId}')" title="Löschen">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        // Store original template data
        block._templateData = JSON.parse(JSON.stringify(blockData.template));

        return block;
    }

    selectBlock(blockElement) {
        console.log('🎯 Selecting block:', blockElement.dataset.blockType);
        
        // Remove previous selection
        document.querySelectorAll('.newsletter-block.selected').forEach(el => {
            el.classList.remove('selected');
        });

        // Select new block
        blockElement.classList.add('selected');
        this.selectedBlock = blockElement;

        // Debug the selected block data
        console.log('📊 Block data:', blockElement._templateData);

        // Show properties panel
        this.showBlockProperties(blockElement);
    }

    showBlockProperties(blockElement) {
        const propertiesPanel = document.getElementById('newsletter-properties');
        if (!propertiesPanel) {
            console.error('❌ Properties panel not found');
            return;
        }

        const templateData = blockElement._templateData;
        if (!templateData) {
            console.error('❌ No template data found for block');
            return;
        }

        console.log('⚙️ Showing properties for:', templateData.type, templateData.content);

        let propertiesHTML = `<h6 class="mb-3">${this.getBlockTypeName(templateData.type)}</h6>`;

        switch (templateData.type) {
            case 'header':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Logo URL</label>
                        <input type="url" class="form-control" value="${templateData.content.logo}" 
                               onchange="newsletterDesigner.updateBlockProperty('logo', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Tagline</label>
                        <input type="text" class="form-control" value="${templateData.content.tagline}" 
                               onchange="newsletterDesigner.updateBlockProperty('tagline', this.value)">
                    </div>
                `;
                break;
                
            case 'hero':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Untertitel</label>
                        <input type="text" class="form-control" value="${templateData.content.subtitle}" 
                               onchange="newsletterDesigner.updateBlockProperty('subtitle', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bild URL</label>
                        <input type="url" class="form-control" value="${templateData.content.image}" 
                               onchange="newsletterDesigner.updateBlockProperty('image', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bild Alt-Text</label>
                        <input type="text" class="form-control" value="${templateData.content.imageAlt}" 
                               onchange="newsletterDesigner.updateBlockProperty('imageAlt', this.value)">
                    </div>
                `;
                break;
                
            case 'project':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Projekt-Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-control" rows="3" 
                                  onchange="newsletterDesigner.updateBlockProperty('description', this.value)">${templateData.content.description}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bild URL</label>
                        <input type="url" class="form-control" value="${templateData.content.image}" 
                               onchange="newsletterDesigner.updateBlockProperty('image', this.value)">
                    </div>
                `;
                break;
                
                            case 'cta':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">CTA Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">CTA Text</label>
                        <textarea class="form-control" rows="2" 
                                  onchange="newsletterDesigner.updateBlockProperty('text', this.value)">${templateData.content.text}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Button Text</label>
                        <input type="text" class="form-control" value="${templateData.content.buttonText}" 
                               onchange="newsletterDesigner.updateBlockProperty('buttonText', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Button Link</label>
                        <input type="url" class="form-control" value="${templateData.content.buttonUrl}" 
                               onchange="newsletterDesigner.updateBlockProperty('buttonUrl', this.value)">
                    </div>
                `;
                break;
                
            case 'header-minimal':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Datum</label>
                        <input type="text" class="form-control" value="${templateData.content.date || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('date', this.value)">
                    </div>
                `;
                break;
                
            case 'hero-text':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Untertitel</label>
                        <input type="text" class="form-control" value="${templateData.content.subtitle || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('subtitle', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-control" rows="2" 
                                  onchange="newsletterDesigner.updateBlockProperty('description', this.value)">${templateData.content.description || ''}</textarea>
                    </div>
                `;
                break;
                
            case 'text-block':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Inhalt</label>
                        <textarea class="form-control" rows="3" 
                                  onchange="newsletterDesigner.updateBlockProperty('content', this.value)">${templateData.content.content || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Link Text</label>
                        <input type="text" class="form-control" value="${templateData.content.linkText || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('linkText', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Link URL</label>
                        <input type="url" class="form-control" value="${templateData.content.linkUrl || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('linkUrl', this.value)">
                    </div>
                `;
                break;
                
            case 'image-text':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Text</label>
                        <textarea class="form-control" rows="2" 
                                  onchange="newsletterDesigner.updateBlockProperty('text', this.value)">${templateData.content.text || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bild URL</label>
                        <input type="url" class="form-control" value="${templateData.content.image || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('image', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bild Alt-Text</label>
                        <input type="text" class="form-control" value="${templateData.content.imageAlt || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('imageAlt', this.value)">
                    </div>
                `;
                break;
                
            case 'testimonial':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Zitat</label>
                        <textarea class="form-control" rows="3" 
                                  onchange="newsletterDesigner.updateBlockProperty('quote', this.value)">${templateData.content.quote || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Autor</label>
                        <input type="text" class="form-control" value="${templateData.content.author || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('author', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Firma</label>
                        <input type="text" class="form-control" value="${templateData.content.company || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('company', this.value)">
                    </div>
                `;
                break;
                
            case 'service-list':
                // Ensure services array exists
                if (!templateData.content.services || !Array.isArray(templateData.content.services)) {
                    templateData.content.services = ['Service 1', 'Service 2', 'Service 3'];
                }
                
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Services</label>
                        <small class="text-muted d-block mb-2">Ein Service pro Zeile</small>
                        <textarea class="form-control" rows="4" 
                                  onchange="newsletterDesigner.updateBlockProperty('services', this.value.split('\\n').filter(s => s.trim()))">${templateData.content.services.join('\n')}</textarea>
                    </div>
                `;
                break;
                
            case 'news':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Kurzbeschreibung</label>
                        <textarea class="form-control" rows="2" 
                                  onchange="newsletterDesigner.updateBlockProperty('excerpt', this.value)">${templateData.content.excerpt || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Bild URL</label>
                        <input type="url" class="form-control" value="${templateData.content.image || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('image', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Link Text</label>
                        <input type="text" class="form-control" value="${templateData.content.linkText || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('linkText', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Link URL</label>
                        <input type="url" class="form-control" value="${templateData.content.linkUrl || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('linkUrl', this.value)">
                    </div>
                `;
                break;
                
            case 'cta-contact':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Telefon</label>
                        <input type="tel" class="form-control" value="${templateData.content.phone || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('phone', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">E-Mail</label>
                        <input type="email" class="form-control" value="${templateData.content.email || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('email', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Button Text</label>
                        <input type="text" class="form-control" value="${templateData.content.buttonText || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('buttonText', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Button URL</label>
                        <input type="url" class="form-control" value="${templateData.content.buttonUrl || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('buttonUrl', this.value)">
                    </div>
                `;
                break;
                
            case 'cta-offer':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Untertitel</label>
                        <input type="text" class="form-control" value="${templateData.content.subtitle || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('subtitle', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Beschreibung</label>
                        <textarea class="form-control" rows="2" 
                                  onchange="newsletterDesigner.updateBlockProperty('description', this.value)">${templateData.content.description || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Button Text</label>
                        <input type="text" class="form-control" value="${templateData.content.buttonText || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('buttonText', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Button URL</label>
                        <input type="url" class="form-control" value="${templateData.content.buttonUrl || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('buttonUrl', this.value)">
                    </div>
                `;
                break;
                
            case 'social':
                // Ensure platforms array exists
                if (!templateData.content.platforms || !Array.isArray(templateData.content.platforms)) {
                    templateData.content.platforms = [
                        { name: 'Facebook', url: 'https://facebook.com/neonmurer', icon: 'fab fa-facebook' },
                        { name: 'Instagram', url: 'https://instagram.com/neonmurer', icon: 'fab fa-instagram' },
                        { name: 'LinkedIn', url: 'https://linkedin.com/company/neonmurer', icon: 'fab fa-linkedin' }
                    ];
                }
                
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Titel</label>
                        <input type="text" class="form-control" value="${templateData.content.title || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('title', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Facebook URL</label>
                        <input type="url" class="form-control" value="${templateData.content.platforms[0]?.url || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('platforms.0.url', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Instagram URL</label>
                        <input type="url" class="form-control" value="${templateData.content.platforms[1]?.url || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('platforms.1.url', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">LinkedIn URL</label>
                        <input type="url" class="form-control" value="${templateData.content.platforms[2]?.url || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('platforms.2.url', this.value)">
                    </div>
                `;
                break;
                
            case 'divider':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Linienstil</label>
                        <select class="form-control" onchange="newsletterDesigner.updateBlockProperty('style', this.value)">
                            <option value="solid" ${templateData.content.style === 'solid' ? 'selected' : ''}>Durchgezogen</option>
                            <option value="dashed" ${templateData.content.style === 'dashed' ? 'selected' : ''}>Gestrichelt</option>
                            <option value="dotted" ${templateData.content.style === 'dotted' ? 'selected' : ''}>Gepunktet</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Farbe</label>
                        <input type="color" class="form-control" value="${templateData.content.color || '#dddddd'}" 
                               onchange="newsletterDesigner.updateBlockProperty('color', this.value)">
                    </div>
                `;
                break;
                
            case 'spacer':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Höhe</label>
                        <input type="text" class="form-control" value="${templateData.content.height || '40px'}" 
                               onchange="newsletterDesigner.updateBlockProperty('height', this.value)"
                               placeholder="z.B. 40px, 2rem, 60px">
                        <small class="text-muted">Geben Sie eine CSS-Höhe an (px, rem, em)</small>
                    </div>
                `;
                break;
                
            case 'footer':
                // Ensure contact object exists
                if (!templateData.content.contact) {
                    templateData.content.contact = {
                        address: '',
                        phone: '',
                        email: '',
                        website: ''
                    };
                }
                
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Logo URL</label>
                        <input type="url" class="form-control" value="${templateData.content.logo || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('logo', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Firmentext</label>
                        <textarea class="form-control" rows="2" 
                                  onchange="newsletterDesigner.updateBlockProperty('companyText', this.value)">${templateData.content.companyText || ''}</textarea>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Adresse</label>
                        <input type="text" class="form-control" value="${templateData.content.contact.address || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('contact.address', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Telefon</label>
                        <input type="tel" class="form-control" value="${templateData.content.contact.phone || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('contact.phone', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">E-Mail</label>
                        <input type="email" class="form-control" value="${templateData.content.contact.email || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('contact.email', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Website</label>
                        <input type="text" class="form-control" value="${templateData.content.contact.website || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('contact.website', this.value)">
                    </div>
                `;
                break;
                
            case 'footer-minimal':
                propertiesHTML += `
                    <div class="mb-3">
                        <label class="form-label">Firmenname</label>
                        <input type="text" class="form-control" value="${templateData.content.companyName || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('companyName', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Copyright Text</label>
                        <input type="text" class="form-control" value="${templateData.content.copyright || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('copyright', this.value)">
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Abmelde-Text</label>
                        <input type="text" class="form-control" value="${templateData.content.unsubscribeText || ''}" 
                               onchange="newsletterDesigner.updateBlockProperty('unsubscribeText', this.value)">
                    </div>
                `;
                break;
        }

        propertiesPanel.innerHTML = propertiesHTML;
    }

    updateBlockProperty(property, value) {
        if (!this.selectedBlock) return;

        const templateData = this.selectedBlock._templateData;
        
        // Handle nested properties (like contact.address)
        if (property.includes('.')) {
            const parts = property.split('.');
            let current = templateData.content;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!current[parts[i]]) current[parts[i]] = {};
                current = current[parts[i]];
            }
            current[parts[parts.length - 1]] = value;
        } else {
            templateData.content[property] = value;
        }

        // Update visual representation
        this.updateBlockVisual(this.selectedBlock);
        
        console.log('Block property updated:', property, '=', value);
    }

    updateBlockVisual(blockElement) {
        const templateData = blockElement._templateData;
        const content = blockElement.querySelector('.block-content');

        try {
            switch (templateData.type) {
                case 'header':
                    content.querySelector('.block-logo').src = templateData.content.logo;
                    content.querySelector('.block-tagline').textContent = templateData.content.tagline;
                    break;
                    
                case 'hero':
                    content.querySelector('.block-title').textContent = templateData.content.title;
                    content.querySelector('.block-subtitle').textContent = templateData.content.subtitle;
                    content.querySelector('.block-image').src = templateData.content.image;
                    content.querySelector('.block-image').alt = templateData.content.imageAlt;
                    break;
                    
                case 'project':
                    content.querySelector('.block-title').textContent = templateData.content.title;
                    content.querySelector('.block-description').textContent = templateData.content.description;
                    content.querySelector('.block-image').src = templateData.content.image;
                    break;
                    
                case 'cta':
                    content.querySelector('.block-title').textContent = templateData.content.title;
                    content.querySelector('.block-text').textContent = templateData.content.text;
                    content.querySelector('.block-button').textContent = templateData.content.buttonText;
                    break;
                    
                case 'header-minimal':
                    const minimalTitle = content.querySelector('.block-title');
                    const minimalDate = content.querySelector('.block-date');
                    if (minimalTitle) minimalTitle.textContent = templateData.content.title;
                    if (minimalDate) minimalDate.textContent = templateData.content.date;
                    break;
                    
                case 'hero-text':
                    const heroTextTitle = content.querySelector('.block-title');
                    const heroTextSubtitle = content.querySelector('.block-subtitle');
                    const heroTextDesc = content.querySelector('.block-description');
                    if (heroTextTitle) heroTextTitle.textContent = templateData.content.title;
                    if (heroTextSubtitle) heroTextSubtitle.textContent = templateData.content.subtitle;
                    if (heroTextDesc) heroTextDesc.textContent = templateData.content.description;
                    break;
                    
                case 'text-block':
                    const textTitle = content.querySelector('.block-title');
                    const textContent = content.querySelector('.block-content');
                    const textLink = content.querySelector('.block-link');
                    if (textTitle) textTitle.textContent = templateData.content.title;
                    if (textContent) textContent.textContent = templateData.content.content;
                    if (textLink) textLink.textContent = templateData.content.linkText;
                    break;
                    
                case 'image-text':
                    const imageTextImage = content.querySelector('.block-image');
                    const imageTextTitle = content.querySelector('.block-title');
                    const imageTextText = content.querySelector('.block-text');
                    if (imageTextImage) {
                        imageTextImage.src = templateData.content.image;
                        imageTextImage.alt = templateData.content.imageAlt;
                    }
                    if (imageTextTitle) imageTextTitle.textContent = templateData.content.title;
                    if (imageTextText) imageTextText.textContent = templateData.content.text;
                    break;
                    
                case 'testimonial':
                    const testimonialQuote = content.querySelector('.block-quote');
                    const testimonialAuthor = content.querySelector('.block-author');
                    const testimonialCompany = content.querySelector('.block-company');
                    if (testimonialQuote) testimonialQuote.textContent = `"${templateData.content.quote}"`;
                    if (testimonialAuthor) testimonialAuthor.textContent = templateData.content.author;
                    if (testimonialCompany) testimonialCompany.textContent = templateData.content.company;
                    break;
                    
                case 'service-list':
                    const serviceTitle = content.querySelector('.block-title');
                    const servicesList = content.querySelector('.block-services');
                    if (serviceTitle) serviceTitle.textContent = templateData.content.title;
                    if (servicesList && Array.isArray(templateData.content.services)) {
                        servicesList.innerHTML = templateData.content.services.map(service => `<li>${service}</li>`).join('');
                    }
                    break;
                    
                case 'news':
                    const newsImage = content.querySelector('.block-image');
                    const newsTitle = content.querySelector('.block-title');
                    const newsExcerpt = content.querySelector('.block-excerpt');
                    const newsLink = content.querySelector('.block-link');
                    if (newsImage) newsImage.src = templateData.content.image;
                    if (newsTitle) newsTitle.textContent = templateData.content.title;
                    if (newsExcerpt) newsExcerpt.textContent = templateData.content.excerpt;
                    if (newsLink) newsLink.textContent = templateData.content.linkText;
                    break;
                    
                case 'cta-contact':
                    const ctaContactTitle = content.querySelector('.block-title');
                    const ctaContactPhone = content.querySelector('.block-phone');
                    const ctaContactEmail = content.querySelector('.block-email');
                    const ctaContactButton = content.querySelector('.block-button');
                    if (ctaContactTitle) ctaContactTitle.textContent = templateData.content.title;
                    if (ctaContactPhone) ctaContactPhone.textContent = templateData.content.phone;
                    if (ctaContactEmail) ctaContactEmail.textContent = templateData.content.email;
                    if (ctaContactButton) ctaContactButton.textContent = templateData.content.buttonText;
                    break;
                    
                case 'cta-offer':
                    const ctaOfferTitle = content.querySelector('.block-title');
                    const ctaOfferSubtitle = content.querySelector('.block-subtitle');
                    const ctaOfferDesc = content.querySelector('.block-description');
                    const ctaOfferButton = content.querySelector('.block-button');
                    if (ctaOfferTitle) ctaOfferTitle.textContent = templateData.content.title;
                    if (ctaOfferSubtitle) ctaOfferSubtitle.textContent = templateData.content.subtitle;
                    if (ctaOfferDesc) ctaOfferDesc.textContent = templateData.content.description;
                    if (ctaOfferButton) ctaOfferButton.textContent = templateData.content.buttonText;
                    break;
                    
                case 'social':
                    const socialTitle = content.querySelector('.block-title');
                    const socialPlatforms = content.querySelector('.block-platforms');
                    if (socialTitle) socialTitle.textContent = templateData.content.title;
                    if (socialPlatforms && Array.isArray(templateData.content.platforms)) {
                        socialPlatforms.innerHTML = templateData.content.platforms.map(platform => 
                            `<span class="platform">${platform.name}</span>`
                        ).join(' ');
                    }
                    break;
                    
                case 'divider':
                    const dividerLine = content.querySelector('.block-line');
                    if (dividerLine) {
                        dividerLine.style.borderTopStyle = templateData.content.style;
                        dividerLine.style.borderColor = templateData.content.color;
                    }
                    break;
                    
                case 'spacer':
                    const spacerElement = content.querySelector('.nm-spacer-preview');
                    const spacerLabel = content.querySelector('.block-label');
                    if (spacerElement) spacerElement.style.height = templateData.content.height;
                    if (spacerLabel) spacerLabel.textContent = `Leerraum (${templateData.content.height})`;
                    break;
                    
                case 'footer':
                    const footerLogo = content.querySelector('.block-logo');
                    const footerText = content.querySelector('.block-text');
                    const footerContact = content.querySelector('.block-contact');
                    
                    if (footerLogo) footerLogo.src = templateData.content.logo;
                    if (footerText) footerText.textContent = templateData.content.companyText;
                    if (footerContact && templateData.content.contact) {
                        footerContact.textContent = templateData.content.contact.address;
                    }
                    break;
                    
                case 'footer-minimal':
                    const footerMinimalCompany = content.querySelector('.block-company');
                    const footerMinimalCopyright = content.querySelector('.block-copyright');
                    if (footerMinimalCompany) footerMinimalCompany.textContent = templateData.content.companyName;
                    if (footerMinimalCopyright) footerMinimalCopyright.textContent = templateData.content.copyright;
                    break;
            }
        } catch (error) {
            console.error('Error updating block visual:', error, templateData);
        }
    }

    getBlockTypeName(type) {
        const typeNames = {
            'header': 'Header mit Logo',
            'header-minimal': 'Minimaler Header',
            'hero': 'Hero mit Bild',
            'hero-text': 'Hero nur Text',
            'project': 'Projekt-Karte',
            'text-block': 'Text-Block',
            'image-text': 'Bild + Text',
            'testimonial': 'Kundenstimme',
            'service-list': 'Service-Liste',
            'news': 'News-Artikel',
            'cta': 'Call-to-Action',
            'cta-contact': 'Kontakt CTA',
            'cta-offer': 'Angebot CTA',
            'social': 'Social Media',
            'divider': 'Trennlinie',
            'spacer': 'Leerraum',
            'footer': 'Footer mit Kontakt',
            'footer-minimal': 'Minimaler Footer'
        };
        return typeNames[type] || type;
    }
    
    // Block management functions
    editBlock(blockId) {
        const block = document.querySelector(`[data-block-id="${blockId}"]`);
        if (block) {
            this.selectBlock(block);
        }
    }
    
    moveBlockUp(blockId) {
        const block = document.querySelector(`[data-block-id="${blockId}"]`);
        if (block && block.previousElementSibling) {
            block.parentNode.insertBefore(block, block.previousElementSibling);
            showNotificationND('Block nach oben verschoben', 'success');
        }
    }
    
    moveBlockDown(blockId) {
        const block = document.querySelector(`[data-block-id="${blockId}"]`);
        if (block && block.nextElementSibling) {
            block.parentNode.insertBefore(block.nextElementSibling, block);
            showNotificationND('Block nach unten verschoben', 'success');
        }
    }
    
    deleteBlock(blockId) {
        if (confirm('Möchten Sie diesen Block wirklich löschen?')) {
            const block = document.querySelector(`[data-block-id="${blockId}"]`);
            if (block) {
                block.remove();
                
                // Clear properties panel if this block was selected
                if (this.selectedBlock === block) {
                    this.selectedBlock = null;
                    document.getElementById('newsletter-properties').innerHTML = `
                        <p class="text-muted text-center">
                            <i class="fas fa-mouse-pointer"></i><br>
                            Wählen Sie einen Block aus um die Eigenschaften zu bearbeiten
                        </p>
                    `;
                }
                
                // Show placeholder if no blocks left
                const canvas = document.getElementById('newsletter-canvas');
                if (!canvas.querySelector('.newsletter-block')) {
                    canvas.innerHTML = `
                        <div class="canvas-placeholder">
                            <i class="fas fa-plus-circle fa-3x text-muted"></i>
                            <p class="text-muted mt-3">Ziehen Sie Content-Blöcke hierher um zu beginnen</p>
                        </div>
                    `;
                }
                
                showNotificationND('Block gelöscht', 'success');
            }
        }
    }

    async loadTemplates() {
        try {
            const response = await fetch('/api/newsletter/templates');
            const templates = await response.json();
            this.renderTemplatesTable(templates);
        } catch (error) {
            console.error('Error loading newsletter templates:', error);
        }
    }

    renderTemplatesTable(templates) {
        const tbody = document.querySelector('#newsletter-templates-table tbody');
        if (!tbody) return;

        if (templates.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="fas fa-inbox fa-2x mb-2 d-block"></i>
                        Noch keine Newsletter-Templates erstellt
                    </td>
                </tr>
            `;
            return;
        }

        const html = templates.map(template => `
            <tr>
                <td>
                    <div class="template-preview">
                        ${template.previewImage ? 
                            `<img src="${template.previewImage}" alt="Preview" class="img-thumbnail" style="width: 60px; height: 40px; object-fit: cover;">` :
                            `<div class="preview-placeholder"><i class="fas fa-envelope"></i></div>`
                        }
                    </div>
                </td>
                <td>
                    <strong>${template.name}</strong>
                </td>
                <td>
                    <small class="text-muted">${new Date(template.createdAt).toLocaleDateString('de-DE')}</small>
                </td>
                <td>
                    <small class="text-muted">${new Date(template.updatedAt).toLocaleDateString('de-DE')}</small>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="newsletterDesigner.editTemplate('${template.id}')" title="Bearbeiten">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="newsletterDesigner.duplicateTemplate('${template.id}')" title="Duplizieren">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="newsletterDesigner.exportTemplate('${template.id}')" title="HTML exportieren">
                            <i class="fas fa-code"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="newsletterDesigner.deleteTemplate('${template.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        tbody.innerHTML = html;
    }

    // Public API methods
    async editTemplate(templateId) {
        try {
            const response = await fetch(`/api/newsletter/templates/${templateId}`);
            const template = await response.json();
            
            this.currentTemplate = template;
            this.loadTemplateIntoDesigner(template);
            
            // Show designer
            document.getElementById('newsletter-designer').style.display = 'block';
            
        } catch (error) {
            console.error('Error loading template:', error);
            showNotificationND('Fehler beim Laden des Templates', 'error');
        }
    }

    loadTemplateIntoDesigner(template) {
        const canvas = document.getElementById('newsletter-canvas');
        const content = JSON.parse(template.content);
        
        // Clear canvas
        canvas.innerHTML = '';
        
        // Add blocks
        content.forEach(blockData => {
            const blockElement = this.createBlockElement({ template: blockData });
            canvas.appendChild(blockElement);
        });
    }

    async duplicateTemplate(templateId) {
        try {
            const response = await fetch(`/api/newsletter/templates/${templateId}`);
            const template = await response.json();
            
            // Create copy with new name
            const newName = prompt('Name für die Kopie:', `${template.name} (Kopie)`);
            if (!newName) return;
            
            const duplicateData = {
                name: newName,
                content: JSON.parse(template.content),
                htmlContent: template.htmlContent
            };
            
            const createResponse = await fetch('/api/newsletter/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(duplicateData)
            });
            
            if (createResponse.ok) {
                showNotificationND('Template dupliziert', 'success');
                this.loadTemplates();
            } else {
                throw new Error('Duplicate failed');
            }
            
        } catch (error) {
            console.error('❌ Error duplicating template:', error);
            console.error('Fehler beim Duplizieren:', error.message);
        }
    }
    
    async deleteTemplate(templateId) {
        // Skip confirmation for now due to admin.js override issues
        console.log('🗑️ Deleting template:', templateId);
        
        try {
            const response = await fetch(`/api/newsletter/templates/${templateId}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                console.log('✅ Template deleted successfully');
                this.loadTemplates();
                // Use console instead of problematic showNotification
                console.log('Template gelöscht');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Delete failed');
            }
            
        } catch (error) {
            console.error('❌ Error deleting template:', error);
            // Use console instead of problematic showNotification
            console.error('Fehler beim Löschen:', error.message);
        }
    }

    generateHTML() {
        console.log('📄 Generating newsletter HTML...');
        
        const blocks = document.querySelectorAll('#newsletter-canvas .newsletter-block');
        
        if (blocks.length === 0) {
            return this.getEmptyNewsletterHTML();
        }
        
        let contentHTML = '';
        
        blocks.forEach(block => {
            const templateData = block._templateData;
            if (templateData) {
                contentHTML += this.generateBlockHTML(templateData);
            }
        });
        
        return this.getNewsletterTemplate(contentHTML);
    }
    
    generateBlockHTML(templateData) {
        const { type, content } = templateData;
        
        switch (type) {
            case 'header':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #112357;">
                        <tr>
                            <td align="center" style="padding: 30px 20px;">
                                <img src="${content.logo}" alt="Logo" style="max-width: 200px; height: auto;">
                                <div style="color: #ffd401; font-size: 16px; margin-top: 10px; font-family: Arial, sans-serif;">
                                    ${content.tagline}
                                </div>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'header-minimal':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa;">
                        <tr>
                            <td align="center" style="padding: 20px; border-top: 3px solid #112357;">
                                <h1 style="color: #112357; font-size: 24px; margin: 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h1>
                                <p style="color: #666666; font-size: 14px; margin: 5px 0 0 0; font-family: Arial, sans-serif;">
                                    ${content.date}
                                </p>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'hero':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td align="center" style="padding: 30px 20px;">
                                <h2 style="color: #112357; font-size: 28px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h2>
                                <p style="color: #666666; font-size: 18px; margin: 0 0 20px 0; font-family: Arial, sans-serif;">
                                    ${content.subtitle}
                                </p>
                                <img src="${content.image}" alt="${content.imageAlt}" style="max-width: 100%; height: auto; border-radius: 8px;">
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'hero-text':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);">
                        <tr>
                            <td align="center" style="padding: 40px 20px; border-left: 4px solid #ffd401;">
                                <h2 style="color: #112357; font-size: 32px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h2>
                                <p style="color: #666666; font-size: 20px; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
                                    ${content.subtitle}
                                </p>
                                <p style="color: #666666; font-size: 16px; margin: 0; font-family: Arial, sans-serif;">
                                    ${content.description}
                                </p>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'text-block':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding: 30px 20px;">
                                <h3 style="color: #112357; font-size: 22px; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h3>
                                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
                                    ${content.content}
                                </p>
                                <a href="${content.linkUrl}" style="color: #ffd401; text-decoration: underline; font-family: Arial, sans-serif;">
                                    ${content.linkText}
                                </a>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'cta':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #112357;">
                        <tr>
                            <td align="center" style="padding: 40px 20px;">
                                <h2 style="color: #ffffff; font-size: 28px; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h2>
                                <p style="color: #ffffff; font-size: 16px; margin: 0 0 25px 0; font-family: Arial, sans-serif;">
                                    ${content.text}
                                </p>
                                <a href="${content.buttonUrl}" style="background-color: #ffd401; color: #112357; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-family: Arial, sans-serif; display: inline-block;">
                                    ${content.buttonText}
                                </a>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'image-text':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding: 30px 20px;">
                                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                                    <tr>
                                        <td width="200" valign="top" style="padding-right: 20px;">
                                            <img src="${content.image}" alt="${content.imageAlt}" style="width: 200px; height: auto; border-radius: 8px;">
                                        </td>
                                        <td valign="top">
                                            <h3 style="color: #112357; font-size: 20px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                                                ${content.title}
                                            </h3>
                                            <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0; font-family: Arial, sans-serif;">
                                                ${content.text}
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'testimonial':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa;">
                        <tr>
                            <td style="padding: 30px 20px; border-left: 4px solid #28a745;">
                                <p style="color: #333333; font-size: 16px; font-style: italic; line-height: 1.6; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
                                    "${content.quote}"
                                </p>
                                <p style="color: #112357; font-size: 14px; font-weight: bold; margin: 0 0 5px 0; font-family: Arial, sans-serif;">
                                    ${content.author}
                                </p>
                                <p style="color: #666666; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">
                                    ${content.company}
                                </p>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'service-list':
                const serviceItems = Array.isArray(content.services) 
                    ? content.services.map(service => `<li style="margin: 5px 0; color: #666666;">${service}</li>`).join('')
                    : '<li style="margin: 5px 0; color: #666666;">Keine Services verfügbar</li>';
                    
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding: 30px 20px;">
                                <h3 style="color: #112357; font-size: 22px; margin: 0 0 20px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h3>
                                <ul style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px; font-family: Arial, sans-serif;">
                                    ${serviceItems}
                                </ul>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'news':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e9ecef;">
                        <tr>
                            <td>
                                <img src="${content.image}" alt="News" style="width: 100%; height: 200px; object-fit: cover;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px;">
                                <h3 style="color: #112357; font-size: 20px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h3>
                                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
                                    ${content.excerpt}
                                </p>
                                <a href="${content.linkUrl}" style="color: #ffd401; text-decoration: underline; font-family: Arial, sans-serif;">
                                    ${content.linkText}
                                </a>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'cta-contact':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #ffd401 0%, #ffed4e 100%);">
                        <tr>
                            <td align="center" style="padding: 40px 20px;">
                                <h3 style="color: #112357; font-size: 24px; margin: 0 0 20px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h3>
                                <p style="color: #112357; font-size: 16px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                                    📞 ${content.phone}
                                </p>
                                <p style="color: #112357; font-size: 16px; margin: 0 0 25px 0; font-family: Arial, sans-serif;">
                                    ✉️ ${content.email}
                                </p>
                                <a href="${content.buttonUrl}" style="background-color: #112357; color: #ffd401; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-family: Arial, sans-serif; display: inline-block;">
                                    ${content.buttonText}
                                </a>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'cta-offer':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #28a745 0%, #20c997 100%);">
                        <tr>
                            <td align="center" style="padding: 40px 20px;">
                                <h2 style="color: #ffffff; font-size: 32px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h2>
                                <p style="color: #ffffff; font-size: 20px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                                    ${content.subtitle}
                                </p>
                                <p style="color: #ffffff; font-size: 14px; margin: 0 0 25px 0; font-family: Arial, sans-serif; opacity: 0.9;">
                                    ${content.description}
                                </p>
                                <a href="${content.buttonUrl}" style="background-color: #ffd401; color: #112357; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-family: Arial, sans-serif; display: inline-block;">
                                    ${content.buttonText}
                                </a>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'social':
                const socialLinks = Array.isArray(content.platforms) 
                    ? content.platforms.map(platform => `
                        <a href="${platform.url}" style="display: inline-block; margin: 0 10px; background-color: #112357; color: #ffd401; padding: 10px 15px; text-decoration: none; border-radius: 20px; font-family: Arial, sans-serif;">
                            ${platform.name}
                        </a>
                    `).join('')
                    : '<p style="color: #666666;">Keine Social Media Links verfügbar</p>';
                    
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa;">
                        <tr>
                            <td align="center" style="padding: 30px 20px;">
                                <h3 style="color: #112357; font-size: 20px; margin: 0 0 20px 0; font-family: Arial, sans-serif;">
                                    ${content.title}
                                </h3>
                                <div style="text-align: center;">
                                    ${socialLinks}
                                </div>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'divider':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding: 20px;">
                                <hr style="border: none; border-top: 2px ${content.style || 'solid'} ${content.color || '#dddddd'}; width: 80%; margin: 0 auto;">
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'spacer':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="height: ${content.height || '40px'}; font-size: 1px; line-height: 1px;">&nbsp;</td>
                        </tr>
                    </table>
                `;
                
            case 'footer':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #112357;">
                        <tr>
                            <td align="center" style="padding: 30px 20px;">
                                <img src="${content.logo}" alt="Logo" style="max-width: 150px; height: auto; margin-bottom: 15px;">
                                <p style="color: #ffffff; font-size: 14px; margin: 0 0 10px 0; font-family: Arial, sans-serif;">
                                    ${content.companyText}
                                </p>
                                <p style="color: #ffd401; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">
                                    ${content.contact?.address || ''}<br>
                                    Tel: ${content.contact?.phone || ''}<br>
                                    E-Mail: ${content.contact?.email || ''}<br>
                                    Web: ${content.contact?.website || ''}
                                </p>
                                <p style="color: #ffd401; font-size: 10px; margin: 15px 0 0 0; font-family: Arial, sans-serif;">
                                    <a href="{unsubscribe_link}" style="color: #ffd401; text-decoration: underline;">Abmelden</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'footer-minimal':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f8f9fa;">
                        <tr>
                            <td align="center" style="padding: 20px; border-top: 3px solid #112357;">
                                <p style="color: #112357; font-size: 16px; margin: 0 0 10px 0; font-family: Arial, sans-serif; font-weight: bold;">
                                    ${content.companyName}
                                </p>
                                <p style="color: #666666; font-size: 12px; margin: 0; font-family: Arial, sans-serif;">
                                    ${content.copyright}
                                </p>
                                <p style="color: #ffd401; font-size: 10px; margin: 10px 0 0 0; font-family: Arial, sans-serif;">
                                    <a href="{unsubscribe_link}" style="color: #ffd401; text-decoration: underline;">${content.unsubscribeText}</a>
                                </p>
                            </td>
                        </tr>
                    </table>
                `;
                
            case 'project':
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden; margin: 0 0 20px 0;">
                        <tr>
                            <td>
                                <img src="${content.image}" alt="${content.imageAlt || content.title}" style="width: 100%; height: 200px; object-fit: cover;">
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 20px;">
                                <h3 style="color: #112357; font-size: 20px; margin: 0 0 10px 0; font-family: Arial, sans-serif; font-weight: bold;">
                                    ${content.title}
                                </h3>
                                <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 15px 0; font-family: Arial, sans-serif;">
                                    ${content.description}
                                </p>
                                ${content.linkUrl ? `
                                    <a href="${content.linkUrl}" style="background-color: #ffd401; color: #112357; padding: 10px 20px; text-decoration: none; border-radius: 20px; font-weight: bold; font-family: Arial, sans-serif; display: inline-block;">
                                        ${content.linkText || 'Projekt ansehen'}
                                    </a>
                                ` : ''}
                            </td>
                        </tr>
                    </table>
                `;
                
            default:
                return `
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                        <tr>
                            <td style="padding: 20px;">
                                <p style="color: #666666; font-family: Arial, sans-serif;">
                                    [${type} Block - Noch nicht implementiert]
                                </p>
                            </td>
                        </tr>
                    </table>
                `;
        }
    }
    
    getNewsletterTemplate(contentHTML) {
        return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Newsletter - Neon Murer AG</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        table { border-collapse: collapse; }
        img { border: 0; outline: none; text-decoration: none; }
        .newsletter-container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
        <tr>
            <td align="center" valign="top" style="background-color: #f4f4f4; padding: 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" class="newsletter-container">
                    <tr>
                        <td align="center" valign="top">
                            ${contentHTML}
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }
    
    getEmptyNewsletterHTML() {
        return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Leerer Newsletter</title>
    <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
        .empty-state { text-align: center; padding: 60px 20px; color: #666666; }
    </style>
</head>
<body style="background-color: #f4f4f4;">
    <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%">
        <tr>
            <td align="center" valign="top" style="background-color: #f4f4f4; padding: 20px;">
                <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff;">
                    <tr>
                        <td class="empty-state">
                            <h2 style="color: #112357; margin: 0 0 15px 0;">Leerer Newsletter</h2>
                            <p style="margin: 0; font-size: 16px;">Fügen Sie Content-Blöcke hinzu um Ihren Newsletter zu erstellen.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    previewNewsletter() {
        console.log('🔍 Opening newsletter preview...');
        
        try {
            const htmlContent = this.generateHTML();
            this.showPreviewModal(htmlContent);
            
        } catch (error) {
            console.error('Error generating preview:', error);
            this.showNotificationND('Fehler bei der Vorschau-Erstellung', 'error');
        }
    }
    
    showPreviewModal(htmlContent) {
        // Remove existing modal if present
        const existingModal = document.getElementById('newsletter-preview-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Create modal HTML
        const modalHTML = `
            <div class="modal fade" id="newsletter-preview-modal" tabindex="-1" aria-labelledby="previewModalLabel" aria-hidden="true">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header bg-primary text-white">
                            <h5 class="modal-title" id="previewModalLabel">
                                <i class="fas fa-eye me-2"></i>Newsletter Vorschau
                            </h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body p-0">
                            <div class="row g-0">
                                <div class="col-md-9">
                                    <div class="preview-container" style="height: 70vh; overflow-y: auto; background: #f8f9fa; padding: 1rem;">
                                        <div class="preview-frame" style="max-width: 600px; margin: 0 auto; background: white; box-shadow: 0 4px 20px rgba(0,0,0,0.1); border-radius: 8px;">
                                            <iframe id="preview-iframe" 
                                                    style="width: 100%; height: 600px; border: none; border-radius: 8px;"
                                                    title="Newsletter Preview">
                                            </iframe>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3 border-start">
                                    <div class="p-3">
                                        <h6 class="mb-3"><i class="fas fa-info-circle me-2"></i>Vorschau-Info</h6>
                                        <div class="preview-stats">
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-muted">Blöcke:</span>
                                                <span class="fw-bold" id="preview-block-count">0</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-muted">Größe:</span>
                                                <span class="fw-bold" id="preview-html-size">0 KB</span>
                                            </div>
                                            <div class="d-flex justify-content-between mb-2">
                                                <span class="text-muted">Erstellt:</span>
                                                <span class="fw-bold">${new Date().toLocaleString('de-DE')}</span>
                                            </div>
                                        </div>
                                        
                                        <hr class="my-3">
                                        
                                        <div class="d-grid gap-2">
                                            <button class="btn btn-outline-primary btn-sm" onclick="window.newsletterDesigner.refreshPreview()">
                                                <i class="fas fa-sync-alt me-2"></i>Aktualisieren
                                            </button>
                                            <button class="btn btn-success btn-sm" onclick="window.newsletterDesigner.exportFromPreview()">
                                                <i class="fas fa-download me-2"></i>HTML exportieren
                                            </button>
                                            <button class="btn btn-info btn-sm" onclick="window.newsletterDesigner.openInNewTab()">
                                                <i class="fas fa-external-link-alt me-2"></i>Neues Fenster
                                            </button>
                                        </div>
                                        
                                        <hr class="my-3">
                                        
                                        <h6 class="mb-2"><i class="fas fa-mobile-alt me-2"></i>Responsive Check</h6>
                                        <div class="btn-group-vertical w-100" role="group">
                                            <button class="btn btn-outline-secondary btn-sm active" onclick="window.newsletterDesigner.setPreviewWidth('100%', this)">
                                                <i class="fas fa-desktop me-2"></i>Desktop
                                            </button>
                                            <button class="btn btn-outline-secondary btn-sm" onclick="window.newsletterDesigner.setPreviewWidth('768px', this)">
                                                <i class="fas fa-tablet-alt me-2"></i>Tablet
                                            </button>
                                            <button class="btn btn-outline-secondary btn-sm" onclick="window.newsletterDesigner.setPreviewWidth('375px', this)">
                                                <i class="fas fa-mobile-alt me-2"></i>Mobile
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                                <i class="fas fa-times me-2"></i>Schließen
                            </button>
                            <button type="button" class="btn btn-warning" onclick="window.newsletterDesigner.saveNewsletter(); bootstrap.Modal.getInstance(document.getElementById('newsletter-preview-modal')).hide();">
                                <i class="fas fa-save me-2"></i>Speichern & Schließen
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Initialize and show modal
        setTimeout(() => {
            this.loadPreviewContent(htmlContent);
            this.updatePreviewStats(htmlContent);
            
            const modal = new bootstrap.Modal(document.getElementById('newsletter-preview-modal'));
            modal.show();
        }, 100);
    }
    
    loadPreviewContent(htmlContent) {
        const iframe = document.getElementById('preview-iframe');
        if (iframe) {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(htmlContent);
            doc.close();
        }
    }
    
    updatePreviewStats(htmlContent) {
        const blockCount = document.querySelectorAll('#newsletter-canvas .newsletter-block').length;
        const htmlSize = Math.round(new Blob([htmlContent]).size / 1024);
        
        const blockCountElement = document.getElementById('preview-block-count');
        const htmlSizeElement = document.getElementById('preview-html-size');
        
        if (blockCountElement) blockCountElement.textContent = blockCount;
        if (htmlSizeElement) htmlSizeElement.textContent = `${htmlSize} KB`;
    }
    
    refreshPreview() {
        console.log('🔄 Refreshing preview...');
        const htmlContent = this.generateHTML();
        this.loadPreviewContent(htmlContent);
        this.updatePreviewStats(htmlContent);
        this.showNotificationND('Vorschau aktualisiert', 'success');
    }
    
    exportFromPreview() {
        const htmlContent = this.generateHTML();
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `newsletter-preview-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showNotificationND('Newsletter HTML exportiert!', 'success');
    }
    
    openInNewTab() {
        const htmlContent = this.generateHTML();
        const newWindow = window.open('', '_blank');
        newWindow.document.write(htmlContent);
        newWindow.document.close();
    }
    
    setPreviewWidth(width, button) {
        const iframe = document.getElementById('preview-iframe');
        const container = iframe.parentElement;
        
        if (iframe && container) {
            // Update iframe width
            if (width === '100%') {
                container.style.maxWidth = '600px';
                iframe.style.width = '100%';
            } else {
                container.style.maxWidth = width;
                iframe.style.width = width;
            }
            
            // Update button states
            document.querySelectorAll('.btn-group-vertical .btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        }
    }

    async exportTemplate(templateId) {
        try {
            const response = await fetch(`/api/newsletter/templates/${templateId}`);
            const template = await response.json();
            
            // Show HTML in modal
            this.showHTMLExportModal(template.htmlContent);
            
        } catch (error) {
            console.error('Error exporting template:', error);
            showNotificationND('Fehler beim Exportieren', 'error');
        }
    }

    showHTMLExportModal(htmlContent) {
        const modal = `
            <div class="modal fade" id="html-export-modal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">
                                <i class="fas fa-code me-2"></i>HTML Export
                            </h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <p class="mb-0">Kopieren Sie diesen HTML-Code für Ihren Newsletter-Service:</p>
                                <button class="btn btn-sm btn-primary" onclick="navigator.clipboard.writeText(document.getElementById('html-content').value)">
                                    <i class="fas fa-copy me-2"></i>Kopieren
                                </button>
                            </div>
                            <textarea id="html-content" class="form-control" rows="20" readonly>${htmlContent}</textarea>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Schließen</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing modal
        const existingModal = document.getElementById('html-export-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add new modal
        document.body.insertAdjacentHTML('beforeend', modal);
        
        // Show modal
        const bootstrapModal = new bootstrap.Modal(document.getElementById('html-export-modal'));
        bootstrapModal.show();
    }
}

// Global functions for onclick handlers
function createNewNewsletter() {
    if (!window.newsletterDesigner) {
        console.error('Newsletter Designer not initialized');
        return;
    }
    
    newsletterDesigner.currentTemplate = null;
    
    // Clear canvas
    const canvas = document.getElementById('newsletter-canvas');
    canvas.innerHTML = `
        <div class="canvas-placeholder">
            <i class="fas fa-plus-circle fa-3x text-muted"></i>
            <p class="text-muted mt-3">Ziehen Sie Content-Blöcke hierher um zu beginnen</p>
        </div>
    `;
    
    // Clear properties
    document.getElementById('newsletter-properties').innerHTML = `
        <div class="text-center text-muted py-4">
            <i class="fas fa-mouse-pointer fa-2x mb-3"></i>
            <p class="mb-0">Wählen Sie einen Block aus um die Eigenschaften zu bearbeiten</p>
        </div>
    `;
    
    // Show designer
    document.getElementById('newsletter-designer').style.display = 'block';
    
    console.log('New newsletter created');
}

function cancelNewsletterEdit() {
    document.getElementById('newsletter-designer').style.display = 'none';
}

function setPreviewMode(mode) {
    newsletterDesigner.previewMode = mode;
    
    // Update button states
    document.getElementById('desktop-view').classList.toggle('active', mode === 'desktop');
    document.getElementById('mobile-view').classList.toggle('active', mode === 'mobile');
    
    // Update canvas styling
    const canvas = document.getElementById('newsletter-canvas');
    canvas.classList.toggle('mobile-preview', mode === 'mobile');
}

async function saveNewsletter() {
    console.log('💾 Saving newsletter...');
    
    const canvas = document.getElementById('newsletter-canvas');
    const blocks = Array.from(canvas.querySelectorAll('.newsletter-block'));
    
    if (blocks.length === 0) {
        console.log('⚠️ No blocks to save');
        alert('Fügen Sie mindestens einen Block hinzu');
        return;
    }
    
    const templateData = blocks.map(block => block._templateData);
    
    try {
        // Generate HTML
        console.log('🏗️ Generating HTML...');
        const htmlResponse = await fetch('/api/newsletter/generate-html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blocks: templateData })
        });
        
        if (!htmlResponse.ok) {
            throw new Error('HTML generation failed');
        }
        
        const { html } = await htmlResponse.json();
        
        // Prompt for template name (using native prompt to avoid conflicts)
        const name = prompt('Newsletter-Name:') || `Newsletter ${new Date().toLocaleDateString('de-DE')}`;
        
        // Save template
        console.log('📤 Saving template...');
        const method = newsletterDesigner.currentTemplate ? 'PUT' : 'POST';
        const url = newsletterDesigner.currentTemplate ? 
            `/api/newsletter/templates/${newsletterDesigner.currentTemplate.id}` : 
            '/api/newsletter/templates';
            
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                content: templateData,
                htmlContent: html
            })
        });
        
        if (response.ok) {
            console.log('✅ Newsletter saved successfully');
            newsletterDesigner.loadTemplates();
            
            // Show success in console instead of problematic notification
            console.log('Newsletter gespeichert:', name);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Save failed');
        }
    } catch (error) {
        console.error('❌ Error saving newsletter:', error);
        console.error('Fehler beim Speichern:', error.message);
        
        // Show error in alert instead of problematic notification
        alert('Fehler beim Speichern: ' + error.message);
    }
}

async function exportNewsletterHTML() {
    const canvas = document.getElementById('newsletter-canvas');
    const blocks = Array.from(canvas.querySelectorAll('.newsletter-block'));
    
    if (blocks.length === 0) {
        console.log('⚠️ No blocks to export');
        alert('Fügen Sie mindestens einen Block hinzu');
        return;
    }
    
    const templateData = blocks.map(block => block._templateData);
    
    try {
        const response = await fetch('/api/newsletter/generate-html', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ blocks: templateData })
        });
        
        const { html } = await response.json();
        newsletterDesigner.showHTMLExportModal(html);
        
    } catch (error) {
        console.error('❌ Error generating HTML:', error);
        console.error('Fehler beim HTML-Export:', error.message);
        alert('Fehler beim HTML-Export: ' + error.message);
    }
}

// Initialize newsletter designer
let newsletterDesigner;

// Wait for DOM and all scripts to load
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing Newsletter Designer...');
    
    // Small delay to ensure all other scripts are loaded
    setTimeout(() => {
        try {
            newsletterDesigner = new NewsletterDesigner();
            window.newsletterDesigner = newsletterDesigner;
            console.log('Newsletter Designer initialized successfully');
        } catch (error) {
            console.error('Failed to initialize Newsletter Designer:', error);
        }
    }, 100);
});

// Helper function for notifications (Newsletter Designer specific)
function showNotificationND(message, type = 'info') {
    // Try to use existing notification system
    if (window.showAlert) {
        showAlert(message, type);
    } else {
        console.log(`[Newsletter Designer - ${type.toUpperCase()}] ${message}`);
    }
}

// Global wrapper function for HTML onclick handler
function previewNewsletter() {
    if (window.newsletterDesigner) {
        window.newsletterDesigner.previewNewsletter();
    } else {
        console.error('Newsletter Designer not initialized');
        console.error('Newsletter Designer ist noch nicht geladen. Bitte warten Sie einen Moment.');
    }
}