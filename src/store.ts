import { create } from 'zustand'
import type { CityData, Selection, StoredTower } from './types'
import { demoCityData, fetchCityData } from './lib/leetcode'
import { loadTowers, saveTower } from './lib/world'
import { getRoster } from './lib/roster'
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
  raceOpen: boolean
  load: (username: string) => Promise<void>
  loadDemo: () => void
  setTheme: (theme: ThemeKey) => void
  toggleNight: () => void
  setMode: (mode: ViewMode) => void
  setSelection: (selection: Selection | null) => void
  setWorldSelection: (tower: StoredTower | null) => void
  setRaceOpen: (open: boolean) => void
}

export const useCityStore = create<CityState>((set) => ({
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
  raceOpen: false,

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
    try {
      const data = await fetchCityData(name)
      set({
        data,
        loading: false,
        selection: null,
        worldSelection: null,
        towers: saveTower(data),
      })
    } catch (err) {
      set({
        loading: false,
        error:
          err instanceof Error
            ? err.message
            : 'Could not reach LeetCode. Try again, or type "demo" to explore a sample city.',
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
  setMode: (mode) =>
    set((s) => ({
      mode,
      selection: null,
      worldSelection: null,
      // Assemble opponents lazily the first time multi mode is entered.
      roster:
        mode === 'multi' && s.roster.length === 0 && s.data
          ? getRoster(s.data.username)
          : s.roster,
    })),
  setSelection: (selection) => set({ selection }),
  setWorldSelection: (tower) => set({ worldSelection: tower }),
  setRaceOpen: (open) => set({ raceOpen: open }),
}))
