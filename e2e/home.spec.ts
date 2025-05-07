import { test, expect } from "@playwright/test";

test.describe("Login Page", () => {
  test("should load login page correctly", async ({ page }) => {
    // Navigate to home page (which redirects to login)
    await page.goto("/");

    // Verify we're on the login page
    await expect(page).toHaveURL(/.*\/login/);
  });
});
