import { describe, expect, test } from 'vitest'
import { INITIAL_LESSON, lessonReducer, type LessonState } from './lessonMachine'

const select = (state: LessonState, choice: 0 | 1 | 2, correct: 0 | 1 | 2 = 1) =>
  lessonReducer(state, { type: 'select', choice, correct })

describe('lessonReducer', () => {
  test('a correct first answer counts as first try and fires one celebration', () => {
    const state = select(INITIAL_LESSON, 1)
    expect(state.phase).toBe('correct')
    expect(state.firstTry).toBe(1)
    expect(state.celebrations).toBe(1)
  })

  test('a wrong answer never celebrates and remembers the tried option', () => {
    const state = select(INITIAL_LESSON, 0)
    expect(state.phase).toBe('wrong')
    expect(state.celebrations).toBe(0)
    expect(state.tried).toEqual([0])
  })

  test('retry returns to asking, and a later correct answer is not first try', () => {
    const retried = lessonReducer(select(INITIAL_LESSON, 0), { type: 'retry' })
    expect(retried.phase).toBe('asking')
    const correct = select(retried, 1)
    expect(correct.phase).toBe('correct')
    expect(correct.firstTry).toBe(0)
    expect(correct.celebrations).toBe(1)
  })

  test('selecting again while feedback shows, or picking a tried option, does nothing', () => {
    const wrong = select(INITIAL_LESSON, 0)
    expect(select(wrong, 1)).toBe(wrong)
    const retried = lessonReducer(wrong, { type: 'retry' })
    expect(select(retried, 0)).toBe(retried)
  })

  test('repeated taps on a correct answer do not re-trigger the celebration', () => {
    const once = select(INITIAL_LESSON, 1)
    expect(select(once, 1).celebrations).toBe(1)
  })

  test('next moves on only after a correct answer and finishes on the last question', () => {
    expect(lessonReducer(INITIAL_LESSON, { type: 'next', total: 2 })).toBe(INITIAL_LESSON)
    const second = lessonReducer(select(INITIAL_LESSON, 1), { type: 'next', total: 2 })
    expect(second.index).toBe(1)
    expect(second.tried).toEqual([])
    const finished = lessonReducer(select(second, 1), { type: 'next', total: 2 })
    expect(finished.phase).toBe('finished')
  })

  test('restart clears everything', () => {
    expect(lessonReducer(select(INITIAL_LESSON, 1), { type: 'restart' })).toEqual(INITIAL_LESSON)
  })
})
