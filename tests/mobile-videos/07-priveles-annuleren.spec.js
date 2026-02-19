const { test, expect, devices } = require("@playwright/test");
const {
  BASE_URL,
  initHelpers,
  showInstruction,
  hideInstruction,
  tapElement,
  logTimestamp,
  login,
} = require("./helpers");

test.use({
  ...devices["iPhone 13"],
  viewport: { width: 390, height: 844 },
  video: "on",
});

test.setTimeout(200000);

test.describe("Privéles annuleren (Mobile)", () => {
  test("should demonstrate cancelling a private lesson", async ({ page }) => {
    const startTime = Date.now();

    // Silent login — not recorded
    await login(page);

    // Silent pre-booking: book a lesson 3 days ahead to ensure it's always >6h in the future
    await page.goto(`${BASE_URL}/#/lessons`);
    await page.getByRole("button", { name: "Priveles" }).waitFor({ state: "visible" });
    await page.getByRole("button", { name: "Priveles" }).click();
    await page.waitForTimeout(1000);
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 3);
    const dateStr = futureDate.toISOString().split("T")[0];
    await page.getByRole("textbox", { name: "Datum" }).fill(dateStr);
    await page.waitForTimeout(1500);
    await page.locator("text=/\\d{2}:\\d{2}/").first().click();
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "OK" }).click();
    await page.waitForTimeout(2000);

    // Navigate back to dashboard to start the recorded flow
    await page.goto(`${BASE_URL}/#/`);
    await page.getByText("Starttijden").first().waitFor({ state: "visible" });
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 1: Dashboard — open menu
    // TTS: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen."
    await showInstruction(
      page,
      "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen."
    );
    logTimestamp(startTime, 1, "Dashboard open menu");
    await page.waitForTimeout(2500);

    const menuBtn = page.locator("text=menu").first();
    await tapElement(page, menuBtn);
    await page.waitForTimeout(2000); // Drawer animation

    // Clip 2: Tap Lessen from drawer
    // TTS: "Klik vervolgens op 'Lessen'."
    await showInstruction(page, "Klik vervolgens op 'Lessen'.");
    logTimestamp(startTime, 2, "Lessen in menu");
    await page.waitForTimeout(500);

    const lessenItem = page
      .locator(".q-drawer")
      .getByText("Lessen", { exact: true });
    await tapElement(page, lessenItem, { force: true });
    await expect(page).toHaveURL(/.*#\/lessons/);

    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 3: Lessons screen — tap the lesson to cancel
    // TTS: "Nu komt u bij het lessenscherm. Hier kunt u uw geboekte lessen zien en een nieuwe les boeken. Klik op de les die u wilt annuleren."
    await showInstruction(
      page,
      "Nu komt u bij het lessenscherm. Hier kunt u uw geboekte lessen zien en een nieuwe les boeken. Klik op de les die u wilt annuleren."
    );
    logTimestamp(startTime, 3, "Selecteer les");
    await page.waitForTimeout(4000);

    // Tap the last lesson (the one we just booked, furthest in the future)
    const lastLesson = page
      .locator("div.row.full-width")
      .filter({ hasText: "Prive les 60 min." })
      .last();
    await lastLesson.waitFor({ state: "visible" });
    await tapElement(page, lastLesson);
    await page.waitForTimeout(1500);

    await initHelpers(page);

    // Clip 4: Detail page — tap Annuleer les and OK
    // TTS: "Klik vervolgens op 'Annuleer les', en op 'Oké' om te bevestigen."
    await showInstruction(
      page,
      "Klik vervolgens op 'Annuleer les', en op 'Oké' om te bevestigen."
    );
    logTimestamp(startTime, 4, "Annuleer les");
    await page.waitForTimeout(2500);

    const annuleerBtn = page.getByRole("button", { name: "Annuleer les" });
    await tapElement(page, annuleerBtn);
    await page.waitForTimeout(1000); // Popup opens

    const okBtn = page.getByRole("button", { name: "OK" });
    await okBtn.waitFor({ state: "visible" });
    await tapElement(page, okBtn);
    await page.waitForTimeout(2000);

    try {
      await initHelpers(page);
    } catch (_) {}

    // Clip 5: Success
    // TTS: "U heeft nu succesvol de les geannuleerd."
    await showInstruction(page, "U heeft nu succesvol de les geannuleerd.");
    logTimestamp(startTime, 5, "Geannuleerd");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
