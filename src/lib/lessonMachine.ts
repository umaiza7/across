import type { ChoiceIndex } from '../content/types'

export type Phase = 'asking' | 'correct' | 'wrong' | 'finished'

export interface LessonState {
  index: number
  phase: Phase
  selected: ChoiceIndex | null
  /** Options already tried on this question, shown as "Not this one". */
  tried: readonly ChoiceIndex[]
  firstTry: number
  /** Increments on every correct answer so celebration effects fire once per answer. */
  celebrations: number
}

export type LessonAction =
  | { type: 'select'; choice: ChoiceIndex; correct: ChoiceIndex }
  | { type: 'retry' }
  | { type: 'next'; total: number }
  | { type: 'restart' }

export const INITIAL_LESSON: LessonState = {
  index: 0,
  phase: 'asking',
  selected: null,
  tried: [],
  firstTry: 0,
  celebrations: 0,
}

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'select': {
      if (state.phase !== 'asking' || state.tried.includes(action.choice)) return state
      if (action.choice === action.correct) {
        return {
          ...state,
          phase: 'correct',
          selected: action.choice,
          firstTry: state.tried.length === 0 ? state.firstTry + 1 : state.firstTry,
          celebrations: state.celebrations + 1,
        }
      }
      return { ...state, phase: 'wrong', selected: action.choice, tried: [...state.tried, action.choice] }
    }
    case 'retry':
      return state.phase === 'wrong' ? { ...state, phase: 'asking', selected: null } : state
    case 'next': {
      if (state.phase !== 'correct') return state
      if (state.index + 1 >= action.total) return { ...state, phase: 'finished' }
      return { ...state, index: state.index + 1, phase: 'asking', selected: null, tried: [] }
    }
    case 'restart':
      return INITIAL_LESSON
  }
}
