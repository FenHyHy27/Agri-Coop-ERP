import '@testing-library/jest-dom';

// Mock window.matchMedia for Ant Design responsive components in jsdom environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // Deprecated method for backward compatibility
    removeListener: () => {}, // Deprecated method for backward compatibility
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
