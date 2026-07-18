import { THEMES, type ThemeKey } from '../lib/themes'
import { supabaseEnabled } from '../lib/supabase'
import { useCityStore } from '../store'

const MODES: Array<{ key: 'city' | 'world' | 'multi'; label: string; title: string }> = [
  { key: 'city', label: '🏙 City', title: 'Your city' },
  { key: 'world', label: '🌍 World', title: 'Shared world of towers' },
  { key: 'multi', label: '👥 Versus', title: 'Compare cities side by side' },
]

export default function Controls() {
  const theme = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const mode = useCityStore((s) => s.mode)
  const walk = useCityStore((s) => s.walk)
  const setTheme = useCityStore((s) => s.setTheme)
  const toggleNight = useCityStore((s) => s.toggleNight)
  const setMode = useCityStore((s) => s.setMode)
  const setWalk = useCityStore((s) => s.setWalk)
  const setRaceOpen = useCityStore((s) => s.setRaceOpen)
  const setInsightsOpen = useCityStore((s) => s.setInsightsOpen)
  const setLeaderboardOpen = useCityStore((s) => s.setLeaderboardOpen)
  const setRoadmapOpen = useCityStore((s) => s.setRoadmapOpen)

  return (
    <div className="controls">
      <div className="mode-group">
        {MODES.map((m) => (
          <button
            key={m.key}
            type="button"
            className={`mode-btn ${mode === m.key ? 'active' : ''}`}
            onClick={() => setMode(m.key)}
            title={m.title}
          >
            {m.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="insights-btn"
        onClick={() => setInsightsOpen(true)}
        title="Insights: pace, gaps, readiness, resume"
      >
        📊 Insights
      </button>
      <button
        type="button"
        className="roadmap-btn"
        onClick={() => setRoadmapOpen(true)}
        title="Study roadmaps (Blind 75, Grind 75, NeetCode 150/250, Striver SDE)"
      >
        🗺 Roadmap
      </button>
      {supabaseEnabled && (
        <button
          type="button"
          className="lb-btn"
          onClick={() => setLeaderboardOpen(true)}
          title="Global leaderboard"
        >
          🏆 Ranks
        </button>
      )}
      <button
        type="button"
        className="race-btn"
        onClick={() => setRaceOpen(true)}
        title="DSA race mode"
      >
        🏁 Race
      </button>
      <button
        type="button"
        className={`walk-btn ${walk ? 'active' : ''}`}
        onClick={() => setWalk(!walk)}
        title="Walk mode: drive a character around your city (WASD / arrows)"
      >
        🚶 {walk ? 'Exit' : 'Walk'}
      </button>
      <select
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeKey)}
        aria-label="Color theme"
      >
        {Object.values(THEMES).map((t) => (
          <option key={t.key} value={t.key}>
            {t.name}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={toggleNight}
        aria-label={night ? 'Switch to day' : 'Switch to night'}
        title={night ? 'Switch to day' : 'Switch to night'}
      >
        {night ? '☀️' : '🌙'}
      </button>
    </div>
  )
}
