# Testing Documentation

This project uses a comprehensive testing strategy with two main approaches:

1. **Unit and Integration Tests** with Vitest
2. **End-to-End Tests** with Playwright

## Table of Contents

- [Prerequisites](#prerequisites)
- [Running Tests](#running-tests)
- [Unit and Integration Testing](#unit-and-integration-testing)
  - [Structure](#unit-test-structure)
  - [Mocking](#mocking)
  - [Hooks](#testing-hooks)
  - [Coverage](#coverage)
- [End-to-End Testing](#end-to-end-testing)
  - [Structure](#e2e-structure)
  - [Page Objects](#page-objects)
  - [Visual Testing](#visual-testing)
  - [Debugging](#debugging-e2e-tests)
- [Continuous Integration](#continuous-integration)
- [Best Practices](#best-practices)

## Prerequisites

- Node.js (the version specified in `.nvmrc`)
- npm

All testing dependencies are installed as development dependencies in the project.

## Running Tests

### Unit/Integration Tests

```bash
# Run all unit and integration tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### End-to-End Tests

```bash
# Run all E2E tests
npm run e2e

# Run E2E tests with UI
npm run e2e:ui

# Generate tests using the codegen tool
npm run e2e:codegen

# View the last test report
npm run e2e:report
```

## Unit and Integration Testing

We use [Vitest](https://vitest.dev/) with [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and integration testing.

### Unit Test Structure

Unit tests are co-located with the code they test:

```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── lib/
│   ├── utils.ts
│   └── __tests__/
│       └── utils.test.ts
```

Each test file should follow this structure:

```typescript
import { describe, it, expect } from 'vitest';

describe('Component or Function Name', () => {
  describe('Specific functionality or method', () => {
    it('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

### Mocking

For API mocking, we use [MSW (Mock Service Worker)](https://mswjs.io/) which intercepts requests at the network level:

```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

const server = setupServer(
  http.get('/api/resource', () => {
    return HttpResponse.json({ data: 'mocked data' });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

For function mocking, use Vitest's built-in functions:

```typescript
import { vi } from 'vitest';

// Mock a function
const mockFn = vi.fn();

// Spy on an object method
vi.spyOn(object, 'method').mockImplementation(() => 'mocked');

// Mock a module
vi.mock('./path/to/module', () => ({
  default: vi.fn(),
  namedExport: vi.fn()
}));
```

### Testing Hooks

For testing React hooks (React 19+), use the following approach:

```typescript
import { renderHook, act } from '@testing-library/react';
import useMyHook from '../useMyHook';

it('should update state', () => {
  const { result } = renderHook(() => useMyHook());

  act(() => {
    result.current.update('new value');
  });

  expect(result.current.value).toBe('new value');
});
```

### Coverage

Code coverage reports are generated with:

```bash
npm run test:coverage
```

This creates a coverage report in `coverage/`. We aim for at least 80% coverage on critical paths.

## End-to-End Testing

We use [Playwright](https://playwright.dev/) for E2E testing, focusing on Chrome/Chromium only per project requirements.

### E2E Structure

E2E tests are located in the `e2e/` directory:

```
e2e/
├── home.spec.ts
├── auth.spec.ts
├── pages/
│   ├── home-page.ts
│   └── login-page.ts
└── fixtures/
    └── test-users.json
```

### Page Objects

We follow the Page Object Model (POM) pattern for maintainable tests:

```typescript
// e2e/pages/login-page.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.locator('button[type="submit"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }
}
```

Usage in tests:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('user can login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password');
  await expect(page).toHaveURL('/dashboard');
});
```

### Visual Testing

We use Playwright's screenshot comparison for visual testing:

```typescript
await expect(page).toHaveScreenshot('homepage.png');
```

This creates a baseline screenshot on first run and compares against it in subsequent runs.

### Debugging E2E Tests

- Use `await page.pause()` in your test to pause and inspect
- Run with UI: `npm run e2e:ui`
- Use the codegen tool: `npm run e2e:codegen`
- View traces with: `npx playwright show-trace trace.zip`

## Continuous Integration

Tests are run automatically in CI (GitHub Actions) on:
- Pull request creation
- Push to main branch

## Best Practices

1. **Test Pyramid**: Write more unit tests than integration tests, and more integration tests than E2E tests
2. **Isolation**: Each test should be independent and not rely on the state from other tests
3. **Meaningful Assertions**: Test the behavior, not the implementation
4. **Clear Test Names**: Use descriptive test names that explain the expected behavior
5. **Clean Setup/Teardown**: Always clean up resources used in tests
6. **Avoid Flaky Tests**: Tests should be deterministic and not depend on timing
7. **Use Test-Driven Development**: When appropriate, write tests before implementation

Remember to update tests when changing functionality, and maintain the test suite to keep it valuable and efficient.