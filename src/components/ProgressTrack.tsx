import type { CSSProperties } from 'react'
import { Doodle } from './doodles/Doodle'

interface ProgressTrackProps {
  value: number
  max: number
  label: string
  className?: string
}

/** A hand-drawn style progress bar. The fill animates with transform only, from real state. */
export function ProgressTrack({ value, max, label, className = '' }: ProgressTrackProps) {
  const ratio = max === 0 ? 0 : Math.min(1, Math.max(0, value / max))
  return (
    <div className={`track ${className}`}>
      <span className="track__label num">{label}</span>
      <div
        className="track__rail"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={label}
        style={{ '--ratio': ratio } as CSSProperties}
      >
        <span className="track__fill" />
        <span className="track__star">
          <Doodle name="star" size={26} tone="rifle" />
        </span>
      </div>
    </div>
  )
}
