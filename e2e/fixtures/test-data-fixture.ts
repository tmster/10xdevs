import { test as base } from "@playwright/test";
import { TestDataManager } from "../utils/test-data";

// Define custom fixtures
interface TestDataFixtures {
  testData: TestDataManager;
}

// Extend the base test with our custom fixtures
export const test = base.extend<TestDataFixtures>({
  // Define a fixture for our test data manager
  testData: async (_, runInTest) => {
    // Create and initialize the test data manager
    const testDataManager = new TestDataManager();
    await testDataManager.init();

    // Use the fixture in the test
    await runInTest(testDataManager);

    // Clean up after the test
    await testDataManager.cleanup();
  },
});

// Export expect from the base test
export { expect } from "@playwright/test";
