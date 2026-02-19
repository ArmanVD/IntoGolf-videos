const { test, expect } = require("@playwright/test");

test.describe("Baanstatus", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to baanstatus page", async ({ page }) => {
    await page.getByText("Baanstatus").first().click();

    await expect(page).toHaveURL(/.*#\/Baanstatus/);
    await expect(page.locator("header")).toContainText("Baanstatus");
  });

  test("should display course status for Lus a and Lus b", async ({ page }) => {
    await page.getByText("Baanstatus").first().click();
    await expect(page).toHaveURL(/.*#\/Baanstatus/);

    // Verify Lus a section
    await expect(page.getByText("Lus a")).toBeVisible();
    await expect(page.getByText("Baan open").first()).toBeVisible();
    await expect(page.getByText("Qualifying").first()).toBeVisible();
    await expect(page.getByText("Buggies").first()).toBeVisible();
    await expect(page.getByText("Trolleys").first()).toBeVisible();

    // Verify Lus b section
    await expect(page.getByText("Lus b")).toBeVisible();
  });
});
