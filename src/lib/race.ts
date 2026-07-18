/**
 * DSA Race — a local, backend-free race mode.
 *
 * v1 model: you compete against simulated "bot" opponents (drawn from the same
 * seed roster) who solve the current problem after random delays. Whoever marks
 * the problem solved first earns the most points. A live per-question leaderboard
 * updates as solvers come in; cumulative scores persist in localStorage.
 *
 * Optional real cross-tab racing: solves are broadcast over a BroadcastChannel,
 * so two tabs open on the same machine genuinely race each other.
 */

import { SEED_USERS } from './roster'

export interface RaceProblem {
  title: string
  slug: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
}

export interface Solver {
  name: string
  order: number
  points: number
  /** ms since race start */
  at: number
  isYou?: boolean
}

/** Points by finishing order; everyone after gets the trailing value. */
export const POINTS = [10, 7, 5, 3]
export const TRAILING_POINTS = 2

export function pointsForOrder(order: number): number {
  return order <= POINTS.length ? POINTS[order - 1] : TRAILING_POINTS
}

export const PROBLEM_POOL: RaceProblem[] = [
  { title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy' },
  { title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy' },
  { title: 'Merge Intervals', slug: 'merge-intervals', difficulty: 'Medium' },
  { title: 'LRU Cache', slug: 'lru-cache', difficulty: 'Medium' },
  { title: 'Number of Islands', slug: 'number-of-islands', difficulty: 'Medium' },
  { title: 'Course Schedule', slug: 'course-schedule', difficulty: 'Medium' },
  { title: 'Coin Change', slug: 'coin-change', difficulty: 'Medium' },
  { title: 'Word Ladder', slug: 'word-ladder', difficulty: 'Hard' },
  { title: 'Trapping Rain Water', slug: 'trapping-rain-water', difficulty: 'Hard' },
  { title: 'Median of Two Sorted Arrays', slug: 'median-of-two-sorted-arrays', difficulty: 'Hard' },
]

export function pickProblem(index: number): RaceProblem {
  return PROBLEM_POOL[index % PROBLEM_POOL.length]
}

/** Bot opponents for a race (seed users, minus you). */
export function botOpponents(you: string, n = 4): string[] {
  return SEED_USERS.filter((u) => u.toLowerCase() !== you.toLowerCase()).slice(0, n)
}

/* -------- cumulative scores (persisted) -------- */

const TOTALS_KEY = 'leetcity:race:totals:v1'

export function loadTotals(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(TOTALS_KEY) || '{}')
  } catch {
    return {}
  }
}

export function saveTotals(totals: Record<string, number>) {
  try {
    localStorage.setItem(TOTALS_KEY, JSON.stringify(totals))
  } catch {
    /* ignore */
  }
}

/* -------- cross-tab sync (optional, no backend) -------- */

export interface RaceMessage {
  type: 'solved'
  round: number
  name: string
  at: number
}

export function makeChannel(): BroadcastChannel | null {
  try {
    return new BroadcastChannel('leetcity-race')
  } catch {
    return null
  }
}
