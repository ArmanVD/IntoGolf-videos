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

test.describe("Scorekaart binnenland invullen (Mobile)", () => {
  test("should demonstrate filling in a domestic scorecard", async ({ page }) => {
    const startTime = Date.now();

    // Random date 1–5 days ago (app only allows up to 5 days in past)
    const daysAgo = Math.floor(Math.random() * 5) + 1;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    const dateStr = `${yyyy}-${mm}-${dd}`;

    // Random time between 07:00 and 17:00
    const randHour = String(Math.floor(Math.random() * 11) + 7).padStart(2, "0");
    const randMin = ["00", "10", "20", "30", "40", "50"][Math.floor(Math.random() * 6)];
    const timeStr = `${randHour}:${randMin}`;

    // Silent login — not recorded
    await login(page);
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

    await tapElement(page, page.locator("text=menu").first());
    await page.waitForTimeout(3500); // Drawer + gap for clip 1 TTS to finish

    // Clip 2: Tap Handicap from drawer
    // TTS: "Klik vervolgens op 'Handicap'."
    await showInstruction(page, "Klik vervolgens op 'Handicap'.");
    logTimestamp(startTime, 2, "Handicap in menu");
    await page.waitForTimeout(500);

    await tapElement(
      page,
      page.locator(".q-drawer").getByText("Handicap", { exact: true }),
      { force: true }
    );
    await initHelpers(page);
    await page.waitForTimeout(3000); // Wait for Handicap page to load

    // Clip 3: Show results overview — tap Binnenland tab
    // TTS: "U ziet nu een overzicht van al uw resultaten. Bovenin kunt u kiezen tussen 'Binnenland' en 'Buitenland'. Voor het invullen van een binnenlandse scorekaart klikt u op 'Binnenland'."
    await showInstruction(
      page,
      "U ziet nu een overzicht van al uw resultaten. Bovenin kunt u kiezen tussen 'Binnenland' en 'Buitenland'. Voor het invullen van een binnenlandse scorekaart klikt u op 'Binnenland'."
    );
    logTimestamp(startTime, 3, "Handicap overzicht");
    await page.waitForTimeout(7000);

    // Click "+ BINNENLAND" tab — find the smallest element with BINNENLAND but NOT BUITENLAND text
    // (parent containers have both in their innerText; individual tabs only have one)
    const binnenlandInfo = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll("button, a, [role='button'], .q-btn, span, div"));
      const matching = els.filter(el => {
        const r = el.getBoundingClientRect();
        const text = el.innerText?.replace(/\s/g, "").toUpperCase() || "";
        return r.top >= 0 && r.top < 150 && r.height < 100 && r.width > 20 &&
               text.includes("BINNENLAND") && !text.includes("BUITENLAND");
      });
      if (!matching.length) return null;
      // Pick smallest area element (most specific tab button, not a container)
      matching.sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return (ra.width * ra.height) - (rb.width * rb.height);
      });
      const el = matching[0];
      const r = el.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height };
    });
    console.log("BINNENLAND TAB INFO:", JSON.stringify(binnenlandInfo));
    if (binnenlandInfo) {
      await page.evaluate(({ x, y }) => {
        const ring = document.getElementById("igo-tap-ring");
        if (ring) { ring.style.left = x + "px"; ring.style.top = y + "px"; ring.className = "pulse"; ring.style.display = "block"; }
      }, binnenlandInfo);
      await page.waitForTimeout(1200);
      await page.evaluate(() => { const ring = document.getElementById("igo-tap-ring"); if (ring) ring.className = "tap"; });
      await page.waitForTimeout(300);
      await page.mouse.click(binnenlandInfo.x, binnenlandInfo.y);
    }
    await initHelpers(page);
    await page.waitForTimeout(2000); // Wait for Binnenland form to render

    // Clip 4: Fill date, time, and marker
    // TTS: "Vul vervolgens de datum en tijd van de gespeelde dag in. Voer de marker in door iemand op te zoeken of door direct het juiste GSN-nummer in te voeren. Eventuele opmerkingen kunnen ook geplaatst worden."
    await showInstruction(
      page,
      "Vul vervolgens de datum en tijd van de gespeelde dag in. Voer de marker in door iemand op te zoeken of door direct het juiste GSN-nummer in te voeren. Eventuele opmerkingen kunnen ook geplaatst worden."
    );
    logTimestamp(startTime, 4, "Datum en marker");
    await page.waitForTimeout(1000);

    // Fill date (YYYY-MM-DD — HTML5 date input format)
    const dateField = page.locator('input[type="date"]').first();
    await tapElement(page, dateField);
    await dateField.fill(dateStr);
    await page.waitForTimeout(500);

    // Fill time (HH:MM)
    const timeField = page.locator('input[type="time"]').first();
    await tapElement(page, timeField);
    await timeField.fill(timeStr);
    await page.waitForTimeout(500);

    // Search for marker — input is 3rd input on page (after date + time)
    const markerInput = page.locator("input").nth(2);
    await tapElement(page, markerInput);
    await markerInput.pressSequentially("kerk", { delay: 100 });
    await page.waitForTimeout(1000);

    await tapElement(page, page.getByRole("button", { name: /zoeken/i }));
    await page.waitForTimeout(2000);

    // Results appear in .q-list inside the same .col as the Zoeken button.
    // Scope to that col to avoid matching hidden drawer .q-items.
    const markerCol = page
      .locator(".col")
      .filter({ has: page.getByRole("button", { name: /zoeken/i }) });
    await tapElement(page, markerCol.locator(".q-list .q-item").first());
    await page.waitForTimeout(1500);

    // Debug: confirm marker value after selection
    const markerVal = await page.locator("input").nth(2).inputValue().catch(() => "N/A");
    console.log("MARKER VALUE AFTER SELECTION:", markerVal);
    console.log("DATE USED:", dateStr);

    // Clip 5: Qualifying / wedstrijdkaart toggles, then click Baan
    // TTS: "Geef vervolgens aan of het qualifying is en of het een wedstrijdkaart betreft. Als alles ingevuld is, klikt u op 'Baan'."
    await showInstruction(
      page,
      "Geef vervolgens aan of het qualifying is en of het een wedstrijdkaart betreft. Als alles ingevuld is, klikt u op 'Baan'."
    );
    logTimestamp(startTime, 5, "Baan button");
    await page.waitForTimeout(5000);

    await tapElement(page, page.getByRole("button", { name: /baan/i }));
    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Clip 6: Select Noordwijkse from dropdown, click Lus
    // TTS: "Kies via de dropdown de gespeelde baan en klik vervolgens op 'Lus'."
    await showInstruction(
      page,
      "Kies via de dropdown de gespeelde baan en klik vervolgens op 'Lus'."
    );
    logTimestamp(startTime, 6, "Baan dropdown");
    await page.waitForTimeout(1500);

    // Open baan dropdown and wait for it to open
    const baanDropdown = page.locator(".q-select").first();
    await tapElement(page, baanDropdown);
    await page.waitForTimeout(1200);

    // The dropdown opens as a listbox dialog — click the option inside it
    await page.getByRole("listbox").getByText("Noordwijkse", { exact: true }).click();
    await page.waitForTimeout(1000);

    // Debug: confirm baan selected
    const baanVal = await baanDropdown.textContent();
    console.log("BAAN SELECTED:", baanVal?.trim());

    await tapElement(page, page.getByRole("button", { name: /lus/i }));
    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Clip 7: Select lus and afslaanplek
    // TTS: "Klik op de gespeelde lus en geef de afslaanplek aan door op de juiste kleur te klikken."
    await showInstruction(
      page,
      "Klik op de gespeelde lus en geef de afslaanplek aan door op de juiste kleur te klikken."
    );
    logTimestamp(startTime, 7, "Lus en kleur");
    await page.waitForTimeout(2500);

    await tapElement(page, page.getByText("1e 9 holes").first());
    await initHelpers(page);
    await page.waitForTimeout(1000);

    await tapElement(page, page.getByText(/blauw heren/i).first());
    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Clip 8: Review and click Score
    // TTS: "Controleer alle gegevens en klik op 'Score'."
    await showInstruction(page, "Controleer alle gegevens en klik op 'Score'.");
    logTimestamp(startTime, 8, "Score button");
    await page.waitForTimeout(3500);

    // Debug: log all buttons visible on the review page
    const reviewBtns = await page.evaluate(() =>
      Array.from(document.querySelectorAll('button, [role="button"], .q-btn'))
        .map(el => `"${el.textContent?.trim().replace(/\s+/g, " ")}"`)
        .filter(t => t !== '""')
        .join(" | ")
    );
    console.log("REVIEW PAGE BUTTONS:", reviewBtns);

    // Click SCORE — get the button's exact position, show ring, then mouse.click at coordinates
    const scoreBtnInfo = await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll("button"))
        .find(b => b.textContent.trim() === "Score");
      if (!btn) return null;
      const r = btn.getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width, h: r.height, disabled: btn.disabled };
    });
    console.log("SCORE BTN INFO:", JSON.stringify(scoreBtnInfo));

    if (scoreBtnInfo) {
      // Show ring at button coordinates, then use page.mouse.click for reliable interaction
      await page.evaluate(({ x, y }) => {
        const ring = document.getElementById("igo-tap-ring");
        if (ring) { ring.style.left = x + "px"; ring.style.top = y + "px"; ring.className = "pulse"; ring.style.display = "block"; }
      }, scoreBtnInfo);
      await page.waitForTimeout(1200);
      await page.evaluate(() => { const ring = document.getElementById("igo-tap-ring"); if (ring) ring.className = "tap"; });
      await page.waitForTimeout(300);
      await page.mouse.click(scoreBtnInfo.x, scoreBtnInfo.y);
      console.log("SCORE CLICKED VIA MOUSE at", scoreBtnInfo.x, scoreBtnInfo.y);
    }
    await initHelpers(page);

    // Score click: API call (~8s) → "Scorekaart opgeslagen SLUITEN" success toast
    // → wait longer → "Binnenland kaart" score entry page loads with hole-by-hole +/- buttons.
    for (let i = 1; i <= 40; i++) {
      await page.waitForTimeout(1000);
      const bodyText = await page.evaluate(() => document.body.innerText);
      const hasScoreEntry = bodyText.includes("Binnenland kaart") || bodyText.includes("Binnenland Kaart");
      const hasToast = bodyText.includes("opgeslagen") || bodyText.includes("Sluiten") || bodyText.includes("SLUITEN");
      console.log(`${i}s: entry=${hasScoreEntry} toast=${hasToast} | "${bodyText.slice(0, 150).replace(/\n/g, " ")}"`);
      if (hasScoreEntry) { console.log("SCORE ENTRY PAGE LOADED at", i, "s"); break; }
    }
    await initHelpers(page);

    // Clip 9: Score page — show and adjust a few hole scores
    // TTS: "U komt nu op een scherm waar u per hole het aantal gespeelde slagen kunt invullen. De par is al aangepast op basis van uw handicap. Onderaan ziet u het aantal behaalde punten."
    await showInstruction(
      page,
      "U komt nu op een scherm waar u per hole het aantal gespeelde slagen kunt invullen. De par is al aangepast op basis van uw handicap. Onderaan ziet u het aantal behaalde punten."
    );
    logTimestamp(startTime, 9, "Score invoeren");
    await page.waitForTimeout(4000);

    // Log the score entry page to understand +/- button structure
    const scorePageBtns = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button, .q-btn"))
        .map(el => `"${el.textContent?.trim().replace(/\s+/g, " ")}"`)
        .filter(t => t !== '""').slice(0, 20).join(" | ")
    );
    console.log("SCORE PAGE BUTTONS:", scorePageBtns);

    // Find + and - buttons (Quasar round buttons with add/remove icons or +/- text)
    const plusBtns = page.locator(".q-btn").filter({ hasText: "+" });
    const minusBtns = page.locator(".q-btn").filter({ hasText: "-" });
    const plusCount = await plusBtns.count();
    console.log("PLUS BUTTON COUNT:", plusCount);

    if (plusCount > 0) {
      await tapElement(page, plusBtns.nth(0));
      await page.waitForTimeout(400);
      if (await minusBtns.count() > 1) await tapElement(page, minusBtns.nth(1));
      await page.waitForTimeout(400);
      if (plusCount > 2) await tapElement(page, plusBtns.nth(2));
      await page.waitForTimeout(400);
      if (await minusBtns.count() > 3) await tapElement(page, minusBtns.nth(3));
      await page.waitForTimeout(400);
      if (plusCount > 4) await tapElement(page, plusBtns.nth(4));
      await page.waitForTimeout(1500);
    } else {
      console.log("No +/- buttons found — holding on score page");
      await page.waitForTimeout(3000);
    }

    // Clip 10: Save scorecard
    // TTS: "Als alles klopt, klikt u op 'Opslaan' om de scorekaart op te slaan."
    await showInstruction(
      page,
      "Als alles klopt, klikt u op 'Opslaan' om de scorekaart op te slaan."
    );
    logTimestamp(startTime, 10, "Opslaan");
    await page.waitForTimeout(4000);

    // Scroll to bottom to reveal Opslaan button if it's below the fold
    await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));
    await page.waitForTimeout(800);

    // Log what's at bottom of page
    const clip10Btns = await page.evaluate(() =>
      Array.from(document.querySelectorAll("button, .q-btn"))
        .map(el => `"${el.textContent?.trim().replace(/\s+/g, " ")}"`)
        .filter(t => t !== '""').join(" | ")
    );
    console.log("CLIP 10 BUTTONS:", clip10Btns);

    const opslaanBtn = page.getByRole("button", { name: /opslaan/i });
    const opslaanCount = await opslaanBtn.count();
    console.log("OPSLAAN COUNT:", opslaanCount);
    if (opslaanCount > 0) {
      await tapElement(page, opslaanBtn);
      await page.waitForTimeout(3500); // Wait for save to complete
    }

    // Sluiten button (closes score entry view after save)
    const sluitenBtn = page.getByRole("button", { name: /sluiten/i });
    if (await sluitenBtn.count() > 0) {
      await tapElement(page, sluitenBtn.first());
    }
    await page.waitForTimeout(2000);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
