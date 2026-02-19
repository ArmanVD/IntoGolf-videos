const { test, expect } = require("@playwright/test");

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should display user name on dashboard", async ({ page }) => {
    await expect(page.getByText("Edwin Kerkhoven")).toBeVisible();
  });

  test("should display all navigation menu items", async ({ page }) => {
    await expect(page.getByText("Starttijden").first()).toBeVisible();
    await expect(page.getByText("Wedstrijden").first()).toBeVisible();
    await expect(page.getByText("Baankalender")).toBeVisible();
    await expect(page.getByText("Meerronden")).toBeVisible();
    await expect(page.getByText("Berichten")).toBeVisible();
    await expect(page.getByText("Baanstatus").first()).toBeVisible();
    await expect(page.getByText("Handicap").first()).toBeVisible();
    await expect(page.getByText("NGF-Pas").first()).toBeVisible();
    await expect(page.getByText("Lessen")).toBeVisible();
    await expect(page.getByText("Ledenlijst").first()).toBeVisible();
    await expect(page.getByText("Profiel").first()).toBeVisible();
    await expect(page.getByText("Speelhistorie").first()).toBeVisible();
  });

  test("should navigate to wedstrijden from dashboard", async ({ page }) => {
    await page.getByText("Wedstrijden").first().click();
    await expect(page).toHaveURL(/.*#\/match/);
  });

  test("should navigate to starttijden from dashboard", async ({ page }) => {
    await page.getByText("Starttijden").first().click();
    await expect(page).toHaveURL(/.*#\/reservations/);
  });
});
