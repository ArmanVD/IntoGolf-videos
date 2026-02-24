# IntoGolf Mobiele Instructievideo's — Handleiding

In deze handleiding staat hoe u instructievideo's kunt maken voor uw golfclub via de IntoGolf golfer-app, met behulp van Claude Code in VSCode.

---

## Eenmalige installatie

### 1. Benodigde tools installeren

```bash
# Node.js (v18 of hoger) — https://nodejs.org

# Na het clonen/openen van het project:
npm install
npx playwright install chromium

# FFmpeg — macOS
brew install ffmpeg

# FFmpeg — Windows
# Download via https://ffmpeg.org/download.html en voeg toe aan PATH
```

### 2. ElevenLabs API-sleutel aanmaken

1. Maak een gratis account aan op [elevenlabs.io](https://elevenlabs.io)
2. Ga naar **Profile → API Keys** en kopieer uw sleutel
3. Stel de sleutel in als omgevingsvariabele:

```bash
# macOS/Linux — voeg toe aan ~/.zshrc of ~/.bashrc:
export ELEVENLABS_API_KEY="uw_sleutel_hier"

# Windows — uitvoeren in PowerShell:
$env:ELEVENLABS_API_KEY="uw_sleutel_hier"
```

### 3. Clubgegevens instellen

Open `tests/mobile-videos/helpers.js` en pas deze 3 regels bovenaan het bestand aan:

```javascript
const LOGIN_URL = "https://UW-CLUB.golfer.intogolf.nl/#/login"; // ← uw club-URL
const EMAIL     = "uw@email.com";                                // ← uw e-mailadres
const PASSWORD  = "UwWachtwoord";                                // ← uw wachtwoord
```

> **Let op:** verander alleen de tekst tussen de aanhalingstekens `""`. Verwijder de aanhalingstekens zelf niet.

> De app gebruikt automatisch de kleuren en huisstijl van uw club in de opname.

### 4. Claude Code installeren in VSCode

1. Open VSCode
2. Ga naar Extensions, zoek op **Claude Code** en installeer
3. Meld u aan met uw Anthropic-account
4. Open deze projectmap in VSCode

---

## Video's maken

Open Claude Code in VSCode en zeg welke video u wilt:

> "Ik wil de login video."

> "Ik wil de starttijd boeken video."

> "Ik wil de wachtwoord vergeten video."

Claude voert de test uit, neemt het scherm op, genereert de Nederlandse gesproken tekst en levert de uiteindelijke video op. De videokwaliteit, steminstelling, ondertitelopmaak en tikanimaties worden automatisch afgehandeld.

---

## Beschikbare video's

| Zeg dit | Video |
|---|---|
| "Ik wil de **login** video" | 01 — Inloggen |
| "Ik wil de **starttijd boeken** video" | 02 — Starttijd boeken |
| "Ik wil de **wachtwoord vergeten** video" | 03 — Wachtwoord vergeten |
| "Ik wil de **starttijd annuleren** video" | 04 — Starttijd annuleren |
| "Ik wil de **wachtwoord aanpassen** video" | 05 — Wachtwoord aanpassen |
| "Ik wil de **privéles boeken** video" | 06 — Privéles boeken |
| "Ik wil de **privéles annuleren** video" | 07 — Privéles annuleren |
| "Ik wil de **baankalender** video" | 08 — Baankalender bekijken |
| "Ik wil de **baanstatus** video" | 09 — Baanstatus bekijken |
| "Ik wil de **wedstrijd inschrijven** video" | 10 — Wedstrijd inschrijven |
| "Ik wil de **wedstrijd uitschrijven** video" | 11 — Wedstrijd uitschrijven |
| "Ik wil de **ledenboekje** video" | 12 — Ledenboekje bekijken |
| "Ik wil de **uitloggen** video" | 13 — Uitloggen |
| "Ik wil de **ngf kaart** video" | 14 — NGF kaart bekijken |
| "Ik wil de **meerronden** video" | 15 — Meerronden bekijken |
| "Ik wil de **facturen** video" | 16 — Facturen bekijken |
| "Ik wil de **berichten** video" | 17 — Berichten bekijken |
| "Ik wil de **scorekaart binnenland** video" | 18 — Scorekaart binnenland invullen |
| "Ik wil de **scorekaart buitenland** video" | 19 — Scorekaart buitenland invullen |

De afgewerkte video verschijnt in de map `mobile-videos/`.

---

## Technische referentie (voor Claude)

Het volgende is uitsluitend bedoeld als referentie voor Claude.

### Video standards
- Resolution: 1080×1920, H.264 High, CRF 18, preset slow, yuv420p, AAC 192kbps
- Device: iPhone 13, viewport 390×844, `video: "on"`, `test.setTimeout(200000)`

### Dutch video commands
When the user says any of the following (Dutch or English), map to the corresponding spec file:

| Dutch command | English equivalent | Spec file |
|---|---|---|
| login / inloggen | login | 01-login.spec.js |
| starttijd boeken | book tee time | 02-starttijd-boeken.spec.js |
| wachtwoord vergeten | forgot password | 03-wachtwoord-vergeten.spec.js |
| starttijd annuleren | cancel tee time | 04-starttijd-annuleren.spec.js |
| wachtwoord aanpassen / wachtwoord wijzigen | change password | 05-wachtwoord-aanpassen.spec.js |
| privéles boeken / priveles boeken | book private lesson | 06-priveles-boeken.spec.js |
| privéles annuleren / priveles annuleren | cancel private lesson | 07-priveles-annuleren.spec.js |
| baankalender | course calendar | 08-baankalender-bekijken.spec.js |
| baanstatus | course status | 09-baanstatus-bekijken.spec.js |
| wedstrijd inschrijven | enroll in match | 10-wedstrijd-inschrijven.spec.js |
| wedstrijd uitschrijven | cancel match enrollment | 11-wedstrijd-uitschrijven.spec.js |
| ledenboekje / ledenlijst | member list | 12-ledenboekje.spec.js |
| uitloggen | log out | 13-uitloggen.spec.js |
| ngf kaart / ngf | NGF card | 14-ngf-kaart.spec.js |
| meerronden | multi-rounds | 15-meerronden.spec.js |
| facturen | invoices | 16-facturen.spec.js |
| berichten | messages | 17-berichten.spec.js |
| scorekaart binnenland / scorekaart invullen | domestic scorecard | 18-scorekaart-binnenland.spec.js |
| scorekaart buitenland | foreign scorecard | 19-scorekaart-buitenland.spec.js |

### ElevenLabs TTS
- Voice ID: `7qdUFMklKPaaAVMsBTBt`, model: `eleven_multilingual_v2`
- Stability: `0.35`, similarity_boost: `0.75`
- Pre-normalize every clip with `loudnorm=I=-16:TP=-1.5:LRA=11` before merging — do NOT inline in filter_complex (causes "Invalid argument" with AAC muxer)

### FFmpeg video encode
```bash
ffmpeg -i input.webm \
  -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black" \
  -c:v libx264 -preset slow -crf 18 -profile:v high -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart output-base.mp4
```

### FFmpeg audio merge (use *-norm.mp3 files, not originals)
```bash
ffmpeg -i base.mp4 -i clip-01-norm.mp3 -i clip-02-norm.mp3 \
  -filter_complex "[1:a]adelay=T1_MS|T1_MS,volume=1.0[a1];[2:a]adelay=T2_MS|T2_MS,volume=1.0[a2];[a1][a2]amix=inputs=2:duration=longest:normalize=0[aout]" \
  -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k -ac 2 -movflags +faststart output.mp4
```

### Timing rule
```
clip_end_ms = start_ms + duration_ms
if clip_end_ms > next_start_ms → push next_start_ms = clip_end_ms + 500
```

### Test patterns
- `startTime = Date.now()` as the very first line (before `login` or `page.goto`)
- Call `initHelpers(page)` after every navigation
- Use `tapElement(page, locator)` for all clicks (shows red ring indicator)
- Use `holdElement(page, locator, 1500)` for press-and-hold
- Use `{ force: true }` for Quasar drawer items
- Wrap post-navigation `initHelpers` in `try/catch` if navigation is uncertain
- When running an existing spec file for a new club, replace any hardcoded credentials or URLs with the credentials from helpers.js
