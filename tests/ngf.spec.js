const { test, expect } = require("@playwright/test");

test.describe("NGF-Pas", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to NGF page", async ({ page }) => {
    await page.getByText("NGF-Pas").click();

    await expect(page).toHaveURL(/.*#\/NGF/);
    await expect(page.locator("header")).toContainText("NGF kaart");
  });
});
