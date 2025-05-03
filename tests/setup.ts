import { expect, afterEach, beforeAll, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';
import { setupServer } from 'msw/node';
import matchers from '@testing-library/jest-dom/matchers';

// Extend Vitest's expect with Testing Library matchers
expect.extend(matchers);

// Run cleanup after each test case
afterEach(() => {
  cleanup();
});

// Create MSW server for API mocking
export const server = setupServer();

// Set up server before tests
beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));

// Reset server handlers after each test
afterEach(() => server.resetHandlers());

// Clean up server after all tests
afterAll(() => server.close());

// Mock global fetch if needed for tests
// vi.stubGlobal('fetch', vi.fn());

// Suppress console errors/warnings from cluttering test output
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  // Ignore specific React errors we expect during testing
  if (
    args[0]?.includes &&
    (args[0].includes('Warning: ReactDOM.render') ||
     args[0].includes('Warning: useLayoutEffect'))
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  // Ignore specific warnings if needed
  if (args[0]?.includes && args[0].includes('Some warning to ignore')) {
    return;
  }
  originalConsoleWarn(...args);
};