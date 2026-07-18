import { create } from 'zustand'
import type { CityData, Selection } from './types'
import { demoCityData, fetchCityData } from './lib/leetcode'
import { DEFAULT_THEME, type ThemeKey } from './lib/themes'

interface CityState {
  data: CityData | null
  loading: boolean
  error: string | null
  theme: ThemeKey
  night: boolean
  selection: Selection | null
  load: (username: string) => Promise<void>
  loadDemo: () => void
  setTheme: (theme: ThemeKey) => void
  toggleNight: () => void
  setSelection: (selection: Selection | null) => void
}

export const useCityStore = create<CityState>((set) => ({
  data: null,
  loading: false,
  error: null,
  theme: DEFAULT_THEME,
  night: false,
  selection: null,

  load: async (username: string) => {
    const name = username.trim()
    if (!name) return
    if (name.toLowerCase() === 'demo') {
      set({ data: demoCityData(), error: null, loading: false, selection: null })
      return
    }
    set({ loading: true, error: null })
    try {
      const data = await fetchCityData(name)
      set({ data, loading: false, selection: null })
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

  loadDemo: () =>
    set({ data: demoCityData(), error: null, loading: false, selection: null }),

  setTheme: (theme) => set({ theme }),
  toggleNight: () => set((s) => ({ night: !s.night })),
  setSelection: (selection) => set({ selection }),
}))
