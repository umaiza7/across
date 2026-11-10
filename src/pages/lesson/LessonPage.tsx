import { useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Doodle } from '../../components/doodles/Doodle'
import { GuideSays } from '../../components/GuideSays'
import { ProgressTrack } from '../../components/ProgressTrack'
import { ReadAloud } from '../../components/ReadAloud'
import { SparkleBurst } from '../../components/SparkleBurst'
import { format } from '../../content'
import { findLesson } from '../../content/lessons'
import type { BadgeId, ChoiceIndex, LessonShape } from '../../content/types'
import { fireConfetti, motionAllowed, playChime } from '../../lib/device'
import { INITIAL_LESSON, lessonReducer } from '../../lib/lessonMachine'
import { createMessagePicker } from '../../lib/messages'
import { soundEnabled } from '../../lib/settings'
import { useApp } from '../../state/AppContext'
import { CompletionView } from './CompletionView'
import { Feedback } from './Feedback'
import './lesson.css'

const STUCK_AFTER_MS = 25_000
const LETTERS = ['A', 'B', 'C'] as const

export function LessonPage() {
  const { id } = useParams()
  const { pack } = useApp()
  const lesson = findLesson(id)
  if (!lesson) {
    return (
      <div className="empty">
        <GuideSays mood="curious"><p>{pack.ui.lesson.notFound}</p></GuideSays>
        <Link to="/journey" className="btn btn-primary">{pack.ui.lesson.exit}</Link>
      </div>
    )
  }
  return <LessonRunner lesson={lesson} key={lesson.id} />
}

function LessonRunner({ lesson }: { lesson: LessonShape }) {
  const { pack, settings, finishLesson } = useApp()
  const ui = pack.ui.lesson
  const text = pack.lessons[lesson.id]
  const total = text.questions.length
  const [state, dispatch] = useReducer(lessonReducer, INITIAL_LESSON)
  const [message, setMessage] = useState('')
  const [earned, setEarned] = useState<readonly BadgeId[]>([])
  const [stuck, setStuck] = useState(false)
  const [hintShown, setHintShown] = useState(false)
  const actionRef = useRef<HTMLButtonElement>(null)
  const promptRef = useRef<HTMLHeadingElement>(null)
  const choicesRef = useRef<HTMLUListElement>(null)
  const hintRef = useRef<HTMLParagraphElement>(null)

  const pickers = useMemo(
    () => ({
      correct: createMessagePicker(pack.messages.correct),
      wrong: createMessagePicker(pack.messages.wrong),
      complete: createMessagePicker(pack.messages.complete),
    }),
    [pack],
  )

  const question = text.questions[state.index]
  const correct = lesson.correct[state.index]
  const isLast = state.index === total - 1

  // Offer help after a quiet spell on a question, never while feedback is showing.
  useEffect(() => {
    setStuck(false)
    if (state.phase !== 'asking') return
    const timer = window.setTimeout(() => setStuck(true), STUCK_AFTER_MS)
    return () => window.clearTimeout(timer)
  }, [state.index, state.phase])

  // Keyboard and screen-reader flow: focus follows the next useful control.
  useEffect(() => {
    if (state.phase === 'correct' || state.phase === 'wrong') actionRef.current?.focus()
  }, [state.phase, state.celebrations, state.tried.length])

  const handleSelect = (choice: ChoiceIndex) => {
    if (state.phase !== 'asking' || state.tried.includes(choice)) return
    const isRight = choice === correct
    setMessage(isRight ? pickers.correct() : pickers.wrong())
    if (isRight && soundEnabled(settings)) playChime('correct')
    dispatch({ type: 'select', choice, correct })
  }

  const handleRetry = () => {
    dispatch({ type: 'retry' })
    requestAnimationFrame(() => choicesRef.current?.querySelector<HTMLButtonElement>('button:not(:disabled)')?.focus())
  }

  const handleNext = () => {
    if (isLast) {
      const unlocked = finishLesson(lesson.id, state.firstTry, total)
      setEarned(unlocked)
      setMessage(pickers.complete())
      // Fired from the click, so re-renders can never replay it.
      if (motionAllowed(settings.calm)) void fireConfetti()
      if (soundEnabled(settings)) playChime('complete')
    }
    setHintShown(false)
    dispatch({ type: 'next', total })
    if (!isLast) requestAnimationFrame(() => promptRef.current?.focus())
  }

  if (state.phase === 'finished') {
    return <CompletionView lessonId={lesson.id} firstTry={state.firstTry} total={total} earned={earned} cheer={message} />
  }

  const answered = state.index + (state.phase === 'correct' ? 1 : 0)

  return (
    <div className="lesson">
      <div className="lesson__top">
        <Link to="/journey" className="btn btn-quiet lesson__exit">
          <i className="icon-arrow-left flip-rtl" aria-hidden="true" />
          {ui.exit}
        </Link>
        <ProgressTrack value={answered} max={total} label={format(ui.questionOf, { n: state.index + 1, total })} />
      </div>

      <section className="question" aria-labelledby="question-prompt">
        <Doodle name="bubble" size={46} tone="kangaroo" tilt={-8} motion="float" className="doodle-spot question__d1" />
        <Doodle name="sparkle" size={24} tone="oyster" motion="twinkle" className="doodle-spot question__d2" />
        <p className="question__lesson">
          <i className={lesson.icon} aria-hidden="true" />
          {text.title}
        </p>
        <h1 id="question-prompt" ref={promptRef} tabIndex={-1} className="question__prompt">{question.prompt}</h1>
        <ReadAloud
          text={`${question.prompt} ${question.options.map((option, i) => `${LETTERS[i]}. ${option}`).join('. ')}`}
          label={ui.readQuestion}
          variant="quiet"
        />

        <ul className="choices" ref={choicesRef}>
          {question.options.map((option, i) => {
            const choice = i as ChoiceIndex
            const tried = state.tried.includes(choice)
            const isCorrectPick = state.phase === 'correct' && state.selected === choice
            const isWrongPick = state.phase === 'wrong' && state.selected === choice
            const stateClass = isCorrectPick ? 'choice--correct' : isWrongPick ? 'choice--wrong' : tried ? 'choice--tried' : ''
            return (
              <li key={`${state.index}-${i}`}>
                <button
                  type="button"
                  className={`choice ${stateClass}`}
                  onClick={() => handleSelect(choice)}
                  disabled={tried || state.phase === 'correct'}
                  aria-describedby={tried ? `choice-state-${i}` : undefined}
                >
                  <span className="choice__letter" aria-hidden="true">{LETTERS[i]}</span>
                  <span className="choice__text">{option}</span>
                  {isCorrectPick && <i className="icon-check choice__mark" aria-hidden="true" />}
                  {tried && <span id={`choice-state-${i}`} className="choice__note">{ui.notThisOne}</span>}
                  {isCorrectPick && <SparkleBurst trigger={state.celebrations} />}
                </button>
              </li>
            )
          })}
        </ul>

        {/* Always mounted and filled later, so screen readers reliably announce the offer of help. */}
        <p className="visually-hidden" role="status">{stuck && state.phase === 'asking' ? ui.stuck : ''}</p>
        {stuck && state.phase === 'asking' && (
          <GuideSays
            mood="calm"
            size={80}
            className="question__stuck"
            actions={
              hintShown ? (
                <ReadAloud text={question.hint} label={ui.readHint} />
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setHintShown(true)
                    // The button is replaced by the hint, so focus moves to the hint itself.
                    requestAnimationFrame(() => hintRef.current?.focus())
                  }}
                >
                  <i className="icon-bulb" aria-hidden="true" />
                  {ui.showHint}
                </button>
              )
            }
          >
            <p ref={hintRef} tabIndex={-1} className="question__stuck-text">{hintShown ? question.hint : ui.stuck}</p>
          </GuideSays>
        )}
      </section>

      <Feedback
        phase={state.phase}
        message={message}
        explain={question.explain}
        hint={question.hint}
        isLast={isLast}
        actionRef={actionRef}
        onNext={handleNext}
        onRetry={handleRetry}
      />
    </div>
  )
}
