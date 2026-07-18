import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useCityStore } from '../store'
import {
  botOpponents,
  loadTotals,
  makeChannel,
  pickProblem,
  pointsForOrder,
  saveTotals,
  type RaceMessage,
  type Solver,
} from '../lib/race'

export default function RacePanel() {
  const open = useCityStore((s) => s.raceOpen)
  const setRaceOpen = useCityStore((s) => s.setRaceOpen)
  const you = useCityStore((s) => s.data?.username) || 'you'

  const [round, setRound] = useState(0)
  const [solvers, setSolvers] = useState<Solver[]>([])
  const [totals, setTotals] = useState<Record<string, number>>(() => loadTotals())

  const problem = useMemo(() => pickProblem(round), [round])
  const bots = useMemo(() => botOpponents(you), [you])
  const startRef = useRef(0)
  const timersRef = useRef<number[]>([])
  const channelRef = useRef<BroadcastChannel | null>(null)

  const youSolved = solvers.some((s) => s.isYou)

  const addSolver = useCallback(
    (name: string, isYou: boolean) => {
      setSolvers((prev) => {
        if (prev.some((s) => s.name.toLowerCase() === name.toLowerCase())) return prev
        const order = prev.length + 1
        const points = pointsForOrder(order)
        const at = Date.now() - startRef.current
        setTotals((t) => {
          const next = { ...t, [name]: (t[name] ?? 0) + points }
          saveTotals(next)
          return next
        })
        return [...prev, { name, order, points, at, isYou }]
      })
    },
    [],
  )

  // Set up each round: reset, schedule bot solves, listen for cross-tab solves.
  useEffect(() => {
    if (!open) return
    setSolvers([])
    startRef.current = Date.now()

    timersRef.current.forEach(clearTimeout)
    timersRef.current = bots.map((bot) =>
      window.setTimeout(() => addSolver(bot, false), 2200 + Math.random() * 14000),
    )

    const ch = makeChannel()
    channelRef.current = ch
    if (ch) {
      ch.onmessage = (e: MessageEvent<RaceMessage>) => {
        const msg = e.data
        if (msg?.type === 'solved' && msg.round === round) addSolver(msg.name, false)
      }
    }

    return () => {
      timersRef.current.forEach(clearTimeout)
      timersRef.current = []
      ch?.close()
      channelRef.current = null
    }
  }, [open, round, bots, addSolver])

  if (!open) return null

  const markSolved = () => {
    if (youSolved) return
    addSolver(you, true)
    channelRef.current?.postMessage({
      type: 'solved',
      round,
      name: you,
      at: Date.now() - startRef.current,
    } satisfies RaceMessage)
  }

  const nextProblem = () => setRound((r) => r + 1)

  const totalBoard = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)

  const diffClass = problem.difficulty.toLowerCase()

  return (
    <div className="race-overlay" onClick={() => setRaceOpen(false)}>
      <div className="race-modal pixel-panel" onClick={(e) => e.stopPropagation()}>
        <button
          className="info-close"
          onClick={() => setRaceOpen(false)}
          type="button"
          aria-label="Close race"
        >
          ESC ×
        </button>

        <div className="race-title">🏁 DSA RACE</div>
        <div className="race-sub">FIRST TO SOLVE WINS · 10 / 7 / 5 / 3 / 2 PTS</div>

        <div className="race-problem">
          <div>
            <div className="race-problem-name">{problem.title}</div>
            <span className={`race-diff ${diffClass}`}>
              {problem.difficulty.toUpperCase()}
            </span>
          </div>
          <a
            className="pixel-button"
            href={`https://leetcode.com/problems/${problem.slug}/`}
            target="_blank"
            rel="noreferrer"
          >
            OPEN ↗
          </a>
        </div>

        <div className="race-actions">
          <button
            className={`pixel-button ${youSolved ? '' : 'primary'}`}
            onClick={markSolved}
            disabled={youSolved}
            type="button"
          >
            {youSolved ? '✓ YOU SOLVED IT' : '◆ MARK SOLVED'}
          </button>
          <button className="pixel-button" onClick={nextProblem} type="button">
            NEXT PROBLEM →
          </button>
        </div>

        <div className="race-cols">
          <div className="race-col">
            <div className="race-col-head">THIS PROBLEM</div>
            {solvers.length === 0 && <div className="race-empty">Racing… no solvers yet</div>}
            {solvers.map((s) => (
              <div key={s.name} className={`race-row ${s.isYou ? 'you' : ''}`}>
                <span className="race-order">#{s.order}</span>
                <span className="race-name">
                  {s.isYou ? `${s.name} (you)` : s.name}
                </span>
                <span className="race-pts">+{s.points}</span>
                <span className="race-time">{(s.at / 1000).toFixed(1)}s</span>
              </div>
            ))}
            {bots.length + 1 > solvers.length && solvers.length > 0 && (
              <div className="race-empty">
                {bots.length + 1 - solvers.length} still racing…
              </div>
            )}
          </div>

          <div className="race-col">
            <div className="race-col-head">TOTAL SCORE</div>
            {totalBoard.length === 0 && <div className="race-empty">No points yet</div>}
            {totalBoard.map(([name, pts], i) => (
              <div
                key={name}
                className={`race-row ${name.toLowerCase() === you.toLowerCase() ? 'you' : ''}`}
              >
                <span className="race-order">{i + 1}</span>
                <span className="race-name">{name}</span>
                <span className="race-pts">{pts}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="race-foot">
          Opponents are simulated for v1 · open a second tab to race for real
        </div>
      </div>
    </div>
  )
}
