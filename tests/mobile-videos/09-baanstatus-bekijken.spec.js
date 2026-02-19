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

test.describe("Baanstatus bekijken (Mobile)", () => {
  test("should demonstrate viewing the course status", async ({ page }) => {
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

    // Clip 2: Tap Baanstatus from drawer
    // TTS: "Klik vervolgens op 'Baanstatus'."
    await showInstruction(page, "Klik vervolgens op 'Baanstatus'.");
    logTimestamp(startTime, 2, "Baanstatus in menu");
    await page.waitForTimeout(500);

    const baanstatusItem = page
      .locator(".q-drawer")
      .getByText("Baanstatus", { exact: true });
    await tapElement(page, baanstatusItem, { force: true });
    await expect(page).toHaveURL(/.*#\/[Bb]aanstatus/);

    await initHelpers(page);

    // Wait for page to load
    await page.getByText("Lus a").waitFor({ state: "visible" });
    await page.waitForTimeout(1000);

    // Clip 3: Baanstatus loaded — overview
    // TTS: "Hier kunt u van alle verschillende banen de huidige status zien."
    await showInstruction(
      page,
      "Hier kunt u van alle verschillende banen de huidige status zien."
    );
    logTimestamp(startTime, 3, "Baanstatus geladen");
    await page.waitForTimeout(3500);

    // Clip 4: Explain status icons
    // TTS: "De verschillende statussen zijn: een groen vinkje voor ja, een rood kruis voor nee, en een grijze streep voor niet van toepassing."
    await showInstruction(
      page,
      "De verschillende statussen zijn: een groen vinkje voor ja, een rood kruis voor nee, en een grijze streep voor niet van toepassing."
    );
    logTimestamp(startTime, 4, "Status uitleg");
    await page.waitForTimeout(5500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
