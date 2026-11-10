import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Doodle } from '../components/doodles/Doodle'
import { Guide, type GuideMood } from '../components/Guide'
import { LANG_CODES, PACKS } from '../content'
import { useApp } from '../state/AppContext'
import './pages.css'

const STEP_MOODS: readonly GuideMood[] = ['wave', 'think', 'cheer']

/** Onboarding: language first, then three short screens with the Guide. */
export function WelcomePage() {
  const { pack, settings, updateSettings } = useApp()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const ui = pack.ui.welcome
  const content = ui.steps[step]
  const last = step === ui.steps.length - 1

  return (
    <main id="main" className="welcome">
      <p className="wordmark-lg welcome__brand">
        <Doodle name="sparkle" size={24} tone="rifle" tilt={-10} />
        ACROSS
      </p>
      <div className="welcome__art">
        <Doodle name="sparkle" size={34} tone="rifle" motion="twinkle" className="doodle-spot welcome__d1" />
        <Doodle name="phone" size={54} tone="oyster" motion="float" tilt={-12} className="doodle-spot welcome__d2" />
        <Doodle name="heart" size={34} tone="kangaroo" motion="float" tilt={10} delay={1.2} className="doodle-spot welcome__d3" />
        <Doodle name="chat" size={52} tone="oyster" motion="sway" tilt={6} delay={0.6} className="doodle-spot welcome__d4" />
        <Doodle name="star" size={26} tone="rifle" motion="twinkle" delay={0.9} className="doodle-spot welcome__d5" />
        <Doodle name="people" size={58} tone="rifle" tilt={-4} className="doodle-spot welcome__d6" />
        <Guide mood={STEP_MOODS[step]} size={190} key={step} />
      </div>

      <div className="welcome__copy">
        <h1 tabIndex={-1}>{content.title}</h1>
        <p className="welcome__body">{content.body}</p>

        {step === 0 && (
          <fieldset className="lang-picker">
            <legend>{ui.chooseLanguage}</legend>
            <div className="lang-picker__grid">
              {LANG_CODES.map((code) => (
                <label key={code} className="lang-option" lang={code} dir={PACKS[code].dir}>
                  <input
                    type="radio"
                    name="lang"
                    value={code}
                    checked={settings.lang === code}
                    onChange={() => updateSettings({ lang: code })}
                  />
                  <span>{PACKS[code].name}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="welcome__steps" aria-hidden="true">
          {ui.steps.map((_, i) => (
            <span key={i} className={`welcome__dot ${i === step ? 'is-active' : ''}`} />
          ))}
        </div>

        <div className="btn-row">
          {step > 0 && (
            <button type="button" className="btn btn-secondary" onClick={() => setStep(step - 1)}>
              <i className="icon-arrow-left flip-rtl" aria-hidden="true" />
              {ui.back}
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => (last ? navigate('/signup') : setStep(step + 1))}
          >
            {last ? ui.start : ui.next}
            <i className="icon-arrow-right flip-rtl" aria-hidden="true" />
          </button>
        </div>
        <Link to="/signin" className="welcome__signin">{ui.haveAccount}</Link>
      </div>
    </main>
  )
}
