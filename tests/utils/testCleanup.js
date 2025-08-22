// Test cleanup utilities
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Clean up test data created during tests
async function cleanupTestData() {
  try {
    // Delete test users (except admin)
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test@'
        }
      }
    });

    // Delete test customers
    await prisma.customer.deleteMany({
      where: {
        email: {
          contains: 'test@'
        }
      }
    });

    console.log('✅ Test data cleaned up successfully');
  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
  }
}

// Reset test sequence for each test file
async function resetTestSequence() {
  const timestamp = Date.now();
  return {
    email: `test-${timestamp}@example.com`,
    company: `Test Company ${timestamp}`,
    sessionId: `test-session-${timestamp}`
  };
}

module.exports = {
  cleanupTestData,
  resetTestSequence
};