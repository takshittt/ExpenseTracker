// This file will be run before each test file

// Set up environment variables for testing
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.CLIENT_URL = "http://localhost:3000";

// Increase timeout for async tests if needed
jest.setTimeout(30000);

// Mock implementations
jest.mock("./backend/models/user.model", () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  hashPassword: jest.fn().mockResolvedValue("hashedPassword"),
}));

// Global beforeAll and afterAll if needed
global.beforeAll(async () => {
  // Setup any global test requirements
});

global.afterAll(async () => {
  // Clean up after all tests are done
});
