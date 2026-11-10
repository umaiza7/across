import type { Progress } from '../progress'

export interface Learner {
  id: string
  name: string
  email: string
}

export type AuthErrorCode = 'invalid-login' | 'email-taken' | 'check-email' | 'network' | 'unknown'

export type AuthResult = { ok: true; learner: Learner } | { ok: false; error: AuthErrorCode }

export interface SignUpInput {
  name: string
  email: string
  password: string
}

export interface SignInInput {
  email: string
  password: string
}

/** Everything the app needs from an account system. Supabase and Demo mode both implement it. */
export interface Backend {
  mode: 'supabase' | 'demo'
  currentLearner: () => Promise<Learner | null>
  signUp: (input: SignUpInput) => Promise<AuthResult>
  signIn: (input: SignInInput) => Promise<AuthResult>
  signOut: () => Promise<void>
  loadProgress: (learnerId: string) => Promise<Progress>
  saveProgress: (learnerId: string, progress: Progress) => Promise<void>
  /** Called when the session ends elsewhere (expired, revoked, signed out in another tab). Returns an unsubscribe. */
  onSignedOut: (callback: () => void) => () => void
}
