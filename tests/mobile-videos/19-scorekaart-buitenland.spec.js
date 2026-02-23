const { test, devices } = require("@playwright/test");
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

test.describe("Scorekaart buitenland invullen (Mobile)", () => {
  test("should demonstrate filling in a foreign scorecard", async ({ page }) => {
    const startTime = Date.now();

    // Random date 1–5 days ago
    const daysAgo = Math.floor(Math.random() * 5) + 1;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    // Random time between 07:00 and 17:00
    const randHour = String(Math.floor(Math.random() * 11) + 7).padStart(2, "0");
    const randMin = ["00", "10", "20", "30", "40", "50"][Math.floor(Math.random() * 6)];
    const timeStr = `${randHour}:${randMin}`;

    await login(page);
    await page.getByText("Starttijden").first().waitFor({ state: "visible" });
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Clip 1: Dashboard → open menu
    await showInstruction(page, "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.");
    logTimestamp(startTime, 1, "Dashboard open menu");
    await page.waitForTimeout(2500);
    await tapElement(page, page.locator("text=menu").first());
    await page.waitForTimeout(3500);

    // Clip 2: Click Handicap from drawer, then Buitenland tab
    await showInstruction(page, "Klik vervolgens op 'Handicap' en dan op 'Buitenland'.");
    logTimestamp(startTime, 2, "Handicap + Buitenland tab");
    await page.waitForTimeout(500);
    await tapElement(page, page.locator(".q-drawer").getByText("Handicap", { exact: true }), { force: true });
    await initHelpers(page);
    await page.waitForTimeout(3000);

    // Click Buitenland tab — smallest element with BUITENLAND but not BINNENLAND in top 150px
    const buitenlandInfo = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button, a, [role='button'], .q-btn, span, div"));
      const matching = els.filter(el => {
        const r = el.getBoundingClientRect();
        const text = el.innerText?.replace(/\s/g, "").toUpperCase() || "";
        return r.top >= 0 && r.top < 150 && r.height < 100 && r.width > 20 &&
               text.includes("BUITENLAND") && !text.includes("BINNENLAND");
      });
      if (!matching.length) return null;
      matching.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return (ra.width * ra.height) - (rb.width * rb.height);
      });
      const el = matching[0];
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
    });
    console.log("BUITENLAND TAB INFO:", JSON.stringify(buitenlandInfo));
    if (buitenlandInfo) {
      // First click: switch to Buitenland tab view
      await page.evaluate(({ x, y }) => {
        const ring = document.getElementById("igo-tap-ring");
        if (ring) { ring.style.left = x + "px"; ring.style.top = y + "px"; ring.className = "pulse"; ring.style.display = "block"; }
      }, buitenlandInfo);
      await page.waitForTimeout(1200);
      await page.evaluate(() => { const ring = document.getElementById("igo-tap-ring"); if (ring) ring.className = "tap"; });
      await page.waitForTimeout(300);
      await page.mouse.click(buitenlandInfo.x, buitenlandInfo.y);
      await page.waitForTimeout(1500);

      // Second click: now on Buitenland tab → click again to open new scorecard form
      await page.evaluate(({ x, y }) => {
        const ring = document.getElementById("igo-tap-ring");
        if (ring) { ring.style.left = x + "px"; ring.style.top = y + "px"; ring.className = "pulse"; ring.style.display = "block"; }
      }, buitenlandInfo);
      await page.waitForTimeout(1200);
      await page.evaluate(() => { const ring = document.getElementById("igo-tap-ring"); if (ring) ring.className = "tap"; });
      await page.waitForTimeout(300);
      await page.mouse.click(buitenlandInfo.x, buitenlandInfo.y);
    }
    await initHelpers(page);
    await page.waitForTimeout(2000);

    // ── PAGE 1: Datum, tijd, land ────────────────────────────────────────────

    // Clip 3: Fill date, time, country → Volgende
    await showInstruction(page, "Vul de datum, tijd en het land in waar gespeeld is. Klik vervolgens op 'Volgende'.");
    logTimestamp(startTime, 3, "Datum, tijd, land");
    await page.waitForTimeout(1000);

    const dateField = page.locator('input[type="date"]').first();
    await tapElement(page, dateField);
    await dateField.fill(dateStr);
    await page.waitForTimeout(500);

    const timeField = page.locator('input[type="time"]').first();
    await tapElement(page, timeField);
    await timeField.fill(timeStr);
    await page.waitForTimeout(500);

    // Country dropdown — open, type "Belg" to filter, click België
    const countrySelect = page.locator(".q-select").first();
    await tapElement(page, countrySelect);
    await page.waitForTimeout(800);
    await page.keyboard.type("Belg");
    await page.waitForTimeout(600);
    await page.getByRole("option").filter({ hasText: /belgi/i }).first().click();
    await page.waitForTimeout(500);

    await tapElement(page, page.getByRole("button", { name: /volgende/i }));
    await initHelpers(page);
    await page.waitForTimeout(1500);

    // ── PAGE 2: Baan, holes, lus, tee ───────────────────────────────────────

    const page2Debug = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input")).map(el =>
        `[${el.type}] ph="${el.placeholder}" val="${el.value}"`).join(" | ")
    );
    console.log("PAGE 2 INPUTS:", page2Debug);

    // Clip 4: Fill club, holes, lus, tee → Volgende
    // The stepper keeps ALL step inputs in the DOM simultaneously.
    // Page 1 inputs are at indices 0-2 (hidden), page 2 starts at index 3.
    // club=idx3, holes=.q-select.nth(1), lus=idx5, tee=.q-select.nth(2)
    await showInstruction(page, "Voer nu de naam van de baan in, het aantal holes, de naam van de lus en de kleur van de tee. Klik vervolgens op 'Volgende'.");
    logTimestamp(startTime, 4, "Baan, holes, lus, tee");
    await page.waitForTimeout(1000);

    // Club name (index 3 — page 1 has date[0], time[1], country[2])
    const clubInput = page.locator("input").nth(3);
    await tapElement(page, clubInput);
    await clubInput.fill("Royal Antwerp Golf Club");
    await page.waitForTimeout(500);

    // Holes dropdown (q-select index 1 — country q-select is index 0 on hidden page 1)
    const holesSelect = page.locator(".q-select").nth(1);
    await tapElement(page, holesSelect, { force: true });
    await page.waitForTimeout(1000);
    await page.getByRole("option").filter({ hasText: /^18/ }).first().click();
    await page.waitForTimeout(500);

    // Lus name (index 5)
    const lusInput = page.locator("input").nth(5);
    await tapElement(page, lusInput);
    await lusInput.fill("Tom Simpson Course");
    await page.waitForTimeout(500);

    // Tee colour dropdown (q-select index 2)
    const teeSelect = page.locator(".q-select").nth(2);
    await tapElement(page, teeSelect, { force: true });
    await page.waitForTimeout(1000);
    await page.getByRole("option").filter({ hasText: /heren blauw/i }).first().click();
    await page.waitForTimeout(500);

    await tapElement(page, page.getByRole("button", { name: /volgende/i }));
    await initHelpers(page);
    await page.waitForTimeout(1500);

    // ── PAGE 3: Courserating, sloperating, par ───────────────────────────────

    const page3Debug = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input")).map(el =>
        `[${el.type}] ph="${el.placeholder}" val="${el.value}"`).join(" | ")
    );
    console.log("PAGE 3 INPUTS:", page3Debug);

    // Clip 5: Fill ratings → Volgende
    // Page 3 rating inputs: page1=0-2(hidden), page2=3-6(hidden), page3 starts at 7
    // courserating=7, sloperating=8, par=9
    await showInstruction(page, "Vul nu de courserating, sloperating en de par in van de gespeelde baan. Klik vervolgens op 'Volgende'.");
    logTimestamp(startTime, 5, "Courserating, sloperating, par");
    await page.waitForTimeout(1000);

    const ratingInputs = page.locator("input");
    await tapElement(page, ratingInputs.nth(7));
    await ratingInputs.nth(7).fill("69.0");
    await page.waitForTimeout(300);
    await tapElement(page, ratingInputs.nth(8));
    await ratingInputs.nth(8).fill("120");
    await page.waitForTimeout(300);
    await tapElement(page, ratingInputs.nth(9));
    await ratingInputs.nth(9).fill("73");
    await page.waitForTimeout(500);

    await tapElement(page, page.getByRole("button", { name: /volgende/i }));
    await initHelpers(page);
    await page.waitForTimeout(1500);

    // ── PAGE 4: Stableford → Opslaan ────────────────────────────────────────

    const page4Debug = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input")).map(el =>
        `[${el.type}] ph="${el.placeholder}" val="${el.value}"`).join(" | ")
    );
    console.log("PAGE 4 INPUTS:", page4Debug);

    // Clip 6: Fill stableford, click Opslaan, wait for summary, Opslaan again
    await showInstruction(page, "Vul ten slotte het aantal Stableford-punten in, het GSN-nummer van de marker indien aanwezig, en eventuele opmerkingen. Klik vervolgens op 'Opslaan' om de scorekaart op te slaan.");
    logTimestamp(startTime, 6, "Stableford en opslaan");
    await page.waitForTimeout(1500);

    // Stableford points — index 10 in full stepper DOM (page4 starts after ratings 7-9)
    const stablefordInput = page.locator("input").nth(10);
    await tapElement(page, stablefordInput);
    await stablefordInput.fill("36");
    await page.waitForTimeout(500);

    // First Opslaan
    await tapElement(page, page.getByRole("button", { name: /opslaan/i }).first());
    await page.waitForTimeout(1000);

    // Wait for success message + summary page to load
    for (let i = 1; i <= 30; i++) {
      await page.waitForTimeout(500);
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasSummary = bodyText.toLowerCase().includes("opgeslagen") ||
                         bodyText.toLowerCase().includes("sluiten") ||
                         bodyText.toLowerCase().includes("scorekaart") && bodyText.toLowerCase().includes("opslaan") && i > 4;
      console.log(`Wait ${i}: "${bodyText.slice(0, 120).replace(/\n/g, " ")}"`);
      if (hasSummary && i > 3) { console.log("SUMMARY/SUCCESS detected at", i); break; }
    }
    await initHelpers(page);
    await page.waitForTimeout(1000);

    // Second Opslaan on summary screen
    const summaryBtns = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button, .q-btn"))
        .map(el => `"${el.textContent?.trim().replace(/\s+/g, " ")}"`)
        .filter(t => t !== '""').join(" | ")
    );
    console.log("SUMMARY PAGE BUTTONS:", summaryBtns);

    const finalOpslaan = page.getByRole("button", { name: /opslaan/i });
    if (await finalOpslaan.count() > 0) {
      await tapElement(page, finalOpslaan.first());
      await page.waitForTimeout(3000);
    }

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
