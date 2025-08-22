const request = require('supertest');
const express = require('express');
const customerRoutes = require('../../routes/customers');

describe('👥 Customer API Tests', () => {
  let app;
  let authToken;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/customers', customerRoutes);

    // Get auth token
    const authApp = express();
    authApp.use(express.json());
    authApp.use('/api/auth', require('../../routes/auth'));
    
    const loginResponse = await request(authApp)
      .post('/api/auth/login')
      .send({
        email: 'admin@neonmurer.ch',
        password: 'NeonMurer2024!'
      });
    
    authToken = loginResponse.body.tokens.accessToken;
  });

  describe('GET /api/customers', () => {
    test('✅ Should fetch all customers', async () => {
      const response = await request(app)
        .get('/api/customers')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.customers)).toBe(true);
      expect(response.body).toHaveProperty('total');
    });

    test('✅ Should include contacts when requested', async () => {
      const response = await request(app)
        .get('/api/customers?includeContacts=true')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.customers)).toBe(true);
      
      // Check if customers have contacts
      if (response.body.customers.length > 0) {
        const customerWithContacts = response.body.customers.find(c => c.contacts && c.contacts.length > 0);
        if (customerWithContacts) {
          expect(Array.isArray(customerWithContacts.contacts)).toBe(true);
        }
      }
    });

    test('❌ Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/customers');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/customers', () => {
    test('✅ Should create new customer with valid data', async () => {
      const timestamp = Date.now();
      const newCustomer = {
        company: `Test Company ${timestamp} AG`,
        firstName: 'Max',
        lastName: 'Mustermann',
        email: `max-${timestamp}@testcompany.ch`,
        phone: '+41 44 123 45 67',
        city: 'Zürich',
        zipCode: '8001',
        industry: 'IT',
        status: 'ACTIVE'  // Use enum value instead of lowercase
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(newCustomer);

      expect(response.status).toBe(201);
      expect(response.body.company).toBe(newCustomer.company);
      expect(response.body.email).toBe(newCustomer.email);
    });

    test('❌ Should fail with invalid email', async () => {
      const invalidCustomer = {
        company: 'Test Company',
        email: 'invalid-email',
        firstName: 'Test',
        lastName: 'User'
      };

      const response = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send(invalidCustomer);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('PUT /api/customers/:id', () => {
    let customerId;

    beforeAll(async () => {
      // Create a test customer
      const timestamp = Date.now();
      const createResponse = await request(app)
        .post('/api/customers')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          company: `Update Test Company ${timestamp}`,
          firstName: 'Update',
          lastName: 'Test',
          email: `update-${timestamp}@test.ch`
        });
      
      customerId = createResponse.body?.id;
    });

    test('✅ Should update customer with valid data', async () => {
      const updateData = {
        company: 'Updated Company Name',
        phone: '+41 44 999 88 77'
      };

      const response = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.company).toBe(updateData.company);
      expect(response.body.phone).toBe(updateData.phone);
    });

    test('❌ Should fail with non-existent ID', async () => {
      const response = await request(app)
        .put('/api/customers/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ company: 'Test' });

      expect(response.status).toBe(404);
    });
  });
});