/** Browser features: reduced motion, reading aloud, gentle sounds and confetti. */

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/** Decorative motion plays only when Calm mode is off and the system allows motion. */
export function motionAllowed(calm: boolean): boolean {
  return !calm && !prefersReducedMotion()
}

// ---- Reading aloud (device voices, no network) ----

export function speechAvailable(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function hasVoiceFor(lang: string): boolean {
  if (!speechAvailable()) return false
  const base = lang.toLowerCase().split('-')[0]
  return window.speechSynthesis.getVoices().some((voice) => voice.lang.toLowerCase().startsWith(base))
}

export function speak(text: string, lang: string, onEnd?: () => void): boolean {
  if (!speechAvailable()) return false
  const synth = window.speechSynthesis
  synth.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.9
  const base = lang.toLowerCase().split('-')[0]
  const voice =
    synth.getVoices().find((v) => v.lang.toLowerCase() === lang.toLowerCase()) ??
    synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(base))
  if (voice) utterance.voice = voice
  utterance.onend = () => onEnd?.()
  utterance.onerror = () => onEnd?.()
  synth.speak(utterance)
  return true
}

export function stopSpeaking(): void {
  if (speechAvailable()) window.speechSynthesis.cancel()
}

// ---- Gentle sounds (generated, no audio files) ----

let audio: AudioContext | null = null

function note(ctx: AudioContext, frequency: number, start: number, length: number): void {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.value = frequency
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(0.12, start + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + length)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + length)
}

/** Soft rising chime. Only ever called when the learner switched sounds on. */
export function playChime(kind: 'correct' | 'complete'): void {
  try {
    audio ??= new AudioContext()
    const now = audio.currentTime
    const notes = kind === 'correct' ? [659.25, 880] : [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((frequency, i) => note(audio!, frequency, now + i * 0.11, 0.5))
  } catch {
    // Audio is a bonus; the text feedback already says the same thing.
  }
}

// ---- Confetti, in the ACROSS palette only ----

const PALETTE = ['#d0c7b3', '#939474', '#43442b', '#f1f1ec', '#6b6c52']

export async function fireConfetti(): Promise<void> {
  const { default: confetti } = await import('canvas-confetti')
  const base = { colors: PALETTE, disableForReducedMotion: true, ticks: 220, gravity: 0.8, scalar: 1.1 }
  confetti({ ...base, particleCount: 90, spread: 75, origin: { y: 0.35 } })
  window.setTimeout(() => {
    confetti({ ...base, particleCount: 50, angle: 60, spread: 60, origin: { x: 0, y: 0.6 } })
    confetti({ ...base, particleCount: 50, angle: 120, spread: 60, origin: { x: 1, y: 0.6 } })
  }, 250)
}
