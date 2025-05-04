import { test, expect } from '@playwright/test';

test.describe('Environment Variables Test', () => {
  test('should load environment variables from .env.test', async () => {
    // Check if the TEST_VARIABLE environment variable is loaded
    expect(process.env.TEST_VARIABLE).toBe('working');
  });
});