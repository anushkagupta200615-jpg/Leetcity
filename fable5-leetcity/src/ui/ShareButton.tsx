import { useCityStore } from '../store'

export default function ShareButton() {
  const data = useCityStore((s) => s.data)
  if (!data) return null

  const download = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas')
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `leetcity-${data.username}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  return (
    <button className="share-button" onClick={download} type="button">
      ⬇ Download skyline
    </button>
  )
}
