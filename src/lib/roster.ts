import type { CityData, StoredTower, TagLevel } from '../types'
import { buildCityLayout } from './cityLayout'
import { hashString, mulberry32, rngFor } from './seed'
import { recentActivity } from './leetcode'
import { PLOT, RESERVED, ulam, towerHeight } from './world'
import type { CityLayout } from '../types'

/**
 * Multiplayer roster: assembles 3-5 opponent cities to show alongside yours.
 * Real cached cities are used first; a synthetic (deterministic) city is
 * generated for seed usernames as a fallback so the mode always has content.
 * No backend — this is the "get it working locally" version.
 */

// Same prefix leetcode.ts caches full CityData under (kept in sync intentionally).
const CACHE_PREFIX = 'leetcity:cache:'

export const SEED_USERS = [
  'neetcode',
  'errichto',
  'stefanpochmann',
  'lee215',
  'awice',
  'votrubac',
  'tourist',
  'cuiaoxiang',
]

const TAG_POOL: Array<[string, TagLevel]> = [
  ['Array', 'fundamental'],
  ['String', 'fundamental'],
  ['Hash Table', 'fundamental'],
  ['Two Pointers', 'fundamental'],
  ['Stack', 'fundamental'],
  ['Binary Search', 'intermediate'],
  ['Tree', 'intermediate'],
  ['Graph', 'intermediate'],
  ['Greedy', 'intermediate'],
  ['Heap (Priority Queue)', 'intermediate'],
  ['Sliding Window', 'intermediate'],
  ['Dynamic Programming', 'advanced'],
  ['Backtracking', 'advanced'],
  ['Trie', 'advanced'],
  ['Union Find', 'advanced'],
  ['Bit Manipulation', 'intermediate'],
]

/** Deterministic, network-free city for a given username. */
export function syntheticCityData(username: string): CityData {
  const rand = rngFor(username, 'synthetic')
  const scale = 0.35 + rand() * 1.3 // overall grind size varies per user

  const topics = TAG_POOL.map(([label, level]) => {
    const base =
      level === 'fundamental' ? 55 : level === 'intermediate' ? 38 : 22
    const solved = Math.max(0, Math.round(base * scale * (0.3 + rand() * 1.1)))
    return {
      tag: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label,
      solved,
      level,
    }
  })
    .filter((t) => t.solved > 0)
    .sort((a, b) => b.solved - a.solved)

  // Difficulty split derived from the same seed.
  const total = topics.reduce((s, t) => s + t.solved, 0)
  const hardFrac = 0.08 + rand() * 0.22
  const easyFrac = 0.28 + rand() * 0.2
  const hard = Math.round(total * hardFrac)
  const easy = Math.round(total * easyFrac)
  const medium = Math.max(0, total - hard - easy)

  const rating = rand() < 0.7 ? Math.round(1400 + rand() * 1000) : 0

  // Sparse calendar so recency lighting has something to work with.
  const calendar: Record<string, number> = {}
  const now = Math.floor(Date.now() / 1000)
  const active = rand() < 0.75
  if (active) {
    for (let d = 0; d < 120; d++) {
      if (rand() < 0.4) {
        const day = now - d * 86400
        calendar[String(day - (day % 86400))] = 1 + Math.floor(rand() * 5)
      }
    }
  }

  return {
    username,
    avatarUrl: '',
    ranking: 1000 + Math.floor(rand() * 400000),
    acceptance: Math.round((45 + rand() * 45) * 10) / 10,
    totals: { easy, medium, hard, all: total },
    topics,
    contest: rating
      ? { rating, globalRanking: Math.floor(rand() * 100000), topPercentage: Math.round(rand() * 200) / 10 }
      : undefined,
    calendar,
    streak: active ? Math.floor(rand() * 40) : 0,
    fetchedAt: new Date().toISOString(),
    isDemo: true,
  }
}

/** Real cities the user has actually fetched (still within cache TTL window). */
function cachedCities(): CityData[] {
  const out: CityData[] = []
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith(CACHE_PREFIX)) continue
      const raw = localStorage.getItem(key)
      if (!raw) continue
      const data = JSON.parse(raw) as CityData
      if (data?.topics?.length) out.push(data)
    }
  } catch {
    /* ignore malformed cache entries */
  }
  return out
}

/**
 * Choose 3-5 opponents (excluding the current user), deterministically per
 * current username so the neighborhood is stable within a session.
 * Prefers real cached cities, tops up with synthetic seed users.
 */
export function getRoster(currentUsername: string, count = 4): CityData[] {
  const exclude = currentUsername.trim().toLowerCase()
  const seen = new Set<string>([exclude])
  const picked: CityData[] = []

  for (const c of cachedCities()) {
    const key = c.username.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    picked.push(c)
    if (picked.length >= count) return picked
  }

  // Deterministic shuffle of the seed list based on current username.
  const rand = mulberry32(hashString(exclude + '::roster'))
  const seeds = [...SEED_USERS].sort(() => rand() - 0.5)
  for (const name of seeds) {
    if (seen.has(name.toLowerCase())) continue
    seen.add(name.toLowerCase())
    picked.push(syntheticCityData(name))
    if (picked.length >= count) break
  }
  return picked
}

/* ------------------------------------------------------------------ */
/* NPC citizens: every filler plot in World mode is a clickable user.   */
/* ------------------------------------------------------------------ */

const NPC_HANDLES = [
  'byte', 'algo', 'nova', 'quokka', 'pointer', 'lambda', 'recur', 'heapz',
  'dijkstra', 'kadane', 'trie', 'segtree', 'mergez', 'binary', 'greedy',
  'dpwiz', 'graphy', 'stackz', 'queuex', 'hashly', 'kmp', 'floyd', 'bellman',
  'tarjan', 'kruskal', 'prim', 'fenwick', 'sparse', 'mono', 'sliding',
  'twosum', 'anagram', 'palindra', 'matrixe', 'bitwise', 'modpow', 'sieve',
  'gcdlord', 'combi', 'permu', 'backtrk', 'memoize', 'tabu', 'topo', 'bfsking',
  'dfsqueen', 'unionf', 'rollhash', 'manacher', 'zfunc',
]

/** Deterministic handle for a plot, e.g. "dijkstra472". */
export function npcNameForPlot(plot: number): string {
  const r = mulberry32((plot * 2654435761) >>> 0)
  const base = NPC_HANDLES[Math.floor(r() * NPC_HANDLES.length)]
  const suffix = 100 + Math.floor(r() * 900)
  return `${base}${suffix}`
}

/** A citizen tower: synthetic stats derived from the (deterministic) handle. */
export function syntheticTower(username: string, plot: number): StoredTower {
  const c = syntheticCityData(username)
  return {
    username,
    easy: c.totals.easy,
    medium: c.totals.medium,
    hard: c.totals.hard,
    all: c.totals.all,
    rating: c.contest?.rating ?? 0,
    plot,
    savedAt: c.fetchedAt,
    recent: recentActivity(c.calendar, 30),
    synthetic: true,
  }
}

export interface NpcTower {
  tower: StoredTower
  x: number
  z: number
  height: number
}

/**
 * Populate the world's empty plots with clickable citizens, so every building
 * belongs to someone whose profile you can open. Heights scale with their
 * solve score, so the tallest towers really are the strongest solvers.
 */
export function buildNpcTowers(
  occupied: Set<number>,
  plots = 440,
  /** keep a clear plaza around these world positions (real towers) */
  avoid: Array<[number, number]> = [],
  avoidRadius = 0,
): NpcTower[] {
  const out: NpcTower[] = []
  const r2 = avoidRadius * avoidRadius
  for (let i = RESERVED; i < RESERVED + plots; i++) {
    if (occupied.has(i)) continue
    const keep = mulberry32((i * 40503) >>> 0)
    if (keep() < 0.04) continue // a rare vacant lot; otherwise a dense, even grid
    const [px, pz] = ulam(i)
    const x = px * PLOT
    const z = pz * PLOT
    // Don't crowd real towers, so clicking one always hits that person.
    if (avoid.some(([ax, az]) => (ax - x) ** 2 + (az - z) ** 2 < r2)) continue
    const name = npcNameForPlot(i)
    const tower = syntheticTower(name, i)
    if (tower.all < 1) continue
    out.push({ tower, x, z, height: towerHeight(tower) })
  }
  return out
}

/* ------------------------------------------------------------------ */
/* Neighborhood layout: place several cities apart on a grid.          */
/* ------------------------------------------------------------------ */

export interface HoodItem {
  data: CityData
  layout: CityLayout
  ox: number
  oz: number
  maxHeight: number
  totalSolved: number
}

export interface Neighborhood {
  items: HoodItem[]
  radius: number
  /** index of the leader (tallest single building) */
  leaderIndex: number
}

export function buildNeighborhood(cities: CityData[]): Neighborhood {
  const laid = cities.map((data) => {
    const layout = buildCityLayout(data)
    let maxHeight = 0
    for (const d of layout.districts)
      for (const b of d.buildings) if (b.height > maxHeight) maxHeight = b.height
    return { data, layout, maxHeight, totalSolved: data.totals.all }
  })

  const maxRadius = laid.reduce((m, it) => Math.max(m, it.layout.cityRadius), 20)
  const cell = maxRadius * 2 + 26 // gap between neighbors
  const n = laid.length
  const cols = Math.ceil(Math.sqrt(n))
  const rows = Math.ceil(n / cols)

  const items: HoodItem[] = laid.map((it, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    const ox = (col - (cols - 1) / 2) * cell
    const oz = (row - (rows - 1) / 2) * cell
    return { ...it, ox, oz }
  })

  let leaderIndex = 0
  for (let i = 1; i < items.length; i++) {
    if (items[i].maxHeight > items[leaderIndex].maxHeight) leaderIndex = i
  }

  const radius = (Math.max(cols, rows) * cell) / 2 + maxRadius
  return { items, radius, leaderIndex }
}
