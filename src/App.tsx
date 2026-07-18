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
import BuildingInterior from './ui/BuildingInterior'
import MiniMap from './ui/MiniMap'
import WalkHud from './ui/WalkHud'
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
  const walk = useCityStore((s) => s.walk)
  const setWalk = useCityStore((s) => s.setWalk)
  const setInterior = useCityStore((s) => s.setInterior)
  const toggleFirstPerson = useCityStore((s) => s.toggleFirstPerson)
  const refreshWorld = useCityStore((s) => s.refreshWorld)

  // Pull the shared population once on load (no-op if backend disabled).
  useEffect(() => {
    void refreshWorld()
  }, [refreshWorld])

  // ESC closes any open card (and interior/walk); V toggles first-person.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Inside a building? Step back out first rather than exiting walk.
        if (useCityStore.getState().interior) {
          setInterior(null)
          return
        }
        setSelection(null)
        setWorldSelection(null)
        setRaceOpen(false)
        setInsightsOpen(false)
        setLeaderboardOpen(false)
        setRoadmapOpen(false)
        setWalk(false)
      } else if (e.code === 'KeyV') {
        const tag = document.activeElement?.tagName
        if (tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return
        if (useCityStore.getState().walk) toggleFirstPerson()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setSelection, setWorldSelection, setRaceOpen, setInsightsOpen, setLeaderboardOpen, setRoadmapOpen, setWalk, setInterior, toggleFirstPerson])

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
          {walk && <MiniMap />}
          {walk && <WalkHud />}
          <BuildingInterior />
          <div className="hud-hints">
            {walk ? (
              <>
                W A S D <span>MOVE</span> · E <span>ENTER</span> · V{' '}
                <span>1ST-PERSON</span> · ESC <span>EXIT</span>
              </>
            ) : (
              <>
                DRAG <span>ORBIT</span> · SCROLL <span>ZOOM</span> · CLICK{' '}
                <span>INSPECT</span> · ESC <span>CLOSE</span>
              </>
            )}
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
