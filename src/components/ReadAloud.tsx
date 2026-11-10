import { useEffect, useState } from 'react'
import { speak, speechAvailable, stopSpeaking } from '../lib/device'
import { useApp } from '../state/AppContext'

interface ReadAloudProps {
  text: string
  label: string
  variant?: 'secondary' | 'quiet'
}

/** Reads text with the device's own voice. Hidden where the browser has no speech support. */
export function ReadAloud({ text, label, variant = 'secondary' }: ReadAloudProps) {
  const { pack } = useApp()
  const [speaking, setSpeaking] = useState(false)

  useEffect(() => () => stopSpeaking(), [])

  if (!speechAvailable()) return null

  const handleClick = () => {
    if (speaking) {
      stopSpeaking()
      setSpeaking(false)
      return
    }
    setSpeaking(speak(text, pack.speechLang, () => setSpeaking(false)))
  }

  return (
    <button type="button" className={`btn btn-${variant}`} onClick={handleClick} aria-pressed={speaking}>
      <i className={speaking ? 'icon-control-pause' : 'icon-volume-2'} aria-hidden="true" />
      {speaking ? pack.ui.lesson.stopReading : label}
    </button>
  )
}
