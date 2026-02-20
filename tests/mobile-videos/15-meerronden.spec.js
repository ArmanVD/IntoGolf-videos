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

test.describe("Meerronden bekijken (Mobile)", () => {
  test("should demonstrate viewing meerronden standings", async ({ page }) => {
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

    // Clip 2: Tap Meerronden from drawer
    // TTS: "Klik vervolgens op 'Meerronden'."
    await showInstruction(page, "Klik vervolgens op 'Meerronden'.");
    logTimestamp(startTime, 2, "Meerronden in menu");
    await page.waitForTimeout(500);

    const meerrondenItem = page
      .locator(".q-drawer")
      .getByText("Meerronden", { exact: true });
    await tapElement(page, meerrondenItem, { force: true });

    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Clip 3: Overview of klassementen — tap first item
    // TTS: "U ziet nu een overzicht van alle beschikbare klassementen en groepen. Klik op het klassement of de groep waarvan u de stand wilt bekijken."
    await showInstruction(
      page,
      "U ziet nu een overzicht van alle beschikbare klassementen en groepen. Klik op het klassement of de groep waarvan u de stand wilt bekijken."
    );
    logTimestamp(startTime, 3, "Meerronden overzicht");
    await page.waitForTimeout(5000);

    const firstItem = page.getByRole("listitem").first();
    await tapElement(page, firstItem);

    await initHelpers(page);
    await page.waitForTimeout(1500);

    // Helper: slow custom-eased horizontal scroll on a container by DOM index
    const scrollHorizontal = (index, dist, dur) =>
      page.evaluate(
        ({ index, dist, dur }) => {
          const scrollables = Array.from(document.querySelectorAll("*")).filter((el) => {
            const s = window.getComputedStyle(el);
            return (s.overflowX === "scroll" || s.overflowX === "auto") && el.scrollWidth > el.clientWidth + 10;
          });
          const el = scrollables[index];
          if (!el) return;
          const start = el.scrollLeft;
          const t0 = performance.now();
          function step(t) {
            const p = Math.min((t - t0) / dur, 1);
            const e = p < 0.5 ? 2 * p * p : -1 + (4 - 2 * p) * p;
            el.scrollLeft = start + dist * e;
            if (p < 1) requestAnimationFrame(step);
          }
          requestAnimationFrame(step);
        },
        { index, dist, dur }
      );

    // Clip 4: Top overview (tussenstand) — overlay at bottom, scroll top container
    // TTS: "Het bovenste overzicht toont de tussenstand van de competitie met het totale aantal behaalde punten per ronde."
    await showInstruction(
      page,
      "Het bovenste overzicht toont de tussenstand van de competitie met het totale aantal behaalde punten per ronde."
    );
    logTimestamp(startTime, 4, "Bovenste overzicht");
    await page.waitForTimeout(1000);

    await scrollHorizontal(0, 250, 2000);
    await page.waitForTimeout(2200);
    await scrollHorizontal(0, -250, 2000);
    await page.waitForTimeout(2200);

    // Hold for remaining TTS (~5.5s total, used ~5.4s)
    await page.waitForTimeout(500);
    await hideInstruction(page);
    await page.waitForTimeout(300);

    // Scroll page down to birdie klassement before showing next clip
    await page.evaluate(() => window.scrollBy({ top: 350, behavior: "smooth" }));
    await page.waitForTimeout(1000);

    // Clip 5: Bottom overview (birdie klassement) — overlay at top
    // TTS: "Het onderste overzicht is het birdie klassement. Hierin ziet u hoeveel eagles, birdies, pars, bogeys en dubbel bogeys iedere speler heeft gescoord."
    await page.evaluate(() => {
      const overlay = document.getElementById("igo-instruction");
      if (!overlay) return;
      overlay.style.bottom = "auto";
      overlay.style.top = "28px";
    });
    await showInstruction(
      page,
      "Het onderste overzicht is het birdie klassement. Hierin ziet u hoeveel eagles, birdies, pars, bogeys en dubbel bogeys iedere speler heeft gescoord."
    );
    logTimestamp(startTime, 5, "Onderste overzicht");
    await page.waitForTimeout(1000);

    await scrollHorizontal(1, 250, 2000);
    await page.waitForTimeout(2200);
    await scrollHorizontal(1, -250, 2000);
    await page.waitForTimeout(2200);

    // Hold for remaining TTS (~7.5s total, used ~7.4s)
    await page.waitForTimeout(2500);

    await hideInstruction(page);
    await page.waitForTimeout(500);
  });
});
