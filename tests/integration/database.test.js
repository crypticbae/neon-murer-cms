const { PrismaClient } = require('@prisma/client');

describe('🗄️ Database Integration Tests', () => {
  let prisma;

  beforeAll(async () => {
    prisma = new PrismaClient();
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Model', () => {
    test('✅ Should create and retrieve user', async () => {
      const userData = {
        email: 'integration-test@example.com',
        password: 'hashedpassword123',
        name: 'Integration Test User'
      };

      // Create user
      const createdUser = await prisma.user.create({
        data: userData
      });

      expect(createdUser.id).toBeDefined();
      expect(createdUser.email).toBe(userData.email);
      expect(createdUser.name).toBe(userData.name);

      // Retrieve user
      const retrievedUser = await prisma.user.findUnique({
        where: { id: createdUser.id }
      });

      expect(retrievedUser).toBeTruthy();
      expect(retrievedUser.email).toBe(userData.email);

      // Cleanup
      await prisma.user.delete({
        where: { id: createdUser.id }
      });
    });

    test('✅ Should enforce unique email constraint', async () => {
      const userData1 = {
        email: 'unique-test@example.com',
        password: 'password1',
        name: 'User 1'
      };

      const userData2 = {
        email: 'unique-test@example.com', // Same email
        password: 'password2',
        name: 'User 2'
      };

      // Create first user
      const user1 = await prisma.user.create({ data: userData1 });

      // Try to create second user with same email
      await expect(
        prisma.user.create({ data: userData2 })
      ).rejects.toThrow();

      // Cleanup
      await prisma.user.delete({ where: { id: user1.id } });
    });
  });

  describe('Customer Model', () => {
    test('✅ Should create customer with contacts', async () => {
      const customerData = {
        company: 'Integration Test AG',
        firstName: 'Integration',
        lastName: 'Test',
        email: 'integration@test.ch',
        phone: '+41 44 123 45 67',
        contacts: {
          create: [
            {
              firstName: 'Contact',
              lastName: 'Person',
              email: 'contact@test.ch',
              title: 'Manager',
              isPrimary: true
            }
          ]
        }
      };

      const customer = await prisma.customer.create({
        data: customerData,
        include: { contacts: true }
      });

      expect(customer.id).toBeDefined();
      expect(customer.company).toBe(customerData.company);
      expect(customer.contacts).toHaveLength(1);
      expect(customer.contacts[0].isPrimary).toBe(true);

      // Cleanup
      await prisma.customer.delete({
        where: { id: customer.id }
      });
    });
  });

  describe('Page Model', () => {
    let testUserId;

    beforeAll(async () => {
      // Create test user for pages
      const testUser = await prisma.user.create({
        data: {
          email: 'page-test@example.com',
          password: 'hashedpassword',
          name: 'Page Test User'
        }
      });
      testUserId = testUser.id;
    });

    afterAll(async () => {
      // Cleanup test user
      await prisma.user.delete({
        where: { id: testUserId }
      });
    });

    test('✅ Should create and update page', async () => {
      const pageData = {
        title: 'Integration Test Page',
        slug: 'integration-test-page',
        content: '<h1>Test Content</h1>',
        isPublished: false,
        userId: testUserId
      };

      // Create page
      const page = await prisma.page.create({
        data: pageData,
        include: { creator: true }
      });

      expect(page.title).toBe(pageData.title);
      expect(page.slug).toBe(pageData.slug);
      expect(page.creator.id).toBe(testUserId);

      // Update page
      const updatedPage = await prisma.page.update({
        where: { id: page.id },
        data: { isPublished: true }
      });

      expect(updatedPage.isPublished).toBe(true);

      // Cleanup
      await prisma.page.delete({
        where: { id: page.id }
      });
    });
  });

  describe('Analytics Models', () => {
    test('✅ Should create analytics session and page view', async () => {
      // Create analytics session
      const sessionData = {
        sessionId: 'test-session-integration',
        ipHash: '192.168.1.1',
        userAgent: 'Test Browser',
        referrer: 'https://test.com'
      };

      const session = await prisma.analyticsSession.create({
        data: sessionData
      });

      expect(session.sessionId).toBe(sessionData.sessionId);

      // Create page view
      const pageViewData = {
        path: '/integration-test',
        title: 'Integration Test Page',
        sessionId: session.sessionId
      };

      const pageView = await prisma.pageView.create({
        data: pageViewData
      });

      expect(pageView.path).toBe(pageViewData.path);

      // Cleanup
      await prisma.pageView.delete({ where: { id: pageView.id } });
      await prisma.analyticsSession.delete({ where: { id: session.id } });
    });
  });

  describe('Settings Model', () => {
    test('✅ Should create and retrieve settings', async () => {
      const settingData = {
        category: 'test',
        key: 'integration-test-setting',
        value: { testValue: 'integration test' },
        description: 'Integration test setting'
      };

      const setting = await prisma.setting.create({
        data: settingData
      });

      expect(setting.category).toBe(settingData.category);
      expect(setting.key).toBe(settingData.key);
      expect(setting.value).toEqual(settingData.value);

      // Retrieve setting
      const retrievedSetting = await prisma.setting.findUnique({
        where: {
          category_key: {
            category: settingData.category,
            key: settingData.key
          }
        }
      });

      expect(retrievedSetting).toBeTruthy();
      expect(retrievedSetting.value).toEqual(settingData.value);

      // Cleanup
      await prisma.setting.delete({
        where: { id: setting.id }
      });
    });
  });
});