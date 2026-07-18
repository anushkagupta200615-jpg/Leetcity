import { useEffect, useMemo, useState } from 'react'
import { useCityStore } from '../store'
import { fetchRecentAc } from '../lib/leetcode'
import {
  ROADMAPS,
  ROADMAP_NAMES,
  loadDone,
  saveDone,
  problemUrl,
  type RoadmapProblem,
} from '../lib/roadmaps'

export default function RoadmapPanel() {
  const open = useCityStore((s) => s.roadmapOpen)
  const setOpen = useCityStore((s) => s.setRoadmapOpen)
  const data = useCityStore((s) => s.data)
  const username = data && !data.isDemo ? data.username : ''

  const [roadmap, setRoadmap] = useState(ROADMAP_NAMES[0])
  const [done, setDone] = useState<Set<string>>(() => loadDone(ROADMAP_NAMES[0]))
  const [autoMsg, setAutoMsg] = useState('')

  const problems = ROADMAPS[roadmap]

  // Reload progress when switching roadmaps.
  useEffect(() => {
    setDone(loadDone(roadmap))
    setAutoMsg('')
  }, [roadmap])

  // Auto-detect solved roadmap problems from the user's recent submissions.
  useEffect(() => {
    if (!open || !username) return
    let cancelled = false
    fetchRecentAc(username, 20)
      .then((subs) => {
        if (cancelled) return
        const slugs = new Set(subs.map((s) => s.titleSlug))
        const hits = problems.filter((p) => slugs.has(p.slug))
        if (hits.length) {
          setDone((prev) => {
            const next = new Set(prev)
            hits.forEach((h) => next.add(h.slug))
            saveDone(roadmap, next)
            return next
          })
          setAutoMsg(`✓ auto-detected ${hits.length} from your recent submissions`)
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [open, username, roadmap, problems])

  const groups = useMemo(() => {
    const m = new Map<string, RoadmapProblem[]>()
    for (const p of problems) {
      if (!m.has(p.group)) m.set(p.group, [])
      m.get(p.group)!.push(p)
    }
    return [...m.entries()]
  }, [problems])

  if (!open) return null

  const toggle = (slug: string) => {
    setDone((prev) => {
      const next = new Set(prev)
      if (next.has(slug)) next.delete(slug)
      else next.add(slug)
      saveDone(roadmap, next)
      return next
    })
  }

  const solved = problems.filter((p) => done.has(p.slug)).length
  const pct = Math.round((solved / problems.length) * 100)

  return (
    <div className="rm-overlay" onClick={() => setOpen(false)}>
      <div className="rm-modal pixel-panel" onClick={(e) => e.stopPropagation()}>
        <button className="info-close" onClick={() => setOpen(false)} type="button">
          ESC ×
        </button>

        <div className="rm-title">🗺 ROADMAP</div>
        <div className="rm-head-row">
          <select value={roadmap} onChange={(e) => setRoadmap(e.target.value)}>
            {ROADMAP_NAMES.map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          <div className="rm-count">
            {solved} / {problems.length}
          </div>
        </div>

        <div className="rm-bar">
          <div className="rm-bar-fill" style={{ width: `${pct}%` }} />
          <span>{pct}%</span>
        </div>
        {autoMsg && <div className="rm-auto">{autoMsg}</div>}
        {!username && (
          <div className="rm-auto">
            Load your real LeetCode username to auto-detect solved problems.
          </div>
        )}

        <div className="rm-groups">
          {groups.map(([group, items]) => {
            const gDone = items.filter((p) => done.has(p.slug)).length
            return (
              <div key={group} className="rm-group">
                <div className="rm-group-h">
                  {group} <em>{gDone}/{items.length}</em>
                </div>
                {items.map((p) => (
                  <div key={p.slug} className={`rm-item ${done.has(p.slug) ? 'done' : ''}`}>
                    <button
                      className="rm-check"
                      onClick={() => toggle(p.slug)}
                      type="button"
                      aria-label={done.has(p.slug) ? 'Mark undone' : 'Mark done'}
                    >
                      {done.has(p.slug) ? '✓' : ''}
                    </button>
                    <a
                      className="rm-name"
                      href={problemUrl(p)}
                      target="_blank"
                      rel="noreferrer"
                      title="Open problem"
                    >
                      {p.title} <span className="rm-go">↗</span>
                    </a>
                    <span className={`rm-diff ${p.difficulty.toLowerCase()}`}>
                      {p.difficulty[0]}
                    </span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        <div className="rm-foot">
          Progress is saved on this device. Solving on LeetCode auto-checks items on
          your next visit; tap the box to mark any problem yourself.
        </div>
      </div>
    </div>
  )
}
