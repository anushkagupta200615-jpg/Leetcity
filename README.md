# LeetCity 🏙️

**Your LeetCode grind, rendered as an explorable 3D city.**

Type any public LeetCode username and LeetCity procedurally generates a neon,
pixel-art city from that profile — topics become districts, every solved problem
becomes a building, difficulty drives height and color, and your contest rating
rises as a glowing central spire. Built for the competitive-programming crowd.

> No login. No backend required. Runs entirely in the browser against LeetCode's
> public GraphQL data, with a built-in demo city that needs no network at all.

---

## ✨ Features

**Your city**
- Topics → **districts**, each solved problem → a **building** (height & color = difficulty: 🟩 Easy / 🟨 Medium / 🟥 Hard)
- Contest rating → a **central spire** with a pulsing beacon
- **Empty lots** mark weak/unsolved core topics — the "what to grind next" insight — linking straight to that topic's problem set
- Click any building to inspect its district; a floating **stats card** shows solved counts, acceptance %, global rank, streak, and earned **trophies**
- Procedural **lit windows** (GPU shader), **bloom**, **stars**, **fog**, **vignette**, district floor pads, and a **share-card** PNG export

**🌍 World**
- A shared world where every user stands on a plot derived **deterministically from their username hash** — the same spot for everyone, no server needed
- Populated with **clickable citizens**: every building is a profile you can open and then *explore their full city*; the tallest towers are genuinely the strongest solvers
- A "you are here" spotlight beam marks your own tower

**👥 Versus**
- Your city plus 3–5 others side by side; a 👑 crown tags the **Tallest Tower**

**🏁 DSA Race**
- A live race panel: solve the shown problem first for the most points (10 / 7 / 5 / 3 / 2), with a live leaderboard and simulated opponents — open a second tab to race for real via `BroadcastChannel`

**Chrome**
- 6 color **themes** (Classic, Matrix, Noir, Aurora, Ocean, Gold) · **day / night** toggle · retro pixel HUD with glassmorphism · deterministic per-username (same input → same city)

---

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Language | **TypeScript** |
| Build tool | **Vite** |
| UI | **React 19** |
| 3D engine | **Three.js** via **@react-three/fiber** (R3F) |
| 3D helpers | **@react-three/drei** (OrbitControls, Text, Billboard, Stars, Grid) |
| Post-processing | **@react-three/postprocessing** (Bloom, Vignette) |
| State | **Zustand** |
| Data source | LeetCode **GraphQL** (`leetcode.com/graphql`, unofficial) |
| Dev proxy / prod API | Vite dev proxy + a **Vercel Edge Function** (`/api/leetcode`) |
| Persistence | Browser **localStorage** (per-user cache, saved towers, race totals) |
| Styling | Hand-written CSS (pixel + glassmorphism), Press Start 2P / JetBrains Mono |

---

## 🗺️ Architecture

```
                          ┌────────────────────────────────────────────┐
                          │                 BROWSER                     │
                          │                                             │
  username ──▶  UsernameForm ──▶  Zustand store  ◀──▶  localStorage     │
                          │        (state hub)         (cache · towers  │
                          │            │                · race totals)  │
                          │            ▼                                │
                          │     lib/leetcode.ts ──POST──┐               │
                          │     (fetch + 1h cache)       │              │
                          │            │                 │              │
                          │            ▼                 │              │
                          │     CityData (normalized)    │              │
                          │       │        │             │              │
                          │       ▼        ▼             │              │
                          │  cityLayout   roster/world   │              │
                          │  (districts,  (plots, NPCs,  │              │
                          │   buildings)   neighborhood) │              │
                          │       │        │             │              │
                          │       ▼        ▼             │              │
                          │   ┌──────── Scene (R3F Canvas) ─────────┐   │
                          │   │  City · World · Neighborhood        │   │
                          │   │  Buildings(InstancedMesh+shader)    │   │
                          │   │  Bloom · Vignette · Stars · Fog     │   │
                          │   └─────────────────────────────────────┘  │
                          │       ▲                                     │
                          │       │ HUD overlay (DOM, outside canvas)   │
                          │   StatsOverlay · Controls · InfoPanel ·     │
                          │   WorldPanel · RacePanel · ShareButton      │
                          └───────────────┬─────────────────────────────┘
                                          │ /api/leetcode  (CORS-safe)
                                          ▼
                        ┌──────────────────────────────────┐
                        │  Vercel Edge Fn  (prod)           │
                        │  Vite proxy      (dev)            │
                        │        │                          │
                        │        ▼                          │
                        │  leetcode.com/graphql (unofficial)│
                        └──────────────────────────────────┘
```

**Key ideas**

- **One normalized model.** All LeetCode-specific query logic lives in
  `lib/leetcode.ts` + the proxy and is normalized into a single `CityData`
  shape. Nothing downstream (layout, scene, HUD) ever touches raw API fields, so
  a LeetCode change is a one-file fix.
- **CORS is handled at the edge.** The browser can't call `leetcode.com/graphql`
  directly, so all requests go through the Vite dev proxy (local) or the Vercel
  Edge Function (prod), which add the required headers and cache responses.
- **Deterministic everything.** A seeded PRNG (`lib/seed.ts`, FNV-1a +
  mulberry32) means the same username always yields the same city, the same
  world plot, and the same synthetic citizens — no backend needed for a
  "shared" world.
- **Rendering is instanced.** Every building in a city (and every citizen in the
  world) is drawn in a single `InstancedMesh` with a patched `MeshStandardMaterial`
  shader for windows — thousands of buildings at 60fps.

---

## 📁 Project structure

```
api/leetcode.ts          Vercel Edge Function — CORS-safe GraphQL proxy (prod)
vite.config.ts           Dev proxy for the same /api/leetcode path
src/
  types.ts               CityData, CityLayout, StoredTower, Selection …
  store.ts               Zustand store — data, mode, theme, towers, roster, race
  lib/
    leetcode.ts          GraphQL query + normalize + 1h cache + demo profile
    cityLayout.ts        Districts (spiral packing), buildings, empty lots
    world.ts             Plot placement (Ulam spiral), tower stats, city rank
    roster.ts            Versus roster, synthetic cities, world NPC citizens
    race.ts              DSA Race — problems, points, bots, BroadcastChannel
    seed.ts              Deterministic PRNG (FNV-1a + mulberry32)
    themes.ts            6 color themes + day/night shading
    trophies.ts          Achievement chips derived from stats
  scene/
    Scene.tsx            Canvas, lights, fog, camera rig, post-processing
    City.tsx             District city + pads + labels + empty lots
    Buildings.tsx        Instanced buildings + window/edge shader
    Landmark.tsx         Contest-rating spire
    Ground.tsx           Ground plane + grid
    World.tsx            Shared world: your tower, clickable citizens, monument
    Neighborhood.tsx     Versus mode: several cities side by side + crown
  ui/                    UsernameForm, StatsOverlay, Controls, InfoPanel,
                         WorldPanel, RacePanel, ShareButton
public/fonts/label.ttf   Bundled 3D label font (no CDN dependency)
```

---

## 🚀 Getting started

```bash
npm install
npm run dev
```

Open http://localhost:5173, enter a LeetCode username (or click **explore a demo
city** — no network needed). In dev, `vite.config.ts` proxies `/api/leetcode` →
`leetcode.com/graphql` with the right headers, so CORS is a non-issue.

```bash
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
```

---

## ☁️ Deployment

### Vercel (Recommended)
This project is optimized for deployment on Vercel. Upon pushing the repository to Vercel, the application will function out-of-the-box. The `api/leetcode.ts` file is automatically detected and deployed as a Vercel Edge Function. This function mirrors the `/api/leetcode` path utilized by the local development proxy and includes built-in 1-hour edge caching for optimal performance.

### Alternative Hosting Platforms
If you choose to deploy on an alternative static hosting provider, please ensure the following:
1. Deploy the compiled `dist/` directory.
2. Implement a custom proxy server that securely forwards POST requests to `leetcode.com/graphql`.
3. Ensure the proxy includes the required `Referer: https://leetcode.com` HTTP header to comply with CORS policies.

---

## ⚠️ Notes & limits

- Uses LeetCode's **unofficial** GraphQL API — field names can change without
  notice; all such logic is isolated in `lib/leetcode.ts` + the proxy.
- Cities are built from **aggregate tag counts** (one cheap query), not a
  paginated per-problem list — visually identical, far cheaper.
- The **shared world & citizens are local/synthetic for now**: plots are the
  same for everyone (deterministic), but the population you see is generated
  client-side. A real cross-device population is the natural backend step
  (e.g. Supabase). Likewise, DSA Race opponents are simulated in v1.
- Private or unknown profiles show a friendly error; type `demo` for the sample.

---

## 🧭 Roadmap

- Real shared backend (Supabase) so the world population and race are truly
  cross-device
- Free-flight / drive-through camera
- README-embeddable SVG skyline
- Company-tag overlays and gap-based "solve these next" recommendations
- Compare mode deep-dive, seasonal district events, achievement unlocks

---

*Unofficial fan project. Not affiliated with LeetCode. Data comes from public
LeetCode profiles.*
