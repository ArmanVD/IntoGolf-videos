const { test, expect, devices } = require("@playwright/test");

// Use mobile viewport
test.use({
  ...devices['iPhone 13'],
  video: "on"
});
test.setTimeout(200000);

/**
 * Show a Dutch instruction overlay on the page - MOBILE OPTIMIZED
 * Larger text, better positioning for mobile screens
 */
async function showInstruction(page, text) {
  await page.evaluate((msg) => {
    let overlay = document.getElementById("test-instruction-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = "test-instruction-overlay";
      overlay.setAttribute("aria-hidden", "true");
      overlay.style.cssText = `
        position: fixed;
        bottom: 40px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.9);
        color: #fff;
        font-size: 24px;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        font-weight: 600;
        padding: 16px 24px;
        border-radius: 12px;
        z-index: 999999;
        text-align: center;
        max-width: 85%;
        line-height: 1.4;
        pointer-events: none;
        transition: opacity 0.3s;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      `;
      document.body.appendChild(overlay);
    }
    overlay.textContent = msg;
    overlay.style.opacity = "1";
  }, text);
}

async function hideInstruction(page) {
  await page.evaluate(() => {
    const overlay = document.getElementById("test-instruction-overlay");
    if (overlay) overlay.style.opacity = "0";
  });
}

let testStartTime;

function logTimestamp(clipNumber, label) {
  const elapsed = ((Date.now() - testStartTime) / 1000).toFixed(2);
  console.log(`VOICEOVER_TIMESTAMP|${clipNumber}|${elapsed}|${label}`);
}

test.describe("Lessen - Mobile", () => {
  test("should book and cancel a privé les on mobile", async ({ page }) => {
    // Log in
    await page.goto("/#/login");
    testStartTime = Date.now();

    // Stap 1: Log in instruction (4.13s TTS)
    await showInstruction(page, "Stap één: Log in met uw e-mailadres, en wachtwoord.");
    logTimestamp("01", "Stap 1");
    await page.waitForTimeout(1000);
    await page.locator('input[type="text"]').fill("edwin+test@intogolf.nl");
    await page.waitForTimeout(500);
    await page.locator('input[type="password"]').fill("Test543@!");
    await page.waitForTimeout(2500);

    // Stap 2: Click login (2.79s TTS)
    await showInstruction(page, "Klik op de knop Login, om in te loggen.");
    logTimestamp("02", "Klik Login");
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Login" }).click();
    await page.waitForURL(/.*#\/(?!login).*/);
    await page.waitForTimeout(2500);

    // Dashboard reached (2.83s TTS)
    await showInstruction(page, "U bent nu ingelogd, op het dashboard.");
    logTimestamp("03", "Ingelogd");
    await page.waitForTimeout(3500);

    // Stap 3: Navigate to Lessen (2.60s TTS)
    await showInstruction(page, "Stap twee: Ga naar het lessen-menu.");
    logTimestamp("04", "Stap 2");
    await page.waitForTimeout(2000);
    await hideInstruction(page); // Hide overlay before navigating
    await page.waitForTimeout(500);
    // Direct navigation for now (tile click not working on mobile)
    await page.goto("/#/lessons");
    await expect(page).toHaveURL(/.*#\/lessons/);
    await expect(page.locator("header")).toContainText("Lessen");
    await page.waitForTimeout(2500);

    // Lessen overview (1.67s TTS)
    await showInstruction(page, "Dit is het lessen-overzicht.");
    logTimestamp("05", "Overzicht");
    await page.waitForTimeout(3000);

    // Stap 4: Click Privé les (3.72s TTS)
    await showInstruction(page, "Stap drie: Klik op Privé les, om een les te boeken.");
    logTimestamp("06", "Stap 3");
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "Priveles" }).click();
    await expect(page.getByText("Reserveer een les")).toBeVisible();
    await page.waitForTimeout(3500);

    // Form opened (2.37s TTS)
    await showInstruction(page, "Het reserveer-formulier is geopend.");
    logTimestamp("07", "Formulier open");
    await page.waitForTimeout(3000);

    // Stap 5: Choose date (2.83s TTS)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split("T")[0];
    await showInstruction(page, "Stap vier: Kies een datum voor uw les.");
    logTimestamp("08", "Stap 4");
    await page.waitForTimeout(500);
    await page.getByRole("textbox", { name: "Datum" }).click();
    await page.getByRole("textbox", { name: "Datum" }).fill(dateStr);
    await page.waitForTimeout(3000);

    // Stap 6: Choose time slot (2.88s TTS)
    await showInstruction(page, "Stap vijf: Kies een beschikbaar tijdslot.");
    logTimestamp("09", "Stap 5");
    await page.waitForTimeout(500);
    const timeSlot = page.locator("text=/\\d{2}:\\d{2}/").first();
    await timeSlot.click();
    await page.waitForTimeout(2500);

    // Stap 7: Confirm booking (3.81s TTS)
    await expect(page.getByText("wil je doorgaan?")).toBeVisible();
    await showInstruction(page, "Stap zes: Bevestig de boeking, door op OK te klikken.");
    logTimestamp("10", "Stap 6");
    await page.waitForTimeout(500);
    await page.getByRole("button", { name: "OK" }).click();
    await page.waitForTimeout(3500);

    // Booking confirmed (1.81s TTS)
    await expect(page.getByText("Uw les is geboekt")).toBeVisible();
    await showInstruction(page, "Uw les is succesvol geboekt!");
    logTimestamp("11", "Geboekt");
    await page.waitForTimeout(4000);

    // Stap 8: Open lesson detail (4.46s TTS)
    const tomorrowDay = tomorrow.toLocaleDateString("nl-NL", { weekday: "short" });
    const tomorrowDate = tomorrow.getDate();
    const tomorrowMonth = tomorrow.toLocaleDateString("nl-NL", { month: "short" });
    const lessonDateText = `${tomorrowDay}. ${tomorrowDate} ${tomorrowMonth}`;
    await showInstruction(page, "Stap zeven: Open de geboekte les, om de details te bekijken.");
    logTimestamp("12", "Stap 7");
    await page.waitForTimeout(1000);
    const lessonItems = page.locator(`text=${lessonDateText}`);
    await lessonItems.first().click();
    await page.waitForTimeout(4000);

    // Lesson detail opened (3.02s TTS)
    await expect(page.getByText("Lesinformatie")).toBeVisible();
    await expect(page.getByRole("button", { name: "Annuleer les" })).toBeVisible();
    await showInstruction(page, "Hier ziet u de les-informatie, en details.");
    logTimestamp("13", "Informatie");
    await page.waitForTimeout(3500);

    // Stap 9: Cancel lesson (4.09s TTS)
    await showInstruction(page, "Stap acht: Klik op Annuleer les, om de les te annuleren.");
    logTimestamp("14", "Stap 8");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "Annuleer les" }).click();
    await page.waitForTimeout(3500);

    // Stap 10: Confirm cancellation (4.50s TTS)
    await expect(page.getByText("Deze les wordt geannuleerd")).toBeVisible();
    await showInstruction(page, "Stap negen: Bevestig de annulering, door op OK te klikken.");
    logTimestamp("15", "Stap 9");
    await page.waitForTimeout(1000);
    await page.getByRole("button", { name: "OK" }).click();
    await page.waitForTimeout(4000);

    // Cancellation confirmed (2.14s TTS)
    await expect(page.getByText("uw les is geannuleerd")).toBeVisible();
    await showInstruction(page, "De les is succesvol geannuleerd!");
    logTimestamp("16", "Geannuleerd");
    await page.waitForTimeout(3000);
    await hideInstruction(page);
    await page.waitForTimeout(1000);
  });
});
