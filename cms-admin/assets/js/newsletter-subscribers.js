/**
 * Newsletter Subscribers Management
 * Handles subscriber list, filtering, export, and management
 */

class NewsletterSubscribers {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 20;
        this.currentFilters = {
            search: '',
            status: 'active'
        };
        this.subscribers = [];
        this.totalCount = 0;
        
        this.initEventListeners();
    }
    
    initEventListeners() {
        // Auto-Suche mit Debounce
        const searchInput = document.getElementById('subscriber-search');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', () => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.applyFilters();
                }, 500);
            });
        }
        
        // Status-Filter
        const statusFilter = document.getElementById('subscriber-status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }
    
    async loadSubscribers(page = 1) {
        try {
            console.log('📧 Loading newsletter subscribers...');
            
            const params = new URLSearchParams({
                page: page.toString(),
                limit: this.pageSize.toString(),
                status: this.currentFilters.status,
                ...(this.currentFilters.search && { search: this.currentFilters.search })
            });
            
            const response = await fetch(`/api/newsletter/subscribers?${params}`);
            const data = await response.json();
            
            if (response.ok) {
                this.subscribers = data.subscribers;
                this.totalCount = data.pagination.total;
                this.currentPage = page;
                
                this.renderSubscribers();
                this.renderPagination(data.pagination);
                this.updateStatistics();
                
                console.log(`✅ Loaded ${this.subscribers.length} subscribers`);
            } else {
                throw new Error(data.error || 'Fehler beim Laden der Abonnenten');
            }
            
        } catch (error) {
            console.error('Error loading subscribers:', error);
            this.showError('Fehler beim Laden der Abonnenten: ' + error.message);
        }
    }
    
    renderSubscribers() {
        const tbody = document.getElementById('subscribers-table-body');
        if (!tbody) return;
        
        if (this.subscribers.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4">
                        <div class="text-muted">
                            <i class="fas fa-users fa-2x mb-3 d-block"></i>
                            <h5>Keine Abonnenten gefunden</h5>
                            <p>Es wurden keine Abonnenten gefunden, die den aktuellen Filterkriterien entsprechen.</p>
                        </div>
                    </td>
                </tr>
            `;
            return;
        }
        
        tbody.innerHTML = this.subscribers.map(subscriber => `
            <tr>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-envelope text-muted me-2"></i>
                        <div>
                            <strong>${this.escapeHtml(subscriber.email)}</strong>
                            ${!subscriber.isConfirmed ? '<span class="badge bg-warning ms-2">Unbestätigt</span>' : ''}
                        </div>
                    </div>
                </td>
                <td>
                    <div>
                        <strong>${this.escapeHtml(subscriber.firstName)} ${this.escapeHtml(subscriber.lastName)}</strong>
                        ${subscriber.segments.length > 0 ? `<br><small class="text-muted">Segmente: ${subscriber.segments.join(', ')}</small>` : ''}
                    </div>
                </td>
                <td>
                    ${subscriber.isActive 
                        ? '<span class="badge bg-success">Aktiv</span>' 
                        : '<span class="badge bg-secondary">Abgemeldet</span>'
                    }
                </td>
                <td>
                    <span class="badge bg-info">${subscriber.source || 'Unbekannt'}</span>
                </td>
                <td>
                    <div>
                        <strong>${this.formatDate(subscriber.subscribedAt)}</strong>
                        ${subscriber.confirmedAt ? `<br><small class="text-muted">Bestätigt: ${this.formatDate(subscriber.confirmedAt)}</small>` : ''}
                        ${subscriber.unsubscribedAt ? `<br><small class="text-muted">Abgemeldet: ${this.formatDate(subscriber.unsubscribedAt)}</small>` : ''}
                    </div>
                </td>
                <td>
                    <div class="btn-group btn-group-sm">
                        ${subscriber.isActive 
                            ? `<button class="btn btn-outline-warning" onclick="newsletterSubscribers.unsubscribeUser('${subscriber.id}')" title="Abmelden">
                                 <i class="fas fa-user-times"></i>
                               </button>`
                            : `<button class="btn btn-outline-success" onclick="newsletterSubscribers.reactivateUser('${subscriber.id}')" title="Reaktivieren">
                                 <i class="fas fa-user-check"></i>
                               </button>`
                        }
                        <button class="btn btn-outline-danger" onclick="newsletterSubscribers.deleteSubscriber('${subscriber.id}')" title="Löschen">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Update total badge
        const totalBadge = document.getElementById('total-subscribers-badge');
        if (totalBadge) {
            totalBadge.textContent = this.totalCount;
        }
    }
    
    renderPagination(pagination) {
        const paginationContainer = document.getElementById('subscribers-pagination');
        if (!paginationContainer) return;
        
        const { page, pages, total } = pagination;
        
        if (pages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <li class="page-item ${page === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="newsletterSubscribers.loadSubscribers(${page - 1}); return false;">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
        
        // Page numbers
        const startPage = Math.max(1, page - 2);
        const endPage = Math.min(pages, page + 2);
        
        if (startPage > 1) {
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="newsletterSubscribers.loadSubscribers(1); return false;">1</a>
                </li>
            `;
            if (startPage > 2) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
        }
        
        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <li class="page-item ${i === page ? 'active' : ''}">
                    <a class="page-link" href="#" onclick="newsletterSubscribers.loadSubscribers(${i}); return false;">${i}</a>
                </li>
            `;
        }
        
        if (endPage < pages) {
            if (endPage < pages - 1) {
                paginationHTML += '<li class="page-item disabled"><span class="page-link">...</span></li>';
            }
            paginationHTML += `
                <li class="page-item">
                    <a class="page-link" href="#" onclick="newsletterSubscribers.loadSubscribers(${pages}); return false;">${pages}</a>
                </li>
            `;
        }
        
        // Next button
        paginationHTML += `
            <li class="page-item ${page === pages ? 'disabled' : ''}">
                <a class="page-link" href="#" onclick="newsletterSubscribers.loadSubscribers(${page + 1}); return false;">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
        
        paginationContainer.innerHTML = paginationHTML;
    }
    
    async updateStatistics() {
        try {
            // Active subscribers
            const activeResponse = await fetch('/api/newsletter/subscribers?status=active&limit=1');
            const activeData = await activeResponse.json();
            
            // Inactive subscribers
            const inactiveResponse = await fetch('/api/newsletter/subscribers?status=inactive&limit=1');
            const inactiveData = await inactiveResponse.json();
            
            // Today's new subscribers
            const today = new Date().toISOString().split('T')[0];
            const todayResponse = await fetch(`/api/newsletter/subscribers?status=active&limit=1000`);
            const todayData = await todayResponse.json();
            const todayCount = todayData.subscribers.filter(sub => 
                sub.subscribedAt.startsWith(today)
            ).length;
            
            // Update counters
            document.getElementById('active-subscribers-count').textContent = activeData.pagination.total;
            document.getElementById('inactive-subscribers-count').textContent = inactiveData.pagination.total;
            document.getElementById('today-subscribers-count').textContent = todayCount;
            
        } catch (error) {
            console.error('Error updating statistics:', error);
        }
    }
    
    applyFilters() {
        const searchInput = document.getElementById('subscriber-search');
        const statusFilter = document.getElementById('subscriber-status-filter');
        
        this.currentFilters = {
            search: searchInput ? searchInput.value.trim() : '',
            status: statusFilter ? statusFilter.value : 'active'
        };
        
        this.currentPage = 1;
        this.loadSubscribers(1);
    }
    
    async exportSubscribers() {
        try {
            console.log('📊 Exporting subscribers...');
            
            const status = this.currentFilters.status === 'all' ? '' : this.currentFilters.status;
            const params = new URLSearchParams();
            if (status) params.append('status', status);
            
            const response = await fetch(`/api/newsletter/subscribers/export?${params}`);
            
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `newsletter_abonnenten_${new Date().toISOString().split('T')[0]}.csv`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
                
                this.showSuccess('CSV-Export erfolgreich heruntergeladen!');
            } else {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Export fehlgeschlagen');
            }
            
        } catch (error) {
            console.error('Error exporting subscribers:', error);
            this.showError('Fehler beim Export: ' + error.message);
        }
    }
    
    async deleteSubscriber(subscriberId) {
        console.log('🗑️ Delete subscriber called with ID:', subscriberId);
        
        // Skip confirmation for now due to override conflict
        console.log('⚠️ Proceeding with deletion (confirmation bypassed due to admin.js override conflict)');
        
        // TODO: Implement proper confirmation dialog that doesn't conflict with admin.js overrides
        
        try {
            console.log('🔥 Sending DELETE request to:', `/api/newsletter/subscribers/${subscriberId}`);
            
            const response = await fetch(`/api/newsletter/subscribers/${subscriberId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log('📡 Response status:', response.status);
            
            const data = await response.json();
            console.log('📋 Response data:', data);
            
            if (response.ok) {
                this.showSuccess('Abonnent erfolgreich gelöscht');
                console.log('✅ Subscriber deleted successfully, reloading list...');
                this.loadSubscribers(this.currentPage);
            } else {
                throw new Error(data.error || 'Löschen fehlgeschlagen');
            }
            
        } catch (error) {
            console.error('❌ Error deleting subscriber:', error);
            this.showError('Fehler beim Löschen: ' + error.message);
        }
    }
    
    async unsubscribeUser(subscriberId) {
        try {
            const subscriber = this.subscribers.find(s => s.id === subscriberId);
            if (!subscriber) return;
            
            const response = await fetch('/api/newsletter/unsubscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: subscriber.email })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess('Abonnent erfolgreich abgemeldet');
                this.loadSubscribers(this.currentPage);
            } else {
                throw new Error(data.error || 'Abmeldung fehlgeschlagen');
            }
            
        } catch (error) {
            console.error('Error unsubscribing user:', error);
            this.showError('Fehler bei der Abmeldung: ' + error.message);
        }
    }
    
    async reactivateUser(subscriberId) {
        try {
            const subscriber = this.subscribers.find(s => s.id === subscriberId);
            if (!subscriber) return;
            
            const response = await fetch('/api/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: subscriber.email,
                    firstName: subscriber.firstName,
                    lastName: subscriber.lastName,
                    source: 'cms_reactivation'
                })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                this.showSuccess('Abonnent erfolgreich reaktiviert');
                this.loadSubscribers(this.currentPage);
            } else {
                throw new Error(data.error || 'Reaktivierung fehlgeschlagen');
            }
            
        } catch (error) {
            console.error('Error reactivating user:', error);
            this.showError('Fehler bei der Reaktivierung: ' + error.message);
        }
    }
    
    // Utility methods
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('de-DE', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    showSuccess(message) {
        if (window.showAlert) {
            showAlert(message, 'success');
        } else {
            alert(message);
        }
    }
    
    showError(message) {
        if (window.showAlert) {
            showAlert(message, 'error');
        } else {
            alert('Fehler: ' + message);
        }
    }
}

// Global functions for HTML onclick handlers
function refreshSubscribers() {
    if (window.newsletterSubscribers) {
        window.newsletterSubscribers.loadSubscribers(window.newsletterSubscribers.currentPage);
    }
}

function exportSubscribers() {
    if (window.newsletterSubscribers) {
        window.newsletterSubscribers.exportSubscribers();
    }
}

function applySubscriberFilters() {
    if (window.newsletterSubscribers) {
        window.newsletterSubscribers.applyFilters();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('📧 Newsletter Subscribers Script Loading...');
    
    // Initialize only if newsletter section exists
    const newsletterSection = document.getElementById('newsletter-section');
    console.log('🔍 Newsletter section found:', !!newsletterSection);
    
    if (newsletterSection) {
        console.log('✅ Initializing NewsletterSubscribers...');
        window.newsletterSubscribers = new NewsletterSubscribers();
        
        // Load subscribers when tab becomes active
        const subscribersTab = document.getElementById('subscribers-tab');
        console.log('🔍 Subscribers tab found:', !!subscribersTab);
        
        if (subscribersTab) {
            subscribersTab.addEventListener('shown.bs.tab', function() {
                console.log('📋 Subscribers tab activated, loading data...');
                window.newsletterSubscribers.loadSubscribers(1);
            });
        }
        
        // Test global access
        console.log('🌐 Global newsletterSubscribers available:', !!window.newsletterSubscribers);
        console.log('🗑️ Delete function available:', typeof window.newsletterSubscribers.deleteSubscriber);
    } else {
        console.log('❌ Newsletter section not found, not initializing');
    }
});