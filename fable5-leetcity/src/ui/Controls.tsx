import { THEMES, type ThemeKey } from '../lib/themes'
import { useCityStore } from '../store'

export default function Controls() {
  const theme = useCityStore((s) => s.theme)
  const night = useCityStore((s) => s.night)
  const setTheme = useCityStore((s) => s.setTheme)
  const toggleNight = useCityStore((s) => s.toggleNight)

  return (
    <div className="controls">
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
