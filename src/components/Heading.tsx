import type { ReactNode } from 'react'
import { DOODLES } from './doodles/paths'

interface HeadingProps {
  children: ReactNode
  level?: 1 | 2
  id?: string
  className?: string
}

/** A heading with a hand-drawn underline that stretches to the text. Page headings take focus after navigation. */
export function Heading({ children, level = 1, id, className = '' }: HeadingProps) {
  const Tag = level === 1 ? 'h1' : 'h2'
  return (
    <Tag id={id} className={`heading heading--${level} ${className}`} tabIndex={level === 1 ? -1 : undefined}>
      <span className="heading__text">{children}</span>
      <svg className="heading__line" viewBox="0 22 48 14" preserveAspectRatio="none" aria-hidden="true" focusable="false">
        {DOODLES.underline}
      </svg>
    </Tag>
  )
}
