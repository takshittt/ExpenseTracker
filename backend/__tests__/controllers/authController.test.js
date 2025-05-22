const authController = require("../../controllers/authController");
const userModel = require("../../models/user.model");
const userService = require("../../services/userService");
const blacklistTokenModel = require("../../models/blacklistToken.model");
const { validationResult } = require("express-validator");

// Mock dependencies
jest.mock("../../models/user.model");
jest.mock("../../services/userService");
jest.mock("../../models/blacklistToken.model");
jest.mock("express-validator");

describe("Auth Controller", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mock implementations
    validationResult.mockReturnValue({
      isEmpty: jest.fn().mockReturnValue(true),
      array: jest.fn().mockReturnValue([]),
    });
  });

  describe("registerUser", () => {
    it("should register a new user successfully", async () => {
      // Mock request and response
      const req = {
        body: {
          name: "Test User",
          email: "test@example.com",
          password: "password123",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };

      // Mock user model and service
      userModel.findOne.mockResolvedValue(null); // User doesn't exist yet
      userModel.hashPassword.mockResolvedValue("hashedPassword");

      const mockUser = {
        generateAuthToken: jest.fn().mockReturnValue("test-token"),
      };
      userService.createUser.mockResolvedValue(mockUser);

      // Call the controller method
      await authController.registerUser(req, res);

      // Verify the results
      expect(userModel.findOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(userModel.hashPassword).toHaveBeenCalledWith("password123");
      expect(userService.createUser).toHaveBeenCalledWith({
        name: "Test User",
        email: "test@example.com",
        password: "hashedPassword",
      });
      expect(mockUser.generateAuthToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith("token", "test-token");
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: "test-token",
        user: mockUser,
      });
    });

    it("should return 400 if validation fails", async () => {
      // Mock validation failure
      validationResult.mockReturnValue({
        isEmpty: jest.fn().mockReturnValue(false),
        array: jest.fn().mockReturnValue([{ msg: "Email is required" }]),
      });

      const req = { body: {} };
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: [{ msg: "Email is required" }],
      });
    });

    it("should return 400 if user already exists", async () => {
      const req = {
        body: {
          name: "Test User",
          email: "existing@example.com",
          password: "password123",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      // Mock that user already exists
      userModel.findOne.mockResolvedValue({ email: "existing@example.com" });

      await authController.registerUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "User already registered",
      });
    });
  });

  describe("signinUser", () => {
    it("should sign in a user successfully", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "password123",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        cookie: jest.fn(),
      };

      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(true),
        generateAuthToken: jest.fn().mockReturnValue("test-token"),
      };

      userModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await authController.signinUser(req, res);

      expect(userModel.findOne).toHaveBeenCalledWith({
        email: "test@example.com",
      });
      expect(mockUser.comparePassword).toHaveBeenCalledWith("password123");
      expect(mockUser.generateAuthToken).toHaveBeenCalled();
      expect(res.cookie).toHaveBeenCalledWith("token", "test-token");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: "test-token",
        user: mockUser,
      });
    });

    it("should return 404 if user not found", async () => {
      const req = {
        body: {
          email: "nonexistent@example.com",
          password: "password123",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      userModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(null),
      });

      await authController.signinUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: "User not found" });
    });

    it("should return 401 if password is invalid", async () => {
      const req = {
        body: {
          email: "test@example.com",
          password: "wrongpassword",
        },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };

      const mockUser = {
        comparePassword: jest.fn().mockResolvedValue(false),
      };

      userModel.findOne.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockUser),
      });

      await authController.signinUser(req, res);

      expect(mockUser.comparePassword).toHaveBeenCalledWith("wrongpassword");
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: "Invalid password" });
    });
  });

  describe("SignoutUser", () => {
    it("should sign out a user successfully", async () => {
      const req = {
        cookies: { token: "test-token" },
        headers: { authorization: "Bearer test-token" },
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        clearCookie: jest.fn(),
      };

      blacklistTokenModel.create.mockResolvedValue({ token: "test-token" });

      await authController.SignoutUser(req, res);

      expect(res.clearCookie).toHaveBeenCalledWith("token");
      expect(blacklistTokenModel.create).toHaveBeenCalledWith({
        token: "test-token",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "User logged out successfully",
      });
    });
  });
});
