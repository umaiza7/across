import { isLangCode, type LangCode } from '../content'

export interface Settings {
  lang: LangCode
  /** One switch for older learners: no decorative motion, no confetti, no sound. */
  calm: boolean
  /** Off by default, as the brief asks. */
  sound: boolean
}

const STORAGE_KEY = 'across.settings'

export function defaultSettings(lang: LangCode): Settings {
  return { lang, calm: false, sound: false }
}

export function parseSettings(value: unknown, fallback: Settings): Settings {
  if (typeof value !== 'object' || value === null) return fallback
  const raw = value as Record<string, unknown>
  return {
    lang: isLangCode(raw.lang) ? raw.lang : fallback.lang,
    calm: typeof raw.calm === 'boolean' ? raw.calm : fallback.calm,
    sound: typeof raw.sound === 'boolean' ? raw.sound : fallback.sound,
  }
}

export function loadSettings(fallback: Settings): Settings {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return stored ? parseSettings(JSON.parse(stored), fallback) : fallback
  } catch {
    return fallback
  }
}

export function saveSettings(settings: Settings): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  } catch {
    // Private browsing can block storage; settings still apply for this visit.
  }
}

/** Sound only plays when the learner turned it on and Calm mode is off. */
export function soundEnabled(settings: Settings): boolean {
  return settings.sound && !settings.calm
}
