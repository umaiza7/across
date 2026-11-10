import { createClient, type AuthError, type SupabaseClient, type User } from '@supabase/supabase-js'
import { parseProgress } from '../progress'
import type { AuthErrorCode, AuthResult, Backend, Learner } from './types'

const TABLE = 'learner_progress'

function toLearner(user: User): Learner {
  const meta = user.user_metadata as Record<string, unknown> | undefined
  const name = typeof meta?.name === 'string' && meta.name.trim() ? meta.name.trim() : (user.email ?? '').split('@')[0]
  return { id: user.id, name, email: user.email ?? '' }
}

function errorCode(error: AuthError | Error): AuthErrorCode {
  const message = error.message.toLowerCase()
  if (message.includes('invalid login') || message.includes('invalid credentials')) return 'invalid-login'
  if (message.includes('already registered') || message.includes('already exists')) return 'email-taken'
  if (message.includes('email not confirmed')) return 'check-email'
  if (message.includes('fetch') || message.includes('network')) return 'network'
  return 'unknown'
}

async function guard(run: () => Promise<AuthResult>): Promise<AuthResult> {
  try {
    return await run()
  } catch (error: unknown) {
    return { ok: false, error: error instanceof Error ? errorCode(error) : 'unknown' }
  }
}

export function createSupabaseBackend(url: string, anonKey: string): Backend {
  const client: SupabaseClient = createClient(url, anonKey)

  return {
    mode: 'supabase',
    async currentLearner() {
      const { data } = await client.auth.getSession()
      return data.session ? toLearner(data.session.user) : null
    },
    signUp: ({ name, email, password }) =>
      guard(async () => {
        const { data, error } = await client.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { name: name.trim() } },
        })
        if (error) return { ok: false, error: errorCode(error) }
        // With email confirmation on, Supabase returns a user but no session yet.
        if (!data.session || !data.user) return { ok: false, error: 'check-email' }
        return { ok: true, learner: toLearner(data.user) }
      }),
    signIn: ({ email, password }) =>
      guard(async () => {
        const { data, error } = await client.auth.signInWithPassword({ email: email.trim(), password })
        if (error) return { ok: false, error: errorCode(error) }
        return { ok: true, learner: toLearner(data.user) }
      }),
    async signOut() {
      await client.auth.signOut()
    },
    async loadProgress(learnerId) {
      const { data, error } = await client.from(TABLE).select('data').eq('user_id', learnerId).maybeSingle()
      if (error) throw new Error(`Could not load progress: ${error.message}`)
      return parseProgress(data?.data)
    },
    async saveProgress(learnerId, progress) {
      const { error } = await client
        .from(TABLE)
        .upsert({ user_id: learnerId, data: progress, updated_at: new Date().toISOString() })
      if (error) throw new Error(`Could not save progress: ${error.message}`)
    },
    onSignedOut(callback) {
      const { data } = client.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_OUT') callback()
      })
      return () => data.subscription.unsubscribe()
    },
  }
}
