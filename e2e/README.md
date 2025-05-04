# E2E Testing Documentation

This directory contains end-to-end tests using Playwright to verify the functionality of our application.

## Table of Contents

- [Setup](#setup)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Test Environment Variables](#test-environment-variables)
- [Debugging Tests](#debugging-tests)
- [Best Practices](#best-practices)
- [Authentication in Tests](#authentication-in-tests)

## Setup

Before running the tests, make sure you have all dependencies installed:

```bash
npm install
```

## Running Tests

### Run all tests

```bash
npm run e2e
```

### Run tests with authentication

```bash
npm run e2e:auth
```

### Run only flashcard tests

```bash
npm run e2e:flashcards
```

### Run tests with UI mode for debugging

```bash
npm run e2e:ui
```

### Run specific test files

```bash
# Run a specific test file
npx playwright test e2e/flashcard-generation.spec.ts

# Run tests with API mocking
npx playwright test e2e/flashcard-generation-mock.spec.ts

# Run tests with custom credentials
E2E_USERNAME=your-test-user@example.com E2E_PASSWORD=your-password npx playwright test
```

## Test Structure

The e2e test directory follows this structure:

```
e2e/
├── pages/             # Page Object Models
│   ├── login-page.ts
│   ├── home-page.ts
│   └── generation-page.ts
├── fixtures/          # Test fixtures and data
├── utils/             # Utility functions
├── *.spec.ts          # Test files
└── README.md          # This documentation
```

We follow the Page Object Model (POM) pattern to maintain clean separation between test logic and page interactions.

## Test Environment Variables

Set the following environment variables in a `.env.test` file to run the tests:

```
E2E_USERNAME=your_test_user@example.com
E2E_PASSWORD=your_test_password
```

For CI/CD, these variables should be set as secrets in your CI environment. You can also use the npm scripts that have default values:

```bash
# Uses default test credentials
npm run e2e:auth
```

To set custom credentials for a single run:

```bash
E2E_USERNAME=custom@example.com E2E_PASSWORD=custom123 npx playwright test
```

## Testing AI Flashcard Generation

The tests for AI flashcard generation include:

1. **Standard Tests (`flashcard-generation.spec.ts`)**
   - Tests the complete flow from text input to flashcard generation
   - Requires a real environment with API access
   - May take longer to run due to AI processing time

2. **Mocked Tests (`flashcard-generation-mock.spec.ts`)**
   - Uses API mocking to simulate the flashcard generation service
   - Runs faster and is more reliable for CI/CD environments
   - Focuses on testing the UI components and user interactions

For local development, you can run the mocked tests to verify UI functionality without consuming API quotas.

## Debugging Tests

### Viewing Test Artifacts

After running tests, you can find the following artifacts:

- Screenshots: `./screenshots/`
- Traces: `./test-results/`
- HTML Report: `./playwright-report/`

To open the HTML report:

```bash
npx playwright show-report
```

### Using the Inspector

To debug tests visually:

```bash
npx playwright test --debug
```

## Best Practices

1. **Use Page Object Model**
   - Keep element selectors in page objects
   - Abstract complex interactions into page methods

2. **Data-Test Attributes**
   - Use `data-testid` attributes for element selection
   - Avoid selectors dependent on visual properties

3. **Test Independence**
   - Each test should be independent and not rely on other tests
   - Use `beforeEach` for setup and `afterEach` for cleanup

4. **Visual Verification**
   - Use screenshots for visual comparison
   - Compare critical UI states

5. **API Mocking**
   - Use API mocking for faster, more reliable tests
   - Test edge cases like errors and loading states

6. **Parallel Execution**
   - Design tests to run in parallel when possible

## Authentication in Tests

For E2E tests that require authentication (like flashcard generation), we've implemented a shared auth fixture that can be used across all tests. This fixture handles login automatically before each test.

### Using the Auth Fixture

1. Import the test and expect objects from the auth fixture:
```typescript
import { test, expect } from './utils/auth-fixture';
```

2. Use the `authenticatedPage` parameter in your tests:
```typescript
test('my authenticated test', async ({ authenticatedPage: page }) => {
  // page is already authenticated
  await page.goto('/protected-route');
  // ... rest of your test
});
```

3. The fixture will:
   - Try to use stored authentication state from previous test runs
   - Fall back to API-based auth if stored state doesn't work
   - Resort to UI login as a last resort
   - Store successful auth state for future tests

### Authentication Environment Variables

The auth fixture uses these environment variables:
- `E2E_USERNAME`: The email for the test user
- `E2E_PASSWORD`: The password for the test user

Set these in your `.env.test` file or as environment variables.