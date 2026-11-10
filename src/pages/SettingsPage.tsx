import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Heading } from '../components/Heading'
import { LANG_CODES, PACKS, format } from '../content'
import { hasVoiceFor, speak, speechAvailable } from '../lib/device'
import { useApp } from '../state/AppContext'
import './pages.css'

interface SwitchProps {
  label: string
  hint: string
  checked: boolean
  disabled?: boolean
  onChange: (value: boolean) => void
}

function Switch({ label, hint, checked, disabled = false, onChange }: SwitchProps) {
  return (
    <div className={`setting ${disabled ? 'setting--disabled' : ''}`}>
      <div className="setting__text">
        <span className="setting__label">{label}</span>
        <span className="hint">{hint}</span>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        className="switch"
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  )
}

export function SettingsPage() {
  const { pack, settings, updateSettings, learner, mode, signOut } = useApp()
  const navigate = useNavigate()
  const ui = pack.ui.settings
  const [voiceReady, setVoiceReady] = useState(() => hasVoiceFor(pack.speechLang))

  // Voices load late on some browsers; check again when the list arrives.
  useEffect(() => {
    if (!speechAvailable()) return
    const update = () => setVoiceReady(hasVoiceFor(pack.speechLang))
    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [pack.speechLang])

  const handleSignOut = async () => {
    await signOut()
    navigate('/welcome', { replace: true })
  }

  return (
    <div className="settings">
      <header className="page-head">
        <Heading>{ui.title}</Heading>
      </header>

      <section className="settings__group" aria-labelledby="lang-title">
        <h2 id="lang-title" className="settings__title">{ui.language}</h2>
        <div className="lang-picker__grid">
          {LANG_CODES.map((code) => (
            <label key={code} className="lang-option" lang={code} dir={PACKS[code].dir}>
              <input type="radio" name="lang" value={code} checked={settings.lang === code} onChange={() => updateSettings({ lang: code })} />
              <span>{PACKS[code].name}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="settings__group">
        <Switch label={ui.calm} hint={ui.calmHint} checked={settings.calm} onChange={(calm) => updateSettings({ calm })} />
        <Switch
          label={ui.sound}
          hint={settings.calm ? ui.soundOffInCalm : ui.soundHint}
          checked={settings.sound && !settings.calm}
          disabled={settings.calm}
          onChange={(sound) => updateSettings({ sound })}
        />
      </section>

      {speechAvailable() && (
        <section className="settings__group" aria-labelledby="voice-title">
          <h2 id="voice-title" className="settings__title">{ui.voice}</h2>
          {voiceReady ? (
            <button type="button" className="btn btn-secondary" onClick={() => speak(ui.voiceSample, pack.speechLang)}>
              <i className="icon-volume-2" aria-hidden="true" />
              {ui.voiceTest}
            </button>
          ) : (
            <p className="hint">{ui.voiceMissing}</p>
          )}
        </section>
      )}

      <section className="settings__group" aria-labelledby="account-title">
        <h2 id="account-title" className="settings__title">{ui.account}</h2>
        {learner && <p>{format(ui.signedInAs, { email: learner.email })}</p>}
        {mode === 'demo' && <p className="hint">{ui.demoMode}: {ui.demoModeHint}</p>}
        <button type="button" className="btn btn-secondary settings__signout" onClick={handleSignOut}>
          <i className="icon-logout flip-rtl" aria-hidden="true" />
          {ui.signOut}
        </button>
      </section>
    </div>
  )
}
