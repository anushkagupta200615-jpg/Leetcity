import { THEMES } from '../lib/themes'
import { useCityStore } from '../store'

/** Compose the skyline screenshot + stats into a 1600x900 share card. */
export default function ShareButton() {
  const data = useCityStore((s) => s.data)
  const themeKey = useCityStore((s) => s.theme)
  if (!data) return null
  const theme = THEMES[themeKey]

  const download = () => {
    const src = document.querySelector<HTMLCanvasElement>('canvas')
    if (!src) return

    const W = 1600
    const H = 900
    const card = document.createElement('canvas')
    card.width = W
    card.height = H
    const ctx = card.getContext('2d')
    if (!ctx) return

    // Background + skyline (cover-fit, centered).
    ctx.fillStyle = theme.bgTop
    ctx.fillRect(0, 0, W, H)
    const scale = Math.max(W / src.width, H / src.height)
    const dw = src.width * scale
    const dh = src.height * scale
    ctx.drawImage(src, (W - dw) / 2, (H - dh) / 2, dw, dh)

    // Bottom gradient for legibility.
    const grad = ctx.createLinearGradient(0, H - 260, 0, H)
    grad.addColorStop(0, 'rgba(0,0,0,0)')
    grad.addColorStop(1, 'rgba(0,0,0,0.85)')
    ctx.fillStyle = grad
    ctx.fillRect(0, H - 260, W, 260)

    const font = (weight: number, size: number) =>
      `${weight} ${size}px 'Segoe UI', system-ui, sans-serif`

    // Username + totals.
    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#ffffff'
    ctx.font = font(700, 52)
    ctx.fillText(data.username, 56, H - 110)

    ctx.font = font(600, 30)
    let x = 56
    const seg = (text: string, color: string) => {
      ctx.fillStyle = color
      ctx.fillText(text, x, H - 56)
      x += ctx.measureText(text).width
    }
    seg(`${data.totals.all} solved`, '#e6e9f0')
    seg('   ', '#e6e9f0')
    seg(`${data.totals.easy} Easy`, theme.easy)
    seg('  ·  ', '#8b95ab')
    seg(`${data.totals.medium} Medium`, theme.medium)
    seg('  ·  ', '#8b95ab')
    seg(`${data.totals.hard} Hard`, theme.hard)
    if (data.contest) {
      seg('  ·  ', '#8b95ab')
      seg(`⚡ ${data.contest.rating}`, theme.accent)
    }

    // Branding, bottom-right.
    ctx.textAlign = 'right'
    ctx.fillStyle = theme.accent
    ctx.font = font(700, 40)
    ctx.fillText('LeetCity', W - 56, H - 96)
    ctx.fillStyle = '#8b95ab'
    ctx.font = font(400, 22)
    ctx.fillText('your grind as a skyline', W - 56, H - 60)
    ctx.textAlign = 'left'

    const link = document.createElement('a')
    link.download = `leetcity-${data.username}.png`
    link.href = card.toDataURL('image/png')
    link.click()
  }

  return (
    <button className="share-button" onClick={download} type="button">
      ⬇ Download share card
    </button>
  )
}
