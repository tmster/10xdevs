import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

// Get auth credentials from environment variables
const E2E_USERNAME = process.env.E2E_USERNAME || 'test@example.com';
const E2E_PASSWORD = process.env.E2E_PASSWORD || 'password123';

/**
 * Page Object Model for the Login page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;
  readonly loginForm: Locator;

  constructor(page: Page) {
    this.page = page;
    // Multiple selector strategies to improve resilience
    this.loginForm = page.locator('form, form[action*="login"], [data-testid="login-form"]');
    this.emailInput = page.locator('input[type="email"], input[name="email"], [data-testid="email-input"]');
    this.passwordInput = page.locator('input[type="password"], input[name="password"], [data-testid="password-input"]');
    this.loginButton = page.locator('button[type="submit"], button:has-text("Log in"), button:has-text("Sign in"), [data-testid="login-button"]');
    this.errorMessage = page.locator('div[role="alert"], .error, .error-message, [data-testid="login-error"]');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('networkidle');

    // Wait for the URL to update
    try {
      await expect(this.page).toHaveURL(/.*\/login/, { timeout: 10000 });
    } catch (error) {
      // If we're not on /login, check if we're already logged in
      if (await this.isAlreadyLoggedIn()) {
        return;
      }
      throw error;
    }
  }

  /**
   * Check if user is already logged in by looking for common authenticated UI elements
   */
  async isAlreadyLoggedIn(): Promise<boolean> {
    // Look for elements that would typically appear when logged in
    const logoutButton = this.page.locator('button:has-text("Log out"), button:has-text("Sign out")');
    const userMenu = this.page.locator('.user-menu, [data-testid="user-menu"]');
    const dashboard = this.page.locator('h1:has-text("Dashboard"), [data-testid="dashboard"]');

    const isLoggedIn =
      await logoutButton.isVisible().catch(() => false) ||
      await userMenu.isVisible().catch(() => false) ||
      await dashboard.isVisible().catch(() => false);

    return isLoggedIn;
  }

  /**
   * Fill out the login form and submit, then wait for navigation to complete
   * If no credentials are provided, use environment variables
   */
  async login(email: string = E2E_USERNAME, password: string = E2E_PASSWORD) {
    // Check if we're already logged in
    if (await this.isAlreadyLoggedIn()) {
      return;
    }

    // Ensure login form is visible
    await expect(this.loginForm).toBeVisible({ timeout: 10000 })
      .catch(async () => {
        // Try to identify form even if not matching our selectors
        const anyForm = this.page.locator('form');
        const formCount = await anyForm.count();
        if (formCount > 0) {
          // Continue with login attempt even if we can't find our specific form
        } else {
          throw new Error('No login form found on the page');
        }
      });

    // Wait before interacting with form
    await this.page.waitForTimeout(1000);

    // Fill email with retry
    await this.fillWithRetry(this.emailInput, email);

    // Fill password with retry
    await this.fillWithRetry(this.passwordInput, password);

    // Ensure button is visible and clickable
    await expect(this.loginButton).toBeVisible({ timeout: 5000 });
    await expect(this.loginButton).toBeEnabled({ timeout: 5000 });

    // Click login and wait for navigation
    await Promise.all([
      this.loginButton.click(),
      this.page.waitForNavigation({ timeout: 30000 }).catch(() => {
        // Continue if navigation times out
      })
    ]);

    // Wait for some authenticated content to appear
    await this.page.waitForTimeout(2000);
  }

  /**
   * Fill an input field with retry mechanism
   */
  private async fillWithRetry(locator: Locator, value: string, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await locator.clear();
        await locator.fill(value);
        const actualValue = await locator.inputValue();
        if (actualValue === value) {
          return; // Success
        }
      } catch (error: unknown) {
        if (attempt === maxRetries) throw error;
      }
      await this.page.waitForTimeout(500); // Brief pause before retry
    }
  }

  /**
   * Check if an error message is displayed
   */
  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }
}