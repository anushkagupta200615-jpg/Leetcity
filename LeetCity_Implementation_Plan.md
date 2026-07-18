# LeetCity — Implementation Plan

*A GitCity-style 3D city generated from anyone's LeetCode profile.*

---

## 1. Concept

GitCity turns a git repository into an explorable 3D city — files become buildings, folders become districts, and the skyline is a shareable portrait of the repo. **LeetCity** does the same for a LeetCode profile: you type in a username and get a procedurally generated city that visualizes how much and what kind of problem-solving that person has done.

The whole product is one screen: an input box, a 3D city, and a "share / download image" button. That's the thing people screenshot and post — which is exactly why GitCity spread.

### The mapping (the design language)

This is the heart of the project. Everything the city shows must map to a real LeetCode data point:

| City element | LeetCode data | Meaning |
|---|---|---|
| **District / neighborhood** | Topic tag (DP, Graphs, Arrays, Two Pointers, …) from skill stats | Which areas you've invested in |
| **District size** | Number of problems solved in that tag | Bigger district = more grinding on that topic |
| **Building** | One solved problem (or a bundle of N problems if per-problem data is unavailable) | A single unit of work |
| **Building height** | Difficulty — Easy = low-rise, Medium = mid, Hard = skyscraper | A skyline full of towers = a Hard-solver |
| **Building color** | Difficulty, using LeetCode's own palette (green / amber / red) | Instant readability |
| **Central landmark tower** | Contest rating | The taller the spire, the higher the rank |
| **Street lighting / lit windows** | Recent activity from the submission calendar | A "living" city means recent streaks |
| **Total city footprint** | Total problems solved | Overall scale at a glance |

### Alternative scopes (if the full city is too much for v1)

- **Grind Wrapped card** — a single Spotify-Wrapped-style shareable image. No 3D, highest virality-per-effort. Good warm-up or fallback.
- **Skill tree** — topics as an unlockable tech tree. Lighter than a city, same data.
- **Growing garden** — each problem is a plant; difficulty picks the species. Cozier aesthetic, same data.

The plan below targets the full city, but Phase 1 deliberately ships something close to the Wrapped card so there's value early.

---

## 2. Data sources

LeetCode has **no official public API**, but a well-known unofficial GraphQL endpoint exists and every user's public profile is queryable by username.

### Option A — Direct GraphQL (recommended for control)

- **Endpoint:** `https://leetcode.com/graphql`
- **Method:** `POST` with a JSON body `{ query, variables }`
- **Blocker:** the browser cannot call this directly — LeetCode returns CORS errors and often needs a `Referer` header. **You must call it from a server / serverless function**, never straight from the React app.

Key queries (verify exact field names during build — LeetCode changes them occasionally):

- **Solved-by-difficulty:** `matchedUser(username:) { submitStatsGlobal { acSubmissionNum { difficulty count } } }`
- **Per-tag / skill stats:** `matchedUser(username:) { tagProblemCounts { advanced { tagName problemsSolved } intermediate {...} fundamental {...} } }` — this drives the districts.
- **Submission calendar:** `matchedUser(username:) { userCalendar { submissionCalendar streak } }` — drives lighting/recency.
- **Contest rating:** `userContestRanking(username:) { rating globalRanking topPercentage }` — drives the landmark tower.
- **Profile / avatar:** `matchedUser(username:) { profile { realName userAvatar ranking } }`

### Option B — Community wrapper API (fastest to prototype)

`alfa-leetcode-api` (open source, self-hostable) exposes clean REST routes that proxy the GraphQL above and sidestep CORS/headers:

- `/:username/solved` — counts by difficulty
- `/:username/skill` — skill/tag stats → districts
- `/:username/calendar` — submission calendar → lighting
- `/:username/contest` — contest rating → landmark
- `/:username/profile` — everything in one call

It has rate limiting, so **self-host your own instance** (it's a small Node app) rather than depending on the public one for production.

**Recommendation:** prototype against Option B to move fast, then either keep a self-hosted instance or fold the two or three GraphQL queries you actually need into your own proxy (Option A) for reliability. Either way, **cache aggressively** — a username's stats don't change minute to minute.

---

## 3. Tech stack

- **Framework:** React + TypeScript + Vite
- **3D:** Three.js via **react-three-fiber** (R3F) + **@react-three/drei** (camera controls, environment, helpers) — same engine GitCity uses, but with React ergonomics
- **State:** lightweight — Zustand or React context (no Redux needed)
- **Proxy / backend:** a single serverless function (Vercel Functions or Cloudflare Workers) that fetches from LeetCode and returns normalized JSON, with an in-memory / KV cache (e.g. 1-hour TTL per username)
- **Image export:** `renderer.domElement.toDataURL()` (canvas → PNG) behind a "Download" button; optionally `gif.js` for an orbiting animation
- **Styling:** Tailwind or plain CSS modules — the UI is minimal
- **Deploy:** Vercel or Cloudflare Pages (frontend + function in one repo)

---

## 4. Architecture & data flow

```
[ Browser: React + R3F ]
        |  username
        v
[ Serverless proxy /api/city?user=xxx ]
        |  (cache check)
        v
[ LeetCode GraphQL  OR  self-hosted alfa-leetcode-api ]
        |  raw stats
        v
[ Proxy normalizes -> CityData JSON ]  --cache-->
        |
        v
[ Client: procedural generator -> scene graph -> Three.js render ]
```

Keep all LeetCode-specific query logic in the proxy. The client only ever sees your own clean `CityData` shape, so if LeetCode changes a field you fix it in one place.

### Normalized data contract

```ts
interface CityData {
  username: string;
  avatarUrl: string;
  totals: { easy: number; medium: number; hard: number; all: number };
  topics: Array<{               // one district each
    tag: string;                // "dynamic-programming"
    label: string;              // "Dynamic Programming"
    solved: number;             // district size / building count
    level: 'fundamental' | 'intermediate' | 'advanced';
  }>;
  contest?: { rating: number; globalRanking: number; topPercentage: number };
  calendar: Record<string, number>;  // epoch-day -> submission count
  streak: number;
  fetchedAt: string;
}
```

### Procedural city generation (client side)

1. **Lay out districts.** Treat each topic as a district; pack them on a grid or spiral, sized by `solved`. Use a deterministic seed derived from the username so the same user always gets the same city.
2. **Fill a district with buildings.** For each district, instantiate `solved` buildings (cap + summarize very large counts, e.g. one building per problem up to ~200, then scale). Assign each building a difficulty by distributing the district's easy/medium/hard mix.
3. **Style each building.** Height from difficulty (+ small deterministic jitter so it looks organic), color from difficulty, window emissiveness from whether the user was active recently.
4. **Place the landmark.** A central tower whose height scales with contest rating; skip it gracefully if the user has no contest history.
5. **Add ground, roads between districts, and lighting.** Use instanced meshes (`InstancedMesh`) for buildings so thousands render at 60fps.
6. **Camera.** `OrbitControls` with a gentle auto-rotate; a good default angle for the screenshot.

---

## 5. Milestones

### Phase 0 — Scaffold (½ day)
- `npm create vite@latest` (React + TS), add R3F + drei, Tailwind.
- Render a single box in a canvas with orbit controls. Confirm the toolchain works.

### Phase 1 — Data pipeline + flat MVP (1–2 days)
- Stand up the serverless proxy; wire it to alfa-leetcode-api (or direct GraphQL).
- Fetch one hardcoded username, normalize to `CityData`, log it.
- Render a **flat grid of colored boxes**: one box per solved problem, colored by difficulty. Ugly but real — this is already shareable.
- Add the username input box + loading / error states.

### Phase 2 — Real city (2–4 days)
- Group boxes into topic districts with spacing and labels.
- Difficulty → building height. Switch to `InstancedMesh` for performance.
- Add ground plane, roads, sky/environment, nicer lighting.
- Add the central contest-rating landmark tower.
- Deterministic seeding so cities are stable per user.

### Phase 3 — Polish & share (1–2 days)
- Recency lighting from the submission calendar (lit windows).
- "Download PNG" button; optional orbiting GIF export.
- A small stats overlay (username, totals, streak) baked into the shared image.
- Empty/edge-case handling: private profiles, zero solves, unknown username, no contest data.
- Mobile-friendly canvas sizing.

### Phase 4 — Stretch
- Compare two users side by side ("city vs city").
- Day/night toggle; time-lapse of the city growing across the calendar.
- Shareable permalink `leetcity.app/u/username` with server-rendered OG image for rich link previews.
- Self-host the proxy + KV cache; add basic rate limiting.

---

## 6. Suggested project structure

```
fable5-leetcity/
├─ api/
│  └─ city.ts                 # serverless proxy: username -> CityData (+cache)
├─ src/
│  ├─ main.tsx
│  ├─ App.tsx                 # input + canvas + share button
│  ├─ lib/
│  │  ├─ leetcode.ts          # query/normalize logic (mirrors proxy for local dev)
│  │  ├─ seed.ts              # deterministic RNG from username
│  │  └─ cityLayout.ts        # districts + building placement algorithm
│  ├─ scene/
│  │  ├─ City.tsx             # top-level R3F scene
│  │  ├─ District.tsx
│  │  ├─ Buildings.tsx        # InstancedMesh of buildings
│  │  ├─ Landmark.tsx         # contest-rating tower
│  │  └─ Ground.tsx
│  ├─ ui/
│  │  ├─ UsernameForm.tsx
│  │  ├─ StatsOverlay.tsx
│  │  └─ ShareButton.tsx
│  └─ types.ts                # CityData contract
├─ .env                       # PROXY_BASE / API keys if self-hosting
├─ package.json
└─ README.md
```

---

## 7. Risks & mitigations

- **Unofficial API breaks / changes fields.** → Isolate all LeetCode logic in the proxy; normalize to your own `CityData` so the 3D code never touches raw fields. Keep the two or three queries you rely on documented.
- **CORS / rate limits.** → Never call `leetcode.com/graphql` from the browser. Always go through your proxy, and cache per username (≥1h). Self-host any wrapper you depend on.
- **Per-problem tag data is expensive.** LeetCode gives *counts* per tag cheaply but a full per-problem-with-tags list needs pagination. → Build the city from aggregate counts (generate N buildings per district) rather than a literal problem list. Looks identical, far cheaper.
- **Performance with big profiles.** Thousands of buildings can tank framerate. → `InstancedMesh`, cap building count per district and summarize beyond a threshold, keep materials shared.
- **Private / empty profiles.** → Detect and show a friendly empty-state city or message; never crash.
- **Legal / ToS.** This uses an unofficial API and public data. Keep it read-only, cache to be gentle on their servers, add attribution, and be ready to swap to self-hosted infra. Don't monetize aggressively.

---

## 8. Getting started

```bash
# in the fable 5 folder
npm create vite@latest fable5-leetcity -- --template react-ts
cd fable5-leetcity
npm i three @react-three/fiber @react-three/drei zustand
npm i -D @types/three tailwindcss
npm run dev
```

First concrete goal: proxy returns real `CityData` for your own username, and the screen renders one colored box per solved problem. Everything after that is making it beautiful.
