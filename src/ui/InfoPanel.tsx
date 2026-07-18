import { useCityStore } from '../store'

const LEVEL_LABEL = {
  fundamental: 'FUNDAMENTAL',
  intermediate: 'INTERMEDIATE',
  advanced: 'ADVANCED',
} as const

export default function InfoPanel() {
  const selection = useCityStore((s) => s.selection)
  const setSelection = useCityStore((s) => s.setSelection)
  if (!selection) return null

  if (selection.gap) {
    return (
      <div className="info-panel pixel-panel">
        <button
          className="info-close"
          onClick={() => setSelection(null)}
          aria-label="Close"
          type="button"
        >
          ESC ×
        </button>
        <div className="info-title">{selection.label.toUpperCase()}</div>
        <div className="stats-sub">
          EMPTY LOT · {selection.solved} SOLVED HERE
        </div>
        <div className="info-diff hard">◼ WEAK TOPIC — BUILD HERE</div>
        <div className="card-actions">
          <a
            className="pixel-button primary"
            href={`https://leetcode.com/tag/${selection.tagSlug ?? ''}/`}
            target="_blank"
            rel="noreferrer"
          >
            ◆ START SOLVING ↗
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="info-panel pixel-panel">
      <button
        className="info-close"
        onClick={() => setSelection(null)}
        aria-label="Close"
        type="button"
      >
        ESC ×
      </button>
      <div className="info-title">{selection.label.toUpperCase()}</div>
      <div className="stats-sub">
        {LEVEL_LABEL[selection.level]} DISTRICT · {selection.solved} SOLVED
      </div>
      <div className={`info-diff ${selection.difficulty}`}>
        ◼ {selection.difficulty.toUpperCase()} BUILDING
      </div>
    </div>
  )
}
