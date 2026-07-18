export type TagLevel = 'fundamental' | 'intermediate' | 'advanced'

export interface TopicStat {
  tag: string // slug, e.g. "dynamic-programming"
  label: string // display name, e.g. "Dynamic Programming"
  solved: number
  level: TagLevel
}

export interface CityData {
  username: string
  avatarUrl: string
  /** global site-wide rank from the LeetCode profile (0 = unknown) */
  ranking: number
  /** overall submission acceptance rate, percent (0 = unknown) */
  acceptance: number
  totals: { easy: number; medium: number; hard: number; all: number }
  topics: TopicStat[]
  contest?: {
    rating: number
    globalRanking: number
    topPercentage: number
  }
  /** epoch-seconds (day bucket) -> submission count */
  calendar: Record<string, number>
  streak: number
  fetchedAt: string
  isDemo?: boolean
}

export type Difficulty = 'easy' | 'medium' | 'hard'

export interface BuildingInstance {
  x: number
  z: number
  width: number
  depth: number
  height: number
  difficulty: Difficulty
  /** 0..1 how "lit" the windows are (recent activity) */
  glow: number
}

export interface DistrictLayout {
  tag: string
  label: string
  solved: number
  level: TagLevel
  /** center of the district on the ground plane */
  cx: number
  cz: number
  /** half-extent of the district footprint */
  half: number
  buildings: BuildingInstance[]
}

/** A user's tower in the shared world (persisted locally). */
export interface StoredTower {
  username: string
  easy: number
  medium: number
  hard: number
  all: number
  /** 0 = no contest history */
  rating: number
  plot: number
  savedAt: string
  /** submissions in the last 30 days at save time (undefined = legacy entry) */
  recent?: number
  /** true for procedurally-generated citizens (not a real searched user) */
  synthetic?: boolean
}

export interface Selection {
  label: string
  level: TagLevel
  solved: number
  difficulty: Difficulty
  /** true when an empty/sparse gap lot was clicked instead of a building */
  gap?: boolean
  /** LeetCode tag slug, for linking to the topic's problem list */
  tagSlug?: string
}

/** A visibly vacant lot for a core topic the user is weak in. */
export interface GapLot {
  tag: string
  label: string
  solved: number
  cx: number
  cz: number
  half: number
}

export interface CityLayout {
  districts: DistrictLayout[]
  /** empty lots marking weak/unsolved core topics */
  gaps: GapLot[]
  /** landmark tower height (0 = no contest history) */
  landmarkHeight: number
  /** radius that encloses the whole city, for camera framing */
  cityRadius: number
}
