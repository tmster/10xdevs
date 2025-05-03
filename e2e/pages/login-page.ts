import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Login page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Update these selectors based on your actual login form
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.loginButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('div[role="alert"]'); // common pattern for error messages
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/login');
    await expect(this.page).toHaveURL(/.*\/login/);
  }

  /**
   * Fill out the login form and submit
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  /**
   * Check if an error message is displayed
   */
  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * Take a screenshot of the login page
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./screenshots/login-${name}.png` });
  }
}