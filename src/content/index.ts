import { ar } from './ar'
import { en } from './en'
import { es } from './es'
import { fr } from './fr'
import type { LangCode, LanguagePack } from './types'
import { ur } from './ur'

export const PACKS: Record<LangCode, LanguagePack> = { en, es, fr, ar, ur }
export const LANG_CODES: readonly LangCode[] = ['en', 'es', 'fr', 'ar', 'ur']

export function isLangCode(value: unknown): value is LangCode {
  return typeof value === 'string' && (LANG_CODES as readonly string[]).includes(value)
}

/** Fill `{name}` style placeholders. Unknown placeholders are left as they are. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  )
}

/** Best guess at the visitor's language from the browser, falling back to English. */
export function detectLang(languages: readonly string[]): LangCode {
  for (const tag of languages) {
    const base = tag.toLowerCase().split('-')[0]
    if (isLangCode(base)) return base
  }
  return 'en'
}

export type { LangCode, LanguagePack } from './types'
