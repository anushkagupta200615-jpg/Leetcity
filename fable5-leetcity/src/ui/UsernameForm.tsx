import { useState, type FormEvent } from 'react'
import { useCityStore } from '../store'

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
        <div className="hero-copy">
          <h1>LeetCity</h1>
          <p>Your LeetCode grind, rendered as a city skyline.</p>
        </div>
      )}
      <form onSubmit={onSubmit}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="LeetCode username…"
          spellCheck={false}
          autoFocus={!data}
          aria-label="LeetCode username"
        />
        <button type="submit" disabled={loading || !value.trim()}>
          {loading ? 'Building…' : 'Build city'}
        </button>
      </form>
      {error && <div className="error">{error}</div>}
      {!data && (
        <button className="demo-link" onClick={loadDemo} type="button">
          …or explore a demo city
        </button>
      )}
    </div>
  )
}
