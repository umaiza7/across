import { LESSON_IDS, LESSONS } from '../content/lessons'
import type { BadgeId, LessonId, SkillArea } from '../content/types'

export interface LessonRecord {
  completedAt: string
  firstTry: number
  total: number
}

export interface Progress {
  version: 1
  lessons: Partial<Record<LessonId, LessonRecord>>
  /** Badges the learner has already watched being revealed, so the reveal plays once. */
  seenBadges: readonly BadgeId[]
}

export const EMPTY_PROGRESS: Progress = { version: 1, lessons: {}, seenBadges: [] }

const BADGE_ID_SET: ReadonlySet<string> = new Set<BadgeId>([
  'first-steps',
  'communication-star',
  'digital-explorer',
  'safety-champion',
  'confidence-builder',
  'learning-champion',
])

export function completedIds(progress: Progress): LessonId[] {
  return LESSON_IDS.filter((id) => progress.lessons[id] !== undefined)
}

export function completedAreas(progress: Progress): Set<SkillArea> {
  return new Set(LESSONS.filter((lesson) => progress.lessons[lesson.id]).map((lesson) => lesson.area))
}

/** The first lesson on the path that is not done yet, or null when the path is finished. */
export function currentLessonId(progress: Progress): LessonId | null {
  return LESSON_IDS.find((id) => progress.lessons[id] === undefined) ?? null
}

/** Record a finished lesson. Repeats keep the learner's best first-try score. */
export function completeLesson(progress: Progress, id: LessonId, record: LessonRecord): Progress {
  const previous = progress.lessons[id]
  const best: LessonRecord = previous
    ? { ...record, firstTry: Math.max(previous.firstTry, record.firstTry) }
    : record
  return { ...progress, lessons: { ...progress.lessons, [id]: best } }
}

/**
 * Combine two copies of progress (server and local backup) without losing anything:
 * every lesson from either side, the newer record when both have it, and every seen badge.
 */
export function mergeProgress(a: Progress, b: Progress): Progress {
  const lessons: Partial<Record<LessonId, LessonRecord>> = {}
  for (const id of LESSON_IDS) {
    const left = a.lessons[id]
    const right = b.lessons[id]
    if (!left || !right) {
      const only = left ?? right
      if (only) lessons[id] = only
      continue
    }
    const newer = Date.parse(right.completedAt) > Date.parse(left.completedAt) ? right : left
    lessons[id] = { ...newer, firstTry: Math.max(left.firstTry, right.firstTry) }
  }
  return { version: 1, lessons, seenBadges: [...new Set([...a.seenBadges, ...b.seenBadges])] }
}

export function markBadgesSeen(progress: Progress, ids: readonly BadgeId[]): Progress {
  const fresh = [...new Set(ids)].filter((id) => !progress.seenBadges.includes(id))
  if (fresh.length === 0) return progress
  return { ...progress, seenBadges: [...progress.seenBadges, ...fresh] }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseLessonRecord(value: unknown): LessonRecord | null {
  if (!isRecord(value)) return null
  const { completedAt, firstTry, total } = value
  if (typeof completedAt !== 'string' || Number.isNaN(Date.parse(completedAt))) return null
  if (typeof firstTry !== 'number' || typeof total !== 'number') return null
  if (!Number.isInteger(total) || total < 1 || firstTry < 0 || firstTry > total) return null
  return { completedAt, firstTry, total }
}

/** Validate progress read from storage or the server. Anything unrecognised is dropped. */
export function parseProgress(value: unknown): Progress {
  if (!isRecord(value)) return EMPTY_PROGRESS
  const rawLessons = isRecord(value.lessons) ? value.lessons : {}
  const lessons: Partial<Record<LessonId, LessonRecord>> = {}
  for (const id of LESSON_IDS) {
    const record = parseLessonRecord(rawLessons[id])
    if (record) lessons[id] = record
  }
  const seenBadges = Array.isArray(value.seenBadges)
    ? (value.seenBadges.filter((id) => typeof id === 'string' && BADGE_ID_SET.has(id)) as BadgeId[])
    : []
  return { version: 1, lessons, seenBadges: [...new Set(seenBadges)] }
}
