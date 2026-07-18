import { useEffect } from 'react'
import { useCityStore } from './store'
import Scene from './scene/Scene'
import UsernameForm from './ui/UsernameForm'
import StatsOverlay from './ui/StatsOverlay'
import ShareButton from './ui/ShareButton'
import Controls from './ui/Controls'
import InfoPanel from './ui/InfoPanel'
import WorldPanel from './ui/WorldPanel'
import RacePanel from './ui/RacePanel'
import InsightsPanel from './ui/InsightsPanel'
import Leaderboard from './ui/Leaderboard'
import RoadmapPanel from './ui/RoadmapPanel'
import './App.css'

export default function App() {
  const data = useCityStore((s) => s.data)
  const mode = useCityStore((s) => s.mode)
  const setSelection = useCityStore((s) => s.setSelection)
  const setWorldSelection = useCityStore((s) => s.setWorldSelection)
  const setRaceOpen = useCityStore((s) => s.setRaceOpen)
  const setInsightsOpen = useCityStore((s) => s.setInsightsOpen)
  const setLeaderboardOpen = useCityStore((s) => s.setLeaderboardOpen)
  const setRoadmapOpen = useCityStore((s) => s.setRoadmapOpen)
  const refreshWorld = useCityStore((s) => s.refreshWorld)

  // Pull the shared population once on load (no-op if backend disabled).
  useEffect(() => {
    void refreshWorld()
  }, [refreshWorld])

  // ESC closes any open card, GitCity-style.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelection(null)
        setWorldSelection(null)
        setRaceOpen(false)
        setInsightsOpen(false)
        setLeaderboardOpen(false)
        setRoadmapOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSelection, setWorldSelection, setRaceOpen, setInsightsOpen, setLeaderboardOpen, setRoadmapOpen])

  return (
    <div className="app">
      {data ? (
        <div className="canvas-wrap">
          <Scene data={data} />
          <header className="topbar">
            <div className="hud-logo">LEETCITY</div>
            <UsernameForm />
            <Controls />
          </header>
          {mode === 'city' && <StatsOverlay />}
          <ShareButton />
          {(mode === 'city' || mode === 'multi') && <InfoPanel />}
          {mode === 'world' && <WorldPanel />}
          <RacePanel />
          <InsightsPanel />
          <Leaderboard />
          <RoadmapPanel />
          <div className="hud-hints">
            DRAG <span>ORBIT</span> · SCROLL <span>ZOOM</span> · CLICK{' '}
            <span>INSPECT</span> · ESC <span>CLOSE</span>
          </div>
        </div>
      ) : (
        <>
          <div className="landing" />
          <UsernameForm />
        </>
      )}
    </div>
  )
}
