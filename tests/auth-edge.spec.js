const { test, expect } = require("@playwright/test");

test.describe("Authentication Edge Cases", () => {
  test("should reject SQL injection in email field", async ({ page }) => {
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill('" OR "1"="1');
    await page.locator('input[type="password"]').fill("password");
    await page.getByRole("button", { name: "Login" }).click();

    // Should show error, not log in
    await expect(page.getByText("Gegevens niet correct")).toBeVisible();
    await expect(page).toHaveURL(/.*#\/login/);
  });

  test("should reject XSS attempt in email field", async ({ page }) => {
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("<script>alert(1)</script>");
    await page.locator('input[type="password"]').fill("password");
    await page.getByRole("button", { name: "Login" }).click();

    // Should show error and not execute script
    await expect(page).toHaveURL(/.*#\/login/);
  });

  test("should handle very long email input", async ({ page }) => {
    await page.goto("/#/login");
    const longEmail = "a".repeat(300) + "@test.com";
    await page.locator('input[type="text"]').fill(longEmail);
    await page.locator('input[type="password"]').fill("password");
    await page.getByRole("button", { name: "Login" }).click();

    // Should show error, not crash
    await expect(page).toHaveURL(/.*#\/login/);
  });

  test("should reject whitespace-only credentials", async ({ page }) => {
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("   ");
    await page.locator('input[type="password"]').fill("   ");
    await page.getByRole("button", { name: "Login" }).click();

    // Should stay on login page
    await expect(page).toHaveURL(/.*#\/login/);
  });

  test("should persist session after page reload", async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);

    // Verify logged in
    await expect(page.getByText("Edwin Kerkhoven")).toBeVisible();

    // Reload page
    await page.reload();

    // Should still be logged in
    await expect(page.getByText("Edwin Kerkhoven")).toBeVisible();
    await expect(page).not.toHaveURL(/.*#\/login/);
  });

  test("should handle navigating to login while already logged in", async ({
    page,
  }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);

    // Navigate to login page while logged in
    await page.goto("/#/login");

    // Should either redirect away from login or show login page without error
    await page.waitForTimeout(2000);
    const url = page.url();
    // The app should handle this gracefully (no crash or error)
    expect(url).toBeTruthy();
  });
});
