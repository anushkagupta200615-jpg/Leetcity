import { useMemo, useState } from 'react'
import { useCityStore } from '../store'
import {
  paceProjection,
  gapRecommendations,
  companyReadiness,
  standing,
  wrappedStory,
} from '../lib/insights'
import { COMPANIES } from '../lib/problems'

export default function InsightsPanel() {
  const open = useCityStore((s) => s.insightsOpen)
  const setOpen = useCityStore((s) => s.setInsightsOpen)
  const data = useCityStore((s) => s.data)
  const [company, setCompany] = useState(COMPANIES[0])

  const pace = useMemo(() => (data ? paceProjection(data) : null), [data])
  const gaps = useMemo(() => (data ? gapRecommendations(data) : []), [data])
  const readiness = useMemo(
    () => (data ? companyReadiness(data, company) : null),
    [data, company],
  )
  const stand = useMemo(() => (data ? standing(data) : null), [data])
  const story = useMemo(() => (data ? wrappedStory(data) : []), [data])

  if (!open || !data) return null

  return (
    <div className="ins-overlay" onClick={() => setOpen(false)}>
      <div className="ins-modal pixel-panel" onClick={(e) => e.stopPropagation()}>
        <button
          className="info-close"
          onClick={() => setOpen(false)}
          type="button"
          aria-label="Close insights"
        >
          ESC ×
        </button>

        <div className="ins-title">📊 INSIGHTS · {data.username.toUpperCase()}</div>
        <div className="ins-note">Estimates from public profile data — a guide, not gospel.</div>

        {/* Standing */}
        {stand && (
          <section className="ins-section">
            <div className="ins-h">YOUR STANDING</div>
            <div className="ins-standing">
              <div className="ins-big">
                TOP <span>{stand.percentile}%</span>
                <em>estimated</em>
              </div>
              <div className="ins-sw">
                <div>
                  <span className="ins-lbl">STRONGEST</span>
                  {stand.strengths.join(' · ') || '—'}
                </div>
                <div>
                  <span className="ins-lbl">UNDER-INVESTED</span>
                  {stand.weaknesses.join(' · ') || '—'}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Pace */}
        {pace && (
          <section className="ins-section">
            <div className="ins-h">PACE</div>
            {pace.active ? (
              <div className="ins-pace">
                ~<b>{pace.perWeek}</b> solves/week · reaching <b>{pace.targetLabel}</b>
                {pace.weeksToTarget
                  ? ` in ~${pace.weeksToTarget} week${pace.weeksToTarget === 1 ? '' : 's'}`
                  : ''}
              </div>
            ) : (
              <div className="ins-pace muted">
                No recent activity — solve a few to project your pace to {pace.targetLabel}.
              </div>
            )}
          </section>
        )}

        {/* Company readiness */}
        {readiness && (
          <section className="ins-section">
            <div className="ins-h ins-h-row">
              INTERVIEW READINESS
              <select value={company} onChange={(e) => setCompany(e.target.value)}>
                {COMPANIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="ins-ready">
              <div className="ins-bar">
                <div className="ins-bar-fill" style={{ width: `${readiness.score}%` }} />
                <span>{readiness.score}%</span>
              </div>
              {readiness.focus.length > 0 && (
                <div className="ins-focus">
                  FOCUS:{' '}
                  {readiness.focus
                    .map((f) => `${f.topic} (${f.solved})`)
                    .join(' · ')}
                </div>
              )}
            </div>
          </section>
        )}

        {/* Gap recommendations */}
        {gaps.length > 0 && (
          <section className="ins-section">
            <div className="ins-h">SOLVE NEXT — FILL YOUR GAPS</div>
            <div className="ins-gaps">
              {gaps.map((g) => (
                <div key={g.topic} className="ins-gap">
                  <div className="ins-gap-topic">
                    {g.topic} <em>· {g.solved} solved</em>
                  </div>
                  <div className="ins-gap-probs">
                    {g.problems.map((p) => (
                      <a
                        key={p.slug}
                        className={`ins-prob ${p.difficulty.toLowerCase()}`}
                        href={`https://leetcode.com/problems/${p.slug}/`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {p.title} ↗
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Wrapped */}
        {story.length > 0 && (
          <section className="ins-section">
            <div className="ins-h">YOUR CITY, WRAPPED</div>
            <div className="ins-story">
              {story.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
