// AGB Dynamic Content Loader
class AGBLoader {
    constructor() {
        this.agbSections = [];
        this.init();
    }

    async init() {
        try {
            await this.loadAGBSections();
            this.renderContent();
            this.hideLoading();
        } catch (error) {
            console.error('Error loading AGB sections:', error);
            this.showError();
        }
    }

    async loadAGBSections() {
        const response = await fetch('/api/agb');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        this.agbSections = data.data.sort((a, b) => a.sortOrder - b.sortOrder);
    }

    renderContent() {
        const contentContainer = document.getElementById('agb-content');
        const quickNavContainer = document.getElementById('quick-nav-links');
        
        if (!contentContainer) return;

        // Clear existing content
        contentContainer.innerHTML = '';
        if (quickNavContainer) quickNavContainer.innerHTML = '';

        this.agbSections.forEach((section, index) => {
            // Render main content section
            const sectionElement = this.createSectionElement(section, index + 1);
            contentContainer.appendChild(sectionElement);

            // Add to quick navigation if enabled
            if (section.showInQuickNav && quickNavContainer) {
                const navElement = this.createNavElement(section, index + 1);
                quickNavContainer.appendChild(navElement);
            }
        });
    }

    createSectionElement(section, sectionNumber) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'content-section';
        sectionDiv.id = `section-${sectionNumber}`;

        const cardClass = this.getCardClass(section.boxType);
        
        sectionDiv.innerHTML = `
            <h2 class="section-title">
                <i class="${section.iconClass || 'fa-solid fa-info-circle'} me-3"></i>
                <span class="section-number">${sectionNumber}.</span>
                ${section.title}
            </h2>
            <div class="${cardClass}">
                ${section.content}
            </div>
        `;

        return sectionDiv;
    }

    createNavElement(section, sectionNumber) {
        const navLink = document.createElement('a');
        navLink.href = '#';
        navLink.className = 'nav-link';
        navLink.onclick = () => this.scrollToSection(sectionNumber);
        
        navLink.innerHTML = `
            <span class="nav-number">${sectionNumber}.</span>
            ${section.title}
        `;

        return navLink;
    }

    getCardClass(boxType) {
        switch (boxType) {
            case 'HIGHLIGHT':
                return 'info-card highlight-card';
            case 'IMPORTANT':
                return 'info-card important-card';
            case 'DEFAULT':
            default:
                return 'info-card';
        }
    }

    scrollToSection(sectionNumber) {
        const section = document.getElementById(`section-${sectionNumber}`);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    hideLoading() {
        const loadingElement = document.getElementById('agb-loading');
        const contentElement = document.getElementById('agb-content');
        
        if (loadingElement) loadingElement.style.display = 'none';
        if (contentElement) contentElement.style.display = 'block';
    }

    showError() {
        const loadingElement = document.getElementById('agb-loading');
        if (loadingElement) {
            loadingElement.innerHTML = `
                <div class="alert alert-danger">
                    <h4>Fehler beim Laden der AGB</h4>
                    <p>Die Geschäftsbedingungen konnten nicht geladen werden. Bitte versuchen Sie es später erneut.</p>
                    <button class="btn btn-primary" onclick="location.reload()">Seite neu laden</button>
                </div>
            `;
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AGBLoader();
});

// Also handle scroll highlighting for navigation
document.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        if (window.pageYOffset >= sectionTop - 200) {
            current = index + 1;
        }
    });
    
    navLinks.forEach(link => link.classList.remove('active'));
    if (current) {
        const activeLink = document.querySelector(`.nav-link:nth-child(${current})`);
        if (activeLink) activeLink.classList.add('active');
    }
});