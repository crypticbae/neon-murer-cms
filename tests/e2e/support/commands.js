// Custom Cypress Commands für Neon Murer CMS

// Login command
Cypress.Commands.add('login', (email = 'admin@neonmurer.ch', password = 'NeonMurer2024!') => {
  cy.visit('/cms-admin/login.html');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  
  // Wait for redirect to dashboard
  cy.url().should('include', '/cms-admin/index.html');
  cy.get('.welcome-section').should('be.visible');
});

// API Login command (for backend auth)
Cypress.Commands.add('apiLogin', (email = 'admin@neonmurer.ch', password = 'NeonMurer2024!') => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    expect(response.status).to.eq(200);
    cy.window().then((win) => {
      win.localStorage.setItem('token', response.body.tokens.accessToken);
      win.localStorage.setItem('user', JSON.stringify(response.body.user));
    });
  });
});

// Navigate to CMS section
Cypress.Commands.add('goToSection', (section) => {
  const sectionMap = {
    'customers': 'customers-section',
    'analytics': 'analytics-section', 
    'pages': 'content-section',
    'settings': 'settings-section'
  };
  const sectionId = sectionMap[section] || section;
  cy.get(`[onclick="showSection('${sectionId}'); return false;"]`).click();
  cy.get(`#${sectionId}`).should('be.visible');
});

// Create test customer
Cypress.Commands.add('createTestCustomer', (customerData = {}) => {
  const defaultCustomer = {
    company: 'Test Company AG',
    firstName: 'Test',
    lastName: 'User',
    email: 'test@company.ch',
    phone: '+41 44 123 45 67',
    city: 'Zürich',
    zipCode: '8001',
    industry: 'IT',
    status: 'active',
    ...customerData
  };

  cy.request({
    method: 'POST',
    url: '/api/customers',
    body: defaultCustomer,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    }
  }).then((response) => {
    expect(response.status).to.eq(201);
    return cy.wrap(response.body.customer);
  });
});

// Clean up test data
Cypress.Commands.add('cleanupTestData', () => {
  // Clean up test customers
  cy.request({
    method: 'GET',
    url: '/api/customers',
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('token')}`
    }
  }).then((response) => {
    const testCustomers = response.body.customers.filter(customer => 
      customer.email && customer.email.includes('test@')
    );
    
    testCustomers.forEach(customer => {
      cy.request({
        method: 'DELETE',
        url: `/api/customers/${customer.id}`,
        headers: {
          'Authorization': `Bearer ${window.localStorage.getItem('token')}`
        },
        failOnStatusCode: false
      });
    });
  });
});

// Wait for API request to complete
Cypress.Commands.add('waitForApi', (alias) => {
  cy.wait(alias);
  cy.get('.loading').should('not.exist');
});

// Check notification
Cypress.Commands.add('checkNotification', (type, message) => {
  cy.get(`.notification.${type}`).should('be.visible');
  if (message) {
    cy.get(`.notification.${type}`).should('contain', message);
  }
  // Wait for notification to disappear
  cy.get(`.notification.${type}`, { timeout: 2000 }).should('not.exist');
});