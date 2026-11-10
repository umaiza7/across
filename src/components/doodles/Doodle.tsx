import type { CSSProperties } from 'react'
import { DOODLES, type DoodleName } from './paths'
import './doodles.css'

export type DoodleTone = 'rifle' | 'oyster' | 'kangaroo' | 'cedar'
export type DoodleMotion = 'none' | 'float' | 'twinkle' | 'sway'

interface DoodleProps {
  name: DoodleName
  size?: number
  tone?: DoodleTone
  motion?: DoodleMotion
  /** Resting tilt in degrees, so doodles never sit perfectly straight. */
  tilt?: number
  /** Stagger for looping motion, in seconds. */
  delay?: number
  className?: string
  style?: CSSProperties
}

/** A decorative hand-drawn doodle. Always hidden from screen readers. */
export function Doodle({ name, size = 40, tone = 'oyster', motion = 'none', tilt = 0, delay = 0, className = '', style }: DoodleProps) {
  const vars = { '--tilt': `${tilt}deg`, '--delay': `${delay}s`, ...style } as CSSProperties
  return (
    <svg
      className={`doodle doodle--${tone} doodle--${motion} ${className}`}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      style={vars}
      aria-hidden="true"
      focusable="false"
    >
      {DOODLES[name]}
    </svg>
  )
}

export type { DoodleName }
