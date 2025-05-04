# E2E Testing with Playwright

This project uses Playwright for end-to-end testing with proper test data teardown to ensure tests don't pollute the database.

## Setup

1. Copy `.env.test.example` to `.env.test` and fill in the required values:
   ```
   cp .env.test.example .env.test
   ```

2. Edit `.env.test` with your Supabase test credentials and test user information.

## Key Concepts

### Authentication in Tests

Tests authenticate with Supabase using a dedicated test user account. This approach:
- Avoids using the Supabase service role key which would bypass Row-Level Security
- Ensures tests have the same permission constraints as real users
- Allows for proper cleanup of test data

### Test Data Management

Tests use a two-tiered approach to cleanup:

1. **Per-test cleanup**: The `TestDataManager` fixture tracks and cleans up data created during individual tests
2. **Global teardown**: After all tests complete, the global teardown process performs a final cleanup

### Running Tests

Run the tests with:

```bash
npm run test:e2e
```

### Writing Tests with Teardown

Example of a test with proper teardown:

```typescript
import { test, expect } from './fixtures/test-data-fixture';
import type { Todo, CreateTodo } from './utils/types';

test('should create and verify data', async ({ page, testData }) => {
  // Create test data that will be cleaned up automatically
  const todoData: CreateTodo = {
    title: 'Test Todo',
    description: 'Test description',
    status: 'pending',
    created_by: process.env.E2E_USER_ID || ''
  };

  const todo = await testData.insert<Todo>('todos', todoData);

  // Test logic here...

  // Data will be automatically cleaned up
});
```

### Page Object Model

Tests use the Page Object Model pattern. Page objects are in `e2e/pages/` and should:
- Encapsulate page elements and actions
- Use data-testid attributes for selectors
- Follow the AAA pattern (Arrange, Act, Assert)

## Best Practices

1. **Isolation**: Each test should create its own data and not depend on data from other tests
2. **Clean Up**: Always use the TestDataManager to track created data for cleanup
3. **Authentication**: Tests should authenticate with a real test user account
4. **Idempotent**: Tests should be able to run multiple times without issues
5. **Selectors**: Use data-testid attributes for reliable selectors