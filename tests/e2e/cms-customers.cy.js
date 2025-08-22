describe('👥 CMS Customer Management E2E Tests', () => {
  beforeEach(() => {
    cy.apiLogin();
    cy.visit('/cms-admin/index.html');
    cy.goToSection('customers');
  });

  afterEach(() => {
    // Clean up test data
    cy.request({
      method: 'GET',
      url: '/api/customers',
      headers: {
        'Authorization': `Bearer ${window.localStorage.getItem('token')}`
      },
      failOnStatusCode: false
    }).then((response) => {
      if (response.status === 200) {
        const customers = response.body.customers || response.body;
        customers.forEach(customer => {
          if (customer.company === 'Cypress Test AG' || customer.email === 'cypress@test.ch') {
            cy.request({
              method: 'DELETE',
              url: `/api/customers/${customer.id}`,
              headers: {
                'Authorization': `Bearer ${window.localStorage.getItem('token')}`
              },
              failOnStatusCode: false
            });
          }
        });
      }
    });
  });

  it('✅ Should display customer list correctly', () => {
    cy.get('#customers-section').should('be.visible');
    cy.get('.page-title').should('contain', 'Kunden');
    
    // Should have customer table
    cy.get('#customersTable').should('be.visible');
    cy.get('#customersTable thead').should('contain', 'Firma');
    cy.get('#customersTable thead').should('contain', 'Kontakt');
    cy.get('#customersTable thead').should('contain', 'E-Mail');
    cy.get('#customersTable thead').should('contain', 'Status');
  });

  it('✅ Should create new customer', () => {
    // Click "Neuer Kunde" button
    cy.get('button').contains('Neuer Kunde').click();
    
    // Fill customer form
    cy.get('input[name="company"]').type('Cypress Test AG');
    cy.get('input[name="firstName"]').type('Cypress');
    cy.get('input[name="lastName"]').type('Test');
    cy.get('input[name="email"]').type('cypress@test.ch');
    cy.get('input[name="phone"]').type('+41 44 123 45 67');
    cy.get('input[name="city"]').type('Zürich');
    cy.get('input[name="zipCode"]').type('8001');
    cy.get('select[name="industry"]').select('IT');
    cy.get('select[name="status"]').select('active');
    
    // Submit form
    cy.get('button[type="submit"]').click();
    
    // Check success notification
    cy.checkNotification('success', 'Kunde erfolgreich erstellt');
    
    // Verify customer appears in table
    cy.get('#customersTable tbody').should('contain', 'Cypress Test AG');
    cy.get('#customersTable tbody').should('contain', 'cypress@test.ch');
  });

  it('✅ Should edit existing customer', () => {
    // Create test customer first
    cy.apiLogin();
    cy.createTestCustomer({
      company: 'Edit Test Company',
      email: 'edit@test.ch'
    }).then((customer) => {
      // Reload page to see new customer
      cy.reload();
      cy.goToSection('customers');
      
      // Find and click edit button
      cy.get('#customersTable tbody tr')
        .contains('Edit Test Company')
        .parent('tr')
        .find('button[title="Bearbeiten"]')
        .click();
      
      // Update customer data
      cy.get('input[name="company"]').clear().type('Updated Test Company');
      cy.get('input[name="phone"]').clear().type('+41 44 999 88 77');
      
      // Submit form
      cy.get('button[type="submit"]').click();
      
      // Check success notification
      cy.checkNotification('success', 'Kunde erfolgreich aktualisiert');
      
      // Verify changes
      cy.get('#customersTable tbody').should('contain', 'Updated Test Company');
      cy.get('#customersTable tbody').should('contain', '+41 44 999 88 77');
    });
  });

  it('✅ Should export customers in different formats', () => {
    // Test Excel export
    cy.get('.btn-group .dropdown-toggle').click();
    cy.get('.dropdown-item').contains('Excel (.xlsx)').click();
    
    // Check for success notification
    cy.checkNotification('success', 'Excel-Export');
    
    // Test CSV export
    cy.get('.btn-group .dropdown-toggle').click();
    cy.get('.dropdown-item').contains('CSV (.csv)').click();
    
    // Check for success notification
    cy.checkNotification('success', 'CSV-Export');
    
    // Test JSON export
    cy.get('.btn-group .dropdown-toggle').click();
    cy.get('.dropdown-item').contains('JSON (.json)').click();
    
    // Check for success notification
    cy.checkNotification('success', 'JSON-Export');
  });

  it('✅ Should search and filter customers', () => {
    // Create test customers for filtering
    cy.apiLogin();
    cy.createTestCustomer({
      company: 'Filter Test 1',
      email: 'filter1@test.ch',
      status: 'active'
    });
    cy.createTestCustomer({
      company: 'Filter Test 2',
      email: 'filter2@test.ch',
      status: 'inactive'
    });
    
    cy.reload();
    cy.goToSection('customers');
    
    // Test search functionality
    if (cy.get('input[placeholder*="Suchen"]').length > 0) {
      cy.get('input[placeholder*="Suchen"]').type('Filter Test 1');
      cy.get('#customersTable tbody').should('contain', 'Filter Test 1');
      cy.get('#customersTable tbody').should('not.contain', 'Filter Test 2');
      
      // Clear search
      cy.get('input[placeholder*="Suchen"]').clear();
    }
    
    // Test status filter if it exists
    if (cy.get('select[name="statusFilter"]').length > 0) {
      cy.get('select[name="statusFilter"]').select('active');
      cy.get('#customersTable tbody').should('contain', 'active');
    }
  });

  it('✅ Should delete customer', () => {
    // Create test customer
    cy.apiLogin();
    cy.createTestCustomer({
      company: 'Delete Test Company',
      email: 'delete@test.ch'
    });
    
    cy.reload();
    cy.goToSection('customers');
    
    // Find and click delete button
    cy.get('#customersTable tbody tr')
      .contains('Delete Test Company')
      .parent('tr')
      .find('button[title="Löschen"]')
      .click();
    
    // Confirm deletion
    cy.get('.modal').should('be.visible');
    cy.get('.modal button').contains('Löschen').click();
    
    // Check success notification
    cy.checkNotification('success', 'Kunde erfolgreich gelöscht');
    
    // Verify customer is removed
    cy.get('#customersTable tbody').should('not.contain', 'Delete Test Company');
  });
});