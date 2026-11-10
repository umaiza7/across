import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeMedal } from '../components/BadgeMedal'
import { Doodle } from '../components/doodles/Doodle'
import { GuideSays } from '../components/GuideSays'
import { Heading } from '../components/Heading'
import { format } from '../content'
import type { BadgeId } from '../content/types'
import { badgeStatuses } from '../lib/badges'
import { useApp } from '../state/AppContext'
import '../components/celebrate.css'
import './pages.css'

export function BadgesPage() {
  const { pack, progress, markBadgesSeen } = useApp()
  const ui = pack.ui.badges
  const statuses = badgeStatuses(progress)
  const unlockedCount = statuses.filter((b) => b.unlocked).length
  // Badges earned but never revealed play their reveal on this visit only.
  const [toReveal] = useState<ReadonlySet<BadgeId>>(
    () => new Set(statuses.filter((b) => b.unlocked && !progress.seenBadges.includes(b.id)).map((b) => b.id)),
  )
  useEffect(() => {
    if (toReveal.size > 0) markBadgesSeen([...toReveal])
  }, [toReveal, markBadgesSeen])

  return (
    <div className="badges-page">
      <header className="page-head">
        <Heading>{ui.title}</Heading>
        <p className="page-head__intro">{ui.intro}</p>
        <Doodle name="star" size={34} tone="kangaroo" motion="float" tilt={12} className="doodle-spot page-head__d1" />
      </header>

      {unlockedCount === 0 && (
        <div className="empty">
          <GuideSays mood="curious" size={110}>
            <h2 className="empty__title">{ui.emptyTitle}</h2>
            <p>{ui.emptyBody}</p>
          </GuideSays>
          <Link to="/journey" className="btn btn-primary">
            {pack.ui.lesson.exit}
            <i className="icon-arrow-right flip-rtl" aria-hidden="true" />
          </Link>
        </div>
      )}

      <ul className="gallery">
        {statuses.map((badge, index) => {
          const text = pack.badges[badge.id]
          return (
            <li key={badge.id} className={`gallery__item ${badge.unlocked ? 'gallery__item--on' : 'gallery__item--off'}`}>
              <BadgeMedal icon={badge.icon} unlocked={badge.unlocked} reveal={toReveal.has(badge.id)} revealDelay={index * 120} />
              <h2 className="gallery__name">{text.name}</h2>
              <p className="gallery__status">
                <i className={badge.unlocked ? 'icon-check' : 'icon-lock'} aria-hidden="true" />
                {badge.unlocked ? ui.unlocked : `${ui.locked} · ${format(ui.progress, { n: badge.current, total: badge.target })}`}
              </p>
              <p className="gallery__text">{badge.unlocked ? text.earned : text.how}</p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
