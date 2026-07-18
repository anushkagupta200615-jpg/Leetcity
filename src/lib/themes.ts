import * as THREE from 'three'

export interface Theme {
  key: string
  name: string
  easy: string
  medium: string
  hard: string
  accent: string
  bgTop: string
  bgBottom: string
  ground: string
  grid1: string
  grid2: string
  label: string
}

export const THEMES = {
  classic: {
    key: 'classic',
    name: 'Classic',
    easy: '#00b8a3',
    medium: '#ffc01e',
    hard: '#ff375f',
    accent: '#ffa116',
    bgTop: '#0b0d12',
    bgBottom: '#131826',
    ground: '#12151c',
    grid1: '#1d2230',
    grid2: '#262d40',
    label: '#8b95ab',
  },
  matrix: {
    key: 'matrix',
    name: 'Matrix',
    easy: '#59d98a',
    medium: '#2eea6c',
    hard: '#aaffc3',
    accent: '#00ff41',
    bgTop: '#010c05',
    bgBottom: '#03170b',
    ground: '#02130a',
    grid1: '#053018',
    grid2: '#0a4423',
    label: '#59c77e',
  },
  noir: {
    key: 'noir',
    name: 'Noir',
    easy: '#6f757d',
    medium: '#d7dbe0',
    hard: '#ff2e4d',
    accent: '#ffffff',
    bgTop: '#08080a',
    bgBottom: '#15151a',
    ground: '#101014',
    grid1: '#1b1b21',
    grid2: '#26262e',
    label: '#8f939c',
  },
  aurora: {
    key: 'aurora',
    name: 'Aurora',
    easy: '#2dd4bf',
    medium: '#8b5cf6',
    hard: '#f472b6',
    accent: '#67e8f9',
    bgTop: '#050816',
    bgBottom: '#101334',
    ground: '#0a0d1f',
    grid1: '#191f3d',
    grid2: '#242c56',
    label: '#93a0d1',
  },
  ocean: {
    key: 'ocean',
    name: 'Ocean',
    easy: '#7dd3fc',
    medium: '#3b82f6',
    hard: '#f43f5e',
    accent: '#22d3ee',
    bgTop: '#04121f',
    bgBottom: '#0a2033',
    ground: '#071827',
    grid1: '#123049',
    grid2: '#1b4260',
    label: '#7ba6c4',
  },
  gold: {
    key: 'gold',
    name: 'Gold',
    easy: '#e8c66c',
    medium: '#f5a623',
    hard: '#ff6b35',
    accent: '#ffd700',
    bgTop: '#0d0a04',
    bgBottom: '#1c1509',
    ground: '#14100a',
    grid1: '#2a2210',
    grid2: '#3b3018',
    label: '#b09a63',
  },
} as const satisfies Record<string, Theme>

export type ThemeKey = keyof typeof THEMES

export const DEFAULT_THEME: ThemeKey = 'classic'

const tmp = new THREE.Color()

/** Darken/lighten a hex color by a factor and return a CSS color string. */
export function shade(hex: string, factor: number): string {
  tmp.set(hex).multiplyScalar(factor)
  return `#${tmp.getHexString()}`
}
