const { test, expect } = require("@playwright/test");

test.describe("Meerronden", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to meerronden page", async ({ page }) => {
    await page.getByText("Meerronden").click();

    await expect(page).toHaveURL(/.*#\/Meerronden/);
    await expect(page.locator("header")).toContainText("Meerronden");
  });

  test("should display meerronden list and open detail", async ({ page }) => {
    await page.getByText("Meerronden").click();
    await expect(page).toHaveURL(/.*#\/Meerronden/);

    // Verify a meerronde is listed
    await expect(page.getByText("Herenmiddag (voorbeeld)")).toBeVisible();

    // Click on the meerronde to see detail
    await page.getByText("Herenmiddag (voorbeeld)").click();

    // Verify the detail view with leaderboard
    await expect(page.locator("h5", { hasText: "Herenmiddag (voorbeeld)" })).toBeVisible();
    await expect(page.getByText("Pos")).toBeVisible();
    await expect(page.getByText("Deelnemer")).toBeVisible();
    await expect(page.getByText("Punten")).toBeVisible();

    // Verify Birdie klassement section
    await expect(page.getByText("Birdie klassement")).toBeVisible();

    // Go back
    await page.locator("text=arrow_back").click();
    await expect(page.getByText("Herenmiddag (voorbeeld)")).toBeVisible();
  });
});
