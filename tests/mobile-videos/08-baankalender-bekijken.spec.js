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

test.describe("Baankalender bekijken (Mobile)", () => {
  test("should demonstrate viewing the course calendar", async ({ page }) => {
    const startTime = Date.now();

    // Silent login — not recorded
    await login(page);

    // Wait for dashboard to be ready
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

    // Clip 2: Tap Baankalender from drawer
    // TTS: "Klik vervolgens op 'Baankalender'."
    await showInstruction(page, "Klik vervolgens op 'Baankalender'.");
    logTimestamp(startTime, 2, "Baankalender in menu");
    await page.waitForTimeout(500);

    const baankalenderItem = page
      .locator(".q-drawer")
      .getByText("Baankalender", { exact: true });
    await tapElement(page, baankalenderItem, { force: true });
    await expect(page).toHaveURL(/.*#\/[Bb]aankalender/);

    await initHelpers(page);

    // Wait for calendar to fully load
    await page.getByText("Lus a").waitFor({ state: "visible" });
    await page.waitForTimeout(1000);

    // Clip 3: Calendar loaded — show date picker
    // TTS: "Hiermee opent u de kalender. U kunt bovenin van datum wijzigen indien gewenst."
    await showInstruction(
      page,
      "Hiermee opent u de kalender. U kunt bovenin van datum wijzigen indien gewenst."
    );
    logTimestamp(startTime, 3, "Kalender geladen");
    await page.waitForTimeout(4000);

    // Clip 4: Show per-baan times
    // TTS: "Vervolgens ziet u per baan de geboekte tijden staan."
    await showInstruction(
      page,
      "Vervolgens ziet u per baan de geboekte tijden staan."
    );
    logTimestamp(startTime, 4, "Tijden per baan");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
