module.exports = {
  testEnvironment: "node",
  coveragePathIgnorePatterns: ["/node_modules/"],
  moduleNameMapper: {
    // Handle module aliases (if you're using them in the project)
    "^@/(.*)$": "<rootDir>/$1",
  },
  transform: {
    // Transform JS files using babel-jest
    "^.+\\.(js|jsx)$": "babel-jest",
  },
  testMatch: ["**/__tests__/**/*.js?(x)", "**/?(*.)+(spec|test).js?(x)"],
  // Setup files after environment is initialized
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
