import { create } from 'zustand'
import type { CityData } from './types'
import { demoCityData, fetchCityData } from './lib/leetcode'

interface CityState {
  data: CityData | null
  loading: boolean
  error: string | null
  load: (username: string) => Promise<void>
  loadDemo: () => void
}

export const useCityStore = create<CityState>((set) => ({
  data: null,
  loading: false,
  error: null,

  load: async (username: string) => {
    const name = username.trim()
    if (!name) return
    if (name.toLowerCase() === 'demo') {
      set({ data: demoCityData(), error: null, loading: false })
      return
    }
    set({ loading: true, error: null })
    try {
      const data = await fetchCityData(name)
      set({ data, loading: false })
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

  loadDemo: () => set({ data: demoCityData(), error: null, loading: false }),
}))
