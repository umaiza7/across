import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BadgeMedal } from '../components/BadgeMedal'
import { Doodle } from '../components/doodles/Doodle'
import { GuideSays } from '../components/GuideSays'
import { Heading } from '../components/Heading'
import { Journey } from '../components/Journey'
import { ProgressTrack } from '../components/ProgressTrack'
import { format } from '../content'
import { findLesson } from '../content/lessons'
import type { LessonId } from '../content/types'
import { nextMilestone } from '../lib/badges'
import { currentLessonId } from '../lib/progress'
import { useApp } from '../state/AppContext'
import './pages.css'

function readJustCompleted(state: unknown): LessonId | null {
  if (typeof state !== 'object' || state === null) return null
  const id = (state as Record<string, unknown>).justCompleted
  return typeof id === 'string' ? findLesson(id)?.id ?? null : null
}

export function JourneyPage() {
  const { pack, learner, progress, saveError, retrySave } = useApp()
  const location = useLocation()
  const navigate = useNavigate()
  const ui = pack.ui.journey
  // Read once, then clear it from history so a refresh never replays the celebration.
  const [justCompleted] = useState(() => readJustCompleted(location.state))
  useEffect(() => {
    if (location.state) navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, location.state, navigate])

  const milestone = nextMilestone(progress)
  const allDone = currentLessonId(progress) === null

  return (
    <div className="journey-page">
      <section className="journey-hero">
        <div className="journey-hero__text">
          <Heading>{format(ui.greeting, { name: learner?.name ?? '' })}</Heading>
          <GuideSays mood={allDone ? 'cheer' : justCompleted ? 'cheer' : 'wave'} size={92} className="journey-hero__guide">
            <p>{allDone ? ui.allDone : ui.intro}</p>
          </GuideSays>
        </div>

        {milestone && (
          <aside className="milestone" aria-labelledby="milestone-title">
            <Doodle name="sparkle" size={26} tone="rifle" motion="twinkle" className="doodle-spot milestone__sparkle" />
            <BadgeMedal icon={milestone.icon} unlocked={false} size="md" />
            <div className="milestone__body">
              <h2 id="milestone-title" className="milestone__title">
                {ui.nextBadge}: {pack.badges[milestone.id].name}
              </h2>
              <p className="muted">{pack.badges[milestone.id].how}</p>
              <ProgressTrack
                value={milestone.current}
                max={milestone.target}
                label={format(ui.lessonsCount, { n: milestone.current, total: milestone.target })}
              />
            </div>
          </aside>
        )}
      </section>

      {saveError && (
        <div className="notice" role="status">
          <i className="icon-cloud-upload" aria-hidden="true" />
          <p>{ui.saveError}</p>
          <button type="button" className="btn btn-secondary" onClick={retrySave}>{ui.retry}</button>
        </div>
      )}

      <section aria-labelledby="path-title" className="journey-path">
        <h2 id="path-title" className="journey-path__title">
          {ui.title}
          <Doodle name="flower" size={40} tone="oyster" motion="sway" tilt={8} />
        </h2>
        <Journey progress={progress} justCompleted={justCompleted} />
      </section>
    </div>
  )
}
