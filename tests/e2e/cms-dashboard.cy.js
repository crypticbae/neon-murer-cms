describe('📊 CMS Dashboard E2E Tests', () => {
  beforeEach(() => {
    cy.apiLogin();
    cy.visit('/cms-admin/index.html');
  });

  it('✅ Should display dashboard sections correctly', () => {
    // Dashboard section
    cy.get('#dashboard-section').should('be.visible');
    cy.get('.page-title').should('contain', 'Dashboard');
    
    // Essential tools section
    cy.get('.essential-tools').should('be.visible');
    cy.get('.essential-tools h3').should('contain', 'Essential Tools');
    
    // Check tool buttons
    cy.get('button').contains('Seiten verwalten').should('be.visible');
    cy.get('button').contains('Medien verwalten').should('be.visible');
    cy.get('button').contains('Kundenmanagement').should('be.visible');
    
    // "Projekte verwalten" should be disabled
    cy.get('button').contains('Projekte verwalten').should('be.disabled');
    cy.get('.badge').contains('Bald verfügbar').should('be.visible');
  });

  it('✅ Should navigate between sections', () => {
    // Test navigation to different sections
    cy.goToSection('pages');
    cy.get('#pagesSection h2').should('contain', 'Seiten verwalten');
    
    cy.goToSection('media');
    cy.get('#mediaSection h2').should('contain', 'Medien verwalten');
    
    cy.goToSection('customers');
    cy.get('#customersSection h2').should('contain', 'Kundenmanagement');
    
    cy.goToSection('analytics');
    cy.get('#analyticsSection h2').should('contain', 'Analytics Dashboard');
  });

  it('✅ Should display sidebar navigation correctly', () => {
    cy.get('.sidebar').should('be.visible');
    
    // Check all navigation items
    const menuItems = [
      'Dashboard',
      'Seiten',
      'Medien',
      'Team',
      'Jobs',
      'News',
      'Kunden',
      'Analytics',
      'Einstellungen'
    ];
    
    menuItems.forEach(item => {
      cy.get('.sidebar').should('contain', item);
    });
  });

  it('✅ Should handle logout correctly', () => {
    // Find and click logout button
    cy.get('button').contains('Logout').click();
    
    // Should redirect to login page
    cy.url().should('include', '/cms-admin/login.html');
    
    // Should clear auth data
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('user')).to.be.null;
    });
  });

  it('✅ Should display notifications correctly', () => {
    // Test notification system by triggering an action
    cy.goToSection('analytics');
    cy.get('button').contains('Aktualisieren').click();
    
    // Check for notification
    cy.get('.notification.success').should('be.visible');
    cy.get('.notification.success').should('contain', 'Analytics-Daten geladen');
    
    // Notification should disappear automatically
    cy.get('.notification.success', { timeout: 2000 }).should('not.exist');
  });
});