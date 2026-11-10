import type { ReactElement } from 'react'
import './guide.css'

export type GuideMood = 'happy' | 'wave' | 'think' | 'cheer' | 'calm' | 'curious'

interface GuideProps {
  mood?: GuideMood
  size?: number
  className?: string
}

const EYES: Record<GuideMood, ReactElement> = {
  happy: <><circle className="guide-ink-fill" cx="48" cy="62" r="4.2" /><circle className="guide-ink-fill" cx="72" cy="62" r="4.2" /></>,
  wave: <><circle className="guide-ink-fill" cx="48" cy="62" r="4.2" /><circle className="guide-ink-fill" cx="72" cy="62" r="4.2" /></>,
  think: <><circle className="guide-ink-fill" cx="50" cy="59" r="4" /><circle className="guide-ink-fill" cx="74" cy="59" r="4" /><path className="guide-ink" d="M66 49.5c3-2 7-2.4 10-.6" /></>,
  cheer: <path className="guide-ink" d="M42 63c2-4.6 9-4.6 11 0M67 63c2-4.6 9-4.6 11 0" />,
  calm: <path className="guide-ink" d="M42 61c2 3.6 9 3.6 11 0M67 61c2 3.6 9 3.6 11 0" />,
  curious: <><circle className="guide-ink-fill" cx="48" cy="61" r="4.4" /><circle className="guide-ink-fill" cx="72" cy="61" r="4.4" /><path className="guide-ink" d="M66.5 50c3.5-2.6 8-2.6 11 0" /></>,
}

const MOUTHS: Record<GuideMood, ReactElement> = {
  happy: <path className="guide-ink" d="M51 74c5 5 13 5 18 0" />,
  wave: <path className="guide-ink" d="M51 74c5 5 13 5 18 0" />,
  think: <path className="guide-ink" d="M54 77c4-1.6 8-1.6 12 0" />,
  cheer: <path className="guide-ink guide-mouth-open" d="M49 72.5c0 9 22 9 22 0z" />,
  calm: <path className="guide-ink" d="M53 75c4 3 10 3 14 0" />,
  curious: <circle className="guide-ink" cx="60" cy="76" r="3.6" />,
}

const ARMS: Record<GuideMood, ReactElement | null> = {
  happy: null,
  calm: null,
  curious: null,
  wave: (
    <g className="guide-arm-wave">
      <path className="guide-ink" d="M99 72c7-4 11-11 10-19" />
      <path className="guide-ink guide-faint" d="M110 40c3 2 4.5 5 4.5 8.5M104 37.5c1.6 1 2.6 2.4 3 4" />
    </g>
  ),
  think: <path className="guide-ink" d="M78 95c3.5-5.6 9.6-7 13.6-3.6" />,
  cheer: (
    <>
      <path className="guide-ink" d="M21 70c-8-5-11-13-9-21" />
      <path className="guide-ink" d="M99 70c8-5 11-13 9-21" />
    </>
  ),
}

/**
 * The ACROSS Guide: a soft pebble with a sprout, drawn in the same line style as the doodles.
 * Purely illustrative, so it is hidden from screen readers; the words beside it carry the meaning.
 */
export function Guide({ mood = 'happy', size = 120, className = '' }: GuideProps) {
  return (
    <svg
      className={`guide guide--${mood} ${className}`}
      viewBox="0 0 120 120"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <g className="guide-body">
        <path className="guide-ink" d="M60 26c-1-7-4.4-11.6-10-13.6M60 26c1.8-6.4 6.6-10 13-10.4" />
        <path className="guide-leaf" d="M50 12.4c-5.4-1.6-10.4.2-12.4 4.6 5 1.6 9.6.4 12.4-4.6zM73 15.6c5-2.6 10.2-1.6 12.8 2.6-4.8 2.4-9.6 1.6-12.8-2.6z" />
        <path className="guide-shell" d="M60 26c23.6-.4 41 16.8 41.6 41.4.6 24.6-16.4 39.6-41.6 39.6-25.6 0-42.6-14.6-41.8-39.8C19 43.6 36.8 26.4 60 26z" />
        <circle className="guide-cheek" cx="40" cy="73" r="5.5" />
        <circle className="guide-cheek" cx="80" cy="73" r="5.5" />
        {EYES[mood]}
        {MOUTHS[mood]}
        {ARMS[mood]}
      </g>
    </svg>
  )
}
