## Cold Kindred

A single-player, browser-based cold case investigation game inspired by the Golden State Killer investigation. The game simulates a multi-generation US population, injects a murder, and challenges the player to use DNA genealogy plus detective work to identify the killer.

### Vision
- Procedurally generate five generations from ~200 founders (100 men, 100 women).
- Model marriages, births (including affairs), moves between cities, and deaths.
- Choose murderer and victim(s) mid-simulation; store year, location, modus operandi.
- Randomly sample non-murderers who submit DNA to a consumer database.
- Let the player use tools (DNA queries, interviews, records search, map, family tree) to triangulate via relatives (e.g., “second cousin match: John Brown, Chicago, b. 1966”).
- Persist game state to `localStorage` on the player’s device.

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
│  └─ style.css        # Base styles
├─ package.json        # Scripts and dependencies
└─ dist/               # Production build output (generated)
```

### Scripts
- `npm run dev` – start dev server
- `npm run build` – build production assets to `dist/`
- `npm run preview` – preview built app locally

### Gameplay Outline
1. Population Simulation (G0 → G4)
   - Founders: ~100 men, ~100 women.
   - Lifecycle: pairings/marriages, births (incl. out-of-wedlock), moves, deaths.
   - Geography: US cities with migration probabilities.
2. Crime Injection
   - Choose murderer and victim(s) in G2–G3.
   - Store year, city, MO, starting clues.
3. DNA Database Sampling
   - Random sample of non‑murderers submit DNA; store identifiers and kinship links.
4. Player Experience
   - Intro narrative with generated case title.
   - Tools: DNA match search, map view, family tree, records, interviews (consent/refusal), request DNA.
   - Goal: identify the murderer and support with evidence.

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


