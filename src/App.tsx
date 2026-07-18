import { useCityStore } from './store'
import Scene from './scene/Scene'
import UsernameForm from './ui/UsernameForm'
import StatsOverlay from './ui/StatsOverlay'
import ShareButton from './ui/ShareButton'
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
        </div>
      ) : (
        <div className="landing" />
      )}
      <UsernameForm />
    </div>
  )
}
