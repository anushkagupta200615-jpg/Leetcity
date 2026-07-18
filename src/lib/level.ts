/** Derive a GitCity-style level, title, and XP progress from problems solved. */

const LEVELS = [
  { min: 0, name: 'NEWCOMER' },
  { min: 25, name: 'ROOKIE' },
  { min: 60, name: 'SOLVER' },
  { min: 120, name: 'GRINDER' },
  { min: 220, name: 'CENTURION' },
  { min: 360, name: 'VETERAN' },
  { min: 550, name: 'EXPERT' },
  { min: 800, name: 'MASTER' },
  { min: 1200, name: 'GRANDMASTER' },
  { min: 1800, name: 'LEGEND' },
]

export interface LevelInfo {
  level: number
  name: string
  progress: number // 0..1 toward next level
  solved: number
  nextAt: number | null
}

export function levelFor(solved: number): LevelInfo {
  let idx = 0
  for (let i = 0; i < LEVELS.length; i++) if (solved >= LEVELS[i].min) idx = i
  const cur = LEVELS[idx]
  const next = LEVELS[idx + 1]
  const progress = next
    ? Math.min(1, (solved - cur.min) / (next.min - cur.min))
    : 1
  return {
    level: idx + 1,
    name: cur.name,
    progress,
    solved,
    nextAt: next ? next.min : null,
  }
}

/** A short "play style" tag from the difficulty mix (like GitCity's category). */
export function archetypeFor(
  easy: number,
  medium: number,
  hard: number,
  all: number,
): string {
  const total = Math.max(1, all)
  if (hard / total >= 0.18) return 'HARD SPECIALIST'
  if (medium / total >= 0.45) return 'CORE GRINDER'
  if (medium >= easy) return 'ALL-ROUNDER'
  return 'FUNDAMENTALS'
}
