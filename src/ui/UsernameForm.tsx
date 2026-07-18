import { useState, type FormEvent } from 'react'
import { useCityStore } from '../store'

const HERO_BARS = [
  { h: 34, c: 'easy' },
  { h: 58, c: 'medium' },
  { h: 42, c: 'easy' },
  { h: 88, c: 'hard' },
  { h: 50, c: 'medium' },
  { h: 70, c: 'medium' },
  { h: 100, c: 'hard' },
  { h: 44, c: 'easy' },
  { h: 62, c: 'medium' },
  { h: 80, c: 'hard' },
  { h: 38, c: 'easy' },
  { h: 54, c: 'medium' },
]

export default function UsernameForm() {
  const [value, setValue] = useState('')
  const { load, loadDemo, loading, error, data } = useCityStore()

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void load(value)
  }

  return (
    <div className={`username-form ${data ? 'docked' : 'hero'}`}>
      {!data && (
        <>
          <div className="hero-skyline" aria-hidden>
            {HERO_BARS.map((b, i) => (
              <div
                key={i}
                className={`hero-bar ${b.c}`}
                style={{ height: `${b.h}px`, animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
          <div className="hero-copy">
            <div className="hero-kicker">— WELCOME TO —</div>
            <h1>LEETCITY</h1>
            <p>YOUR LEETCODE GRIND, RENDERED AS A CITY</p>
          </div>
        </>
      )}
      <form onSubmit={onSubmit}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="LEETCODE USERNAME…"
          spellCheck={false}
          autoFocus={!data}
          aria-label="Username"
        />
        <button type="submit" disabled={loading || !value.trim()}>
          {loading ? 'BUILDING…' : '◆ BUILD CITY'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {!data && (
        <button className="demo-link" onClick={loadDemo} type="button">
          ▸ EXPLORE A DEMO CITY
        </button>
      )}
      {!data && (
        <div className="hero-footer">
          UNOFFICIAL FAN PROJECT · DATA FROM PUBLIC LEETCODE PROFILES
        </div>
      )}
    </div>
  )
}
