import { create } from 'zustand'
import type { CityData, Selection, StoredTower } from './types'
import { demoCityData, fetchCityData } from './lib/leetcode'
import { fetchCodeforcesCity } from './lib/codeforces'
import { loadTowers, saveTower } from './lib/world'
import { getRoster } from './lib/roster'
import { upsertProfile, fetchProfiles, supabaseEnabled } from './lib/supabase'
import { DEFAULT_THEME, type ThemeKey } from './lib/themes'

type ViewMode = 'city' | 'world' | 'multi'

interface CityState {
  data: CityData | null
  loading: boolean
  error: string | null
  theme: ThemeKey
  night: boolean
  mode: ViewMode
  selection: Selection | null
  towers: StoredTower[]
  worldSelection: StoredTower | null
  roster: CityData[]
  remoteProfiles: StoredTower[]
  raceOpen: boolean
  insightsOpen: boolean
  leaderboardOpen: boolean
  roadmapOpen: boolean
  platform: 'leetcode' | 'codeforces'
  load: (username: string) => Promise<void>
  loadDemo: () => void
  setTheme: (theme: ThemeKey) => void
  toggleNight: () => void
  setMode: (mode: ViewMode) => void
  setSelection: (selection: Selection | null) => void
  setWorldSelection: (tower: StoredTower | null) => void
  setRaceOpen: (open: boolean) => void
  setInsightsOpen: (open: boolean) => void
  setLeaderboardOpen: (open: boolean) => void
  setRoadmapOpen: (open: boolean) => void
  setPlatform: (p: 'leetcode' | 'codeforces') => void
  /** Pull the real shared-world population from the backend (no-op if disabled). */
  refreshWorld: () => Promise<void>
  /** Show a city directly (used for synthetic citizens; not persisted). */
  enterCity: (data: CityData) => void
}

export const useCityStore = create<CityState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  theme: DEFAULT_THEME,
  night: true, // open in the moody night look by default; ☀️ toggle switches to day
  mode: 'city',
  selection: null,
  towers: loadTowers(),
  worldSelection: null,
  roster: [],
  remoteProfiles: [],
  raceOpen: false,
  insightsOpen: false,
  leaderboardOpen: false,
  roadmapOpen: false,
  platform: 'leetcode',

  load: async (username: string) => {
    const name = username.trim()
    if (!name) return
    if (name.toLowerCase() === 'demo') {
      const data = demoCityData()
      set({
        data,
        error: null,
        loading: false,
        selection: null,
        worldSelection: null,
        towers: saveTower(data),
      })
      return
    }
    set({ loading: true, error: null })
    const platform = get().platform
    try {
      const data =
        platform === 'codeforces'
          ? await fetchCodeforcesCity(name)
          : await fetchCityData(name)
      set({
        data,
        loading: false,
        selection: null,
        worldSelection: null,
        towers: saveTower(data),
      })
      // Shared world/leaderboard is LeetCode-based; only publish those.
      if (supabaseEnabled && platform === 'leetcode') {
        upsertProfile(data).then(() => get().refreshWorld())
      }
    } catch (err) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : `Could not reach ${platform === 'codeforces' ? 'Codeforces' : 'LeetCode'}. Try again, or type "demo".`,
      })
    }
  },

  loadDemo: () => {
    const data = demoCityData()
    set({
      data,
      error: null,
      loading: false,
      selection: null,
      worldSelection: null,
      towers: saveTower(data),
    })
  },

  setTheme: (theme) => set({ theme }),
  toggleNight: () => set((s) => ({ night: !s.night })),
  setMode: (mode) => {
    if (mode === 'world' && supabaseEnabled) void get().refreshWorld()
    set((s) => ({
      mode,
      selection: null,
      worldSelection: null,
      // Assemble opponents lazily the first time multi mode is entered.
      roster:
        mode === 'multi' && s.roster.length === 0 && s.data
          ? getRoster(s.data.username)
          : s.roster,
    }))
  },
  setSelection: (selection) => set({ selection }),
  setWorldSelection: (tower) => set({ worldSelection: tower }),
  setRaceOpen: (open) => set({ raceOpen: open }),
  setInsightsOpen: (open) => set({ insightsOpen: open }),
  setLeaderboardOpen: (open) => set({ leaderboardOpen: open }),
  setRoadmapOpen: (open) => set({ roadmapOpen: open }),
  setPlatform: (p) => set({ platform: p }),
  refreshWorld: async () => {
    if (!supabaseEnabled) return
    const profiles = await fetchProfiles()
    if (profiles.length) set({ remoteProfiles: profiles })
  },
  enterCity: (data) =>
    set({ data, mode: 'city', selection: null, worldSelection: null }),
}))
