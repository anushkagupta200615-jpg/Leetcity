# LeetCity 🏙️

Your LeetCode grind, rendered as a procedurally generated 3D city — in the spirit of GitCity.

Type in any LeetCode username and get an explorable skyline built from their profile:

- **Districts** = topic tags (Dynamic Programming, Graphs, Arrays, …), sized by problems solved
- **Buildings** = solved problems; **height & color** = difficulty (green Easy / amber Medium / red Hard)
- **Central spire** = contest rating (taller = higher rated), with a pulsing beacon
- **Window glow** = recent submission activity (last 30 days)
- Same username → same city, every time (deterministic seeding)

## Live Demo

🚀 **[Explore LeetCity live!](https://leetcity-lac.vercel.app)**

## Project layout

```
api/leetcode.ts        Serverless proxy (production)
vite.config.ts         Dev proxy (local development)
src/
  types.ts             CityData contract + layout types
  store.ts             Zustand store (load / demo / error states)
  lib/
    leetcode.ts        GraphQL queries + normalization + demo profile
    seed.ts            Deterministic PRNG (FNV-1a + mulberry32)
    cityLayout.ts      District placement (spiral packing) + building generation
  scene/
    Scene.tsx          Canvas, lights, fog, adaptive camera, orbit controls
    City.tsx           Composition + district labels (error-isolated)
    Buildings.tsx      All buildings in one InstancedMesh
    Landmark.tsx       Contest-rating spire with animated beacon
    Ground.tsx         Ground plane + grid
  ui/                  Username form, stats overlay, PNG download
public/fonts/label.ttf Bundled label font (no CDN dependency)
```

## Notes & limits

- Uses LeetCode's **unofficial** GraphQL API — field names can change without notice. All LeetCode-specific logic lives in `src/lib/leetcode.ts` + the proxy, so fixes stay in one place.
- Districts are built from **aggregate tag counts** (cheap, one query) rather than a paginated per-problem list; each district renders up to 120 buildings and represents the rest proportionally.
- Building difficulty within a district is sampled from the user's overall easy/medium/hard ratio — LeetCode doesn't expose per-tag difficulty splits cheaply.
- Private profiles and unknown users show a friendly error. Type `demo` for the built-in sample.

## Ideas / next steps

- Compare two users side by side ("city vs city")
- Day/night toggle; time-lapse of the city growing across the submission calendar
- Shareable permalinks with server-rendered OG images
- KV cache in the edge function to be gentler on LeetCode
