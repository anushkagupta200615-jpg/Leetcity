import { useCallback, useEffect, useMemo, useState } from 'react'
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
  const [scanning, setScanning] = useState(false)

  const problems = ROADMAPS[roadmap]

  // Reload progress when switching roadmaps.
  useEffect(() => {
    setDone(loadDone(roadmap))
    setAutoMsg('')
  }, [roadmap])

  // Scan LeetCode's recent-accepted feed and check off any roadmap problems
  // found. LeetCode's public API only exposes recently-accepted submissions
  // (not a full solved history), so we request as many as it will return and
  // tell the user plainly what was — and wasn't — matched.
  const scan = useCallback(async () => {
    if (!username || scanning) return
    setScanning(true)
    setAutoMsg('Checking your LeetCode submissions…')
    try {
      const subs = await fetchRecentAc(username, 500)
      const slugs = new Set(subs.map((s) => s.titleSlug))
      const hits = problems.filter((p) => slugs.has(p.slug))
      if (hits.length) {
        setDone((prev) => {
          const next = new Set(prev)
          hits.forEach((h) => next.add(h.slug))
          saveDone(roadmap, next)
          return next
        })
      }
      setAutoMsg(
        `✓ Matched ${hits.length} solved from your ${subs.length} most recent accepted submissions. ` +
          `LeetCode only shares recent solves publicly — older ones won't show up, so tick those off yourself.`,
      )
    } catch {
      setAutoMsg('Could not reach LeetCode just now — mark problems yourself, or try again.')
    } finally {
      setScanning(false)
    }
  }, [username, scanning, problems, roadmap])

  // Auto-scan once when the panel opens for a real user / roadmap change.
  useEffect(() => {
    if (!open || !username) return
    void scan()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, username, roadmap])

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
        {username && (
          <button
            className="rm-scan"
            type="button"
            onClick={() => void scan()}
            disabled={scanning}
          >
            {scanning ? '⟳ Scanning…' : '⟳ Re-scan my LeetCode solves'}
          </button>
        )}
        {autoMsg && <div className="rm-auto">{autoMsg}</div>}
        {!username && (
          <div className="rm-auto">
            Load your real LeetCode username to auto-detect solved problems from
            your recent submissions.
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
          Progress is saved on this device. Auto-scan checks off problems found in
          your <b>recent</b> LeetCode submissions — LeetCode doesn't expose a full
          solved history publicly, so tap the box to mark anything it misses.
        </div>
      </div>
    </div>
  )
}
