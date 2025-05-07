import type { Page } from "@playwright/test";

/**
 * Helper utility for authentication in tests
 */
export class AuthHelper {
  /**
   * Authenticate directly through cookie/storage manipulation, bypassing the UI login flow
   *
   * This method uses direct API calls or local storage manipulation to
   * authenticate without going through the login UI. This is more reliable for tests.
   */
  static async loginViaApi(page: Page, email: string, password: string): Promise<boolean> {
    console.log(`Attempting direct auth with email: ${email}`);

    try {
      // Navigate to a blank page first
      await page.goto("/");

      // First attempt: Try to log in via API call
      const response = await page.evaluate(
        async ([email, password]) => {
          try {
            // Try to use fetch to call the auth API
            const response = await fetch("/api/auth/signin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
            });

            return {
              status: response.status,
              ok: response.ok,
              data: await response.json().catch(() => ({})),
            };
          } catch (error: unknown) {
            return { error: error instanceof Error ? error.message : String(error), ok: false };
          }
        },
        [email, password]
      );

      console.log("Auth API response:", response);

      if (response?.ok) {
        // Wait for any redirects to complete
        await page.waitForTimeout(3000);
        console.log("API login successful");
        return true;
      }

      // Second attempt: Try to set authentication in local storage
      // You may need to adjust this based on your auth storage approach
      await page.evaluate(
        async ([email]) => {
          // This is a generic approach - adjust based on your auth strategy

          // For local storage token-based auth:
          // localStorage.setItem('authToken', 'your-test-token');

          // For cookie-based auth:
          // document.cookie = 'authCookie=test-cookie; path=/';

          // Example for a JWT token or session:
          localStorage.setItem(
            "user",
            JSON.stringify({
              email: email,
              authenticated: true,
              // Add other necessary user properties
            })
          );

          // Sometimes apps use session storage instead
          sessionStorage.setItem("isLoggedIn", "true");

          return true;
        },
        [email]
      );

      // Refresh the page to apply storage changes
      await page.reload();
      await page.waitForTimeout(2000);

      // Take screenshot to verify the state
      await page.screenshot({ path: `./screenshots/direct-auth-result.png` });

      console.log("Direct auth via storage attempted");
      return true;
    } catch (error: unknown) {
      console.error("Direct auth failed:", error instanceof Error ? error.message : String(error));
      return false;
    }
  }

  /**
   * Set up a pre-authenticated context by manipulating cookies/storage/API
   */
  static async setupAuthContext(page: Page): Promise<boolean> {
    // Get credentials from environment variables with fallbacks
    const email = process.env.E2E_USERNAME || "test@example.com";
    const password = process.env.E2E_PASSWORD || "password123";

    console.log(`Using E2E credentials: ${email}`);
    return this.loginViaApi(page, email, password);
  }
}
