import { describe, expect, test } from 'vitest'
import type { LessonId } from '../content/types'
import { badgeStatuses, newlyUnlocked, nextMilestone, unlockedBadgeIds } from './badges'
import { completeLesson, EMPTY_PROGRESS, type Progress } from './progress'

const withLessons = (ids: readonly LessonId[]): Progress =>
  ids.reduce(
    (p, id) => completeLesson(p, id, { completedAt: '2026-11-07T10:00:00.000Z', firstTry: 3, total: 3 }),
    EMPTY_PROGRESS,
  )

describe('badges', () => {
  test('no badges before any lesson', () => {
    expect(unlockedBadgeIds(EMPTY_PROGRESS)).toEqual([])
  })

  test('first lesson unlocks First Steps only', () => {
    expect(unlockedBadgeIds(withLessons(['basics']))).toEqual(['first-steps'])
  })

  test('the message lesson unlocks Communication Star', () => {
    expect(unlockedBadgeIds(withLessons(['message']))).toContain('communication-star')
  })

  test('the safety lesson unlocks Safety Champion', () => {
    expect(unlockedBadgeIds(withLessons(['safety']))).toContain('safety-champion')
  })

  test('two communication lessons are one skill area, so no Digital Explorer yet', () => {
    const ids = unlockedBadgeIds(withLessons(['basics', 'message', 'video']))
    expect(ids).toContain('confidence-builder')
    expect(ids).not.toContain('digital-explorer')
  })

  test('three skill areas unlock Digital Explorer', () => {
    expect(unlockedBadgeIds(withLessons(['basics', 'message', 'safety']))).toContain('digital-explorer')
  })

  test('all five lessons unlock every badge', () => {
    const all = withLessons(['basics', 'message', 'video', 'safety', 'search'])
    expect(unlockedBadgeIds(all)).toHaveLength(6)
    expect(nextMilestone(all)).toBeNull()
  })

  test('newlyUnlocked reports only badges earned by the latest change', () => {
    const before = withLessons(['basics', 'message'])
    const after = withLessons(['basics', 'message', 'safety'])
    expect(newlyUnlocked(before, after).sort()).toEqual(['confidence-builder', 'digital-explorer', 'safety-champion'])
  })

  test('progress counts never exceed the target', () => {
    const all = withLessons(['basics', 'message', 'video', 'safety', 'search'])
    for (const badge of badgeStatuses(all)) expect(badge.current).toBeLessThanOrEqual(badge.target)
  })

  test('next milestone is the locked badge closest to being earned', () => {
    expect(nextMilestone(EMPTY_PROGRESS)?.id).toBe('first-steps')
    expect(nextMilestone(withLessons(['basics']))?.id).toBe('communication-star')
  })
})
