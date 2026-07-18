import { useRef, type PointerEvent } from 'react'
import { useCityStore } from '../store'
import { walk, resetJoystick } from '../lib/walkControls'

const BASE = 120
const R = BASE / 2

/** On-screen joystick + action buttons for walk mode (touch and mouse). */
export default function WalkHud() {
  const firstPerson = useCityStore((s) => s.firstPerson)
  const toggleFirstPerson = useCityStore((s) => s.toggleFirstPerson)
  const nearBuilding = useCityStore((s) => s.nearBuilding)
  const interior = useCityStore((s) => s.interior)
  const setInterior = useCityStore((s) => s.setInterior)
  const setWalk = useCityStore((s) => s.setWalk)

  const thumbRef = useRef<HTMLDivElement>(null)
  const activeId = useRef<number | null>(null)

  const setThumb = (dx: number, dy: number) => {
    if (thumbRef.current)
      thumbRef.current.style.transform = `translate(${dx}px, ${dy}px)`
  }

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (activeId.current !== e.pointerId) return
    const rect = e.currentTarget.getBoundingClientRect()
    let dx = e.clientX - (rect.left + R)
    let dy = e.clientY - (rect.top + R)
    const len = Math.hypot(dx, dy)
    const max = R - 10
    if (len > max) {
      dx *= max / len
      dy *= max / len
    }
    setThumb(dx, dy)
    walk.joyX = dx / max
    walk.joyZ = dy / max
  }

  const start = (e: PointerEvent<HTMLDivElement>) => {
    activeId.current = e.pointerId
    e.currentTarget.setPointerCapture(e.pointerId)
    move(e)
  }

  const end = (e: PointerEvent<HTMLDivElement>) => {
    if (activeId.current !== e.pointerId) return
    activeId.current = null
    resetJoystick()
    setThumb(0, 0)
  }

  return (
    <div className="walkhud">
      <div
        className="joystick"
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
      >
        <div className="joystick-thumb" ref={thumbRef} />
      </div>

      <div className="walkhud-actions">
        {nearBuilding && !interior && (
          <button
            type="button"
            className="walk-action enter"
            onClick={() => setInterior(nearBuilding)}
          >
            ⏎ ENTER
          </button>
        )}
        <button
          type="button"
          className={`walk-action ${firstPerson ? 'on' : ''}`}
          onClick={toggleFirstPerson}
          title="Toggle first-person view (V)"
        >
          {firstPerson ? '◉ 1ST' : '◎ 3RD'}
        </button>
        <button type="button" className="walk-action" onClick={() => setWalk(false)}>
          ✕ EXIT
        </button>
      </div>
    </div>
  )
}
