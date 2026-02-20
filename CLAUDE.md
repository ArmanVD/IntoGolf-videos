# IntoGolf — Mobiele Instructievideo's

## Project Overview
Playwright-testscripts voor het automatisch genereren van mobiele instructievideo's voor de IntoGolf golfer-app, inclusief Nederlandse gesproken tekst via ElevenLabs.

## Credentials & URL
Credentials en club-URL worden ingesteld in `tests/mobile-videos/helpers.js`.

## Commands
- **Run video test:** `npx playwright test tests/mobile-videos/<filename>.spec.js --project=chromium`

## Dutch Video Commands
When the user asks for a video in Dutch (e.g. "Ik wil de login video" or "Maak de starttijd boeken video"), map to the corresponding spec file in `tests/mobile-videos/`:

| Dutch command | Spec file |
|---|---|
| login / inloggen | 01-login.spec.js |
| starttijd boeken | 02-starttijd-boeken.spec.js |
| wachtwoord vergeten | 03-wachtwoord-vergeten.spec.js |
| starttijd annuleren | 04-starttijd-annuleren.spec.js |
| wachtwoord aanpassen / wachtwoord wijzigen | 05-wachtwoord-aanpassen.spec.js |
| privéles boeken / priveles boeken | 06-priveles-boeken.spec.js |
| privéles annuleren / priveles annuleren | 07-priveles-annuleren.spec.js |
| baankalender | 08-baankalender-bekijken.spec.js |
| baanstatus | 09-baanstatus-bekijken.spec.js |
| wedstrijd inschrijven | 10-wedstrijd-inschrijven.spec.js |
| wedstrijd uitschrijven | 11-wedstrijd-uitschrijven.spec.js |
| ledenboekje / ledenlijst | 12-ledenboekje.spec.js |
| uitloggen | 13-uitloggen.spec.js |
| ngf kaart / ngf | 14-ngf-kaart.spec.js |
| meerronden | 15-meerronden.spec.js |
| facturen | 16-facturen.spec.js |

## Mobile Instruction Videos

### Video Standards
- **Resolution:** 1080×1920 (Full HD portrait)
- **Device:** iPhone 13 emulation (390×844 viewport)
- **Video codec:** H.264 High profile, CRF 18, preset slow, yuv420p
- **Audio codec:** AAC 192 kbps
- **Voiceover:** ElevenLabs AI (Voice ID: 7qdUFMklKPaaAVMsBTBt, Dutch pronunciation, eleven_multilingual_v2 model, stability: 0.35, similarity_boost: 0.75)
- **Instructions:** Direct action statements (no "Stap één/twee/drie" numbering), Dutch, concise
- **Overlay:** Floating card, bottom 28px, 88% width, rounded corners (14px), blur background, box-shadow, 16px font, fade-in 0.3s, aria-hidden
- **Tap indicator:** Red pulsing ring (60px, rgba(220,40,40,0.95)), 1.2s pre-tap pulse, ripple on tap
- **Hold indicator:** Slower sustained red pulse for full hold duration
- **Pacing:** `startTime = Date.now()` set before page.goto(); wait for key element + 1s pause before first instruction; ~1.5s after action before next instruction
- **Shared helpers:** `tests/mobile-videos/helpers.js` (initHelpers, showInstruction, tapElement, holdElement, logTimestamp, login)
- **Output:** `mobile-videos/*.mp4`

### tests/mobile-videos/01-login.spec.js (3 clips, ~1.2 MB)
- Fill email and password, tap Login, success
- Instructions: "Als u in wilt loggen, komt u op dit scherm. Voer eerst uw e-mailadres en wachtwoord in.", "Klik vervolgens op 'Log in'.", "U bent nu succesvol ingelogd!"

### tests/mobile-videos/02-starttijd-boeken.spec.js (7 clips, 5.7 MB)
- Login silently, open menu, navigate to Starttijden, tap Nieuwe starttijd, press right arrow ×2, select time slot, tap Reserveer, success
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje, hiermee opent u het menu.", "Klik vervolgens op 'Starttijden'.", "Klik nu op 'Nieuwe starttijd'.", "Door boven op de pijltjes te klikken kunt u een nieuwe datum krijgen, of u klikt op de datum zelf om de kalender te openen.", "Wanneer u een datum geselecteerd heeft, kiest u uit de lijst de tijd waarop u wilt starten.", "Vervolgens klikt u op 'Reserveer'.", "U heeft nu succesvol een starttijd geboekt!"
- **Note:** tapElement for all clicks (red ring indicator), initHelpers re-called after each navigation

### tests/mobile-videos/03-wachtwoord-vergeten.spec.js (3 clips, 1.9 MB)
- Navigate to login page, tap "Wachtwoord vergeten", fill email, tap "Verstuur", stay on code entry page until voiceover finishes
- Instructions: "Wanneer u uw wachtwoord vergeten bent...", "Vervolgens vult u uw e-mail in en klikt u op 'Verstuur'.", "U krijgt nu een e-mail met daarin een code..."
- **Note:** No login — starts as unauthenticated user; stays on `#/verifyCode` for clip 3

### tests/mobile-videos/04-starttijd-annuleren.spec.js (6 clips, 3.0 MB)
- Open menu, navigate to Starttijden, tap last booking in list, tap "Annuleer flight", confirm OK, success
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje, hiermee opent u het menu.", "Klik vervolgens op 'Starttijden'.", "Klik nu op de boeking die u wilt annuleren.", "U bent nu op de detail pagina van uw boeking gekomen. Klik op 'Annuleer Flight' om de boeking te annuleren.", "Klik vervolgens op 'Ok' om de annulering te bevestigen.", "U heeft nu succesvol uw starttijd geannuleerd!"
- **Note:** Uses `getByRole("listitem").last()` to select furthest-future booking; `getByText("Annuleer flight", { exact: true })` with `{ force: true }`; dialog confirmed with `getByRole("button", { name: "OK" })`

### tests/mobile-videos/05-wachtwoord-aanpassen.spec.js (7 clips, 3.3 MB)
- Open menu, navigate to Account, hold right arrow until Wachtwoord tab appears, tap Wachtwoord tab, fill new password, fill confirm password, show active save button
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje, hiermee opent u het menu.", "Klik vervolgens op 'Account'.", "Vervolgens houdt u het pijltje naar rechts ingedrukt totdat u het tabblad 'Wachtwoord' ziet verschijnen.", "Klik hierop.", "Voer uw nieuwe wachtwoord in die voldoet aan de eisen.", "Herhaal het wachtwoord nog een keer om te bevestigen en klik vervolgens op 'Wachtwoord opslaan'.", "U heeft nu succesvol uw wachtwoord gewijzigd!"
- **Note:** Save button intentionally NOT clicked to preserve account password; uses `holdElement(page, rightArrow, 1500)` for press-and-hold arrow navigation; `getByRole("tab", { name: "Wachtwoord" })` for tab selection

### tests/mobile-videos/06-priveles-boeken.spec.js (6 clips, 4.3 MB)
- Open menu, navigate to Lessen, tap Privéles, tap date field and fill tomorrow, open Soort les dropdown and select first option, select first time slot, confirm with OK
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje. Hiermee opent u het menu.", "Klik vervolgens op 'Lessen'.", "Nu komt u bij het lessenscherm. Hier kunt u uw geboekte lessen zien en een nieuwe les boeken. Klik op 'Privéles' om een nieuwe les te boeken.", "Vervolgens kiest u de juiste datum en het soort les en klikt u de tijd aan die u wilt reserveren.", "Klik vervolgens op 'Oké' om de reservering te bevestigen.", "U heeft nu succesvol een les geboekt."
- **Note:** Booking only (no cancellation); uses `getByRole("button", { name: "Priveles" })` and `getByRole("combobox", { name: "Soort les" })` for the dropdown

### tests/mobile-videos/07-priveles-annuleren.spec.js (5 clips, 4.0 MB)
- Open menu, navigate to Lessen, tap the last booked lesson (furthest in future), tap "Annuleer les", confirm OK
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Lessen'.", "Nu komt u bij het lessenscherm. Hier kunt u uw geboekte lessen zien en een nieuwe les boeken. Klik op de les die u wilt annuleren.", "Klik vervolgens op 'Annuleer les', en op 'Oké' om te bevestigen.", "U heeft nu succesvol de les geannuleerd."
- **Note:** Silently pre-books a lesson 3 days ahead before recording starts (ensures Annuleer les button is visible); uses `div.row.full-width.filter({ hasText: "Prive les 60 min." }).last()` to select the lesson

### tests/mobile-videos/08-baankalender-bekijken.spec.js (4 clips, 1.9 MB)
- Open menu, navigate to Baankalender, wait for Lus a/Lus b to load, show calendar with date picker and per-baan timetable
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Baankalender'.", "Hiermee opent u de kalender. U kunt bovenin van datum wijzigen indien gewenst.", "Vervolgens ziet u per baan de geboekte tijden staan."
- **Note:** View-only, no interactions; URL check uses `/.*#\/[Bb]aankalender/`; waits for `getByText("Lus a")` before showing clips

### tests/mobile-videos/09-baanstatus-bekijken.spec.js (4 clips, 2.3 MB)
- Open menu, navigate to Baanstatus, show course status overview with Lus a/Lus b and status icon explanation
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Baanstatus'.", "Hier kunt u van alle verschillende banen de huidige status zien.", "De verschillende statussen zijn: een groen vinkje voor ja, een rood kruis voor nee, en een grijze streep voor niet van toepassing."
- **Note:** View-only, no interactions; URL check uses `/.*#\/[Bb]aanstatus/`; waits for `getByText("Lus a")` before showing clips

### tests/mobile-videos/10-wedstrijd-inschrijven.spec.js (5 clips, 3.3 MB)
- Open menu, navigate to Wedstrijden, tap Inschrijven filter, select first available match, click Inschrijven then Opslaan, confirm success
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Wedstrijden'.", "Klik op 'Inschrijven' en kies de gewenste wedstrijd.", "Vervolgens klikt u op 'Inschrijven' en bevestigt u de inschrijving door op 'Opslaan' te klikken.", "U bent nu succesvol ingeschreven voor een wedstrijd."
- **Note:** Silently unenrolls after recording to keep account clean; uses `button:has(span:text("Inschrijven"))` for the filter tab; iterates current + next month if needed; success toast "is verwerkt"

### tests/mobile-videos/11-wedstrijd-uitschrijven.spec.js (5 clips, 5.3 MB)
- Silently pre-enrolls before recording; open menu, navigate to Wedstrijden, tap Ingeschreven filter, select last match, tap Mijn inschrijving, Uitschrijven, confirm OK
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Wedstrijden'.", "Klik op 'Ingeschreven' en klik vervolgens op de wedstrijd waar u zich van wilt uitschrijven.", "Klik vervolgens op 'Mijn inschrijving' en dan op 'Uitschrijven'. Vervolgens bevestigt u de uitschrijving door op 'Ok' te klikken.", "U bent nu succesvol uitgeschreven van de wedstrijd."
- **Note:** Uses `button:has(span:text("Ingeschreven"))` filter; `.last()` on listitem to select most recent enrollment; handles month switch if pre-enrolled in next month

### tests/mobile-videos/12-ledenboekje.spec.js (5 clips, 2.5 MB)
- Open menu, navigate to Ledenboekje (drawer), type first letters of a surname in search box, select a result, show member detail
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Ledenboekje'.", "Zodra u op de pagina bent kunt u zoeken op leden door in de zoekbalk een achternaam in te vullen. Vul minimaal de eerste drie letters van de achternaam in.", "Klik vervolgens op het lid waarvan u meer informatie wilt zien.", "Hier ziet u alle beschikbare informatie."
- **Note:** Drawer item is "Ledenboekje" (page header shows "Ledenlijst"); uses `pressSequentially("ker", { delay: 250 })`; clip 3 wait is 9500ms to allow 8.8s TTS to complete before search action

### tests/mobile-videos/13-uitloggen.spec.js (4 clips, 2.3 MB)
- Open menu, navigate to Account, scroll to Uitloggen button, tap it, confirm redirect to login page
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Account'.", "Om uit te loggen scrolt u naar beneden en klikt u op de 'Uitloggen'-knop.", "U bent nu succesvol uitgelogd."
- **Note:** Drawer item is "Account" (page route is `#/profile`); clip 3 uses `window.scrollBy({ top: 500, behavior: "smooth" })` before tap; overlay repositioned to `bottom: 220px` for clip 3 only so it doesn't cover the Uitloggen button

### tests/mobile-videos/14-ngf-kaart.spec.js (2 clips, ~2.0 MB)
- Open menu, navigate to NGF, show NGF card
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'NGF' om uw NGF-kaart te tonen."
- **Note:** View-only; drawer item is "NGF" (exact); TTS uses "N-G-F" for correct letter-by-letter pronunciation

### tests/mobile-videos/15-meerronden.spec.js (5 clips, ~5.5 MB)
- Open menu, navigate to Meerronden, tap first klassement, show tussenstand with horizontal scroll, then show birdie klassement with horizontal scroll
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Meerronden'.", "U ziet nu een overzicht van alle beschikbare klassementen en groepen. Klik op het klassement of de groep waarvan u de stand wilt bekijken.", "Het bovenste overzicht toont de tussenstand van de competitie met het totale aantal behaalde punten per ronde.", "Het onderste overzicht is het birdie klassement. Hierin ziet u hoeveel eagles, birdies, pars, bogeys en dubbel bogeys iedere speler heeft gescoord."
- **Note:** Clip 4 overlay at bottom, clip 5 overlay repositioned to top (`overlay.style.top = "28px"`); uses custom `scrollHorizontal` helper with ease-in-out cubic (2s right + 2s back) on DOM-ordered scrollable containers (index 0 = tussenstand, index 1 = birdie); page scrolls down between clip 4 and 5

### tests/mobile-videos/16-facturen.spec.js (3 clips, ~2.2 MB)
- Open menu, navigate to Facturen, show invoice list, tap first invoice to download
- Instructions: "Wanneer u ingelogd bent, start u op het dashboard. Klik linksboven op het menu-icoontje om het menu te openen.", "Klik vervolgens op 'Facturen'.", "U ziet nu een overzicht van al uw facturen. Klik op de factuur die u wilt downloaden om deze te downloaden."
- **Note:** Drawer item is "Facturen" (exact); uses `getByRole("listitem").first()` to tap first invoice
