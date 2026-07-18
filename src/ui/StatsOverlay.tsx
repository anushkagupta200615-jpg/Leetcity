import { useCityStore } from '../store'
import { recentActivity } from '../lib/leetcode'
import { trophiesFor } from '../lib/trophies'
import { cityRank } from '../lib/world'

export default function StatsOverlay() {
  const data = useCityStore((s) => s.data)
  const towers = useCityStore((s) => s.towers)
  if (!data) return null

  const recent = recentActivity(data.calendar, 30)
  const rank = cityRank(towers, data.username)
  const topTopics = data.topics.slice(0, 3).map((t) => t.label.toUpperCase())
  const trophies = trophiesFor({
    all: data.totals.all,
    hard: data.totals.hard,
    rating: data.contest?.rating ?? 0,
    streak: data.streak,
  })

  return (
    <div className="stats-overlay pixel-panel">
      <div className="stats-header">
        {data.avatarUrl ? (
          <img src={data.avatarUrl} alt="" />
        ) : (
          <div className="avatar-fallback">{data.username[0]?.toUpperCase()}</div>
        )}
        <div>
          <div className="stats-name">
            {data.username.toUpperCase()}
            {data.isDemo && <span className="demo-badge">DEMO</span>}
          </div>
          <div className="stats-sub">
            {data.ranking > 0
              ? `GLOBAL #${data.ranking.toLocaleString()}`
              : 'UNRANKED'}
            {rank > 0 && ` · #${rank} IN CITY`}
          </div>
        </div>
      </div>

      <div className="stats-grid six">
        <div className="stat">
          <span>{data.totals.all}</span> SOLVED
        </div>
        <div className="stat easy">
          <span>{data.totals.easy}</span> EASY
        </div>
        <div className="stat medium">
          <span>{data.totals.medium}</span> MED
        </div>
        <div className="stat hard">
          <span>{data.totals.hard}</span> HARD
        </div>
        <div className="stat accent">
          <span>{data.contest ? data.contest.rating : '—'}</span> RATING
        </div>
        <div className="stat">
          <span>{data.acceptance > 0 ? `${data.acceptance.toFixed(0)}%` : '—'}</span> ACC
        </div>
      </div>

      {topTopics.length > 0 && (
        <div className="stats-sub">TOP: {topTopics.join(' · ')}</div>
      )}

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
        {!data.isDemo && (
          <a
            className="pixel-button"
            href={`https://leetcode.com/u/${data.username}/`}
            target="_blank"
            rel="noreferrer"
          >
            PROFILE ↗
          </a>
        )}
        <span className="stats-foot">
          {recent} IN 30D
          {data.streak > 0 ? ` · ${data.streak}D STREAK` : ''}
          {data.contest ? ` · TOP ${data.contest.topPercentage.toFixed(1)}%` : ''}
        </span>
      </div>
    </div>
  )
}
