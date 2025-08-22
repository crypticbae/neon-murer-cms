// Cypress E2E Support File
import './commands';

// Hide fetch/XHR requests in command log
Cypress.on('window:before:load', (win) => {
  const originalFetch = win.fetch;
  win.fetch = function (...args) {
    return originalFetch.apply(this, args);
  };
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // returning false here prevents Cypress from failing the test
  if (err.message.includes('ResizeObserver loop limit exceeded') || 
      err.message.includes('Invalid or unexpected token') ||
      err.message.includes('Unexpected token')) {
    return false;
  }
  return true;
});

// Global before hook
beforeEach(() => {
  // Clear any existing auth tokens
  cy.clearLocalStorage();
  cy.clearCookies();
});