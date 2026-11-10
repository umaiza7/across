import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { detectLang, PACKS, type LanguagePack } from '../content'
import type { BadgeId, LessonId } from '../content/types'
import { backend, type AuthResult, type Learner } from '../lib/backend'
import { newlyUnlocked } from '../lib/badges'
import { completeLesson, EMPTY_PROGRESS, markBadgesSeen, mergeProgress, parseProgress, type Progress } from '../lib/progress'
import { defaultSettings, loadSettings, saveSettings, type Settings } from '../lib/settings'

interface AppValue {
  status: 'loading' | 'ready'
  mode: 'supabase' | 'demo'
  learner: Learner | null
  progress: Progress
  settings: Settings
  pack: LanguagePack
  saveError: boolean
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  signIn: (email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
  /** Saves a finished lesson (and marks its new badges as seen) in one write. Returns the badges it unlocked. */
  finishLesson: (id: LessonId, firstTry: number, total: number) => BadgeId[]
  markBadgesSeen: (ids: readonly BadgeId[]) => void
  retrySave: () => void
  updateSettings: (patch: Partial<Settings>) => void
}

const AppContext = createContext<AppValue | null>(null)

// A local copy on this device. It is merged back in on the next successful load,
// so progress made while a save was failing is never lost.
const backupKey = (id: string) => `across.progress.backup.${id}`
function writeBackup(id: string, progress: Progress): void {
  try {
    window.localStorage.setItem(backupKey(id), JSON.stringify(progress))
  } catch {
    // Storage blocked: the server copy is the only copy.
  }
}
function readBackup(id: string): Progress | null {
  try {
    const raw = window.localStorage.getItem(backupKey(id))
    return raw ? parseProgress(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')
  const [learner, setLearner] = useState<Learner | null>(null)
  const [progress, setProgress] = useState<Progress>(EMPTY_PROGRESS)
  const [saveError, setSaveError] = useState(false)
  const [settings, setSettings] = useState<Settings>(() =>
    loadSettings(defaultSettings(detectLang(typeof navigator === 'undefined' ? [] : navigator.languages))),
  )
  const progressRef = useRef(progress)
  progressRef.current = progress
  const learnerRef = useRef<Learner | null>(null)
  /** True once the server copy has been read. Until then we never overwrite it. */
  const serverLoaded = useRef(false)
  /** Only the newest save may update the error banner. */
  const saveSeq = useRef(0)
  const pack = PACKS[settings.lang]

  const persist = useCallback((id: string, next: Progress) => {
    writeBackup(id, next)
    if (!serverLoaded.current) {
      setSaveError(true)
      return
    }
    const seq = ++saveSeq.current
    const settle = (failed: boolean) => {
      if (seq === saveSeq.current && learnerRef.current?.id === id) setSaveError(failed)
    }
    backend.saveProgress(id, next).then(() => settle(false), () => settle(true))
  }, [])

  const commit = useCallback(
    (next: Progress) => {
      progressRef.current = next
      setProgress(next)
      if (learnerRef.current) persist(learnerRef.current.id, next)
    },
    [persist],
  )

  /** Read the server copy and fold in anything only this device knows about. */
  const syncFromServer = useCallback(
    async (who: Learner, local: Progress | null): Promise<void> => {
      const server = await backend.loadProgress(who.id)
      serverLoaded.current = true
      const merged = local ? mergeProgress(server, local) : server
      progressRef.current = merged
      setProgress(merged)
      if (JSON.stringify(merged) !== JSON.stringify(server)) persist(who.id, merged)
      else setSaveError(false)
    },
    [persist],
  )

  const enter = useCallback(
    async (who: Learner) => {
      learnerRef.current = who
      serverLoaded.current = false
      setLearner(who)
      const backup = readBackup(who.id)
      try {
        await syncFromServer(who, backup)
      } catch {
        progressRef.current = backup ?? EMPTY_PROGRESS
        setProgress(progressRef.current)
        setSaveError(true)
      }
    },
    [syncFromServer],
  )

  const leave = useCallback(() => {
    learnerRef.current = null
    serverLoaded.current = false
    saveSeq.current += 1
    setLearner(null)
    progressRef.current = EMPTY_PROGRESS
    setProgress(EMPTY_PROGRESS)
    setSaveError(false)
  }, [])

  useEffect(() => {
    let active = true
    backend
      .currentLearner()
      .then((who) => (who && active ? enter(who) : undefined))
      .catch(() => undefined)
      .finally(() => active && setStatus('ready'))
    return () => {
      active = false
    }
  }, [enter])

  // A session that ends elsewhere (expired, revoked, another tab) signs out here too.
  useEffect(() => backend.onSignedOut(leave), [leave])

  useEffect(() => {
    const root = document.documentElement
    root.lang = pack.code
    root.dir = pack.dir
    root.dataset.calm = String(settings.calm)
    saveSettings(settings)
  }, [pack, settings])

  const value = useMemo<AppValue>(() => {
    const authThen = async (attempt: () => Promise<AuthResult>): Promise<AuthResult> => {
      try {
        const outcome = await attempt()
        if (outcome.ok) await enter(outcome.learner)
        return outcome
      } catch {
        return { ok: false, error: 'unknown' }
      }
    }
    return {
      status,
      mode: backend.mode,
      learner,
      progress,
      settings,
      pack,
      saveError,
      signUp: (name, email, password) => authThen(() => backend.signUp({ name, email, password })),
      signIn: (email, password) => authThen(() => backend.signIn({ email, password })),
      signOut: async () => {
        try {
          await backend.signOut()
        } finally {
          leave()
        }
      },
      finishLesson: (id, firstTry, total) => {
        const before = progressRef.current
        const done = completeLesson(before, id, { completedAt: new Date().toISOString(), firstTry, total })
        const unlocked = newlyUnlocked(before, done)
        commit(markBadgesSeen(done, unlocked))
        return unlocked
      },
      markBadgesSeen: (ids) => {
        const after = markBadgesSeen(progressRef.current, ids)
        if (after !== progressRef.current) commit(after)
      },
      retrySave: () => {
        const who = learnerRef.current
        if (!who) return
        if (serverLoaded.current) {
          persist(who.id, progressRef.current)
          return
        }
        syncFromServer(who, progressRef.current).catch(() => setSaveError(true))
      },
      updateSettings: (patch) => setSettings((current) => ({ ...current, ...patch })),
    }
  }, [status, learner, progress, settings, pack, saveError, enter, leave, commit, persist, syncFromServer])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp(): AppValue {
  const value = useContext(AppContext)
  if (!value) throw new Error('useApp must be used inside <AppProvider>')
  return value
}
