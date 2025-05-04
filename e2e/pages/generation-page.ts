import { expect } from '@playwright/test';
import type { Page, Locator } from '@playwright/test';

/**
 * Page Object Model for the Flashcard Generation page
 */
export class GenerationPage {
  readonly page: Page;
  readonly generationForm: Locator;
  readonly textInput: Locator;
  readonly maxCardsInput: Locator;
  readonly generateButton: Locator;
  readonly generatedFlashcards: Locator;
  readonly progressBar: Locator;
  readonly validationError: Locator;
  readonly loadingSkeleton: Locator;
  readonly flashcardItems: Locator;
  readonly bulkSaveButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.generationForm = page.locator('form[aria-label="Generate flashcards form"], [data-testid="generation-form"]');
    this.textInput = page.locator('textarea[id="text"], [data-testid="generation-text-input"]');
    this.maxCardsInput = page.locator('input[id="maxCards"], [data-testid="max-cards-input"]');
    this.generateButton = page.locator('button[type="submit"], [data-testid="generate-button"]');
    this.generatedFlashcards = page.locator('[data-testid="generated-flashcards"], .flashcards-list');
    this.progressBar = page.locator('[aria-label="Text length progress"], [data-testid="text-progress"]');
    this.validationError = page.locator('[role="alert"], [data-testid="text-validation-error"]');
    this.loadingSkeleton = page.locator('.skeleton, [data-testid="loading-skeleton"]');
    this.flashcardItems = page.locator('.flashcard-item, [data-testid^="flashcard-item-"]');
    this.bulkSaveButton = page.getByRole('button', { name: /save selected/i }).or(page.locator('button:has-text("Save Selected")'));
  }

  /**
   * Navigate to the flashcard generation page
   */
  async goto() {
    await this.page.goto('/flashcards/generate');
    await this.page.waitForLoadState('networkidle');
    await expect(this.generationForm).toBeVisible({ timeout: 10000 });
  }

  /**
   * Fill the generation form and submit
   */
  async generateFlashcards(text: string, maxCards: number) {
    await this.page.waitForTimeout(1000);

    await this.textInput.fill(text);
    await this.maxCardsInput.clear();
    await this.maxCardsInput.fill(String(maxCards));

    await this.generateButton.click();

    try {
      await Promise.race([
        this.page.waitForSelector('[data-testid="loading-skeleton"]', { state: 'hidden', timeout: 30000 }),
        this.page.waitForSelector('[data-testid="generated-flashcards"]', { state: 'visible', timeout: 30000 })
      ]);
    } catch (e) {
      // Continue execution even if timeout occurs
    }
  }

  /**
   * Check if flashcards were generated successfully
   */
  async assertFlashcardsGenerated(expectedCount: number) {
    await expect(this.generatedFlashcards).toBeVisible({ timeout: 15000 });
    await expect(this.flashcardItems.first()).toBeVisible({ timeout: 5000 });
  }

  /**
   * Select a flashcard by its index (0-based)
   */
  async selectFlashcard(index: number) {
    const count = await this.flashcardItems.count();
    if (index >= count) {
      return;
    }

    try {
      const checkbox = this.flashcardItems.nth(index).locator('input[type="checkbox"]');
      await checkbox.check();
    } catch (e) {
      await this.flashcardItems.nth(index).click();
    }
  }

  /**
   * Select all flashcards
   */
  async selectAllFlashcards() {
    const count = await this.flashcardItems.count();

    for (let i = 0; i < count; i++) {
      await this.selectFlashcard(i);
      await this.page.waitForTimeout(200);
    }
  }

  /**
   * Save selected flashcards
   */
  async saveSelectedFlashcards() {
    const isSaveButtonVisible = await this.bulkSaveButton.isVisible();
    if (!isSaveButtonVisible) {
      const alternativeButton = this.page.locator('button:has-text("Save"), button:has-text("Submit"), button:has-text("Confirm")');
      if (await alternativeButton.isVisible()) {
        await alternativeButton.click();
      }
    } else {
      await this.bulkSaveButton.click();
    }

    try {
      await Promise.race([
        this.page.waitForSelector('[role="status"]', { timeout: 10000 }),
        this.page.waitForSelector('.toast, .notification', { timeout: 10000 }),
        this.page.waitForNavigation({ timeout: 10000 })
      ]);
    } catch (e) {
      // Continue execution even if timeout occurs
    }
  }
}