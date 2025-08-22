const request = require('supertest');
const express = require('express');
const analyticsRoutes = require('../../routes/analytics');

describe('📊 Analytics API Tests', () => {
  let app;
  let authToken;

  beforeAll(async () => {
    app = express();
    app.use(express.json());
    app.use('/api/analytics', analyticsRoutes);

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

  describe('GET /api/analytics/dashboard', () => {
    test('✅ Should return dashboard analytics data', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('kpis');
      expect(response.body).toHaveProperty('charts');
      
      // KPIs Structure
      expect(response.body.kpis).toHaveProperty('pageViews');
      expect(response.body.kpis).toHaveProperty('uniqueVisitors');
      expect(response.body.kpis).toHaveProperty('avgDuration');
      expect(response.body.kpis).toHaveProperty('mobileRatio');
      
      // Charts Structure
      expect(response.body.charts).toHaveProperty('topPages');
      expect(response.body.charts).toHaveProperty('weeklyTrend');
      expect(response.body.charts).toHaveProperty('trafficSources');
    });

    test('✅ Should support period parameter', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard?period=week')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('kpis');
    });

    test('❌ Should fail without authentication', async () => {
      const response = await request(app)
        .get('/api/analytics/dashboard');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/analytics/track', () => {
    test('✅ Should track page view', async () => {
      const trackingData = {
        path: '/test-page',
        referrer: 'https://google.com',
        userAgent: 'Mozilla/5.0 Test Browser',
        sessionId: 'test-session-123'
      };

      const response = await request(app)
        .post('/api/analytics/track')
        .send(trackingData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('success', true);
    });

    test('❌ Should fail with missing path', async () => {
      const response = await request(app)
        .post('/api/analytics/track')
        .send({ sessionId: 'test-session' }); // Include sessionId but no path

      expect(response.status).toBe(500); // Analytics expects 500 for validation errors
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/analytics/stats', () => {
    test('✅ Should return basic stats', async () => {
      const response = await request(app)
        .get('/api/analytics/stats')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('totalPageViews');
      expect(response.body).toHaveProperty('totalSessions');
      expect(typeof response.body.totalPageViews).toBe('number');
      expect(typeof response.body.totalSessions).toBe('number');
    });
  });
});