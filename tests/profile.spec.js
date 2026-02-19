const { test, expect } = require("@playwright/test");

test.describe("Profile", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to profile and display user details", async ({ page }) => {
    await page.getByText("Profiel").click();
    await expect(page).toHaveURL(/.*#\/profile/);
    await expect(page.locator("header")).toContainText("Profiel");

    // Verify the Naam tab is selected by default with user info
    await expect(page.getByRole("tab", { name: "Naam" })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator('input[aria-label="Voornaam"]')).toHaveValue("Edwin");
    await expect(page.locator('input[aria-label="Achternaam"]')).toHaveValue("Kerkhoven");
  });

  test("should switch between profile tabs", async ({ page }) => {
    await page.getByText("Profiel").click();
    await expect(page).toHaveURL(/.*#\/profile/);

    // Switch to Contact tab
    await page.getByRole("tab", { name: "Contact" }).click();
    await expect(page.locator('input[aria-label="Emailadres"]')).toHaveValue("edwin+test@intogolf.nl");

    // Switch to Golf tab
    await page.getByRole("tab", { name: "Golf" }).click();
    await expect(page.locator('input[aria-label="Speelsterkte"]')).toBeVisible();
  });

  test("should change visibility preference and persist after reload", async ({ page }) => {
    await page.getByText("Profiel").click();
    await expect(page).toHaveURL(/.*#\/profile/);

    // Switch to Voorkeuren tab
    await page.getByRole("tab", { name: "Voorkeuren" }).click();

    // Get the current value
    const dropdown = page.getByRole("combobox", { name: "Zichtbaarheid in ledenboekje" });
    const currentValue = await dropdown.inputValue();

    // Pick a different value to toggle to
    const newValue = currentValue === "Niet zichtbaar"
      ? "Naam en speelsterkte"
      : "Niet zichtbaar";

    // Open the dropdown and select the new value
    await dropdown.click();
    await page.getByRole("option", { name: newValue }).click();

    // Click Opslaan
    await page.getByRole("button", { name: "Opslaan" }).click();
    await page.waitForTimeout(1000);

    // Reload the page and verify the change persisted
    await page.goto("/#/profile");
    await page.getByRole("tab", { name: "Voorkeuren" }).click();
    await expect(dropdown).toHaveValue(newValue);

    // Restore the original value
    await dropdown.click();
    await page.getByRole("option", { name: currentValue }).click();
    await page.getByRole("button", { name: "Opslaan" }).click();
    await page.waitForTimeout(1000);

    // Verify restoration
    await page.goto("/#/profile");
    await page.getByRole("tab", { name: "Voorkeuren" }).click();
    await expect(dropdown).toHaveValue(currentValue);
  });
});
