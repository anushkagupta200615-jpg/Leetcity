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

export interface CityLayout {
  districts: DistrictLayout[]
  /** landmark tower height (0 = no contest history) */
  landmarkHeight: number
  /** radius that encloses the whole city, for camera framing */
  cityRadius: number
}
