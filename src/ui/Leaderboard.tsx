import { useCityStore } from '../store'
import { towerScore } from '../lib/world'

/** Global leaderboard of real users, from the shared backend. */
export default function Leaderboard() {
  const open = useCityStore((s) => s.leaderboardOpen)
  const setOpen = useCityStore((s) => s.setLeaderboardOpen)
  const profiles = useCityStore((s) => s.remoteProfiles)
  const you = useCityStore((s) => s.data?.username ?? '')
  const setWorldSelection = useCityStore((s) => s.setWorldSelection)
  const setMode = useCityStore((s) => s.setMode)
  if (!open) return null

  const ranked = [...profiles]
    .sort((a, b) => towerScore(b.easy, b.medium, b.hard) - towerScore(a.easy, a.medium, a.hard))
    .slice(0, 50)

  const visit = (name: string) => {
    const t = profiles.find((p) => p.username === name)
    if (t) {
      setMode('world')
      setWorldSelection(t)
      setOpen(false)
    }
  }

  return (
    <div className="lb-overlay" onClick={() => setOpen(false)}>
      <div className="lb-modal pixel-panel" onClick={(e) => e.stopPropagation()}>
        <button
          className="info-close"
          onClick={() => setOpen(false)}
          type="button"
          aria-label="Close leaderboard"
        >
          ESC ×
        </button>
        <div className="lb-title">🏆 GLOBAL LEADERBOARD</div>
        <div className="lb-sub">
          {ranked.length} citizens · ranked by difficulty-weighted solves
        </div>

        {ranked.length === 0 ? (
          <div className="lb-empty">
            No citizens yet — be the first! Build a city and you'll appear here.
          </div>
        ) : (
          <div className="lb-list">
            <div className="lb-head">
              <span>#</span>
              <span>USER</span>
              <span>SOLVED</span>
              <span>RATING</span>
            </div>
            {ranked.map((p, i) => (
              <button
                key={p.username}
                className={`lb-row ${p.username.toLowerCase() === you.toLowerCase() ? 'you' : ''}`}
                onClick={() => visit(p.username)}
                type="button"
                title="Visit their tower"
              >
                <span className={`lb-rank ${i < 3 ? 'top' : ''}`}>{i + 1}</span>
                <span className="lb-name">{p.username}</span>
                <span className="lb-solved">{p.all}</span>
                <span className="lb-rating">{p.rating || '—'}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
