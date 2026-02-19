const { test, expect } = require("@playwright/test");

test.describe("Berichten", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to berichten page", async ({ page }) => {
    await page.getByText("Berichten").click();

    await expect(page).toHaveURL(/.*#\/messages/);
    await expect(page.locator("header")).toContainText("Berichten");
  });

  test("should display empty state when no messages", async ({ page }) => {
    await page.getByText("Berichten").click();
    await expect(page).toHaveURL(/.*#\/messages/);

    // Verify the empty state (wait for content to load)
    await expect(page.getByText("Geen berichten", { exact: true })).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("er zijn momenteel geen berichten gevonden")).toBeVisible();
  });
});
