import type { ReactElement } from 'react'

/**
 * Hand-drawn doodles on a 48-unit grid, drawn to match Simple Line Icons:
 * outlined, round ends, one stroke weight. Small wobbles keep them hand-made.
 */
export type DoodleName =
  | 'star'
  | 'sparkle'
  | 'heart'
  | 'flower'
  | 'phone'
  | 'laptop'
  | 'bubble'
  | 'chat'
  | 'arrow'
  | 'underline'
  | 'loop'
  | 'people'
  | 'sun'
  | 'dots'

export const DOODLES: Record<DoodleName, ReactElement> = {
  star: <path d="M24 6.5l5 10.8 11.5 1.2-8.7 7.9 2.6 11.4L24 32.1l-10.3 5.8 2.5-11.5-8.7-7.8 11.6-1.2z" />,
  sparkle: <path d="M24 7c1.5 9.2 6.2 14 15.5 16.8C30.2 26.4 25.5 31 24 41c-1.6-9.9-6.3-14.6-15.6-17.2C17.7 21.1 22.4 16.3 24 7z" />,
  heart: <path d="M24 40.5C13.6 33.4 7 26.6 7.2 18.4 7.4 12.8 11.5 9 16.3 9.2c3.5.1 6.2 2.1 7.7 5.1 1.6-3.1 4.4-5.1 8-5.1 4.9.1 8.9 4 8.8 9.6-.2 8.1-6.6 14.8-16.8 21.7z" />,
  flower: (
    <>
      <circle cx="24" cy="10.5" r="5" />
      <circle cx="32.6" cy="16.6" r="5" />
      <circle cx="29.4" cy="26.6" r="5" />
      <circle cx="18.6" cy="26.6" r="5" />
      <circle cx="15.4" cy="16.6" r="5" />
      <circle cx="24" cy="19.2" r="3.4" />
      <path d="M24 31.5v13M24 39c3.8-.6 6.8-3.4 8-7.5-4 .4-7 3-8 7.5z" />
    </>
  ),
  phone: (
    <>
      <rect x="14" y="5" width="20" height="38" rx="4.5" />
      <path d="M21.5 38.2h5M22 9.6h4" />
    </>
  ),
  laptop: (
    <>
      <rect x="9.5" y="11" width="29" height="20" rx="2.5" />
      <path d="M5 36.5h38l-2.6 3.8H7.8z" />
    </>
  ),
  bubble: (
    <>
      <path d="M10.5 11.5h27c2.5 0 4.5 2 4.5 4.5v13.5c0 2.5-2 4.5-4.5 4.5H22.5L14.2 41v-7h-3.7C8 34 6 32 6 29.5V16c0-2.5 2-4.5 4.5-4.5z" />
      <path d="M16.5 22.8h.1M24 22.8h.1M31.5 22.8h.1" />
    </>
  ),
  chat: (
    <>
      <path d="M8 9h20c2.2 0 4 1.8 4 4v9c0 2.2-1.8 4-4 4H17l-6 5v-5H8c-2.2 0-4-1.8-4-4v-9c0-2.2 1.8-4 4-4z" />
      <path d="M36 17h4c2.2 0 4 1.8 4 4v9c0 2.2-1.8 4-4 4h-3v5l-6-5h-9c-2.2 0-4-1.8-4-4v-1" />
    </>
  ),
  arrow: <path d="M6 36c7.5-13.7 19.4-20.6 33-18.2M32.2 11.6l7.4 6.4-7.8 5.4" />,
  underline: <path d="M2 30c5.8-4.4 10.2-4.6 14.4-.3 4.3 4.4 8.6 4.3 14.6-.2 5.8-4.4 10.5-4.4 15 .5" />,
  loop: <path d="M5 32c7.5.6 10.6-14.5 18.6-14.6 6.6-.1 6.6 11.4.6 11.6-6.4.2-5.7-11.2 2.4-15.4 7.1-3.6 14.2 3.8 16.4 16.4" />,
  people: (
    <>
      <circle cx="16" cy="13.5" r="5.2" />
      <path d="M6.5 41c0-8.6 4.2-14.4 9.5-14.4s9.5 5.8 9.5 14.4" />
      <circle cx="33.5" cy="18.5" r="4.2" />
      <path d="M26.5 41c0-6.6 3.1-11.2 7-11.2s7 4.6 7 11.2" />
      <path d="M24.4 9.2c.9-1.6 3.4-1.2 3.3.8-.1 1.6-2 2.7-3.3 3.6-1.3-.9-3.2-2-3.3-3.6-.1-2 2.4-2.4 3.3-.8z" />
    </>
  ),
  sun: (
    <>
      <circle cx="24" cy="24" r="7.5" />
      <path d="M24 5.5v5M24 37.5v5M5.5 24h5M37.5 24h5M10.9 10.9l3.5 3.5M33.6 33.6l3.5 3.5M37.1 10.9l-3.5 3.5M14.4 33.6l-3.5 3.5" />
    </>
  ),
  dots: <path d="M10 26h.1M24 22h.1M38 26h.1" />,
}
