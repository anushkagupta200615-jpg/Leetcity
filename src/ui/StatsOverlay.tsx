import { useCityStore } from '../store'
import { recentActivity } from '../lib/leetcode'

export default function StatsOverlay() {
  const data = useCityStore((s) => s.data)
  if (!data) return null

  const recent = recentActivity(data.calendar, 30)

  return (
    <div className="stats-overlay">
      <div className="stats-header">
        {data.avatarUrl && <img src={data.avatarUrl} alt="" />}
        <div>
          <div className="stats-name">
            {data.username}
            {data.isDemo && <span className="demo-badge">demo</span>}
          </div>
          <div className="stats-sub">{data.totals.all} problems solved</div>
        </div>
      </div>
      <div className="stats-grid">
        <div className="stat easy">
          <span>{data.totals.easy}</span> Easy
        </div>
        <div className="stat medium">
          <span>{data.totals.medium}</span> Medium
        </div>
        <div className="stat hard">
          <span>{data.totals.hard}</span> Hard
        </div>
      </div>
      <div className="stats-footer">
        {data.contest ? (
          <div>
            ⚡ {data.contest.rating} rating · top{' '}
            {data.contest.topPercentage.toFixed(1)}%
          </div>
        ) : (
          <div>No contest history</div>
        )}
        <div>
          🔥 {recent} submissions in 30 days
          {data.streak > 0 ? ` · ${data.streak}-day streak` : ''}
        </div>
      </div>
    </div>
  )
}
