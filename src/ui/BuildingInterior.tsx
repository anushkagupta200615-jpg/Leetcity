import { useCityStore } from '../store'
import { PROBLEMS_BY_TOPIC, TOPIC_ALIASES } from '../lib/problems'

const LEVEL_LABEL = {
  fundamental: 'FUNDAMENTAL',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED',
} as const

/** The "lobby" you see when you walk into a building and enter it. */
export default function BuildingInterior() {
  const interior = useCityStore((s) => s.interior)
  const setInterior = useCityStore((s) => s.setInterior)
  if (!interior) return null

  const key = PROBLEMS_BY_TOPIC[interior.label]
    ? interior.label
    : TOPIC_ALIASES[interior.label] ?? interior.label
  const problems = PROBLEMS_BY_TOPIC[key] ?? []
  const tagUrl = `https://leetcode.com/tag/${interior.tagSlug ?? ''}/`

  return (
    <div className="lobby-overlay" onClick={() => setInterior(null)}>
      <div className="lobby-panel pixel-panel" onClick={(e) => e.stopPropagation()}>
        <button
          className="info-close"
          onClick={() => setInterior(null)}
          type="button"
        >
          ESC ×
        </button>

        <div className="lobby-tag">🏢 YOU STEP INSIDE</div>
        <div className="lobby-title">{interior.label.toUpperCase()}</div>
        <div className="stats-sub">
          {LEVEL_LABEL[interior.level]} DISTRICT · {interior.solved} SOLVED
        </div>

        {problems.length > 0 ? (
          <div className="lobby-list">
            {problems.map((p) => (
              <a
                key={p.slug}
                className="lobby-item"
                href={`https://leetcode.com/problems/${p.slug}/`}
                target="_blank"
                rel="noreferrer"
              >
                <span className="lobby-name">{p.title}</span>
                <span className={`rm-diff ${p.difficulty.toLowerCase()}`}>
                  {p.difficulty[0]}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <div className="lobby-empty">
            No curated problems for this topic yet — browse them all on LeetCode.
          </div>
        )}

        <div className="card-actions">
          <a className="pixel-button primary" href={tagUrl} target="_blank" rel="noreferrer">
            ◆ ALL {interior.label.toUpperCase()} PROBLEMS ↗
          </a>
        </div>
      </div>
    </div>
  )
}
