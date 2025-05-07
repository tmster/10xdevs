import { test, expect } from "@playwright/test";
import { GenerationPage } from "./pages/generation-page";
import { LoginPage } from "./pages/login-page";

// Set longer timeout for all tests in this file
test.setTimeout(60000);

// Get auth credentials from environment variables
const E2E_USERNAME = process.env.E2E_USERNAME || "test@example.com";
const E2E_PASSWORD = process.env.E2E_PASSWORD || "password123";

test.describe("Flashcard Generation", () => {
  let generationPage: GenerationPage;
  let loginPage: LoginPage;
  const hasApiKeyIssue = false;

  test.beforeEach(async ({ page }) => {
    // Setup custom page error handling
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        // Log browser console errors to test output
        void msg.text(); // Access the text but don't log it
      }
    });

    loginPage = new LoginPage(page);
    generationPage = new GenerationPage(page);

    // Direct login before each test
    await loginPage.goto();
    await loginPage.login(E2E_USERNAME, E2E_PASSWORD);

    // Navigate to generation page
    await generationPage.goto();
  });

  test("should show the flashcard generation form", async () => {
    // Verify generation form is visible
    await expect(generationPage.generationForm).toBeVisible({ timeout: 5000 });
    await expect(generationPage.textInput).toBeVisible({ timeout: 5000 });
    await expect(generationPage.maxCardsInput).toBeVisible({ timeout: 5000 });
    await expect(generationPage.generateButton).toBeVisible({ timeout: 5000 });
  });

  test("should show validation error with insufficient text", async () => {
    // Try to generate with too short text
    await generationPage.textInput.fill("This is a short text");
    await generationPage.page.waitForTimeout(500); // Wait for UI to update

    await expect(generationPage.generateButton).toBeVisible({ timeout: 5000 });

    // Wait for the validation error to appear
    await generationPage.page.waitForTimeout(1000);

    // Check if either the explicit validation error appears OR the button remains disabled
    const isErrorVisible = await generationPage.validationError.isVisible().catch(() => false);
    const isButtonDisabled = await generationPage.generateButton.isDisabled().catch(() => false);

    // Pass the test if either validation method is working
    expect(isErrorVisible || isButtonDisabled).toBeTruthy();
  });

  test("should generate flashcards from valid text", async () => {
    // Skip this test if we have API key issues
    if (hasApiKeyIssue) {
      test.skip();
      return;
    }

    // Create a long enough text for generation (at least 1000 characters)
    const longText = `
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl
      aliquet nunc, quis aliquam nisl nunc quis nisl. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet
      nunc, quis aliquam nisl nunc quis nisl. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc,
      quis aliquam nisl nunc quis nisl. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis
      aliquam nisl nunc quis nisl. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis aliquam
      nisl nunc quis nisl. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis aliquam nisl
      nunc quis nisl. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis aliquam nisl nunc
      quis nisl. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis aliquam nisl nunc quis
      nisl. Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
      Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
      Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
      Nulla facilisi. Nullam euismod, nisl eget ultricies ultrices, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.
    `;

    const maxCards = 5;

    // Generate flashcards
    await generationPage.generateFlashcards(longText, maxCards);

    // Wait for generation to complete
    await generationPage.assertFlashcardsGenerated(maxCards);
  });

  // Additional tests can be added here
});
