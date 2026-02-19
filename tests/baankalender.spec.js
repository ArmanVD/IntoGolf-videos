const { test, expect } = require("@playwright/test");

test.describe("Baankalender", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to baankalender page", async ({ page }) => {
    await page.getByText("Baankalender").click();

    await expect(page).toHaveURL(/.*#\/Baankalender/);
    await expect(page.locator("header")).toContainText("Baankalender");
  });

  test("should display calendar with Lus a and Lus b", async ({ page }) => {
    await page.getByText("Baankalender").click();
    await expect(page).toHaveURL(/.*#\/Baankalender/);

    // Verify Lus a and Lus b columns
    await expect(page.getByText("Lus a")).toBeVisible();
    await expect(page.getByText("Lus b")).toBeVisible();

    // Verify time indicators are shown on the timeline
    await expect(page.getByText("9:00", { exact: true })).toBeVisible();
    await expect(page.getByText("10:00", { exact: true })).toBeVisible();
  });
});
