// Test Setup für Jest
const { PrismaClient } = require('@prisma/client');

// Test-Datenbank Setup
let prisma;

beforeAll(async () => {
  // Verwende Umgebungsvariable für Test-DB oder verwende Test-DB-URL
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL;
  
  prisma = new PrismaClient();
  
  // Verbinde zur Datenbank
  await prisma.$connect();
});

afterAll(async () => {
  // Cleanup nach Tests
  if (prisma) {
    await prisma.$disconnect();
  }
});

// Globale Test-Utilities
global.prisma = prisma;
global.testTimeout = 10000;

// Mock für Console-Logs in Tests
const originalConsole = console.log;
console.log = jest.fn();

afterEach(() => {
  jest.clearAllMocks();
});