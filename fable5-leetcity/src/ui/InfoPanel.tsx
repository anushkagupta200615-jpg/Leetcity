import { useCityStore } from '../store'

const LEVEL_LABEL = {
  fundamental: 'Fundamental',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
} as const

export default function InfoPanel() {
  const selection = useCityStore((s) => s.selection)
  const setSelection = useCityStore((s) => s.setSelection)
  if (!selection) return null

  return (
    <div className="info-panel">
      <button
        className="info-close"
        onClick={() => setSelection(null)}
        aria-label="Close"
        type="button"
      >
        ×
      </button>
      <div className="info-title">{selection.label}</div>
      <div className="info-sub">
        {LEVEL_LABEL[selection.level]} topic · {selection.solved} solved
      </div>
      <div className={`info-diff ${selection.difficulty}`}>
        This building: {selection.difficulty}
      </div>
    </div>
  )
}
