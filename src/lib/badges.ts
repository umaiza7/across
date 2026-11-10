import { LESSONS } from '../content/lessons'
import type { BadgeId } from '../content/types'
import { completedAreas, completedIds, type Progress } from './progress'

export interface BadgeStatus {
  id: BadgeId
  icon: string
  current: number
  target: number
  unlocked: boolean
}

interface BadgeRule {
  id: BadgeId
  icon: string
  target: number
  measure: (progress: Progress) => number
}

const doneCount = (progress: Progress): number => completedIds(progress).length
const did = (id: string) => (progress: Progress): number =>
  completedIds(progress).some((done) => done === id) ? 1 : 0

/** Order here is the order badges appear in the gallery. */
const RULES: readonly BadgeRule[] = [
  { id: 'first-steps', icon: 'icon-flag', target: 1, measure: doneCount },
  { id: 'communication-star', icon: 'icon-bubbles', target: 1, measure: did('message') },
  { id: 'digital-explorer', icon: 'icon-compass', target: 3, measure: (p) => completedAreas(p).size },
  { id: 'safety-champion', icon: 'icon-shield', target: 1, measure: did('safety') },
  { id: 'confidence-builder', icon: 'icon-energy', target: 3, measure: doneCount },
  { id: 'learning-champion', icon: 'icon-trophy', target: LESSONS.length, measure: doneCount },
]

export function badgeStatuses(progress: Progress): BadgeStatus[] {
  return RULES.map((rule) => {
    const current = Math.min(rule.measure(progress), rule.target)
    return { id: rule.id, icon: rule.icon, current, target: rule.target, unlocked: current >= rule.target }
  })
}

export function unlockedBadgeIds(progress: Progress): BadgeId[] {
  return badgeStatuses(progress)
    .filter((badge) => badge.unlocked)
    .map((badge) => badge.id)
}

/** Badges unlocked in `after` that were not unlocked in `before`. */
export function newlyUnlocked(before: Progress, after: Progress): BadgeId[] {
  const had = new Set(unlockedBadgeIds(before))
  return unlockedBadgeIds(after).filter((id) => !had.has(id))
}

/** The locked badge closest to being earned, or null when every badge is unlocked. */
export function nextMilestone(progress: Progress): BadgeStatus | null {
  const locked = badgeStatuses(progress).filter((badge) => !badge.unlocked)
  if (locked.length === 0) return null
  return locked.reduce((best, badge) =>
    badge.target - badge.current < best.target - best.current ? badge : best,
  )
}

export function badgeIcon(id: BadgeId): string {
  return RULES.find((rule) => rule.id === id)?.icon ?? 'icon-badge'
}
