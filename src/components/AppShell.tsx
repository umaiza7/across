import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../state/AppContext'
import { Doodle } from './doodles/Doodle'
import './shell.css'

const NAV = [
  { to: '/journey', icon: 'icon-map', key: 'journey' },
  { to: '/badges', icon: 'icon-badge', key: 'badges' },
  { to: '/settings', icon: 'icon-settings', key: 'settings' },
] as const

/** Header, navigation and a gentle page transition for signed-in screens. */
export function AppShell() {
  const { pack, mode } = useApp()
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const lastPath = useRef(pathname)

  // After navigating, move focus to the new page's heading so screen readers start there.
  // Comparing paths (not a first-render flag) stays correct under StrictMode's double effects.
  useEffect(() => {
    if (lastPath.current === pathname) return
    lastPath.current = pathname
    const heading = mainRef.current?.querySelector<HTMLElement>('h1')
    heading?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="shell">
      <a className="skip-link" href="#main">{pack.ui.skipToContent}</a>
      <header className="shell__top">
        <NavLink to="/journey" className="wordmark" aria-label="ACROSS">
          <Doodle name="sparkle" size={26} tone="rifle" tilt={-10} />
          <span>ACROSS</span>
        </NavLink>
        {mode === 'demo' && <span className="demo-pill">{pack.ui.settings.demoMode}</span>}
      </header>
      <nav className="shell__nav" aria-label={pack.ui.nav.label}>
        {NAV.map((item) => (
          <NavLink key={item.to} to={item.to} className="nav-item">
            <i className={item.icon} aria-hidden="true" />
            <span>{pack.ui.nav[item.key]}</span>
          </NavLink>
        ))}
      </nav>
      <main id="main" ref={mainRef} className="shell__main page-enter" key={pathname}>
        <Outlet />
      </main>
    </div>
  )
}
