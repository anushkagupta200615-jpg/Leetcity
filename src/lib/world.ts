import type { CityData, StoredTower } from '../types'
import { hashString } from './seed'
import { recentActivity } from './leetcode'

/** Distance between plot centers, world units. */
export const PLOT = 12
/** Number of addressable plots in the world — keeps every tower inside the
 * populated downtown so the world never feels empty. */
export const WORLD_SLOTS = 420
/** Plots 0..RESERVED-1 are kept for the central monument & plaza. */
export const RESERVED = 9

/**
 * Ulam square-spiral: index -> (x, z) plot coordinates.
 * Index 0 is the world origin; the spiral winds outward forever.
 */
export function ulam(n: number): [number, number] {
  if (n === 0) return [0, 0]
  const k = Math.ceil((Math.sqrt(n + 1) - 1) / 2)
  let t = 2 * k + 1
  let m = t * t - 1
  t -= 1
  if (n >= m - t) return [k - (m - n), -k]
  m -= t
  if (n >= m - t) return [-k, -k + (m - n)]
  m -= t
  if (n >= m - t) return [-k + (m - n), k]
  return [k, k - (m - n - t)]
}

/**
 * Deterministic home plot for a username — the same for everyone, forever.
 * This is what lets the world be "shared" without a backend: anyone who
 * searches the same user finds their tower standing on the same plot.
 */
export function plotFor(username: string): number {
  return (
    RESERVED +
    (hashString(username.trim().toLowerCase() + '::plot') % (WORLD_SLOTS - RESERVED))
  )
}

/** World-space position of a username's tower. */
export function towerPosition(username: string): [number, number] {
  const [px, pz] = ulam(plotFor(username))
  return [px * PLOT, pz * PLOT]
}

/** World-space position of a specific plot (works for citizens too). */
export function plotToPosition(plot: number): [number, number] {
  const [px, pz] = ulam(plot)
  return [px * PLOT, pz * PLOT]
}

/** Difficulty-weighted score: a Hard counts 5x an Easy. */
export function towerScore(easy: number, medium: number, hard: number): number {
  return easy + medium * 2.5 + hard * 5
}

export function towerHeight(t: { easy: number; medium: number; hard: number }): number {
  return 3 + Math.log2(1 + towerScore(t.easy, t.medium, t.hard)) * 2.7
}

/** 1-based rank of a user among all towers in this world, by weighted score. */
export function cityRank(towers: StoredTower[], username: string): number {
  const me = towers.find((t) => t.username.toLowerCase() === username.toLowerCase())
  if (!me) return 0
  const myScore = towerScore(me.easy, me.medium, me.hard)
  return (
    1 +
    towers.filter((t) => towerScore(t.easy, t.medium, t.hard) > myScore).length
  )
}

/* ------------------------------------------------------------------ */
/* Local persistence: every profile you search settles in your world.  */
/* ------------------------------------------------------------------ */

const STORAGE_KEY = 'leetcity:towers:v1'

export function loadTowers(): StoredTower[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function towerFrom(data: CityData): StoredTower {
  return {
    username: data.username,
    easy: data.totals.easy,
    medium: data.totals.medium,
    hard: data.totals.hard,
    all: data.totals.all,
    rating: data.contest?.rating ?? 0,
    plot: plotFor(data.username),
    savedAt: data.fetchedAt,
    recent: recentActivity(data.calendar, 30),
  }
}

export function saveTower(data: CityData): StoredTower[] {
  const towers = loadTowers().filter(
    (t) => t.username.toLowerCase() !== data.username.toLowerCase(),
  )
  towers.push(towerFrom(data))
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(towers))
  } catch {
    /* storage full or unavailable — world just won't persist */
  }
  return towers
}
