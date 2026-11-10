import { beforeEach, describe, expect, test } from 'vitest'
import { completeLesson, EMPTY_PROGRESS } from '../progress'
import { demoBackend } from './demo'

/** Small in-memory Storage, because jsdom on newer Node releases has no localStorage. */
function memoryStorage(): Storage {
  const data = new Map<string, string>()
  return {
    get length() { return data.size },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => [...data.keys()][index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  }
}

describe('demo backend', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'localStorage', { value: memoryStorage(), configurable: true })
  })

  test('sign up starts a session and never stores the password', async () => {
    const result = await demoBackend.signUp({ name: ' Maria ', email: 'Maria@Example.com', password: 'teapot-river-moon' })
    expect(result.ok).toBe(true)
    expect((await demoBackend.currentLearner())?.name).toBe('Maria')
    const stored = Array.from({ length: window.localStorage.length }, (_, i) => window.localStorage.getItem(window.localStorage.key(i) ?? ''))
    expect(stored.join(' ')).not.toContain('teapot-river-moon')
  })

  test('the same email cannot sign up twice', async () => {
    await demoBackend.signUp({ name: 'A', email: 'a@b.co', password: '12345678' })
    expect(await demoBackend.signUp({ name: 'B', email: 'A@B.co', password: '12345678' })).toEqual({ ok: false, error: 'email-taken' })
  })

  test('sign in finds the learner by email; unknown email is a friendly invalid-login', async () => {
    await demoBackend.signUp({ name: 'A', email: 'a@b.co', password: '12345678' })
    await demoBackend.signOut()
    expect(await demoBackend.currentLearner()).toBeNull()
    expect((await demoBackend.signIn({ email: 'a@b.co', password: 'x' })).ok).toBe(true)
    expect(await demoBackend.signIn({ email: 'nobody@b.co', password: 'x' })).toEqual({ ok: false, error: 'invalid-login' })
  })

  test('progress round-trips per learner', async () => {
    const progress = completeLesson(EMPTY_PROGRESS, 'basics', { completedAt: '2026-11-07T10:00:00.000Z', firstTry: 2, total: 3 })
    await demoBackend.saveProgress('learner-1', progress)
    expect(await demoBackend.loadProgress('learner-1')).toEqual(progress)
    expect(await demoBackend.loadProgress('learner-2')).toEqual(EMPTY_PROGRESS)
  })
})
