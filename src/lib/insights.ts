import type { CityData } from '../types'
import { recentActivity } from './leetcode'
import { levelFor } from './level'
import {
  PROBLEMS_BY_TOPIC,
  COMPANY_PROFILES,
  COVERED_AT,
  GAP_AT,
  TOPIC_ALIASES,
  type Problem,
} from './problems'

const resolveTopic = (t: string) => TOPIC_ALIASES[t] ?? t

/** Map of topic label → solved count for the loaded user. */
function solvedByTopic(data: CityData): Map<string, number> {
  return new Map(data.topics.map((t) => [t.label, t.solved]))
}

/* ------------------------------------------------------------------ */
/* Pace projection                                                     */
/* ------------------------------------------------------------------ */

export interface Pace {
  perWeek: number
  active: boolean
  target: number
  weeksToTarget: number | null
  targetLabel: string
}

export function paceProjection(data: CityData): Pace {
  // Submissions in the last 30 days × acceptance ≈ recent accepted solves.
  const recent = recentActivity(data.calendar, 30)
  const acc = data.acceptance > 0 ? data.acceptance / 100 : 0.5
  const perWeek = Math.max(0, (recent * acc) / 30) * 7

  // Next meaningful milestone: next level threshold, else next hundred.
  const lvl = levelFor(data.totals.all)
  const nextHundred = Math.ceil((data.totals.all + 1) / 100) * 100
  const target = lvl.nextAt && lvl.nextAt > data.totals.all ? lvl.nextAt : nextHundred
  const remaining = target - data.totals.all
  const weeksToTarget = perWeek > 0.1 ? remaining / perWeek : null

  return {
    perWeek: Math.round(perWeek * 10) / 10,
    active: perWeek > 0.1,
    target,
    weeksToTarget: weeksToTarget ? Math.ceil(weeksToTarget) : null,
    targetLabel:
      lvl.nextAt && lvl.nextAt === target ? `LV ${lvl.level + 1}` : `${target} solved`,
  }
}

/* ------------------------------------------------------------------ */
/* Gap recommendations                                                 */
/* ------------------------------------------------------------------ */

export interface GapRec {
  topic: string
  solved: number
  problems: Problem[]
}

const DIFF_ORDER = { Easy: 0, Medium: 1, Hard: 2 }

export function gapRecommendations(data: CityData, maxTopics = 4): GapRec[] {
  const solved = solvedByTopic(data)
  const gaps: GapRec[] = []
  for (const topic of Object.keys(PROBLEMS_BY_TOPIC)) {
    const n = solved.get(topic) ?? 0
    if (n >= GAP_AT) continue // only barely-touched topics are "gaps"
    const problems = [...PROBLEMS_BY_TOPIC[topic]]
      .sort((a, b) => DIFF_ORDER[a.difficulty] - DIFF_ORDER[b.difficulty])
      .slice(0, 3)
    gaps.push({ topic, solved: n, problems })
  }
  // Weakest topics first.
  return gaps.sort((a, b) => a.solved - b.solved).slice(0, maxTopics)
}

/* ------------------------------------------------------------------ */
/* Company readiness                                                   */
/* ------------------------------------------------------------------ */

export interface TopicCoverage {
  topic: string
  solved: number
  weight: number
  cov: number // 0..1
}

export interface Readiness {
  company: string
  score: number // 0..100 (coverage × depth)
  coverage: number // 0..100 breadth across the company's topics
  depth: number // 0..100 medium/hard maturity
  topics: TopicCoverage[] // all weighted topics, most important first
  focus: Array<{ topic: string; solved: number; problems: Problem[] }>
}

export function companyReadiness(data: CityData, company: string): Readiness {
  const weights = COMPANY_PROFILES[company] ?? {}
  const solved = solvedByTopic(data)
  let weightSum = 0
  let covered = 0
  const perTopic: TopicCoverage[] = []
  for (const [rawTopic, w] of Object.entries(weights)) {
    const topic = resolveTopic(rawTopic)
    const n = solved.get(topic) ?? 0
    const cov = Math.min(1, n / COVERED_AT)
    weightSum += w
    covered += w * cov
    perTopic.push({ topic, solved: n, weight: w, cov })
  }
  const coverageScore = weightSum > 0 ? covered / weightSum : 0
  // Depth gate: breadth alone isn't interview-ready — you need medium/hard
  // volume. A profile with ~100 mediums + ~30 hards clears the gate; an
  // easy-heavy profile is scaled down no matter how broad it is.
  const depthGate = Math.min(
    1,
    (data.totals.medium + data.totals.hard * 1.5) / 150,
  )
  const score = Math.round(coverageScore * depthGate * 100)

  perTopic.sort((a, b) => b.weight - a.weight || a.cov - b.cov)
  const coverage = Math.round(coverageScore * 100)
  const depth = Math.round(depthGate * 100)

  // Weakest, most-important topics — with concrete problems to fix each.
  const focus = perTopic
    .filter((t) => t.cov < 1)
    .sort((a, b) => b.weight * (1 - b.cov) - a.weight * (1 - a.cov))
    .slice(0, 3)
    .map((t) => ({
      topic: t.topic,
      solved: t.solved,
      problems: (PROBLEMS_BY_TOPIC[t.topic] ?? [])
        .slice()
        .sort(
          (a, b) =>
            ({ Easy: 0, Medium: 1, Hard: 2 })[a.difficulty] -
            ({ Easy: 0, Medium: 1, Hard: 2 })[b.difficulty],
        )
        .slice(0, 2),
    }))
  return { company, score, coverage, depth, topics: perTopic, focus }
}

/* ------------------------------------------------------------------ */
/* Estimated standing + per-topic strength                             */
/* ------------------------------------------------------------------ */

export interface Standing {
  percentile: number // estimated, 0..100 (top X%)
  strengths: string[]
  weaknesses: string[]
}

/**
 * Rough, transparent estimate. `strength` rises with solves + rating; the
 * displayed "TOP X%" is the inverse, so more solved / higher rating ⇒ a
 * SMALLER (better) top-percent, and it's always monotonic.
 */
export function standing(data: CityData): Standing {
  const solvedScore = 1 / (1 + Math.exp(-(data.totals.all - 250) / 200)) // logistic on solved
  const ratingScore = data.contest
    ? 1 / (1 + Math.exp(-(data.contest.rating - 1600) / 260))
    : solvedScore
  const strength = data.contest ? solvedScore * 0.6 + ratingScore * 0.4 : solvedScore
  // Invert to a "top X%": strong solver ⇒ small number (top 5%), weak ⇒ large.
  const percentile = Math.max(1, Math.min(99, Math.round((1 - strength) * 100)))

  // Internal balance: which topics the user is over/under-invested in.
  const topics = data.topics.filter((t) => t.solved > 0)
  const avg = topics.length
    ? topics.reduce((s, t) => s + t.solved, 0) / topics.length
    : 0
  const strengths = [...topics]
    .sort((a, b) => b.solved - a.solved)
    .slice(0, 3)
    .map((t) => t.label)
  // Under-invested core topics (few solves relative to the user's own average).
  const weaknesses = Object.keys(PROBLEMS_BY_TOPIC)
    .map((label) => ({ label, solved: solvedByTopic(data).get(label) ?? 0 }))
    .filter((t) => t.solved < Math.max(2, avg * 0.4))
    .sort((a, b) => a.solved - b.solved)
    .slice(0, 3)
    .map((t) => t.label)

  return { percentile, strengths, weaknesses }
}

/* ------------------------------------------------------------------ */
/* Resume line generator                                               */
/* ------------------------------------------------------------------ */

export function resumeLines(data: CityData): string[] {
  const { all, medium, hard } = data.totals
  const st = standing(data)
  const top = data.topics.slice(0, 2).map((t) => t.label)
  const rounded = all >= 100 ? `${Math.floor(all / 100) * 100}+` : `${all}`
  const platform = 'LeetCode'

  const lines: string[] = []
  lines.push(
    `Solved ${rounded} ${platform} problems (estimated top ${st.percentile}%)` +
      (top.length ? `, with strong command of ${top.join(' and ')}.` : '.'),
  )
  if (data.contest) {
    lines.push(
      `Reached a ${platform} contest rating of ${data.contest.rating}` +
        (data.contest.topPercentage
          ? ` (top ${data.contest.topPercentage.toFixed(1)}% globally).`
          : '.'),
    )
  }
  lines.push(
    `Strengthened algorithmic problem-solving through ${medium} Medium and ${hard} Hard problems across ${data.topics.length} topics.`,
  )
  return lines
}

/* ------------------------------------------------------------------ */
/* "LeetCode Wrapped" story                                            */
/* ------------------------------------------------------------------ */

export function wrappedStory(data: CityData): string[] {
  const lvl = levelFor(data.totals.all)
  const { easy, medium, hard, all } = data.totals
  const dominant =
    hard >= medium && hard >= easy ? 'Hard' : medium >= easy ? 'Medium' : 'Easy'
  const top = data.topics.slice(0, 3).map((t) => t.label)
  const recent = recentActivity(data.calendar, 30)

  const lines: string[] = []
  lines.push(`You've built a city of ${all} solved problems — a Level ${lvl.level} ${lvl.name}.`)
  lines.push(
    `Your skyline leans ${dominant}: ${easy} Easy · ${medium} Medium · ${hard} Hard.`,
  )
  if (top.length) {
    lines.push(`Your tallest districts are ${top.join(', ')} — that's your home turf.`)
  }
  if (data.contest) {
    lines.push(
      `In the arena you're rated ${data.contest.rating}, top ${data.contest.topPercentage.toFixed(1)}% of contestants.`,
    )
  }
  if (data.streak > 0) {
    lines.push(`🔥 A ${data.streak}-day streak keeps the lights on.`)
  }
  lines.push(
    recent > 0
      ? `${recent} submissions in the last 30 days — the city is still growing.`
      : `The city's been quiet lately — time to break ground again.`,
  )
  const weak = standing(data).weaknesses[0]
  if (weak) lines.push(`The empty lot to watch: ${weak}. Build there next.`)
  return lines
}
