import type { Ref } from 'react'
import { Doodle } from '../../components/doodles/Doodle'
import { Guide } from '../../components/Guide'
import { ReadAloud } from '../../components/ReadAloud'
import type { Phase } from '../../lib/lessonMachine'
import { useApp } from '../../state/AppContext'

interface FeedbackProps {
  phase: Phase
  message: string
  explain: string
  hint: string
  isLast: boolean
  actionRef: Ref<HTMLButtonElement>
  onNext: () => void
  onRetry: () => void
}

/**
 * Feedback after an answer. Right answers celebrate; wrong answers stay warm and
 * offer a hint, a read-aloud and a clear way to try again. No red, no alarm.
 * The wrapper is always present so screen readers hear each new message.
 */
export function Feedback({ phase, message, explain, hint, isLast, actionRef, onNext, onRetry }: FeedbackProps) {
  const { pack } = useApp()
  const ui = pack.ui.lesson
  const show = phase === 'correct' || phase === 'wrong'

  return (
    <div className="feedback-slot" aria-live="polite">
      {show && (
        <div className={`feedback feedback--${phase}`} key={`${phase}-${message}`}>
          <Guide mood={phase === 'correct' ? 'cheer' : 'think'} size={92} />
          <div className="feedback__body">
            <p className="feedback__message" id="feedback-message">
              {phase === 'correct' && <Doodle name="sparkle" size={26} tone="rifle" />}
              {message}
            </p>
            {phase === 'correct' ? (
              <p id="feedback-detail">{explain}</p>
            ) : (
              <p className="feedback__hint" id="feedback-detail">
                <i className="icon-bulb" aria-hidden="true" />
                <span><strong>{ui.hint}:</strong> {hint}</span>
              </p>
            )}
            <div className="btn-row">
              {phase === 'correct' ? (
                <button ref={actionRef} type="button" className="btn btn-primary" aria-describedby="feedback-message feedback-detail" onClick={onNext}>
                  {isLast ? ui.finish : ui.next}
                  <i className={`${isLast ? 'icon-flag' : 'icon-arrow-right flip-rtl'}`} aria-hidden="true" />
                </button>
              ) : (
                <>
                  <button ref={actionRef} type="button" className="btn btn-primary" aria-describedby="feedback-message feedback-detail" onClick={onRetry}>
                    <i className="icon-reload" aria-hidden="true" />
                    {ui.tryAgain}
                  </button>
                  <ReadAloud text={hint} label={ui.readHint} />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
