import { demoBackend } from './demo'
import { createSupabaseBackend } from './supabase'
import type { Backend } from './types'

/** Supabase when both keys are set; otherwise Demo mode so the app always runs. */
function chooseBackend(): Backend {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined
  if (url && key) return createSupabaseBackend(url, key)
  return demoBackend
}

export const backend: Backend = chooseBackend()
export type { AuthErrorCode, AuthResult, Backend, Learner } from './types'
