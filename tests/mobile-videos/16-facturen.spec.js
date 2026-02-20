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

test.describe("Facturen bekijken (Mobile)", () => {
  test("should demonstrate viewing and downloading invoices", async ({ page }) => {
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

    // Clip 2: Tap Facturen from drawer
    // TTS: "Klik vervolgens op 'Facturen'."
    await showInstruction(page, "Klik vervolgens op 'Facturen'.");
    logTimestamp(startTime, 2, "Facturen in menu");
    await page.waitForTimeout(500);

    const facturenItem = page
      .locator(".q-drawer")
      .getByText("Facturen", { exact: true });
    await tapElement(page, facturenItem, { force: true });

    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Clip 3: Show invoice list — tap first invoice
    // TTS: "U ziet nu een overzicht van al uw facturen. Klik op de factuur die u wilt downloaden om deze te downloaden."
    await showInstruction(
      page,
      "U ziet nu een overzicht van al uw facturen. Klik op de factuur die u wilt downloaden om deze te downloaden."
    );
    logTimestamp(startTime, 3, "Facturen overzicht");
    await page.waitForTimeout(4000);

    const firstInvoice = page.getByRole("listitem").first();
    await tapElement(page, firstInvoice);
    await page.waitForTimeout(2500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
