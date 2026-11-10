import type { ReactNode } from 'react'
import { Guide, type GuideMood } from './Guide'

interface GuideSaysProps {
  mood?: GuideMood
  size?: number
  children: ReactNode
  actions?: ReactNode
  /** Announce the message politely to screen readers when it changes. */
  live?: boolean
  className?: string
}

export function GuideSays({ mood = 'happy', size = 96, children, actions, live = false, className = '' }: GuideSaysProps) {
  return (
    <div className={`guide-says ${className}`}>
      <Guide mood={mood} size={size} />
      <div className="guide-says__bubble" role={live ? 'status' : undefined} aria-live={live ? 'polite' : undefined}>
        {children}
        {actions && <div className="guide-says__actions">{actions}</div>}
      </div>
    </div>
  )
}
