import { useCityStore } from '../store'
import { trophiesFor } from '../lib/trophies'
import { cityRank } from '../lib/world'

/** GitCity-style card shown when a tower is clicked in world view. */
export default function WorldPanel() {
  const tower = useCityStore((s) => s.worldSelection)
  const towers = useCityStore((s) => s.towers)
  const setWorldSelection = useCityStore((s) => s.setWorldSelection)
  const setMode = useCityStore((s) => s.setMode)
  const load = useCityStore((s) => s.load)
  const loading = useCityStore((s) => s.loading)
  if (!tower) return null

  const rank = cityRank(towers, tower.username)

  const trophies = trophiesFor({
    all: tower.all,
    hard: tower.hard,
    rating: tower.rating,
  })

  const visit = async () => {
    await load(tower.username)
    setMode('city')
  }

  return (
    <div className="info-panel pixel-panel">
      <button
        className="info-close"
        onClick={() => setWorldSelection(null)}
        aria-label="Close"
        type="button"
      >
        ESC ×
      </button>
      <div className="stats-header">
        <div className="avatar-fallback">{tower.username[0]?.toUpperCase()}</div>
        <div>
          <div className="stats-name">{tower.username.toUpperCase()}</div>
          <div className="stats-sub">
            PLOT #{tower.plot}
            {(tower.recent ?? 1) === 0 && ' · 💤 INACTIVE'}
          </div>
        </div>
      </div>

      <div className="stats-grid six">
        <div className="stat">
          <span>{tower.all}</span> SOLVED
        </div>
        <div className="stat easy">
          <span>{tower.easy}</span> EASY
        </div>
        <div className="stat medium">
          <span>{tower.medium}</span> MED
        </div>
        <div className="stat hard">
          <span>{tower.hard}</span> HARD
        </div>
        <div className="stat accent">
          <span>{tower.rating > 0 ? tower.rating : '—'}</span> RATING
        </div>
        <div className="stat">
          <span>{rank > 0 ? `#${rank}` : '—'}</span> IN CITY
        </div>
      </div>

      {trophies.length > 0 && (
        <div className="trophies">
          {trophies.map((t) => (
            <span key={t} className="trophy">
              {t}
            </span>
          ))}
        </div>
      )}

      <div className="card-actions">
        <button
          className="pixel-button primary"
          onClick={visit}
          disabled={loading}
          type="button"
        >
          {loading ? 'BUILDING…' : '◆ EXPLORE CITY'}
        </button>
        <a
          className="pixel-button"
          href={`https://leetcode.com/u/${tower.username}/`}
          target="_blank"
          rel="noreferrer"
        >
          PROFILE ↗
        </a>
      </div>
    </div>
  )
}
