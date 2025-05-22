const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const UserModel = require("../../models/user.model");

// Mock external dependencies
jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("User Model", () => {
  // Setup before tests
  beforeAll(async () => {
    process.env.JWT_SECRET = "test-secret";
  });

  // Cleanup after tests
  afterAll(async () => {
    jest.clearAllMocks();
  });

  it("should create a user with valid data", () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    };

    const user = new UserModel(userData);

    expect(user).toHaveProperty("_id");
    expect(user.name).toBe(userData.name);
    expect(user.email).toBe(userData.email);
    expect(user.password).toBe(userData.password);
    expect(user.currency).toBe("INR"); // Default currency
    expect(user.isVerified).toBe(false); // Default verification status
  });

  it("should validate email format", () => {
    const userData = {
      name: "Test User",
      email: "invalid-email",
      password: "password123",
    };

    const user = new UserModel(userData);
    const validationError = user.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError.errors.email).toBeDefined();
  });

  it("should require a password if googleId is not present", () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      // No password or googleId
    };

    const user = new UserModel(userData);
    const validationError = user.validateSync();

    expect(validationError).toBeDefined();
    expect(validationError.errors.password).toBeDefined();
  });

  it("should not require a password if googleId is present", () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      googleId: "google123",
      // No password
    };

    const user = new UserModel(userData);
    const validationError = user.validateSync();

    expect(validationError).toBeUndefined(); // No validation error expected
  });

  it("should generate auth token", () => {
    const user = new UserModel({
      name: "Test User",
      email: "test@example.com",
      password: "password123",
    });

    // Mock the jwt.sign method
    jwt.sign.mockReturnValue("mock-token");

    const token = user.generateAuthToken();

    expect(jwt.sign).toHaveBeenCalledWith(
      { _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "15d" }
    );
    expect(token).toBe("mock-token");
  });

  it("should compare password correctly", async () => {
    const user = new UserModel({
      name: "Test User",
      email: "test@example.com",
      password: "hashed_password",
    });

    // Mock the bcrypt.compare method
    bcrypt.compare.mockResolvedValueOnce(true);
    bcrypt.compare.mockResolvedValueOnce(false);

    // Test with correct password
    const isCorrectPassword = await user.comparePassword("correct_password");
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "correct_password",
      user.password
    );
    expect(isCorrectPassword).toBe(true);

    // Test with incorrect password
    const isIncorrectPassword = await user.comparePassword("wrong_password");
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "wrong_password",
      user.password
    );
    expect(isIncorrectPassword).toBe(false);
  });

  it("should hash password", async () => {
    // Mock the bcrypt.hash method
    bcrypt.hash.mockResolvedValueOnce("hashed_password");

    const hashedPassword = await UserModel.hashPassword("original_password");

    expect(bcrypt.hash).toHaveBeenCalledWith("original_password", 10);
    expect(hashedPassword).toBe("hashed_password");
  });
});
