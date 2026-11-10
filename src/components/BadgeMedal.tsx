import type { CSSProperties } from 'react'
import './badges.css'

interface BadgeMedalProps {
  icon: string
  unlocked: boolean
  size?: 'sm' | 'md' | 'lg'
  /** Play the one-time reveal animation. */
  reveal?: boolean
  revealDelay?: number
}

/** A scalloped rosette, the same outline every time so the collection reads as a set. */
function rosettePath(): string {
  const bumps = 14
  const cx = 50
  const cy = 46
  const outer = 40
  const inner = 35.5
  const points: string[] = []
  for (let i = 0; i <= bumps * 2; i++) {
    const angle = (Math.PI * i) / bumps - Math.PI / 2
    const r = i % 2 === 0 ? outer : inner
    points.push(`${(cx + r * Math.cos(angle)).toFixed(2)} ${(cy + r * Math.sin(angle)).toFixed(2)}`)
  }
  return `M${points[0]} ${points.slice(1).map((p, i) => (i % 2 === 0 ? `Q${p}` : p)).join(' ')}Z`
}

const ROSETTE = rosettePath()

export function BadgeMedal({ icon, unlocked, size = 'md', reveal = false, revealDelay = 0 }: BadgeMedalProps) {
  const style = { '--reveal-delay': `${revealDelay}ms` } as CSSProperties
  return (
    <span className={`medal medal--${size} ${unlocked ? 'medal--on' : 'medal--off'} ${reveal ? 'reveal' : ''}`} style={style} aria-hidden="true">
      <svg className="medal__art" viewBox="0 0 100 112" focusable="false">
        <path className="medal__ribbon" d="M33 72l-9 34 13-7 8 11 6-30M67 72l9 34-13-7-8 11-6-30" />
        <path className="medal__rosette" d={ROSETTE} />
        <circle className="medal__face" cx="50" cy="46" r="26" />
        <circle className="medal__stitch" cx="50" cy="46" r="21.5" />
      </svg>
      <i className={`medal__icon ${unlocked ? icon : 'icon-lock'}`} />
    </span>
  )
}
