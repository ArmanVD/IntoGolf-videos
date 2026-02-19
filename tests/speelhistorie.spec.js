const { test, expect } = require("@playwright/test");

test.describe("Speelhistorie", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to speelhistorie page", async ({ page }) => {
    await page.getByText("Speelhistorie").click();

    await expect(page).toHaveURL(/.*#\/history/);
    await expect(page.locator("header")).toContainText("Speelhistorie");
  });

  test("should display play statistics", async ({ page }) => {
    await page.getByText("Speelhistorie").click();
    await expect(page).toHaveURL(/.*#\/history/);

    // Verify the instruction text
    await expect(page.getByText("Klik op een van de onderstaande knoppen")).toBeVisible();

    // Verify stat labels are shown
    await expect(page.getByText("Verl.")).toBeVisible();
    await expect(page.getByText("Toek.")).toBeVisible();
    await expect(page.getByText("Even.")).toBeVisible();
    await expect(page.getByText("Tot.")).toBeVisible();
    await expect(page.getByText("Ann.")).toBeVisible();
  });
});
