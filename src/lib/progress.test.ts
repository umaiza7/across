import { describe, expect, test } from 'vitest'
import {
  completeLesson,
  completedIds,
  currentLessonId,
  EMPTY_PROGRESS,
  markBadgesSeen,
  mergeProgress,
  parseProgress,
  type LessonRecord,
} from './progress'

const record = (firstTry: number): LessonRecord => ({ completedAt: '2026-11-07T10:00:00.000Z', firstTry, total: 3 })

describe('progress', () => {
  test('starts with the first lesson as current', () => {
    expect(currentLessonId(EMPTY_PROGRESS)).toBe('basics')
  })

  test('completing a lesson moves the current lesson forward without mutating', () => {
    const after = completeLesson(EMPTY_PROGRESS, 'basics', record(2))
    expect(currentLessonId(after)).toBe('message')
    expect(EMPTY_PROGRESS.lessons).toEqual({})
  })

  test('current lesson is null once every lesson is done', () => {
    const ids = ['basics', 'message', 'video', 'safety', 'search'] as const
    const done = ids.reduce((p, id) => completeLesson(p, id, record(3)), EMPTY_PROGRESS)
    expect(currentLessonId(done)).toBeNull()
    expect(completedIds(done)).toEqual([...ids])
  })

  test('repeating a lesson keeps the best first-try score', () => {
    const first = completeLesson(EMPTY_PROGRESS, 'basics', record(3))
    const repeat = completeLesson(first, 'basics', record(1))
    expect(repeat.lessons.basics?.firstTry).toBe(3)
  })

  test('marking badges seen ignores duplicates and returns the same object when nothing changes', () => {
    const seen = markBadgesSeen(EMPTY_PROGRESS, ['first-steps', 'first-steps'])
    expect(seen.seenBadges).toEqual(['first-steps'])
    expect(markBadgesSeen(seen, ['first-steps'])).toBe(seen)
  })

  test('parseProgress drops unknown lessons, bad records and unknown badges', () => {
    const parsed = parseProgress({
      lessons: {
        basics: record(2),
        message: { completedAt: 'not a date', firstTry: 1, total: 3 },
        hacking: record(3),
        video: { completedAt: '2026-11-07T10:00:00.000Z', firstTry: 9, total: 3 },
      },
      seenBadges: ['first-steps', 'made-up', 42],
    })
    expect(Object.keys(parsed.lessons)).toEqual(['basics'])
    expect(parsed.seenBadges).toEqual(['first-steps'])
  })

  test('mergeProgress keeps lessons from both sides, the newer record, and every seen badge', () => {
    const older = { completedAt: '2026-11-01T10:00:00.000Z', firstTry: 3, total: 3 }
    const newer = { completedAt: '2026-11-07T10:00:00.000Z', firstTry: 1, total: 3 }
    const server = markBadgesSeen(completeLesson(completeLesson(EMPTY_PROGRESS, 'basics', older), 'video', older), ['first-steps'])
    const backup = markBadgesSeen(completeLesson(EMPTY_PROGRESS, 'basics', newer), ['communication-star'])
    const merged = mergeProgress(server, backup)
    expect(completedIds(merged)).toEqual(['basics', 'video'])
    expect(merged.lessons.basics).toEqual({ ...newer, firstTry: 3 })
    expect([...merged.seenBadges].sort()).toEqual(['communication-star', 'first-steps'])
  })

  test('mergeProgress with empty progress changes nothing', () => {
    const one = completeLesson(EMPTY_PROGRESS, 'safety', record(2))
    expect(mergeProgress(one, EMPTY_PROGRESS)).toEqual(one)
    expect(mergeProgress(EMPTY_PROGRESS, one)).toEqual(one)
  })

  test('parseProgress returns empty progress for junk', () => {
    expect(parseProgress(null)).toEqual(EMPTY_PROGRESS)
    expect(parseProgress('hello')).toEqual(EMPTY_PROGRESS)
  })
})
