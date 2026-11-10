import { useId, useRef, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Doodle } from '../components/doodles/Doodle'
import { GuideSays } from '../components/GuideSays'
import type { AuthErrorCode } from '../lib/backend'
import { useApp } from '../state/AppContext'
import './pages.css'

type Field = 'name' | 'email' | 'password'
type FieldErrors = Partial<Record<Field, string>>

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const MIN_PASSWORD = 8

const AUTH_ERROR_KEY: Record<AuthErrorCode, 'invalidLogin' | 'emailTaken' | 'checkEmail' | 'network' | 'unknown'> = {
  'invalid-login': 'invalidLogin',
  'email-taken': 'emailTaken',
  'check-email': 'checkEmail',
  network: 'network',
  unknown: 'unknown',
}

export function AuthPage({ mode }: { mode: 'signin' | 'signup' }) {
  const { pack, signIn, signUp, mode: backendMode } = useApp()
  const navigate = useNavigate()
  const ui = pack.ui.auth
  const id = useId()
  const isSignUp = mode === 'signup'
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [busy, setBusy] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)

  const validate = (field: Field, value: string): string | undefined => {
    if (field === 'name' && isSignUp && value.trim().length === 0) return ui.errors.name
    if (field === 'email' && !EMAIL.test(value.trim())) return ui.errors.email
    if (field === 'password' && isSignUp && value.length < MIN_PASSWORD) return ui.errors.password
    if (field === 'password' && !isSignUp && value.length === 0) return ui.errors.password
    return undefined
  }

  const fields: Field[] = isSignUp ? ['name', 'email', 'password'] : ['email', 'password']

  const handleBlur = (field: Field) => {
    if (!values[field]) return
    setErrors((current) => ({ ...current, [field]: validate(field, values[field]) }))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    const found: FieldErrors = {}
    for (const field of fields) {
      const message = validate(field, values[field])
      if (message) found[field] = message
    }
    setErrors(found)
    setFormError(null)
    const firstInvalid = fields.find((field) => found[field])
    if (firstInvalid) {
      document.getElementById(`${id}-${firstInvalid}`)?.focus()
      return
    }
    setBusy(true)
    let errorKey: keyof typeof ui.errors = 'unknown'
    try {
      const result = isSignUp
        ? await signUp(values.name, values.email, values.password)
        : await signIn(values.email, values.password)
      if (result.ok) {
        navigate('/journey', { replace: true })
        return
      }
      errorKey = AUTH_ERROR_KEY[result.error]
    } catch {
      errorKey = 'unknown'
    } finally {
      setBusy(false)
    }
    setFormError(ui.errors[errorKey])
    requestAnimationFrame(() => summaryRef.current?.focus())
  }

  const fieldProps = (field: Field) => ({
    id: `${id}-${field}`,
    className: 'input',
    value: values[field],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, [field]: event.target.value }),
    onBlur: () => handleBlur(field),
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': `${id}-${field}-help`,
  })

  const help = (field: Field, hint?: string) => (
    <span id={`${id}-${field}-help`}>
      {errors[field] ? (
        <span className="error"><i className="icon-info" aria-hidden="true" />{errors[field]}</span>
      ) : (
        hint && <span className="hint">{hint}</span>
      )}
    </span>
  )

  return (
    <main id="main" className="auth">
      <div className="auth__intro">
        <Doodle name="loop" size={70} tone="kangaroo" tilt={-8} className="doodle-spot auth__d1" />
        <Doodle name="sparkle" size={28} tone="rifle" motion="twinkle" className="doodle-spot auth__d2" />
        <p className="wordmark-lg">ACROSS</p>
        <GuideSays mood={isSignUp ? 'wave' : 'happy'} size={104}>
          <h1 tabIndex={-1} className="auth__title">{isSignUp ? ui.signUpTitle : ui.signInTitle}</h1>
          <p>{isSignUp ? ui.signUpIntro : ui.signInIntro}</p>
        </GuideSays>
      </div>

      <form className="auth__form card" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div ref={summaryRef} className="notice" role="alert" tabIndex={-1}>
            <i className="icon-bubble" aria-hidden="true" />
            <p>{formError}</p>
          </div>
        )}
        {isSignUp && (
          <div className="field">
            <label htmlFor={`${id}-name`}>{ui.name}</label>
            <input {...fieldProps('name')} type="text" autoComplete="given-name" required />
            {help('name')}
          </div>
        )}
        <div className="field">
          <label htmlFor={`${id}-email`}>{ui.email}</label>
          <input {...fieldProps('email')} type="email" inputMode="email" autoComplete="email" dir="ltr" required />
          {help('email', ui.emailHint)}
        </div>
        <div className="field">
          <label htmlFor={`${id}-password`}>{ui.password}</label>
          <div className="password">
            <input
              {...fieldProps('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              dir="ltr"
              required
            />
            <button
              type="button"
              className="btn btn-quiet password__toggle"
              onClick={() => setShowPassword(!showPassword)}
              aria-pressed={showPassword}
            >
              <i className={showPassword ? 'icon-eye-off' : 'icon-eye'} aria-hidden="true" />
              {showPassword ? ui.hidePassword : ui.showPassword}
            </button>
          </div>
          {help('password', isSignUp ? ui.passwordHint : undefined)}
        </div>
        <button type="submit" className="btn btn-primary btn-block" aria-busy={busy} disabled={busy}>
          {busy ? ui.working : isSignUp ? ui.createAccount : ui.signIn}
        </button>
        <Link to={isSignUp ? '/signin' : '/signup'} className="auth__switch">
          {isSignUp ? ui.toSignIn : ui.toSignUp}
        </Link>
        {backendMode === 'demo' && <p className="hint auth__demo">{ui.demoNote}</p>}
      </form>
    </main>
  )
}
