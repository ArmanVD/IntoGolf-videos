const { test, expect } = require("@playwright/test");

test.describe("Authentication", () => {
  test("should show error with wrong credentials", async ({ page }) => {
    await page.goto("/#/login");

    await page.locator('input[type="text"]').fill("wrong@email.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: "Login" }).click();

    // Verify error toast appears
    await expect(page.getByText("Gegevens niet correct")).toBeVisible();

    // Verify we stay on the login page
    await expect(page).toHaveURL(/.*#\/login/);
  });

  test("should show validation errors with empty fields", async ({ page }) => {
    await page.goto("/#/login");

    // Clear any pre-filled values
    await page.locator('input[type="text"]').fill("");
    await page.locator('input[type="password"]').fill("");
    await page.getByRole("button", { name: "Login" }).click();

    // Verify inline validation messages
    await expect(page.getByText("Voer aub uw e-mailadres in")).toBeVisible();
    await expect(page.getByText("Voer aub uw e-wachtwoord in")).toBeVisible();

    // Verify we stay on the login page
    await expect(page).toHaveURL(/.*#\/login/);
  });

  test("should log in successfully with correct credentials", async ({ page }) => {
    await page.goto("/#/login");

    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();

    // Verify redirect away from login
    await page.waitForURL(/.*#\/(?!login).*/);
    await expect(page).not.toHaveURL(/.*#\/login/);
  });
});
