import { describe, expect, test } from 'vitest'
import { detectLang, format, PACKS } from '../content'
import { LESSONS } from '../content/lessons'
import { defaultSettings, parseSettings, soundEnabled } from './settings'

describe('settings', () => {
  test('sound is off by default', () => {
    expect(defaultSettings('en').sound).toBe(false)
  })

  test('calm mode silences sound even when sound is on', () => {
    expect(soundEnabled({ lang: 'en', calm: true, sound: true })).toBe(false)
    expect(soundEnabled({ lang: 'en', calm: false, sound: true })).toBe(true)
  })

  test('parseSettings keeps valid fields and falls back on bad ones', () => {
    const fallback = defaultSettings('en')
    expect(parseSettings({ lang: 'ur', calm: 'yes', sound: true }, fallback)).toEqual({ lang: 'ur', calm: false, sound: true })
    expect(parseSettings({ lang: 'xx' }, fallback).lang).toBe('en')
    expect(parseSettings(null, fallback)).toBe(fallback)
  })
})

describe('content', () => {
  test('detectLang matches the base language and falls back to English', () => {
    expect(detectLang(['ar-EG', 'en'])).toBe('ar')
    expect(detectLang(['de-DE'])).toBe('en')
  })

  test('format fills placeholders and leaves unknown ones', () => {
    expect(format('{n} of {total}', { n: 2, total: 5 })).toBe('2 of 5')
    expect(format('Hi {who}', {})).toBe('Hi {who}')
  })

  test('every language has every lesson with matching question counts and three options', () => {
    for (const pack of Object.values(PACKS)) {
      for (const lesson of LESSONS) {
        const text = pack.lessons[lesson.id]
        expect(text.questions, `${pack.code}/${lesson.id}`).toHaveLength(lesson.correct.length)
        for (const question of text.questions) expect(question.options).toHaveLength(3)
      }
    }
  })

  test('every language has enough encouraging messages to rotate', () => {
    for (const pack of Object.values(PACKS)) {
      expect(pack.messages.correct.length).toBeGreaterThanOrEqual(4)
      expect(pack.messages.wrong.length).toBeGreaterThanOrEqual(4)
    }
  })

  test('right-to-left only for Arabic and Urdu', () => {
    const rtl = Object.values(PACKS).filter((pack) => pack.dir === 'rtl').map((pack) => pack.code)
    expect(rtl.sort()).toEqual(['ar', 'ur'])
  })
})
