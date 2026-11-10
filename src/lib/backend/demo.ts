import { EMPTY_PROGRESS, parseProgress, type Progress } from '../progress'
import type { AuthResult, Backend, Learner } from './types'

/**
 * Demo mode keeps accounts and progress in this browser only, so the app works
 * with no backend configured. Passwords are never stored: signing in matches
 * the email alone, and the sign-in screen says so.
 */
const LEARNERS_KEY = 'across.demo.learners'
const SESSION_KEY = 'across.demo.session'
const progressKey = (id: string) => `across.demo.progress.${id}`

function read(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    throw new Error('Storage is not available in this browser')
  }
}

function isLearner(value: unknown): value is Learner {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return typeof v.id === 'string' && typeof v.name === 'string' && typeof v.email === 'string'
}

function learners(): Learner[] {
  const stored = read(LEARNERS_KEY)
  return Array.isArray(stored) ? stored.filter(isLearner) : []
}

const normalise = (email: string) => email.trim().toLowerCase()

/** crypto.randomUUID only exists on secure origins; a phone on a LAN address still needs an id. */
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function startSession(learner: Learner): AuthResult {
  write(SESSION_KEY, learner.id)
  return { ok: true, learner }
}

export const demoBackend: Backend = {
  mode: 'demo',
  async currentLearner() {
    const id = read(SESSION_KEY)
    return learners().find((learner) => learner.id === id) ?? null
  },
  async signUp({ name, email }) {
    const key = normalise(email)
    if (learners().some((learner) => learner.email === key)) return { ok: false, error: 'email-taken' }
    const learner: Learner = { id: newId(), name: name.trim(), email: key }
    write(LEARNERS_KEY, [...learners(), learner])
    return startSession(learner)
  },
  async signIn({ email }) {
    const learner = learners().find((item) => item.email === normalise(email))
    return learner ? startSession(learner) : { ok: false, error: 'invalid-login' }
  },
  async signOut() {
    try {
      window.localStorage.removeItem(SESSION_KEY)
    } catch {
      // Nothing to clear if storage is blocked.
    }
  },
  async loadProgress(learnerId) {
    return parseProgress(read(progressKey(learnerId)) ?? EMPTY_PROGRESS)
  },
  async saveProgress(learnerId, progress: Progress) {
    write(progressKey(learnerId), progress)
  },
  // Demo sessions only end when the learner signs out here.
  onSignedOut: () => () => undefined,
}
