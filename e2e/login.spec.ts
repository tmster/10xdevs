import { test } from "@playwright/test";
import { LoginPage } from "./pages/login-page";

test.describe("Login Page", () => {
  test("should load login page correctly", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  // Note: This test will fail unless you have a test user set up
  // You'll need to adapt it to your actual auth system
  test("should show error with invalid credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Try to login with invalid credentials
    await loginPage.login("invalid@example.com", "wrongpassword");

    // Expect to see an error message
    // Comment this out if your selectors don't match
    await loginPage.expectErrorMessage();
  });
});
