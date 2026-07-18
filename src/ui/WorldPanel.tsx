import { useCityStore } from '../store'
import { trophiesFor } from '../lib/trophies'
import { cityRank } from '../lib/world'
import { levelFor, archetypeFor } from '../lib/level'
import { syntheticCityData } from '../lib/roster'

/** GitCity-style profile card shown when a tower is clicked in world view. */
export default function WorldPanel() {
  const tower = useCityStore((s) => s.worldSelection)
  const towers = useCityStore((s) => s.towers)
  const setWorldSelection = useCityStore((s) => s.setWorldSelection)
  const setMode = useCityStore((s) => s.setMode)
  const load = useCityStore((s) => s.load)
  const enterCity = useCityStore((s) => s.enterCity)
  const loading = useCityStore((s) => s.loading)
  if (!tower) return null

  const rank = cityRank(towers, tower.username)
  const lvl = levelFor(tower.all)
  const tag = archetypeFor(tower.easy, tower.medium, tower.hard, tower.all)
  const trophies = trophiesFor({
    all: tower.all,
    hard: tower.hard,
    rating: tower.rating,
  })

  const visit = async () => {
    if (tower.synthetic) {
      enterCity(syntheticCityData(tower.username))
      return
    }
    await load(tower.username)
    setMode('city')
  }

  return (
    <div className="profile-card pixel-panel">
      <button
        className="info-close"
        onClick={() => setWorldSelection(null)}
        aria-label="Close"
        type="button"
      >
        ESC ×
      </button>

      <div className="pc-head">
        <div className="pc-avatar">{tower.username[0]?.toUpperCase()}</div>
        <div className="pc-id">
          <div className="pc-name">{tower.username.toUpperCase()}</div>
          <div className="pc-handle">
            {tower.synthetic ? 'CITIZEN' : `@${tower.username}`}
            {(tower.recent ?? 1) === 0 && ' · 💤 INACTIVE'}
          </div>
        </div>
      </div>

      <div className="pc-level">
        <div className="pc-lvl-badge">{lvl.level}</div>
        <div className="pc-lvl-info">
          <div className="pc-lvl-title">
            LV {lvl.level} · {lvl.name}
          </div>
          <div className="pc-xpbar">
            <div
              className="pc-xpfill"
              style={{ width: `${Math.round(lvl.progress * 100)}%` }}
            />
          </div>
          <div className="pc-xptext">
            {lvl.nextAt
              ? `${tower.all} / ${lvl.nextAt} TO NEXT`
              : `${tower.all} SOLVED · MAX`}
          </div>
        </div>
      </div>

      <div className="pc-tag">◆ {tag}</div>

      <div className="stats-grid six pc-stats">
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
        <>
          <div className="pc-section">TROPHIES · {trophies.length}</div>
          <div className="trophies">
            {trophies.map((t) => (
              <span key={t} className="trophy">
                {t}
              </span>
            ))}
          </div>
        </>
      )}

      <div className="pc-actions">
        <button
          className="pixel-button primary"
          onClick={visit}
          disabled={loading}
          type="button"
        >
          {loading ? 'BUILDING…' : '◆ EXPLORE CITY'}
        </button>
        {tower.synthetic ? (
          <button
            className="pixel-button"
            onClick={() => setWorldSelection(null)}
            type="button"
          >
            CLOSE
          </button>
        ) : (
          <a
            className="pixel-button"
            href={`https://leetcode.com/u/${tower.username}/`}
            target="_blank"
            rel="noreferrer"
          >
            PROFILE ↗
          </a>
        )}
      </div>
    </div>
  )
}
