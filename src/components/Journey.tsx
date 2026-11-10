import { Link } from 'react-router-dom'
import { LESSONS } from '../content/lessons'
import type { BadgeId, LessonId } from '../content/types'
import { badgeIcon, badgeStatuses } from '../lib/badges'
import { currentLessonId, type Progress } from '../lib/progress'
import { useApp } from '../state/AppContext'
import { BadgeMedal } from './BadgeMedal'
import { Doodle } from './doodles/Doodle'
import { SparkleBurst } from './SparkleBurst'
import './journey.css'

/** Badges that belong to one particular stop on the path. */
const STOP_BADGE: Partial<Record<LessonId, BadgeId>> = {
  message: 'communication-star',
  safety: 'safety-champion',
}

type StopState = 'done' | 'current' | 'upcoming'

interface JourneyProps {
  progress: Progress
  /** The lesson just finished, which plays its celebration once. */
  justCompleted: LessonId | null
}

export function Journey({ progress, justCompleted }: JourneyProps) {
  const { pack } = useApp()
  const ui = pack.ui.journey
  const current = currentLessonId(progress)
  const unlocked = new Set(badgeStatuses(progress).filter((b) => b.unlocked).map((b) => b.id))
  const allDone = current === null

  const stateOf = (id: LessonId): StopState =>
    progress.lessons[id] ? 'done' : id === current ? 'current' : 'upcoming'
  const statusText: Record<StopState, string> = { done: ui.done, current: ui.current, upcoming: ui.upcoming }

  return (
    <ol className="path">
      {LESSONS.map((lesson, index) => {
        const state = stateOf(lesson.id)
        const text = pack.lessons[lesson.id]
        const badge = STOP_BADGE[lesson.id]
        const celebrate = justCompleted === lesson.id
        return (
          <li key={lesson.id} className={`stop stop--${state} ${index % 2 ? 'stop--right' : 'stop--left'} ${celebrate ? 'stop--celebrate' : ''}`}>
            <span className="stop__marker" aria-hidden="true">
              <i className={state === 'done' ? 'icon-check' : lesson.icon} />
              {celebrate && <SparkleBurst trigger={1} />}
            </span>
            <div className="stop__card">
              {state === 'current' && (
                <span className="stop__here">
                  <Doodle name="arrow" size={40} tone="rifle" tilt={-8} />
                  {ui.youAreHere}
                </span>
              )}
              <p className="stop__status">
                <span className="visually-hidden">{index + 1}. </span>
                {statusText[state]}
              </p>
              <h2 className="stop__title">{text.title}</h2>
              <p className="stop__summary">{text.summary}</p>
              <div className="stop__foot">
                <Link
                  to={`/lesson/${lesson.id}`}
                  className={`btn ${state === 'current' ? 'btn-primary' : 'btn-secondary'}`}
                >
                  {state === 'done' ? ui.again : ui.start}
                  <i className="icon-arrow-right flip-rtl" aria-hidden="true" />
                </Link>
                {badge && (
                  <span className={`stop__badge ${unlocked.has(badge) ? 'stop__badge--on' : ''}`}>
                    <BadgeMedal icon={badgeIcon(badge)} unlocked={unlocked.has(badge)} size="sm" />
                    <span>{pack.badges[badge].name}</span>
                  </span>
                )}
              </div>
            </div>
          </li>
        )
      })}
      <li className={`stop stop--finish ${allDone ? 'stop--done' : 'stop--upcoming'}`}>
        <span className="stop__marker" aria-hidden="true">
          <i className="icon-trophy" />
        </span>
        <div className="stop__card stop__card--finish">
          <BadgeMedal icon={badgeIcon('learning-champion')} unlocked={allDone} size="sm" />
          <div>
            <h2 className="stop__title">{ui.finish}</h2>
            <p className="stop__summary">{pack.badges['learning-champion'].name}</p>
          </div>
          {allDone && <Doodle name="sparkle" size={34} tone="rifle" motion="twinkle" className="stop__finish-sparkle" />}
        </div>
      </li>
    </ol>
  )
}
