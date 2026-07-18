import type { CityData, StoredTower } from '../types'
import { recentActivity } from './leetcode'
import { plotFor } from './world'

/**
 * Optional shared backend (Supabase). When the two env vars are present the
 * world is populated by real users and a global leaderboard is available.
 * When they're absent, every function no-ops and the app runs exactly as
 * before (synthetic world) — so the backend is purely additive.
 *
 * Uses Supabase's REST (PostgREST) endpoint directly — no SDK dependency.
 */

const URL = import.meta.env.VITE_SUPABASE_URL
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabaseEnabled = Boolean(URL && KEY)

function headers(extra: Record<string, string> = {}) {
  return {
    'Content-Type': 'application/json',
    apikey: KEY as string,
    Authorization: `Bearer ${KEY as string}`,
    ...extra,
  }
}

interface ProfileRow {
  username: string
  easy: number
  medium: number
  hard: number
  total: number
  rating: number
  ranking: number
  acceptance: number
  recent: number
  top_topics: string
}

function toRow(data: CityData): ProfileRow {
  return {
    username: data.username,
    easy: data.totals.easy,
    medium: data.totals.medium,
    hard: data.totals.hard,
    total: data.totals.all,
    rating: data.contest?.rating ?? 0,
    ranking: data.ranking ?? 0,
    acceptance: data.acceptance ?? 0,
    recent: recentActivity(data.calendar, 30),
    top_topics: data.topics.slice(0, 3).map((t) => t.label).join(', '),
  }
}

function rowToTower(r: ProfileRow): StoredTower {
  return {
    username: r.username,
    easy: r.easy,
    medium: r.medium,
    hard: r.hard,
    all: r.total,
    rating: r.rating,
    plot: plotFor(r.username),
    savedAt: '',
    recent: r.recent,
  }
}

/** Write (insert or update) the user's public profile to the shared world. */
export async function upsertProfile(data: CityData): Promise<void> {
  if (!supabaseEnabled || data.isDemo) return
  try {
    await fetch(`${URL}/rest/v1/profiles`, {
      method: 'POST',
      headers: headers({ Prefer: 'resolution=merge-duplicates' }),
      body: JSON.stringify({ ...toRow(data), updated_at: new Date().toISOString() }),
    })
  } catch {
    /* offline / blocked — ignore, world just won't sync this time */
  }
}

/** All real profiles (top by solved), as world towers. */
export async function fetchProfiles(limit = 300): Promise<StoredTower[]> {
  if (!supabaseEnabled) return []
  try {
    const res = await fetch(
      `${URL}/rest/v1/profiles?select=*&order=total.desc&limit=${limit}`,
      { headers: headers() },
    )
    if (!res.ok) return []
    const rows = (await res.json()) as ProfileRow[]
    return rows.map(rowToTower)
  } catch {
    return []
  }
}
