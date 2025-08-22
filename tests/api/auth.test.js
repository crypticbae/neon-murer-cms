const request = require('supertest');
const express = require('express');
const authRoutes = require('../../routes/auth');

describe('🔐 Auth API Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/auth', authRoutes);
  });

  describe('POST /api/auth/login', () => {
    test('✅ Should login with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@neonmurer.ch',
          password: 'NeonMurer2024!'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@neonmurer.ch');
    });

    test('❌ Should fail with invalid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@neonmurer.ch',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    test('❌ Should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('details');
    });
  });

  describe('POST /api/auth/register', () => {
    test('✅ Should register new user with valid data', async () => {
      const timestamp = Date.now();
      const newUser = {
        email: `test-${timestamp}@example.com`,
        password: 'SecurePassword123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(newUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('tokens');
      expect(response.body.tokens).toHaveProperty('accessToken');
      expect(response.body.user.email).toBe(newUser.email);
    });

    test('❌ Should fail with duplicate email', async () => {
      const duplicateUser = {
        email: 'admin@neonmurer.ch', // Already exists
        password: 'SecurePassword123!',
        name: 'Duplicate User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(duplicateUser);

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get token
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@neonmurer.ch',
          password: 'NeonMurer2024!'
        });
      
      authToken = loginResponse.body.tokens.accessToken;
    });

    test('✅ Should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe('admin@neonmurer.ch');
    });

    test('❌ Should fail without token', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });
  });
});