// jest-dom adds custom jest matchers for asserting on DOM nodes.
import "@testing-library/jest-dom";

// Use 'self' to reference global scope in both browser and Node.js
const mockFn = () => ({
  observe: () => {},
  unobserve: () => {},
  disconnect: () => {},
});

// Mock ResizeObserver
window.ResizeObserver = window.ResizeObserver || mockFn;

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
window.IntersectionObserver = window.IntersectionObserver || mockFn;
