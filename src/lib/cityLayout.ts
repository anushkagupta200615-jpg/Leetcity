import type {
  BuildingInstance,
  CityData,
  CityLayout,
  Difficulty,
  DistrictLayout,
  GapLot,
} from '../types'
import { rngFor } from './seed'
import { recentActivity } from './leetcode'

/** Max buildings rendered per district; beyond this, one building represents several problems. */
const DISTRICT_BUILDING_CAP = 120
/** Ground cell occupied by one building (building + gap). */
const CELL = 1.6
/** Gap between district edges. */
const DISTRICT_GAP = 4.5
/** Keep-out radius around the central landmark. */
const CENTER_CLEARANCE = 9

/** Core interview topics — a sparse district here is a gap worth seeing. */
const CORE_TOPICS = [
  'Array',
  'String',
  'Hash Table',
  'Dynamic Programming',
  'Tree',
  'Graph',
  'Binary Search',
  'Two Pointers',
  'Linked List',
  'Stack',
  'Heap (Priority Queue)',
  'Sliding Window',
  'Backtracking',
  'Greedy',
  'Trie',
  'Bit Manipulation',
]
/** Fewer solves than this in a core topic = show an empty lot. */
const GAP_THRESHOLD = 3
const MAX_GAPS = 8

const HEIGHTS: Record<Difficulty, [number, number]> = {
  easy: [0.8, 2.2],
  medium: [2.8, 6.0],
  hard: [7.0, 13.0],
}

function pickDifficulty(
  rand: () => number,
  ratios: { easy: number; medium: number; hard: number },
): Difficulty {
  const r = rand()
  if (r < ratios.easy) return 'easy'
  if (r < ratios.easy + ratios.medium) return 'medium'
  return 'hard'
}

interface Box {
  cx: number
  cz: number
  half: number
}

function overlaps(a: Box, b: Box, gap: number): boolean {
  return (
    Math.abs(a.cx - b.cx) < a.half + b.half + gap &&
    Math.abs(a.cz - b.cz) < a.half + b.half + gap
  )
}

/**
 * Walk an Archimedean spiral outward from the center until the candidate
 * district box doesn't overlap anything already placed.
 */
function placeDistrict(half: number, placed: Box[], rand: () => number): Box {
  const startAngle = rand() * Math.PI * 2
  let angle = startAngle
  let radius = CENTER_CLEARANCE + half
  for (let i = 0; i < 4000; i++) {
    const candidate: Box = {
      cx: Math.cos(angle) * radius,
      cz: Math.sin(angle) * radius,
      half,
    }
    if (!placed.some((p) => overlaps(candidate, p, DISTRICT_GAP))) {
      return candidate
    }
    angle += 0.35
    radius += 0.22
  }
  // Fallback: drop it far outside (should never happen).
  return { cx: radius, cz: 0, half }
}

export function buildCityLayout(data: CityData): CityLayout {
  const { totals } = data
  const totalSolved = Math.max(1, totals.easy + totals.medium + totals.hard)
  const ratios = {
    easy: totals.easy / totalSolved,
    medium: totals.medium / totalSolved,
    hard: totals.hard / totalSolved,
  }

  // How lively the city looks: recent submissions drive window glow.
  const recent = recentActivity(data.calendar, 30)
  const cityGlow = Math.min(1, recent / 40)

  const topics = data.topics.slice(0, 24) // cap district count for legibility
  const placed: Box[] = []
  const districts: DistrictLayout[] = []

  for (const topic of topics) {
    const rand = rngFor(data.username, `district:${topic.tag}`)
    const buildingCount = Math.min(topic.solved, DISTRICT_BUILDING_CAP)
    const side = Math.max(1, Math.ceil(Math.sqrt(buildingCount)))
    const half = (side * CELL) / 2

    const box = placeDistrict(half, placed, rand)
    placed.push(box)

    const buildings: BuildingInstance[] = []
    for (let i = 0; i < buildingCount; i++) {
      const gx = i % side
      const gz = Math.floor(i / side)
      const difficulty = pickDifficulty(rand, ratios)
      const [hMin, hMax] = HEIGHTS[difficulty]
      const height = hMin + rand() * (hMax - hMin)
      const w = 0.55 + rand() * 0.45
      buildings.push({
        x: box.cx - half + gx * CELL + CELL / 2 + (rand() - 0.5) * 0.3,
        z: box.cz - half + gz * CELL + CELL / 2 + (rand() - 0.5) * 0.3,
        width: w,
        depth: 0.55 + rand() * 0.45,
        height,
        difficulty,
        glow: cityGlow * (0.35 + rand() * 0.65),
      })
    }

    districts.push({
      tag: topic.tag,
      label: topic.label,
      solved: topic.solved,
      level: topic.level,
      cx: box.cx,
      cz: box.cz,
      half,
      buildings,
    })
  }

  // Empty lots: core topics where this user is weak get a visible vacant plot.
  const solvedByLabel = new Map(data.topics.map((t) => [t.label, t.solved]))
  const gaps: GapLot[] = []
  for (const label of CORE_TOPICS) {
    if (gaps.length >= MAX_GAPS) break
    const solved = solvedByLabel.get(label) ?? 0
    if (solved >= GAP_THRESHOLD) continue
    // Skip if it already has a rendered district (1-2 solves): the tiny
    // district itself reads as sparse; only truly-empty topics get lots.
    if (solved > 0) continue
    const rand = rngFor(data.username, `gap:${label}`)
    const half = 2.6
    const box = placeDistrict(half, placed, rand)
    placed.push(box)
    gaps.push({
      tag: label
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''),
      label,
      solved,
      cx: box.cx,
      cz: box.cz,
      half,
    })
  }

  // Landmark: contest rating 1500 -> ~14 units, 2200+ -> ~30 units.
  const rating = data.contest?.rating ?? 0
  const landmarkHeight =
    rating > 0 ? Math.max(8, Math.min(32, ((rating - 1200) / 1000) * 22 + 8)) : 0

  // Defensive: guarantee no two buildings ever share near-identical X/Z.
  // With grid-cell placement this is a no-op, but it makes invisible-building
  // collisions structurally impossible even if placement logic changes later.
  const taken = new Set<string>()
  for (const d of districts) {
    for (const b of d.buildings) {
      let key = `${b.x.toFixed(2)}|${b.z.toFixed(2)}`
      while (taken.has(key)) {
        b.x += 0.41
        b.z += 0.29
        key = `${b.x.toFixed(2)}|${b.z.toFixed(2)}`
      }
      taken.add(key)
    }
  }

  const cityRadius = placed.reduce(
    (r, b) => Math.max(r, Math.hypot(b.cx, b.cz) + b.half),
    CENTER_CLEARANCE + 6,
  )

  return { districts, gaps, landmarkHeight, cityRadius }
}
