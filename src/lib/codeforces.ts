import type { CityData, TopicStat, TagLevel } from '../types'

/**
 * Codeforces adapter — builds a real CityData from the public Codeforces API
 * (which exposes problem tags + ratings, unlike most judges). Routed through
 * the /api/codeforces proxy to avoid CORS.
 */

const API = '/api/codeforces'

async function cf<T>(method: string, params: Record<string, string>): Promise<T> {
  const qs = new URLSearchParams({ cf: method, ...params }).toString()
  const res = await fetch(`${API}?${qs}`)
  if (!res.ok) throw new Error(`Codeforces API ${res.status}`)
  const json = await res.json()
  if (json.status !== 'OK') throw new Error(json.comment || 'Codeforces error')
  return json.result as T
}

interface CfUser {
  handle: string
  rating?: number
  maxRating?: number
}
interface CfSubmission {
  verdict?: string
  creationTimeSeconds: number
  problem: {
    contestId?: number
    index: string
    name: string
    rating?: number
    tags: string[]
  }
}

/** Friendly labels for common Codeforces tags (aligned to DSA topics). */
const TAG_LABEL: Record<string, string> = {
  'dp': 'Dynamic Programming',
  'graphs': 'Graph',
  'trees': 'Tree',
  'dfs and similar': 'Graph',
  'dsu': 'Union Find',
  'strings': 'String',
  'math': 'Math',
  'greedy': 'Greedy',
  'implementation': 'Implementation',
  'two pointers': 'Two Pointers',
  'binary search': 'Binary Search',
  'data structures': 'Data Structures',
  'sortings': 'Sorting',
  'bitmasks': 'Bit Manipulation',
  'number theory': 'Number Theory',
  'constructive algorithms': 'Constructive',
  'brute force': 'Brute Force',
  'combinatorics': 'Combinatorics',
  'geometry': 'Geometry',
  'hashing': 'Hash Table',
}

const ADVANCED = new Set(['Dynamic Programming', 'Graph', 'Tree', 'Union Find', 'Number Theory', 'Combinatorics'])
const FUNDAMENTAL = new Set(['Implementation', 'Math', 'Greedy', 'String', 'Sorting', 'Brute Force'])

function levelFor(label: string): TagLevel {
  if (ADVANCED.has(label)) return 'advanced'
  if (FUNDAMENTAL.has(label)) return 'fundamental'
  return 'intermediate'
}

function label(tag: string): string {
  return TAG_LABEL[tag] ?? tag.replace(/\b\w/g, (c) => c.toUpperCase())
}

/** CF problem rating → Easy/Medium/Hard tier. */
function tier(rating?: number): 'easy' | 'medium' | 'hard' {
  if (!rating) return 'medium'
  if (rating < 1400) return 'easy'
  if (rating < 2000) return 'medium'
  return 'hard'
}

export async function fetchCodeforcesCity(handle: string): Promise<CityData> {
  const [users, subs] = await Promise.all([
    cf<CfUser[]>('user.info', { handles: handle }),
    cf<CfSubmission[]>('user.status', { handle, from: '1', count: '10000' }),
  ])
  const user = users[0]
  if (!user) throw new Error(`Codeforces user "${handle}" not found.`)

  // Distinct solved problems.
  const solved = new Map<string, CfSubmission['problem']>()
  const calendar: Record<string, number> = {}
  for (const s of subs) {
    if (s.verdict !== 'OK') continue
    const id = `${s.problem.contestId ?? 'x'}-${s.problem.index}`
    if (!solved.has(id)) {
      solved.set(id, s.problem)
      const day = s.creationTimeSeconds - (s.creationTimeSeconds % 86400)
      calendar[String(day)] = (calendar[String(day)] ?? 0) + 1
    }
  }

  const totals = { easy: 0, medium: 0, hard: 0, all: solved.size }
  const tagCount = new Map<string, number>()
  for (const p of solved.values()) {
    totals[tier(p.rating)]++
    // Dedupe labels within one problem (e.g. graphs + dfs both → Graph).
    const seen = new Set<string>()
    for (const t of p.tags) {
      const l = label(t)
      if (seen.has(l)) continue
      seen.add(l)
      tagCount.set(l, (tagCount.get(l) ?? 0) + 1)
    }
  }

  const topics: TopicStat[] = [...tagCount.entries()]
    .map(([lbl, n]) => ({
      tag: lbl.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label: lbl,
      solved: n,
      level: levelFor(lbl),
    }))
    .sort((a, b) => b.solved - a.solved)

  return {
    username: user.handle,
    avatarUrl: '',
    ranking: 0,
    acceptance: 0,
    totals,
    topics,
    contest: user.rating
      ? { rating: user.rating, globalRanking: 0, topPercentage: 0 }
      : undefined,
    calendar,
    streak: 0,
    fetchedAt: new Date().toISOString(),
    platform: 'codeforces',
  }
}
