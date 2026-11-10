import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { BadgeMedal } from '../../components/BadgeMedal'
import { Doodle } from '../../components/doodles/Doodle'
import { Guide } from '../../components/Guide'
import { format } from '../../content'
import type { BadgeId, LessonId } from '../../content/types'
import { badgeIcon } from '../../lib/badges'
import { useApp } from '../../state/AppContext'
import '../../components/celebrate.css'

interface CompletionViewProps {
  lessonId: LessonId
  firstTry: number
  total: number
  earned: readonly BadgeId[]
  cheer: string
}

/** The illustrated achievement screen. Confetti is fired by the Finish button, not here. */
export function CompletionView({ lessonId, firstTry, total, earned, cheer }: CompletionViewProps) {
  const { pack } = useApp()
  const navigate = useNavigate()
  const ui = pack.ui.complete
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => headingRef.current?.focus(), [])

  return (
    <section className="complete" aria-labelledby="complete-title">
      <div className="complete__art">
        <Doodle name="star" size={40} tone="rifle" motion="twinkle" className="doodle-spot complete__d1" />
        <Doodle name="sparkle" size={30} tone="oyster" motion="twinkle" delay={0.5} className="doodle-spot complete__d2" />
        <Doodle name="heart" size={34} tone="kangaroo" motion="float" tilt={-10} className="doodle-spot complete__d3" />
        <Doodle name="flower" size={46} tone="oyster" motion="sway" tilt={8} delay={0.3} className="doodle-spot complete__d4" />
        <Doodle name="star" size={24} tone="oyster" motion="twinkle" delay={1} className="doodle-spot complete__d5" />
        <Guide mood="cheer" size={180} />
      </div>
      <h1 id="complete-title" ref={headingRef} tabIndex={-1} className="complete__title">{ui.title}</h1>
      <p className="complete__cheer">{cheer}</p>
      <p>{format(ui.body, { lesson: pack.lessons[lessonId].title })}</p>
      <p className="complete__score num">
        <i className="icon-star" aria-hidden="true" />
        {format(ui.score, { n: firstTry, total })}
      </p>

      {earned.length > 0 && (
        <div className="complete__badges">
          <h2 className="complete__badges-title">{ui.newBadge}</h2>
          <ul className="complete__badge-list">
            {earned.map((id, index) => (
              <li key={id}>
                <BadgeMedal icon={badgeIcon(id)} unlocked size="lg" reveal revealDelay={500 + index * 260} />
                <strong>{pack.badges[id].name}</strong>
                <span className="muted">{pack.badges[id].earned}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="btn-row complete__actions">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate('/journey', { state: { justCompleted: lessonId } })}
        >
          {ui.backToJourney}
          <i className="icon-arrow-right flip-rtl" aria-hidden="true" />
        </button>
        <Link to="/badges" className="btn btn-secondary">
          <i className="icon-badge" aria-hidden="true" />
          {ui.seeBadges}
        </Link>
      </div>
    </section>
  )
}
