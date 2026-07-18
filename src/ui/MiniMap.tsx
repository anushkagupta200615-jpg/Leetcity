import { useEffect, useRef } from 'react'
import { walk } from '../lib/walkControls'

const DIFF_COLOR: Record<string, string> = {
  easy: '#39e07a',
  medium: '#ffb02e',
  hard: '#ff5a5a',
}

const SIZE = 148

/** Corner radar shown while walking — buildings as dots, you as an arrow. */
export default function MiniMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = SIZE * dpr
    canvas.height = SIZE * dpr
    ctx.scale(dpr, dpr)

    let raf = 0
    const c = SIZE / 2
    const draw = () => {
      raf = requestAnimationFrame(draw)
      const scale = (SIZE / 2 - 8) / Math.max(1, walk.radius)
      ctx.clearRect(0, 0, SIZE, SIZE)

      // ground disc
      ctx.beginPath()
      ctx.arc(c, c, SIZE / 2 - 4, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(10,14,22,0.82)'
      ctx.fill()
      ctx.strokeStyle = 'rgba(125,140,180,0.5)'
      ctx.lineWidth = 1
      ctx.stroke()

      // building dots
      for (const b of walk.buildings) {
        ctx.beginPath()
        ctx.fillStyle = DIFF_COLOR[b.d] ?? '#8892b0'
        ctx.arc(c + b.x * scale, c + b.z * scale, 1.4, 0, Math.PI * 2)
        ctx.fill()
      }

      // player arrow — world forward = (sin h, -cos h); map z -> canvas +y
      const px = c + walk.x * scale
      const pz = c + walk.z * scale
      const h = walk.heading
      const fx = Math.sin(h)
      const fy = -Math.cos(h)
      const perpX = -fy
      const perpY = fx
      ctx.save()
      ctx.translate(px, pz)
      ctx.beginPath()
      ctx.moveTo(fx * 7, fy * 7)
      ctx.lineTo(-fx * 3 + perpX * 4, -fy * 3 + perpY * 4)
      ctx.lineTo(-fx * 3 - perpX * 4, -fy * 3 - perpY * 4)
      ctx.closePath()
      ctx.fillStyle = '#7dffb0'
      ctx.fill()
      ctx.restore()
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="minimap">
      <canvas ref={canvasRef} style={{ width: SIZE, height: SIZE }} />
      <div className="minimap-label">CITY MAP</div>
    </div>
  )
}
