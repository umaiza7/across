import type { CSSProperties } from 'react'
import { useApp } from '../state/AppContext'
import './celebrate.css'

const RAYS = 9

interface SparkleBurstProps {
  /** A new number starts a new burst. 0 means no burst. The same number never replays. */
  trigger: number
}

/**
 * A small ring of sparkles that plays once per `trigger`. Keying on the trigger
 * means re-renders never replay it; only a new correct answer does.
 */
export function SparkleBurst({ trigger }: SparkleBurstProps) {
  const { settings } = useApp()
  if (trigger === 0 || settings.calm) return null
  return (
    <span className="burst" key={trigger} aria-hidden="true">
      {Array.from({ length: RAYS }, (_, i) => (
        <span
          key={i}
          className={`burst__ray burst__ray--${i % 3}`}
          style={{ '--angle': `${(360 / RAYS) * i + (i % 2) * 12}deg`, '--reach': `${52 + (i % 3) * 14}px` } as CSSProperties}
        />
      ))}
    </span>
  )
}
