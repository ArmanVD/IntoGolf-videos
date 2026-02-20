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

test.describe("NGF kaart bekijken (Mobile)", () => {
  test("should demonstrate viewing the NGF card", async ({ page }) => {
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

    // Clip 2: Tap NGF from drawer
    // TTS: "Klik vervolgens op 'NGF' om uw NGF-kaart te tonen."
    await showInstruction(page, "Klik vervolgens op 'NGF' om uw NGF-kaart te tonen.");
    logTimestamp(startTime, 2, "NGF in menu");
    await page.waitForTimeout(500);

    const ngfItem = page.locator(".q-drawer").getByText("NGF", { exact: true });
    await tapElement(page, ngfItem, { force: true });

    await initHelpers(page);
    await page.waitForTimeout(3500); // NGF card loads

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
