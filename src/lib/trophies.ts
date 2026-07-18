/** Derive GitCity-style trophy chips from a profile's stats. */

export interface TrophyInput {
  all: number
  hard: number
  rating: number
  streak?: number
}

export function trophiesFor(s: TrophyInput): string[] {
  const out: string[] = []
  if (s.rating >= 2200) out.push('🛡 GUARDIAN')
  else if (s.rating >= 1850) out.push('⚔ KNIGHT')
  else if (s.rating > 0) out.push('🏁 CONTENDER')
  if (s.all >= 1000) out.push('🏆 1K CLUB')
  else if (s.all >= 500) out.push('🥇 500 CLUB')
  else if (s.all >= 100) out.push('💯 CENTURION')
  else if (s.all >= 1) out.push('🌱 FIRST SOLVE')
  if (s.hard >= 100) out.push('💀 HARD LORD')
  else if (s.hard >= 25) out.push('🔨 HARD HITTER')
  if ((s.streak ?? 0) >= 7) out.push('🔥 ON FIRE')
  return out.slice(0, 4)
}
