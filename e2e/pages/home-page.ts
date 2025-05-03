import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Home page
 * Implements the pattern recommended in the testing guidelines
 */
export class HomePage {
  readonly page: Page;
  readonly headingAudit: Locator;
  readonly navLinks: Locator;
  readonly footer: Locator;

  constructor(page: Page) {
    this.page = page;
    this.headingAudit = page.locator('#header-left').getByText('Audit');
    this.navLinks = page.locator('nav a');
    this.footer = page.locator('footer');
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    await this.page.goto('/');
  }

  /**
   * Check that the page is loaded properly
   */
  async expectPageLoaded() {
    // Check for specific headings that we know exist
    await expect(this.headingAudit).toBeVisible();

    // Verify footer exists if your app has one
    // If not, comment this out
    // await expect(this.footer).toBeVisible();
  }

  /**
   * Click a navigation link by its text content
   */
  async clickNavLink(linkText: string) {
    // First check if the link exists
    const link = this.navLinks.filter({ hasText: linkText });

    // Check if the link exists before clicking
    const count = await link.count();
    if (count === 0) {
      throw new Error(`Navigation link with text "${linkText}" not found`);
    }

    await link.click();
  }

  /**
   * Take a screenshot for visual comparison
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./screenshots/home-${name}.png` });
  }
}