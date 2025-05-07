import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { LoginPage } from "../pages/login-page";
import { AuthHelper } from "./auth-helper";
import fs from "fs";

// Get auth credentials from environment variables
const E2E_USERNAME = process.env.E2E_USERNAME || "test@example.com";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "password123";

// Define the auth state file path
const AUTH_STATE_FILE = "./auth-state.json";

// Create a default empty auth state if the file doesn't exist
if (!fs.existsSync(AUTH_STATE_FILE)) {
  console.log("Creating default empty auth state file");
  fs.writeFileSync(
    AUTH_STATE_FILE,
    JSON.stringify({
      cookies: [],
      origins: [],
    })
  );
}

// Define the type for our custom fixtures
interface AuthFixtures {
  authenticatedPage: Page;
}

// Create a fixture that ensures authentication before tests
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    console.log("Setting up authenticated page");

    // Try to use stored authentication state first
    try {
      await page.goto("/");
      const loginPage = new LoginPage(page);
      const isAlreadyLoggedIn = await loginPage.isAlreadyLoggedIn();

      if (!isAlreadyLoggedIn) {
        console.log("Not logged in via storage state, attempting login");

        // Try API-based auth first (most reliable)
        const apiAuthSuccess = await AuthHelper.loginViaApi(page, E2E_USERNAME, E2E_PASSWORD);

        if (!apiAuthSuccess) {
          // Fall back to UI login
          console.log("API auth failed, trying UI login");
          await loginPage.goto();
          await loginPage.login(E2E_USERNAME, E2E_PASSWORD);
        }

        // Store authentication state for future tests
        await page.context().storageState({ path: AUTH_STATE_FILE });
      } else {
        console.log("Already authenticated via storage state");
      }

      // Take a screenshot of authenticated state
      await page.screenshot({ path: `./screenshots/authenticated-state-${Date.now()}.png` });
    } catch (error) {
      console.error("Authentication failed:", error instanceof Error ? error.message : String(error));
      throw error;
    }

    // Pass the authenticated page to the test
    await use(page);
  },
});

// Export the expect utility
export { expect };
