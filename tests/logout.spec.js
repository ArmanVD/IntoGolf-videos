const { test, expect } = require("@playwright/test");

test.describe("Logout", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should log out and redirect to login page", async ({ page }) => {
    // Navigate to profile page via the menu
    await page.getByText("Profiel").click();
    await expect(page).toHaveURL(/.*#\/profile/);

    // Click the Uitloggen button
    await page.getByRole("button", { name: "Uitloggen" }).click();

    // Verify redirect to login page
    await expect(page).toHaveURL(/.*#\/login/);
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });
});
