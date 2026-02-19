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

const MONTHS = [
  "Januari", "Februari", "Maart", "April", "Mei", "Juni",
  "Juli", "Augustus", "September", "Oktober", "November", "December",
];

test.describe("Wedstrijd inschrijven (Mobile)", () => {
  test("should demonstrate enrolling in a match", async ({ page }) => {
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

    // Clip 2: Tap Wedstrijden from drawer
    // TTS: "Klik vervolgens op 'Wedstrijden'."
    await showInstruction(page, "Klik vervolgens op 'Wedstrijden'.");
    logTimestamp(startTime, 2, "Wedstrijden in menu");
    await page.waitForTimeout(500);

    const wedstrijdenItem = page
      .locator(".q-drawer")
      .getByText("Wedstrijden", { exact: true });
    await tapElement(page, wedstrijdenItem, { force: true });
    await expect(page).toHaveURL(/.*#\/match/);

    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 3: Tap Inschrijven filter and select a match
    // TTS: "Klik op 'Inschrijven' en kies de gewenste wedstrijd."
    await showInstruction(
      page,
      "Klik op 'Inschrijven' en kies de gewenste wedstrijd."
    );
    logTimestamp(startTime, 3, "Inschrijven filter + match select");
    await page.waitForTimeout(2000);

    // Tap the Inschrijven filter button at the top of the page
    const inschrijvenFilter = page.locator('button:has(span:text("Inschrijven"))').first();
    await tapElement(page, inschrijvenFilter);
    await page.waitForTimeout(1000);

    // Find and tap first enrollable match — try current month, then next month
    let foundMatch = false;
    let enrolledMatchName = "";
    let enrolledMatchDate = "";
    let enrolledMonth = MONTHS[new Date().getMonth()];

    for (let monthOffset = 0; monthOffset <= 1 && !foundMatch; monthOffset++) {
      if (monthOffset === 1) {
        enrolledMonth = MONTHS[(new Date().getMonth() + 1) % 12];
        await page.getByRole("combobox", { name: "Selecteer maand" }).click();
        await page.getByRole("option", { name: enrolledMonth }).click();
        await page.waitForTimeout(1000);
        // Re-apply filter
        await page.locator('button:has(span:text("Inschrijven"))').first().click();
        await page.waitForTimeout(1000);
      }

      const matchItems = page.getByRole("listitem");
      const matchCount = await matchItems.count();

      for (let i = 0; i < matchCount && !foundMatch; i++) {
        const item = matchItems.nth(i);
        const itemText = await item.innerText();

        const isEnrolled = await item.getByText("Ingeschreven").isVisible().catch(() => false);
        if (isEnrolled) continue;

        await tapElement(page, item);
        await page.waitForTimeout(1000);
        await initHelpers(page);

        const inschrijvenBtn = page.getByRole("button", { name: "Inschrijven", exact: true });
        const canEnroll = await inschrijvenBtn.isVisible().catch(() => false);

        if (canEnroll) {
          const lines = itemText.split("\n").filter((l) => l.trim());
          enrolledMatchName =
            lines.find(
              (l) =>
                l !== "Q" &&
                !l.includes("/") &&
                !l.includes("Ingeschreven") &&
                !l.match(/^\d+$/)
            ) || "";
          enrolledMatchDate = lines.find((l) => l.includes("/")) || "";
          foundMatch = true;

          // Clip 4: Tap Inschrijven on detail page, then Opslaan
          // TTS: "Vervolgens klikt u op 'Inschrijven' en bevestigt u de inschrijving door op 'Opslaan' te klikken."
          await showInstruction(
            page,
            "Vervolgens klikt u op 'Inschrijven' en bevestigt u de inschrijving door op 'Opslaan' te klikken."
          );
          logTimestamp(startTime, 4, "Inschrijven + Opslaan");
          await page.waitForTimeout(2500);

          await tapElement(page, inschrijvenBtn);
          await expect(page.getByText("Opmerking")).toBeVisible();
          await page.waitForTimeout(1000);

          const opslaanBtn = page.getByRole("button", { name: "Opslaan" });
          await tapElement(page, opslaanBtn);
          await expect(page.getByText("is verwerkt")).toBeVisible();
          await page.waitForTimeout(1500);

          try {
            await initHelpers(page);
          } catch (_) {}
        } else {
          // No Inschrijven button — go back and try next match
          await page.getByRole("button", { name: "Wedstrijden" }).click();
          await page.waitForTimeout(500);
          await page.locator('button:has(span:text("Inschrijven"))').first().click();
          await page.waitForTimeout(500);
        }
      }
    }

    // Clip 5: Success
    // TTS: "U bent nu succesvol ingeschreven voor een wedstrijd."
    await showInstruction(
      page,
      "U bent nu succesvol ingeschreven voor een wedstrijd."
    );
    logTimestamp(startTime, 5, "Ingeschreven");
    await page.waitForTimeout(3500);

    await hideInstruction(page);
    await page.waitForTimeout(500);

    // Silent cleanup: unenroll from the match we just enrolled in
    if (foundMatch && enrolledMatchName) {
      try {
        const matchItems = page.getByRole("listitem");
        const matchCount = await matchItems.count();
        for (let i = 0; i < matchCount; i++) {
          const item = matchItems.nth(i);
          const itemText = await item.innerText();
          if (itemText.includes(enrolledMatchName)) {
            await item.click();
            await page.waitForTimeout(1000);
            const mijnInschrijving = page.getByRole("button", { name: "Mijn inschrijving" });
            if (await mijnInschrijving.isVisible().catch(() => false)) {
              await mijnInschrijving.click();
              await page.getByRole("button", { name: "Uitschrijven" }).click();
              await page.getByRole("button", { name: "OK" }).click();
              await page.waitForTimeout(2000);
            }
            break;
          }
        }
      } catch (_) {
        // Cleanup failed — not critical for the video
      }
    }
  });
});
