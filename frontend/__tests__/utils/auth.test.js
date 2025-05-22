import {
  setAuthToken,
  isAuthenticated,
  logout,
  initAuth,
} from "../../src/utils/auth";
import axiosInstance from "../../src/utils/axiosConfig";

// Mock dependencies
jest.mock("../../src/utils/axiosConfig", () => ({
  defaults: {
    headers: {
      common: {},
    },
  },
  get: jest.fn().mockResolvedValue({}),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn((key) => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

describe("Auth Utilities", () => {
  beforeEach(() => {
    // Clear mocks and localStorage before each test
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  describe("setAuthToken", () => {
    it("should set authorization header when token is provided", () => {
      setAuthToken("test-token");
      expect(axiosInstance.defaults.headers.common["Authorization"]).toBe(
        "Bearer test-token"
      );
    });

    it("should remove authorization header when token is not provided", () => {
      // First set a token
      axiosInstance.defaults.headers.common["Authorization"] =
        "Bearer test-token";

      // Then remove it
      setAuthToken(null);
      expect(
        axiosInstance.defaults.headers.common["Authorization"]
      ).toBeUndefined();
    });
  });

  describe("isAuthenticated", () => {
    it("should return true when token exists in localStorage", () => {
      localStorageMock.setItem("token", "test-token");
      expect(isAuthenticated()).toBe(true);
    });

    it("should return false when token does not exist in localStorage", () => {
      expect(isAuthenticated()).toBe(false);
    });
  });

  describe("logout", () => {
    it("should call the signout API and clear token", async () => {
      // Setup initial state
      localStorageMock.setItem("token", "test-token");
      axiosInstance.defaults.headers.common["Authorization"] =
        "Bearer test-token";

      await logout();

      // Verify API was called
      expect(axiosInstance.get).toHaveBeenCalledWith("/auth/signout");

      // Verify token was removed from localStorage
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");

      // Verify authorization header was removed
      expect(
        axiosInstance.defaults.headers.common["Authorization"]
      ).toBeUndefined();
    });

    it("should handle API errors gracefully", async () => {
      // Setup mock to reject
      axiosInstance.get.mockRejectedValueOnce(new Error("API Error"));

      // Setup console.error mock to avoid test output noise
      const originalConsoleError = console.error;
      console.error = jest.fn();

      await logout();

      // Verify token was still removed from localStorage despite API error
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");

      // Restore console.error
      console.error = originalConsoleError;
    });
  });

  describe("initAuth", () => {
    it("should initialize auth and return true when token exists", () => {
      localStorageMock.setItem("token", "test-token");

      const result = initAuth();

      expect(result).toBe(true);
      expect(axiosInstance.defaults.headers.common["Authorization"]).toBe(
        "Bearer test-token"
      );
    });

    it("should return false when token does not exist", () => {
      const result = initAuth();

      expect(result).toBe(false);
      expect(
        axiosInstance.defaults.headers.common["Authorization"]
      ).toBeUndefined();
    });
  });
});
