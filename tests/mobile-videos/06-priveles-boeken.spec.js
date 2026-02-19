const { test, expect, devices } = require("@playwright/test");
const {
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

test.describe("Privéles boeken (Mobile)", () => {
  test("should demonstrate booking a private lesson", async ({ page }) => {
    const startTime = Date.now();

    // Silent login — not recorded
    await login(page);

    // Wait for dashboard to be ready
    await page.getByText("Starttijden").first().waitFor({ state: "visible" });
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 1: Dashboard — open menu
    // TTS: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje. Hiermee opent u het menu."
    await showInstruction(
      page,
      "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje. Hiermee opent u het menu."
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

    // Clip 3: Lessons screen — tap Privéles
    // TTS: "Nu komt u bij het lessenscherm. Hier kunt u uw geboekte lessen zien en een nieuwe les boeken. Klik op 'Privéles' om een nieuwe les te boeken."
    await showInstruction(
      page,
      "Nu komt u bij het lessenscherm. Hier kunt u uw geboekte lessen zien en een nieuwe les boeken. Klik op 'Privéles' om een nieuwe les te boeken."
    );
    logTimestamp(startTime, 3, "Privéles button");
    await page.waitForTimeout(3500);

    const priveLesBtn = page.getByRole("button", { name: "Priveles" });
    await tapElement(page, priveLesBtn);
    await page.waitForTimeout(1500);

    await initHelpers(page);

    // Clip 4: Choose date, type, and time slot
    // TTS: "Vervolgens kiest u de juiste datum en het soort les en klikt u de tijd aan die u wilt reserveren."
    await showInstruction(
      page,
      "Vervolgens kiest u de juiste datum en het soort les en klikt u de tijd aan die u wilt reserveren."
    );
    logTimestamp(startTime, 4, "Datum, soort, tijdslot");
    await page.waitForTimeout(2000);

    // Tap date field and fill tomorrow
    const dateField = page.getByRole("textbox", { name: "Datum" });
    await tapElement(page, dateField);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await dateField.fill(dateStr);
    await page.waitForTimeout(1500); // Slots reload

    // Tap dropdown and select first option
    const dropdown = page.getByRole("combobox", { name: "Soort les" });
    await tapElement(page, dropdown);
    await page.waitForTimeout(500);
    const firstOption = page.locator(".q-menu .q-item").first();
    await tapElement(page, firstOption);
    await page.waitForTimeout(500);

    // Tap first available time slot
    const timeSlot = page.locator("text=/\\d{2}:\\d{2}/").first();
    await timeSlot.waitFor({ state: "visible" });
    await tapElement(page, timeSlot);
    await page.waitForTimeout(1000); // Popup opens

    // Clip 5: Confirmation popup — tap OK
    // TTS: "Klik vervolgens op 'Ok' om de reservering te bevestigen."
    await showInstruction(
      page,
      "Klik vervolgens op 'Ok' om de reservering te bevestigen."
    );
    logTimestamp(startTime, 5, "Bevestig OK");
    await page.waitForTimeout(500);

    const okBtn = page.getByRole("button", { name: "OK" });
    await okBtn.waitFor({ state: "visible" });
    await tapElement(page, okBtn);
    await page.waitForTimeout(2000);

    try {
      await initHelpers(page);
    } catch (_) {}

    // Clip 6: Success
    // TTS: "U heeft nu succesvol een les geboekt."
    await showInstruction(page, "U heeft nu succesvol een les geboekt.");
    logTimestamp(startTime, 6, "Geboekt");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
