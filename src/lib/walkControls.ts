/**
 * Shared, mutable walk-mode state that is written every frame by the 3D
 * character and read by DOM widgets (mini-map, joystick). Kept OUTSIDE React
 * so per-frame updates never trigger re-renders — the widgets poll it with
 * their own requestAnimationFrame loop instead.
 */

export type MiniDiff = 'easy' | 'medium' | 'hard'

export interface MiniBuilding {
  x: number
  z: number
  d: MiniDiff
}

export const walk = {
  /** true while the avatar is on the map */
  active: false,
  /** avatar position + facing, in world units */
  x: 0,
  z: 0,
  heading: 0,
  /** radius of the city ground, for mini-map scaling */
  radius: 40,
  /** building footprints for the mini-map */
  buildings: [] as MiniBuilding[],
  /** on-screen joystick vector, each component in [-1, 1] */
  joyX: 0,
  joyZ: 0,
  /** set true by the mobile "Enter" button; the character consumes it */
  enterPressed: false,
}

export function resetJoystick() {
  walk.joyX = 0
  walk.joyZ = 0
}
