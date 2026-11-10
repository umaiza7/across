import type { LessonId, LessonShape } from './types'

/** The single learning path, in order. Text for each lesson lives in the language packs. */
export const LESSONS: readonly LessonShape[] = [
  { id: 'basics', area: 'basics', icon: 'icon-screen-smartphone', correct: [1, 0, 1] },
  { id: 'message', area: 'communication', icon: 'icon-bubbles', correct: [2, 0, 1] },
  { id: 'video', area: 'communication', icon: 'icon-camcorder', correct: [1, 2, 0] },
  { id: 'safety', area: 'safety', icon: 'icon-shield', correct: [1, 1, 2] },
  { id: 'search', area: 'explore', icon: 'icon-map', correct: [2, 0, 1] },
]

export const LESSON_IDS: readonly LessonId[] = LESSONS.map((lesson) => lesson.id)

export function findLesson(id: string | undefined): LessonShape | undefined {
  return LESSONS.find((lesson) => lesson.id === id)
}
