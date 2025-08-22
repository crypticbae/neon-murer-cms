describe('🔐 CMS Login E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/cms-admin/login.html');
  });

  it('✅ Should display login form correctly', () => {
    cy.get('h2').should('contain', 'Neon Murer');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
  });

  it('✅ Should login with valid credentials', () => {
    cy.get('input[type="email"]').type('admin@neonmurer.ch');
    cy.get('input[type="password"]').type('NeonMurer2024!');
    cy.get('button[type="submit"]').click();
    
    // Should redirect to dashboard
    cy.url().should('include', '/cms-admin/index.html');
    cy.get('#dashboard-section').should('be.visible');
    cy.get('.header h1').should('contain', 'Dashboard');
  });

  it('❌ Should show error with invalid credentials', () => {
    cy.get('input[type="email"]').type('admin@neonmurer.ch');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Should stay on login page and show error
    cy.url().should('include', '/cms-admin/login.html');
    cy.get('.alert.alert-danger').should('be.visible');
    cy.get('#alertMessage').should('contain.text', 'Demo');
  });

  it('❌ Should show validation error with empty fields', () => {
    cy.get('button[type="submit"]').click();
    
    // Should stay on login page
    cy.url().should('include', '/cms-admin/login.html');
    
    // Check HTML5 validation
    cy.get('input[type="email"]:invalid').should('exist');
  });

  it('✅ Should show loading state during login', () => {
    cy.get('input[type="email"]').type('admin@neonmurer.ch');
    cy.get('input[type="password"]').type('NeonMurer2024!');
    
    // Intercept the login request
    cy.intercept('POST', '/api/auth/login').as('loginRequest');
    
    cy.get('button[type="submit"]').click();
    
    // Check loading state
    cy.get('button[type="submit"]').should('be.disabled');
    
    cy.wait('@loginRequest');
  });
});