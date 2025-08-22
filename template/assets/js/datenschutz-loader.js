document.addEventListener('DOMContentLoaded', async () => {
    const datenschutzContentDiv = document.getElementById('datenschutz-content');
    const datenschutzLoadingDiv = document.getElementById('datenschutz-loading');
    const quickNavLinksDiv = document.getElementById('datenschutz-quick-nav-links');

    if (!datenschutzContentDiv || !datenschutzLoadingDiv || !quickNavLinksDiv) {
        console.error('Datenschutz container, loading indicator, or quick navigation container not found.');
        return;
    }

    try {
        // Show loading indicator
        datenschutzLoadingDiv.style.display = 'block';
        datenschutzContentDiv.style.display = 'none';

        const response = await fetch('/api/datenschutz');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const { data: datenschutzSections } = await response.json();

        // Sort sections by sortOrder
        datenschutzSections.sort((a, b) => a.sortOrder - b.sortOrder);

        datenschutzContentDiv.innerHTML = ''; // Clear existing content
        quickNavLinksDiv.innerHTML = ''; // Clear existing quick nav

        datenschutzSections.forEach((section, index) => {
            // Render main content section
            const sectionHtml = `
                <div class="content-section" id="datenschutz-section-${section.sortOrder}">
                    <h2 class="section-title">
                        <i class="${section.iconClass || 'fa-solid fa-info-circle'} me-3"></i>
                        <span class="section-number">${section.sortOrder}.</span>
                        ${section.title}
                        ${!section.isEditable ? '<span class="badge bg-secondary ms-3" style="font-size: 0.6rem;">System</span>' : ''}
                    </h2>
                    <div class="info-card ${section.boxType === 'HIGHLIGHT' ? 'highlight-card' : section.boxType === 'IMPORTANT' ? 'important-card' : ''}">
                        ${section.content}
                    </div>
                </div>
            `;
            datenschutzContentDiv.insertAdjacentHTML('beforeend', sectionHtml);

            // Render quick navigation link if showInQuickNav is true
            if (section.showInQuickNav) {
                const navLinkHtml = `
                    <a href="#datenschutz-section-${section.sortOrder}" class="nav-link" onclick="scrollToDatenschutzSection(${section.sortOrder})">
                        <span class="nav-number">${section.sortOrder}.</span>
                        ${section.title}
                    </a>
                `;
                quickNavLinksDiv.insertAdjacentHTML('beforeend', navLinkHtml);
            }
        });

        // Hide loading indicator and show content
        datenschutzLoadingDiv.style.display = 'none';
        datenschutzContentDiv.style.display = 'block';

        console.log(`✅ ${datenschutzSections.length} Datenschutz-Abschnitte erfolgreich geladen`);

    } catch (error) {
        console.error('Error loading Datenschutz sections:', error);
        datenschutzLoadingDiv.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Fehler beim Laden der Datenschutzerklärung</strong>
                <br>
                <small class="text-muted">${error.message}</small>
                <br><br>
                <button class="btn btn-outline-primary btn-sm" onclick="location.reload()">
                    <i class="fas fa-redo me-2"></i>
                    Seite neu laden
                </button>
            </div>
        `;
    }
});

// Smooth scrolling function for datenschutz sections
function scrollToDatenschutzSection(sectionNumber) {
    const targetElement = document.getElementById(`datenschutz-section-${sectionNumber}`);
    if (targetElement) {
        targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Enhanced scroll highlighting for datenschutz sections
document.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.content-section[id^="datenschutz-section-"]');
    const navLinks = document.querySelectorAll('.nav-link[href^="#datenschutz-section-"]');
    
    let current = '';
    sections.forEach((section) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (window.pageYOffset >= sectionTop - 200) {
            const sectionId = section.id;
            const sectionNumber = sectionId.replace('datenschutz-section-', '');
            current = sectionNumber;
        }
    });
    
    navLinks.forEach(link => link.classList.remove('active'));
    if (current) {
        const activeLink = document.querySelector(`.nav-link[href="#datenschutz-section-${current}"]`);
        if (activeLink) activeLink.classList.add('active');
    }
});

// Make functions globally available
window.scrollToDatenschutzSection = scrollToDatenschutzSection;