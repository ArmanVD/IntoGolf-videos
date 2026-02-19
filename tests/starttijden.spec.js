const { test, expect } = require("@playwright/test");

test.describe("Starttijden", () => {
  test.beforeEach(async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
  });

  test("should navigate to starttijden page", async ({ page }) => {
    await page.getByText("Starttijden").first().click();

    await expect(page).toHaveURL(/.*#\/reservations/);
    await expect(page.locator("header")).toContainText("Starttijden");
    await expect(
      page.getByRole("button", { name: "Nieuwe starttijd" })
    ).toBeVisible();
  });

  test("should book a tee time", async ({ page }) => {
    await page.getByText("Starttijden").first().click();
    await expect(page).toHaveURL(/.*#\/reservations/);

    // Click "Nieuwe starttijd"
    await page.getByRole("button", { name: "Nieuwe starttijd" }).click();

    // Verify the booking form is visible
    await expect(page.getByText("Datum:")).toBeVisible();

    // Navigate forward day by day until time slots are available
    const nextDayButton = page.locator("text=chevron_right");
    const timeSlot = page.locator("text=/\\d{1,2}:\\d{2}/").first();

    for (let i = 0; i < 7; i++) {
      await nextDayButton.click();
      await page.waitForTimeout(1000);

      if (await timeSlot.isVisible().catch(() => false)) {
        break;
      }
    }

    // Wait for any loading overlay to disappear, then click the first available time slot
    await page.locator(".q-loading").waitFor({ state: "hidden" }).catch(() => {});
    await timeSlot.click({ force: true });

    // Verify reservation dialog appears
    await expect(page.getByText("Uw reservering")).toBeVisible();

    // Confirm the reservation
    await page.getByRole("button", { name: "Reserveer" }).click();

    // Verify reservation detail page
    await expect(page.getByText("Uw starttijd")).toBeVisible();
    await expect(page.getByText("Boeker")).toBeVisible();
  });

  test("should cancel a tee time", async ({ page }) => {
    await page.getByText("Starttijden").first().click();
    await expect(page).toHaveURL(/.*#\/reservations/);

    // Wait for the reservations list to load and get the last item's text
    await expect(page.getByRole("listitem").first()).toBeVisible();
    const lastItem = page.getByRole("listitem").last();
    const lastItemText = await lastItem.textContent();

    // Click the last reservation in the list
    await lastItem.click();

    // Verify the reservation detail page
    await expect(page.getByText("Uw starttijd")).toBeVisible();

    // Click "Annuleer flight"
    await page.getByText("Annuleer flight").click();

    // Confirm the cancellation dialog
    await expect(page.getByText("Starttijd annuleren")).toBeVisible();
    await page.getByRole("button", { name: "OK" }).click();

    // Verify we're back on the reservations list
    await expect(
      page.getByRole("button", { name: "Nieuwe starttijd" })
    ).toBeVisible();
  });
});
