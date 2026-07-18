import { useCityStore } from './store'
import Scene from './scene/Scene'
import UsernameForm from './ui/UsernameForm'
import StatsOverlay from './ui/StatsOverlay'
import ShareButton from './ui/ShareButton'
import Controls from './ui/Controls'
import InfoPanel from './ui/InfoPanel'
import './App.css'

export default function App() {
  const data = useCityStore((s) => s.data)

  return (
    <div className="app">
      {data ? (
        <div className="canvas-wrap">
          <Scene data={data} />
          <StatsOverlay />
          <ShareButton />
          <Controls />
          <InfoPanel />
        </div>
      ) : (
        <div className="landing" />
      )}
      <UsernameForm />
    </div>
  )
}
