import type { CityData, TopicStat, TagLevel } from '../types'
import { rngFor } from './seed'

const GRAPHQL_URL = '/api/leetcode'

const CITY_QUERY = `
query cityData($username: String!) {
  matchedUser(username: $username) {
    username
    profile { userAvatar ranking }
    submitStatsGlobal {
      acSubmissionNum { difficulty count submissions }
      totalSubmissionNum { difficulty submissions }
    }
    tagProblemCounts {
      advanced { tagName tagSlug problemsSolved }
      intermediate { tagName tagSlug problemsSolved }
      fundamental { tagName tagSlug problemsSolved }
    }
    userCalendar { submissionCalendar streak }
  }
  userContestRanking(username: $username) {
    rating
    globalRanking
    topPercentage
  }
}
`

interface RawTag {
  tagName: string
  tagSlug: string
  problemsSolved: number
}

async function gql(query: string, variables: Record<string, unknown>) {
  const res = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`LeetCode API returned ${res.status}`)
  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message ?? 'GraphQL error')
  return json.data
}

function collectTags(raw: RawTag[] | undefined, level: TagLevel): TopicStat[] {
  return (raw ?? [])
    .filter((t) => t.problemsSolved > 0)
    .map((t) => ({
      tag: t.tagSlug,
      label: t.tagName,
      solved: t.problemsSolved,
      level,
    }))
}

const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour
const cacheKey = (name: string) => `leetcity:cache:${name.toLowerCase()}`

function readCache(name: string): CityData | null {
  try {
    const raw = localStorage.getItem(cacheKey(name))
    if (!raw) return null
    const data = JSON.parse(raw) as CityData
    if (Date.now() - new Date(data.fetchedAt).getTime() > CACHE_TTL_MS) return null
    return data
  } catch {
    return null
  }
}

function writeCache(data: CityData) {
  try {
    localStorage.setItem(cacheKey(data.username), JSON.stringify(data))
  } catch {
    /* storage full — skip caching */
  }
}

export async function fetchCityData(username: string): Promise<CityData> {
  const hit = readCache(username)
  if (hit) return hit

  const data = await gql(CITY_QUERY, { username })
  const mu = data?.matchedUser
  if (!mu) throw new Error(`User "${username}" not found (or profile is private).`)

  const counts: Record<string, number> = {}
  let acSubs = 0
  for (const row of mu.submitStatsGlobal?.acSubmissionNum ?? []) {
    counts[String(row.difficulty).toLowerCase()] = row.count
    if (String(row.difficulty).toLowerCase() === 'all') acSubs = row.submissions ?? 0
  }
  let totalSubs = 0
  for (const row of mu.submitStatsGlobal?.totalSubmissionNum ?? []) {
    if (String(row.difficulty).toLowerCase() === 'all') totalSubs = row.submissions ?? 0
  }

  const topics = [
    ...collectTags(mu.tagProblemCounts?.fundamental, 'fundamental'),
    ...collectTags(mu.tagProblemCounts?.intermediate, 'intermediate'),
    ...collectTags(mu.tagProblemCounts?.advanced, 'advanced'),
  ].sort((a, b) => b.solved - a.solved)

  let calendar: Record<string, number> = {}
  try {
    calendar = JSON.parse(mu.userCalendar?.submissionCalendar ?? '{}')
  } catch {
    calendar = {}
  }

  const contest = data.userContestRanking
  const result: CityData = {
    username: mu.username,
    avatarUrl: mu.profile?.userAvatar ?? '',
    ranking: mu.profile?.ranking ?? 0,
    acceptance: totalSubs > 0 ? (acSubs / totalSubs) * 100 : 0,
    totals: {
      easy: counts.easy ?? 0,
      medium: counts.medium ?? 0,
      hard: counts.hard ?? 0,
      all: counts.all ?? (counts.easy ?? 0) + (counts.medium ?? 0) + (counts.hard ?? 0),
    },
    topics,
    contest: contest
      ? {
          rating: Math.round(contest.rating ?? 0),
          globalRanking: contest.globalRanking ?? 0,
          topPercentage: contest.topPercentage ?? 0,
        }
      : undefined,
    calendar,
    streak: mu.userCalendar?.streak ?? 0,
    fetchedAt: new Date().toISOString(),
  }
  writeCache(result)
  return result
}

/** Submissions in the last `days` days, from the calendar map. */
export function recentActivity(calendar: Record<string, number>, days = 30): number {
  const cutoff = Date.now() / 1000 - days * 86400
  let total = 0
  for (const [ts, n] of Object.entries(calendar)) {
    if (Number(ts) >= cutoff) total += n
  }
  return total
}

/* ------------------------------------------------------------------ */
/* Demo profile — renders without any network access.                  */
/* ------------------------------------------------------------------ */

const DEMO_TAGS: Array<[string, TagLevel, number]> = [
  ['Array', 'fundamental', 142],
  ['String', 'fundamental', 96],
  ['Hash Table', 'fundamental', 78],
  ['Dynamic Programming', 'advanced', 64],
  ['Two Pointers', 'fundamental', 45],
  ['Binary Search', 'intermediate', 41],
  ['Tree', 'intermediate', 58],
  ['Graph', 'intermediate', 37],
  ['Greedy', 'intermediate', 33],
  ['Backtracking', 'advanced', 21],
  ['Stack', 'fundamental', 28],
  ['Heap (Priority Queue)', 'intermediate', 19],
  ['Sliding Window', 'intermediate', 17],
  ['Union Find', 'advanced', 12],
  ['Trie', 'advanced', 8],
  ['Bit Manipulation', 'intermediate', 14],
]

export function demoCityData(): CityData {
  const rand = rngFor('demo-user', 'calendar')
  const calendar: Record<string, number> = {}
  const now = Math.floor(Date.now() / 1000)
  for (let d = 0; d < 365; d++) {
    if (rand() < 0.45) {
      const day = now - d * 86400
      calendar[String(day - (day % 86400))] = 1 + Math.floor(rand() * 6)
    }
  }
  return {
    username: 'demo',
    avatarUrl: '',
    ranking: 98765,
    acceptance: 62.4,
    totals: { easy: 210, medium: 244, hard: 62, all: 516 },
    topics: DEMO_TAGS.map(([label, level, solved]) => ({
      tag: label.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      label,
      solved,
      level,
    })).sort((a, b) => b.solved - a.solved),
    contest: { rating: 1841, globalRanking: 21042, topPercentage: 5.4 },
    calendar,
    streak: 12,
    fetchedAt: new Date().toISOString(),
    isDemo: true,
  }
}
