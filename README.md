## Cold Kindred

A single-player, browser-based cold case investigation game inspired by the Golden State Killer investigation. The game simulates a multi-generation US population, injects a murder, and challenges the player to use DNA genealogy plus detective work to identify the killer.

### Vision (current)
- Year-by-year US population simulation (1900–2025) with founders backdated to 1865–1895 to create early-1900 births.
- Model marriages, non-married partnerships, births (incl. out-of-wedlock and affair-born), moves, jobs, retirement, and deaths with era-aware mortality (war risks for combat-age men).
- Cremation/burial modeled with era-appropriate probabilities; per-city graveyards with shared plots and lookups.
- Murder injected (1970–2000); killer/victim selected with close-kin bans; narrative overlays and generated killer moniker.
- DNA systems: CODIS and consumer DNA databases with increased modern adoption; close-kin bans; guaranteed distant (blood) relative if none found.
- Player tools: map/airport travel, newspaper archives, public records, CODIS, graveyard, evidence locker, resident interviews, and a knowledge-limited Connections graph.

### Tech Stack
- Vanilla JS + Vite for dev/build
- HTML/CSS UI (framework-agnostic; could evolve later)
- `localStorage` for save; IndexedDB possible later
- Cloudflare Pages for hosting static `dist/`

### Project Structure
```
.
├─ index.html          # App shell
├─ src/
│  ├─ main.js          # Entry point
│  ├─ style.css        # Styles (UI, newspaper, spinner, mobile menu)
│  └─ newsStories.js   # Global news stories (1900–2025) { title, body }
├─ package.json        # Scripts and dependencies
└─ dist/               # Production build output (generated)
```

### Scripts
- `npm run dev` – start dev server
- `npm run build` – build production assets to `dist/`
- `npm run preview` – preview built app locally

### Simulation Highlights
- Founders: 765 with unique surnames; traits (skin tone, hair) region-weighted and heritable.
- Fertility (per mother birth cohort):
  - <1910: 5–7; 1910–1944: 4–6; 1945–1964: 3.75–5.25; 1965–1984: 2.4–3.2; 1985+: 1.7–2.5
  - Partnerships: 0.85× before 1950; 0.75× after
- Marriage rates: very high early generations (~0.95), taper for later cohorts.
- Jobs: period-appropriate; job-change events skip retirees.
- Events: all linked to cityId; family units move together; marriages only within same city.
- Deaths: cause of death (age/year-aware), exact dates; burials assign plots, survivors/predeceased tracked for obits.

### Cities
- Trimmed for density: New York, Los Angeles, Chicago, Houston, Phoenix, Philadelphia, San Diego, San Francisco, Seattle, Portland, Miami, Atlanta, New Orleans, Denver, Salt Lake City, Oklahoma City, St. Louis, Minneapolis.

### DNA & CODIS
- Consumer DNA: probability increases after 1990 (higher modern adoption).
- CODIS: rare LE profiles yearly; killer moniker and victim added upon testing evidence (current year).
- Matches: CODIS search shows only profiles in CODIS; close-kin bans applied; forced distant blood relative guaranteed if none present.
- Moniker: killer has a separate moniker profile sharing DNA with the real person (100% match).

### UI / UX
- Overlays: Simulation feed and title card with generated case narrative.
- Tabs: Evidence, Records (city/year/letter filters; inline add), Graveyard (plot lookup), CODIS (spinner + results; inline 🧬 add), Airport/Map (travel with animation), Connections (knowledge-limited graph), Newspaper (city masthead with UnifrakturMaguntia; global lead; births/marriages/obits with inline 💍 add).
- Mobile: hamburger menu toggles full-screen sidebar.
- Interviews: resident search with typeahead; simple greeting loop; conversations persisted.

### Save/Load
- State saved under a namespaced key, e.g. `ck:v1:save:<slot>`.
- Include a schema version for migrations.

### Milestones
- M1: Core scaffolding (current), landing screen, deterministic seed.
- M2: Population generator with five generations and cities.
- M3: Crime injection + DNA sampling; intro scene.
- M4: DNA matching UI and relative hints; records search.
- M5: Family tree visualization and map view.
- M6: Interview mechanics and outcome logic.
- M7: Balancing, narrative polish, PWA/offline save.

### Development
- Run `npm run dev` and open the printed URL.
- Edit `src/main.js` and `src/style.css`; HMR applies updates.

### Deploying to Cloudflare Pages
1. Build locally or in CI: `npm run build` (outputs to `dist/`).
2. In Cloudflare Pages settings:
   - Build command: `npm run build`
   - Output directory: `dist`
   - Node version: optional pin

### Future Enhancements
- Switch to IndexedDB for larger saves.
- Seedable PRNG for reproducible worlds.
- Save export/import.
- PWA installability and background save.


